import { BrowserWindow, WebContents, ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import {
  DEFAULT_REQUEST_TIMEOUT,
  IPC_NAME,
  PUBLISHER,
  REPONSE,
  REQUEST,
  RESPONSE_OK,
  RESPONSE_OVERTIME,
  SERVICE_NOT_FOUND,
  SUBSCRIBER,
  UNSUBSCRIBER,
  WINDOW_ID_KEY,
  WINDOW_ID_REQ
} from '@/shared/duplex/ipc-keys'
import { IIpcMsgBody, IIpcMsgHeader, IIpcMsgParam } from '@/shared/duplex/typing'
import { MAIN_PROCESS_NAME } from '@/shared/duplex/window-keys'
import { logger } from '../utils'

/** 进程模块合集 - 支持 BrowserWindow 或 WebContents */
const processes: {
  [key: string]: BrowserWindow | WebContents
} = {}
/** 缓存进程订阅任务 */
const subscribeTasks = {}
const responseCallbacks = {}
const requestCb = {}
const subscribeCb = {}

class DuplexSdk {
  constructor() {
    ipcMain.on(IPC_NAME, (e, params = {}) => {
      try {
        const { header } = params
        const { model, fromId } = header

        // 自动注册发送者的 webContents（用于响应）
        if (fromId && !processes[fromId]) {
          processes[fromId] = e.sender
        }

        // 记录 IPC 通信
        logger.ipc('RECV', model, {
          from: fromId?.slice(0, 20),
          event: header.eventName,
          requestId: header.requestId?.slice(0, 8),
          data: params.body
        })

        switch (model) {
          // 请求、响应
          case REQUEST:
          case REPONSE:
            this._requestResponseMessageForwarding(params)
            break
          // 订阅
          case SUBSCRIBER:
            this._subscribe(params)
            break
          case UNSUBSCRIBER:
            this._unsubscribe(params)
            break
          // 发布
          case PUBLISHER:
            this._publisher(params)
            break
          default:
        }
      } catch (error) {
        logger.error('IPC', '消息处理失败', error)
      }
    })

    ipcMain.handle(WINDOW_ID_REQ, (e) => {
      // 生成唯一窗口 ID
      const windowId = `renderer_${e.sender.id}`
      // 注册 webContents
      if (!processes[windowId]) {
        processes[windowId] = e.sender
      }
      logger.info('IPC', '渲染进程注册', { windowId })
      return windowId
    })
  }

  /** 发送消息到渲染进程 */
  _sendToRenderer(toId: string, params: IIpcMsgParam) {
    const target = processes[toId]
    if (!target) return false

    // 记录发送
    logger.ipc('SEND', params.header.model || 'REPONSE', {
      to: toId?.slice(0, 20),
      event: params.header.eventName,
      requestId: params.header.requestId?.slice(0, 8),
      data: params.body
    })

    if (target instanceof BrowserWindow) {
      if (!target.isDestroyed()) {
        target.webContents.send(IPC_NAME, params)
        return true
      }
    } else {
      // WebContents
      if (!target.isDestroyed()) {
        target.send(IPC_NAME, params)
        return true
      }
    }
    return false
  }

  /** 请求响应消息转发 */
  _requestResponseMessageForwarding(params: IIpcMsgParam) {
    const { toId, eventName, model, requestId } = params.header
    if (!toId || !requestId) return
    // 向主进程请求
    if (toId === MAIN_PROCESS_NAME) {
      if (model === REQUEST) {
        responseCallbacks[eventName]?.(params)
      } else if (model === REPONSE) {
        requestCb[requestId]?.(params)
      }
    } else {
      if (processes[toId]) {
        const sent = this._sendToRenderer(toId, params)
        if (!sent) {
          this._unregister(toId)
          this._responseNoSerice(params.header)
        }
      } else {
        this._responseNoSerice(params.header)
      }
    }
  }

  _send(params: IIpcMsgParam) {
    try {
      const { header, body } = params
      // 响应时，发送目标应该是请求的来源（fromId）
      const targetId = header.fromId
      if (targetId) {
        this._sendToRenderer(targetId, {
          header: { ...header, fromId: MAIN_PROCESS_NAME, toId: targetId },
          body
        })
      }
    } catch (error) {
      logger.error('IPC', '发送失败', error)
    }
  }

  // 订阅消息
  _subscribe(params: IIpcMsgParam) {
    const { fromId, toId, eventName, requestId } = params.header
    if (!toId) return
    // 初始化
    if (!subscribeTasks[toId]) {
      subscribeTasks[toId] = {}
    }
    if (!subscribeTasks[toId][fromId]) {
      subscribeTasks[toId][fromId] = {}
    }
    if (!subscribeTasks[toId][fromId][eventName]) {
      subscribeTasks[toId][fromId][eventName] = {}
    }
    subscribeTasks[toId][fromId][eventName][requestId] = params
  }

  // 退订消息
  _unsubscribe(params: IIpcMsgParam) {
    try {
      const { fromId, toId, eventName, requestId } = params.header
      if (!toId) return
      if (subscribeTasks[toId]?.[fromId]?.[eventName]?.[requestId]) {
        delete subscribeTasks[toId][fromId][eventName][requestId]
      }
    } catch (error) {
      logger.error('IPC', '退订失败', error)
    }
  }

  _getSubscriberTasks() {
    return subscribeTasks
  }

  /** 发布消息 */
  _publisher(params: IIpcMsgParam) {
    try {
      const { eventName, fromId } = params.header
      for (let fromKey in subscribeTasks[fromId]) {
        if (fromKey) {
          const arr: IIpcMsgParam[] = Object.values(
            subscribeTasks[fromId][fromKey][eventName] || {}
          )
          if (arr.length > 0) {
            arr.forEach((item: IIpcMsgParam) => {
              const { fromId: subscriberId } = item.header
              this._sendToRenderer(subscriberId, {
                header: item.header,
                body: params.body
              })
            })
          }
        }
      }
      // 主进程订阅
      if (subscribeCb[`${fromId}${eventName}`]) {
        subscribeCb[`${fromId}${eventName}`].forEach((callback) => {
          callback(params.body, { eventName, fromId })
        })
      }
    } catch (error) {}
  }

  /** 找不到服务 */
  _responseNoSerice(header: IIpcMsgHeader) {
    header.model = REPONSE
    this._send({
      header,
      body: { code: SERVICE_NOT_FOUND, msg: `找不到服务${header.toId}` }
    })
  }

  // 注册进程服务
  _register(name: string, process: BrowserWindow | WebContents) {
    processes[name] = process
  }

  // 注销进程服务
  _unregister(name: string) {
    delete processes[name]
    // 删除进程所有订阅消息
    for (let toKey in subscribeTasks) {
      if (subscribeTasks[toKey]) {
        for (let fromKey in subscribeTasks[toKey]) {
          if (fromKey === name) {
            delete subscribeTasks[toKey][fromKey]
          }
        }
      }
    }
  }

  /** 主进程request */
  request(toId: string, eventName: string, data?: any, timeout = DEFAULT_REQUEST_TIMEOUT) {
    const threadId = MAIN_PROCESS_NAME
    return new Promise((resolve, reject) => {
      try {
        let timeoutFlag
        const requestId = uuidv4()

        const cb = (json: { body: IIpcMsgBody }) => {
          const { code, data } = json.body || {}
          clearTimeout(timeoutFlag)
          if (code === RESPONSE_OK) {
            resolve(data)
          } else {
            reject(json.body)
          }
          delete requestCb[requestId]
        }
        // 超时处理
        timeoutFlag = setTimeout(() => {
          cb({
            body: {
              code: RESPONSE_OVERTIME,
              msg: '访问超时',
              errMessage: 'ipc超时',
              data: { toId, eventName, data }
            }
          })
        }, timeout)

        requestCb[requestId] = cb

        const param = {
          header: {
            model: REQUEST,
            fromId: toId,
            toId: threadId,
            eventName,
            requestId
          },
          body: data
        }

        if (toId === MAIN_PROCESS_NAME) {
          this._requestResponseMessageForwarding(param)
        } else {
          this._send(param)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /** 响应 */
  response(eventName, callback) {
    try {
      const createCb = (header) => {
        return (result) => {
          header.model = REPONSE
          const param = { header, body: { code: RESPONSE_OK, data: result } }
          if (header.fromId === MAIN_PROCESS_NAME) {
            this._requestResponseMessageForwarding(param)
          } else {
            this._send(param)
          }
        }
      }
      responseCallbacks[eventName] = function (json) {
        const cb = createCb(json.header)
        callback?.(json.body, cb)
      }
    } catch (error) {}
  }

  unresponse(eventName) {
    delete responseCallbacks[eventName]
  }

  /** 主进程发布 */
  publisher(eventName: string, params: IIpcMsgBody | any) {
    this._publisher({ header: { fromId: MAIN_PROCESS_NAME, eventName }, body: params })
  }

  /** 主进程订阅 */
  subscribe(toId: string, eventName: string | string[], callback: (args: any) => void) {
    let toIds = [toId]
    let eventNames = Array.isArray(eventName) ? eventName : [eventName]
    const unsubscribes: Function[] = []

    const _subscribe = (toId, eventName, callback) => {
      if (!subscribeCb[`${toId}${eventName}`]) {
        subscribeCb[`${toId}${eventName}`] = []
      }
      subscribeCb[`${toId}${eventName}`].push(callback)
      return () => {
        this.unsubscribe(toId, eventName, callback)
      }
    }

    for (const toId of toIds) {
      for (const eventName of eventNames) {
        unsubscribes.push(_subscribe(toId, eventName, callback))
      }
    }

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe())
  }

  /** 主进程退订 */
  unsubscribe(toId: string, eventName: string | string[], callback) {
    let toIds = [toId]
    let eventNames = Array.isArray(eventName) ? eventName : [eventName]

    const _unsubscribe = (toId, eventName, callback) => {
      const callbacks = subscribeCb[`${toId}${eventName}`]
      if (callbacks) {
        for (let i = 0; i < callbacks.length; i++) {
          if (callbacks[i] === callback) {
            callbacks.splice(i, 1)
          }
        }
      }
    }

    for (const toId of toIds) {
      for (const eventName of eventNames) {
        _unsubscribe(toId, eventName, callback)
      }
    }
  }
}
const ipc = new DuplexSdk()
export default ipc
