import { FormProvider, useForm } from 'react-hook-form'
import { useT } from 'src/hooks/useT'
import { useSaveSettings } from 'src/hooks/useSaveSettings'
import { useBankroll } from 'src/hooks/useBankroll'
import type { SettingsData } from 'src/hooks/useSettings'
import TextField from 'src/Components/Form/TextField'
import { getUsernameValidation } from './settingsFieldValidations'

interface SettingsFormProps {
  initialData: SettingsData
}

const SettingsForm = ({ initialData }: SettingsFormProps) => {
  const _T = useT()
  const mutation = useSaveSettings()
  const { data: currentBankroll, formatCurrency } = useBankroll()

  const methods = useForm<SettingsData>({
    mode: 'onChange',
    defaultValues: initialData,
  })

  const onSubmit = (values: SettingsData) => {
    mutation.mutate(values, {
      onSuccess: () => {
        alert(_T('Settings saved successfully!'))
      },
      onError: (error: Error) => {
        alert(_T('Error saving settings: ') + error.message)
      },
    })
  }

  return (
    <FormProvider {...methods}>
      <form className="settings-form" onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="settings-section">
          <h3 className="settings-section-title">{_T('User Information')}</h3>
          <TextField
            name="username"
            label={_T('Username')}
            {...getUsernameValidation()}
            fieldClassName="settings-field"
            errorClassName="settings-field-error"
          />
          <div className="settings-field">
            <span>{_T('Current Bankroll')}</span>
            <div className="settings-bankroll-display">
              {currentBankroll !== undefined ? formatCurrency(currentBankroll) : _T('Loading...')}
            </div>
            <span className="settings-field-hint">
              {_T('Your bankroll is calculated from your betting activity.')}
            </span>
          </div>
        </div>
        <div className="settings-section">
          <h3 className="settings-section-title">{_T('Preferences')}</h3>
          <label className="settings-field">
            <span>{_T('Language')}</span>
            <select {...methods.register('language')}>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </label>
          <label className="settings-field">
            <span>{_T('Theme')}</span>
            <div className="settings-theme-options">
              <label className="settings-radio-option">
                <input
                  type="radio"
                  value="light"
                  {...methods.register('theme')}
                />
                <span>{_T('Light')}</span>
              </label>
              <label className="settings-radio-option">
                <input
                  type="radio"
                  value="dark"
                  {...methods.register('theme')}
                />
                <span>{_T('Dark')}</span>
              </label>
            </div>
          </label>
        </div>
        <div className="settings-actions">
          <button
            type="submit"
            className="settings-button settings-button-primary"
            disabled={mutation.isPending || !methods.formState.isValid}
          >
            {mutation.isPending ? _T('Saving...') : _T('Save Settings')}
          </button>
        </div>
        {mutation.isError && mutation.error && (
          <div className="settings-error">
            {_T('Error: ')} {mutation.error.message}
          </div>
        )}
      </form>
    </FormProvider>
  )
}

export default SettingsForm