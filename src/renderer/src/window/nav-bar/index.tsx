/**
 * NavBar - 导航栏容器
 * 职责：组合 TabBar、SearchBar、BookmarkBar
 */

import TabBar from '../tab-bar'
import SearchBar from '../search-bar'
import BookmarkBar from '../bookmark-bar'

interface Bookmark {
  id: string
  title: string
  url: string
  favicon?: string
}

interface Tab {
  id: string
  title: string
  favicon?: string
}

interface NavBarProps {
  tabs?: Tab[]
  activeTabId?: string
  bookmarks?: Bookmark[]
  onTabClick?: (id: string) => void
  onTabClose?: (id: string) => void
  onNewTab?: () => void
  onNavigate?: (url: string) => void
  onRefresh?: () => void
  onBack?: () => void
  onForward?: () => void
  onBookmarkClick?: (bookmark: Bookmark) => void
}

export default function NavBar({
  tabs,
  activeTabId,
  bookmarks,
  onTabClick,
  onTabClose,
  onNewTab,
  onNavigate,
  onRefresh,
  onBack,
  onForward,
  onBookmarkClick
}: NavBarProps) {
  return (
    <div className="flex flex-col w-full bg-[#202124]">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={onTabClick}
        onTabClose={onTabClose}
        onNewTab={onNewTab}
      />
      <SearchBar
        onNavigate={onNavigate}
        onRefresh={onRefresh}
        onBack={onBack}
        onForward={onForward}
      />
      <BookmarkBar
        bookmarks={bookmarks}
        onClick={onBookmarkClick}
      />
    </div>
  )
}
