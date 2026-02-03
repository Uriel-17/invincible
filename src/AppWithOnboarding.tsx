import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { isFirstLaunch } from 'src/services/database'
import LanguageSelectionModal from 'src/Components/LanguageSelectionModal'
import OnboardingModal from 'src/Components/OnboardingModal'
import type router from 'src/router'
import { FIRST_LAUNCH_QC_KEY } from 'src/queryKeys'

interface AppWithOnboardingProps {
  router: typeof router
}

const AppWithOnboarding = ({ router }: AppWithOnboardingProps) => {
  const { data: isFirstTimeLaunch, isLoading: isCheckingFirstLaunch } = useQuery({
    queryKey: [FIRST_LAUNCH_QC_KEY],
    queryFn: isFirstLaunch,
    staleTime: Infinity,
  })

  const [hasCompletedLanguageSelection, setHasCompletedLanguageSelection] = useState(false)

  if (isCheckingFirstLaunch) {
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
