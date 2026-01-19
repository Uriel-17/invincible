import './Styles/Header.css'
import ThemeToggle from './HeaderComponents/ThemeToggle'
import ClearMonthBtn from './HeaderComponents/ClearMonthBtn'

const Header = () => {
  return (
    <header className="app-header">
      <ClearMonthBtn/>
      <ThemeToggle />
    </header>
  )
}

export default Header
