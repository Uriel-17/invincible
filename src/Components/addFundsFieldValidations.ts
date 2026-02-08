import { t } from 'src/i18n'
import type { FieldValidationConfig } from 'src/Components/onboardingFieldValidations'

export const getAddFundsAmountValidation = (): FieldValidationConfig => ({
  type: 'text',
  inputMode: 'decimal',
  step: '0.01',
  placeholder: '0.00',
  requiredMessage: t('Amount is required'),
  pattern: /^\d+(\.\d{1,2})?$/,
  patternMessage: t('Please enter a valid amount (e.g., 100 or 100.50)'),
  min: 0.01,
  minMessage: t('Amount must be at least 0.01'),
  max: 1000000,
  maxMessage: t('Amount cannot exceed 1,000,000'),
})

