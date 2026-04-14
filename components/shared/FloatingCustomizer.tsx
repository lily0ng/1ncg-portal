'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X, Palette, Layout, Moon, Sun, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

type Tab = 'theme' | 'layout'

const THEMES = [
  { id: 'default', name: 'Default', color: '#09090b', desc: 'Dark theme with purple accent' },
  { id: 'ocean', name: 'Ocean', color: '#0c4a6e', desc: 'Blue ocean-inspired palette' },
  { id: 'forest', name: 'Forest', color: '#14532d', desc: 'Green nature-inspired theme' },
  { id: 'sunset', name: 'Sunset', color: '#9a3412', desc: 'Warm orange and red tones' },
  { id: 'rose', name: 'Rose', color: '#9f1239', desc: 'Soft pink and rose colors' },
  { id: 'mono', name: 'Mono', color: '#18181b', desc: 'Clean black and white' },
]

const SIDEBAR_VARIANTS = [
  { id: 'default', name: 'Default', icon: '□' },
  { id: 'floating', name: 'Floating', icon: '▢' },
  { id: 'inset', name: 'Inset', icon: '◫' },
]

const COLLAPSE_MODES = [
  { id: 'offcanvas', name: 'Off Canvas', icon: '☰' },
  { id: 'icon', name: 'Icon', icon: '◧' },
  { id: 'none', name: 'None', icon: '▭' },
]

const SIDEBAR_POSITIONS = [
  { id: 'left', name: 'Left', icon: '◀' },
  { id: 'right', name: 'Right', icon: '▶' },
]

const RADIUS_OPTIONS = [0, 0.3, 0.5, 0.75, 1.0]

