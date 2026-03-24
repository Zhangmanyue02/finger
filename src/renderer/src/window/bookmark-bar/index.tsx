/**
 * BookmarkBar - 书签栏组件
 * 职责：管理书签快捷访问
 */

interface Bookmark {
  id: string
  title: string
  url: string
  favicon?: string
}

interface BookmarkBarProps {
  bookmarks?: Bookmark[]
  onClick?: (bookmark: Bookmark) => void
}

const defaultBookmarks: Bookmark[] = [
  { id: '1', title: 'Google', url: 'https://www.google.com', favicon: '🌐' },
  { id: '2', title: 'GitHub', url: 'https://github.com', favicon: '🐙' },
  { id: '3', title: 'YouTube', url: 'https://www.youtube.com', favicon: '▶️' }
]

export default function BookmarkBar({
  bookmarks = defaultBookmarks,
  onClick
}: BookmarkBarProps) {
  return (
    <div className="flex h-[20px] w-full items-center bg-[#35363a] px-2">
      {/* 书签列表 */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="flex h-[18px] cursor-pointer items-center gap-1 rounded px-2 transition-colors hover:bg-[#5f6368]/50"
            onClick={() => onClick?.(bookmark)}
          >
            <span className="text-[10px]">{bookmark.favicon || '📄'}</span>
            <span className="max-w-[80px] truncate text-[10px] text-[#bdc1c6]">{bookmark.title}</span>
          </div>
        ))}

        {/* 添加书签按钮 */}
        <div className="flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded transition-colors hover:bg-[#5f6368]/50">
          <svg className="h-[10px] w-[10px] text-[#9aa0a6]" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 2v10M2 7h10" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}
