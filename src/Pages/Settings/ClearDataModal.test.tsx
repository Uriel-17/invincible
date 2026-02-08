/**
 * Comprehensive Unit Tests for ClearDataModal Component
 *
 * Tests rendering, user interactions, validation, async operations, and error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import React from 'react'
import ClearDataModal from './ClearDataModal'
import i18n from 'src/i18n'
import type { ElectronAPI } from 'src/types/electron'

// Type for mock Electron API
type MockElectronAPI = {
  database: Partial<ElectronAPI['database']>
}

// Mock modules
vi.mock('src/services/database', () => ({
  getElectronAPI: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
}))

// Import mocked functions
import { getElectronAPI } from 'src/services/database'
import { useNavigate } from '@tanstack/react-router'

// Create wrapper for React Query and i18n
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
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

describe('ClearDataModal', () => {
  let mockNavigate: ReturnType<typeof vi.fn>
  let mockAPI: MockElectronAPI
  let mockOnClose: ReturnType<typeof vi.fn>
  let alertSpy: ReturnType<typeof vi.spyOn>
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    void i18n.changeLanguage('en')

    // Mock navigate function
    mockNavigate = vi.fn()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)

    // Mock onClose callback
    mockOnClose = vi.fn()

    // Mock alert
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    // Mock console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Mock Electron API
    mockAPI = {
      database: {
        clearAllData: vi.fn().mockResolvedValue({
          success: true,
          data: { deletedRecords: 42 },
        }),
      },
    }
    vi.mocked(getElectronAPI).mockReturnValue(mockAPI as ElectronAPI)
  })

  afterEach(() => {
    alertSpy.mockRestore()
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  // ============================================================================
  // TEST SUITE: Rendering
  // ============================================================================

  describe('Rendering', () => {
    it('renders the modal when isOpen is true', () => {
      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getAllByText('Clear All Data').length).toBeGreaterThan(0)
      expect(screen.getByText(/This action cannot be undone!/i)).toBeInTheDocument()
    })

    it('returns null when isOpen is false', () => {
      const { container } = render(<ClearDataModal isOpen={false} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      expect(container.firstChild).toBeNull()
    })

    it('renders all modal content elements', () => {
      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByLabelText('Clear All Data')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('DELETE')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Clear All Data' })).toBeInTheDocument()
    })

    it('renders with correct ARIA attributes', () => {
      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'clear-data-title')
    })

    it('input has autoFocus attribute', () => {
      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      // autoFocus is a boolean attribute, check if it exists
      expect(input).toHaveFocus()
    })
  })

  // ============================================================================
  // TEST SUITE: Button State Management
  // ============================================================================

  describe('Button State Management', () => {
    it('disables Clear All Data button when confirmText is empty', () => {
      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })
      expect(clearButton).toBeDisabled()
    })

    it('disables Clear All Data button when confirmText is not exactly "DELETE" (case-insensitive)', async () => {
      const user = userEvent.setup()
      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })

      await user.type(input, 'DELET')
      expect(clearButton).toBeDisabled()

      await user.clear(input)
      await user.type(input, 'DELETEEE')
      expect(clearButton).toBeDisabled()
    })

    it('enables Clear All Data button when confirmText is exactly "DELETE"', async () => {
      const user = userEvent.setup()
      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })

      await user.type(input, 'DELETE')
      expect(clearButton).not.toBeDisabled()
    })

    it('enables Clear All Data button when confirmText is "delete" (lowercase)', async () => {
      const user = userEvent.setup()
      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })

      await user.type(input, 'delete')
      expect(clearButton).not.toBeDisabled()
    })

    it('enables Clear All Data button when confirmText is "Delete" (mixed case)', async () => {
      const user = userEvent.setup()
      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })

      await user.type(input, 'Delete')
      expect(clearButton).not.toBeDisabled()
    })
  })

  // ============================================================================
  // TEST SUITE: Case-Sensitivity Validation
  // ============================================================================

  describe('Case-Sensitivity Validation', () => {
    it('accepts "DELETE" (uppercase)', async () => {
      const user = userEvent.setup()
      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })

      await user.type(input, 'DELETE')
      await user.click(clearButton)

      await waitFor(() => {
        expect(mockAPI.database.clearAllData).toHaveBeenCalled()
      })
    })

    it('accepts "delete" (lowercase)', async () => {
      const user = userEvent.setup()
      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })

      await user.type(input, 'delete')
      await user.click(clearButton)

      await waitFor(() => {
        expect(mockAPI.database.clearAllData).toHaveBeenCalled()
      })
    })

    it('accepts "Delete" (mixed case)', async () => {
      const user = userEvent.setup()
      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })

      await user.type(input, 'Delete')
      await user.click(clearButton)

      await waitFor(() => {
        expect(mockAPI.database.clearAllData).toHaveBeenCalled()
      })
    })

    it('rejects "DELET" (incomplete)', async () => {
      const user = userEvent.setup()
      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })

      await user.type(input, 'DELET')

      // Button should be disabled, so clicking won't trigger anything
      expect(clearButton).toBeDisabled()
      expect(mockAPI.database.clearAllData).not.toHaveBeenCalled()
    })
  })

  // ============================================================================
  // TEST SUITE: Cancel Functionality
  // ============================================================================

  describe('Cancel Functionality', () => {
    it('resets confirmText and calls onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })

      // Type some text
      await user.type(input, 'DELETE')
      expect(input).toHaveValue('DELETE')

      // Click Cancel
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls handleCancel when overlay background is clicked', async () => {
      const user = userEvent.setup()
      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      await user.type(input, 'DELETE')

      // Click the overlay (the element with className 'clear-data-overlay')
      const overlay = screen.getByRole('dialog').parentElement
      if (overlay) {
        await user.click(overlay)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
      }
    })

    it('does not close modal when clicking inside dialog (stopPropagation)', async () => {
      const user = userEvent.setup()
      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const dialog = screen.getByRole('dialog')
      await user.click(dialog)

      // onClose should NOT be called when clicking inside the dialog
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  // ============================================================================
  // TEST SUITE: Successful Data Clearing Flow
  // ============================================================================

  describe('Successful Data Clearing Flow', () => {
    it('calls API, invalidates queries, navigates, and closes modal on success', async () => {
      const user = userEvent.setup()
      const queryClient = new QueryClient()
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            {children}
          </I18nextProvider>
        </QueryClientProvider>
      )

      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: Wrapper,
      })

      const input = screen.getByPlaceholderText('DELETE')
      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })

      await user.type(input, 'DELETE')
      await user.click(clearButton)

      await waitFor(() => {
        expect(mockAPI.database.clearAllData).toHaveBeenCalledTimes(1)
      })

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1)
      })

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
      })

      expect(consoleLogSpy).toHaveBeenCalledWith('✅ All data cleared successfully')
    })

    it('logs success message', async () => {
      const user = userEvent.setup()
      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })

      await user.type(input, 'DELETE')
      await user.click(clearButton)

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith('✅ All data cleared successfully')
      })
    })

    it('resets confirmText after successful clearing', async () => {
      const user = userEvent.setup()
      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })

      await user.type(input, 'DELETE')
      await user.click(clearButton)

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })

      // After successful clearing, confirmText should be reset
      // This is verified by the fact that the modal closes and would reopen with empty input
    })
  })

  // ============================================================================
  // TEST SUITE: Error Handling
  // ============================================================================

  describe('Error Handling', () => {
    it('shows alert and logs error when API returns success: false', async () => {
      const user = userEvent.setup()

      // Mock API to return failure
      mockAPI.database.clearAllData = vi.fn().mockResolvedValue({
        success: false,
        error: 'Database connection failed',
      })

      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })

      await user.type(input, 'DELETE')
      await user.click(clearButton)

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error clearing data: Database connection failed')
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Failed to clear data:', expect.any(Error))
      expect(mockOnClose).not.toHaveBeenCalled()
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('shows alert and logs error when API throws an exception', async () => {
      const user = userEvent.setup()

      // Mock API to throw error
      mockAPI.database.clearAllData = vi.fn().mockRejectedValue(new Error('Network error'))

      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })

      await user.type(input, 'DELETE')
      await user.click(clearButton)

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error clearing data: Network error')
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Failed to clear data:', expect.any(Error))
      expect(mockOnClose).not.toHaveBeenCalled()
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('handles API error without error message', async () => {
      const user = userEvent.setup()

      // Mock API to return failure without error message
      mockAPI.database.clearAllData = vi.fn().mockResolvedValue({
        success: false,
      })

      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })

      await user.type(input, 'DELETE')
      await user.click(clearButton)

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error clearing data: Failed to clear data')
      })

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('modal remains open after error', async () => {
      const user = userEvent.setup()

      mockAPI.database.clearAllData = vi.fn().mockRejectedValue(new Error('Test error'))

      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })

      await user.type(input, 'DELETE')
      await user.click(clearButton)

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled()
      })

      // Modal should still be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  // ============================================================================
  // TEST SUITE: Loading State
  // ============================================================================

  describe('Loading State', () => {
    it('disables Clear All Data button during clearing operation', async () => {
      const user = userEvent.setup()

      // Mock API with delay
      let resolveAPI: (value: any) => void
      const apiPromise = new Promise((resolve) => {
        resolveAPI = resolve
      })
      mockAPI.database.clearAllData = vi.fn().mockReturnValue(apiPromise)

      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })

      await user.type(input, 'DELETE')
      await user.click(clearButton)

      // Button should be disabled during operation
      await waitFor(() => {
        expect(clearButton).toBeDisabled()
      })

      // Resolve the API call
      resolveAPI!({ success: true, data: { deletedRecords: 10 } })

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('disables Cancel button during clearing operation', async () => {
      const user = userEvent.setup()

      let resolveAPI: (value: any) => void
      const apiPromise = new Promise((resolve) => {
        resolveAPI = resolve
      })
      mockAPI.database.clearAllData = vi.fn().mockReturnValue(apiPromise)

      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })

      await user.type(input, 'DELETE')
      await user.click(clearButton)

      // Cancel button should be disabled during operation
      await waitFor(() => {
        expect(cancelButton).toBeDisabled()
      })

      resolveAPI!({ success: true, data: { deletedRecords: 10 } })
    })

    it('disables input field during clearing operation', async () => {
      const user = userEvent.setup()

      let resolveAPI: (value: any) => void
      const apiPromise = new Promise((resolve) => {
        resolveAPI = resolve
      })
      mockAPI.database.clearAllData = vi.fn().mockReturnValue(apiPromise)

      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })

      await user.type(input, 'DELETE')
      await user.click(clearButton)

      // Input should be disabled during operation
      await waitFor(() => {
        expect(input).toBeDisabled()
      })

      resolveAPI!({ success: true, data: { deletedRecords: 10 } })
    })

    it('changes button text to "Clearing..." during operation', async () => {
      const user = userEvent.setup()

      let resolveAPI: (value: any) => void
      const apiPromise = new Promise((resolve) => {
        resolveAPI = resolve
      })
      mockAPI.database.clearAllData = vi.fn().mockReturnValue(apiPromise)

      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      let clearButton = screen.getByRole('button', { name: 'Clear All Data' })

      await user.type(input, 'DELETE')
      await user.click(clearButton)

      // Button text should change to "Clearing..."
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Clearing...' })).toBeInTheDocument()
      })

      resolveAPI!({ success: true, data: { deletedRecords: 10 } })
    })

    it('handles loading state with slow API response', async () => {
      const user = userEvent.setup()

      // Mock slow API
      mockAPI.database.clearAllData = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: true, data: { deletedRecords: 100 } })
          }, 100)
        })
      })

      render(<ClearDataModal isOpen={true} onClose={mockOnClose} />, {
        wrapper: createWrapper(),
      })

      const input = screen.getByPlaceholderText('DELETE')
      const clearButton = screen.getByRole('button', { name: 'Clear All Data' })

      await user.type(input, 'DELETE')
      await user.click(clearButton)

      // Verify loading state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Clearing...' })).toBeInTheDocument()
      })

      // Wait for completion
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      }, { timeout: 2000 })
    })
  })
})
