export type SortKey = 'placed_at' | 'quota' | 'outcome' | 'bet_amount' | 'net_gain'
export type SortDir = 'asc' | 'desc'
export type OutcomeFilter = 'all' | 'win' | 'loss' | 'pending' | 'cashout' | 'push'

export const OUTCOME_PILLS: { labelKey: string; value: OutcomeFilter }[] = [
  { labelKey: 'All', value: 'all' },
  { labelKey: 'Win', value: 'win' },
  { labelKey: 'Loss', value: 'loss' },
  { labelKey: 'Pending', value: 'pending' },
  { labelKey: 'Cashout', value: 'cashout' },
  { labelKey: 'Push', value: 'push' },
]

export interface BetsColumn {
  label: string
  sortKey?: SortKey
  resizable?: boolean
}

export const BETS_COLUMNS: BetsColumn[] = [
  { label: 'Placed at', sortKey: 'placed_at' },
  { label: 'Bet Type' },
  { label: 'Event', resizable: true },
  { label: 'Market', resizable: true },
  { label: 'Odds', sortKey: 'quota' },
  { label: 'Result', sortKey: 'outcome' },
  { label: 'Stake', sortKey: 'bet_amount' },
  { label: 'Profit/Loss', sortKey: 'net_gain' },
  { label: 'Details' },
]

export const RESULT_CLASS_MAP: Record<string, string> = {
  win: 'dashboard-bets-result--win',
  loss: 'dashboard-bets-result--loss',
  cashout: 'dashboard-bets-result--cashout',
  push: 'dashboard-bets-result--push',
  pending: 'dashboard-bets-result--pending',
}

export const RESULT_LABEL_MAP: Record<string, string> = {
  win: 'Win',
  loss: 'Loss',
  cashout: 'Cashout',
  push: 'Push',
  pending: 'Pending',
}

export const BET_TYPE_LABEL_MAP: Record<string, string> = {
  single: 'Single',
  parlay: 'Parlay',
}
