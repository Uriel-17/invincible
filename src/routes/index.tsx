import { createFileRoute } from '@tanstack/react-router'
import DashboardPage from 'src/Pages/Dashboard/DashboardPage'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})
