/**
 * TabBar - 标签栏组件
 * 职责：管理标签页 + 窗口控制按钮
 */

import { useState } from 'react'

interface Tab {
  id: string
  title: string
  favicon?: string
}

interface TabBarProps {
  tabs?: Tab[]
  activeTabId?: string
  onTabClick?: (id: string) => void
  onTabClose?: (id: string) => void
  onNewTab?: () => void
}

const defaultTabs: Tab[] = [
  { id: '1', title: '新标签页', favicon: '🔍' },
  { id: '2', title: 'Google', favicon: '🌐' }
]

export default function TabBar({
  tabs = defaultTabs,
  activeTabId = '1',
  onTabClick,
  onTabClose,
  onNewTab
}: TabBarProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const [hoveredClose, setHoveredClose] = useState<string | null>(null)

  // 窗口控制 - 请求/响应模式验证
  const handleMinimize = () => window.coreApi.windowCtrl.minimizeWindow()
  const handleMaximize = () => window.coreApi.windowCtrl.toggleWindowMaximize()
  const handleClose = () => window.coreApi.windowCtrl.closeWindow()

  return (
    <div className="flex h-[30px] w-full select-none bg-[#202124]" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      {/* 标签页区域 */}
      <div
        className="flex flex-1 items-end overflow-hidden px-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          const isHovered = tab.id === hoveredTab
          const isCloseHovered = tab.id === hoveredClose

          return (
            <div
              key={tab.id}
              className="group relative mr-[-1px] flex h-[26px] min-w-0 max-w-[200px] flex-shrink-0 cursor-pointer items-center rounded-t-lg border border-b-0 border-transparent px-2"
              style={{
                backgroundColor: isActive ? '#35363a' : isHovered ? '#2f3034' : 'transparent',
                minWidth: isActive ? 'auto' : '40px'
              }}
              onClick={() => onTabClick?.(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              {/* 左侧圆角遮罩 */}
              {isActive && (
                <div
                  className="pointer-events-none absolute -left-[1px] bottom-0 h-[5px] w-[5px] bg-[#202124]"
                  style={{ borderRadius: '0 0 5px 0' }}
                />
              )}

              {/* 右侧圆角遮罩 */}
              {isActive && (
                <div
                  className="pointer-events-none absolute -right-[1px] bottom-0 h-[5px] w-[5px] bg-[#202124]"
                  style={{ borderRadius: '0 0 0 5px' }}
                />
              )}

              {/* Favicon */}
              <span className="mr-1.5 flex-shrink-0 text-xs">{tab.favicon || '📄'}</span>

              {/* 标题 */}
              <span className="flex-1 truncate text-[11px] text-[#bdc1c6]">{tab.title}</span>

              {/* 关闭按钮 */}
              <div
                className={`ml-1.5 flex h-[14px] w-[14px] flex-shrink-0 items-center justify-center rounded-sm transition-colors ${
                  isCloseHovered ? 'bg-[#5f6368]' : 'group-hover:bg-[#5f6368]/50'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  onTabClose?.(tab.id)
                }}
                onMouseEnter={() => setHoveredClose(tab.id)}
                onMouseLeave={() => setHoveredClose(null)}
              >
                <svg className="h-[8px] w-[8px] text-[#9aa0a6]" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          )
        })}

        {/* 新建标签按钮 */}
        <div
          className="ml-0.5 flex h-[24px] w-[24px] flex-shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-[#3c4043]"
          onClick={() => onNewTab?.()}
        >
          <svg className="h-[12px] w-[12px] text-[#9aa0a6]" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 2v10M2 7h10" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* 窗口控制按钮 */}
      <div className="flex" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {/* 最小化 */}
        <div
          className="flex h-[30px] w-[36px] cursor-pointer items-center justify-center transition-colors hover:bg-[#3c4043]"
          onClick={handleMinimize}
        >
          <svg className="h-[8px] w-[8px] text-[#9aa0a6]" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1">
            <path d="M0 5h10" />
          </svg>
        </div>

        {/* 最大化 */}
        <div
          className="flex h-[30px] w-[36px] cursor-pointer items-center justify-center transition-colors hover:bg-[#3c4043]"
          onClick={handleMaximize}
        >
          <svg className="h-[8px] w-[8px] text-[#9aa0a6]" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="1" y="1" width="8" height="8" rx="1" />
          </svg>
        </div>

        {/* 关闭 */}
        <div
          className="flex h-[30px] w-[36px] cursor-pointer items-center justify-center transition-colors hover:bg-[#e8443d]"
          onClick={handleClose}
        >
          <svg className="h-[8px] w-[8px] text-[#9aa0a6] hover:text-white" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M1 1l8 8M9 1l-8 8" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}
