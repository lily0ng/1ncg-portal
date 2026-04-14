'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, LayoutDashboard, Settings, Users, Server, Database, Cloud, Shield, CreditCard, Bell, HelpCircle, X, Command } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  category: string
}

const searchItems: SearchItem[] = [
  // Dashboard
  { id: 'dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, category: 'Overview' },
  
  // Compute
  { id: 'instances', label: 'Instances', href: '/admin/compute/instances', icon: <Server className="w-4 h-4" />, category: 'Compute' },
  { id: 'snapshots', label: 'Instance Snapshots', href: '/admin/compute/instance-snapshots', icon: <Database className="w-4 h-4" />, category: 'Compute' },
  { id: 'kubernetes', label: 'Kubernetes', href: '/admin/compute/kubernetes', icon: <Cloud className="w-4 h-4" />, category: 'Compute' },
  { id: 'autoscaling', label: 'AutoScaling', href: '/admin/compute/autoscaling', icon: <Server className="w-4 h-4" />, category: 'Compute' },
  { id: 'ssh-keys', label: 'SSH Keys', href: '/admin/compute/ssh-keys', icon: <Shield className="w-4 h-4" />, category: 'Compute' },
  
  // Storage
  { id: 'volumes', label: 'Volumes', href: '/admin/storage/volumes', icon: <Database className="w-4 h-4" />, category: 'Storage' },
  { id: 'backups', label: 'Backups', href: '/admin/storage/backups', icon: <Database className="w-4 h-4" />, category: 'Storage' },
  
  // Network
  { id: 'guest-networks', label: 'Guest Networks', href: '/admin/network/guest-networks', icon: <Cloud className="w-4 h-4" />, category: 'Network' },
  { id: 'vpc', label: 'VPC', href: '/admin/network/vpc', icon: <Cloud className="w-4 h-4" />, category: 'Network' },
  
  // Settings
  { id: 'settings', label: 'Settings', href: '/admin/settings', icon: <Settings className="w-4 h-4" />, category: 'Configuration' },
  
  // Billing
  { id: 'billing', label: 'Billing', href: '/admin/billing', icon: <CreditCard className="w-4 h-4" />, category: 'Billing' },
  
  // Support
  { id: 'support', label: 'Support', href: '/admin/support', icon: <HelpCircle className="w-4 h-4" />, category: 'Support' },
  { id: 'alerts', label: 'Alerts', href: '/admin/infrastructure/alerts', icon: <Bell className="w-4 h-4" />, category: 'Support' },
]

export function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  // Handle Command+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Command+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      
      // Close on Escape
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Filter items based on query
  const filteredItems = query.trim() === '' 
    ? searchItems 
    : searchItems.filter(item => 
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, SearchItem[]>)

  const handleSelect = (item: SearchItem) => {
    router.push(item.href)
    setIsOpen(false)
    setQuery('')
  }

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const flatItems = filteredItems
      
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % flatItems.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + flatItems.length) % flatItems.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (flatItems[selectedIndex]) {
          handleSelect(flatItems[selectedIndex])
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredItems, selectedIndex])

  return (
    <>
      {/* Search Trigger - Screenshot style */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search...</span>
        <div className="flex items-center gap-0.5">
          <kbd className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] rounded">
            ⌘
          </kbd>
          <kbd className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] rounded">
            K
          </kbd>
        </div>
      </button>

      {/* Search Dialog Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Dialog - Centered */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
            >
              <div className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--border)]">
                <Search className="w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search commands, pages, or settings..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedIndex(0)
                  }}
                  className="flex-1 bg-transparent text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none text-sm"
                  autoFocus
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filteredItems.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[var(--text-muted)] text-sm">
                    No results found for &quot;{query}&quot;
                  </div>
                ) : (
                  Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category} className="mb-2">
                      <div className="px-3 py-2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                        {category}
                      </div>
                      {items.map((item, idx) => {
                        const globalIndex = filteredItems.findIndex(i => i.id === item.id)
                        const isSelected = globalIndex === selectedIndex
                        
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                              isSelected
                                ? 'bg-[var(--accent)]/10 text-[var(--text)]'
                                : 'text-[var(--text-muted)] hover:bg-[var(--bg)]'
                            )}
                          >
                            <span className={cn(
                              'flex items-center justify-center w-8 h-8 rounded-lg',
                              isSelected ? 'bg-[var(--accent)]/20' : 'bg-[var(--bg)]'
                            )}>
                              {item.icon}
                            </span>
                            <span className="flex-1 text-left font-medium">{item.label}</span>
                            {isSelected && (
                              <span className="text-xs text-[var(--text-muted)]">↵</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2 bg-[var(--bg)] border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded">↵</kbd>
                  <span>Select</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded">Esc</kbd>
                  <span>Close</span>
                </div>
              </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
