export interface IIpcMsgHeader {
  model?: string // 请求类型
  fromId: string // 请求方
  toId?: string // 接收方
  eventName: string // 事件名称
  requestId?: string
}

export interface IIpcMsgBody {
  code?: number
  msg?: string
  errMessage?: string
  data?: any
}

export interface IIpcMsgParam {
  header: IIpcMsgHeader
  body?: IIpcMsgBody
}

export interface IStoreMsgParam {
  type: number
  key: string
  value: any
  state: string
  modules: string[]
  options: ISetStateOptions
}

export interface ISetStateOptions {
  isForcePublish?: boolean
}

export interface IBaseWindowOption extends Electron.BrowserWindowConstructorOptions {
  url: string
}
