import { useMutation } from '@tanstack/react-query'
import { createBet } from 'src/services/database'
import type { CreateBetFormValues, CreateBetError } from 'src/types/bets'
import type { BetRecord } from 'src/types/electron'
import type { UseCreateBetOptions } from 'src/types/mutations'

export function useCreateBet(options?: UseCreateBetOptions) {
  return useMutation<BetRecord, CreateBetError, CreateBetFormValues>({
    mutationFn: async (formValues: CreateBetFormValues) => {
      try {
        console.log('📝 Submitting bet to database...', formValues)
        const savedBet = await createBet(formValues)
        console.log('✅ Bet saved successfully!', savedBet)
        return savedBet
      } catch (err) {
        console.error('❌ Error saving bet:', err)
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'

        // Extract error code if it exists
        let errorCode: string | undefined
        if (err instanceof Error && 'code' in err) {
          const errorWithCode = err as Error & { code: unknown }
          errorCode = typeof errorWithCode.code === 'string' ? errorWithCode.code : undefined
        }

        throw {
          message: errorMessage,
          code: errorCode
        } as CreateBetError
      }
    },
    ...options
  })
}

export function isCreateBetError(error: unknown): error is CreateBetError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as CreateBetError).message === 'string'
  )
}
