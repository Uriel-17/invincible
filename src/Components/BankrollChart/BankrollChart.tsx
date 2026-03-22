import { useMemo } from 'react'
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
  ComposedChart,
} from 'recharts'
import { useT } from 'src/hooks/useT'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from 'src/utils/formatters'
import type { BankrollSnapshot } from 'src/types/electron'
import './helpers/BankrollChart.css'

interface BankrollChartProps {
  data: BankrollSnapshot[]
}

interface ChartDataPoint {
  timestamp: number
  amount: number
  change_reason: string
  change_amount: number
  formattedDate: string
}

const CHANGE_REASON_COLORS: Record<string, string> = {
  bet_win: 'rgb(34, 197, 94)',
  bet_loss: 'rgb(239, 68, 68)',
  bet_cashout: 'rgb(245, 158, 11)',
  manual_adjustment: 'rgb(59, 130, 246)',
  initial: 'rgb(100, 116, 139)',
  month_start: 'rgb(100, 116, 139)',
}

const CHANGE_REASON_LABEL_KEYS: Record<string, string> = {
  bet_win: 'Bet Win',
  bet_loss: 'Bet Loss',
  bet_cashout: 'Cashout',
  manual_adjustment: 'Manual Adjustment',
  initial: 'Initial',
  month_start: 'Month Start',
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { payload: ChartDataPoint }[]
  language: string
  getChangeReasonLabel: (reason: string) => string
}

const CustomTooltip = ({ active, payload, language, getChangeReasonLabel }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) {
    return null
  }

  const dataPoint = payload[0].payload
  const changeClass = dataPoint.change_amount >= 0
    ? 'bankroll-chart-tooltip-change--positive'
    : 'bankroll-chart-tooltip-change--negative'

  return (
    <div className="bankroll-chart-tooltip">
      <p className="bankroll-chart-tooltip-date">
        {dataPoint.formattedDate}
      </p>
      <p className="bankroll-chart-tooltip-bankroll">
        <strong>Bankroll:</strong> {formatCurrency(dataPoint.amount, language)}
      </p>
      <p className={`bankroll-chart-tooltip-change ${changeClass}`}>
        <strong>{language === 'es' ? 'Cambio' : 'Change'}:</strong>{' '}
        {dataPoint.change_amount >= 0 ? '+' : ''}
        {formatCurrency(dataPoint.change_amount, language)}
      </p>
      <p className="bankroll-chart-tooltip-reason">
        {getChangeReasonLabel(dataPoint.change_reason)}
      </p>
    </div>
  )
}

const BankrollChart = ({ data }: BankrollChartProps) => {
  const _T = useT()
  const { i18n } = useTranslation()
  const language = i18n.language

  const getChangeReasonLabel = (reason: string): string => {
    return _T(CHANGE_REASON_LABEL_KEYS[reason] || reason)
  }

  const chartData: ChartDataPoint[] = useMemo(
    () => data.map((snapshot) => ({
      timestamp: new Date(snapshot.timestamp).getTime(),
      amount: snapshot.amount,
      change_reason: snapshot.change_reason,
      change_amount: snapshot.change_amount,
      formattedDate: new Date(snapshot.timestamp).toLocaleDateString(
        language === 'es' ? 'es-ES' : 'en-US',
        {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }
      ),
    })),
    [data, language],
  )

  const formatYAxis = (value: number): string => formatCurrency(value, language)

  const formatXAxis = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString(
      language === 'es' ? 'es-ES' : 'en-US',
      { month: 'short', day: 'numeric' }
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="bankroll-chart-empty">
        {_T('No history data available')}
      </div>
    )
  }

  return (
    <div className="bankroll-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            stroke="rgb(var(--muted))"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            tickFormatter={formatYAxis}
            stroke="rgb(var(--muted))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip language={language} getChangeReasonLabel={getChangeReasonLabel} />} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="rgb(var(--primary))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          {Object.keys(CHANGE_REASON_COLORS).map((reason) => (
            <Scatter
              key={reason}
              data={chartData.filter((d) => d.change_reason === reason)}
              fill={CHANGE_REASON_COLORS[reason]}
              shape="circle"
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BankrollChart

