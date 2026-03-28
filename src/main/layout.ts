import { BaseWindow, WebContentsView } from 'electron'
import { NAVBAR_HEIGHT } from './config'

/**
 * 更新窗口布局
 */
export function updateLayout(
  mainWindow: BaseWindow,
  navBarView: WebContentsView,
  contentView: WebContentsView
): void {
  const [width, height] = mainWindow.getSize()
  navBarView.setBounds({ x: 0, y: 0, width, height: NAVBAR_HEIGHT })
  contentView.setBounds({ x: 0, y: NAVBAR_HEIGHT, width, height: height - NAVBAR_HEIGHT })
}

/**
 * 绑定窗口 resize 事件
 */
export function bindResizeHandler(
  mainWindow: BaseWindow,
  navBarView: WebContentsView,
  getCurrentContentView: () => WebContentsView | null
): void {
  mainWindow.on('resize', () => {
    const contentView = getCurrentContentView()
    if (contentView) {
      updateLayout(mainWindow, navBarView, contentView)
    }
  })
}
