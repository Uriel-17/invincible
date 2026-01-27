import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import type { CreatePickFormProps, CreatePickFormValues } from '../types'
import CreatePickFields from './CreatePickFields'

const CreatePickForm = ({ onSubmit, actions }: CreatePickFormProps) => {
  const methods = useForm<CreatePickFormValues>({
    defaultValues: {
      betType: 'single',
      betAmount: '',
      quota: '',
      outcome: 'pending',
      placedAt: '',
      market: '',
      selection: '',
      potentialGains: '',
      notes: '',
      cashout: '',
      netGain: '',
      legs: [{ description: '', quota: '', market: '' }],
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
        {actions ?? null}
      </form>
    </FormProvider>
  )
}

export default CreatePickForm
