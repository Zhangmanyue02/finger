import { useState, useEffect } from 'react'

function TabBar(): React.JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.coreApi.windowCtrl.isMaximized().then(setIsMaximized)
  }, [])

  const handleMinimize = async () => {
    await window.coreApi.windowCtrl.minimizeWindow()
  }

  const handleMaximize = async () => {
    await window.coreApi.windowCtrl.toggleWindowMaximize()
    const maximized = await window.coreApi.windowCtrl.isMaximized()
    setIsMaximized(maximized)
  }

  const handleClose = async () => {
    await window.coreApi.windowCtrl.closeWindow()
  }

  return (
    <div className="h-[40px] bg-[#202124] flex select-none overflow-hidden">
      {/* 左侧标签区域 - 可拖拽 */}
      <div className="flex-1 flex items-center h-full min-w-0" style={{ WebkitAppRegion: 'drag' }}>
        <div className="flex items-center h-full px-2">
          {/* 标签页占位 */}
          <div
            className="bg-[#35363a] text-[#9aa0a6] text-xs px-4 py-1.5 rounded-t-lg cursor-pointer hover:bg-[#3c3d41]"
            style={{ WebkitAppRegion: 'no-drag' }}
          >
            新标签页
          </div>
        </div>
      </div>

      {/* 右侧窗口控制按钮 - 不可拖拽 */}
      <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          onClick={handleMinimize}
          className="w-12 h-full flex items-center justify-center hover:bg-[#3c3d41] transition-colors"
          title="最小化"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="#9aa0a6">
            <rect width="10" height="1" />
          </svg>
        </button>
        <button
          onClick={handleMaximize}
          className="w-12 h-full flex items-center justify-center hover:bg-[#3c3d41] transition-colors"
          title={isMaximized ? '还原' : '最大化'}
        >
          {isMaximized ? (
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#9aa0a6">
              <rect x="1" y="3" width="7" height="7" strokeWidth="1" />
              <path d="M3 3V1h7v7h-2" strokeWidth="1" />
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#9aa0a6">
              <rect x="1" y="1" width="9" height="9" strokeWidth="1" />
            </svg>
          )}
        </button>
        <button
          onClick={handleClose}
          className="w-12 h-full flex items-center justify-center hover:bg-[#e8443a] transition-colors group"
          title="关闭"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="#9aa0a6"
            className="group-hover:stroke-white"
          >
            <path d="M1 1l10 10M11 1L1 11" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default TabBar
