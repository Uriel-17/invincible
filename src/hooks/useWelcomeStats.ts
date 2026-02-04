import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
import { formatCurrency as formatCurrencyUtil, calculateRiskLevel } from 'src/utils/formatters'
import { useBankroll } from './useBankroll'
import { useMonthlyStats } from './useMonthlyStats'
import { usePendingBets } from './usePendingBets'

export function useWelcomeStats() {
  const { i18n } = useTranslation()
  const language = i18n.language

  const { data: bankroll, isLoading: bankrollLoading, error: bankrollError } = useBankroll()
  const { data: monthlyStats, isLoading: statsLoading, error: statsError } = useMonthlyStats()
  const { data: pendingBets, isLoading: pendingLoading, error: pendingError } = usePendingBets()

  // Log errors for debugging
  if (bankrollError) console.error('❌ Bankroll error:', bankrollError)
  if (statsError) console.error('❌ Monthly stats error:', statsError)
  if (pendingError) console.error('❌ Pending bets error:', pendingError)

  const isLoading = bankrollLoading || statsLoading || pendingLoading

  // Calculate risk level using utility function
  const totalPendingAmount = pendingBets?.reduce((sum, bet) => sum + bet.bet_amount, 0) || 0
  const riskLevel = calculateRiskLevel(totalPendingAmount, bankroll || 0)
  const riskPercentage = bankroll ? (totalPendingAmount / bankroll) * 100 : 0

  // Create bound formatCurrency function with language already applied
  // Use useCallback to prevent unnecessary re-renders
  const formatCurrency = useCallback(
    (amount: number) => formatCurrencyUtil(amount, language),
    [language]
  )

  return {
    bankroll: bankroll || 0,
    monthlyStats: monthlyStats || {
      monthKey: '',
      total_bets: 0,
      total_wins: 0,
      total_losses: 0,
      total_pushes: 0,
      total_cashouts: 0,
      net_profit: 0,
      total_wagered: 0,
      roi: 0,
      startingBankroll: 0,
      endingBankroll: 0,
    },
    pendingBets: pendingBets || [],
    totalPendingAmount,
    riskLevel,
    riskPercentage,
    isLoading,
    formatCurrency,
  }
}
