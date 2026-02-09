import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import React from 'react'
import CreatePickModal from 'src/Pages/Welcome/Components/CreatePickModal'
import i18n from 'src/i18n'

// Mock useCreateBet hook
vi.mock('src/hooks/useCreateBet', () => ({
  useCreateBet: vi.fn(() => ({
    mutate: vi.fn(),
    error: null,
    isError: false,
    isPending: false,
  })),
}))

// Mock CreatePickForm component
vi.mock('src/Pages/CreatePick/CreatePickForm', () => ({
  default: ({ onSubmit, actions }: { onSubmit: () => void; actions: React.ReactNode }) => (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div data-testid="create-pick-form">Form Fields</div>
      {actions}
    </form>
  ),
}))

// Mock FormActions component
vi.mock('src/Pages/Welcome/Components/FormActions', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div>
      <button type="button" onClick={onClose}>Cancel</button>
      <button type="submit">Submit</button>
    </div>
  ),
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

describe('CreatePickModal - Phase 1 Regression Tests', () => {
  describe('1.1 Modal Behavior Tests', () => {
    it('should render when isOpen is true', () => {
      render(<CreatePickModal isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /Create pick/i })).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<CreatePickModal isOpen={false} onClose={vi.fn()} />, { wrapper: createWrapper() })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should NOT close when clicking overlay (based on code structure)', async () => {
      const user = userEvent.setup()
      
      render(<CreatePickModal isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
      
      const overlay = screen.getByRole('presentation')
      await user.click(overlay)
      
      // Modal should still be visible (no onClick handler on overlay)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should NOT close when clicking inside the dialog', async () => {
      const user = userEvent.setup()
      
      render(<CreatePickModal isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
      
      const dialog = screen.getByRole('dialog')
      await user.click(dialog)
      
      // Modal should still be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should call onClose when Cancel button is clicked', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      
      render(<CreatePickModal isOpen={true} onClose={onClose} />, { wrapper: createWrapper() })
      
      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      await user.click(cancelButton)
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should render the CreatePickForm component', () => {
      render(<CreatePickModal isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
      
      expect(screen.getByTestId('create-pick-form')).toBeInTheDocument()
    })
  })

  describe('1.2 Modal Accessibility Tests', () => {
    it('should have proper ARIA attributes', () => {
      render(<CreatePickModal isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'create-pick-title')
    })

    it('should have accessible title', () => {
      render(<CreatePickModal isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() })

      const title = screen.getByRole('heading', { name: /Create pick/i })
      expect(title).toHaveAttribute('id', 'create-pick-title')
    })
  })

  describe('1.3 Modal Styling Tests', () => {
    it('should have correct overlay CSS class with lighter opacity', () => {
      render(<CreatePickModal isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() })

      const overlay = screen.getByRole('presentation')

      // Verify the correct CSS class is applied
      // Note: CreatePickModal intentionally uses lighter overlay opacity (0.45)
      // The actual styles are tested in css-duplication.test.ts
      expect(overlay).toHaveClass('create-pick-overlay')
    })

    it('should have correct dialog CSS class', () => {
      render(<CreatePickModal isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() })

      const dialog = screen.getByRole('dialog')

      // Verify the correct CSS class is applied
      // The actual styles are tested in css-duplication.test.ts
      expect(dialog).toHaveClass('create-pick-dialog')
    })
  })
})

