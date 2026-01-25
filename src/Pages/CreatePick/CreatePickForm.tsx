import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FormProvider, useForm } from 'react-hook-form'
import type { CreatePickFormProps, CreatePickFormValues } from '../types'
import CreatePickFields from './CreatePickFields'

const CreatePickForm = ({ onSubmit, actions }: CreatePickFormProps) => {
  const { t } = useTranslation()
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
              {t('savePick')}
            </button>
          </div>
        )}
      </form>
    </FormProvider>
  )
}

export default CreatePickForm
