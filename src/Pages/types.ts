import type { ReactNode } from "react"

export type BetType = 'single' | 'parlay'
export type OutComeType = 'win' | 'loss' | 'pending'

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
  legs: Array<{
    description: string
    quota: string
  }>
}

export type CreatePickFormProps = {
  onSubmit: (values: CreatePickFormValues) => void
  actions?: ReactNode
}