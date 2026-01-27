import type { ReactNode } from "react"

export type BetType = 'single' | 'parlay'
export type OutComeType = 'win' | 'loss' | 'push' | 'cashout' | 'pending'

export interface CreatePickModalProps {
  isOpen: boolean
  onClose: () => void
}

export interface CreatePickFormValues {
  betType: BetType
  betAmount: string
  quota: string
  outcome: OutComeType
  placedAt: string
  market: string
  selection: string
  potentialGains: string
  notes: string
  cashout?: string
  netGain: string
  legs: Array<{
    description: string
    quota: string
    market: string
  }>
}

export type CreatePickFormProps = {
  onSubmit: (values: CreatePickFormValues) => void
  actions?: ReactNode
}