import { useT } from '../../hooks/useT'

type WelcomeHeroProps = {
  onCreatePick: () => void
}

const WelcomeHero = ({ onCreatePick }: WelcomeHeroProps) => {
  const _T = useT()

  return (
    <section className="welcome-page-hero">
      <div className="welcome-page-hero-text">
        <p className="welcome-page-eyebrow">{_T("Geo's sportsbook desk")}</p>
        <h1>{_T('Welcome back, Geo')}</h1>
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
          <span className="welcome-page-stat-value">{_T('--')}</span>
          <span className="welcome-page-stat-trend">{_T('Clean month')}</span>
        </div>
        <div className="welcome-page-stat">
          <span className="welcome-page-stat-label">{_T('ROI')}</span>
          <span className="welcome-page-stat-value">{_T('--')}</span>
          <span className="welcome-page-stat-trend">{_T('Awaiting results')}</span>
        </div>
        <div className="welcome-page-stat">
          <span className="welcome-page-stat-label">{_T('Risk meter')}</span>
          <span className="welcome-page-stat-value">{_T('--')}</span>
          <span className="welcome-page-stat-trend">{_T('Set your first pick')}</span>
        </div>
      </div>
    </section>
  )
}

export default WelcomeHero
