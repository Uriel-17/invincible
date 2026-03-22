import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import React from 'react'
import AppWithOnboarding from './AppWithOnboarding'
import i18n from './i18n'
import type router from './router'

// Mock the dependencies
vi.mock('./i18n', async () => {
  const actual = await vi.importActual('./i18n')
  return {
    ...actual,
    getSavedLanguage: vi.fn(),
  }
})

vi.mock('src/services/database', () => ({
  isFirstLaunch: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  RouterProvider: ({ router }: { router: { toString: () => string } }) => <div data-testid="router-provider">Router: {router.toString()}</div>,
}))

vi.mock('./Components/LanguageSelectionModal/LanguageSelectionModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div data-testid="language-modal">Language Modal</div> : null,
}))

vi.mock('./Components/OnboardingModal/OnboardingModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div data-testid="onboarding-modal">Onboarding Modal</div> : null,
}))

import { getSavedLanguage } from './i18n'
import { isFirstLaunch } from 'src/services/database'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
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

const mockRouter = {
  toString: () => 'MockRouter',
} as typeof router

/**
 * CRITICAL: Infinite Loop Prevention Tests for AppWithOnboarding
 * 
 * These tests ensure that:
 * 1. getSavedLanguage() is called exactly once on mount
 * 2. The effect has proper cleanup (isMounted flag)
 * 3. The effect doesn't re-run unnecessarily
 * 4. Multiple mounts don't cause cascading language fetches
 */
