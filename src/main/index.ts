/**
 * 主进程入口
 * 职责：初始化应用、协调各模块
 */

import { app } from 'electron'
import { logger } from './utils'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { MainWindow } from './window/MainWindow'
import { AppViewManager } from './views/AppViewManager'
import { TabManager } from './tabs/TabManager'
import { registerIpcServices } from './ipc'
import './duplext' // 初始化双工通信

// 模块实例
let mainWindow: MainWindow  
let viewManager: AppViewManager
let tabManager: TabManager

/**
 * 初始化应用
 */
function initializeApp(): void {
  // 创建主窗口
  mainWindow = new MainWindow({
    width: 1200,
    height: 700,
    frame: false
  })
  mainWindow.create()

  // 创建视图管理器
  const preloadPath = join(__dirname, '../preload/index.js')
  viewManager = new AppViewManager(preloadPath)

  // 创建标签页管理器
  tabManager = new TabManager(preloadPath, () => {
    const [windowWidth, windowHeight] = mainWindow.getSize()
    return {
      x: 0,
      y: 80, // 导航栏高度
      width: windowWidth,
      height: windowHeight - 80
    }
  })

  // 初始化视图
  viewManager.initialize(mainWindow)

  // 开发模式下打开 DevTools
  if (is.dev) {
    viewManager.openNavBarDevTools()
    viewManager.openDevTools()
  }

  // 创建初始标签页
  tabManager.createTab({ url: '/', active: true })
}

// 应用就绪
app.whenReady().then(() => {
  // 设置应用用户模型 ID
  electronApp.setAppUserModelId('com.electron')

  // 注册 IPC 服务
  registerIpcServices()

  // 监听窗口创建，设置快捷键优化
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 初始化应用
  initializeApp()

  // macOS 激活处理
  app.on('activate', () => {
    if (mainWindow.getWindow() === null) {
      initializeApp()
    }
  })
})

// 所有窗口关闭时退出（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 应用退出时清理
app.on('before-quit', () => {
  tabManager?.destroyAll()
  viewManager?.destroyAll()
})
