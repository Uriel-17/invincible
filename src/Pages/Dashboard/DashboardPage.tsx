import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useT } from 'src/hooks/useT'
import { useBankrollHistory } from 'src/hooks/useBankrollHistory'
import { useBets } from 'src/hooks/useBets'
import { formatCurrency, formatROI } from 'src/utils/formatters'
import BankrollChart from 'src/Components/BankrollChart'
import BetDetailModal from './BetDetailModal/BetDetailModal'
import DashboardBetsTable from './BetsTable/DashboardBetsTable'
import type { BetRecord } from 'src/types/electron'
import './helpers/DashboardPage.css'

interface DashboardStats {
  totalBets: number
  totalWins: number
  totalLosses: number
  totalPending: number
  totalCashouts: number
  totalPushes: number
  totalProfit: number
  totalStaked: number
}

const computeStats = (bets: BetRecord[]): DashboardStats => {
  let totalWins = 0
  let totalLosses = 0
  let totalPending = 0
  let totalCashouts = 0
  let totalPushes = 0
  let totalProfit = 0
  let totalStaked = 0

  for (const bet of bets) {
    if (bet.outcome === 'win') totalWins++
    else if (bet.outcome === 'loss') totalLosses++
    else if (bet.outcome === 'pending') totalPending++
    else if (bet.outcome === 'cashout') totalCashouts++
    else if (bet.outcome === 'push') totalPushes++

    if (bet.outcome !== 'pending') {
      totalProfit += bet.net_gain
      totalStaked += bet.bet_amount
    }
  }

  return {
    totalBets: bets.length,
    totalWins,
    totalLosses,
    totalPending,
    totalCashouts,
    totalPushes,
    totalProfit,
    totalStaked,
  }
}

const DashboardPage = () => {
  const _T = useT()
  const { i18n } = useTranslation()
  const language = i18n.language
  const { data: history, isLoading, isError, error } = useBankrollHistory()
  const { data: bets } = useBets()
  const [selectedBetId, setSelectedBetId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const stats = useMemo(() => (bets ? computeStats(bets) : null), [bets])

  const handleOpenBetDetail = (betId: string) => {
    setSelectedBetId(betId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBetId(null)
  }

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          {_T('Loading dashboard...')}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          {_T('Error loading dashboard: ')} {error?.message}
        </div>
      </div>
    )
  }

  if (!history || history.length === 0) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <h1 className="dashboard-title">{_T('Bankroll Dashboard')}</h1>
          <div className="dashboard-empty">
            <p>{_T('No bankroll history available yet.')}</p>
            <p className="dashboard-empty-hint">
              {_T('Start placing bets to see your bankroll progression over time.')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1 className="dashboard-title">{_T('Bankroll Dashboard')}</h1>
        {stats && (
          <div className="dashboard-stats">
            <div className="dashboard-stats-item">
              <span className="dashboard-stats-label">{_T('Total Bets')}</span>
              <span className="dashboard-stats-value">{stats.totalBets}</span>
            </div>
            <div className="dashboard-stats-divider" />
            <div className="dashboard-stats-item">
              <span className="dashboard-stats-label">{_T('Total Wins')}</span>
              <span className="dashboard-stats-value dashboard-stats-value--wins">{stats.totalWins}</span>
            </div>
            <div className="dashboard-stats-divider" />
            <div className="dashboard-stats-item">
              <span className="dashboard-stats-label">{_T('Total Losses')}</span>
              <span className="dashboard-stats-value dashboard-stats-value--losses">{stats.totalLosses}</span>
            </div>
            <div className="dashboard-stats-divider" />
            <div className="dashboard-stats-item">
              <span className="dashboard-stats-label">{_T('Total Pending')}</span>
              <span className="dashboard-stats-value dashboard-stats-value--pending">{stats.totalPending}</span>
            </div>
            <div className="dashboard-stats-divider" />
            <div className="dashboard-stats-item">
              <span className="dashboard-stats-label">{_T('Total Cashouts')}</span>
              <span className="dashboard-stats-value dashboard-stats-value--cashouts">{stats.totalCashouts}</span>
            </div>
            <div className="dashboard-stats-divider" />
            <div className="dashboard-stats-item">
              <span className="dashboard-stats-label">{_T('Total Pushes')}</span>
              <span className="dashboard-stats-value dashboard-stats-value--pushes">{stats.totalPushes}</span>
            </div>
            <div className="dashboard-stats-divider" />
            <div className="dashboard-stats-item">
              <span className="dashboard-stats-label">{_T('Total Profit')}</span>
              <span className={`dashboard-stats-value ${stats.totalProfit >= 0 ? 'dashboard-stats-value--profit-positive' : 'dashboard-stats-value--profit-negative'}`}>
                {formatCurrency(stats.totalProfit, language)}
              </span>
            </div>
            <div className="dashboard-stats-divider" />
            <div className="dashboard-stats-item">
              <span className="dashboard-stats-label">{_T('Total ROI')}</span>
              <span className={`dashboard-stats-value ${stats.totalProfit >= 0 ? 'dashboard-stats-value--profit-positive' : 'dashboard-stats-value--profit-negative'}`}>
                {stats.totalStaked > 0 ? formatROI((stats.totalProfit / stats.totalStaked) * 100) : '0.0%'}
              </span>
            </div>
          </div>
        )}
        <div className="dashboard-chart-section">
          <h2 className="dashboard-section-title">{_T('Bankroll History')}</h2>
          <div className="dashboard-chart-wrapper">
            <BankrollChart data={history} />
          </div>
        </div>
        <div className="dashboard-bets-section">
          <h2 className="dashboard-section-title">{_T('Bets')}</h2>
          {bets ? (
            <DashboardBetsTable
              bets={bets}
              language={language}
              translate={_T}
              onOpenBetDetail={handleOpenBetDetail}
            />
          ) : (
            <div className="dashboard-bets-empty">{_T('Loading bets...')}</div>
          )}
        </div>
      </div>

      <BetDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        betId={selectedBetId}
      />
    </div>
  )
}

export default DashboardPage

