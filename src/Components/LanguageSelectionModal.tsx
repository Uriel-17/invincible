import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { setUserSetting } from 'src/services/database'
import Modal from 'src/Components/Modal/Modal'
import './Styles/LanguageSelectionModal.css'

interface LanguageSelectionModalProps {
  isOpen: boolean
  onLanguageSelected: (language: 'en' | 'es') => void
}

const LanguageSelectionModal = ({ isOpen, onLanguageSelected }: LanguageSelectionModalProps) => {
  const { i18n } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const handleLanguageSelect = async (language: 'en' | 'es') => {
    setIsLoading(true)
    try {
      await i18n.changeLanguage(language)
      await setUserSetting('language', language)
      console.log('✅ Language saved to database:', language)
      onLanguageSelected(language)
    } catch (error) {
      console.error('❌ Failed to save language:', error)
      onLanguageSelected(language)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      titleId="language-selection-title"
      classNamePrefix="language-selection"
      zIndex={101}
    >
      <div className="language-selection-header">
        <h2 id="language-selection-title">Choose Your Language</h2>
        <p className="language-selection-subtitle">Elige tu idioma</p>
      </div>

      <div className="language-selection-options">
        <button
          type="button"
          className="language-option"
          onClick={() => handleLanguageSelect('en')}
          disabled={isLoading}
        >
          <span className="language-name">English</span>
        </button>

        <button
          type="button"
          className="language-option"
          onClick={() => handleLanguageSelect('es')}
          disabled={isLoading}
        >
          <span className="language-name">Español</span>
        </button>
      </div>
    </Modal>
  )
}

export default LanguageSelectionModal

