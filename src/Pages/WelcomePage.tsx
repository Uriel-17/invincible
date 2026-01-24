import { useState } from 'react'
import WelcomeHero from './Welcome/WelcomeHero'
import WelcomePanels from './Welcome/WelcomePanels'
import CreatePickModal from './Welcome/Components/CreatePickModal'
import './Styles/WelcomePage.css'

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
