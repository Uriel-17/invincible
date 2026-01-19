import './Styles/Header.css'
import ThemeToggle from './HeaderComponents/ThemeToggle'
import ClearMonthBtn from './HeaderComponents/Styles/ClearMonthBtn'

const Header = () => {
  return (
    <header className="app-header">
      <ClearMonthBtn/>
      <ThemeToggle />
    </header>
  )
}

export default Header
