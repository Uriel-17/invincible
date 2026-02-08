import { useNavigate } from '@tanstack/react-router'
import { useT } from 'src/hooks/useT'

const SettingsBtn = () => {
  const _T = useT()
  const navigate = useNavigate()

  const handleClick = () => {
    navigate({ to: '/settings' })
  }

  return (
    <div className="switch-language">
      <button
        type="button"
        className="switch-language-button"
        onClick={handleClick}
      >
        {_T('Settings')}
      </button>
    </div>
  )
}

export default SettingsBtn
