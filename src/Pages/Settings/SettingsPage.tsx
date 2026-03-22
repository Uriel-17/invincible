import { useT } from 'src/hooks/useT'
import { useSettings } from 'src/hooks/useSettings'
import SettingsForm from './SettingsForm'
import ClearDataButton from './ClearData/ClearDataButton'
import './helpers/SettingsPage.css'

const SettingsPage = () => {
  const _T = useT()
  const { data: settings, isLoading, isError, error } = useSettings()

  if (isLoading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          {_T('Loading settings...')}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="settings-page">
        <div className="settings-error">
          {_T('Error loading settings: ')} {error?.message}
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="settings-page">
        <div className="settings-error">
          {_T('No settings data available')}
        </div>
      </div>
    )
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1 className="settings-title">{_T('Settings')}</h1>
        <SettingsForm initialData={settings} />
        <ClearDataButton />
      </div>
    </div>
  )
}

export default SettingsPage

