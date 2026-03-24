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

interface CoreApi {
  windowCtrl: WindowCtrlApi
  updateCtrl: UpdateCtrlApi
  subscribe: (eventName: string, callback: (data: any) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    coreApi: CoreApi
  }
}
