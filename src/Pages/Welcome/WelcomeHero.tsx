import { useT } from 'src/hooks/useT'
import { useUsername } from 'src/hooks/useUsername'
import { useWelcomeStats } from 'src/hooks/useWelcomeStats'
import { formatBankrollTrend, formatROI, formatWinLossRecord, getTrendClass } from 'src/utils/formatters'
import { useTranslation } from 'react-i18next'

type WelcomeHeroProps = {
  onCreatePick: () => void
}

const WelcomeHero = ({ onCreatePick }: WelcomeHeroProps) => {
  const _T = useT()
  const { i18n } = useTranslation()
  const { username } = useUsername()
  const {
    bankroll,
    monthlyStats,
    totalPendingAmount,
    riskLevel,
    isLoading,
    formatCurrency
  } = useWelcomeStats()

  const bankrollTrendClass = getTrendClass(monthlyStats.net_profit)
  const roiTrendClass = getTrendClass(monthlyStats.roi)

  const bankrollTrend = formatBankrollTrend(monthlyStats.net_profit, i18n.language) + _T(' this month')
  const roiValue = formatROI(monthlyStats.roi)
  const winLossRecord = formatWinLossRecord(
    monthlyStats.total_wins,
    monthlyStats.total_losses,
    monthlyStats.total_pushes
  )

  console.log('bankroll: ', bankroll);

  return (
    <section className="welcome-page-hero">
      <div className="welcome-page-hero-text">
        <p className="welcome-page-eyebrow">{_T("{{username}}'s sportsbook desk", { username })}</p>
        <h1>{_T('Welcome back, {{username}}', { username })}</h1>
        <p className="welcome-page-subhead">
          {_T('Track lines, lock picks, and keep your bankroll disciplined.')}
        </p>
        <div className="welcome-page-cta-row">
          <button className="welcome-page-cta" type="button" onClick={onCreatePick}>
            {_T('Create pick')}
          </button>
          <button className="welcome-page-ghost" type="button">
            {_T('View history')}
          </button>
        </div>
      </div>
      <div className="welcome-page-hero-card">
        <div className="welcome-page-stat">
          <span className="welcome-page-stat-label">{_T('Bankroll')}</span>
          <span className="welcome-page-stat-value">
            {isLoading ? _T('--') : formatCurrency(bankroll)}
          </span>
          <span className={`welcome-page-stat-trend ${bankrollTrendClass}`}>
            {isLoading ? _T('Loading...') : bankrollTrend}
          </span>
        </div>
        <div className="welcome-page-stat">
          <span className="welcome-page-stat-label">{_T('ROI')}</span>
          <span className="welcome-page-stat-value">
            {isLoading ? _T('--') : roiValue}
          </span>
          <span className={`welcome-page-stat-trend ${roiTrendClass}`}>
            {isLoading ? _T('Loading...') : winLossRecord}
          </span>
        </div>
        <div className="welcome-page-stat">
          <span className="welcome-page-stat-label">{_T('Risk meter')}</span>
          <span className="welcome-page-stat-value">
            {isLoading ? _T('--') : _T(riskLevel)}
          </span>
          <span className="welcome-page-stat-trend welcome-page-stat-trend--neutral">
            {isLoading ? _T('Loading...') : `${formatCurrency(totalPendingAmount)} at risk`}
          </span>
        </div>
      </div>
    </section>
  )
}

export default WelcomeHero
