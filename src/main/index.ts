import { app, BaseWindow, WebContentsView, shell } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerIpcServices } from './ipc'
import { logger } from './utils'

function createWindow(): void {
  // 创建 BaseWindow
  const mainWindow = new BaseWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false // 无边框窗口
  })

  // 创建导航栏 WebContentsView
  const navBarView = new WebContentsView({
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  mainWindow.contentView.addChildView(navBarView)

  // 创建主内容 WebContentsView
  const contentView = new WebContentsView({
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  mainWindow.contentView.addChildView(contentView)

  // 布局：导航栏高度 40px
  const NAVBAR_HEIGHT = 40

  // 设置视图位置和大小
  const updateLayout = (): void => {
    const [width, height] = mainWindow.getSize()
    navBarView.setBounds({ x: 0, y: 0, width, height: NAVBAR_HEIGHT })
    contentView.setBounds({ x: 0, y: NAVBAR_HEIGHT, width, height: height - NAVBAR_HEIGHT })
  }

  updateLayout()

  // 窗口大小改变时更新布局
  mainWindow.on('resize', updateLayout)

  // 开发模式下打开 DevTools
  if (is.dev) {
    navBarView.webContents.openDevTools({ mode: 'detach' })
    contentView.webContents.openDevTools({ mode: 'detach' })
  }

  // 处理外部链接
  const handleExternalLinks = (webContents: Electron.WebContents): void => {
    webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })
  }

  handleExternalLinks(navBarView.webContents)
  handleExternalLinks(contentView.webContents)

  // 加载页面
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    navBarView.webContents.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#/navbar')
    contentView.webContents.loadURL("https://www.baidu.com/")
  } else {
    navBarView.webContents.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/navbar' })
    contentView.webContents.loadFile(join(__dirname, '../renderer/index.html'))
  }

  logger.info('Main', '窗口创建成功')
}

// 应用准备就绪
app.whenReady().then(() => {
  // 设置应用用户模型 ID
  electronApp.setAppUserModelId('com.finger')

  // 默认在 macOS 上打开/关闭窗口时重新创建
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 注册 IPC 服务
  registerIpcServices()

  createWindow()

  // macOS 激活应用时创建窗口
  app.on('activate', () => {
    if (BaseWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 所有窗口关闭时退出应用（除了 macOS）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
