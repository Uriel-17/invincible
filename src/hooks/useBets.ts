import { useQuery } from '@tanstack/react-query'
import { getBets } from 'src/services/database'
import { BETS_QC_KEY } from 'src/queryKeys'

export function useBets() {
  return useQuery({
    queryKey: [BETS_QC_KEY],
    queryFn: () => getBets(),
    staleTime: 30000,
  })
}

