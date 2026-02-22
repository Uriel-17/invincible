import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import React from 'react'
import OnboardingModal from 'src/Components/OnboardingModal'
import i18n from 'src/i18n'

vi.mock('src/services/database', () => ({
  initializeUser: vi.fn().mockResolvedValue({ success: true }),
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

describe('OnboardingModal - Phase 1 Regression Tests', () => {
  describe('1.1 Modal Behavior Tests', () => {
    it('should render when isOpen is true', () => {
      render(<OnboardingModal isOpen={true} />, { wrapper: createWrapper() })
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/Welcome to Invincible!/i)).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<OnboardingModal isOpen={false} />, { wrapper: createWrapper() })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should NOT close when clicking overlay (no onClose prop)', async () => {
      const user = userEvent.setup()
      
      render(<OnboardingModal isOpen={true} />, { wrapper: createWrapper() })
      
      const overlay = screen.getByRole('presentation')
      await user.click(overlay)
      
      // Modal should still be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should NOT close when clicking inside the dialog', async () => {
      const user = userEvent.setup()
      
      render(<OnboardingModal isOpen={true} />, { wrapper: createWrapper() })
      
      const dialog = screen.getByRole('dialog')
      await user.click(dialog)
      
      // Modal should still be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should render back button when onBack prop is provided', () => {
      const onBack = vi.fn()
      
      render(<OnboardingModal isOpen={true} onBack={onBack} />, { wrapper: createWrapper() })
      
      const backButton = screen.getByRole('button', { name: /Go back to language selection/i })
      expect(backButton).toBeInTheDocument()
    })

    it('should NOT render back button when onBack prop is undefined', () => {
      render(<OnboardingModal isOpen={true} />, { wrapper: createWrapper() })
      
      const backButton = screen.queryByRole('button', { name: /Go back to language selection/i })
      expect(backButton).not.toBeInTheDocument()
    })

    it('should call onBack when back button is clicked', async () => {
      const onBack = vi.fn()
      const user = userEvent.setup()
      
      render(<OnboardingModal isOpen={true} onBack={onBack} />, { wrapper: createWrapper() })
      
      const backButton = screen.getByRole('button', { name: /Go back to language selection/i })
      await user.click(backButton)
      
      expect(onBack).toHaveBeenCalledTimes(1)
    })

    it('should have submit button disabled when form is invalid', () => {
      render(<OnboardingModal isOpen={true} />, { wrapper: createWrapper() })
      
      const submitButton = screen.getByRole('button', { name: /Get Started/i })
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit button when form is valid', async () => {
      const user = userEvent.setup()
      
      render(<OnboardingModal isOpen={true} />, { wrapper: createWrapper() })
      
      const usernameInput = screen.getByLabelText(/Username/i)
      const bankrollInput = screen.getByLabelText(/Starting Bankroll/i)
      
      await user.type(usernameInput, 'TestUser')
      await user.type(bankrollInput, '1000')
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Get Started/i })
        expect(submitButton).not.toBeDisabled()
      })
    })
  })

  describe('1.2 Modal Accessibility Tests', () => {
    it('should have proper ARIA attributes', () => {
      render(<OnboardingModal isOpen={true} />, { wrapper: createWrapper() })
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'onboarding-title')
    })

    it('should have accessible title', () => {
      render(<OnboardingModal isOpen={true} />, { wrapper: createWrapper() })
      
      const title = screen.getByText(/Welcome to Invincible!/i)
      expect(title).toHaveAttribute('id', 'onboarding-title')
    })
  })

  describe('1.3 Modal Styling Tests', () => {
    it('should have correct overlay CSS class', () => {
      render(<OnboardingModal isOpen={true} />, { wrapper: createWrapper() })

      const overlay = screen.getByRole('presentation')

      // Verify the correct CSS class is applied
      // The actual styles are tested in css-duplication.test.ts
      expect(overlay).toHaveClass('onboarding-overlay')
    })

    it('should have correct dialog CSS class', () => {
      render(<OnboardingModal isOpen={true} />, { wrapper: createWrapper() })

      const dialog = screen.getByRole('dialog')

      // Verify the correct CSS class is applied
      // The actual styles are tested in css-duplication.test.ts
      expect(dialog).toHaveClass('onboarding-dialog')
    })
  })
})

