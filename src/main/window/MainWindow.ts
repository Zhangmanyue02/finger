/**
 * MainWindow - 主窗口管理类
 * 职责：创建和管理 BaseWindow，组合多个视图
 */

import { BaseWindow, app } from 'electron'
import type { ViewManager } from '../views/ViewManager'

export interface MainWindowOptions {
  width?: number
  height?: number
  
  frame?: boolean
}

export class MainWindow {
  private window: BaseWindow | null = null
  private viewManager: ViewManager | null = null

  constructor(private options: MainWindowOptions = {}) {
    this.options = {
      width: 1200,
      height: 700,
      frame: false,
      ...options
    }
  }

  /**
   * 创建主窗口
   */
  create(): BaseWindow {
    this.window = new BaseWindow({
      width: this.options.width,
      height: this.options.height,
      show: false,
      frame: this.options.frame,
      autoHideMenuBar: true,
      titleBarStyle: 'hiddenInset'
    })

    this.setupWindowEvents()
    return this.window
  }

  /**
   * 设置窗口事件
   */
  private setupWindowEvents(): void {
    if (!this.window) return

    // 窗口关闭事件
    this.window.on('closed', () => {
      this.window = null
    })
  }

  /**
   * 获取窗口实例
   */
  getWindow(): BaseWindow | null {
    return this.window
  }

  /**
   * 设置视图管理器
   */
  setViewManager(viewManager: ViewManager): void {
    this.viewManager = viewManager
  }

  /**
   * 显示窗口
   */
  show(): void {
    this.window?.show()
  }

  /**
   * 隐藏窗口
   */
  hide(): void {
    this.window?.hide()
  }

  /**
   * 关闭窗口
   */
  close(): void {
    this.window?.close()
  }

  /**
   * 显示窗口（如果隐藏），隐藏窗口（如果显示）
   */
  toggle(): void {
    if (this.window?.isVisible()) {
      this.window.hide()
    } else {
      this.window?.show()
    }
  }

  /**
   * 获取窗口尺寸
   */
  getSize(): [number, number] {
    return this.window?.getSize() ?? [0, 0]
  }

  /**
   * 设置窗口尺寸
   */
  setSize(width: number, height: number): void {
    this.window?.setSize(width, height)
  }

  /**
   * 获取内容视图
   */
  getContentView() {
    return this.window?.contentView
  }

  /**
   * 销毁窗口
   */
  destroy(): void {
    this.window?.destroy()
    this.window = null
  }
}
