import { EyeOpenIcon } from '@radix-ui/react-icons'
import { useT } from 'src/hooks/useT'
import type { BetRecord } from 'src/types/electron'
import { formatCurrency, formatShortDate } from 'src/utils/formatters'
import { BET_TYPE_LABEL_MAP, RESULT_CLASS_MAP, RESULT_LABEL_MAP } from './DashboardBetsTableColumns'

type Props = {
  bet: BetRecord
  isLastRow: boolean
  language: string
  onOpenBetDetail: (betId: string) => void
}

const DashboardBetsTableRow = ({ bet, isLastRow, language, onOpenBetDetail }: Props) => {
  const t = useT()
  const lastRowClassName = isLastRow ? 'dashboard-bets-cell--last-row' : undefined
  const profitClass = bet.net_gain > 0
    ? 'dashboard-bets-profit--positive'
    : bet.net_gain < 0
      ? 'dashboard-bets-profit--negative'
      : ''

  return (
    <>
      <td className={lastRowClassName}>{formatShortDate(bet.placed_at, language)}</td>
      <td className={lastRowClassName}>{t(BET_TYPE_LABEL_MAP[bet.bet_type] || bet.bet_type)}</td>
      <td className={`dashboard-bets-td--flexible${lastRowClassName ? ` ${lastRowClassName}` : ''}`}>{bet.selection || '—'}</td>
      <td className={`dashboard-bets-td--flexible${lastRowClassName ? ` ${lastRowClassName}` : ''}`}>{bet.market || '—'}</td>
      <td className={lastRowClassName}>{bet.quota}</td>
      <td className={lastRowClassName}>
        <span className={RESULT_CLASS_MAP[bet.outcome] || ''}>
          {t(RESULT_LABEL_MAP[bet.outcome] || bet.outcome)}
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
          aria-label={t('View bet details')}
        >
          <EyeOpenIcon />
        </button>
      </td>
    </>
  )
}

export default DashboardBetsTableRow
