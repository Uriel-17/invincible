import { EyeOpenIcon, CaretUpIcon, CaretDownIcon } from '@radix-ui/react-icons'
import { forwardRef, useMemo, useState } from 'react'
import { TableVirtuoso, type ScrollerProps, type TableComponents } from 'react-virtuoso'
import type { BetRecord } from 'src/types/electron'
import { formatCurrency, formatShortDate } from 'src/utils/formatters'
import {
  BETS_COLUMNS,
  BET_TYPE_LABEL_MAP,
  RESULT_CLASS_MAP,
  RESULT_LABEL_MAP,
  type SortKey,
} from './helpers/DashboardBetsTableColumns'
import { handleSort, sortBets } from './helpers/DashboardBetsTableUtils'
import './helpers/DashboardBetsTable.css'

type DashboardBetsTableProps = {
  bets: BetRecord[]
  language: string
  translate: (key: string) => string
  onOpenBetDetail: (betId: string) => void
}

const DashboardTable = ({ children, style }: React.ComponentPropsWithoutRef<'table'>) => (
  <table className="dashboard-bets-table" style={style}>
    <colgroup>
      {BETS_COLUMNS.map((col) => (
        <col key={col.label} style={col.width ? { width: col.width } : undefined} />
      ))}
    </colgroup>
    {children}
  </table>
)

const DashboardTableHead = forwardRef<HTMLTableSectionElement, React.ComponentPropsWithoutRef<'thead'>>(
  function DashboardTableHead({ children, style }, ref) {
    return <thead ref={ref} style={{ ...style, position: 'static' }}>{children}</thead>
  },
)

const DashboardTableBody = forwardRef<HTMLTableSectionElement, React.ComponentPropsWithoutRef<'tbody'> & { 'data-testid'?: string }>(
  function DashboardTableBody({ children, className, style, 'data-testid': dataTestId }, ref) {
    return (
      <tbody ref={ref} className={className} style={style} data-testid={dataTestId}>
        {children}
      </tbody>
    )
  },
)

const DashboardTableScroller = forwardRef<HTMLDivElement, ScrollerProps>(
  function DashboardTableScroller({ children, style, tabIndex, 'data-virtuoso-scroller': dataVirtuosoScroller }, ref) {
    return (
      <div
        ref={ref}
        className="dashboard-bets-scroller"
        style={style}
        tabIndex={tabIndex}
        data-testid="dashboard-bets-scroller"
        data-virtuoso-scroller={dataVirtuosoScroller}
      >
        {children}
      </div>
    )
  },
)

const TABLE_COMPONENTS = {
  Scroller: DashboardTableScroller,
  Table: DashboardTable,
  TableHead: DashboardTableHead,
  TableBody: DashboardTableBody,
} satisfies TableComponents<BetRecord>

const DashboardBetsTable = ({ bets, language, translate, onOpenBetDetail }: DashboardBetsTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>('placed_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sortedBets = useMemo(
    () => sortBets({ bets, sortKey, sortDir }),
    [bets, sortKey, sortDir],
  )

  if (bets.length === 0) {
    return <div className="dashboard-bets-empty">{translate('No bets found.')}</div>
  }

  return (
    <div className="dashboard-bets-table-wrapper">
      <TableVirtuoso
        data={sortedBets}
        style={{ height: '70vh' }}
        defaultItemHeight={44}
        increaseViewportBy={264}
        overscan={176}
        computeItemKey={(_, bet) => bet.id}
        components={TABLE_COMPONENTS}
        fixedHeaderContent={() => (
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
                  {translate(col.label)}
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
        )}
        itemContent={(index, bet) => {
          const isLastRow = index === sortedBets.length - 1
          const lastRowClassName = isLastRow ? 'dashboard-bets-cell--last-row' : undefined
          const profitClass = bet.net_gain > 0
            ? 'dashboard-bets-profit--positive'
            : bet.net_gain < 0
              ? 'dashboard-bets-profit--negative'
              : ''

          return (
            <>
              <td className={lastRowClassName}>{formatShortDate(bet.placed_at, language)}</td>
              <td className={lastRowClassName}>{translate(BET_TYPE_LABEL_MAP[bet.bet_type] || bet.bet_type)}</td>
              <td className={lastRowClassName}>{bet.selection || '—'}</td>
              <td className={lastRowClassName}>{bet.market || '—'}</td>
              <td className={lastRowClassName}>{bet.quota}</td>
              <td className={lastRowClassName}>
                <span className={RESULT_CLASS_MAP[bet.outcome] || ''}>
                  {translate(RESULT_LABEL_MAP[bet.outcome] || bet.outcome)}
                </span>
              </td>
              <td className={lastRowClassName}>{formatCurrency(bet.bet_amount, language)}</td>
              <td className={lastRowClassName}>
                <span className={profitClass}>{formatCurrency(bet.net_gain, language)}</span>
              </td>
              <td className={`dashboard-bets-td--action${lastRowClassName ? ` ${lastRowClassName}` : ''}`}>
                <button
                  type="button"
                  className="dashboard-bets-eye-btn"
                  onClick={() => onOpenBetDetail(bet.id)}
                  aria-label={translate('View bet details')}
                >
                  <EyeOpenIcon />
                </button>
              </td>
            </>
          )
        }}
      />
    </div>
  )
}

export default DashboardBetsTable
