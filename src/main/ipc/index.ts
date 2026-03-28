/**
 * IPC 服务入口
 * 职责：注册所有 IPC 服务
 */

import ipc from '../duplext'
import windowCtrlFn from './window'
import tabCtrlFn from './tab'
import type { IIpcService } from './typing.d'

// 所有 IPC 服务
const services: IIpcService<any>[] = [windowCtrlFn, tabCtrlFn]

/**
 * 注册所有 IPC 服务
 */
export function registerIpcServices(): void {
  services.forEach((service) => {
    ipc.response(service.name, (data, callback) => {
      const fnName = data?.fn
      const args = data?.args || []

      if (service.fns[fnName]) {
        const result = service.fns[fnName](...args)
        // 处理 Promise
        if (result instanceof Promise) {
          result.then(callback).catch((err) => callback({ errMessage: err.message }))
        } else {
          callback(result)
        }
      } else {
        callback({ errMessage: `Function ${fnName} not found in ${service.name}` })
      }
    })
  })
}

export { windowCtrlFn, tabCtrlFn }
