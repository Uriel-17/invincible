/**
 * Utility functions for building form validation rules
 */

export type NumericValidationRule = {
  value: number
  message: string
}

export type PatternValidationRule = {
  value: RegExp
  message: string
}

export type ValidationRules = {
  required?: string
  min?: NumericValidationRule
  max?: NumericValidationRule
  minLength?: NumericValidationRule
  maxLength?: NumericValidationRule
  pattern?: PatternValidationRule
}

export type ValidationConfig = {
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
}

/**
 * Build validation rules object from validation configuration
 * Converts verbose validation props into react-hook-form rules format
 * 
 * @param config - Validation configuration object
 * @returns Validation rules object for react-hook-form
 * 
 * @example
 * const rules = buildValidationRules({
 *   requiredMessage: 'This field is required',
 *   min: 0.01,
 *   minMessage: 'Must be greater than 0',
 *   pattern: /^\d+$/,
 *   patternMessage: 'Must be a number'
 * })
 * // Returns: {
 * //   required: 'This field is required',
 * //   min: { value: 0.01, message: 'Must be greater than 0' },
 * //   pattern: { value: /^\d+$/, message: 'Must be a number' }
 * // }
 */
export const buildValidationRules = (config: ValidationConfig): ValidationRules => {
  const rules: ValidationRules = {}

  // Add required rule
  if (config.requiredMessage) {
    rules.required = config.requiredMessage
  }

  // Add min rule
  if (config.min !== undefined && config.minMessage) {
    rules.min = { value: config.min, message: config.minMessage }
  }

  // Add max rule
  if (config.max !== undefined && config.maxMessage) {
    rules.max = { value: config.max, message: config.maxMessage }
  }

  // Add minLength rule
  if (config.minLength !== undefined && config.minLengthMessage) {
    rules.minLength = { value: config.minLength, message: config.minLengthMessage }
  }

  // Add maxLength rule
  if (config.maxLength !== undefined && config.maxLengthMessage) {
    rules.maxLength = { value: config.maxLength, message: config.maxLengthMessage }
  }

  // Add pattern rule
  if (config.pattern && config.patternMessage) {
    rules.pattern = { value: config.pattern, message: config.patternMessage }
  }

  return rules
}
