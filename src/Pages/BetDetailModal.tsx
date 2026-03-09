import { type MouseEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useT } from 'src/hooks/useT'
import { getBetById } from 'src/services/database'
import { BETS_QC_KEY } from 'src/queryKeys'
import './Styles/BetDetailModal.css'

interface BetDetailModalProps {
  isOpen: boolean
  onClose: () => void
  betId: string | null
}

const BetDetailModal = ({ isOpen, onClose, betId }: BetDetailModalProps) => {
  const _T = useT()

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
          </>
        )}
      </div>
    </div>
  )
}

export default BetDetailModal

