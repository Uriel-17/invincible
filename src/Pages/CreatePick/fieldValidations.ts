/**
 * Field validation configurations for CreatePick form
 * Centralizes all validation rules, patterns, and error messages
 */

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
  pattern?: RegExp
  patternMessage?: string
  inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'
}

/**
 * Get validation configuration for bet amount field
 * Accepts positive decimals only (e.g., 12.50, 100, 25.99)
 */
export const getBetAmountValidation = (): FieldValidationConfig => ({
  type: 'text',
  inputMode: 'decimal',
  requiredMessage: t('This field is required.'),
  pattern: /^\d+(\.\d+)?$/,
  patternMessage: t('Bet amount must be a valid number'),
})

/**
 * Get validation configuration for quota field (American odds format)
 * Accepts integers with optional +/- sign (e.g., -110, +150, 200)
 */
export const getQuotaValidation = (): FieldValidationConfig => ({
  type: 'text',
  placeholder: t('e.g. -110'),
  requiredMessage: t('This field is required.'),
  pattern: /^[+-]?\d+$/,
  patternMessage: t('Quota must be a valid number (e.g., -110 or +150)'),
  inputMode: 'numeric',
})

/**
 * Get validation configuration for potential gains field
 * Accepts any number including negative decimals (e.g., 45.50, -12.25, 100)
 */
export const getPotentialGainsValidation = (): FieldValidationConfig => ({
  type: 'text',
  inputMode: 'decimal',
  requiredMessage: t('This field is required.'),
  pattern: /^-?\d+(\.\d+)?$/,
  patternMessage: t('Potential gains must be a valid number'),
})

/**
 * Get validation configuration for net gain field
 * Accepts any number including negative decimals (e.g., 33.75, -25.00, 100)
 */
export const getNetGainValidation = (): FieldValidationConfig => ({
  type: 'text',
  inputMode: 'decimal',
  requiredMessage: t('This field is required.'),
  pattern: /^-?\d+(\.\d+)?$/,
  patternMessage: t('Net gain must be a valid number'),
})

/**
 * Get validation configuration for cashout field
 * Accepts positive decimals only (e.g., 45.50, 100.00, 25)
 */
export const getCashoutValidation = (): FieldValidationConfig => ({
  type: 'text',
  inputMode: 'decimal',
  requiredMessage: t('This field is required.'),
  pattern: /^\d+(\.\d+)?$/,
  patternMessage: t('Cashout amount must be a valid number'),
})

/**
 * Get validation configuration for market field
 * Text field, required
 */
export const getMarketValidation = (): FieldValidationConfig => ({
  type: 'text',
  requiredMessage: t('This field is required.'),
})

/**
 * Get validation configuration for selection field
 * Text field, required
 */
export const getSelectionValidation = (): FieldValidationConfig => ({
  type: 'text',
  requiredMessage: t('This field is required.'),
})

/**
 * Get validation configuration for notes field
 * Text field, optional
 */
export const getNotesValidation = (): FieldValidationConfig => ({
  type: 'text',
})

/**
 * Get validation configuration for leg description field
 * Text field, required
 */
export const getLegDescriptionValidation = (): FieldValidationConfig => ({
  type: 'text',
  placeholder: t('Team vs Team'),
  requiredMessage: t('This field is required.'),
})

/**
 * Get validation configuration for leg market field
 * Text field, required
 */
export const getLegMarketValidation = (): FieldValidationConfig => ({
  type: 'text',
  requiredMessage: t('This field is required.'),
})

/**
 * Get validation configuration for leg quota field
 * Same as main quota field - American odds format
 */
export const getLegQuotaValidation = (): FieldValidationConfig => ({
  type: 'text',
  placeholder: t('e.g. -110'),
  requiredMessage: t('This field is required.'),
  pattern: /^[+-]?\d+$/,
  patternMessage: t('Quota must be a valid number (e.g., -110 or +150)'),
  inputMode: 'numeric',
})

