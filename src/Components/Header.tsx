import { useState } from 'react'
import './Styles/Header.css'
import './HeaderComponents/Styles/HeaderButtons.css'
import { useT } from 'src/hooks/useT'
import { Link } from '@tanstack/react-router'
import ThemeToggle from 'src/Components/HeaderComponents/ThemeToggle'
import HomeBtn from 'src/Components/HeaderComponents/HomeBtn'
import SettingsBtn from 'src/Components/HeaderComponents/SettingsBtn'
import AddFundsBtn from 'src/Components/HeaderComponents/AddFundsBtn'
import CreatePickModal from 'src/Pages/Welcome/Components/CreatePickModal'

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
