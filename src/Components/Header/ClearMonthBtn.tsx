import { useState } from 'react'
import { useT } from 'src/hooks/useT'
import './helpers/ClearMonthModal.css'

const ClearMonthBtn = () => {
  const [isOpen, setIsOpen] = useState(false)
  const _T = useT()

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
        className="clear-month-trigger"
        onClick={() => setIsOpen(true)}
      >
        {_T('Clear month')}
      </button>

      {isOpen ? (
        <div className="clear-month-overlay" role="presentation">
          <div
            className="clear-month-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-month-title"
          >
            <h2 id="clear-month-title" className="clear-month-title">
              {_T('Clear month')}
            </h2>
            <p className="clear-month-body">
              {_T('Are you sure you want to delete this months bets?')}
            </p>
            <div className="clear-month-actions">
              <button
                type="button"
                className="clear-month-action-button"
                onClick={handleCancel}
              >
                {_T('Cancel')}
              </button>
              <button
                type="button"
                className="clear-month-action-button clear-month-action-button-primary"
                onClick={handleConfirm}
              >
                {_T('Confirm')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ClearMonthBtn
