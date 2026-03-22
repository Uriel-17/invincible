import { forwardRef } from 'react'
import { type ScrollerProps, type TableComponents } from 'react-virtuoso'
import type { BetRecord } from 'src/types/electron'

const DashboardTable = ({ children, style }: React.ComponentPropsWithoutRef<'table'>) => (
  <table className="dashboard-bets-table" style={style}>{children}</table>
)

const DashboardTableHead = forwardRef<HTMLTableSectionElement, React.ComponentPropsWithoutRef<'thead'>>(
  function DashboardTableHead({ children, style }, ref) {
    return <thead ref={ref} style={{ ...style, position: 'static' }}>{children}</thead>
  },
)

const DashboardTableBody = forwardRef<HTMLTableSectionElement, React.ComponentPropsWithoutRef<'tbody'> & { 'data-testid'?: string }>(
  function DashboardTableBody({ children, className, style, 'data-testid': dataTestId }, ref) {
    return (
      <tbody ref={ref} className={className} style={style} data-testid={dataTestId}>
        {children}
      </tbody>
    )
  },
)

const DashboardTableScroller = forwardRef<HTMLDivElement, ScrollerProps>(
  function DashboardTableScroller({ children, style, tabIndex, 'data-virtuoso-scroller': dataVirtuosoScroller }, ref) {
    return (
      <div
        ref={ref}
        className="dashboard-bets-scroller"
        style={style}
        tabIndex={tabIndex}
        data-testid="dashboard-bets-scroller"
        data-virtuoso-scroller={dataVirtuosoScroller}
      >
        {children}
      </div>
    )
  },
)

export const TABLE_COMPONENTS = {
  Scroller: DashboardTableScroller,
  Table: DashboardTable,
  TableHead: DashboardTableHead,
  TableBody: DashboardTableBody,
} satisfies TableComponents<BetRecord>
