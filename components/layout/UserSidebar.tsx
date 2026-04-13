'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'
import {
  LayoutDashboard,
  FolderKanban,
  ShoppingBag,
  Server,
  CloudCog,
  ServerIcon,
  HardDrive,
  Network,
  Scale,
  CreditCard,
  HelpCircle,
  BookOpen,
  X,
  Menu,
  ChevronRight,
  Puzzle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/portal/dashboard' },
  { icon: FolderKanban, label: 'Projects', href: '/portal/projects' },
  { icon: ShoppingBag, label: 'Store', href: '/portal/store' },
]

const vmItems = [
  { icon: Server, label: 'Instances', href: '/portal/instances' },
  { icon: CloudCog, label: 'VNF Appliances', href: '/portal/vnf-appliances' },
  { icon: ServerIcon, label: 'Snapshots', href: '/portal/snapshots' },
  { icon: HardDrive, label: 'Backups', href: '/portal/backups' },
  { icon: ServerIcon, label: 'Templates', href: '/portal/templates' },
  { icon: Puzzle, label: 'Affinity Groups', href: '/portal/affinity-groups' },
  { icon: CloudCog, label: 'Kubernetes', href: '/portal/kubernetes' },
  { icon: ShoppingBag, label: 'Apps', href: '/portal/apps' },
  { icon: Scale, label: 'Auto-scaling', href: '/portal/auto-scaling' },
  { icon: HardDrive, label: 'Volumes', href: '/portal/volumes' },
]

const networkItems = [
  { icon: Network, label: 'Networks', href: '/portal/networks' },
  { icon: Scale, label: 'Load Balancers', href: '/portal/load-balancers' },
]

const otherItems = [
  { icon: CreditCard, label: 'Billing', href: '/portal/billing', badge: 'MMK' },
]

const bottomItems = [
  { icon: HelpCircle, label: 'Support', href: '/portal/support' },
  { icon: BookOpen, label: 'Docs', href: '/portal/docs' },
]

export function UserSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: uiSettings } = useSWR('/api/ui-settings', fetcher)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg text-white"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-72 bg-[#0f172a] border-r border-slate-800 overflow-y-auto',
          'transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        <div className="p-6">
          {/* Logo */}
          <Link href="/portal/dashboard" className="flex items-center gap-3 mb-8">
            <img src="/resource/image/ONE CLOUD NEXT-GEN_Logo_JPEG version_v2.jpg" alt="Logo" className="w-10 h-10 object-contain rounded-lg" />
            <div>
              <h1 className="text-lg font-bold text-white">{uiSettings?.portalName || 'CloudStack'}</h1>
              <p className="text-xs text-slate-400">User Portal</p>
            </div>
          </Link>

          {/* Menu */}
          <nav className="space-y-6">
            {/* Main items */}
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                      isActive
                        ? 'bg-cyan-600/20 text-cyan-400'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>

            {/* VM Section */}
            <div>
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Virtual Machines
              </h3>
              <div className="space-y-1">
                {vmItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                        isActive
                          ? 'bg-cyan-600/20 text-cyan-400'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Network Section */}
            <div>
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Networking
              </h3>
              <div className="space-y-1">
                {networkItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                        isActive
                          ? 'bg-cyan-600/20 text-cyan-400'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Other items */}
            <div className="space-y-1 pt-4 border-t border-slate-800">
              {otherItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all',
                      isActive
                        ? 'bg-cyan-600/20 text-cyan-400'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs bg-cyan-600/20 text-cyan-400 rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      </aside>
    </>
  )
}
