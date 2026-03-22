import { useFormContext } from 'react-hook-form'
import type { FieldErrors, FieldValues } from 'react-hook-form'
import type { TextFieldProps } from './types'
import { buildValidationRules } from './validationUtils'

const TextField = ({
  name,
  label,
  type = 'text',
  step,
  placeholder,
  requiredMessage,
  min,
  minMessage,
  max,
  maxMessage,
  minLength,
  minLengthMessage,
  maxLength,
  maxLengthMessage,
  pattern,
  patternMessage,
  inputMode,
  fieldClassName = 'create-pick-field',
  errorClassName = 'create-pick-error',
}: TextFieldProps) => {
  const { register, formState: { errors } } = useFormContext<FieldValues>()

  // Handle nested field errors (e.g., legs.0.quota)
  const getNestedError = (fieldName: string, fieldErrors: FieldErrors<FieldValues>) => {
    const parts = fieldName.split('.')
    let error: unknown = fieldErrors
    for (const part of parts) {
      if (!error || typeof error !== 'object') return undefined
      error = (error as Record<string, unknown>)[part]
    }
    if (!error || typeof error !== 'object') return undefined
    const message = (error as { message?: unknown }).message
    return typeof message === 'string' ? message : undefined
  }

  const error = getNestedError(name, errors)

  // Build validation rules using utility function
  const rules = buildValidationRules({
    requiredMessage,
    min,
    minMessage,
    max,
    maxMessage,
    minLength,
    minLengthMessage,
    maxLength,
    maxLengthMessage,
    pattern,
    patternMessage,
  })

  return (
    <label className={fieldClassName}>
      <span>{label}</span>
      <input
        type={type}
        step={step}
        placeholder={placeholder}
        inputMode={inputMode}
        {...register(name, rules)}
        required={Boolean(requiredMessage)}
      />
      {error ? <span className={errorClassName}>{error}</span> : null}
    </label>
  )
}

export default TextField
