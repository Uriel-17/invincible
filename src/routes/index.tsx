import { createFileRoute } from '@tanstack/react-router'
import WelcomePage from 'src/Pages/WelcomePage'

export const Route = createFileRoute('/')({
  component: WelcomePage,
})
