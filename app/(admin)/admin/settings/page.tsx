
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Palette, 
  Layout, 
  Moon, 
  Sun, 
  Upload,
  ExternalLink,
  Sparkles,
  Monitor,
  ChevronRight,
  Sidebar,
  PanelLeft,
  PanelRight,
  Maximize,
  Minimize,
  Circle
} from 'lucide-react'
import { 
  useTheme, 
  THEMES, 
  applyTheme, 
  applyMode, 
  applyRadius,
  applySidebarVariant,
  applySidebarCollapsible,
  applySidebarPosition
} from '@/hooks/useTheme'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

type Tab = 'theme' | 'layout'

const THEME_META = [
  { id: 'default', name: 'Default', colors: ['#09090b', '#18181b', '#a855f7'] },
  { id: 'ocean', name: 'Ocean', colors: ['#0f172a', '#1e293b', '#0ea5e9'] },
  { id: 'forest', name: 'Forest', colors: ['#022c22', '#064e3b', '#10b981'] },
  { id: 'sunset', name: 'Sunset', colors: ['#1c1917', '#292524', '#f97316'] },
  { id: 'rose', name: 'Rose', colors: ['#1a1212', '#241717', '#ec4899'] },
  { id: 'mono', name: 'Monochrome', colors: ['#000000', '#111111', '#ffffff'] },
] as const

const TWEAKCN_THEMES = [
  { id: 'midnight', name: 'Midnight' },
  { id: 'sapphire', name: 'Sapphire' },
  { id: 'emerald', name: 'Emerald' },
  { id: 'amber', name: 'Amber' },
] as const

const RADIUS_OPTIONS = [0, 0.3, 0.5, 0.75, 1.0] as const

const SIDEBAR_VARIANTS = [
  { id: 'default', name: 'Default', desc: 'Standard sidebar attached to edges' },
  { id: 'floating', name: 'Floating', desc: 'Floating sidebar with gap' },
  { id: 'inset', name: 'Inset', desc: 'Inset sidebar with rounded corners' },
] as const

const COLLAPSE_MODES = [
  { id: 'offcanvas', name: 'Off Canvas', desc: 'Sidebar slides out of view' },
  { id: 'icon', name: 'Icon', desc: 'Collapses to icon-only mode' },
  { id: 'none', name: 'None', desc: 'Always fully expanded' },
] as const

