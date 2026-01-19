import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './ClearMonthBtn.css'

const ClearMonthBtn = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  const handleConfirm = () => {
    setIsOpen(false)
  }

  const handleCancel = () => {
    setIsOpen(false)
  }

  return (
    <div className="clear-month">
      <button
        type="button"
        className="clear-month__trigger"
        onClick={() => setIsOpen(true)}
      >
        {t('clearMonth')}
      </button>

      {isOpen ? (
        <div className="clear-month__overlay" role="presentation">
          <div
            className="clear-month__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-month-title"
          >
            <h2 id="clear-month-title" className="clear-month__title">
              {t('clearMonth')}
            </h2>
            <p>{t('clearMonthPrompt')}</p>
            <div className="clear-month__actions">
              <button
                type="button"
                className="clear-month__action-button"
                onClick={handleCancel}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                className="clear-month__action-button clear-month__action-button--primary"
                onClick={handleConfirm}
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ClearMonthBtn
