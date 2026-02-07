import { useQuery } from '@tanstack/react-query'
import { getUserSetting } from 'src/services/database'
import { SETTINGS_QC_KEY } from 'src/queryKeys'

export interface SettingsData {
  username: string
  startingBankroll: string
  language: string
  theme: string
}

/**
 * Custom hook to fetch all settings at once
 * Returns settings data with loading and error states
 */
export function useSettings() {
  return useQuery({
    queryKey: [SETTINGS_QC_KEY],
    queryFn: async (): Promise<SettingsData> => {
      const [username, startingBankroll, language] = await Promise.all([
        getUserSetting('username'),
        getUserSetting('starting_bankroll'),
        getUserSetting('language'),
      ])
      const theme = typeof window !== 'undefined' 
        ? localStorage.getItem('theme') || 'light'
        : 'light'
      return {
        username: username || '',
        startingBankroll: startingBankroll || '',
        language: language || 'en',
        theme,
      }
    },
    staleTime: 30000, // 30 seconds
  })
}

