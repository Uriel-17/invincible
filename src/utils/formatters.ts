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
 * Format bankroll trend with appropriate sign and currency
 * @param netProfit - The net profit/loss amount
 * @param language - The current language code
 * @returns Formatted trend string (e.g., "+$245.00 this month" or "-$150.00 this month")
 */
export function formatBankrollTrend(netProfit: number, language: string = 'en'): string {
  const formattedAmount = formatCurrency(Math.abs(netProfit), language)
  const sign = netProfit >= 0 ? '+' : '-'
  
  return `${sign}${formattedAmount}`
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
 * Format win/loss record as a compact string
 * @param wins - Number of wins
 * @param losses - Number of losses
 * @param pushes - Number of pushes
 * @returns Formatted record string (e.g., "8W-4L-1P" or "8W-4L" if no pushes)
 */
export function formatWinLossRecord(wins: number, losses: number, pushes: number): string {
  const pushText = pushes > 0 ? `-${pushes}P` : ''
  return `${wins}W-${losses}L${pushText}`
}

/**
 * Calculate win rate percentage
 * @param wins - Number of wins
 * @param losses - Number of losses
 * @returns Win rate as a percentage (0-100)
 */
export function calculateWinRate(wins: number, losses: number): number {
  const totalSettled = wins + losses
  if (totalSettled === 0) return 0
  return (wins / totalSettled) * 100
}

/**
 * Format win rate as a percentage string
 * @param wins - Number of wins
 * @param losses - Number of losses
 * @returns Formatted win rate string (e.g., "66.7%")
 */
export function formatWinRate(wins: number, losses: number): string {
  const winRate = calculateWinRate(wins, losses)
  return `${winRate.toFixed(1)}%`
}

/**
 * Determine CSS class for trend based on value
 * @param value - The value to evaluate (positive/negative)
 * @returns CSS class name for styling
 */
export function getTrendClass(value: number): string {
  if (value > 0) return 'welcome-page-stat-trend--positive'
  if (value < 0) return 'welcome-page-stat-trend--negative'
  return 'welcome-page-stat-trend--neutral'
}

/**
 * Calculate risk level based on pending amount vs bankroll
 * @param pendingAmount - Total amount in pending bets
 * @param bankroll - Current bankroll amount
 * @returns Risk level ('Low', 'Moderate', or 'High')
 */
export function calculateRiskLevel(pendingAmount: number, bankroll: number): 'Low' | 'Moderate' | 'High' {
  if (bankroll === 0) return 'Low'
  
  const riskPercentage = (pendingAmount / bankroll) * 100
  
  if (riskPercentage < 5) return 'Low'
  if (riskPercentage < 15) return 'Moderate'
  return 'High'
}

/**
 * Format a date string to a localized short date
 * @param dateString - ISO date string
 * @param language - The current language code
 * @returns Formatted date string (e.g., "Jan 15, 2024" or "15 ene 2024")
 */
export function formatShortDate(dateString: string, language: string = 'en'): string {
  const date = new Date(dateString)
  const locale = language === 'es' ? 'es-ES' : 'en-US'
  
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format a date string to a relative time (e.g., "2 days ago")
 * @param dateString - ISO date string
 * @param language - The current language code
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string, language: string = 'en'): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return language === 'es' ? 'Hoy' : 'Today'
  if (diffDays === 1) return language === 'es' ? 'Ayer' : 'Yesterday'
  if (diffDays < 7) return language === 'es' ? `Hace ${diffDays} días` : `${diffDays} days ago`
  
  return formatShortDate(dateString, language)
}

