import { createHashRouter, RouterProvider } from 'react-router-dom'
import Home from '@renderer/pages/Home'
import Settings from '@renderer/pages/Settings'

const router = createHashRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/settings',
    element: <Settings />
  }
])

function Router(): React.JSX.Element {
  return <RouterProvider router={router} />
}

export default Router
