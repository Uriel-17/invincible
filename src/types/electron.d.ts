// TypeScript definitions for Electron API exposed via preload script

export interface BetRecord {
  id: string
  bet_type: 'single' | 'parlay'
  outcome: 'win' | 'loss' | 'pending' | 'push' | 'cashout'
  placed_at: string
  bet_amount: number
  quota: string
  market: string | null
  selection: string | null
  potential_gains: number
  cashout_amount: number | null
  net_gain: number
  notes: string | null
  created_at: string
  updated_at: string
  month_key: string
  is_archived: number
  legs?: ParlayLeg[]
}

export interface ParlayLeg {
  id: string
  bet_id: string
  leg_index: number
  description: string
  market: string
  quota: string
  created_at: string
}

export interface BetFilters {
  monthKey?: string
  isArchived?: boolean
  outcome?: 'win' | 'loss' | 'pending' | 'push' | 'cashout'
}

export interface DatabaseResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ElectronAPI {
  database: {
    createBet: (betData: unknown) => Promise<DatabaseResponse<BetRecord>>
    getBets: (filters?: BetFilters) => Promise<DatabaseResponse<BetRecord[]>>
    getBetById: (betId: string) => Promise<DatabaseResponse<BetRecord>>
    getCurrentMonthKey: () => Promise<DatabaseResponse<string>>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}

