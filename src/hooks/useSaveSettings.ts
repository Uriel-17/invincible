import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { setUserSetting } from 'src/services/database'
import { SETTINGS_QC_KEY, USER_SETTING_QC_KEY } from 'src/queryKeys'

export interface SaveSettingsData {
  username: string
  language: string
  theme: string
}

export function useSaveSettings() {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()

  return useMutation({
    mutationFn: async (settings: SaveSettingsData) => {
      console.log('💾 Saving settings:', settings)
      await setUserSetting('username', settings.username)
      await i18n.changeLanguage(settings.language)
      await setUserSetting('language', settings.language)
      console.log('✅ Language updated:', settings.language)
      localStorage.setItem('theme', settings.theme)
      const root = document.documentElement
      if (settings.theme === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      console.log('✅ Theme updated:', settings.theme)
      return settings
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QC_KEY] })
      queryClient.invalidateQueries({ queryKey: [USER_SETTING_QC_KEY] })
      console.log('✅ Settings saved successfully')
    },
    onError: (error: Error) => {
      console.error('❌ Failed to save settings:', error)
    },
  })
}