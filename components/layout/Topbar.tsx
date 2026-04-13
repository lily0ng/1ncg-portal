'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bell, Search, User, LogOut, Moon, Sun, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme, THEMES, type Theme } from '@/hooks/useTheme'

const THEME_META: Record<Theme, { name: string; color: string; isDark: boolean }> = {
  'dark-nebula':   { name: 'Dark Nebula',   color: '#6366f1', isDark: true },
  'ocean-breeze':  { name: 'Ocean Breeze',  color: '#0ea5e9', isDark: true },
  'forest-night':  { name: 'Forest Night',  color: '#22c55e', isDark: true },
  'sunset-pro':    { name: 'Sunset Pro',    color: '#f97316', isDark: true },
  'arctic-light':  { name: 'Arctic Light',  color: '#6366f1', isDark: false },
  'rose-gold':     { name: 'Rose Gold',     color: '#ec4899', isDark: true },
  'monochrome':    { name: 'Monochrome',    color: '#6b7280', isDark: true },
}

export function Topbar() {
  const router = useRouter()
  const [showThemes, setShowThemes] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { theme, setTheme } = useTheme()

  const meta = THEME_META[theme] || THEME_META['dark-nebula']

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 z-30 h-16 bg-[var(--bg)]/80 backdrop-blur-lg border-b border-[var(--border)]">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search resources..."
              className="w-full bg-white/5 border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowThemes(!showThemes)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: meta.color }} />
              <span className="text-sm hidden sm:inline">{meta.name}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showThemes && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 w-52 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl py-2 z-50"
              >
                {THEMES.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTheme(t); setShowThemes(false) }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10 transition-colors',
                      theme === t ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
                    )}
                  >
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: THEME_META[t].color }} />
                    {THEME_META[t].name}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Dark/Light toggle */}
          <button
            onClick={() => setTheme(meta.isDark ? 'arctic-light' : 'dark-nebula')}
            className="p-2 rounded-lg bg-white/5 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            {meta.isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg bg-white/5 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent)] to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl py-2 z-50"
              >
                <div className="px-4 py-2 border-b border-[var(--border)]">
                  <p className="text-sm font-medium text-[var(--text)]">Admin User</p>
                  <p className="text-xs text-[var(--text-muted)]">admin@cloudstack.local</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
