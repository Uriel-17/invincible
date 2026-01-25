import { useEffect } from 'react'
import { useT } from '../../hooks/useT'
import { FormProvider, useForm } from 'react-hook-form'
import type { CreatePickFormProps, CreatePickFormValues } from '../types'
import CreatePickFields from './CreatePickFields'

const CreatePickForm = ({ onSubmit, actions }: CreatePickFormProps) => {
  const _T = useT()
  const methods = useForm<CreatePickFormValues>({
    defaultValues: {
      betType: 'single',
      betAmount: '',
      quota: '',
      outcome: 'pending',
      placedAt: '',
      legs: [{ description: '', quota: '' }],
    },
  })

  useEffect(() => {
    methods.reset()
  }, [methods])

  return (
    <FormProvider {...methods}>
      <form
        className="create-pick-form"
        onSubmit={methods.handleSubmit((values) => onSubmit(values))}
      >
        <CreatePickFields />
        {actions ? (
          actions
        ) : (
          <div className="create-pick-actions">
            <button type="submit" className="create-pick-button create-pick-button-primary">
              {_T('Save pick')}
            </button>
          </div>
        )}
      </form>
    </FormProvider>
  )
}

export default CreatePickForm
