import { useFormContext } from 'react-hook-form'
import type { TextFieldProps } from './types'

const TextField = ({
  name,
  label,
  type = 'text',
  step,
  placeholder,
  requiredMessage,
  fieldClassName = 'create-pick-field',
  errorClassName = 'create-pick-error',
}: TextFieldProps) => {
  const { register, formState: { errors } } = useFormContext()
  const error = (errors as Record<string, { message?: string }>)[name]?.message
  const rules = requiredMessage ? { required: requiredMessage } : undefined

  return (
    <label className={fieldClassName}>
      <span>{label}</span>
      <input
        type={type}
        step={step}
        placeholder={placeholder}
        {...register(name, rules)}
        required={Boolean(requiredMessage)}
      />
      {error ? <span className={errorClassName}>{error}</span> : null}
    </label>
  )
}

export default TextField
