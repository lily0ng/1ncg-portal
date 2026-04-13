'use client'

import { useEffect } from 'react'
import { useTheme } from '@/hooks/useTheme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  useEffect(() => {
    const ALL_THEMES = ['dark-nebula','ocean-breeze','forest-night','sunset-pro','arctic-light','rose-gold','monochrome']
    ALL_THEMES.forEach(t => {
      document.documentElement.classList.remove(t)
      document.documentElement.classList.remove(`theme-${t}`)
    })
    if (theme !== 'dark-nebula') {
      document.documentElement.classList.add(`theme-${theme}`)
    }
  }, [theme])

  return <>{children}</>
}
