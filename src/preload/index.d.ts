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
  createTab: (url?: string) => Promise<{ id: string }>
  closeTab: (id: string) => Promise<boolean>
  switchTab: (id: string) => Promise<boolean>
  getAllTabs: () => Promise<Omit<Tab.TabItem, 'active' | 'loading' | 'favicon'>[]>
  getCurrentTabId: () => Promise<string | null>
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
