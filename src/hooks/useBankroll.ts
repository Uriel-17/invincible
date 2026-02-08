import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
import { getElectronAPI } from 'src/services/database'
import { BANKROLL_QC_KEY } from 'src/queryKeys'
import { formatCurrency as formatCurrencyUtil } from 'src/utils/formatters'

export function useBankroll() {
  const { i18n } = useTranslation()
  const language = i18n.language

  const query = useQuery({
    queryKey: [BANKROLL_QC_KEY],
    queryFn: async () => {
      const api = getElectronAPI()
      const response = await api.database.getCurrentBankroll()

      if (!response.success || response.data === undefined) {
        throw new Error(response.error || 'Failed to get bankroll')
      }

      return response.data
    },
    staleTime: 30000, // 30 seconds
  })

  // Create bound formatCurrency function with language already applied
  // Use useCallback to prevent unnecessary re-renders
  const formatCurrency = useCallback(
    (amount: number) => formatCurrencyUtil(amount, language),
    [language]
  )

  return {
    ...query,
    formatCurrency,
  }
}
