import { useT } from 'src/hooks/useT'
import CreatePickForm from 'src/Pages/CreatePick/CreatePickForm'
import FormActions from 'src/Pages/Welcome/Components/FormActions'
import 'src/Pages/Welcome/Styles/CreatePickModal.css'
import type { CreatePickModalProps } from 'src/Pages/types'
import type { CreateBetFormValues } from 'src/types/bets'
import { useCreateBet } from 'src/hooks/mutations/useCreateBet'

const CreatePickModal = ({ isOpen, onClose }: CreatePickModalProps) => {
  const _T = useT()
  const { mutate, error, isError, isPending } = useCreateBet({
    onSuccess: () => {
      alert(_T('Bet saved successfully!'))
      onClose()
    },
    onError: (error) => {
      alert(_T('Error saving bet: ') + error.message)
    }
  })

  if (!isOpen) {
    return null
  }

  const handleSubmit = (values: CreateBetFormValues) => {
    mutate(values)
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
          {isError && error && (
            <div style={{ color: 'red', marginTop: '8px' }}>
              {_T('Error: ')} {error.message}
            </div>
          )}
        </div>
        <CreatePickForm
          onSubmit={handleSubmit}
          actions={<FormActions onClose={onClose} />}
        />
        {isPending && (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            {_T('Saving...')}
          </div>
        )}
      </div>
    </div>
  )
}

export default CreatePickModal; 