const SIDEBAR_POSITIONS = [
  { id: 'left', name: 'Left' },
  { id: 'right', name: 'Right' },
] as const

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('theme')
  const { 
    theme, 
    setTheme, 
    radius, 
    setRadius, 
    mode, 
    setMode,
    sidebarVariant,
    setSidebarVariant,
    sidebarCollapsible,
    setSidebarCollapsible,
    sidebarPosition,
    setSidebarPosition
  } = useTheme()

  // Sync local state with global state
  useEffect(() => {
    // Initialize on mount
    applyTheme(theme)
    applyMode(mode)
    applyRadius(radius)
    applySidebarVariant(sidebarVariant)
    applySidebarCollapsible(sidebarCollapsible)
    applySidebarPosition(sidebarPosition)
  }, [theme, mode, radius, sidebarVariant, sidebarCollapsible, sidebarPosition])

  const isDark = mode === 'dark'

  // Handle theme selection
  const handleThemeSelect = (themeId: string) => {
    const themeMap: Record<string, typeof THEMES[number]> = {
      'default': 'dark-nebula',
      'ocean': 'ocean-breeze',
      'forest': 'forest-night',
      'sunset': 'sunset-pro',
      'rose': 'rose-gold',
      'mono': 'monochrome'
    }
    const newTheme = themeMap[themeId] || 'dark-nebula'
    setTheme(newTheme)
  }

  // Handle mode switch
  const handleModeChange = (newMode: 'light' | 'dark') => {
    setMode(newMode)
  }

  // Handle radius change
  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius)
  }

  // Handle layout changes
  const handleVariantChange = (variant: 'default' | 'floating' | 'inset') => {
    setSidebarVariant(variant)
  }

  const handleCollapsibleChange = (mode: 'offcanvas' | 'icon' | 'none') => {
    setSidebarCollapsible(mode)
  }

  const handlePositionChange = (position: 'left' | 'right') => {
    setSidebarPosition(position)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg)] p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[var(--text)] mb-2">Appearance</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Customize the look and feel of your admin dashboard
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('theme')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeTab === 'theme'
                ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/25'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            )}
          >
            <Palette className="w-4 h-4" />
            Theme
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeTab === 'layout'
                ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/25'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            )}
          >
            <Layout className="w-4 h-4" />
            Layout
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'theme' && (
            <motion.div
              key="theme"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Theme Presets */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-medium text-[var(--text)]">Shadcn UI Theme Presets</h2>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                    <Sparkles className="w-3 h-3" />
                    Random
                  </button>
                </div>
                
                <div className="space-y-3">
                  {THEME_META.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleThemeSelect(t.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl border transition-all',
                        theme === (t.id === 'default' ? 'dark-nebula' : t.id)
                          ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                          : 'border-[var(--border)] hover:border-[var(--text-muted)]/30'
                      )}
                    >
                      <div className="flex -space-x-1">
                        {t.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full border-2 border-[var(--surface)]"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-[var(--text)]">{t.name}</span>
                      <ChevronRight className="w-4 h-4 ml-auto text-[var(--text-muted)]" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Tweakcn Theme Presets */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-medium text-[var(--text)]">Tweakcn Theme Presets</h2>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                    <Sparkles className="w-3 h-3" />
                    Random
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {TWEAKCN_THEMES.map((t) => (
                    <button
                      key={t.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] hover:border-[var(--text-muted)]/30 transition-all text-left"
                    >
                      <span className="text-sm text-[var(--text)]">{t.name}</span>
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Radius */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                <h2 className="text-sm font-medium text-[var(--text)] mb-6">Radius</h2>
                <div className="flex gap-2">
                  {RADIUS_OPTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRadiusChange(r)}
                      className={cn(
                        'flex-1 py-3 text-sm font-medium rounded-lg border transition-all',
                        radius === r
                          ? 'border-[var(--text)] text-[var(--text)] bg-[var(--text)]/5'
                          : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                <h2 className="text-sm font-medium text-[var(--text)] mb-6">Mode</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleModeChange('light')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all',
                      mode === 'light'
                        ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                    )}
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </button>
                  <button
                    onClick={() => handleModeChange('dark')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all',
                      mode === 'dark'
                        ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                    )}
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </button>
                </div>
              </div>

              {/* Import Theme */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)]/30 transition-all">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Import Theme</span>
                </button>
              </div>

              {/* Brand Colors */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                <button className="w-full flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:border-[var(--text-muted)]/30 transition-all">
                  <span className="text-sm font-medium text-[var(--text)]">Brand Colors</span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              </div>

              {/* Advanced Customization */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                  <h2 className="text-sm font-semibold text-[var(--text)]">Advanced Customization</h2>
                </div>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  For advanced theme customization with real-time preview, visual color picker, and hundreds of prebuilt themes, visit{' '}
                  <span className="text-[var(--text)] font-medium">tweakcn.com</span>
                </p>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">Open Tweakcn</span>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'layout' && (
            <motion.div
              key="layout"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Sidebar Variant */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                <h2 className="text-sm font-semibold text-[var(--text)] mb-1">Sidebar Variant</h2>
                <p className="text-xs text-[var(--text-muted)] mb-6 capitalize">
                  {sidebarVariant === 'inset' && 'Inset: Inset sidebar with rounded corners'}
                  {sidebarVariant === 'floating' && 'Floating: Sidebar floating with shadow'}
                  {sidebarVariant === 'default' && 'Default: Standard sidebar layout'}
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {SIDEBAR_VARIANTS.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantChange(variant.id as 'default' | 'floating' | 'inset')}
                      className={cn(
                        'p-4 rounded-xl border transition-all text-center',
                        sidebarVariant === variant.id
                          ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                          : 'border-[var(--border)] hover:border-[var(--accent)]/50'
                      )}
                    >
                      <div className="text-2xl mb-2">
                        {variant.id === 'default' && '□'}
                        {variant.id === 'floating' && '▢'}
                        {variant.id === 'inset' && '◫'}
                      </div>
                      <span className="text-sm font-medium text-[var(--text)]">{variant.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Collapsible Mode */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                <h2 className="text-sm font-semibold text-[var(--text)] mb-1">Sidebar Collapsible Mode</h2>
                <p className="text-xs text-[var(--text-muted)] mb-6">
                  {sidebarCollapsible === 'offcanvas' && 'Off Canvas: Slides out of view when collapsed'}
                  {sidebarCollapsible === 'icon' && 'Icon: Collapses to icon-only mode'}
                  {sidebarCollapsible === 'none' && 'None: Always fully expanded'}
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {COLLAPSE_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => handleCollapsibleChange(mode.id as 'offcanvas' | 'icon' | 'none')}
                      className={cn(
                        'p-4 rounded-xl border transition-all text-center',
                        sidebarCollapsible === mode.id
                          ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                          : 'border-[var(--border)] hover:border-[var(--accent)]/50'
                      )}
                    >
                      <div className="text-2xl mb-2">
                        {mode.id === 'offcanvas' && '☰'}
                        {mode.id === 'icon' && '◧'}
                        {mode.id === 'none' && '▭'}
                      </div>
                      <span className="text-sm font-medium text-[var(--text)]">{mode.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sidebar Position */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                <h2 className="text-sm font-semibold text-[var(--text)] mb-1">Sidebar Position</h2>
                <p className="text-xs text-[var(--text-muted)] mb-6">
                  {sidebarPosition === 'left' ? 'Left: Sidebar positioned on the left side' : 'Right: Sidebar positioned on the right side'}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {SIDEBAR_POSITIONS.map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => handlePositionChange(pos.id as 'left' | 'right')}
                      className={cn(
                        'p-4 rounded-xl border transition-all text-center',
                        sidebarPosition === pos.id
                          ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                          : 'border-[var(--border)] hover:border-[var(--accent)]/50'
                      )}
                    >
                      <div className="text-2xl mb-2">
                        {pos.id === 'left' && '◀'}
                        {pos.id === 'right' && '▶'}
                      </div>
                      <span className="text-sm font-medium text-[var(--text)]">{pos.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
