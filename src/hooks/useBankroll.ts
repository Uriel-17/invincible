import { useQuery } from '@tanstack/react-query'
import { getElectronAPI } from 'src/services/database'
import { BANKROLL_QC_KEY } from 'src/queryKeys'

export function useBankroll() {
  return useQuery({
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
}
