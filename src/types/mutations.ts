import { type UseMutationOptions } from '@tanstack/react-query'
import type { BetRecord } from './electron'
import type { CreateBetFormValues, CreateBetError, UpdateBetVariables } from './bets'

export type UseCreateBetOptions = Omit<
  UseMutationOptions<BetRecord, CreateBetError, CreateBetFormValues>,
  'mutationFn'
>

export type UseUpdateBetOptions = Omit<
  UseMutationOptions<BetRecord, CreateBetError, UpdateBetVariables>,
  'mutationFn'
>

