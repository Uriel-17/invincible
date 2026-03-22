/**
 * Centralized formatting utilities for currency, statistics, and display values
 * Supports internationalization (i18n) for multi-language support
 */

const CURRENCY_SYMBOLS: Record<string, string> = {
  en: '$', // USD
  es: '$', // MXN (Mexican Peso)
}

function getCurrencySymbol(language: string): string {
  return CURRENCY_SYMBOLS[language] || '$' // Default to USD
}

/**
 * Format a number as currency with appropriate symbol and decimal places
 * @param amount - The amount to format
 * @param language - The current language code (e.g., 'en', 'es')
 * @returns Formatted currency string (e.g., "$1,245.00" for en-US or "$1,245.00" for es-MX)
 */
export function formatCurrency(amount: number, language: string = 'en'): string {
  const symbol = getCurrencySymbol(language)

  // Format number with locale-specific formatting
  const formatted = amount.toLocaleString(language === 'es' ? 'es-MX' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return `${symbol}${formatted}`
}

/**
 * Format ROI percentage with appropriate sign
 * @param roi - The ROI percentage value
 * @returns Formatted ROI string (e.g., "+18.3%" or "-12.5%")
 */
export function formatROI(roi: number): string {
  const sign = roi >= 0 ? '+' : ''
  return `${sign}${roi.toFixed(1)}%`
}

/**
 * Format a date string to a localized short date
 * @param dateString - ISO date string
 * @param language - The current language code
 * @returns Formatted date string (e.g., "Jan 15, 2024" or "15 ene 2024")
 */
export function formatShortDate(dateString: string, language: string = 'en'): string {
  const date = new Date(dateString)
  const locale = language === 'es' ? 'es-MX' : 'en-US'

  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
