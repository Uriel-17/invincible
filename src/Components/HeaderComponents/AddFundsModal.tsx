import { FormProvider, useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useT } from 'src/hooks/useT'
import { useBankroll } from 'src/hooks/useBankroll'
import { getElectronAPI } from 'src/services/database'
import TextField from 'src/Components/Form/TextField'
import { getAddFundsAmountValidation } from 'src/Components/addFundsFieldValidations'
import { BANKROLL_QC_KEY } from 'src/queryKeys'
import Modal from 'src/Components/Modal/Modal'
import './Styles/AddFundsModal.css'

interface AddFundsFormValues {
  amount: string
}

interface AddFundsModalProps {
  isOpen: boolean
  onClose: () => void
}

const AddFundsModal = ({ isOpen, onClose }: AddFundsModalProps) => {
  const _T = useT()
  const queryClient = useQueryClient()
  const { data: currentBankroll, formatCurrency } = useBankroll()

  const methods = useForm<AddFundsFormValues>({
    mode: 'onChange',
    defaultValues: {
      amount: '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: AddFundsFormValues) => {
      const amount = parseFloat(values.amount)
      const api = getElectronAPI()
      const response = await api.database.addFunds(amount)

      if (!response.success) {
        throw new Error(response.error || 'Failed to add funds')
      }

      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BANKROLL_QC_KEY] })
      alert(_T('Funds added successfully!'))
      methods.reset()
      onClose()
    },
    onError: (error: Error) => {
      alert(_T('Error adding funds: ') + error.message)
    },
  })

  const onSubmit = (values: AddFundsFormValues) => {
    mutation.mutate(values)
  }

  const handleCancel = () => {
    methods.reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      titleId="add-funds-title"
      classNamePrefix="add-funds"
    >
      <div className="add-funds-header">
        <h2 id="add-funds-title">{_T('Add Funds to Bankroll')}</h2>
        <p>{_T('Increase your starting bankroll by adding funds.')}</p>
      </div>

      <div className="add-funds-current-bankroll">
        <span className="add-funds-current-bankroll-label">
          {_T('Current Bankroll')}:
        </span>
        <span className="add-funds-current-bankroll-amount">
          {currentBankroll !== undefined
            ? formatCurrency(currentBankroll)
            : _T('Loading...')}
        </span>
      </div>

      <FormProvider {...methods}>
        <form className="add-funds-form" onSubmit={methods.handleSubmit(onSubmit)}>
          <TextField
            name="amount"
            label={_T('Amount to Add')}
            {...getAddFundsAmountValidation()}
            fieldClassName="add-funds-field"
            errorClassName="add-funds-field-error"
          />

          {mutation.isError && mutation.error && (
            <div className="add-funds-error">
              {_T('Error: ')} {mutation.error.message}
            </div>
          )}

          <div className="add-funds-actions">
            <button
              type="button"
              className="add-funds-button add-funds-button-cancel"
              onClick={handleCancel}
              disabled={mutation.isPending}
            >
              {_T('Cancel')}
            </button>
            <button
              type="submit"
              className="add-funds-button add-funds-button-primary"
              disabled={mutation.isPending || !methods.formState.isValid}
            >
              {mutation.isPending ? _T('Adding...') : _T('Add Funds')}
            </button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  )
}

export default AddFundsModal

