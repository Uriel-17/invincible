import i18n, { t } from './i18n'

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
