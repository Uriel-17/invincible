/**
 * Comprehensive Unit Tests for useWelcomeStats hooks
 *
 * Tests all hooks: useBankroll, useMonthlyStats, usePendingBets, useWelcomeStats
 * Includes error scenarios, loading states, and formatCurrency binding
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import React from 'react'
import { useBankroll } from './useBankroll'
import { useMonthlyStats } from './useMonthlyStats'
import { usePendingBets } from './usePendingBets'
import { useWelcomeStats } from './useWelcomeStats'
import i18n from 'src/i18n'
import type { MonthlyStatistics, BetRecord, ElectronAPI } from 'src/types/electron'

// Type for mock Electron API - allows partial mocking of database methods
type MockElectronAPI = {
  database: Partial<ElectronAPI['database']>
}

// Mock the database service
vi.mock('src/services/database', () => ({
  getElectronAPI: vi.fn(),
  getCurrentMonthKey: vi.fn(),
  getBets: vi.fn(),
}))

// Import mocked functions
import { getElectronAPI, getCurrentMonthKey, getBets } from 'src/services/database'

// Create wrapper for React Query and i18n
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for tests
        gcTime: 0, // Disable caching
      },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </QueryClientProvider>
  )
}

// Mock data
const mockBankroll = 1500
const mockMonthlyStats: MonthlyStatistics = {
  monthKey: '2026-02',
  total_bets: 10,
  total_wins: 6,
  total_losses: 3,
  total_pushes: 1,
  total_cashouts: 0,
  net_profit: 250.50,
  total_wagered: 1000,
  roi: 25.05,
  startingBankroll: 1000,
  endingBankroll: 1250.50,
}

const mockPendingBets: BetRecord[] = [
  {
    id: '1',
    bet_type: 'single',
    outcome: 'pending',
    placed_at: '2026-02-01T10:00:00Z',
    bet_amount: 50,
    quota: '2.00',
    market: 'Moneyline',
    selection: 'Team A',
    potential_gains: 100,
    cashout_amount: null,
    net_gain: 0,
    notes: '',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
    month_key: '2026-02',
    is_archived: 0,
  },
  {
    id: '2',
    bet_type: 'single',
    outcome: 'pending',
    placed_at: '2026-02-02T11:00:00Z',
    bet_amount: 75,
    quota: '1.80',
    market: 'Spread',
    selection: 'Team B -5.5',
    potential_gains: 135,
    cashout_amount: null,
    net_gain: 0,
    notes: '',
    created_at: '2026-02-02T11:00:00Z',
    updated_at: '2026-02-02T11:00:00Z',
    month_key: '2026-02',
    is_archived: 0,
  },
]

describe('useBankroll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch bankroll successfully', async () => {
    const mockAPI: MockElectronAPI = {
      database: {
        getCurrentBankroll: vi.fn().mockResolvedValue({
          success: true,
          data: mockBankroll,
        }),
      },
    }
    vi.mocked(getElectronAPI).mockReturnValue(mockAPI as ElectronAPI)

    const { result } = renderHook(() => useBankroll(), {
      wrapper: createWrapper(),
    })

    // Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBe(mockBankroll)
    expect(result.current.error).toBeNull()
    expect(mockAPI.database.getCurrentBankroll).toHaveBeenCalledTimes(1)
  })

  it('should handle bankroll fetch error', async () => {
    const mockAPI: MockElectronAPI = {
      database: {
        getCurrentBankroll: vi.fn().mockResolvedValue({
          success: false,
          error: 'Database connection failed',
        }),
      },
    }
    vi.mocked(getElectronAPI).mockReturnValue(mockAPI as ElectronAPI)

    const { result } = renderHook(() => useBankroll(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.data).toBeUndefined()
  })

  it('should handle undefined bankroll data', async () => {
    const mockAPI: MockElectronAPI = {
      database: {
        getCurrentBankroll: vi.fn().mockResolvedValue({
          success: true,
          data: undefined,
        }),
      },
    }
    vi.mocked(getElectronAPI).mockReturnValue(mockAPI as ElectronAPI)

    const { result } = renderHook(() => useBankroll(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
  })
})

describe('useMonthlyStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch monthly statistics successfully', async () => {
    const mockAPI: MockElectronAPI = {
      database: {
        updateMonthlyStatistics: vi.fn().mockResolvedValue({
          success: true,
          data: mockMonthlyStats,
        }),
      },
    }
    vi.mocked(getElectronAPI).mockReturnValue(mockAPI as ElectronAPI)
    vi.mocked(getCurrentMonthKey).mockResolvedValue('2026-02')

    const { result } = renderHook(() => useMonthlyStats(), {
      wrapper: createWrapper(),
    })

    // Initially loading
    expect(result.current.isLoading).toBe(true)

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockMonthlyStats)
    expect(result.current.error).toBeNull()
    expect(getCurrentMonthKey).toHaveBeenCalledTimes(1)
    expect(mockAPI.database.updateMonthlyStatistics).toHaveBeenCalledWith('2026-02')
  })

  it('should handle monthly stats fetch error', async () => {
    const mockAPI: MockElectronAPI = {
      database: {
        updateMonthlyStatistics: vi.fn().mockResolvedValue({
          success: false,
          error: 'Failed to calculate statistics',
        }),
      },
    }
    vi.mocked(getElectronAPI).mockReturnValue(mockAPI as ElectronAPI)
    vi.mocked(getCurrentMonthKey).mockResolvedValue('2026-02')

    const { result } = renderHook(() => useMonthlyStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.data).toBeUndefined()
  })

  it('should handle missing monthly stats data', async () => {
    const mockAPI: MockElectronAPI = {
      database: {
        updateMonthlyStatistics: vi.fn().mockResolvedValue({
          success: true,
          data: null,
        }),
      },
    }
    vi.mocked(getElectronAPI).mockReturnValue(mockAPI as ElectronAPI)
    vi.mocked(getCurrentMonthKey).mockResolvedValue('2026-02')

    const { result } = renderHook(() => useMonthlyStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
  })
})

describe('usePendingBets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch pending bets successfully', async () => {
    vi.mocked(getBets).mockResolvedValue(mockPendingBets)

    const { result } = renderHook(() => usePendingBets(), {
      wrapper: createWrapper(),
    })

    // Initially loading
    expect(result.current.isLoading).toBe(true)

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockPendingBets)
    expect(result.current.error).toBeNull()
    expect(getBets).toHaveBeenCalledWith({ outcome: 'pending' })
  })

  it('should handle pending bets fetch error', async () => {
    vi.mocked(getBets).mockRejectedValue(new Error('Failed to fetch bets'))

    const { result } = renderHook(() => usePendingBets(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.data).toBeUndefined()
  })

  it('should handle empty pending bets array', async () => {
    vi.mocked(getBets).mockResolvedValue([])

    const { result } = renderHook(() => usePendingBets(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual([])
    expect(result.current.error).toBeNull()
  })
})

describe('useWelcomeStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set language to English for consistent testing
    void i18n.changeLanguage('en')
  })

  afterEach(() => {
    // Reset language to English after each test
    void i18n.changeLanguage('en')
  })

  it('should return all stats with correct properties', async () => {
    // Mock all API calls
    const mockAPI: MockElectronAPI = {
      database: {
        getCurrentBankroll: vi.fn().mockResolvedValue({
          success: true,
          data: mockBankroll,
        }),
        updateMonthlyStatistics: vi.fn().mockResolvedValue({
          success: true,
          data: mockMonthlyStats,
        }),
      },
    }
    vi.mocked(getElectronAPI).mockReturnValue(mockAPI as ElectronAPI)
    vi.mocked(getCurrentMonthKey).mockResolvedValue('2026-02')
    vi.mocked(getBets).mockResolvedValue(mockPendingBets)

    const { result } = renderHook(() => useWelcomeStats(), {
      wrapper: createWrapper(),
    })

    // Wait for all data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify all properties are present
    expect(result.current.bankroll).toBe(mockBankroll)
    expect(result.current.monthlyStats).toEqual(mockMonthlyStats)
    expect(result.current.pendingBets).toEqual(mockPendingBets)
    expect(result.current.totalPendingAmount).toBe(125) // 50 + 75
    expect(result.current.riskLevel).toBe('Moderate') // 125/1500 = 8.3% (5-15% is Moderate)
    expect(result.current.riskPercentage).toBeCloseTo(8.33, 1)
    expect(typeof result.current.formatCurrency).toBe('function')
  })

  it('should calculate risk level correctly - Low', async () => {
    const mockAPI: MockElectronAPI = {
      database: {
        getCurrentBankroll: vi.fn().mockResolvedValue({
          success: true,
          data: 1000,
        }),
        updateMonthlyStatistics: vi.fn().mockResolvedValue({
          success: true,
          data: mockMonthlyStats,
        }),
      },
    }
    vi.mocked(getElectronAPI).mockReturnValue(mockAPI as ElectronAPI)
    vi.mocked(getCurrentMonthKey).mockResolvedValue('2026-02')
    vi.mocked(getBets).mockResolvedValue([
      { ...mockPendingBets[0], bet_amount: 40 }, // 4% of bankroll (< 5% is Low)
    ])

    const { result } = renderHook(() => useWelcomeStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.riskLevel).toBe('Low')
    expect(result.current.riskPercentage).toBe(4)
  })

  it('should calculate risk level correctly - Moderate', async () => {
    const mockAPI: MockElectronAPI = {
      database: {
        getCurrentBankroll: vi.fn().mockResolvedValue({
          success: true,
          data: 1000,
        }),
        updateMonthlyStatistics: vi.fn().mockResolvedValue({
          success: true,
          data: mockMonthlyStats,
        }),
      },
    }
    vi.mocked(getElectronAPI).mockReturnValue(mockAPI as ElectronAPI)
    vi.mocked(getCurrentMonthKey).mockResolvedValue('2026-02')
    vi.mocked(getBets).mockResolvedValue([
      { ...mockPendingBets[0], bet_amount: 100 }, // 10% of bankroll (5-15% is Moderate)
    ])

    const { result } = renderHook(() => useWelcomeStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.riskLevel).toBe('Moderate')
    expect(result.current.riskPercentage).toBe(10)
  })

  it('should calculate risk level correctly - High', async () => {
    const mockAPI: MockElectronAPI = {
      database: {
        getCurrentBankroll: vi.fn().mockResolvedValue({
          success: true,
          data: 1000,
        }),
        updateMonthlyStatistics: vi.fn().mockResolvedValue({
          success: true,
          data: mockMonthlyStats,
        }),
      },
    }
    vi.mocked(getElectronAPI).mockReturnValue(mockAPI as ElectronAPI)
    vi.mocked(getCurrentMonthKey).mockResolvedValue('2026-02')
    vi.mocked(getBets).mockResolvedValue([
      { ...mockPendingBets[0], bet_amount: 300 }, // 30% of bankroll
    ])

    const { result } = renderHook(() => useWelcomeStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.riskLevel).toBe('High')
    expect(result.current.riskPercentage).toBe(30)
  })

  it('should handle loading state correctly', async () => {
    const mockAPI: MockElectronAPI = {
      database: {
        getCurrentBankroll: vi.fn().mockImplementation(() =>
          new Promise(resolve => setTimeout(() => resolve({ success: true, data: mockBankroll }), 100))
        ),
        updateMonthlyStatistics: vi.fn().mockResolvedValue({
          success: true,
          data: mockMonthlyStats,
        }),
      },
    }
    vi.mocked(getElectronAPI).mockReturnValue(mockAPI as ElectronAPI)
    vi.mocked(getCurrentMonthKey).mockResolvedValue('2026-02')
    vi.mocked(getBets).mockResolvedValue(mockPendingBets)

    const { result } = renderHook(() => useWelcomeStats(), {
      wrapper: createWrapper(),
    })

    // Should be loading initially
    expect(result.current.isLoading).toBe(true)

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    }, { timeout: 3000 })
  })

  it('should return default values when data is not loaded', async () => {
    const mockAPI: MockElectronAPI = {
      database: {
        getCurrentBankroll: vi.fn().mockResolvedValue({
          success: true,
          data: undefined,
        }),
        updateMonthlyStatistics: vi.fn().mockResolvedValue({
          success: false,
          error: 'No data',
        }),
      },
    }
    vi.mocked(getElectronAPI).mockReturnValue(mockAPI as ElectronAPI)
    vi.mocked(getCurrentMonthKey).mockResolvedValue('2026-02')
    vi.mocked(getBets).mockRejectedValue(new Error('Failed'))

    const { result } = renderHook(() => useWelcomeStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Should return default values
    expect(result.current.bankroll).toBe(0)
    expect(result.current.monthlyStats.total_bets).toBe(0)
    expect(result.current.pendingBets).toEqual([])
    expect(result.current.totalPendingAmount).toBe(0)
  })

  it('should log errors to console when queries fail', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const mockAPI: MockElectronAPI = {
      database: {
        getCurrentBankroll: vi.fn().mockResolvedValue({
          success: false,
          error: 'Bankroll error',
        }),
        updateMonthlyStatistics: vi.fn().mockResolvedValue({
          success: false,
          error: 'Stats error',
        }),
      },
    }
    vi.mocked(getElectronAPI).mockReturnValue(mockAPI as ElectronAPI)
    vi.mocked(getCurrentMonthKey).mockResolvedValue('2026-02')
    vi.mocked(getBets).mockRejectedValue(new Error('Bets error'))

    const { result } = renderHook(() => useWelcomeStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify errors were logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('❌ Bankroll error:'),
      expect.anything()
    )
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('❌ Monthly stats error:'),
      expect.anything()
    )
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('❌ Pending bets error:'),
      expect.anything()
    )

    consoleErrorSpy.mockRestore()
  })

  it('should format currency correctly in English', async () => {
    const mockAPI: MockElectronAPI = {
      database: {
        getCurrentBankroll: vi.fn().mockResolvedValue({
          success: true,
          data: mockBankroll,
        }),
        updateMonthlyStatistics: vi.fn().mockResolvedValue({
          success: true,
          data: mockMonthlyStats,
        }),
      },
    }
    vi.mocked(getElectronAPI).mockReturnValue(mockAPI as ElectronAPI)
    vi.mocked(getCurrentMonthKey).mockResolvedValue('2026-02')
    vi.mocked(getBets).mockResolvedValue([])

    // Set language to English
    await i18n.changeLanguage('en')

    const { result } = renderHook(() => useWelcomeStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Test formatCurrency function
    expect(result.current.formatCurrency(1234.56)).toBe('$1,234.56')
    expect(result.current.formatCurrency(0)).toBe('$0.00')
    // Note: toLocaleString puts minus sign before currency symbol
    expect(result.current.formatCurrency(-500.25)).toBe('$-500.25')
  })

  it('should format currency correctly in Spanish', async () => {
    const mockAPI: MockElectronAPI = {
      database: {
        getCurrentBankroll: vi.fn().mockResolvedValue({
          success: true,
          data: mockBankroll,
        }),
        updateMonthlyStatistics: vi.fn().mockResolvedValue({
          success: true,
          data: mockMonthlyStats,
        }),
      },
    }
    vi.mocked(getElectronAPI).mockReturnValue(mockAPI as ElectronAPI)
    vi.mocked(getCurrentMonthKey).mockResolvedValue('2026-02')
    vi.mocked(getBets).mockResolvedValue([])

    // Set language to Spanish
    await i18n.changeLanguage('es')

    const { result } = renderHook(() => useWelcomeStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Test formatCurrency function with Spanish locale
    expect(result.current.formatCurrency(1234.56)).toBe('$1,234.56')
    expect(result.current.formatCurrency(0)).toBe('$0.00')
    // Note: toLocaleString puts minus sign before currency symbol
    expect(result.current.formatCurrency(-500.25)).toBe('$-500.25')
  })

  it('should update formatCurrency when language changes', async () => {
    const mockAPI: MockElectronAPI = {
      database: {
        getCurrentBankroll: vi.fn().mockResolvedValue({
          success: true,
          data: mockBankroll,
        }),
        updateMonthlyStatistics: vi.fn().mockResolvedValue({
          success: true,
          data: mockMonthlyStats,
        }),
      },
    }
    vi.mocked(getElectronAPI).mockReturnValue(mockAPI as ElectronAPI)
    vi.mocked(getCurrentMonthKey).mockResolvedValue('2026-02')
    vi.mocked(getBets).mockResolvedValue([])

    // Start with English
    await i18n.changeLanguage('en')

    const { result, rerender } = renderHook(() => useWelcomeStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const formatCurrencyEn = result.current.formatCurrency

    // Change to Spanish
    await i18n.changeLanguage('es')
    rerender()

    // formatCurrency should be a new function reference
    expect(result.current.formatCurrency).not.toBe(formatCurrencyEn)
  })
})

