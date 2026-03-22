import { CaretUpIcon, CaretDownIcon } from '@radix-ui/react-icons'
import { useT } from 'src/hooks/useT'
import { BETS_COLUMNS, type SortKey, type SortDir } from './DashboardBetsTableColumns'
import { handleSort } from './DashboardBetsTableUtils'

type Props = {
  sortKey: SortKey
  sortDir: SortDir
  setSortKey: (key: SortKey) => void
  setSortDir: (dir: SortDir) => void
}

const DashboardBetsTableHeaderRow = ({ sortKey, sortDir, setSortKey, setSortDir }: Props) => {
  const t = useT()

  return (
    <tr>
      {BETS_COLUMNS.map((col) => (
        <th
          key={col.label}
          className={[
            col.sortKey ? 'dashboard-bets-th--sortable' : '',
            col.resizable ? 'dashboard-bets-th--resizable' : '',
          ].filter(Boolean).join(' ') || undefined}
          onClick={col.sortKey ? () => handleSort({ column: col.sortKey!, current: { sortKey, sortDir }, setSortKey, setSortDir }) : undefined}
        >
          <span className="dashboard-bets-th-content">
            {t(col.label)}
            {col.sortKey && (
              <span className="dashboard-bets-sort-icon">
                {sortKey === col.sortKey
                  ? sortDir === 'asc' ? <CaretUpIcon /> : <CaretDownIcon />
                  : <span className="dashboard-bets-sort-icon--inactive">↕</span>
                }
              </span>
            )}
          </span>
        </th>
      ))}
    </tr>
  )
}

export default DashboardBetsTableHeaderRow
