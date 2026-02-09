import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ElectronAPI } from './types/electron'

/**
 * CRITICAL: Integration Tests for Infinite Loop Prevention
 *
 * These tests verify that importing the i18n module multiple times
 * (simulating Vite HMR reloads) does NOT trigger database queries.
 *
 * This is the core integration test that would have caught the infinite
 * reload loop bug before it reached production.
 */
describe('i18n Module Import Integration Tests', () => {
  let mockGetUserSetting: ReturnType<typeof vi.fn>
  let originalElectronAPI: ElectronAPI | undefined

  beforeEach(() => {
    // Save original electronAPI
    originalElectronAPI = window.electronAPI

    // Create a mock that tracks calls
    mockGetUserSetting = vi.fn().mockResolvedValue({
      success: true,
      data: 'en'
    })

    // Set up mock electronAPI (partial mock for testing)
    const mockAPI = {
      database: {
        getUserSetting: mockGetUserSetting
      }
    }
    ;(window as { electronAPI?: ElectronAPI }).electronAPI = mockAPI as unknown as ElectronAPI
  })

  afterEach(() => {
    // Restore original electronAPI
    if (originalElectronAPI) {
      window.electronAPI = originalElectronAPI
    } else {
      delete (window as { electronAPI?: ElectronAPI }).electronAPI
    }
    vi.clearAllMocks()
  })

  it('does not trigger database queries on module import', async () => {
    // Import the module
    await import('./i18n')

    // CRITICAL: Database should NOT be queried during import
    expect(mockGetUserSetting).not.toHaveBeenCalled()
  })

  it('does not trigger database queries on multiple imports', async () => {
    // Simulate multiple imports (like HMR reloads)
    await import('./i18n')
    await import('./i18n')
    await import('./i18n')

    // CRITICAL: Database should NEVER be queried during imports
    expect(mockGetUserSetting).not.toHaveBeenCalled()
  })

  it('only queries database when getSavedLanguage is explicitly called', async () => {
    const { getSavedLanguage } = await import('./i18n')

    // No calls yet
    expect(mockGetUserSetting).not.toHaveBeenCalled()

    // Call the function explicitly
    await getSavedLanguage()

    // Now it should have been called
    expect(mockGetUserSetting).toHaveBeenCalledTimes(1)
    expect(mockGetUserSetting).toHaveBeenCalledWith('language')
  })

  it('does not call i18n.changeLanguage during module import', async () => {
    const { default: i18n } = await import('./i18n')

    // Spy on changeLanguage
    const changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage')

    // Re-import the module (simulating HMR)
    await import('./i18n')

    // CRITICAL: changeLanguage should NOT be called during import
    expect(changeLanguageSpy).not.toHaveBeenCalled()

    changeLanguageSpy.mockRestore()
  })

  it('initializes i18n synchronously without side effects', async () => {
    const startTime = Date.now()
    
    const { default: i18n } = await import('./i18n')
    
    const endTime = Date.now()
    const importTime = endTime - startTime

    // Import should be very fast (< 100ms) since it's synchronous
    expect(importTime).toBeLessThan(100)

    // i18n should be initialized
    expect(i18n.isInitialized).toBe(true)
    expect(i18n.language).toBe('en')

    // No database calls should have been made
    expect(mockGetUserSetting).not.toHaveBeenCalled()
  })

  it('prevents the infinite reload loop scenario', async () => {
    // This test simulates the exact scenario that caused the bug:
    // 1. Module import
    // 2. Language change (would trigger re-render)
    // 3. HMR reload (would re-import module)
    // 4. Repeat

    const { default: i18n, getSavedLanguage } = await import('./i18n')

    // Step 1: Module import - should NOT query database
    expect(mockGetUserSetting).not.toHaveBeenCalled()

    // Step 2: Explicitly call getSavedLanguage (like AppWithOnboarding does)
    const language = await getSavedLanguage()
    expect(mockGetUserSetting).toHaveBeenCalledTimes(1)

    // Step 3: Change language (simulating what happens in AppWithOnboarding)
    await i18n.changeLanguage(language)

    // Step 4: Simulate HMR reload by re-importing
    await import('./i18n')
    await import('./i18n')
    await import('./i18n')

    // CRITICAL: Database should still only have been called once
    // If it was called more times, we have an infinite loop
    expect(mockGetUserSetting).toHaveBeenCalledTimes(1)
  })

  it('handles rapid successive imports without triggering queries', async () => {
    // Simulate rapid HMR reloads (like what happens during development)
    const importPromises = Array.from({ length: 10 }, () => import('./i18n'))
    
    await Promise.all(importPromises)

    // CRITICAL: No database queries should have been triggered
    expect(mockGetUserSetting).not.toHaveBeenCalled()
  })

  it('maintains module state across imports', async () => {
    const { default: i18n1 } = await import('./i18n')
    const { default: i18n2 } = await import('./i18n')

    // Both imports should reference the same instance
    expect(i18n1).toBe(i18n2)
    expect(i18n1.language).toBe(i18n2.language)

    // No database queries
    expect(mockGetUserSetting).not.toHaveBeenCalled()
  })
})

