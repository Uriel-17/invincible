import { useState } from 'react'
import './helpers/Header.css'
import './helpers/HeaderButtons.css'
import { useT } from 'src/hooks/useT'
import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'
import HomeBtn from './HomeBtn'
import SettingsBtn from './SettingsBtn'
import AddFundsBtn from './AddFundsBtn'
import CreatePickModal from 'src/Pages/Welcome/CreatePickModal/CreatePickModal'

const Header = () => {
  const _T = useT()
  const [isCreatePickOpen, setIsCreatePickOpen] = useState(false)

  return (
    <>
      <header className="app-header">
        <Link className="app-header-title" to="/">
          {_T('Invincible')}
        </Link>
        <div className="app-header-actions">
          <div className="header-btn-wrapper">
            <button
              type="button"
              className="header-btn header-btn-outlined"
              onClick={() => setIsCreatePickOpen(true)}
            >
              {_T('Create pick')}
            </button>
          </div>
          <AddFundsBtn />
          <HomeBtn />
          <SettingsBtn />
          <ThemeToggle />
        </div>
      </header>

      <CreatePickModal
        isOpen={isCreatePickOpen}
        onClose={() => setIsCreatePickOpen(false)}
      />
    </>
  )
}

export default Header
