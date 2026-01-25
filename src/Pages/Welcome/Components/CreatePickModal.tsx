import { useT } from '../../../hooks/useT'
import CreatePickForm from '../../CreatePick/CreatePickForm'
import '../Styles/CreatePickModal.css'
import type { CreatePickModalProps } from '../../types'

const CreatePickModal = ({ isOpen, onClose }: CreatePickModalProps) => {
  const _T = useT()

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
          <h2 id="create-pick-title">{_T('Create pick')}</h2>
          <p>{_T('Log a new bet for this month.')}</p>
        </div>
        <CreatePickForm
          onSubmit={onClose}
          actions={
            <div className="create-pick-actions">
              <button type="button" className="create-pick-button" onClick={onClose}>
                {_T('Cancel')}
              </button>
              <button type="submit" className="create-pick-button create-pick-button-primary">
                {_T('Save pick')}
              </button>
            </div>
          }
        />
      </div>
    </div>
  )
}

export default CreatePickModal
