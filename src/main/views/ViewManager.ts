/**
 * ViewManager - 视图管理器
 * 职责：管理所有 WebContentsView（标签页视图、标题栏视图等）
 */

import { WebContentsView, shell } from 'electron'
import { join } from 'path'
import type { MainWindow } from '../window/MainWindow'

export interface ViewOptions {
  preload?: string
  sandbox?: boolean
}

export type ViewType = 'tabbar' | 'content' | 'sidebar'

export class ViewManager {
  private views: Map<string, WebContentsView> = new Map()
  private mainWindow: MainWindow | null = null
  private preloadPath: string

  constructor(preloadPath: string) {
    this.preloadPath = preloadPath
  }

  /**
   * 设置主窗口引用
   */
  setMainWindow(mainWindow: MainWindow): void {
    this.mainWindow = mainWindow
    this.setupResizeHandler()
  }

  /**
   * 创建视图
   */
  createView(id: string, options: ViewOptions = {}): WebContentsView {
    const view = new WebContentsView({
      webPreferences: {
        preload: options.preload ?? this.preloadPath,
        sandbox: options.sandbox ?? false
      }
    })

    // 设置默认的窗口打开处理器
    view.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    this.views.set(id, view)
    return view
  }

  /**
   * 获取视图
   */
  getView(id: string): WebContentsView | undefined {
    return this.views.get(id)
  }

  /**
   * 获取视图的 webContents
   */
  getWebContents(id: string) {
    return this.views.get(id)?.webContents
  }

  /**
   * 添加视图到窗口
   */
  attachView(id: string): void {
    const view = this.views.get(id)
    const contentView = this.mainWindow?.getContentView()

    if (view && contentView) {
      contentView.addChildView(view)
    }
  }

  /**
   * 从窗口移除视图
   */
  detachView(id: string): void {
    const view = this.views.get(id)
    const contentView = this.mainWindow?.getContentView()

    if (view && contentView) {
      contentView.removeChildView(view)
    }
  }

  /**
   * 设置视图边界
   */
  setViewBounds(id: string, bounds: { x: number; y: number; width: number; height: number }): void {
    const view = this.views.get(id)
    if (view) {
      view.setBounds(bounds)
    }
  }

  /**
   * 设置窗口调整处理器
   */
  private setupResizeHandler(): void {
    const window = this.mainWindow?.getWindow()
    if (!window) return

    window.on('resize', () => {
      this.updateAllViewBounds()
    })
  }

  /**
   * 更新所有视图边界
   */
  updateAllViewBounds(): void {
    // 子类或具体实现可以覆盖此方法
  }

  /**
   * 显示视图
   */
  showView(id: string): void {
    const view = this.views.get(id)
    if (view) {
      view.setVisible(true)
    }
  }

  /**
   * 隐藏视图
   */
  hideView(id: string): void {
    const view = this.views.get(id)
    if (view) {
      view.setVisible(false)
    }
  }

  /**
   * 销毁视图
   */
  destroyView(id: string): void {
    const view = this.views.get(id)
    if (view) {
      this.detachView(id)
      view.webContents.close()
      this.views.delete(id)
    }
  }

  /**
   * 销毁所有视图
   */
  destroyAll(): void {
    for (const id of this.views.keys()) {
      this.destroyView(id)
    }
  }

  /**
   * 获取所有视图 ID
   */
  getViewIds(): string[] {
    return Array.from(this.views.keys())
  }
}
