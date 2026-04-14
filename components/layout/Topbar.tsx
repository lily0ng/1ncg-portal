'use client'

import { useState, useEffect, useRef } from 'react'
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
  X,
  Sparkles,
  CreditCard,
  Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme, type Theme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { SearchDialog } from '@/components/shared/SearchDialog'

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

        {/* Center: Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <SearchDialog />
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
                  className="absolute right-0 top-full mt-2 w-64 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  {/* User Header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent)] to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">{user?.name || '1CNG CMP'}</p>
                      <p className="text-xs text-[var(--text-muted)]">{user?.email || 'admin@1cng.com'}</p>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="p-1">
                    <button
                      onClick={() => { router.push('/admin/account'); setShowProfile(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Account
                    </button>
                    
                    <button
                      onClick={() => { router.push('/admin/billing'); setShowProfile(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] rounded-lg transition-colors"
                    >
                      <CreditCard className="w-4 h-4" />
                      Billing
                    </button>
                    
                    <button
                      onClick={() => { router.push('/admin/notifications'); setShowProfile(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] rounded-lg transition-colors"
                    >
                      <Bell className="w-4 h-4" />
                      Notifications
                    </button>
                  </div>
                  
                  {/* Divider */}
                  <div className="border-t border-[var(--border)]" />
                  
                  {/* Logout */}
                  <div className="p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
