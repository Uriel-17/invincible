import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import React from 'react'
import AddFundsModal from 'src/Components/Header/AddFundsModal'
import i18n from 'src/i18n'
import type { ElectronAPI } from 'src/types/electron'

const mockElectronAPI: Partial<ElectronAPI> = {
  database: {
    addFunds: vi.fn().mockResolvedValue({ success: true }),
    getCurrentBankroll: vi.fn().mockResolvedValue(1000),
  } as Partial<ElectronAPI['database']> as ElectronAPI['database'],
}

vi.mock('src/services/database', () => ({
  getElectronAPI: () => mockElectronAPI,
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
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

describe('AddFundsModal - Phase 1 Regression Tests', () => {
  describe('1.1 Modal Behavior Tests', () => {
    it('should render when isOpen is true', () => {
      render(<AddFundsModal isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/Add Funds to Bankroll/i)).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<AddFundsModal isOpen={false} onClose={vi.fn()} />, { wrapper: createWrapper() })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should call onClose when overlay is clicked', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      
      render(<AddFundsModal isOpen={true} onClose={onClose} />, { wrapper: createWrapper() })
      
      const overlay = screen.getByRole('presentation')
      await user.click(overlay)
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should NOT close when clicking inside the dialog', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      
      render(<AddFundsModal isOpen={true} onClose={onClose} />, { wrapper: createWrapper() })
      
      const dialog = screen.getByRole('dialog')
      await user.click(dialog)
      
      expect(onClose).not.toHaveBeenCalled()
    })

    it('should call onClose when Cancel button is clicked', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      
      render(<AddFundsModal isOpen={true} onClose={onClose} />, { wrapper: createWrapper() })
      
      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      await user.click(cancelButton)
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should submit form when valid data is entered', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      
      render(<AddFundsModal isOpen={true} onClose={onClose} />, { wrapper: createWrapper() })
      
      const amountInput = screen.getByLabelText(/Amount to Add/i)
      const submitButton = screen.getByRole('button', { name: /Add Funds/i })
      
      await user.type(amountInput, '500')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockElectronAPI.database?.addFunds).toHaveBeenCalledWith(500)
      })
    })
  })

  describe('1.2 Modal Accessibility Tests', () => {
    it('should have proper ARIA attributes', () => {
      render(<AddFundsModal isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'add-funds-title')
    })

    it('should have accessible title', () => {
      render(<AddFundsModal isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
      
      const title = screen.getByText(/Add Funds to Bankroll/i)
      expect(title).toHaveAttribute('id', 'add-funds-title')
    })
  })

  describe('1.3 Modal Styling Tests', () => {
    it('should have correct overlay CSS class', () => {
      render(<AddFundsModal isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() })

      const overlay = screen.getByRole('presentation')

      // Verify the correct CSS class is applied
      // The actual styles are tested in css-duplication.test.ts
      expect(overlay).toHaveClass('add-funds-overlay')
    })

    it('should have correct dialog CSS class', () => {
      render(<AddFundsModal isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() })

      const dialog = screen.getByRole('dialog')

      // Verify the correct CSS class is applied
      // The actual styles are tested in css-duplication.test.ts
      expect(dialog).toHaveClass('add-funds-dialog')
    })
  })
})

