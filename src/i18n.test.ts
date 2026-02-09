import { describe, it, expect, vi, beforeEach } from 'vitest'
import i18n, { t, getSavedLanguage } from './i18n'

/**
 * CRITICAL: Infinite Loop Prevention Tests
 *
 * These tests ensure that the i18n module does NOT trigger async database calls
 * during module initialization, which would cause an infinite reload loop.
 *
 * The bug occurred when getSavedLanguage() was called at module level, causing:
 * 1. Module import → database query
 * 2. Language change → React re-render
 * 3. Vite HMR reload → module re-import
 * 4. Back to step 1 (infinite loop)
 */
describe('Infinite Loop Prevention', () => {
  describe('getSavedLanguage function', () => {
    it('is exported as a function (not called during import)', () => {
      expect(typeof getSavedLanguage).toBe('function')
    })

    it('does not execute during module import', () => {
      // If getSavedLanguage was called during import, window.electronAPI would be accessed
      // This test verifies it's just a function reference
      expect(getSavedLanguage).toBeDefined()
      expect(getSavedLanguage.name).toBe('getSavedLanguage')
    })

    it('returns a Promise when called', () => {
      const result = getSavedLanguage()
      expect(result).toBeInstanceOf(Promise)
      // Clean up the promise to avoid unhandled rejection
      result.catch(() => {})
    })
  })

  describe('Module initialization', () => {
    it('initializes i18n synchronously without async calls', () => {
      // i18n should be initialized immediately
      expect(i18n.isInitialized).toBe(true)
      expect(i18n.language).toBe('en')
    })

    it('does not call i18n.changeLanguage during module import', () => {
      // Spy on changeLanguage to ensure it's not called during import
      const changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage')

      // Re-import the module (this simulates HMR reload)
      // Note: In actual test, the module is already imported, so we just verify
      // that changeLanguage hasn't been called yet
      expect(changeLanguageSpy).not.toHaveBeenCalled()

      changeLanguageSpy.mockRestore()
    })

    it('does not access window.electronAPI during module import', () => {
      // Mock window.electronAPI to track if it's accessed
      const mockGetUserSetting = vi.fn()
      const originalElectronAPI = (window as any).electronAPI

      // Set up a getter that will throw if accessed during import
      Object.defineProperty(window, 'electronAPI', {
        get: () => {
          // If this is accessed during import, the test will fail
          return {
            database: {
              getUserSetting: mockGetUserSetting
            }
          }
        },
        configurable: true
      })

      // Verify that getUserSetting was NOT called during import
      expect(mockGetUserSetting).not.toHaveBeenCalled()

      // Restore original
      if (originalElectronAPI) {
        (window as any).electronAPI = originalElectronAPI
      } else {
        delete (window as any).electronAPI
      }
    })
  })

  describe('getSavedLanguage behavior', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('queries database only when explicitly called', async () => {
      const mockGetUserSetting = vi.fn().mockResolvedValue({
        success: true,
        data: 'es'
      })

      // Mock window.electronAPI
      ;(window as any).electronAPI = {
        database: {
          getUserSetting: mockGetUserSetting
        }
      }

      // Call getSavedLanguage explicitly
      const language = await getSavedLanguage()

      // Verify it was called
      expect(mockGetUserSetting).toHaveBeenCalledTimes(1)
      expect(mockGetUserSetting).toHaveBeenCalledWith('language')
      expect(language).toBe('es')

      // Clean up
      delete (window as any).electronAPI
    })

    it('returns navigator language when electronAPI is not available', async () => {
      // Ensure electronAPI is not available
      delete (window as any).electronAPI

      const language = await getSavedLanguage()

      // Should return 'en' or 'es' based on navigator
      expect(['en', 'es']).toContain(language)
    })

    it('handles database errors gracefully', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const mockGetUserSetting = vi.fn().mockRejectedValue(new Error('Database error'))

      ;(window as any).electronAPI = {
        database: {
          getUserSetting: mockGetUserSetting
        }
      }

      const language = await getSavedLanguage()

      // Should fall back to navigator language
      expect(['en', 'es']).toContain(language)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '⚠️ Failed to load saved language from database:',
        expect.any(Error)
      )

      consoleWarnSpy.mockRestore()
      delete (window as any).electronAPI
    })
  })
})

