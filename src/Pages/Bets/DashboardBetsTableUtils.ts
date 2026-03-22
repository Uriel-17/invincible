import type { BetRecord } from 'src/types/electron'
import type { SortKey, SortDir } from './DashboardBetsTableColumns'

export interface SortState {
  sortKey: SortKey
  sortDir: SortDir
}

export interface HandleSortParams {
  column: SortKey
  current: SortState
  setSortKey: (key: SortKey) => void
  setSortDir: (dir: SortDir) => void
}

export interface SortBetsParams {
  bets: BetRecord[]
  sortKey: SortKey
  sortDir: SortDir
}

export const handleSort = ({ column, current, setSortKey, setSortDir }: HandleSortParams): void => {
  if (current.sortKey === column) {
    setSortDir(current.sortDir === 'asc' ? 'desc' : 'asc')
  } else {
    setSortKey(column)
    setSortDir('desc')
  }
}

export const sortBets = ({ bets, sortKey, sortDir }: SortBetsParams): BetRecord[] => {
  return [...bets].sort((a, b) => {
    let cmp = 0
    if (sortKey === 'placed_at' || sortKey === 'outcome') {
      cmp = a[sortKey].localeCompare(b[sortKey])
    } else {
      cmp = (a[sortKey] as number) - (b[sortKey] as number)
    }
    return sortDir === 'asc' ? cmp : -cmp
  })
}
