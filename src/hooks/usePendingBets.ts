import { useQuery } from '@tanstack/react-query'
import { getBets } from 'src/services/database'
import { BETS_QC_KEY } from 'src/queryKeys'

export function usePendingBets() {
  return useQuery({
    queryKey: [BETS_QC_KEY, { outcome: 'pending' }],
    queryFn: () => getBets({ outcome: 'pending' }),
    staleTime: 30000, // 30 seconds
  })
}

