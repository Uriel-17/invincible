import { FormProvider, useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { initializeUser } from 'src/services/database'
import { useT } from 'src/hooks/useT'
import TextField from 'src/Components/Form/TextField'
import { getUsernameValidation, getStartingBankrollValidation } from './onboardingFieldValidations'
import { FIRST_LAUNCH_QC_KEY } from 'src/queryKeys'
import './Styles/OnboardingModal.css'

interface OnboardingFormValues {
  username: string
  startingBankroll: string
}

interface OnboardingModalProps {
  isOpen: boolean
  onBack?: () => void
}

const OnboardingModal = ({ isOpen, onBack }: OnboardingModalProps) => {
  const _T = useT()
  const queryClient = useQueryClient()

  const methods = useForm<OnboardingFormValues>({
    mode: 'onChange',
    defaultValues: {
      username: '',
      startingBankroll: '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: OnboardingFormValues) => {
      const bankroll = parseFloat(values.startingBankroll)
      await initializeUser(values.username, bankroll)
    },
    onSuccess: () => {
      // Invalidate first launch query to hide modal
      queryClient.invalidateQueries({ queryKey: [FIRST_LAUNCH_QC_KEY] })
      alert(_T('Welcome! Your account has been set up successfully.'))
    },
    onError: (error: Error) => {
      alert(_T('Error setting up account: ') + error.message)
    },
  })

  if (!isOpen) {
    return null
  }

  const onSubmit = (values: OnboardingFormValues) => {
    mutation.mutate(values)
  }

  return (
    <div className="onboarding-overlay" role="presentation">
      <div
        className="onboarding-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <div className="onboarding-header">
          {onBack && (
            <button
              type="button"
              className="onboarding-back-button"
              onClick={onBack}
              aria-label="Go back to language selection"
            >
              <ArrowLeftIcon />
            </button>
          )}
          <h2 id="onboarding-title">{_T('Welcome to Invincible!')}</h2>
          <p>{_T("Let's set up your betting tracker.")}</p>
          {mutation.isError && mutation.error && (
            <div className="onboarding-error">
              {_T('Error: ')} {mutation.error.message}
            </div>
          )}
        </div>

        <FormProvider {...methods}>
          <form className="onboarding-form" onSubmit={methods.handleSubmit(onSubmit)}>
            <TextField
              name="username"
              label={_T('Username')}
              {...getUsernameValidation()}
              fieldClassName="onboarding-field"
              errorClassName="onboarding-field-error"
            />

            <TextField
              name="startingBankroll"
              label={_T('Starting Bankroll')}
              {...getStartingBankrollValidation()}
              fieldClassName="onboarding-field"
              errorClassName="onboarding-field-error"
            />

            <div className="onboarding-actions">
              <button
                type="submit"
                className="onboarding-button onboarding-button-primary"
                disabled={mutation.isPending || !methods.formState.isValid}
              >
                {mutation.isPending ? _T('Setting up...') : _T('Get Started')}
              </button>
            </div>
          </form>
        </FormProvider>

        {mutation.isPending && (
          <div className="onboarding-loading">
            {_T('Setting up your account...')}
          </div>
        )}
      </div>
    </div>
  )
}

export default OnboardingModal

