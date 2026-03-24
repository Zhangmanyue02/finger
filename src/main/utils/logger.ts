/**
 * Logger - 日志工具
 * 统一管理主进程日志输出，全局单例
 */

import log from 'electron-log'

// 日志级别
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// 日志颜色
const levelColors: Record<string, string> = {
  debug: '\x1b[36m',
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  reset: '\x1b[0m'
}

// 模块标签颜色
const moduleColors: Record<string, string> = {
  IPC: '\x1b[35m',
  Window: '\x1b[34m',
  View: '\x1b[36m',
  Tab: '\x1b[33m',
  App: '\x1b[32m',
  default: '\x1b[37m'
}

/**
 * 全局日志单例
 */
class Logger {
  private static instance: Logger

  private constructor() {
    // 配置 electron-log
    log.transports.file.level = 'debug'
    log.transports.console.level = 'debug'
    // 自定义格式
    log.transports.console.format = '{h}:{i}:{s}.{ms} [{level}] [{module}] {text}'
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatTime(): string {
    return new Date().toISOString().split('T')[1].slice(0, 12)
  }

  private print(level: LogLevel, module: string, message: string, data?: any) {
    const time = this.formatTime()
    const levelColor = levelColors[level] || levelColors.info
    const moduleColor = moduleColors[module] || moduleColors.default
    const reset = levelColors.reset

    const prefix = `${time} ${levelColor}[${level.toUpperCase()}]${reset} ${moduleColor}[${module}]${reset}`

    if (data !== undefined) {
      log[level](prefix, message, data)
    } else {
      log[level](prefix, message)
    }
  }

  debug(module: string, message: string, data?: any) {
    this.print('debug', module, message, data)
  }

  info(module: string, message: string, data?: any) {
    this.print('info', module, message, data)
  }

  warn(module: string, message: string, data?: any) {
    this.print('warn', module, message, data)
  }

  error(module: string, message: string, data?: any) {
    this.print('error', module, message, data)
  }

  /**
   * IPC 通信日志
   */
  ipc(direction: 'RECV' | 'SEND', model: string, info: Record<string, any>) {
    const time = this.formatTime()
    const modelColorMap: Record<string, string> = {
      REQUEST: '\x1b[36m',
      REPONSE: '\x1b[32m',
      SUBSCRIBER: '\x1b[33m',
      UNSUBSCRIBER: '\x1b[33m',
      PUBLISHER: '\x1b[35m'
    }
    const color = modelColorMap[model] || '\x1b[37m'
    const reset = levelColors.reset

    log.debug(`${time} [IPC] ${color}${direction} ${model}${reset}`, info)
  }
}

// 导出全局单例
const logger = Logger.getInstance()
export default logger

