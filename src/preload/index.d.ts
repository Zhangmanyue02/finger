import { ElectronAPI } from '@electron-toolkit/preload'

interface WindowCtrlApi {
  minimizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  toggleWindowMaximize: () => Promise<void>
  isMaximized: () => Promise<boolean>
  hello: () => Promise<string>
}

interface UpdateCtrlApi {
  checkUpdate: (downloadUrl: string) => Promise<boolean>
  startDownloadApp: () => Promise<boolean>
  quitAndInstallApp: () => Promise<void>
}

interface TabCtrlApi {
  createTab: (options?: {
    url?: string
    title?: string
    active?: boolean
  }) => Promise<Tab.TabItem | null>
  closeTab: (id: number) => Promise<boolean>
  activateTab: (id: number) => Promise<boolean>
  getTab: (id: number) => Promise<Tab.TabItem | null>
  getActiveTab: () => Promise<Tab.TabItem | null>
  getAllTabs: () => Promise<Tab.TabItem[]>
  navigateTab: (id: number, url: string) => Promise<void>
  refreshTab: (id: number) => Promise<void>
  goBack: (id: number) => Promise<void>
  goForward: (id: number) => Promise<void>
  getTabCount: () => Promise<number>
}

interface CoreApi {
  windowCtrl: WindowCtrlApi
  updateCtrl: UpdateCtrlApi
  tabCtrl: TabCtrlApi
}

declare global {
  interface Window {
    electron: ElectronAPI
    coreApi: CoreApi
  }
}
