import { useState } from 'react'
import WelcomeHero from './WelcomeHero'
import WelcomePanels from './WelcomePanels'
import CreatePickModal from './CreatePickModal/CreatePickModal'
import './helpers/WelcomePage.css'

const WelcomePage = () => {
  const [isCreatePickOpen, setIsCreatePickOpen] = useState(false)

  return (
    <main className="welcome-page">
      <WelcomeHero onCreatePick={() => setIsCreatePickOpen(true)} />
      <WelcomePanels />
      <CreatePickModal
        isOpen={isCreatePickOpen}
        onClose={() => setIsCreatePickOpen(false)}
      />
    </main>
  )
}

export default WelcomePage
