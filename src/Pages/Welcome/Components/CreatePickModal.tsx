import { useT } from 'src/hooks/useT'
import CreatePickForm from 'src/Pages/CreatePick/CreatePickForm'
import FormActions from 'src/Pages/Welcome/Components/FormActions'
import 'src/Pages/Welcome/Styles/CreatePickModal.css'
import type { CreatePickModalProps } from 'src/Pages/types'

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
          actions={<FormActions onClose={onClose} />}
        />
      </div>
    </div>
  )
}

export default CreatePickModal
