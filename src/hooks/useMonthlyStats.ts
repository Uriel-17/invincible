import { useQuery } from '@tanstack/react-query'
import { getElectronAPI, getCurrentMonthKey } from 'src/services/database'
import { MONTHLY_STATS_QC_KEY } from 'src/queryKeys'

export function useMonthlyStats() {
  return useQuery({
    queryKey: [MONTHLY_STATS_QC_KEY],
    queryFn: async () => {
      const monthKey = await getCurrentMonthKey()
      const api = getElectronAPI()
      const response = await api.database.updateMonthlyStatistics(monthKey)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get monthly statistics')
      }

      return response.data
    },
    staleTime: 30000, // 30 seconds
  })
}
