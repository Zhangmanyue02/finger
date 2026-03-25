import {
  PUBLISHER,
  REPONSE,
  REQUEST,
  RESPONSE_NOT_FOUND,
  RESPONSE_OK,
  RESPONSE_OVERTIME,
  SUBSCRIBER,
  UNSUBSCRIBER,
} from '@/shared/duplex/ipc-keys';
import {
  IIpcMsgBody,
  IIpcMsgHeader,
  IIpcMsgParam,
} from '@/shared/duplex/typing';
import { v4 as uuidv4 } from 'uuid';

const requestCb = {} as any;
const requestHandler = {} as any;
const subscribeCb = {} as any;

class DuplexSdk {
  constructor() {
    window?.coreApi?.onIpcName?.((_e: unknown, params: IIpcMsgParam) => {
      try {
        const { header, body } = params;
        const { model, eventName, requestId, toId, fromId } = header;
        switch (model) {
          // 请求、响应类型
          case REQUEST:
            if (requestHandler[eventName]) {
              // 收到了调用请求
              requestHandler[eventName](params);
            } else {
              // 找不到注册服务则原路返回null
              this._send({
                header: {
                  model: REPONSE,
                  fromId: toId,
                  toId: fromId,
                  eventName,
                  requestId,
                },
                body: {
                  code: RESPONSE_NOT_FOUND,
                  msg: `找不到服务响应注册${eventName}`,
                },
              });
            }
            break;
          case REPONSE:
            if (requestId) {
              requestCb[requestId]?.(params);
            }
            break;
          case SUBSCRIBER:
            if (requestId) {
              // subscribeCb[requestId]?.(body);
              subscribeCb[requestId]?.(body, {
                eventName,
                model,
                fromId,
                toId,
              });
            }
            break;
          default:
        }
      } catch (error) {
        console.log(error);
      }
    });
  }
  async getThreadId() {
    const threadId = (await window?.coreApi?.invokeForWindowId()) ?? '';
    return threadId;
  }
  async request<T = any>(
    toId: string,
    eventName: string,
    data?: any,
    timeout = 2000,
  ) {
    const threadId = await this.getThreadId();
    return new Promise<T>((resolve, reject) => {
      if (!threadId) {
        reject(new Error());
      }
      try {
        let timeoutFlag: NodeJS.Timeout | null = null;
        const requestId = uuidv4();
        const cb = function (json: { body: IIpcMsgBody }) {
          const { code, data } = json.body || {};
          timeoutFlag && clearTimeout(timeoutFlag);
          if (code === RESPONSE_OK) {
            resolve(data);
          } else {
            reject(json.body);
          }
          delete requestCb[requestId];
        };
        // 超时处理
        timeoutFlag = setTimeout(() => {
          cb({
            body: {
              code: RESPONSE_OVERTIME,
              msg: '访问超时!',
              data: {
                toId,
                eventName,
                data,
              },
            },
          });
        }, timeout);
        requestCb[requestId] = cb;
        this._send({
          header: {
            model: REQUEST,
            fromId: threadId,
            toId,
            eventName,
            requestId,
          },
          body: data,
        });
      } catch (error) {
        reject(error);
        console.log(error);
      }
    });
  }
  /** 响应 */
  response(eventName: string, callback: (...args: any) => void) {
    try {
      const createCb = (header: IIpcMsgHeader) => {
        return (result: any) => {
          this._send({
            header: {
              model: REPONSE,
              fromId: header.toId,
              toId: header.fromId,
              eventName,
              requestId: header.requestId,
            },
            body: {
              code: RESPONSE_OK,
              data: result,
            },
          });
        };
      };
      requestHandler[eventName] = (json: IIpcMsgParam) => {
        const cb = createCb(json.header);
        callback?.(json.body, cb);
      };
    } catch (error) {
      console.log(error);
    }
  }

  unresponse(eventName: string) {
    delete requestHandler[eventName];
  }

  /** 渲染进程发布 */
  async publisher(eventName: string, params = {}) {
    const threadId = await this.getThreadId();
    if (threadId) {
      this._send({
        header: {
          model: PUBLISHER,
          fromId: threadId,
          eventName,
        },
        body: params,
      });
    }
  }

  // 订阅消息
  async subscribe(
    toId: string,
    eventName: string | string[],
    callback: (args: any) => void,
  ) {
    const threadId = await this.getThreadId();
    const unsubscribes: (() => void)[] = [];

    const toIds = [toId];
    const eventNames = Array.isArray(eventName) ? eventName : [eventName];
    if (threadId) {
      const _subscribe = (
        toId: string,
        eventName: string,
        callback: (args: any) => void,
      ) => {
        const requestId = uuidv4();

        this._send({
          header: {
            model: SUBSCRIBER,
            fromId: threadId,
            toId,
            eventName,
            requestId,
          },
        });
        subscribeCb[requestId] = callback;

        return () => {
          this._send({
            header: {
              model: UNSUBSCRIBER,
              fromId: threadId,
              toId,
              eventName,
              requestId,
            },
          });
          delete subscribeCb[requestId];
        };
      };

      for (const toId of toIds) {
        for (const eventName of eventNames) {
          unsubscribes.push(_subscribe(toId, eventName, callback));
        }
      }

      return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    }
    return () => {};
  }

  // 退订
  _unsubscribe(
    toId: string,
    eventName: string | string[],
    callback: (args: any) => void,
  ) {
    const toIds = [toId];
    const eventNames = Array.isArray(eventName) ? eventName : [eventName];
    this.getThreadId().then((threadId) => {
      const _unsubscribe = (
        toId: string,
        eventName: string,
        callback: (args: any) => void,
      ) => {
        if (threadId) {
          for (const requestId in subscribeCb) {
            if (subscribeCb[requestId] === callback) {
              this._send({
                header: {
                  model: UNSUBSCRIBER,
                  fromId: threadId,
                  toId,
                  eventName,
                  requestId,
                },
              });
              delete subscribeCb[requestId];
            }
          }
        }
      };

      for (const toId of toIds) {
        for (const eventName of eventNames) {
          _unsubscribe(toId, eventName, callback);
        }
      }
    });
  }
  private _send(json: IIpcMsgParam) {
    window?.coreApi?.sendIpcName(json);
  }
}

const ipc = new DuplexSdk();
export default ipc;
