import { useTranslation } from 'react-i18next'

const WelcomePanels = () => {
  const { t } = useTranslation()
  return (
    <section className="welcome-page-grid">
      <div className="welcome-page-panel">
        <div className="welcome-page-panel-header">
          <h2>{t('todaysSlate')}</h2>
          <span className="welcome-page-chip">{t('boardReady')}</span>
        </div>
        <ul className="welcome-page-list">
          <li>
            <span>{t('leagueSync')}</span>
            <span className="welcome-page-odd">{t('pending')}</span>
          </li>
          <li>
            <span>{t('linesFeed')}</span>
            <span className="welcome-page-odd">{t('waiting')}</span>
          </li>
          <li>
            <span>{t('alerts')}</span>
            <span className="welcome-page-odd">{t('standby')}</span>
          </li>
        </ul>
        <button className="welcome-page-panel-link" type="button">
          {t('openBoard')}
        </button>
      </div>

      <div className="welcome-page-panel welcome-page-panel--accent">
        <div className="welcome-page-panel-header">
          <h2>{t('momentumPicks')}</h2>
          <span className="welcome-page-chip">{t('geoPicks')}</span>
        </div>
        <div className="welcome-page-ticket">
          <div>
            <p className="welcome-page-ticket-title">{t('cleanMonth')}</p>
            <p className="welcome-page-ticket-meta">{t('readyForFirstPick')}</p>
          </div>
          <span className="welcome-page-pill">{t('open')}</span>
        </div>
        <button className="welcome-page-panel-link" type="button">
          {t('managePicks')}
        </button>
      </div>

      <div className="welcome-page-panel">
        <div className="welcome-page-panel-header">
          <h2>{t('marketPulse')}</h2>
          <span className="welcome-page-chip">{t('last15Min')}</span>
        </div>
        <div className="welcome-page-pulse">
          <div>
            <p className="welcome-page-pulse-label">{t('sharpMoney')}</p>
            <p className="welcome-page-pulse-value">{t('quietMarket')}</p>
          </div>
          <div>
            <p className="welcome-page-pulse-label">{t('lineMovement')}</p>
            <p className="welcome-page-pulse-value">{t('stableLines')}</p>
          </div>
          <div>
            <p className="welcome-page-pulse-label">{t('alerts')}</p>
            <p className="welcome-page-pulse-value">{t('watchingSignals')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WelcomePanels
