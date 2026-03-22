import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VirtuosoMockContext } from 'react-virtuoso'
import DashboardBetsTable from './DashboardBetsTable'
import type { BetRecord } from 'src/types/electron'

const createBet = (index: number): BetRecord => ({
  id: `bet-${index}`,
  bet_type: index % 2 === 0 ? 'single' : 'parlay',
  outcome: index % 4 === 0 ? 'win' : index % 4 === 1 ? 'loss' : index % 4 === 2 ? 'pending' : 'push',
  placed_at: `2026-03-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`,
  bet_amount: 25 + index,
  quota: `${1.5 + index / 100}`,
  market: `Market ${index}`,
  selection: `Selection ${index}`,
  potential_gains: 50 + index,
  cashout_amount: null,
  net_gain: index % 2 === 0 ? 10 : -10,
  notes: null,
  created_at: `2026-03-${String((index % 28) + 1).padStart(2, '0')}T11:00:00.000Z`,
  updated_at: `2026-03-${String((index % 28) + 1).padStart(2, '0')}T11:30:00.000Z`,
  month_key: '2026-03',
  is_archived: 0,
})

const renderTable = (bets: BetRecord[], onOpenBetDetail = vi.fn()) => render(
  <VirtuosoMockContext.Provider value={{ viewportHeight: 220, itemHeight: 44 }}>
    <DashboardBetsTable
      bets={bets}
      language="en"
      translate={(key) => key}
      onOpenBetDetail={onOpenBetDetail}
    />
  </VirtuosoMockContext.Provider>,
)

describe('DashboardBetsTable', () => {
  it('renders the original table structure and opens bet details from the Eye Log action', async () => {
    const user = userEvent.setup()
    const onOpenBetDetail = vi.fn()

    renderTable([createBet(0), createBet(1)], onOpenBetDetail)

    expect(screen.getByRole('table')).toHaveClass('dashboard-bets-table')
    expect(screen.getByText('Placed at')).toBeInTheDocument()
    expect(screen.getByText('Bet Type')).toBeInTheDocument()
    expect(screen.getByText('Profit/Loss')).toBeInTheDocument()
    expect(screen.getByText('Selection 0')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'View bet details' })[0])

    // Default sort is placed_at DESC: bet-1 (March 2) renders before bet-0 (March 1)
    expect(onOpenBetDetail).toHaveBeenCalledWith('bet-1')
  })

  it('virtualizes large datasets instead of rendering every row at once', () => {
    const bets = Array.from({ length: 200 }, (_, index) => createBet(index))
    const { container } = renderTable(bets)
    const scroller = screen.getByTestId('dashboard-bets-scroller')

    // With DESC sort, Selection 0 is near the end — check the scroller exists instead
    expect(scroller).toHaveClass('dashboard-bets-scroller')
    expect(scroller).toHaveAttribute('data-virtuoso-scroller', 'true')

    const renderedRows = container.querySelectorAll('tbody tr')
    expect(renderedRows.length).toBeGreaterThan(0)
    expect(renderedRows.length).toBeLessThan(bets.length)
  })
})