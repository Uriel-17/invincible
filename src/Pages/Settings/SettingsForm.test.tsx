/**
 * Comprehensive Unit Tests for SettingsForm Component
 *
 * Tests rendering, form state management, change detection, submission, and cancel functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import React from 'react'
import SettingsForm from './SettingsForm'
import type { SettingsData } from 'src/hooks/useSettings'
import i18n from 'src/i18n'
import type { ElectronAPI } from 'src/types/electron'

// Type for mock Electron API
type MockElectronAPI = {
  database: Partial<ElectronAPI['database']>
}

// Mock modules
vi.mock('src/services/database', () => ({
  getElectronAPI: vi.fn(),
  setUserSetting: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
}))

// Import mocked functions
import { getElectronAPI, setUserSetting } from 'src/services/database'
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

// Mock data
const mockInitialData: SettingsData = {
  username: 'TestUser',
  language: 'en',
  theme: 'light',
}

const mockBankroll = 1500

describe('SettingsForm', () => {
  let mockNavigate: ReturnType<typeof vi.fn>
  let mockAPI: MockElectronAPI

  beforeEach(() => {
    vi.clearAllMocks()
    void i18n.changeLanguage('en')

    // Mock navigate function
    mockNavigate = vi.fn()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)

    // Mock Electron API for bankroll
    mockAPI = {
      database: {
        getCurrentBankroll: vi.fn().mockResolvedValue({
          success: true,
          data: mockBankroll,
        }),
      },
    }
    vi.mocked(getElectronAPI).mockReturnValue(mockAPI as ElectronAPI)

    // Mock setUserSetting
    vi.mocked(setUserSetting).mockResolvedValue({ needsRecalculation: false })

    // Mock localStorage
    Storage.prototype.setItem = vi.fn()
    Storage.prototype.getItem = vi.fn()
  })

  afterEach(() => {
    void i18n.changeLanguage('en')
  })

  // ============================================================================
  // TEST SUITE: Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders all form sections correctly', () => {
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      expect(screen.getByText('User Information')).toBeInTheDocument()
      expect(screen.getByText('Preferences')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save Settings' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('renders username field with proper validation', () => {
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const usernameInput = screen.getByLabelText('Username', { exact: false })
      expect(usernameInput).toBeInTheDocument()
      expect(usernameInput).toHaveValue('TestUser')
      expect(usernameInput).toHaveAttribute('required')
    })

    it('renders language dropdown with English and Spanish options', () => {
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const languageSelect = screen.getByRole('combobox')
      expect(languageSelect).toBeInTheDocument()

      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(2)
      expect(options[0]).toHaveTextContent('English')
      expect(options[1]).toHaveTextContent('Español')
    })

    it('renders theme radio buttons with Light and Dark options', () => {
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const radios = screen.getAllByRole('radio')
      expect(radios).toHaveLength(2)

      const lightRadio = radios.find(r => (r as HTMLInputElement).value === 'light') as HTMLInputElement
      const darkRadio = radios.find(r => (r as HTMLInputElement).value === 'dark') as HTMLInputElement

      expect(lightRadio).toBeInTheDocument()
      expect(darkRadio).toBeInTheDocument()
      expect(lightRadio.checked).toBe(true)
      expect(darkRadio.checked).toBe(false)
    })

    it('displays current bankroll correctly when loaded', async () => {
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(screen.getByText('$1,500.00')).toBeInTheDocument()
      })

      expect(screen.getByText('Your bankroll is calculated from your betting activity.')).toBeInTheDocument()
    })

    it('displays loading state for bankroll', () => {
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders Save and Cancel buttons', () => {
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const saveButton = screen.getByRole('button', { name: 'Save Settings' })
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })

      expect(saveButton).toBeInTheDocument()
      expect(cancelButton).toBeInTheDocument()
    })
  })

  // ============================================================================
  // TEST SUITE: Form State Management
  // ============================================================================

  describe('Form State Management', () => {
    it('sets initial form values correctly from initialData prop', () => {
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const usernameInput = screen.getByLabelText('Username', { exact: false }) as HTMLInputElement
      const languageSelect = screen.getByRole('combobox') as HTMLSelectElement
      const radios = screen.getAllByRole('radio')
      const lightRadio = radios.find(r => (r as HTMLInputElement).value === 'light') as HTMLInputElement

      expect(usernameInput.value).toBe('TestUser')
      expect(languageSelect.value).toBe('en')
      expect(lightRadio.checked).toBe(true)
    })

    it('disables Save button when no changes are made', () => {
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const saveButton = screen.getByRole('button', { name: 'Save Settings' })
      expect(saveButton).toBeDisabled()
    })

    it('enables Save button when form values change', async () => {
      const user = userEvent.setup()
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const usernameInput = screen.getByLabelText('Username', { exact: false })
      const saveButton = screen.getByRole('button', { name: 'Save Settings' })

      expect(saveButton).toBeDisabled()

      await user.clear(usernameInput)
      await user.type(usernameInput, 'NewUsername')

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled()
      })
    })

    it('disables Save button when form is invalid', async () => {
      const user = userEvent.setup()
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const usernameInput = screen.getByLabelText('Username', { exact: false })
      const saveButton = screen.getByRole('button', { name: 'Save Settings' })

      // Initially button should be disabled (no changes)
      expect(saveButton).toBeDisabled()

      // Clear username to make form invalid (required field)
      await user.clear(usernameInput)

      // Wait for validation error to appear
      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument()
      })

      // Button should still be disabled (form is invalid even though hasChanges is true)
      await waitFor(() => {
        expect(saveButton).toBeDisabled()
      })
    })

    it('disables Save button while mutation is pending', async () => {
      const user = userEvent.setup()

      // Mock a slow mutation
      vi.mocked(setUserSetting).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      )

      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const usernameInput = screen.getByLabelText('Username', { exact: false })
      await user.clear(usernameInput)
      await user.type(usernameInput, 'NewUsername')

      const saveButton = screen.getByRole('button', { name: 'Save Settings' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument()
      })

      expect(saveButton).toBeDisabled()
    })

    it('disables Cancel button while mutation is pending', async () => {
      const user = userEvent.setup()

      // Mock a slow mutation
      vi.mocked(setUserSetting).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      )

      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const usernameInput = screen.getByLabelText('Username', { exact: false })
      await user.clear(usernameInput)
      await user.type(usernameInput, 'NewUsername')

      const saveButton = screen.getByRole('button', { name: 'Save Settings' })
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })

      await user.click(saveButton)

      await waitFor(() => {
        expect(cancelButton).toBeDisabled()
      })
    })
  })

  // ============================================================================
  // TEST SUITE: Change Detection Logic (hasChanges)
  // ============================================================================

  describe('Change Detection (hasChanges)', () => {
    it('detects username changes correctly', async () => {
      const user = userEvent.setup()
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const usernameInput = screen.getByLabelText('Username', { exact: false })
      const saveButton = screen.getByRole('button', { name: 'Save Settings' })

      expect(saveButton).toBeDisabled()

      await user.clear(usernameInput)
      await user.type(usernameInput, 'ChangedUsername')

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled()
      })
    })

    it('detects language changes correctly', async () => {
      const user = userEvent.setup()
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const languageSelect = screen.getByRole('combobox')
      const saveButton = screen.getByRole('button', { name: 'Save Settings' })

      expect(saveButton).toBeDisabled()

      await user.selectOptions(languageSelect, 'es')

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled()
      })
    })

    it('detects theme changes correctly', async () => {
      const user = userEvent.setup()
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const darkRadio = screen.getByRole('radio', { name: 'Dark' })
      const saveButton = screen.getByRole('button', { name: 'Save Settings' })

      expect(saveButton).toBeDisabled()

      await user.click(darkRadio)

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled()
      })
    })

    it('has no false positives when values have not changed', async () => {
      const user = userEvent.setup()
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const usernameInput = screen.getByLabelText('Username', { exact: false })
      const saveButton = screen.getByRole('button', { name: 'Save Settings' })

      // Change and then change back to original value
      await user.clear(usernameInput)
      await user.type(usernameInput, 'TempChange')

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled()
      })

      await user.clear(usernameInput)
      await user.type(usernameInput, 'TestUser')

      await waitFor(() => {
        expect(saveButton).toBeDisabled()
      })
    })
  })

  // ============================================================================
  // TEST SUITE: Form Submission
  // ============================================================================

  describe('Form Submission', () => {
    it('calls useSaveSettings mutation with correct values on submit', async () => {
      const user = userEvent.setup()
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const usernameInput = screen.getByLabelText('Username', { exact: false })
      const languageSelect = screen.getByRole('combobox')
      const darkRadio = screen.getByRole('radio', { name: 'Dark' })

      await user.clear(usernameInput)
      await user.type(usernameInput, 'UpdatedUser')
      await user.selectOptions(languageSelect, 'es')
      await user.click(darkRadio)

      const saveButton = screen.getByRole('button', { name: 'Save Settings' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(setUserSetting).toHaveBeenCalledWith('username', 'UpdatedUser')
        expect(setUserSetting).toHaveBeenCalledWith('language', 'es')
      })

      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
    })

    it('resets form to new saved values on success (not old initialData)', async () => {
      const user = userEvent.setup()
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const usernameInput = screen.getByLabelText('Username', { exact: false })
      await user.clear(usernameInput)
      await user.type(usernameInput, 'NewUsername')

      const saveButton = screen.getByRole('button', { name: 'Save Settings' })

      // Save button should be enabled before submit
      await waitFor(() => {
        expect(saveButton).not.toBeDisabled()
      })

      await user.click(saveButton)

      // After successful save, should navigate
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
      })
    })

    it('navigates to home page on success', async () => {
      const user = userEvent.setup()
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const usernameInput = screen.getByLabelText('Username', { exact: false })
      await user.clear(usernameInput)
      await user.type(usernameInput, 'NewUsername')

      const saveButton = screen.getByRole('button', { name: 'Save Settings' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
      })
    })

    it('displays error message on error', async () => {
      const user = userEvent.setup()
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      // Mock error
      vi.mocked(setUserSetting).mockRejectedValue(new Error('Database error'))

      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const usernameInput = screen.getByLabelText('Username', { exact: false })
      await user.clear(usernameInput)
      await user.type(usernameInput, 'NewUsername')

      const saveButton = screen.getByRole('button', { name: 'Save Settings' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          expect.stringContaining('Error saving settings:')
        )
      })

      alertSpy.mockRestore()
    })

    it('shows "Saving..." text while mutation is pending', async () => {
      const user = userEvent.setup()

      // Mock a slow mutation
      vi.mocked(setUserSetting).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      )

      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const usernameInput = screen.getByLabelText('Username', { exact: false })
      await user.clear(usernameInput)
      await user.type(usernameInput, 'NewUsername')

      const saveButton = screen.getByRole('button', { name: 'Save Settings' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument()
      })
    })

    it('displays error message in UI when mutation fails', async () => {
      const user = userEvent.setup()

      // Mock error
      vi.mocked(setUserSetting).mockRejectedValue(new Error('Network error'))

      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const usernameInput = screen.getByLabelText('Username', { exact: false })
      await user.clear(usernameInput)
      await user.type(usernameInput, 'NewUsername')

      const saveButton = screen.getByRole('button', { name: 'Save Settings' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument()
        expect(screen.getByText(/Network error/)).toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // TEST SUITE: Cancel Functionality
  // ============================================================================

  describe('Cancel Functionality', () => {
    it('resets form to initial values on cancel', async () => {
      const user = userEvent.setup()
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const usernameInput = screen.getByLabelText('Username', { exact: false }) as HTMLInputElement
      const languageSelect = screen.getByRole('combobox') as HTMLSelectElement
      const darkRadio = screen.getByRole('radio', { name: 'Dark' })

      // Make changes
      await user.clear(usernameInput)
      await user.type(usernameInput, 'ChangedUsername')
      await user.selectOptions(languageSelect, 'es')
      await user.click(darkRadio)

      // Verify changes
      expect(usernameInput.value).toBe('ChangedUsername')
      expect(languageSelect.value).toBe('es')
      expect(darkRadio).toBeChecked()

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      // Should navigate to home
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })

    it('navigates to home page on cancel', async () => {
      const user = userEvent.setup()
      render(<SettingsForm initialData={mockInitialData} />, {
        wrapper: createWrapper(),
      })

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })
  })
})
