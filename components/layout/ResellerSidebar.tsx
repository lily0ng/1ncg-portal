'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Server,
  HardDrive,
  Network,
  CreditCard,
  HeadphonesIcon,
  DollarSign,
  Percent,
  ChevronRight,
  ChevronDown,
  Cloud,
  LogOut,
  Menu,
  X,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
}

interface NavSection {
  title: string | null
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    title: null,
    items: [
      { icon: LayoutDashboard, label: 'Dashboard',  href: '/reseller/dashboard' },
      { icon: Users,           label: 'Customers',  href: '/reseller/customers' },
    ]
  },
  {
    title: 'RESOURCES',
    items: [
      { icon: Server,    label: 'Instances', href: '/reseller/compute/instances' },
      { icon: HardDrive, label: 'Volumes',   href: '/reseller/storage/volumes' },
      { icon: Network,   label: 'Networks',  href: '/reseller/network/guest-networks' },
    ]
  },
  {
    title: 'BILLING',
    items: [
      { icon: CreditCard, label: 'Billing Overview', href: '/reseller/billing' },
      { icon: DollarSign, label: 'Invoices',         href: '/reseller/billing/invoices' },
      { icon: Percent,    label: 'Commissions',      href: '/reseller/billing/commissions' },
    ]
  },
  {
    title: 'SUPPORT',
    items: [
      { icon: HeadphonesIcon, label: 'Support', href: '/reseller/support' },
    ]
  }
]

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
        isActive
          ? 'bg-cyan-500/20 text-cyan-400 font-medium'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      )}
    >
      <item.icon className="w-4 h-4 flex-shrink-0" />
      <span>{item.label}</span>
      {isActive && (
        <ChevronRight className="ml-auto w-3 h-3 text-cyan-400" />
      )}
    </Link>
  )
}

interface CollapsibleSectionProps {
  section: NavSection
  pathname: string
}

function CollapsibleSection({ section, pathname }: CollapsibleSectionProps) {
  const hasActive = section.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
  const [open, setOpen] = useState(true)

  if (!section.title) {
    return (
      <div className="space-y-1">
        {section.items.map(item => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between px-3 py-1.5 mb-1 group"
      >
        <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase group-hover:text-slate-400 transition-colors">
          {section.title}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-1">
              {section.items.map(item => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ResellerSidebar() {
  const pathname = usePathname() ?? ''
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <Link
          href="/reseller/dashboard"
          className="flex items-center gap-3"
          onClick={() => setMobileOpen(false)}
        >
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg shadow-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">CloudStack</h1>
            <p className="text-xs text-slate-400 leading-tight">Reseller Portal</p>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-700/50 mb-4" />

      {/* Nav */}
      <nav className="flex-1 px-4 overflow-y-auto space-y-4 pb-4">
        {sections.map((section, idx) => (
          <CollapsibleSection
            key={idx}
            section={section}
            pathname={pathname}
          />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-700/50 mt-2" />

      {/* User / Logout */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">Reseller Account</p>
            <p className="text-xs text-slate-400 truncate">Partner Portal</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1e2a4a] border border-slate-700 rounded-lg text-white shadow-lg"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="lg:hidden fixed left-0 top-0 z-40 h-screen w-72 bg-[#1e2a4a] border-r border-slate-700/50 overflow-hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar (always visible) */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-72 bg-[#1e2a4a] border-r border-slate-700/50 z-40">
        <SidebarContent />
      </aside>
    </>
  )
}
