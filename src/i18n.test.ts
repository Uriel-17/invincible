import i18n from './i18n'

describe('i18n resources', () => {
  it('keeps English keys and values identical', () => {
    const en = i18n.getResourceBundle('en', 'translation')
    const entries = Object.entries(en)

    for (const [key, value] of entries) {
      expect(value).toBe(key)
    }
  })

  it('keeps Spanish keys aligned with English', () => {
    const en = i18n.getResourceBundle('en', 'translation')
    const es = i18n.getResourceBundle('es', 'translation')

    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort())
  })
})
