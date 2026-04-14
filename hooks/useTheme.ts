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

type SidebarVariant = 'default' | 'floating' | 'inset'
type CollapsibleMode = 'offcanvas' | 'icon' | 'none'
type SidebarPosition = 'left' | 'right'

interface ThemeStore {
  theme: Theme
  radius: number
  mode: 'light' | 'dark'
  sidebarVariant: SidebarVariant
  sidebarCollapsible: CollapsibleMode
  sidebarPosition: SidebarPosition
  sidebarOpen: boolean
  setTheme: (t: Theme) => void
  setRadius: (r: number) => void
  setMode: (m: 'light' | 'dark') => void
  setSidebarVariant: (v: SidebarVariant) => void
  setSidebarCollapsible: (c: CollapsibleMode) => void
  setSidebarPosition: (p: SidebarPosition) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export function applyTheme(theme: Theme) {
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

export function applyMode(mode: 'light' | 'dark') {
  if (typeof document === 'undefined') return
  
  if (mode === 'dark') {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
  }
}

export function applyRadius(radius: number) {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty('--radius', `${radius}rem`)
}

export function applySidebarVariant(variant: SidebarVariant) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.sidebarVariant = variant
}

export function applySidebarCollapsible(mode: CollapsibleMode) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.sidebarCollapsible = mode
}

export function applySidebarPosition(position: SidebarPosition) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.sidebarPosition = position
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'arctic-light',
      radius: 0.5,
      mode: 'light',
      sidebarVariant: 'inset' as SidebarVariant,
      sidebarCollapsible: 'offcanvas' as CollapsibleMode,
      sidebarPosition: 'left' as SidebarPosition,
      sidebarOpen: true,
      setTheme: (t: Theme) => {
        applyTheme(t)
        // Auto-switch mode based on theme
        const isLight = t === 'arctic-light'
        applyMode(isLight ? 'light' : 'dark')
        set({ theme: t, mode: isLight ? 'light' : 'dark' })
      },
      setRadius: (r: number) => {
        applyRadius(r)
        set({ radius: r })
      },
      setMode: (m: 'light' | 'dark') => {
        applyMode(m)
        // Update theme to match mode
        const newTheme = m === 'light' ? 'arctic-light' : 'dark-nebula'
        applyTheme(newTheme)
        set({ mode: m, theme: newTheme })
      },
      setSidebarVariant: (v: SidebarVariant) => {
        applySidebarVariant(v)
        set({ sidebarVariant: v })
      },
      setSidebarCollapsible: (c: CollapsibleMode) => {
        applySidebarCollapsible(c)
        set({ sidebarCollapsible: c })
      },
      setSidebarPosition: (p: SidebarPosition) => {
        applySidebarPosition(p)
        set({ sidebarPosition: p })
      },
      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open })
      },
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      }
    }),
    {
      name: 'cmp-theme-v3',
      onRehydrateStorage: (state) => {
        return () => {
          if (state) {
            applyTheme(state.theme)
            applyMode(state.mode)
            applyRadius(state.radius)
            applySidebarVariant(state.sidebarVariant)
            applySidebarCollapsible(state.sidebarCollapsible)
            applySidebarPosition(state.sidebarPosition)
          }
        }
      }
    }
  )
)
