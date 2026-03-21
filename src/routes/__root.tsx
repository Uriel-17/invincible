import { Outlet, createRootRoute } from '@tanstack/react-router'
import Header from 'src/Components/Header/Header'

export const Route = createRootRoute({
  component: () => (
    <>
      <Header />
      <Outlet />
    </>
  ),
})
