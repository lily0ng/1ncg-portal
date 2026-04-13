'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bell, Search, User, LogOut, Moon, Sun, ChevronDown, Plus, Server, Container, Database, Network, Boxes, Key, HardDrive } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme, THEMES, type Theme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'

const THEME_META: Record<Theme, { name: string; color: string; isDark: boolean }> = {
  'dark-nebula':   { name: 'Dark Nebula',   color: '#6366f1', isDark: true },
  'ocean-breeze':  { name: 'Ocean Breeze',  color: '#0ea5e9', isDark: true },
  'forest-night':  { name: 'Forest Night',  color: '#22c55e', isDark: true },
  'sunset-pro':    { name: 'Sunset Pro',    color: '#f97316', isDark: true },
  'arctic-light':  { name: 'Arctic Light',  color: '#6366f1', isDark: false },
  'rose-gold':     { name: 'Rose Gold',     color: '#ec4899', isDark: true },
  'monochrome':    { name: 'Monochrome',    color: '#6b7280', isDark: true },
}

const CREATE_ITEMS_ALL = [
  // Compute
  { icon: Server, label: 'Instance', desc: 'Create Cloud Server', path: '/compute/instances?create=1', userPath: '/instances', roles: ['ADMIN', 'RESELLER', 'USER'], color: 'bg-blue-500' },
  { icon: Container, label: 'Kubernetes', desc: 'Create Kubernetes Cluster', path: '/compute/kubernetes?create=1', userPath: '/kubernetes', roles: ['ADMIN', 'RESELLER'], color: 'bg-indigo-500' },
  { icon: Boxes, label: 'VNF Appliance', desc: 'Add VNF Appliance', path: '/compute/vnf?create=1', userPath: '/vnf-appliances', roles: ['ADMIN'], color: 'bg-cyan-500' },
  // Storage
  { icon: Database, label: 'Volume', desc: 'Create Block Volume', path: '/storage/volumes?create=1', userPath: '/volumes', roles: ['ADMIN', 'RESELLER', 'USER'], color: 'bg-green-500' },
  { icon: HardDrive, label: 'Snapshot', desc: 'Create Volume Snapshot', path: '/storage/snapshots?create=1', userPath: '/snapshots', roles: ['ADMIN', 'RESELLER', 'USER'], color: 'bg-teal-500' },
  // Network
  { icon: Network, label: 'Network', desc: 'Add Guest Network', path: '/network/networks?create=1', userPath: '/networks', roles: ['ADMIN', 'RESELLER'], color: 'bg-purple-500' },
  // Access
  { icon: Key, label: 'SSH Key', desc: 'Add SSH Key Pair', path: '/access/ssh-keys?create=1', roles: ['ADMIN', 'RESELLER'], color: 'bg-amber-500' },
]

export function Topbar() {
  const router = useRouter()
  const [showThemes, setShowThemes] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const createRef = useRef<HTMLDivElement>(null)

  const role = user?.role || 'USER'
  const basePath = role === 'ADMIN' ? '/admin' : role === 'RESELLER' ? '/reseller' : '/user/portal'
  
  // Map paths based on role - USER uses simplified portal paths
  const getPath = (item: typeof CREATE_ITEMS_ALL[0]) => {
    if (role === 'USER' && item.userPath) {
      return item.userPath
    }
    return item.path
  }
  
  const createItems = CREATE_ITEMS_ALL
    .filter(item => item.roles.includes(role))
    .map(item => ({ ...item, href: `${basePath}${getPath(item)}` }))

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (createRef.current && !createRef.current.contains(e.target as Node)) {
        setShowCreate(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const meta = THEME_META[theme] || THEME_META['dark-nebula']

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="h-16 bg-[var(--bg)]/80 backdrop-blur-lg border-b border-[var(--border)] shrink-0 sticky top-0 z-40 isolate">
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
          {/* Create Dropdown */}
          <div className="relative" ref={createRef}>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
              <ChevronDown className={cn('w-4 h-4 transition-transform', showCreate && 'rotate-180')} />
            </button>

            {showCreate && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 top-full mt-2 w-80 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl py-2 z-[100]"
              >
                <div className="px-3 py-2 border-b border-[var(--border)]">
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Create New Resource</p>
                </div>
                <div className="max-h-[70vh] overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-transparent">
                  {createItems.map((item, index) => (
                    <button
                      key={item.label}
                      onClick={() => { router.push(item.href); setShowCreate(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left group"
                    >
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg transition-transform group-hover:scale-105', item.color)}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{item.label}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-3 py-2 border-t border-[var(--border)] mt-1">
                  <p className="text-xs text-[var(--text-muted)] text-center">
                    {createItems.length} resources available
                  </p>
                </div>
              </motion.div>
            )}
          </div>

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
