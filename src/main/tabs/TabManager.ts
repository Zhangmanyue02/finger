/**
 * TabManager - 标签页管理器
 * 职责：管理标签页的创建、切换、关闭等操作
 */

import { WebContentsView } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

export interface Tab {
  id: string
  title: string
  url: string
  view: WebContentsView
  favicon?: string
  isLoading: boolean
}

export interface TabCreateOptions {
  url?: string
  title?: string
  active?: boolean
}

export class TabManager {
  private tabs: Map<string, Tab> = new Map()
  private activeTabId: string | null = null
  private preloadPath: string
  private containerGetter: () => { x: number; y: number; width: number; height: number } | null

  constructor(
    preloadPath: string,
    containerGetter: () => { x: number; y: number; width: number; height: number } | null
  ) {
    this.preloadPath = preloadPath
    this.containerGetter = containerGetter
  }

  /**
   * 创建新标签页
   */
  createTab(options: TabCreateOptions = {}): Tab {
    const id = this.generateTabId()

    const view = new WebContentsView({
      webPreferences: {
        preload: this.preloadPath,
        sandbox: false
      }
    })

    const tab: Tab = {
      id,
      title: options.title ?? '新标签页',
      url: options.url ?? '',
      view,
      isLoading: false
    }

    // 监听页面标题变化
    view.webContents.on('page-title-updated', (_, title) => {
      tab.title = title
    })

    // 监听加载状态
    view.webContents.on('did-start-loading', () => {
      tab.isLoading = true
    })

    view.webContents.on('did-stop-loading', () => {
      tab.isLoading = false
    })

    // 加载 URL
    if (options.url) {
      this.loadUrlInTab(tab, options.url)
    }

    this.tabs.set(id, tab)

    // 如果设置为活动标签页或没有活动标签页，则激活
    if (options.active || !this.activeTabId) {
      this.activateTab(id)
    }

    return tab
  }

  /**
   * 在标签页中加载 URL
   */
  private loadUrlInTab(tab: Tab, url: string): void {
    tab.url = url

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      // 开发模式下的处理
      if (url.startsWith('http')) {
        tab.view.webContents.loadURL(url)
      } else {
        tab.view.webContents.loadURL(`${process.env['ELECTRON_RENDERER_URL']}${url}`)
      }
    } else {
      // 生产模式
      if (url.startsWith('http')) {
        tab.view.webContents.loadURL(url)
      } else {
        tab.view.webContents.loadFile(join(__dirname, `../renderer/${url}`))
      }
    }
  }

  /**
   * 获取标签页
   */
  getTab(id: string): Tab | undefined {
    return this.tabs.get(id)
  }

  /**
   * 获取活动标签页
   */
  getActiveTab(): Tab | null {
    if (!this.activeTabId) return null
    return this.tabs.get(this.activeTabId) ?? null
  }

  /**
   * 激活标签页
   */
  activateTab(id: string): boolean {
    const tab = this.tabs.get(id)
    if (!tab) return false

    // 隐藏当前活动标签页
    if (this.activeTabId) {
      const currentTab = this.tabs.get(this.activeTabId)
      if (currentTab) {
        currentTab.view.setVisible(false)
      }
    }

    this.activeTabId = id
    tab.view.setVisible(true)

    // 更新视图边界
    this.updateActiveTabBounds()

    return true
  }

  /**
   * 更新活动标签页的边界
   */
  updateActiveTabBounds(): void {
    const tab = this.getActiveTab()
    const bounds = this.containerGetter()

    if (tab && bounds) {
      tab.view.setBounds(bounds)
    }
  }

  /**
   * 关闭标签页
   */
  closeTab(id: string): boolean {
    const tab = this.tabs.get(id)
    if (!tab) return false

    // 如果关闭的是活动标签页，切换到其他标签页
    if (this.activeTabId === id) {
      const tabIds = Array.from(this.tabs.keys())
      const currentIndex = tabIds.indexOf(id)

      // 选择相邻的标签页
      const nextTabId = tabIds[currentIndex + 1] ?? tabIds[currentIndex - 1]
      if (nextTabId) {
        this.activateTab(nextTabId)
      } else {
        this.activeTabId = null
      }
    }

    // 销毁视图
    tab.view.webContents.close()
    this.tabs.delete(id)

    return true
  }

  /**
   * 获取所有标签页
   */
  getAllTabs(): Tab[] {
    return Array.from(this.tabs.values())
  }

  /**
   * 获取标签页数量
   */
  getTabCount(): number {
    return this.tabs.size
  }

  /**
   * 生成标签页 ID
   */
  private generateTabId(): string {
    return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }

  /**
   * 导航标签页
   */
  navigateTab(id: string, url: string): void {
    const tab = this.tabs.get(id)
    if (tab) {
      this.loadUrlInTab(tab, url)
    }
  }

  /**
   * 刷新标签页
   */
  refreshTab(id: string): void {
    const tab = this.tabs.get(id)
    if (tab) {
      tab.view.webContents.reload()
    }
  }

  /**
   * 后退
   */
  goBack(id: string): void {
    const tab = this.tabs.get(id)
    if (tab?.view.webContents.canGoBack()) {
      tab.view.webContents.goBack()
    }
  }

  /**
   * 前进
   */
  goForward(id: string): void {
    const tab = this.tabs.get(id)
    if (tab?.view.webContents.canGoForward()) {
      tab.view.webContents.goForward()
    }
  }

  /**
   * 销毁所有标签页
   */
  destroyAll(): void {
    for (const tab of this.tabs.values()) {
      tab.view.webContents.close()
    }
    this.tabs.clear()
    this.activeTabId = null
  }
}
