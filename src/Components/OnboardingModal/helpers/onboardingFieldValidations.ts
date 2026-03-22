import { t } from 'src/i18n'

export type FieldValidationConfig = {
  type?: 'text' | 'number' | 'email' | 'password'
  step?: string
  placeholder?: string
  requiredMessage?: string
  min?: number
  minMessage?: string
  max?: number
  maxMessage?: string
  minLength?: number
  minLengthMessage?: string
  maxLength?: number
  maxLengthMessage?: string
  pattern?: RegExp
  patternMessage?: string
  inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'
}

export const getUsernameValidation = (): FieldValidationConfig => ({
  type: 'text',
  requiredMessage: t('Username is required'),
  minLength: 2,
  minLengthMessage: t('Username must be at least 2 characters'),
  maxLength: 50,
  maxLengthMessage: t('Username must be at most 50 characters'),
})

export const getStartingBankrollValidation = (): FieldValidationConfig => ({
  type: 'text',
  inputMode: 'decimal',
  step: '0.01',
  requiredMessage: t('Starting bankroll is required'),
  pattern: /^\d+(\.\d+)?$/,
  patternMessage: t('Please enter a valid number'),
  min: 0.01,
  minMessage: t('Starting bankroll must be greater than 0'),
  max: 1_000_000,
  maxMessage: t('Amount cannot exceed 1,000,000'),
})

