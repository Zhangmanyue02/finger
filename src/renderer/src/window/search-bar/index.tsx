/**
 * SearchBar - 搜索栏组件
 * 职责：网页地址输入和搜索
 */

import { useState } from 'react'

interface SearchBarProps {
  url?: string
  onNavigate?: (url: string) => void
  onRefresh?: () => void
  onBack?: () => void
  onForward?: () => void
}

export default function SearchBar({
  url = '',
  onNavigate,
  onRefresh,
  onBack,
  onForward
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(url)
  const [isFocused, setIsFocused] = useState(false)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      let navigateUrl = inputValue.trim()
      // 自动补全 URL
      if (!navigateUrl.startsWith('http://') && !navigateUrl.startsWith('https://')) {
        if (navigateUrl.includes('.')) {
          navigateUrl = 'https://' + navigateUrl
        } else {
          // 当作搜索关键词
          navigateUrl = `https://www.google.com/search?q=${encodeURIComponent(navigateUrl)}`
        }
      }
      onNavigate?.(navigateUrl)
    }
  }

  return (
    <div className="flex h-[30px] w-full items-center bg-[#35363a] px-2">
      {/* 导航按钮 */}
      <div className="flex items-center gap-0.5">
        {/* 后退 */}
        <div
          className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[#5f6368]/50"
          onClick={() => onBack?.()}
        >
          <svg className="h-[14px] w-[14px] text-[#9aa0a6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* 前进 */}
        <div
          className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[#5f6368]/50"
          onClick={() => onForward?.()}
        >
          <svg className="h-[14px] w-[14px] text-[#9aa0a6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* 刷新 */}
        <div
          className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[#5f6368]/50"
          onClick={() => onRefresh?.()}
        >
          <svg className="h-[14px] w-[14px] text-[#9aa0a6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* 地址栏 */}
      <div
        className="ml-2 flex flex-1 items-center rounded-full bg-[#202124] px-3 py-1 transition-colors"
        style={{
          outline: isFocused ? '2px solid #8ab4f8' : 'none'
        }}
      >
        <svg className="mr-2 h-[14px] w-[14px] text-[#9aa0a6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          className="flex-1 bg-transparent text-xs text-[#e8eaed] outline-none placeholder:text-[#9aa0a6]"
          placeholder="搜索或输入网址"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
    </div>
  )
}
