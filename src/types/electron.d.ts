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

export interface UpdateBetData {
  outcome: 'win' | 'loss' | 'pending' | 'push' | 'cashout'
  netGain: string
  cashout?: string
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

export interface InitializeUserData {
  username: string
  startingBankroll: number
}

export interface SetUserSettingResult {
  needsRecalculation: boolean
}

export interface RecalculateStatisticsResult {
  monthsRecalculated: number
}

export interface ClearAllDataResult {
  deletedRecords: number
}

export interface MonthlyStatistics {
  monthKey: string
  total_bets: number
  total_wins: number
  total_losses: number
  total_pushes: number
  total_cashouts: number
  net_profit: number
  total_wagered: number
  roi: number
  startingBankroll: number
  endingBankroll: number
}

export interface BankrollSnapshot {
  id: string
  month_key: string
  timestamp: string
  amount: number
  change_amount: number
  change_reason: 'initial' | 'bet_win' | 'bet_loss' | 'bet_cashout' | 'manual_adjustment' | 'month_start'
  bet_id: string | null
  notes: string | null
  created_at: string
}

export interface ElectronAPI {
  database: {
    createBet: (betData: unknown) => Promise<DatabaseResponse<BetRecord>>
    updateBet: (betId: string, updates: UpdateBetData) => Promise<DatabaseResponse<BetRecord>>
    getBets: (filters?: BetFilters) => Promise<DatabaseResponse<BetRecord[]>>
    getBetById: (betId: string) => Promise<DatabaseResponse<BetRecord>>
    getCurrentMonthKey: () => Promise<DatabaseResponse<string>>
    isFirstLaunch: () => Promise<DatabaseResponse<boolean>>
    getUserSetting: (key: string) => Promise<DatabaseResponse<string | null>>
    setUserSetting: (key: string, value: string) => Promise<DatabaseResponse<SetUserSettingResult>>
    initializeUser: (userData: InitializeUserData) => Promise<DatabaseResponse<void>>
    recalculateAllStatistics: () => Promise<DatabaseResponse<RecalculateStatisticsResult>>
    getCurrentBankroll: () => Promise<DatabaseResponse<number>>
    getBankrollHistory: () => Promise<DatabaseResponse<BankrollSnapshot[]>>
    updateMonthlyStatistics: (monthKey: string) => Promise<DatabaseResponse<MonthlyStatistics>>
    addFunds: (amount: number) => Promise<DatabaseResponse<void>>
    clearAllData: () => Promise<DatabaseResponse<ClearAllDataResult>>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}

