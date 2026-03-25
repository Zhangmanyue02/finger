import { createHashRouter, RouterProvider } from 'react-router-dom'
import Home from '@renderer/pages/Home'
import NavBar from '@renderer/window/nav-bar'

const router = createHashRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/navbar',
    element: <NavBar />
  }
])

function Router(): React.JSX.Element {
  return <RouterProvider router={router} />
}

export default Router
  