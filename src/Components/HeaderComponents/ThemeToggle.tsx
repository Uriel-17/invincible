import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import { useT } from 'src/hooks/useT'

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
    <div className="theme-toggle">
      <SunIcon className="theme-icon" />
      <label className="switch">
        <input
          type="checkbox"
          checked={isDark}
          onChange={(event) => setIsDark(event.target.checked)}
          aria-label={_T('Toggle dark mode')}
        />
        <span className="slider" />
      </label>
      <MoonIcon className="theme-icon" />
    </div>
  )
}

export default ThemeToggle
