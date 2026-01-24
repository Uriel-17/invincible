import { useTranslation } from 'react-i18next'
import CreatePickForm from '../../CreatePick/CreatePickForm'
import '../Styles/CreatePickModal.css'

type CreatePickModalProps = {
  isOpen: boolean
  onClose: () => void
}

const CreatePickModal = ({ isOpen, onClose }: CreatePickModalProps) => {
  const { t } = useTranslation()

  if (!isOpen) {
    return null
  }

  return (
    <div className="create-pick-overlay" role="presentation">
      <div
        className="create-pick-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-pick-title"
      >
        <div className="create-pick-header">
          <h2 id="create-pick-title">{t('createPickTitle')}</h2>
          <p>{t('createPickSubhead')}</p>
        </div>
        <CreatePickForm onSubmit={onClose} />
        <div className="create-pick-actions">
          <button type="button" className="create-pick-button" onClick={onClose}>
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreatePickModal
