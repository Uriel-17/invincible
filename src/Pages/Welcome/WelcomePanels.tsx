import { useT } from 'src/hooks/useT'
import { useUsername } from 'src/hooks/useUsername'

const WelcomePanels = () => {
  const _T = useT()
  const { username } = useUsername()

  return (
    <section className="welcome-page-grid">
      <div className="welcome-page-panel">
        <div className="welcome-page-panel-header">
          <h2>{_T("Today's slate")}</h2>
          <span className="welcome-page-chip">{_T('Board ready')}</span>
        </div>
        <ul className="welcome-page-list">
          <li>
            <span>{_T('League sync')}</span>
            <span className="welcome-page-odd">{_T('Pending')}</span>
          </li>
          <li>
            <span>{_T('Lines feed')}</span>
            <span className="welcome-page-odd">{_T('Waiting')}</span>
          </li>
          <li>
            <span>{_T('Alerts')}</span>
            <span className="welcome-page-odd">{_T('Standby')}</span>
          </li>
        </ul>
        <button className="welcome-page-panel-link" type="button">
          {_T('Open board')}
        </button>
      </div>

      <div className="welcome-page-panel welcome-page-panel--accent">
        <div className="welcome-page-panel-header">
          <h2>{_T('Momentum picks')}</h2>
          <span className="welcome-page-chip">{_T('{{username}} picks', { username })}</span>
        </div>
        <div className="welcome-page-ticket">
          <div>
            <p className="welcome-page-ticket-title">{_T('Clean month')}</p>
            <p className="welcome-page-ticket-meta">{_T('Ready for first pick')}</p>
          </div>
          <span className="welcome-page-pill">{_T('Open')}</span>
        </div>
        <button className="welcome-page-panel-link" type="button">
          {_T('Manage picks')}
        </button>
      </div>

      <div className="welcome-page-panel">
        <div className="welcome-page-panel-header">
          <h2>{_T('Market pulse')}</h2>
          <span className="welcome-page-chip">{_T('Last 15 min')}</span>
        </div>
        <div className="welcome-page-pulse">
          <div>
            <p className="welcome-page-pulse-label">{_T('Sharp money')}</p>
            <p className="welcome-page-pulse-value">{_T('Quiet market')}</p>
          </div>
          <div>
            <p className="welcome-page-pulse-label">{_T('Line movement')}</p>
            <p className="welcome-page-pulse-value">{_T('Stable lines')}</p>
          </div>
          <div>
            <p className="welcome-page-pulse-label">{_T('Alerts')}</p>
            <p className="welcome-page-pulse-value">{_T('Watching for signals')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WelcomePanels
