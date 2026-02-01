import { useQuery } from '@tanstack/react-query'
import { getUserSetting } from 'src/services/database'
import { USER_SETTING_QC_KEY } from 'src/queryKeys'

/**
 * Custom hook to fetch and cache the username from user settings
 * Returns the username or 'User' as fallback
 */
export function useUsername() {
  const { data: username, isLoading } = useQuery({
    queryKey: [USER_SETTING_QC_KEY, 'username'],
    queryFn: () => getUserSetting('username'),
    staleTime: Infinity,
  })

  return {
    username: username || 'User',
    isLoading,
  }
}

