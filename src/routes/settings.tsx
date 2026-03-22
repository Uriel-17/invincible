import { createFileRoute } from '@tanstack/react-router'
import SettingsPage from 'src/Pages/Settings/SettingsPage'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

