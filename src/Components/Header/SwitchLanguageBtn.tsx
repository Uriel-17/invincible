import { useTranslation } from 'react-i18next'
import { useT } from 'src/hooks/useT'
import './helpers/SwitchLanguageBtn.css'

const SwitchLanguageBtn = () => {
  const { i18n } = useTranslation()
  const _T = useT()
  const currentLanguage = i18n.language.startsWith('es') ? 'es' : 'en'

  return (
    <div className="switch-language">
      <button
        type="button"
        className="switch-language-button"
        onClick={() => i18n.changeLanguage('en')}
        aria-pressed={currentLanguage === 'en'}
      >
        {_T('English')}
      </button>
      <button
        type="button"
        className="switch-language-button"
        onClick={() => i18n.changeLanguage('es')}
        aria-pressed={currentLanguage === 'es'}
      >
        {_T('Spanish')}
      </button>
    </div>
  )
}

export default SwitchLanguageBtn
