import './Styles/Header.css'
import { useT } from 'src/hooks/useT'
import { Link } from '@tanstack/react-router'
import ThemeToggle from 'src/Components/HeaderComponents/ThemeToggle'
import SettingsBtn from 'src/Components/HeaderComponents/SettingsBtn'
import PopulateDummyDataBtn from 'src/Components/HeaderComponents/PopulateDummyDataBtn'

const Header = () => {
  const _T = useT()

  return (
    <header className="app-header">
      <Link className="app-header-title" to="/">
        {_T('Invincible')}
      </Link>
      <div className="app-header-actions">
        <PopulateDummyDataBtn />
        <SettingsBtn/>
        <ThemeToggle />
      </div>
    </header>
  )
}

export default Header
