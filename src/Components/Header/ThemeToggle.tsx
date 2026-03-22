import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import { useT } from 'src/hooks/useT'
import './helpers/HeaderButtons.css'

const ThemeToggle = () => {
  const _T = useT()
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  return (
    <div className="header-btn-wrapper">
      <button
        type="button"
        className="header-btn header-btn-secondary header-btn-icon"
        onClick={() => setIsDark(d => !d)}
        aria-label={_T('Toggle dark mode')}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  )
}

export default ThemeToggle
