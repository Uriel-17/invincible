import type { ReactNode } from 'react'
import type { CreateBetFormValues } from 'src/types/bets'

export interface CreatePickModalProps {
  isOpen: boolean
  onClose: () => void
}

export type CreatePickFormProps = {
  onSubmit: (values: CreateBetFormValues) => void
  actions?: ReactNode
}