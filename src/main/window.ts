import { BaseWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { WINDOW_CONFIG } from './config'
import { createNavBarView } from './view'
import { viewManager } from './view/manager'
import { updateLayout, bindResizeHandler } from './layout'
import { logger } from './utils'

/**
 * 创建主窗口
 */
export function createWindow(): BaseWindow {
  const mainWindow = new BaseWindow(WINDOW_CONFIG)

  // 绑定视图管理器
  viewManager.bindWindow(mainWindow)

  // 创建导航栏视图
  const navBarView = createNavBarView()
  mainWindow.contentView.addChildView(navBarView)

  // 创建默认标签
  viewManager.createTab()

  // 初始布局
  const currentView = viewManager.getCurrentView()
  if (currentView) {
    updateLayout(mainWindow, navBarView, currentView)
  }

  // 绑定 resize 事件
  bindResizeHandler(mainWindow, navBarView, () => viewManager.getCurrentView())

  // 开发模式下打开 DevTools
  if (is.dev) {
    navBarView.webContents.openDevTools({ mode: 'detach' })
    const currentTab = viewManager.getCurrentView()
    currentTab?.webContents.openDevTools({ mode: 'detach' })
  }

  // 加载导航栏页面
  loadNavBar(navBarView)

  logger.info('Main', '窗口创建成功')

  return mainWindow
}

/**
 * 加载导航栏页面
 */
function loadNavBar(navBarView: Electron.WebContentsView): void {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    navBarView.webContents.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#/navbar')
  } else {
    navBarView.webContents.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/navbar' })
  }
}
