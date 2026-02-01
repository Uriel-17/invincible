import { type UseMutationOptions } from '@tanstack/react-query'
import type { BetRecord } from './electron'
import type { CreateBetFormValues, CreateBetError } from './bets'

export type UseCreateBetOptions = Omit<
  UseMutationOptions<BetRecord, CreateBetError, CreateBetFormValues>,
  'mutationFn'
>

