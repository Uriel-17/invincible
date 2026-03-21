export type SortKey = 'placed_at' | 'quota' | 'outcome' | 'bet_amount' | 'net_gain'
export type SortDir = 'asc' | 'desc'

export interface BetsColumn {
  label: string
  sortKey?: SortKey
  width: string
}

export const BETS_COLUMNS: BetsColumn[] = [
  { label: 'Placed at', sortKey: 'placed_at', width: '10%' },
  { label: 'Bet Type', width: '8%' },
  { label: 'Event', width: 'auto' },
  { label: 'Market', width: '14%' },
  { label: 'Odds', sortKey: 'quota', width: '6%' },
  { label: 'Result', sortKey: 'outcome', width: '9%' },
  { label: 'Stake', sortKey: 'bet_amount', width: '9%' },
  { label: 'Profit/Loss', sortKey: 'net_gain', width: '10%' },
  { label: 'Eye Log', width: '5%' },
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
