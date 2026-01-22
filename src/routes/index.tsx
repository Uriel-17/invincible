import { createFileRoute } from '@tanstack/react-router'
import WelcomePage from '../Pages/WelcomePage'

export const Route = createFileRoute('/')({
  component: WelcomePage,
})
