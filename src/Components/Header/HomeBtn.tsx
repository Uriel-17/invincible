import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useT } from 'src/hooks/useT'
import './helpers/HeaderButtons.css'

const HomeBtn = () => {
  const _T = useT()
  const navigate = useNavigate()
  const routerState = useRouterState()
  const isOnHomePage = routerState.location.pathname === '/'

  if (isOnHomePage) return null

  const handleClick = () => {
    navigate({ to: '/' })
  }

  return (
    <div className="header-btn-wrapper">
      <button
        type="button"
        className="header-btn header-btn-secondary"
        onClick={handleClick}
      >
        {_T('Home')}
      </button>
    </div>
  )
}

export default HomeBtn