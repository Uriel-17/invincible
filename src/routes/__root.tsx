import { Outlet, createRootRoute, useRouter } from '@tanstack/react-router'
import Header from 'src/Components/Header/Header'

const RootErrorComponent = ({ error }: { error: Error }) => {
  const router = useRouter()
  return (
    <div style={{ padding: '2rem', color: 'red' }}>
      <h2>Something went wrong</h2>
      <pre style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{error.message}</pre>
      <button type="button" onClick={() => router.invalidate()}>Try again</button>
    </div>
  )
}

export const Route = createRootRoute({
  component: () => (
    <>
      <Header />
      <Outlet />
    </>
  ),
  errorComponent: RootErrorComponent,
})
