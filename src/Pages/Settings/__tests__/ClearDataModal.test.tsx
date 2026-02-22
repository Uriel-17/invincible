import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import React from 'react'
import ClearDataModal from 'src/Pages/Settings/ClearDataModal'
import i18n from 'src/i18n'
import type { ElectronAPI } from 'src/types/electron'

// Mock Electron API
const mockElectronAPI: Partial<ElectronAPI> = {
  database: {
    clearAllData: vi.fn().mockResolvedValue({ success: true }),
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

describe('ClearDataModal - Phase 1 Regression Tests', () => {
  describe('1.1 Modal Behavior Tests', () => {
    it('should render when isOpen is true', () => {
      render(<ClearDataModal isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /Clear All Data/i })).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<ClearDataModal isOpen={false} onClose={vi.fn()} />, { wrapper: createWrapper() })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should call onClose when overlay is clicked', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      
      render(<ClearDataModal isOpen={true} onClose={onClose} />, { wrapper: createWrapper() })
      
      const overlay = screen.getByRole('presentation')
      await user.click(overlay)
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should NOT close when clicking inside the dialog', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      
      render(<ClearDataModal isOpen={true} onClose={onClose} />, { wrapper: createWrapper() })
      
      const dialog = screen.getByRole('dialog')
      await user.click(dialog)
      
      expect(onClose).not.toHaveBeenCalled()
    })

    it('should call onClose when Cancel button is clicked', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      
      render(<ClearDataModal isOpen={true} onClose={onClose} />, { wrapper: createWrapper() })
      
      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      await user.click(cancelButton)
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should have confirm button disabled until "DELETE" is typed', async () => {
      const user = userEvent.setup()

      render(<ClearDataModal isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() })

      const confirmButton = screen.getByRole('button', { name: /Clear All Data/i })
      expect(confirmButton).toBeDisabled()

      const input = screen.getByPlaceholderText('DELETE')
      await user.type(input, 'DELETE')

      expect(confirmButton).not.toBeDisabled()
    })

    it('should call clearAllData when confirm button is clicked with valid input', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()

      render(<ClearDataModal isOpen={true} onClose={onClose} />, { wrapper: createWrapper() })

      const input = screen.getByPlaceholderText('DELETE')
      await user.type(input, 'DELETE')

      const confirmButton = screen.getByRole('button', { name: /Clear All Data/i })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockElectronAPI.database?.clearAllData).toHaveBeenCalled()
      })
    })
  })

  describe('1.2 Modal Accessibility Tests', () => {
    it('should have proper ARIA attributes', () => {
      render(<ClearDataModal isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'clear-data-title')
    })

    it('should have accessible title', () => {
      render(<ClearDataModal isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() })

      const title = screen.getByRole('heading', { name: /Clear All Data/i })
      expect(title).toHaveAttribute('id', 'clear-data-title')
    })
  })

  describe('1.3 Modal Styling Tests', () => {
    it('should have correct overlay CSS class', () => {
      render(<ClearDataModal isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() })

      const overlay = screen.getByRole('presentation')

      // Verify the correct CSS class is applied
      // The actual styles are tested in css-duplication.test.ts
      expect(overlay).toHaveClass('clear-data-overlay')
    })

    it('should have correct dialog CSS class', () => {
      render(<ClearDataModal isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() })

      const dialog = screen.getByRole('dialog')

      // Verify the correct CSS class is applied
      // The actual styles are tested in css-duplication.test.ts
      expect(dialog).toHaveClass('clear-data-dialog')
    })
  })
})

