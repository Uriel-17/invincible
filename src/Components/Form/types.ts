export type SelectOption = {
  label: string
  value: string
}

export type SelectFieldProps = {
  name: string
  label: string
  options: SelectOption[]
  requiredMessage?: string
  fieldClassName?: string
  errorClassName?: string
}

export type DateFieldProps = {
  name: string
  label: string
  requiredMessage?: string
  fieldClassName?: string
  errorClassName?: string
}

export type TextFieldProps = {
  name: string
  label: string
  type?: 'text' | 'number' | 'email' | 'password'
  step?: string
  placeholder?: string
  requiredMessage?: string
  fieldClassName?: string
  errorClassName?: string
}
