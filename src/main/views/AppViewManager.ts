/**
 * AppViewManager - 应用视图管理器
 * 职责：管理应用的所有视图（标题栏、内容区、侧边栏等）
 */

import { WebContentsView } from 'electron'
import { join } from 'path'
import { ViewManager } from './ViewManager'
import type { MainWindow } from '../window/MainWindow'
import { is } from '@electron-toolkit/utils'
import ipc from '../duplext'
import { SUBSCRIPTION_KEYS } from '@/shared/duplex/event-keys'

export interface LayoutConfig {
  tabbarHeight: number
  sidebarWidth: number
}

export class AppViewManager extends ViewManager {
  private layoutConfig: LayoutConfig = {
    tabbarHeight: 80,
    sidebarWidth: 200
  }

  private showSidebar: boolean = false

  constructor(preloadPath: string) {
    super(preloadPath)
  }

  /**
   * 初始化所有视图
   */
  initialize(mainWindow: MainWindow): void {
    this.setMainWindow(mainWindow)

    // 创建标题栏视图
    this.createTabbarView()

    // 创建主内容视图
    this.createContentView()

    // 更新布局
    this.updateLayout()
  }

  /**
   * 创建标题栏视图
   */
  private createTabbarView(): void {
    const view = this.createView('tabbar', {
      preload: join(__dirname, '../preload/index.js')
    })

    this.attachView('tabbar')

    // 加载标题栏页面（使用 URL 参数区分）
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      view.webContents.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?view=navbar`)
    } else {
      view.webContents.loadFile(join(__dirname, '../renderer/index.html'), {
        search: 'view=navbar'
      })
    }

    // 开发模式下监听 F12 快捷键
    if (is.dev) {
      view.webContents.on('before-input-event', (_, input) => {
        if (input.key === 'F12') {
          this.toggleDevTools()
        }
      })
    }
  }

  /**
   * 创建主内容视图
   */
  private createContentView(): void {
    const view = this.createView('content', {
      preload: join(__dirname, '../preload/index.js')
    })

    this.attachView('content')

    // 加载主页面
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      view.webContents.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      view.webContents.loadFile(join(__dirname, '../renderer/index.html'))
    }

    // 页面加载完成后显示窗口
    view.webContents.on('did-finish-load', () => {
      this.mainWindow?.getWindow()?.show()
    })

    // 开发模式下监听 F12 快捷键
    if (is.dev) {
      view.webContents.on('before-input-event', (_, input) => {
        if (input.key === 'F12') {
          this.toggleDevTools()
        }
      })
    }
  }

  /**
   * 更新布局
   */
  updateLayout(): void {
    const [windowWidth, windowHeight] = this.mainWindow?.getSize() ?? [1200, 700]
    const { tabbarHeight, sidebarWidth } = this.layoutConfig

    // 发布窗口大小变化事件
    ipc.publisher(SUBSCRIPTION_KEYS.WINDOW_RESIZE_LISTENER, {
      width: windowWidth,
      height: windowHeight
    })

    // 标题栏：顶部全宽
    this.setViewBounds('tabbar', {
      x: 0,
      y: 0,
      width: windowWidth,
      height: tabbarHeight
    })

    // 内容区：标题栏下方，根据侧边栏调整
    this.setViewBounds('content', {
      x: this.showSidebar ? sidebarWidth : 0,
      y: tabbarHeight,
      width: this.showSidebar ? windowWidth - sidebarWidth : windowWidth,
      height: windowHeight - tabbarHeight
    })
  }

  /**
   * 重写更新所有视图边界
   */
  updateAllViewBounds(): void {
    this.updateLayout()
  }

  /**
   * 切换侧边栏显示
   */
  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar
    this.updateLayout()
  }

  /**
   * 设置侧边栏显示状态
   */
  setSidebarVisible(visible: boolean): void {
    this.showSidebar = visible
    this.updateLayout()
  }

  /**
   * 获取内容视图
   */
  getContentView(): WebContentsView | undefined {
    return this.getView('content')
  }

  /**
   * 获取标题栏视图
   */
  getTabbarView(): WebContentsView | undefined {
    return this.getView('tabbar')
  }

  /**
   * 打开内容视图的 DevTools
   */
  openDevTools(): void {
    const view = this.getView('content')
    if (view) {
      view.webContents.openDevTools()
    }
  }

  /**
   * 打开标题栏视图的 DevTools
   */
  openNavBarDevTools(): void {
    const view = this.getView('tabbar')
    if (view) {
      view.webContents.openDevTools()
    }
  }

  /**
   * 切换标题栏 DevTools
   */
  toggleNavBarDevTools(): void {
    const view = this.getView('tabbar')
    if (view) {
      if (view.webContents.isDevToolsOpened()) {
        view.webContents.closeDevTools()
      } else {
        view.webContents.openDevTools()
      }
    }
  }
}
