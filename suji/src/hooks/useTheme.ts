import { useEffect, useCallback } from 'react'
import { useStore } from '@/lib/store'

type ThemeMode = 'light' | 'dark' | 'system'

export function useTheme() {
  const themeMode = useStore((state) => state.themeMode)
  const setThemeMode = useStore((state) => state.setThemeMode)

  const applyTheme = useCallback((mode: ThemeMode) => {
    const root = document.documentElement

    if (mode === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', systemDark)
    } else {
      root.classList.toggle('dark', mode === 'dark')
    }

    // Save to localStorage as backup
    localStorage.setItem('themeMode', mode)
  }, [])

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeMode(mode)
    applyTheme(mode)
  }, [setThemeMode, applyTheme])

  useEffect(() => {
    // Apply initial theme
    applyTheme(themeMode)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (themeMode === 'system') {
        document.documentElement.classList.toggle('dark', e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [themeMode, applyTheme])

  return { theme: themeMode, setTheme }
}
