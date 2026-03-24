import Router from './router'
import NavBar from './window/nav-bar'

function App(): React.JSX.Element {
  // 根据 URL 参数决定渲染哪个视图
  const params = new URLSearchParams(window.location.search)
  const view = params.get('view')

  if (view === 'navbar') {
    return <NavBar />
  }

  return <Router />
}

export default App
