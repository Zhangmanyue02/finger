import { WebContentsView, BaseWindow } from 'electron'
import { createContentView } from './index'
import { DEFAULT_URL } from '../config'
import { logger } from '../utils'

export interface TabInfo {
  id: string
  view: WebContentsView
  url: string
  title: string
}

/**
 * 视图管理器 - 管理多个标签页视图
 */
export class ViewManager {
  private tabs: Map<string, TabInfo> = new Map()
  private currentTabId: string | null = null
  private mainWindow: BaseWindow | null = null

  /**
   * 绑定主窗口
   */
  bindWindow(window: BaseWindow): void {
    this.mainWindow = window
  }

  /**
   * 创建新标签
   */
  createTab(url: string = DEFAULT_URL): string {
    const id = this.generateTabId()
    const view = createContentView(url)

    const tab: TabInfo = {
      id,
      view,
      url,
      title: url
    }

    this.tabs.set(id, tab)

    // 如果是第一个标签，自动激活
    if (this.tabs.size === 1) {
      this.switchTab(id)
    }

    logger.info('ViewManager', `创建标签: ${id}`)
    return id
  }

  /**
   * 关闭标签
   */
  closeTab(id: string): boolean {
    const tab = this.tabs.get(id)
    if (!tab) return false

    // 至少保留一个标签
    if (this.tabs.size <= 1) {
      logger.warn('ViewManager', '至少保留一个标签')
      return false
    }

    // 从窗口移除视图
    if (this.mainWindow) {
      this.mainWindow.contentView.removeChildView(tab.view)
    }

    this.tabs.delete(id)

    // 如果关闭的是当前标签，切换到其他标签
    if (this.currentTabId === id) {
      const remainingIds = Array.from(this.tabs.keys())
      this.switchTab(remainingIds[0])
    }

    logger.info('ViewManager', `关闭标签: ${id}`)
    return true
  }

  /**
   * 切换标签
   */
  switchTab(id: string): boolean {
    const tab = this.tabs.get(id)
    if (!tab || !this.mainWindow) return false

    // 隐藏当前标签
    if (this.currentTabId) {
      const currentTab = this.tabs.get(this.currentTabId)
      if (currentTab) {
        this.mainWindow.contentView.removeChildView(currentTab.view)
      }
    }

    // 显示新标签
    this.mainWindow.contentView.addChildView(tab.view)
    this.currentTabId = id

    logger.info('ViewManager', `切换标签: ${id}`)
    return true
  }

  /**
   * 获取当前标签ID
   */
  getCurrentTabId(): string | null {
    return this.currentTabId
  }

  /**
   * 获取所有标签信息
   */
  getAllTabs(): TabInfo[] {
    return Array.from(this.tabs.values())
  }

  /**
   * 获取当前标签视图
   */
  getCurrentView(): WebContentsView | null {
    if (!this.currentTabId) return null
    const tab = this.tabs.get(this.currentTabId)
    return tab?.view ?? null
  }

  /**
   * 生成标签ID
   */
  private generateTabId(): string {
    return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }
}

// 单例实例
export const viewManager = new ViewManager()
