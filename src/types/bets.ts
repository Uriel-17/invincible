export type BetType = 'single' | 'parlay'
export type OutcomeType = 'win' | 'loss' | 'push' | 'cashout' | 'pending'
export interface ParlayLegFormData {
  description: string
  quota: string
  market: string
}

export interface CreateBetFormValues {
  betType: BetType
  betAmount: string
  quota: string
  outcome: OutcomeType
  placedAt: string
  market: string
  selection: string
  potentialGains: string
  notes: string
  cashout?: string
  netGain: string
  legs: ParlayLegFormData[]
}

export interface BetFilters {
  monthKey?: string
  isArchived?: boolean
  outcome?: OutcomeType
}

export interface BetStatistics {
  totalBets: number
  totalWins: number
  totalLosses: number
  totalPushes: number
  totalCashouts: number
  totalPending: number
  netProfit: number
  roi: number
  winRate: number
}

export interface MonthlyBetSummary {
  monthKey: string
  startDate: string
  endDate: string
  startingBankroll: number
  endingBankroll: number
  statistics: BetStatistics
  isActive: boolean
}

export interface CreateBetError {
  message: string
  code?: string
}

export interface UpdateBetVariables {
  betId: string
  outcome: OutcomeType
  netGain: string
  cashout?: string
}
