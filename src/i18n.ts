import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      title: 'Vite + React',
      countButton: 'count is {{count}}',
      editHint: 'Edit <code>src/App.tsx</code> and save to test HMR',
      docsHint: 'Click on the Vite and React logos to learn more',
      languageLabel: 'Language',
      english: 'English',
      spanish: 'Spanish',
      clearMonth: 'Clear month',
      clearMonthPrompt: 'Are you sure you want to delete this months bets?',
      confirm: 'Confirm',
      cancel: 'Cancel',
    },
  },
  es: {
    translation: {
      title: 'Vite + React',
      countButton: 'el conteo es {{count}}',
      editHint: 'Edita <code>src/App.tsx</code> y guarda para probar HMR',
      docsHint: 'Haz clic en los logos de Vite y React para aprender mas',
      languageLabel: 'Idioma',
      english: 'Ingles',
      spanish: 'Espanol',
      clearMonth: 'Borrar mes',
      clearMonthPrompt: 'Estas seguro de que quieres borrar las apuestas de este mes?',
      confirm: 'Confirmar',
      cancel: 'Cancelar',
    },
  },
} as const

const defaultLanguage =
  typeof navigator !== 'undefined' && navigator.language.startsWith('es')
    ? 'es'
    : 'en'

void i18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'en',
  lng: defaultLanguage,
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
