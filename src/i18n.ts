import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      '--': '--',
      'Add leg': 'Add leg',
      Alerts: 'Alerts',
      'All data has been cleared successfully': 'All data has been cleared successfully',
      'Are you sure you want to delete this months bets?':
        'Are you sure you want to delete this months bets?',
      'Awaiting results': 'Awaiting results',
      Bankroll: 'Bankroll',
      'Bet amount': 'Bet amount',
      'Bet amount must be a positive number greater than 0':
        'Bet amount must be a positive number greater than 0',
      'Bet amount must be a valid number': 'Bet amount must be a valid number',
      'Bet Type': 'Bet Type',
      'Board ready': 'Board ready',
      Cancel: 'Cancel',
      Cashout: 'Cashout',
      'Cashout amount must be a positive number':
        'Cashout amount must be a positive number',
      'Cashout amount must be a valid number': 'Cashout amount must be a valid number',
      'Clean month': 'Clean month',
      'Clear All Data': 'Clear All Data',
      'Clear month': 'Clear month',
      'Clearing...': 'Clearing...',
      'Click on the Vite and React logos to learn more':
        'Click on the Vite and React logos to learn more',
      Confirm: 'Confirm',
      'count is {{count}}': 'count is {{count}}',
      'Create pick': 'Create pick',
      'Danger Zone': 'Danger Zone',
      Dark: 'Dark',
      'Date must be on or before today': 'Date must be on or before today',
      'Edit <code>src/App.tsx</code> and save to test HMR':
        'Edit <code>src/App.tsx</code> and save to test HMR',
      'e.g. -110': 'e.g. -110',
      English: 'English',
      'Error clearing data: ': 'Error clearing data: ',
      'Error loading settings: ': 'Error loading settings: ',
      'Error saving settings: ': 'Error saving settings: ',
      'Error setting up account: ': 'Error setting up account: ',
      'Error: ': 'Error: ',
      'Get Started': 'Get Started',
      '{{username}} picks': '{{username}} picks',
      "{{username}}'s sportsbook desk": "{{username}}'s sportsbook desk",
      'Invalid format': 'Invalid format',
      "Let's set up your betting tracker.": "Let's set up your betting tracker.",
      Invincible: 'Invincible',
      Language: 'Language',
      'Last 15 min': 'Last 15 min',
      Leg: 'Leg',
      'League sync': 'League sync',
      'Leg market': 'Leg market',
      'Leg quota': 'Leg quota',
      Light: 'Light',
      'Line movement': 'Line movement',
      'Lines feed': 'Lines feed',
      'Loading settings...': 'Loading settings...',
      'Log a new bet for this month.': 'Log a new bet for this month.',
      Loss: 'Loss',
      'Manage picks': 'Manage picks',
      Market: 'Market',
      'Market pulse': 'Market pulse',
      'Maximum length is {{length}}': 'Maximum length is {{length}}',
      'Maximum value is {{value}}': 'Maximum value is {{value}}',
      'Minimum length is {{length}}': 'Minimum length is {{length}}',
      'Minimum value is {{value}}': 'Minimum value is {{value}}',
      'Momentum picks': 'Momentum picks',
      'Net Gain': 'Net Gain',
      'Net gain must be a valid number': 'Net gain must be a valid number',
      'No settings data available': 'No settings data available',
      Notes: 'Notes',
      Open: 'Open',
      'Open board': 'Open board',
      Outcome: 'Outcome',
      Parlay: 'Parlay',
      'Parlay legs': 'Parlay legs',
      Pending: 'Pending',
      'Placed at': 'Placed at',
      'Permanently delete all your betting data. This action cannot be undone.':
        'Permanently delete all your betting data. This action cannot be undone.',
      'Please enter a valid date': 'Please enter a valid date',
      'Please enter a valid number': 'Please enter a valid number',
      'Please enter a valid number with max 2 decimal places':
        'Please enter a valid number with max 2 decimal places',
      'Please select a valid option': 'Please select a valid option',
      'Please type DELETE to confirm': 'Please type DELETE to confirm',
      'Potential Gains': 'Potential Gains',
      Preferences: 'Preferences',
      'Potential gains must be a valid number':
        'Potential gains must be a valid number',
      Push: 'Push',
      'Quiet market': 'Quiet market',
      Quota: 'Quota',
      'Quota must be a valid number (e.g., -110 or +150)':
        'Quota must be a valid number (e.g., -110 or +150)',
      'Ready for first pick': 'Ready for first pick',
      Remove: 'Remove',
      'Risk meter': 'Risk meter',
      ROI: 'ROI',
      'Save pick': 'Save pick',
      'Save Settings': 'Save Settings',
      'Saving...': 'Saving...',
      Selection: 'Selection',
      'Set your first pick': 'Set your first pick',
      Settings: 'Settings',
      'Settings saved successfully!': 'Settings saved successfully!',
      'Setting up your account...': 'Setting up your account...',
      'Setting up...': 'Setting up...',
      'Sharp money': 'Sharp money',
      Single: 'Single',
      Spanish: 'Spanish',
      'Stable lines': 'Stable lines',
      Standby: 'Standby',
      'Starting bankroll is required': 'Starting bankroll is required',
      'Starting bankroll must be greater than 0': 'Starting bankroll must be greater than 0',
      'Starting Bankroll': 'Starting Bankroll',
      'Team vs Team': 'Team vs Team',
      Theme: 'Theme',
      'This action cannot be undone!': 'This action cannot be undone!',
      'This field is required.': 'This field is required.',
      'This will permanently delete all bets, parlay legs, bankroll snapshots, and monthly archives. Your user settings will be preserved.':
        'This will permanently delete all bets, parlay legs, bankroll snapshots, and monthly archives. Your user settings will be preserved.',
      'Type': 'Type',
      'to confirm': 'to confirm',
      "Today's slate": "Today's slate",
      'Toggle dark mode': 'Toggle dark mode',
      'User Information': 'User Information',
      Username: 'Username',
      'Username is required': 'Username is required',
      'Username must be at least 2 characters': 'Username must be at least 2 characters',
      'Username must be at most 50 characters': 'Username must be at most 50 characters',
      'Track lines, lock picks, and keep your bankroll disciplined.':
        'Track lines, lock picks, and keep your bankroll disciplined.',
      'View history': 'View history',
      'Vite + React': 'Vite + React',
      Waiting: 'Waiting',
      'Watching for signals': 'Watching for signals',
      'Welcome back, {{username}}': 'Welcome back, {{username}}',
      'Welcome! Your account has been set up successfully.':
        'Welcome! Your account has been set up successfully.',
      'Welcome to Invincible!': 'Welcome to Invincible!',
      '¡Bienvenido a Invincible!': '¡Bienvenido a Invincible!',
      Win: 'Win',
    },
  },
  es: {
    translation: {
      '--': '--',
      'Add leg': 'Agregar leg',
      Alerts: 'Alertas',
      'All data has been cleared successfully': 'Todos los datos han sido eliminados exitosamente',
      'Are you sure you want to delete this months bets?':
        '¿Estás seguro de que quieres borrar las apuestas de este mes?',
      'Awaiting results': 'Esperando resultados',
      Bankroll: 'Bankroll',
      'Bet amount': 'Monto apostado',
      'Bet amount must be a positive number greater than 0':
        'El monto de la apuesta debe ser un número positivo mayor que 0',
      'Bet amount must be a valid number': 'El monto de la apuesta debe ser un número válido',
      'Bet Type': 'Tipo de apuesta',
      'Board ready': 'Tablero listo',
      Cancel: 'Cancelar',
      Cashout: 'Cashout',
      'Cashout amount must be a positive number':
        'El monto del cashout debe ser un número positivo',
      'Cashout amount must be a valid number': 'El monto del cashout debe ser un número válido',
      'Clean month': 'Mes limpio',
      'Clear All Data': 'Borrar Todos los Datos',
      'Clear month': 'Borrar mes',
      'Clearing...': 'Borrando...',
      'Click on the Vite and React logos to learn more':
        'Haz clic en los logos de Vite y React para aprender más',
      Confirm: 'Confirmar',
      'count is {{count}}': 'el conteo es {{count}}',
      'Create pick': 'Crear pick',
      'Danger Zone': 'Zona Peligrosa',
      Dark: 'Oscuro',
      'Date must be on or before today': 'La fecha debe ser hoy o anterior',
      'Edit <code>src/App.tsx</code> and save to test HMR':
        'Edita <code>src/App.tsx</code> y guarda para probar HMR',
      'e.g. -110': 'ej. -110',
      English: 'Inglés',
      'Error clearing data: ': 'Error al borrar datos: ',
      'Error loading settings: ': 'Error al cargar configuración: ',
      'Error saving settings: ': 'Error al guardar configuración: ',
      'Error setting up account: ': 'Error al configurar la cuenta: ',
      'Error: ': 'Error: ',
      'Get Started': 'Comenzar',
      '{{username}} picks': 'Picks de {{username}}',
      "{{username}}'s sportsbook desk": 'Escritorio deportivo de {{username}}',
      'Invalid format': 'Formato inválido',
      "Let's set up your betting tracker.": 'Configuremos tu rastreador de apuestas.',
      Invincible: 'Invincible',
      Language: 'Idioma',
      'Last 15 min': 'Últimos 15 min',
      Leg: 'Leg',
      'League sync': 'Sincronización de ligas',
      'Leg market': 'Mercado del leg',
      'Leg quota': 'Cuota del leg',
      Light: 'Claro',
      'Line movement': 'Movimiento de líneas',
      'Lines feed': 'Feed de líneas',
      'Loading settings...': 'Cargando configuración...',
      'Log a new bet for this month.': 'Registra una nueva apuesta para este mes.',
      Loss: 'Perdida',
      'Manage picks': 'Gestionar picks',
      Market: 'Mercado',
      'Market pulse': 'Pulso del mercado',
      'Maximum length is {{length}}': 'La longitud máxima es {{length}}',
      'Maximum value is {{value}}': 'El valor máximo es {{value}}',
      'Minimum length is {{length}}': 'La longitud mínima es {{length}}',
      'Minimum value is {{value}}': 'El valor mínimo es {{value}}',
      'Momentum picks': 'Picks con impulso',
      'Net Gain': 'Ganancia Neta',
      'Net gain must be a valid number': 'La ganancia neta debe ser un número válido',
      'No settings data available': 'No hay datos de configuración disponibles',
      Notes: 'Notas',
      Open: 'Abierto',
      'Open board': 'Abrir tablero',
      Outcome: 'Resultado',
      Parlay: 'Parlay',
      'Parlay legs': 'Legs del parlay',
      Pending: 'Pendiente',
      'Permanently delete all your betting data. This action cannot be undone.':
        'Eliminar permanentemente todos tus datos de apuestas. Esta acción no se puede deshacer.',
      'Placed at': 'Fecha y hora',
      'Please enter a valid date': 'Por favor ingresa una fecha válida',
      'Please enter a valid number': 'Por favor ingresa un número válido',
      'Please enter a valid number with max 2 decimal places':
        'Por favor ingresa un número válido con máximo 2 decimales',
      'Please select a valid option': 'Por favor selecciona una opción válida',
      'Please type DELETE to confirm': 'Por favor escribe DELETE para confirmar',
      'Potential Gains': 'Ganancias Potenciales',
      Preferences: 'Preferencias',
      'Potential gains must be a valid number':
        'Las ganancias potenciales deben ser un número válido',
      Push: 'Push',
      'Quiet market': 'Mercado tranquilo',
      Quota: 'Cuota',
      'Quota must be a valid number (e.g., -110 or +150)':
        'La cuota debe ser un número válido (ej. -110 o +150)',
      'Ready for first pick': 'Listo para el primer pick',
      Remove: 'Quitar',
      'Risk meter': 'Medidor de riesgo',
      ROI: 'ROI',
      'Save pick': 'Guardar pick',
      'Save Settings': 'Guardar Configuración',
      'Saving...': 'Guardando...',
      Selection: 'Selección',
      'Set your first pick': 'Define tu primer pick',
      Settings: 'Configuración',
      'Settings saved successfully!': '¡Configuración guardada exitosamente!',
      'Setting up your account...': 'Configurando tu cuenta...',
      'Setting up...': 'Configurando...',
      'Sharp money': 'Dinero sharp',
      Single: 'Simple',
      Spanish: 'Español',
      'Stable lines': 'Líneas estables',
      Standby: 'En espera',
      'Starting bankroll is required': 'El bankroll inicial es obligatorio',
      'Starting bankroll must be greater than 0': 'El bankroll inicial debe ser mayor que 0',
      'Starting Bankroll': 'Bankroll Inicial',
      'Team vs Team': 'Equipo vs Equipo',
      Theme: 'Tema',
      'This action cannot be undone!': '¡Esta acción no se puede deshacer!',
      'This field is required.': 'Este campo es obligatorio.',
      'This will permanently delete all bets, parlay legs, bankroll snapshots, and monthly archives. Your user settings will be preserved.':
        'Esto eliminará permanentemente todas las apuestas, legs de parlay, snapshots de bankroll y archivos mensuales. Tu configuración de usuario se conservará.',
      "Today's slate": 'Cartelera de hoy',
      'Toggle dark mode': 'Alternar modo oscuro',
      'Type': 'Escribe',
      'to confirm': 'para confirmar',
      'User Information': 'Información del Usuario',
      Username: 'Nombre de usuario',
      'Username is required': 'El nombre de usuario es obligatorio',
      'Username must be at least 2 characters': 'El nombre de usuario debe tener al menos 2 caracteres',
      'Username must be at most 50 characters': 'El nombre de usuario debe tener máximo 50 caracteres',
      'Track lines, lock picks, and keep your bankroll disciplined.':
        'Sigue líneas, asegura picks y mantén tu bankroll disciplinado.',
      'View history': 'Ver historial',
      'Vite + React': 'Vite + React',
      Waiting: 'En espera',
      'Watching for signals': 'Vigilando señales',
      'Welcome back, {{username}}': 'Bienvenido de nuevo, {{username}}',
      'Welcome! Your account has been set up successfully.':
        '¡Bienvenido! Tu cuenta ha sido configurada exitosamente.',
      'Welcome to Invincible!': '¡Bienvenido a Invincible!',
      '¡Bienvenido a Invincible!': '¡Bienvenido a Invincible!',
      Win: 'Ganada',
    },
  },
} as const

