import { useNavigate } from '@tanstack/react-router'
import { useT } from 'src/hooks/useT'
import './helpers/HeaderButtons.css'

const SettingsBtn = () => {
  const _T = useT()
  const navigate = useNavigate()

  const handleClick = () => {
    navigate({ to: '/settings' })
  }

  return (
    <div className="header-btn-wrapper">
      <button
        type="button"
        className="header-btn header-btn-secondary"
        onClick={handleClick}
      >
        {_T('Settings')}
      </button>
    </div>
  )
}

export default SettingsBtn
