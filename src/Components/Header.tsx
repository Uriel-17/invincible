import './Styles/Header.css'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import ThemeToggle from './HeaderComponents/ThemeToggle'
import ClearMonthBtn from './HeaderComponents/ClearMonthBtn'
import SwitchLanguageBtn from './HeaderComponents/SwitchLanguageBtn'

const Header = () => {
  const { t } = useTranslation()

  return (
    <header className="app-header">
      <Link className="app-header-title" to="/">
        {t('appName')}
      </Link>
      <div className="app-header-actions">
        <SwitchLanguageBtn />
        <ClearMonthBtn />
        <ThemeToggle />
      </div>
    </header>
  )
}

export default Header
