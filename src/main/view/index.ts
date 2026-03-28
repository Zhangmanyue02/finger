import { WebContentsView, shell } from 'electron'
import { join } from 'path'

/**
 * 创建 WebContentsView 的通用配置
 */
function createBaseView(): WebContentsView {
  return new WebContentsView({
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })
}

/**
 * 处理外部链接，在默认浏览器中打开
 */
function handleExternalLinks(webContents: Electron.WebContents): void {
  webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
}

/**
 * 创建导航栏视图
 */
export function createNavBarView(): WebContentsView {
  const view = createBaseView()
  handleExternalLinks(view.webContents)
  return view
}

/**
 * 创建内容视图
 */
export function createContentView(url: string): WebContentsView {
  const view = createBaseView()
  handleExternalLinks(view.webContents)
  view.webContents.loadURL(url)
  return view
}
