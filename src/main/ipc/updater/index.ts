import { autoUpdater, CancellationToken } from 'electron-updater'
import ipc from '../../duplext'
import { UPDATE_KEYS } from '@/shared/duplex/event-keys'
import { IIpcService } from '../typing.d'

export class AppUpdater {
  static initUpdateEvent() {
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = true
    autoUpdater.on('update-available', async (data) => {
      ipc.publisher(UPDATE_KEYS.UPDATE_AVAILABLE, data)
    })

    autoUpdater.on('update-not-available', (data) => {
      ipc.publisher(UPDATE_KEYS.UPDATE_NOT_AVAILABLE, data)
    })

    autoUpdater.on('download-progress', (data) => {
      ipc.publisher(UPDATE_KEYS.UPDATE_DOWNLOAD_PROGRESS, {
        percent: data?.percent,
        total: data?.total,
        transferred: data?.transferred,
        bytesPerSecond: data?.bytesPerSecond
      })
    })

    autoUpdater.on('update-downloaded', (data) => {
      ipc.publisher(UPDATE_KEYS.UPDATE_DOWNLOAD_COMPLETE, data)
    })

    autoUpdater.on('error', (err) => {
      ipc.publisher(UPDATE_KEYS.UPDATE_DOWNLOAD_ERROR, { err })
    })
  }
}
let cancellationToken: CancellationToken
const fns = {
  async checkUpdate(downloadUrl: string) {
    try {
      autoUpdater.setFeedURL({
        provider: 'generic',
        url: downloadUrl
      })
      const result = await autoUpdater.checkForUpdates()
      console.log('检查更新结果:', result)
      return true
    } catch (err) {
      return false
    }
  },

  // 开始下载
  startDownloadApp() {
    cancellationToken = new CancellationToken()
    autoUpdater.downloadUpdate(cancellationToken)
    return true
  },

  quitAndInstallApp() {
    autoUpdater.quitAndInstall(true, true)
  }
}

const updateFn: IIpcService<typeof fns> = {
  name: 'updateCtrl',
  fns
}
export default updateFn
