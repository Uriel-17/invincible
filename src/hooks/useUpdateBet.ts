import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { updateBet } from 'src/services/database'
import type { BetRecord } from 'src/types/electron'
import type { CreateBetError, UpdateBetVariables } from 'src/types/bets'
import type { UseUpdateBetOptions } from 'src/types/mutations'
import { BETS_QC_KEY, BANKROLL_QC_KEY, BANKROLL_HISTORY_QC_KEY } from 'src/queryKeys'

export function useUpdateBet(options?: UseUpdateBetOptions) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation<BetRecord, CreateBetError, UpdateBetVariables>({
    mutationFn: async ({ betId, outcome, netGain, cashout }) => {
      try {
        return await updateBet(betId, { outcome, netGain, cashout })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('Unknown error occurred')
        throw { message: errorMessage } as CreateBetError
      }
    },
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: [BETS_QC_KEY] })
      void queryClient.invalidateQueries({ queryKey: [BANKROLL_QC_KEY] })
      void queryClient.invalidateQueries({ queryKey: [BANKROLL_HISTORY_QC_KEY] })
      options?.onSuccess?.(...args)
    },
    onError: options?.onError,
  })
}
