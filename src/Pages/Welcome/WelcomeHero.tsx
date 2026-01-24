import { useTranslation } from 'react-i18next'

type WelcomeHeroProps = {
  onCreatePick: () => void
}

const WelcomeHero = ({ onCreatePick }: WelcomeHeroProps) => {
  const { t } = useTranslation()

  return (
    <section className="welcome-page-hero">
      <div className="welcome-page-hero-text">
        <p className="welcome-page-eyebrow">
          {t('welcomeDesk', { name: 'Geo' })}
        </p>
        <h1>{t('welcomeBack', { name: 'Geo' })}</h1>
        <p className="welcome-page-subhead">{t('welcomeSubhead')}</p>
        <div className="welcome-page-cta-row">
          <button className="welcome-page-cta" type="button" onClick={onCreatePick}>
            {t('createPick')}
          </button>
          <button className="welcome-page-ghost" type="button">
            {t('viewHistory')}
          </button>
        </div>
      </div>
      <div className="welcome-page-hero-card">
        <div className="welcome-page-stat">
          <span className="welcome-page-stat-label">{t('bankroll')}</span>
          <span className="welcome-page-stat-value">{t('emptyValue')}</span>
          <span className="welcome-page-stat-trend">{t('cleanMonth')}</span>
        </div>
        <div className="welcome-page-stat">
          <span className="welcome-page-stat-label">{t('roi')}</span>
          <span className="welcome-page-stat-value">{t('emptyValue')}</span>
          <span className="welcome-page-stat-trend">{t('awaitingResults')}</span>
        </div>
        <div className="welcome-page-stat">
          <span className="welcome-page-stat-label">{t('riskMeter')}</span>
          <span className="welcome-page-stat-value">{t('emptyValue')}</span>
          <span className="welcome-page-stat-trend">{t('setFirstPick')}</span>
        </div>
      </div>
    </section>
  )
}

export default WelcomeHero
