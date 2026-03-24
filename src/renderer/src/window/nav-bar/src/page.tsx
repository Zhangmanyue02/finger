import { useState } from 'react'

interface Tab {
  id: string
  title: string
  favicon?: string
}

interface NavBarProps {
  tabs?: Tab[]
  activeTabId?: string
  onTabClick?: (id: string) => void
  onTabClose?: (id: string) => void
  onNewTab?: () => void
}

const defaultTabs: Tab[] = [
  { id: '1', title: '新标签页', favicon: '🔍' },
  { id: '2', title: 'Google', favicon: '🌐' },
  { id: '3', title: 'GitHub - 代码托管平台', favicon: '🐙' }
]

export default function NavBar({
  tabs = defaultTabs,
  activeTabId = '1',
  onTabClick,
  onTabClose,
  onNewTab
}: NavBarProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const [hoveredClose, setHoveredClose] = useState<string | null>(null)

  return (
    <div className={`flex h-[34px] w-full select-none bg-[#202124]`}>
      {/* 标签栏区域 */}
      <div className="flex flex-1 items-end overflow-hidden px-2 pt-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          const isHovered = tab.id === hoveredTab
          const isCloseHovered = tab.id === hoveredClose

          return (
            <div
              key={tab.id}
              className="group relative mr-[-1px] flex h-[30px] min-w-0 max-w-[240px] flex-shrink-0 cursor-pointer items-center rounded-t-lg border border-b-0 border-transparent pl-3 pr-2"
              style={{
                backgroundColor: isActive ? '#35363a' : isHovered ? '#2f3034' : 'transparent',
                borderTopColor: isActive ? 'transparent' : 'transparent',
                minWidth: isActive ? 'auto' : '46px'
              }}
              onClick={() => onTabClick?.(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              {/* 左侧圆角遮罩 */}
              {isActive && (
                <div
                  className="pointer-events-none absolute -left-[1px] bottom-0 h-[6px] w-[6px] bg-[#202124]"
                  style={{
                    borderRadius: '0 0 6px 0'
                  }}
                />
              )}

              {/* 右侧圆角遮罩 */}
              {isActive && (
                <div
                  className="pointer-events-none absolute -right-[1px] bottom-0 h-[6px] w-[6px] bg-[#202124]"
                  style={{
                    borderRadius: '0 0 0 6px'
                  }}
                />
              )}

              {/* Favicon */}
              <span className="mr-2 flex-shrink-0 text-sm">{tab.favicon || '📄'}</span>

              {/* 标题 */}
              <span className="flex-1 truncate text-xs text-[#bdc1c6]">{tab.title}</span>

              {/* 关闭按钮 */}
              <div
                className={`ml-2 flex h-[16px] w-[16px] flex-shrink-0 items-center justify-center rounded-sm transition-colors ${
                  isCloseHovered ? 'bg-[#5f6368]' : 'group-hover:bg-[#5f6368]/50'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  onTabClose?.(tab.id)
                }}
                onMouseEnter={() => setHoveredClose(tab.id)}
                onMouseLeave={() => setHoveredClose(null)}
              >
                <svg
                  className="h-[10px] w-[10px] text-[#9aa0a6]"
                  viewBox="0 0 10 10"
                  fill="currentColor"
                >
                  <path
                    d="M1 1l8 8M9 1l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          )
        })}

        {/* 新建标签按钮 */}
        <div
          className="ml-1 flex h-[26px] w-[26px] flex-shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-[#3c4043]"
          onClick={() => onNewTab?.()}
        >
          <svg
            className="h-[14px] w-[14px] text-[#9aa0a6]"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M7 2v10M2 7h10" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* 窗口控制按钮区域 */}
      <div className="flex">
        {/* 最小化 */}
        <div className="flex h-[34px] w-[46px] cursor-pointer items-center justify-center transition-colors hover:bg-[#3c4043]">
          <svg
            className="h-[10px] w-[10px] text-[#9aa0a6]"
            viewBox="0 0 10 10"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M0 5h10" />
          </svg>
        </div>

        {/* 最大化 */}
        <div className="flex h-[34px] w-[46px] cursor-pointer items-center justify-center transition-colors hover:bg-[#3c4043]">
          <svg
            className="h-[10px] w-[10px] text-[#9aa0a6]"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <rect x="1" y="1" width="8" height="8" rx="1" />
          </svg>
        </div>

        {/* 关闭 */}
        <div className="flex h-[34px] w-[46px] cursor-pointer items-center justify-center transition-colors hover:bg-[#e8443d]">
          <svg
            className="h-[10px] w-[10px] text-[#9aa0a6] hover:text-white"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M1 1l8 8M9 1l-8 8" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}
