import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppWithOnboarding from './AppWithOnboarding'
import router from './router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable automatic refetching since we're using Electron with local SQLite
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppWithOnboarding router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
