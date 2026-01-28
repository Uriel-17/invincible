import './Styles/Header.css'
import { useT } from 'src/hooks/useT'
import { Link } from '@tanstack/react-router'
import ThemeToggle from 'src/Components/HeaderComponents/ThemeToggle'
import ClearMonthBtn from 'src/Components/HeaderComponents/ClearMonthBtn'
import SwitchLanguageBtn from 'src/Components/HeaderComponents/SwitchLanguageBtn'

const Header = () => {
  const _T = useT()

  return (
    <header className="app-header">
      <Link className="app-header-title" to="/">
        {_T('Invincible')}
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
