import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { v4 as uuidv4 } from 'uuid'
import {
  DEFAULT_REQUEST_TIMEOUT,
  IPC_NAME,
  PUBLISHER,
  REPONSE,
  REQUEST,
  SUBSCRIBER,
  UNSUBSCRIBER
} from '@/shared/duplex/ipc-keys'
import { MAIN_PROCESS_NAME } from '@/shared/duplex/window-keys'
import windowCtrlPreload from '../main/ipc/window/preload'
import updateCtrlPreload from '../main/ipc/updater/preload'

// 请求回调缓存
const requestCallbacks: Record<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }> = {}
const subscribeCallbacks: Record<string, Function[]> = {}

/**
 * 渲染进程 IPC 客户端
 */
class RendererIpc {
  private windowId: string | null = null

  constructor() {
    // 监听主进程消息
    ipcRenderer.on(IPC_NAME, (_, params) => {
      const { header, body } = params
      const { model, requestId, eventName } = header

      switch (model) {
        case REPONSE:
          if (requestCallbacks[requestId]) {
            const { resolve, reject, timeout } = requestCallbacks[requestId]
            clearTimeout(timeout)
            if (body?.errMessage) {
              reject(new Error(body.errMessage))
            } else {
              resolve(body?.data)
            }
            delete requestCallbacks[requestId]
          }
          break
        case PUBLISHER:
          if (subscribeCallbacks[eventName]) {
            subscribeCallbacks[eventName].forEach((cb) => cb(body))
          }
          break
      }
    })
  }

  /**
   * 初始化窗口 ID
   */
  async init() {
    this.windowId = await ipcRenderer.invoke('ELECTRON:WINDOW_ID_REQ')
  }

  /**
   * 请求主进程服务
   */
  async request(serviceName: string, fnName: string, args: any[] = []): Promise<any> {
    await this.init()

    return new Promise((resolve, reject) => {
      const requestId = uuidv4()
      const timeout = setTimeout(() => {
        delete requestCallbacks[requestId]
        reject(new Error('Request timeout'))
      }, DEFAULT_REQUEST_TIMEOUT)

      requestCallbacks[requestId] = { resolve, reject, timeout }

      ipcRenderer.send(IPC_NAME, {
        header: {
          model: REQUEST,
          fromId: this.windowId,
          toId: MAIN_PROCESS_NAME,
          eventName: serviceName,
          requestId
        },
        body: { fn: fnName, args }
      })
    })
  }

  /**
   * 订阅事件
   */
  subscribe(eventName: string, callback: (data: any) => void): () => void {
    if (!subscribeCallbacks[eventName]) {
      subscribeCallbacks[eventName] = []
    }
    subscribeCallbacks[eventName].push(callback)

    const requestId = uuidv4()
    ipcRenderer.send(IPC_NAME, {
      header: {
        model: SUBSCRIBER,
        fromId: this.windowId,
        toId: MAIN_PROCESS_NAME,
        eventName,
        requestId
      }
    })

    return () => {
      const index = subscribeCallbacks[eventName].indexOf(callback)
      if (index > -1) {
        subscribeCallbacks[eventName].splice(index, 1)
      }
      ipcRenderer.send(IPC_NAME, {
        header: {
          model: UNSUBSCRIBER,
          fromId: this.windowId,
          toId: MAIN_PROCESS_NAME,
          eventName,
          requestId
        }
      })
    }
  }
}

const rendererIpc = new RendererIpc()

/**
 * 创建服务代理
 */
function createServiceProxy(serviceName: string, fnNames: string[]) {
  const service: Record<string, Function> = {}
  fnNames.forEach((fnName) => {
    service[fnName] = (...args: any[]) => rendererIpc.request(serviceName, fnName, args)
  })
  return service
}

// 构建 coreApi 对象
const coreApi = {
  windowCtrl: createServiceProxy(windowCtrlPreload.name, windowCtrlPreload.fns),
  updateCtrl: createServiceProxy(updateCtrlPreload.name, updateCtrlPreload.fns),
  subscribe: rendererIpc.subscribe.bind(rendererIpc)
}

// 暴露到 window
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('coreApi', coreApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.coreApi = coreApi
}
