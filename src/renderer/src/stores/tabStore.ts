/**
 * TabStore - 标签页状态管理
 * 职责：订阅主进程推送的标签页数据
 */

import { makeAutoObservable, runInAction } from 'mobx'
import { SUBSCRIPTION_KEYS } from '@shared/duplex/event-keys'

export class TabStore {
  tabs: Tab.TabItem[] = []
  activeTabId: number | null = null
  private unsubscribe: (() => void) | null = null

  constructor() {
    makeAutoObservable(this)
    this.initSubscribe()
  }

  /**
   * 初始化订阅
   */
  private initSubscribe() {
    this.unsubscribe = window.coreApi.subscribe(SUBSCRIPTION_KEYS.SYNC_TAB_LIST, (data: Tab.TabItem[]) => {
      runInAction(() => {
        this.tabs = data
        this.activeTabId = data.find((t) => t.active)?.id ?? null
      })
    })
  }

  /**
   * 销毁订阅
   */
  destroy() {
    this.unsubscribe?.()
  }

  /**
   * 创建标签页
   */
  async createTab(options?: { url?: string; title?: string; active?: boolean }): Promise<Tab.TabItem | null> {
    return window.coreApi.tabCtrl.createTab(options)
  }

  /**
   * 关闭标签页
   */
  async closeTab(id: number): Promise<boolean> {
    return window.coreApi.tabCtrl.closeTab(id)
  }

  /**
   * 激活标签页
   */
  async activateTab(id: number): Promise<boolean> {
    return window.coreApi.tabCtrl.activateTab(id)
  }

  /**
   * 导航标签页
   */
  async navigateTab(id: number, url: string): Promise<void> {
    await window.coreApi.tabCtrl.navigateTab(id, url)
  }

  /**
   * 刷新标签页
   */
  async refreshTab(id: number): Promise<void> {
    await window.coreApi.tabCtrl.refreshTab(id)
  }

  /**
   * 后退
   */
  async goBack(id: number): Promise<void> {
    await window.coreApi.tabCtrl.goBack(id)
  }

  /**
   * 前进
   */
  async goForward(id: number): Promise<void> {
    await window.coreApi.tabCtrl.goForward(id)
  }

  /**
   * 获取活动标签页
   */
  get activeTab(): Tab.TabItem | undefined {
    return this.tabs.find((t) => t.id === this.activeTabId)
  }

  /**
   * 获取标签页数量
   */
  get tabCount(): number {
    return this.tabs.length
  }

  /**
   * 拖拽排序标签页
   */
  reorderTabs(dragId: number, hoverId: number): void {
    runInAction(() => {
      const dragIndex = this.tabs.findIndex((t) => t.id === dragId)
      const hoverIndex = this.tabs.findIndex((t) => t.id === hoverId)

      if (dragIndex === -1 || hoverIndex === -1) return

      const [draggedTab] = this.tabs.splice(dragIndex, 1)
      this.tabs.splice(hoverIndex, 0, draggedTab)
    })
  }
}

export const tabStore = new TabStore()
