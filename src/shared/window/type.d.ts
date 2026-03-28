declare namespace Tab {
  interface TabItem {
    id: string
    title: string
    url: string
    favicon?: string
    active: boolean
    loading: boolean
  }
}
