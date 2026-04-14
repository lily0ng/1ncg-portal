'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  User, 
  LogOut, 
  Moon, 
  Sun, 
  ChevronDown, 
  Plus, 
  Settings,
  Command,
  ExternalLink,
  LayoutGrid,
  X,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme, type Theme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'

interface NavItem {
  label: string
  href: string
  external?: boolean
}

const navItems: NavItem[] = [
  { label: 'Blocks', href: '/admin/blocks' },
  { label: 'Landing Page', href: '/admin/landing' },
  { label: 'GitHub', href: 'https://github.com', external: true },
]

export function Topbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [showProfile, setShowProfile] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const { theme, setTheme, mode, setMode } = useTheme()
  const { user } = useAuth()

  const isDark = mode === 'dark'
  const role = user?.role || 'ADMIN'

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark'
    setMode(newMode as 'light' | 'dark')
  }

  return (
    <header className="h-16 bg-[var(--bg)] border-b border-[var(--border)] shrink-0 sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--surface)] border border-[var(--border)] rounded-lg flex items-center justify-center">
              <LayoutGrid className="w-4 h-4 text-[var(--text)]" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-[var(--text)]">ShadcnStore</h1>
              <p className="text-xs text-[var(--text-muted)]">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-10 pr-12 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="hidden group-focus-within:inline-flex items-center justify-center w-5 h-5 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] rounded">
                ⌘
              </kbd>
              <kbd className="hidden group-focus-within:inline-flex items-center justify-center w-5 h-5 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] rounded">
                K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 mr-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                className="px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] rounded-md transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings */}
          <button
            onClick={() => router.push('/admin/settings')}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--surface)] transition-colors"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-[var(--accent)] to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-[var(--border)]">
                    <p className="text-sm font-medium text-[var(--text)]">{user?.name || 'Admin User'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{user?.email || 'admin@example.com'}</p>
                  </div>
                  
                  <div className="p-1">
                    <button
                      onClick={() => { router.push('/admin/settings'); setShowProfile(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
