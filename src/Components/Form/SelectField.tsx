import { useFormContext } from 'react-hook-form'
import type { SelectFieldProps } from './types'

const SelectField = ({
  name,
  label,
  options,
  requiredMessage,
  fieldClassName = 'create-pick-field',
  errorClassName = 'create-pick-error',
}: SelectFieldProps) => {
  const { register, formState: { errors } } = useFormContext()

  const error = (errors as Record<string, { message?: string }>)[name]?.message
  const rules = requiredMessage ? { required: requiredMessage } : undefined

  return (
    <label className={fieldClassName}>
      <span>{label}</span>
      <select {...register(name, rules)} required={Boolean(requiredMessage)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className={errorClassName}>{error}</span> : null}
    </label>
  )
}

export default SelectField
