'use client'

import { useEffect, useRef, useState } from 'react'
import { Palette, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme, THEMES, type Theme } from '@/hooks/useTheme'

interface ThemeMeta {
  label: string
  swatch: string[]
  description: string
}

const THEME_META: Record<Theme, ThemeMeta> = {
  'dark-nebula': {
    label: 'Dark Nebula',
    swatch: ['#0f172a', '#1e293b', '#06b6d4'],
    description: 'Deep space dark with cyan accents'
  },
  'ocean-breeze': {
    label: 'Ocean Breeze',
    swatch: ['#0c1445', '#1a3a6e', '#38bdf8'],
    description: 'Cool ocean blues and sky tones'
  },
  'forest-night': {
    label: 'Forest Night',
    swatch: ['#0d1f17', '#1a3d2b', '#4ade80'],
    description: 'Dark forest greens with emerald glow'
  },
  'sunset-pro': {
    label: 'Sunset Pro',
    swatch: ['#1c0f1f', '#3d1a2e', '#f97316'],
    description: 'Warm sunset purples and orange'
  },
  'arctic-light': {
    label: 'Arctic Light',
    swatch: ['#f0f4f8', '#e2e8f0', '#0284c7'],
    description: 'Clean light theme with ice blue'
  },
  'rose-gold': {
    label: 'Rose Gold',
    swatch: ['#1a0d14', '#3d1a2e', '#fb7185'],
    description: 'Luxury rose and gold tones'
  },
  'monochrome': {
    label: 'Monochrome',
    swatch: ['#111111', '#333333', '#e5e5e5'],
    description: 'Pure black, white and grey'
  }
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const currentMeta = THEME_META[theme]

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
          'bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50',
          'text-slate-300 hover:text-white',
          open && 'bg-slate-700/80 text-white'
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Change theme"
      >
        {/* Color swatches preview */}
        <span className="flex items-center gap-0.5">
          {currentMeta.swatch.map((color, i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: color }}
            />
          ))}
        </span>
        <Palette className="w-3.5 h-3.5" />
        <span className="hidden sm:block">{currentMeta.label}</span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className={cn(
            'absolute right-0 mt-2 w-64 z-50',
            'bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl',
            'overflow-hidden'
          )}
          role="listbox"
          aria-label="Select theme"
        >
          <div className="px-3 pt-3 pb-2 border-b border-slate-700/50">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Choose Theme
            </p>
          </div>

          <ul className="py-1.5 max-h-80 overflow-y-auto">
            {THEMES.map((t) => {
              const meta = THEME_META[t]
              const isActive = t === theme

              return (
                <li key={t}>
                  <button
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      setTheme(t)
                      setOpen(false)
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-100',
                      isActive
                        ? 'bg-cyan-500/15 text-white'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    )}
                  >
                    {/* Swatch preview */}
                    <span className="flex items-center gap-0.5 flex-shrink-0">
                      {meta.swatch.map((color, i) => (
                        <span
                          key={i}
                          className={cn(
                            'rounded-sm flex-shrink-0',
                            i === 0 ? 'w-4 h-5' : i === 1 ? 'w-3 h-5' : 'w-2.5 h-5'
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </span>

                    {/* Text */}
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium leading-tight">{meta.label}</span>
                      <span className="block text-xs text-slate-500 leading-tight mt-0.5 truncate">
                        {meta.description}
                      </span>
                    </span>

                    {/* Active check */}
                    {isActive && (
                      <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