/**
 * Get saved language from database or use default
 * This function is async and will be called during app initialization
 */
async function getSavedLanguage(): Promise<string> {
  // Check if we're in Electron environment
  if (typeof window !== 'undefined' && window.electronAPI?.database?.getUserSetting) {
    try {
      const response = await window.electronAPI.database.getUserSetting('language')
      if (response.success && response.data) {
        console.log('📖 Loaded saved language from database:', response.data)
        return response.data
      }
    } catch (error) {
      console.warn('⚠️ Failed to load saved language from database:', error)
    }
  }

  // Fallback to navigator language detection
  const defaultLanguage =
    typeof navigator !== 'undefined' && navigator.language.startsWith('es')
      ? 'es'
      : 'en'

  console.log('📖 Using default language from navigator:', defaultLanguage)
  return defaultLanguage
}

// Initialize i18n with fallback language first
void i18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'en',
  lng: 'en', // Start with English, will be updated after loading from database
  interpolation: {
    escapeValue: false,
  },
})

// Load saved language asynchronously and update i18n
getSavedLanguage().then((language) => {
  if (i18n.language !== language) {
    void i18n.changeLanguage(language)
  }
})

/**
 * Translation function that can be imported directly without using hooks
 * Useful for utility files and non-component code
 */
export const t = (key: string): string => i18n.t(key)

export default i18n