import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import React from 'react'
import LanguageSelectionModal from 'src/Components/LanguageSelectionModal/LanguageSelectionModal'
import i18n from 'src/i18n'

vi.mock('src/services/database', () => ({
  setUserSetting: vi.fn().mockResolvedValue({ success: true }),
}))

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  )
}

describe('LanguageSelectionModal - Phase 1 Regression Tests', () => {
  describe('1.1 Modal Behavior Tests', () => {
    it('should render when isOpen is true', () => {
      render(<LanguageSelectionModal isOpen={true} onLanguageSelected={vi.fn()} />, { wrapper: createWrapper() })
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/Choose Your Language/i)).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<LanguageSelectionModal isOpen={false} onLanguageSelected={vi.fn()} />, { wrapper: createWrapper() })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should NOT close when clicking overlay (no onClose prop)', async () => {
      const user = userEvent.setup()
      
      render(<LanguageSelectionModal isOpen={true} onLanguageSelected={vi.fn()} />, { wrapper: createWrapper() })
      
      const overlay = screen.getByRole('presentation')
      await user.click(overlay)
      
      // Modal should still be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should NOT close when clicking inside the dialog', async () => {
      const user = userEvent.setup()
      
      render(<LanguageSelectionModal isOpen={true} onLanguageSelected={vi.fn()} />, { wrapper: createWrapper() })
      
      const dialog = screen.getByRole('dialog')
      await user.click(dialog)
      
      // Modal should still be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should call onLanguageSelected with "en" when English button is clicked', async () => {
      const onLanguageSelected = vi.fn()
      const user = userEvent.setup()
      
      render(<LanguageSelectionModal isOpen={true} onLanguageSelected={onLanguageSelected} />, { wrapper: createWrapper() })
      
      const englishButton = screen.getByRole('button', { name: /English/i })
      await user.click(englishButton)
      
      await waitFor(() => {
        expect(onLanguageSelected).toHaveBeenCalledWith('en')
      })
    })

    it('should call onLanguageSelected with "es" when Spanish button is clicked', async () => {
      const onLanguageSelected = vi.fn()
      const user = userEvent.setup()

      render(<LanguageSelectionModal isOpen={true} onLanguageSelected={onLanguageSelected} />, { wrapper: createWrapper() })

      const spanishButton = screen.getByRole('button', { name: /Español/i })
      await user.click(spanishButton)

      await waitFor(() => {
        expect(onLanguageSelected).toHaveBeenCalledWith('es')
      })
    })
  })

  describe('1.2 Modal Accessibility Tests', () => {
    it('should have proper ARIA attributes', () => {
      render(<LanguageSelectionModal isOpen={true} onLanguageSelected={vi.fn()} />, { wrapper: createWrapper() })
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'language-selection-title')
    })

    it('should have accessible title', () => {
      render(<LanguageSelectionModal isOpen={true} onLanguageSelected={vi.fn()} />, { wrapper: createWrapper() })
      
      const title = screen.getByText(/Choose Your Language/i)
      expect(title).toHaveAttribute('id', 'language-selection-title')
    })
  })

  describe('1.3 Modal Styling Tests', () => {
    it('should have correct overlay CSS class with higher z-index', () => {
      render(<LanguageSelectionModal isOpen={true} onLanguageSelected={vi.fn()} />, { wrapper: createWrapper() })

      const overlay = screen.getByRole('presentation')

      // Verify the correct CSS class is applied
      // The actual styles (including z-index: 101) are tested in css-duplication.test.ts
      expect(overlay).toHaveClass('language-selection-overlay')
    })

    it('should have correct dialog CSS class', () => {
      render(<LanguageSelectionModal isOpen={true} onLanguageSelected={vi.fn()} />, { wrapper: createWrapper() })

      const dialog = screen.getByRole('dialog')

      // Verify the correct CSS class is applied
      // The actual styles are tested in css-duplication.test.ts
      expect(dialog).toHaveClass('language-selection-dialog')
    })
  })
})

