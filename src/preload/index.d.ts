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

interface Api {
  windowCtrl: WindowCtrlApi
  updateCtrl: UpdateCtrlApi
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
