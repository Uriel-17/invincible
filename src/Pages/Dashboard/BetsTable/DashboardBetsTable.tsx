import { useCallback, useMemo, useState } from 'react'
import { TableVirtuoso } from 'react-virtuoso'
import { useTranslation } from 'react-i18next'
import { useT } from 'src/hooks/useT'
import type { BetRecord } from 'src/types/electron'
import { OUTCOME_PILLS, type SortKey, type OutcomeFilter } from './helpers/DashboardBetsTableColumns'
import { sortBets, filterBets } from './helpers/DashboardBetsTableUtils'
import { TABLE_COMPONENTS } from './helpers/DashboardBetsTableComponents'
import DashboardBetsTableHeaderRow from './helpers/DashboardBetsTableHeaderRow'
import DashboardBetsTableRow from './helpers/DashboardBetsTableRow'
import './helpers/DashboardBetsTable.css'

type DashboardBetsTableProps = {
  bets: BetRecord[]
  onOpenBetDetail: (betId: string) => void
}

const DashboardBetsTable = ({ bets, onOpenBetDetail }: DashboardBetsTableProps) => {
  const t = useT()
  const { i18n } = useTranslation()
  const language = i18n.language
  const [sortKey, setSortKey] = useState<SortKey>('placed_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [search, setSearch] = useState('')
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('all')

  const visibleBets = useMemo(
    () => sortBets({ bets: filterBets({ bets, search, outcome: outcomeFilter }), sortKey, sortDir }),
    [bets, search, outcomeFilter, sortKey, sortDir],
  )

  const renderHeader = useCallback(
    () => (
      <DashboardBetsTableHeaderRow
        sortKey={sortKey}
        sortDir={sortDir}
        setSortKey={setSortKey}
        setSortDir={setSortDir}
      />
    ),
    [sortKey, sortDir],
  )

  const renderRow = useCallback(
    (index: number, bet: BetRecord) => (
      <DashboardBetsTableRow
        bet={bet}
        isLastRow={index === visibleBets.length - 1}
        language={language}
        onOpenBetDetail={onOpenBetDetail}
      />
    ),
    [visibleBets.length, language, onOpenBetDetail],
  )

  if (bets.length === 0) {
    return <div className="dashboard-bets-empty">{t('No bets found.')}</div>
  }

  return (
    <div className="dashboard-bets-table-wrapper">
      <div className="dashboard-bets-toolbar">
        <input
          type="search"
          className="dashboard-bets-search"
          placeholder={t('Search event or market...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="dashboard-bets-pills">
          {OUTCOME_PILLS.map((pill) => (
            <button
              key={pill.value}
              type="button"
              className={`dashboard-bets-pill${outcomeFilter === pill.value ? ' dashboard-bets-pill--active' : ''}`}
              onClick={() => setOutcomeFilter(pill.value)}
            >
              {t(pill.labelKey)}
            </button>
          ))}
        </div>
      </div>
      <TableVirtuoso
        data={visibleBets}
        style={{ height: '70vh' }}
        defaultItemHeight={44}
        increaseViewportBy={264}
        overscan={176}
        computeItemKey={(_, bet) => bet.id}
        components={TABLE_COMPONENTS}
        fixedHeaderContent={renderHeader}
        itemContent={renderRow}
      />
      {visibleBets.length === 0 && (
        <div className="dashboard-bets-empty">{t('No bets match your search.')}</div>
      )}
    </div>
  )
}

export default DashboardBetsTable
