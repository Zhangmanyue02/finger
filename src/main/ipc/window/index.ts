import { BaseWindow } from 'electron'
import { IIpcService } from '../typing.d'

// 获取当前活动窗口
function getActiveWindow(): BaseWindow | null {
  const windows = BaseWindow.getAllWindows()
  return windows.length > 0 ? windows[0] : null
}

const fns = {
  async minimizeWindow() {
    const win = getActiveWindow()
    win?.minimize()
  },
  async closeWindow() {
    const win = getActiveWindow()
    win?.close()
  },
  async toggleWindowMaximize() {
    const win = getActiveWindow()
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  },
  async isMaximized() {
    const win = getActiveWindow()
    return win?.isMaximized() ?? false
  },
  hello() {
    return 'hello world'
  }
}

const windowCtrlFn: IIpcService<typeof fns> = {
  name: 'windowCtrl',
  fns
}

export default windowCtrlFn
