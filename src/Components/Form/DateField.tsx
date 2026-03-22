import { useFormContext } from 'react-hook-form'
import type { DateFieldProps } from './types'

const DateField = ({
  name,
  label,
  requiredMessage,
  fieldClassName = 'create-pick-field',
  errorClassName = 'create-pick-error',
}: DateFieldProps) => {
  const { register, formState: { errors } } = useFormContext()
  const error = (errors as Record<string, { message?: string }>)[name]?.message
  const rules = requiredMessage ? { required: requiredMessage } : undefined

  return (
    <label className={fieldClassName}>
      <span>{label}{requiredMessage ? <span className="required-asterisk"> *</span> : null}</span>
      <input type="date" {...register(name, rules)} required={Boolean(requiredMessage)} />
      {error ? <span className={errorClassName}>{error}</span> : null}
    </label>
  )
}

export default DateField
