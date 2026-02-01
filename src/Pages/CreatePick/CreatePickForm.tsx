import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import type { CreatePickFormProps } from 'src/Pages/types'
import type { CreateBetFormValues } from 'src/types/bets'
import CreatePickFields from 'src/Pages/CreatePick/CreatePickFields'

const CreatePickForm = ({ onSubmit, actions }: CreatePickFormProps) => {
  const methods = useForm<CreateBetFormValues>({
    mode: 'onChange',
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
