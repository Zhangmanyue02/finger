import { IIpcService } from '../typing.d'
import { viewManager } from '../../view/manager'

const fns = {
  /**
   * 创建新标签
   */
  createTab(url?: string) {
    const id = viewManager.createTab(url)
    return { id }
  },

  /**
   * 关闭标签
   */
  closeTab(id: string) {
    return viewManager.closeTab(id)
  },

  /**
   * 切换标签
   */
  switchTab(id: string) {
    return viewManager.switchTab(id)
  },

  /**
   * 获取所有标签
   */
  getAllTabs() {
    const tabs = viewManager.getAllTabs()
    return tabs.map((tab) => ({
      id: tab.id,
      url: tab.url,
      title: tab.title
    }))
  },

  /**
   * 获取当前标签ID
   */
  getCurrentTabId() {
    return viewManager.getCurrentTabId()
  }
}

const tabCtrlFn: IIpcService<typeof fns> = {
  name: 'tabCtrl',
  fns
}

export default tabCtrlFn
