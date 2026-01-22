import { Outlet, createRootRoute } from '@tanstack/react-router'
import Header from '../Components/Header'

export const Route = createRootRoute({
  component: () => (
    <>
      <Header />
      <Outlet />
    </>
  ),
})
