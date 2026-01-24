import { useTranslation } from 'react-i18next'
import './Styles/SwitchLanguageBtn.css'

const SwitchLanguageBtn = () => {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language.startsWith('es') ? 'es' : 'en'

  return (
    <div className="switch-language">
      <button
        type="button"
        className="switch-language-button"
        onClick={() => i18n.changeLanguage('en')}
        aria-pressed={currentLanguage === 'en'}
      >
        {t('english')}
      </button>
      <button
        type="button"
        className="switch-language-button"
        onClick={() => i18n.changeLanguage('es')}
        aria-pressed={currentLanguage === 'es'}
      >
        {t('spanish')}
      </button>
    </div>
  )
}

export default SwitchLanguageBtn
