import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { isFirstLaunch } from 'src/services/database'
import { getSavedLanguage } from 'src/i18n'
import LanguageSelectionModal from 'src/Components/LanguageSelectionModal'
import OnboardingModal from 'src/Components/OnboardingModal'
import type router from 'src/router'
import { FIRST_LAUNCH_QC_KEY } from 'src/queryKeys'

interface AppWithOnboardingProps {
  router: typeof router
}

const AppWithOnboarding = ({ router }: AppWithOnboardingProps) => {
  const { i18n } = useTranslation()
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false)

  const { data: isFirstTimeLaunch, isLoading: isCheckingFirstLaunch } = useQuery({
    queryKey: [FIRST_LAUNCH_QC_KEY],
    queryFn: isFirstLaunch,
    staleTime: Infinity,
  })

  const [hasCompletedLanguageSelection, setHasCompletedLanguageSelection] = useState(false)

  useEffect(() => {
    let isMounted = true

    getSavedLanguage().then((language) => {
      if (isMounted && i18n.language !== language) {
        void i18n.changeLanguage(language).then(() => {
          if (isMounted) {
            setIsLanguageLoaded(true)
          }
        })
      } else if (isMounted) {
        setIsLanguageLoaded(true)
      }
    }).catch((error) => {
      console.error('Failed to load language:', error)
      if (isMounted) {
        setIsLanguageLoaded(true)
      }
    })

    return () => {
      isMounted = false
    }
  }, [i18n])

  if (isCheckingFirstLaunch || !isLanguageLoaded) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: 'rgb(var(--text))',
        }}
      >
        Loading...
      </div>
    )
  }

  const showLanguageSelection = Boolean(isFirstTimeLaunch) && !hasCompletedLanguageSelection
  const showUserSetup = Boolean(isFirstTimeLaunch) && hasCompletedLanguageSelection

  const proceedToUserSetup = () => {
    setHasCompletedLanguageSelection(true)
  }

  const returnToLanguageSelection = () => {
    setHasCompletedLanguageSelection(false)
  }

  return (
    <>
      <LanguageSelectionModal
        isOpen={showLanguageSelection}
        onLanguageSelected={proceedToUserSetup}
      />
      <OnboardingModal
        isOpen={showUserSetup}
        onBack={returnToLanguageSelection}
      />
      <RouterProvider router={router} />
    </>
  )
}

export default AppWithOnboarding