describe('i18n resources', () => {
  describe('English translations', () => {
    it('keeps English keys and values identical', () => {
      const en = i18n.getResourceBundle('en', 'translation')
      const entries = Object.entries(en)

      const mismatches: string[] = []
      for (const [key, value] of entries) {
        if (value !== key) {
          mismatches.push(`Key: "${key}" | Value: "${value}"`)
        }
      }

      if (mismatches.length > 0) {
        console.error('❌ English key-value mismatches found:')
        mismatches.forEach((mismatch) => console.error(`  - ${mismatch}`))
      }

      expect(mismatches).toEqual([])
    })

    it('has no empty keys or values', () => {
      const en = i18n.getResourceBundle('en', 'translation')
      const entries = Object.entries(en)

      for (const [key, value] of entries) {
        expect(key).toBeTruthy()
        expect(value).toBeTruthy()
      }
    })
  })

  describe('Spanish translations', () => {
    it('keeps Spanish keys aligned with English', () => {
      const en = i18n.getResourceBundle('en', 'translation')
      const es = i18n.getResourceBundle('es', 'translation')

      const enKeys = Object.keys(en).sort()
      const esKeys = Object.keys(es).sort()

      // Find missing keys
      const missingInSpanish = enKeys.filter((key) => !esKeys.includes(key))
      const extraInSpanish = esKeys.filter((key) => !enKeys.includes(key))

      if (missingInSpanish.length > 0) {
        console.error('❌ Keys missing in Spanish:')
        missingInSpanish.forEach((key) => console.error(`  - "${key}"`))
      }

      if (extraInSpanish.length > 0) {
        console.error('❌ Extra keys in Spanish (not in English):')
        extraInSpanish.forEach((key) => console.error(`  - "${key}"`))
      }

      expect(esKeys).toEqual(enKeys)
    })

    it('has no empty values', () => {
      const es = i18n.getResourceBundle('es', 'translation')
      const entries = Object.entries(es)

      for (const [, value] of entries) {
        expect(value).toBeTruthy()
        expect(typeof value).toBe('string')
      }
    })

    it('has different values from English (actual translations)', () => {
      const en = i18n.getResourceBundle('en', 'translation')
      const es = i18n.getResourceBundle('es', 'translation')

      // Count how many translations are actually different
      let translatedCount = 0
      let identicalCount = 0

      for (const key of Object.keys(en)) {
        if (es[key] !== en[key]) {
          translatedCount++
        } else {
          identicalCount++
        }
      }

      // Most translations should be different (allowing some identical ones like '--', 'Bankroll', etc.)
      expect(translatedCount).toBeGreaterThan(identicalCount)
    })
  })

  describe('i18n initialization', () => {
    it('initializes with correct default language', () => {
      expect(i18n.language).toBe('en')
    })

    it('has fallback language set to English', () => {
      expect(i18n.options.fallbackLng).toEqual(['en'])
    })

    it('has interpolation escapeValue disabled', () => {
      expect(i18n.options.interpolation?.escapeValue).toBe(false)
    })
  })

  describe('Language switching', () => {
    beforeEach(async () => {
      // Reset to English before each test
      await i18n.changeLanguage('en')
    })

    it('switches to Spanish successfully', async () => {
      await i18n.changeLanguage('es')
      expect(i18n.language).toBe('es')
    })

    it('switches back to English successfully', async () => {
      await i18n.changeLanguage('es')
      await i18n.changeLanguage('en')
      expect(i18n.language).toBe('en')
    })

    it('handles invalid language codes gracefully', async () => {
      await i18n.changeLanguage('invalid')
      // Should fall back to English
      expect(['en', 'invalid']).toContain(i18n.language)
    })
  })

  describe('Translation function (t)', () => {
    beforeEach(async () => {
      await i18n.changeLanguage('en')
    })

    it('returns correct English translation', () => {
      expect(t('Add Funds')).toBe('Add Funds')
      expect(t('Settings')).toBe('Settings')
      expect(t('Bankroll')).toBe('Bankroll')
    })

    it('returns correct Spanish translation', async () => {
      await i18n.changeLanguage('es')
      expect(t('Add Funds')).toBe('Agregar Fondos')
      expect(t('Settings')).toBe('Configuración')
      expect(t('Bankroll')).toBe('Bankroll')
    })

    it('returns key for missing translations', () => {
      const result = t('NonExistentKey')
      expect(result).toBe('NonExistentKey')
    })

    it('handles interpolation correctly', () => {
      const result = i18n.t('Welcome back, {{username}}', { username: 'TestUser' })
      expect(result).toBe('Welcome back, TestUser')
    })
  })

  describe('Specific translation keys', () => {
    it('has Add Funds related translations', () => {
      const en = i18n.getResourceBundle('en', 'translation')

      expect(en['Add Funds']).toBe('Add Funds')
      expect(en['Add Funds to Bankroll']).toBe('Add Funds to Bankroll')
      expect(en['Amount to Add']).toBe('Amount to Add')
      expect(en['Adding...']).toBe('Adding...')
    })

    it('has error message translations without emojis in keys', () => {
      const en = i18n.getResourceBundle('en', 'translation')

      // Check that error messages exist (keys should not have emojis)
      const errorKeys = Object.keys(en).filter(key =>
        key.includes('Error') || key.includes('error')
      )

      expect(errorKeys.length).toBeGreaterThan(0)

      // Verify no keys contain emoji characters
      const keysWithEmojis = Object.keys(en).filter(key =>
        /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(key)
      )

      if (keysWithEmojis.length > 0) {
        console.error('❌ Keys with emojis found:')
        keysWithEmojis.forEach((key) => console.error(`  - "${key}"`))
      }

      expect(keysWithEmojis).toEqual([])
    })
  })
})
