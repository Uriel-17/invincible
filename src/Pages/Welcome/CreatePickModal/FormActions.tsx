import { useT } from 'src/hooks/useT'
import { useFormContext } from 'react-hook-form'

type FormActionsProps = {
  onClose: () => void
}

const FormActions = ({ onClose }: FormActionsProps) => {
  const _T = useT()
  const { formState: { isValid } } = useFormContext()

  return (
    <div className="create-pick-actions">
      <button type="button" className="create-pick-button" onClick={onClose}>
        {_T('Cancel')}
      </button>
      <button
        type="submit"
        className="create-pick-button create-pick-button-primary"
        disabled={!isValid}
      >
        {_T('Save pick')}
      </button>
    </div>
  )
}

export default FormActions

