import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const THEMES = [
  'dark-nebula',
  'ocean-breeze',
  'forest-night',
  'sunset-pro',
  'arctic-light',
  'rose-gold',
  'monochrome'
] as const

export type Theme = typeof THEMES[number]

interface ThemeStore {
  theme: Theme
  setTheme: (t: Theme) => void
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  // Remove all existing theme classes (both prefixed and unprefixed)
  THEMES.forEach(t => {
    document.documentElement.classList.remove(t)
    document.documentElement.classList.remove(`theme-${t}`)
  })
  // dark-nebula is the default (:root), others need theme- prefix
  if (theme !== 'dark-nebula') {
    document.documentElement.classList.add(`theme-${theme}`)
  }
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark-nebula',
      setTheme: (t: Theme) => {
        applyTheme(t)
        set({ theme: t })
      }
    }),
    {
      name: 'cmp-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyTheme(state.theme)
        }
      }
    }
  )
)
