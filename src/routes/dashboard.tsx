import { createFileRoute } from '@tanstack/react-router'
import DashboardPage from 'src/Pages/DashboardPage'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