export function FloatingCustomizer() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('theme')
  
  const {
    theme,
    setTheme,
    mode,
    setMode,
    radius,
    setRadius,
    sidebarVariant,
    setSidebarVariant,
    sidebarCollapsible,
    setSidebarCollapsible,
    sidebarPosition,
    setSidebarPosition
  } = useTheme()

  const handleThemeSelect = (themeId: string) => {
    const themeMap: Record<string, any> = {
      'default': 'dark-nebula',
      'ocean': 'ocean-breeze',
      'forest': 'forest-night',
      'sunset': 'sunset-pro',
      'rose': 'rose-gold',
      'mono': 'monochrome'
    }
    setTheme(themeMap[themeId] || 'dark-nebula')
  }

  return (
    <>
      {/* Floating Button - Right Center */}
      <motion.button
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-lg flex items-center justify-center hover:bg-[var(--accent)]/10 transition-colors"
      >
        <Settings className="w-5 h-5 text-[var(--text)]" />
      </motion.button>

      {/* Slide-out Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />
            
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-[var(--bg)] border-l border-[var(--border)] z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  <span className="font-semibold text-[var(--text)]">Customizer</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors"
                  >
                    {mode === 'dark' ? <Moon className="w-4 h-4 text-[var(--text)]" /> : <Sun className="w-4 h-4 text-[var(--text)]" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors"
                  >
                    <X className="w-4 h-4 text-[var(--text)]" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="p-4">
                <div className="flex gap-2 p-1 bg-[var(--surface)] rounded-lg">
                  <button
                    onClick={() => setActiveTab('theme')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all',
                      activeTab === 'theme'
                        ? 'bg-[var(--accent)] text-white'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    )}
                  >
                    <Palette className="w-4 h-4" />
                    Theme
                  </button>
                  <button
                    onClick={() => setActiveTab('layout')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all',
                      activeTab === 'layout'
                        ? 'bg-[var(--accent)] text-white'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    )}
                  >
                    <Layout className="w-4 h-4" />
                    Layout
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 pb-4">
                {activeTab === 'theme' ? (
                  <div className="space-y-6">
                    {/* Theme Presets */}
                    <div>
                      <h3 className="text-sm font-medium text-[var(--text)] mb-3">Shadcn UI Theme Presets</h3>
                      <div className="space-y-2">
                        {THEMES.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => handleThemeSelect(t.id)}
                            className={cn(
                              'w-full flex items-center gap-3 p-3 rounded-lg border transition-all',
                              theme.includes(t.id === 'default' ? 'nebula' : t.id)
                                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                                : 'border-[var(--border)] hover:border-[var(--accent)]/50'
                            )}
                          >
                            <div
                              className="w-6 h-6 rounded-full border border-[var(--border)]"
                              style={{ backgroundColor: t.color }}
                            />
                            <span className="text-sm text-[var(--text)]">{t.name}</span>
                            {theme.includes(t.id === 'default' ? 'nebula' : t.id) && (
                              <Check className="w-4 h-4 text-[var(--accent)] ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Radius */}
                    <div>
                      <h3 className="text-sm font-medium text-[var(--text)] mb-3">Radius</h3>
                      <div className="flex gap-2">
                        {RADIUS_OPTIONS.map((r) => (
                          <button
                            key={r}
                            onClick={() => setRadius(r)}
                            className={cn(
                              'flex-1 py-2 rounded-lg border text-sm font-medium transition-all',
                              radius === r
                                ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]'
                                : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                            )}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mode */}
                    <div>
                      <h3 className="text-sm font-medium text-[var(--text)] mb-3">Mode</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMode('light')}
                          className={cn(
                            'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all',
                            mode === 'light'
                              ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]'
                              : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                          )}
                        >
                          <Sun className="w-4 h-4" />
                          Light
                        </button>
                        <button
                          onClick={() => setMode('dark')}
                          className={cn(
                            'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all',
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
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Sidebar Variant */}
                    <div>
                      <h3 className="text-sm font-medium text-[var(--text)] mb-1">Sidebar Variant</h3>
                      <p className="text-xs text-[var(--text-muted)] mb-3">
                        {sidebarVariant === 'inset' && 'Inset: Inset sidebar with rounded corners'}
                        {sidebarVariant === 'floating' && 'Floating: Sidebar floating with shadow'}
                        {sidebarVariant === 'default' && 'Default: Standard sidebar layout'}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {SIDEBAR_VARIANTS.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => setSidebarVariant(v.id as any)}
                            className={cn(
                              'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all',
                              sidebarVariant === v.id
                                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                                : 'border-[var(--border)] hover:border-[var(--accent)]/50'
                            )}
                          >
                            <span className="text-lg">{v.icon}</span>
                            <span className="text-xs text-[var(--text)]">{v.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Collapsible Mode */}
                    <div>
                      <h3 className="text-sm font-medium text-[var(--text)] mb-1">Sidebar Collapsible Mode</h3>
                      <p className="text-xs text-[var(--text-muted)] mb-3">
                        {sidebarCollapsible === 'offcanvas' && 'Off Canvas: Slides out of view'}
                        {sidebarCollapsible === 'icon' && 'Icon: Collapses to icon bar'}
                        {sidebarCollapsible === 'none' && 'None: Always fully visible'}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {COLLAPSE_MODES.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSidebarCollapsible(m.id as any)}
                            className={cn(
                              'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all',
                              sidebarCollapsible === m.id
                                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                                : 'border-[var(--border)] hover:border-[var(--accent)]/50'
                            )}
                          >
                            <span className="text-lg">{m.icon}</span>
                            <span className="text-xs text-[var(--text)]">{m.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sidebar Position */}
                    <div>
                      <h3 className="text-sm font-medium text-[var(--text)] mb-1">Sidebar Position</h3>
                      <p className="text-xs text-[var(--text-muted)] mb-3">
                        {sidebarPosition === 'left' ? 'Left: Sidebar positioned on the left side' : 'Right: Sidebar positioned on the right side'}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {SIDEBAR_POSITIONS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setSidebarPosition(p.id as any)}
                            className={cn(
                              'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all',
                              sidebarPosition === p.id
                                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                                : 'border-[var(--border)] hover:border-[var(--accent)]/50'
                            )}
                          >
                            <span className="text-lg">{p.icon}</span>
                            <span className="text-xs text-[var(--text)]">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
