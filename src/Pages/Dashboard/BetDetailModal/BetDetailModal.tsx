import { type MouseEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useT } from 'src/hooks/useT'
import { getBetById } from 'src/services/database'
import { formatCurrency, formatShortDate } from 'src/utils/formatters'
import { BETS_QC_KEY } from 'src/queryKeys'
import BetDetailResolveForm from './BetDetailResolveForm'
import './helpers/BetDetailModal.css'

interface BetDetailModalProps {
  isOpen: boolean
  onClose: () => void
  betId: string | null
}

const BetDetailModal = ({ isOpen, onClose, betId }: BetDetailModalProps) => {
  const _T = useT()
  const { i18n } = useTranslation()
  const language = i18n.language

  const { data: bet, isLoading } = useQuery({
    queryKey: [BETS_QC_KEY, 'detail', betId],
    queryFn: () => getBetById(betId!),
    enabled: isOpen && betId !== null,
  })

  const isParlay = bet?.bet_type === 'parlay'
  const legs = bet?.legs ?? []

  const handlePanelClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  const overlayClass = `bet-detail-overlay${isOpen ? ' bet-detail-overlay--open' : ''}`
  const panelClass = `bet-detail-panel${isOpen ? ' bet-detail-panel--open' : ''}`

  return (
    <div className={overlayClass} role="presentation" onClick={onClose}>
      <div
        className={panelClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bet-detail-title"
        onClick={handlePanelClick}
      >
        <div className="bet-detail-header">
          <h2 id="bet-detail-title">{_T('Bet Details')}</h2>
          <button
            type="button"
            className="bet-detail-close-btn"
            onClick={onClose}
            aria-label={_T('Close')}
          >
            ✕
          </button>
        </div>

        {isLoading && <p>{_T('Loading...')}</p>}

        {!isLoading && bet && (
          <>
            <div className="bet-detail-section">
              <div className="bet-detail-summary">
                {(bet.market || bet.selection) && (
                  <div className="bet-detail-summary-row">
                    <span className="bet-detail-summary-label">{_T('Market')}</span>
                    <span className="bet-detail-summary-value">{bet.market ?? bet.selection}</span>
                  </div>
                )}
                <div className="bet-detail-summary-row">
                  <span className="bet-detail-summary-label">{_T('Placed at')}</span>
                  <span className="bet-detail-summary-value">{formatShortDate(bet.placed_at, language)}</span>
                </div>
                <div className="bet-detail-summary-row">
                  <span className="bet-detail-summary-label">{_T('Bet Amount')}</span>
                  <span className="bet-detail-summary-value">{formatCurrency(bet.bet_amount, language)}</span>
                </div>
                <div className="bet-detail-summary-row">
                  <span className="bet-detail-summary-label">{_T('Quota')}</span>
                  <span className="bet-detail-summary-value">{bet.quota}</span>
                </div>
              </div>
            </div>

            {isParlay && (
              <div className="bet-detail-section">
                <h3 className="bet-detail-section-title">{_T('Parlay Legs')}</h3>
                {legs.length > 0 ? (
                  <div className="bet-detail-legs-list">
                    {legs.map((leg) => (
                      <div key={leg.id} className="bet-detail-leg">
                        <span className="bet-detail-leg-index">#{leg.leg_index}</span>
                        <div>
                          <span className="bet-detail-leg-description">{leg.description}</span>
                          <span className="bet-detail-leg-market"> · {leg.market}</span>
                        </div>
                        <span className="bet-detail-leg-quota">{leg.quota}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="bet-detail-no-legs">{_T('No parlay legs found.')}</p>
                )}
              </div>
            )}

            <div className="bet-detail-section">
              <h3 className="bet-detail-section-title">{_T('Notes')}</h3>
              {bet.notes ? (
                <div className="bet-detail-notes">{bet.notes}</div>
              ) : (
                <p className="bet-detail-no-notes">{_T('No notes for this bet.')}</p>
              )}
            </div>

            <div className="bet-detail-section">
              <h3 className="bet-detail-section-title">{_T('Resolve')}</h3>
              <BetDetailResolveForm key={bet.id} bet={bet} onSuccess={onClose} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default BetDetailModal
