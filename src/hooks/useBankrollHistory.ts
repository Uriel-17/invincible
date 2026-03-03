import { useQuery } from '@tanstack/react-query'
import { getElectronAPI } from 'src/services/database'
import { BANKROLL_HISTORY_QC_KEY } from 'src/queryKeys'
import type { BankrollSnapshot } from 'src/types/electron'

export function useBankrollHistory() {
  const query = useQuery<BankrollSnapshot[]>({
    queryKey: [BANKROLL_HISTORY_QC_KEY],
    queryFn: async () => {
      const api = getElectronAPI()
      const response = await api.database.getBankrollHistory()

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get bankroll history')
      }

      return response.data
    },
    staleTime: 30000, // 30 seconds
  })

  return query
}