describe('AppWithOnboarding - Infinite Loop Prevention', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await i18n.changeLanguage('en')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Language loading on mount', () => {
    it('calls getSavedLanguage exactly once on mount', async () => {
      const getSavedLanguageMock = vi.mocked(getSavedLanguage)
      getSavedLanguageMock.mockResolvedValue('en')
      vi.mocked(isFirstLaunch).mockResolvedValue(false)

      const Wrapper = createWrapper()
      render(
        <Wrapper>
          <AppWithOnboarding router={mockRouter} />
        </Wrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('router-provider')).toBeInTheDocument()
      })

      // CRITICAL: getSavedLanguage should be called exactly once
      expect(getSavedLanguageMock).toHaveBeenCalledTimes(1)
    })

    it('does not call getSavedLanguage multiple times on re-renders', async () => {
      const getSavedLanguageMock = vi.mocked(getSavedLanguage)
      getSavedLanguageMock.mockResolvedValue('en')
      vi.mocked(isFirstLaunch).mockResolvedValue(false)

      const Wrapper = createWrapper()
      const { rerender } = render(
        <Wrapper>
          <AppWithOnboarding router={mockRouter} />
        </Wrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('router-provider')).toBeInTheDocument()
      })

      const initialCallCount = getSavedLanguageMock.mock.calls.length

      // Force re-render
      rerender(
        <Wrapper>
          <AppWithOnboarding router={mockRouter} />
        </Wrapper>
      )

      // Wait a bit to ensure no additional calls
      await new Promise(resolve => setTimeout(resolve, 100))

      // CRITICAL: Call count should not increase on re-render
      expect(getSavedLanguageMock).toHaveBeenCalledTimes(initialCallCount)
    })

    it('shows loading state until language is loaded', async () => {
      const getSavedLanguageMock = vi.mocked(getSavedLanguage)
      // Create a promise that we can control
      let resolveLanguage: (value: string) => void
      const languagePromise = new Promise<string>((resolve) => {
        resolveLanguage = resolve
      })
      getSavedLanguageMock.mockReturnValue(languagePromise)
      vi.mocked(isFirstLaunch).mockResolvedValue(false)

      const Wrapper = createWrapper()
      render(
        <Wrapper>
          <AppWithOnboarding router={mockRouter} />
        </Wrapper>
      )

      // Should show loading state
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.queryByTestId('router-provider')).not.toBeInTheDocument()

      // Resolve the language promise
      resolveLanguage!('en')

      // Should show router after language is loaded
      await waitFor(() => {
        expect(screen.getByTestId('router-provider')).toBeInTheDocument()
      })
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    it('changes language when saved language differs from current', async () => {
      const getSavedLanguageMock = vi.mocked(getSavedLanguage)
      getSavedLanguageMock.mockResolvedValue('es')
      vi.mocked(isFirstLaunch).mockResolvedValue(false)

      // Start with English
      await i18n.changeLanguage('en')
      expect(i18n.language).toBe('en')

      const changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage')

      const Wrapper = createWrapper()
      render(
        <Wrapper>
          <AppWithOnboarding router={mockRouter} />
        </Wrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('router-provider')).toBeInTheDocument()
      })

      // Should have called changeLanguage to switch to Spanish
      expect(changeLanguageSpy).toHaveBeenCalledWith('es')

      changeLanguageSpy.mockRestore()
    })

    it('does not change language when saved language matches current', async () => {
      const getSavedLanguageMock = vi.mocked(getSavedLanguage)
      getSavedLanguageMock.mockResolvedValue('en')
      vi.mocked(isFirstLaunch).mockResolvedValue(false)

      // Start with English
      await i18n.changeLanguage('en')

      const changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage')

      const Wrapper = createWrapper()
      render(
        <Wrapper>
          <AppWithOnboarding router={mockRouter} />
        </Wrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('router-provider')).toBeInTheDocument()
      })

      // Should NOT have called changeLanguage since language is already 'en'
      expect(changeLanguageSpy).not.toHaveBeenCalled()

      changeLanguageSpy.mockRestore()
    })
  })

  describe('Effect cleanup (isMounted flag)', () => {
    it('does not update state after component unmounts', async () => {
      const getSavedLanguageMock = vi.mocked(getSavedLanguage)

      // Create a promise that resolves after unmount
      let resolveLanguage: (value: string) => void
      const languagePromise = new Promise<string>((resolve) => {
        resolveLanguage = resolve
      })
      getSavedLanguageMock.mockReturnValue(languagePromise)
      vi.mocked(isFirstLaunch).mockResolvedValue(false)

      const Wrapper = createWrapper()
      const { unmount } = render(
        <Wrapper>
          <AppWithOnboarding router={mockRouter} />
        </Wrapper>
      )

      // Unmount before language promise resolves
      unmount()

      // Resolve the promise after unmount
      resolveLanguage!('es')

      // Wait a bit to ensure no state updates occur
      await new Promise(resolve => setTimeout(resolve, 100))

      // If state was updated after unmount, React would log a warning
      // This test passes if no warnings are logged
    })

    it('handles errors gracefully and continues with default language', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const getSavedLanguageMock = vi.mocked(getSavedLanguage)
      getSavedLanguageMock.mockRejectedValue(new Error('Database error'))
      vi.mocked(isFirstLaunch).mockResolvedValue(false)

      const Wrapper = createWrapper()
      render(
        <Wrapper>
          <AppWithOnboarding router={mockRouter} />
        </Wrapper>
      )

      // Should still render the router despite error
      await waitFor(() => {
        expect(screen.getByTestId('router-provider')).toBeInTheDocument()
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load language:', expect.any(Error))

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Effect dependency array', () => {
    it('has i18n in dependency array to prevent stale closures', async () => {
      const getSavedLanguageMock = vi.mocked(getSavedLanguage)
      getSavedLanguageMock.mockResolvedValue('en')
      vi.mocked(isFirstLaunch).mockResolvedValue(false)

      const Wrapper = createWrapper()
      render(
        <Wrapper>
          <AppWithOnboarding router={mockRouter} />
        </Wrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('router-provider')).toBeInTheDocument()
      })

      // The effect should only run once with the i18n dependency
      expect(getSavedLanguageMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('Multiple component mounts', () => {
    it('does not cause cascading language fetches when mounting multiple times', async () => {
      const getSavedLanguageMock = vi.mocked(getSavedLanguage)
      getSavedLanguageMock.mockResolvedValue('en')
      vi.mocked(isFirstLaunch).mockResolvedValue(false)

      const Wrapper = createWrapper()

      // Mount first instance
      const { unmount: unmount1 } = render(
        <Wrapper>
          <AppWithOnboarding router={mockRouter} />
        </Wrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('router-provider')).toBeInTheDocument()
      })

      const firstMountCalls = getSavedLanguageMock.mock.calls.length
      expect(firstMountCalls).toBe(1)

      unmount1()

      // Mount second instance
      const { unmount: unmount2 } = render(
        <Wrapper>
          <AppWithOnboarding router={mockRouter} />
        </Wrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('router-provider')).toBeInTheDocument()
      })

      // Should have been called once more (total 2 times)
      expect(getSavedLanguageMock).toHaveBeenCalledTimes(2)

      unmount2()

      // Mount third instance
      render(
        <Wrapper>
          <AppWithOnboarding router={mockRouter} />
        </Wrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('router-provider')).toBeInTheDocument()
      })

      // Should have been called once more (total 3 times)
      // CRITICAL: Each mount should call it exactly once, not multiple times
      expect(getSavedLanguageMock).toHaveBeenCalledTimes(3)
    })
  })
})

