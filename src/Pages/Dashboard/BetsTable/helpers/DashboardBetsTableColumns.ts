export type SortKey = 'placed_at' | 'quota' | 'outcome' | 'bet_amount' | 'net_gain'
export type SortDir = 'asc' | 'desc'

export interface BetsColumn {
  label: string
  sortKey?: SortKey
  width: string
}

export const BETS_COLUMNS: BetsColumn[] = [
  { label: 'Placed at', sortKey: 'placed_at', width: '110px' },
  { label: 'Bet Type', width: '70px' },
  { label: 'Event', width: '200px' },
  { label: 'Market', width: '140px' },
  { label: 'Odds', sortKey: 'quota', width: '60px' },
  { label: 'Result', sortKey: 'outcome', width: '80px' },
  { label: 'Stake', sortKey: 'bet_amount', width: '80px' },
  { label: 'Profit/Loss', sortKey: 'net_gain', width: '100px' },
  { label: 'Eye Log', width: '60px' },
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
