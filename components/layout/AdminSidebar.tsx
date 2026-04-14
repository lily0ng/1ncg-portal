'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import useSWR from 'swr'
import {
  LayoutDashboard,
  Server,
  HardDrive,
  Network,
  Image,
  CalendarDays,
  FolderKanban,
  UserCog,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ServerIcon,
  RefreshCw,
  Tag,
  Puzzle,
  Wrench,
  Palette,
  CloudCog,
  ChevronDown as ChevronDownIcon,
  X as CloseIcon,
  Settings,
  ShoppingCart,
  Shield,
  Users,
  Cpu,
  Building2,
  CreditCard,
  ShoppingBag,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const menuSections = [
  {
    title: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    ],
  },
  {
    title: 'Compute',
    items: [
      { icon: Server, label: 'Instances', href: '/admin/compute/instances' },
      { icon: ServerIcon, label: 'Instance Snapshots', href: '/admin/compute/instance-snapshots' },
      { icon: CloudCog, label: 'Kubernetes', href: '/admin/compute/kubernetes' },
      { icon: RefreshCw, label: 'AutoScaling', href: '/admin/compute/autoscaling' },
      { icon: FolderKanban, label: 'Instance Groups', href: '/admin/compute/instance-groups' },
      { icon: UserCog, label: 'SSH Keys', href: '/admin/compute/ssh-keys' },
      { icon: Settings, label: 'User Data', href: '/admin/compute/user-data' },
      { icon: Network, label: 'CNI Config', href: '/admin/compute/cni-config' },
      { icon: Puzzle, label: 'Affinity Groups', href: '/admin/compute/affinity-groups' },
    ],
  },
  {
    title: 'Storage',
    items: [
      { icon: HardDrive, label: 'Volumes', href: '/admin/storage/volumes' },
      { icon: ServerIcon, label: 'Volume Snapshots', href: '/admin/storage/volume-snapshots' },
      { icon: CalendarDays, label: 'Snapshot Policies', href: '/admin/storage/snapshot-policies' },
      { icon: HardDrive, label: 'Backups', href: '/admin/storage/backups' },
      { icon: CalendarDays, label: 'Backup Schedules', href: '/admin/storage/backup-schedules' },
      { icon: FolderKanban, label: 'Buckets', href: '/admin/storage/buckets' },
      { icon: FolderKanban, label: 'Shared Filesystems', href: '/admin/storage/shared-filesystems' },
    ],
  },
  {
    title: 'Network',
    items: [
      { icon: Network, label: 'Guest Networks', href: '/admin/network/guest-networks' },
      { icon: CloudCog, label: 'VPC', href: '/admin/network/vpc' },
      { icon: Server, label: 'VNF Appliances', href: '/admin/network/vnf-appliances' },
      { icon: ServerIcon, label: 'Public IPs', href: '/admin/network/public-ips' },
      { icon: Settings, label: 'AS Numbers', href: '/admin/network/as-numbers' },
      { icon: Network, label: 'Site-to-Site VPN', href: '/admin/network/site-to-site-vpn' },
      { icon: Network, label: 'VPN Connections', href: '/admin/network/vpn-connections' },
      { icon: Settings, label: 'Network ACLs', href: '/admin/network/network-acls' },
      { icon: Users, label: 'VPN Users', href: '/admin/network/vpn-users' },
      { icon: ServerIcon, label: 'Customer Gateway', href: '/admin/network/vpn-customer-gateway' },
      { icon: Tag, label: 'Guest VLAN', href: '/admin/network/guest-vlan' },
      { icon: ServerIcon, label: 'IPv4 Subnets', href: '/admin/network/ipv4-subnets' },
    ],
  },
  {
    title: 'Images',
    items: [
      { icon: Image, label: 'Templates', href: '/admin/images/templates' },
      { icon: ServerIcon, label: 'ISOs', href: '/admin/images/isos' },
      { icon: CloudCog, label: 'Kubernetes ISOs', href: '/admin/images/kubernetes-isos' },
    ],
  },
  {
    title: 'Management',
    items: [
      { icon: CalendarDays, label: 'Events', href: '/admin/events' },
      { icon: FolderKanban, label: 'Projects', href: '/admin/projects' },
      { icon: UserCog, label: 'Roles', href: '/admin/roles' },
      { icon: Users, label: 'Accounts', href: '/admin/accounts' },
      { icon: Building2, label: 'Domains', href: '/admin/domains' },
    ],
  },
  {
    title: 'Infrastructure',
    items: [
      { icon: CloudCog, label: 'Summary', href: '/admin/infrastructure/summary' },
      { icon: Server, label: 'Zones', href: '/admin/infrastructure/zones' },
      { icon: CloudCog, label: 'Pods', href: '/admin/infrastructure/pods' },
      { icon: ServerIcon, label: 'Clusters', href: '/admin/infrastructure/clusters' },
      { icon: Server, label: 'Hosts', href: '/admin/infrastructure/hosts' },
      { icon: HardDrive, label: 'Primary Storage', href: '/admin/infrastructure/primary-storage' },
      { icon: HardDrive, label: 'Secondary Storage', href: '/admin/infrastructure/secondary-storage' },
      { icon: HardDrive, label: 'Backup Repository', href: '/admin/infrastructure/backup-repository' },
      { icon: FolderKanban, label: 'Object Storage', href: '/admin/infrastructure/object-storage' },
      { icon: Server, label: 'System VMs', href: '/admin/infrastructure/system-vms' },
      { icon: Network, label: 'Virtual Routers', href: '/admin/infrastructure/virtual-routers' },
      { icon: Server, label: 'Internal LB', href: '/admin/infrastructure/internal-lb' },
      { icon: ServerIcon, label: 'Management Servers', href: '/admin/infrastructure/management-servers' },
      { icon: Cpu, label: 'CPU Sockets', href: '/admin/infrastructure/cpu-sockets' },
      { icon: Database, label: 'DB/Usage Server', href: '/admin/infrastructure/db-usage-server' },
      { icon: AlertTriangle, label: 'Alerts', href: '/admin/infrastructure/alerts' },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { icon: Settings, label: 'Global Settings', href: '/admin/configuration/global-settings' },
      { icon: Users, label: 'LDAP', href: '/admin/configuration/ldap' },
      { icon: Shield, label: 'OAuth', href: '/admin/configuration/oauth' },
      { icon: Cpu, label: 'Hypervisor Caps', href: '/admin/configuration/hypervisor-capabilities' },
      { icon: Tag, label: 'Guest OS Categories', href: '/admin/configuration/guest-os-categories' },
      { icon: Server, label: 'Guest OS', href: '/admin/configuration/guest-os' },
      { icon: Settings, label: 'Guest OS Mappings', href: '/admin/configuration/guest-os-mappings' },
      { icon: Image, label: 'GPU Card Types', href: '/admin/configuration/gpu-card-types' },
    ],
  },
  {
    title: 'Billing',
    items: [
      { icon: CreditCard, label: 'Billing Management', href: '/admin/billing-management' },
      { icon: Tag, label: 'Pricing Management', href: '/admin/pricing-management' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { icon: RefreshCw, label: 'Sync CloudStack', href: '/admin/sync-cloudstack' },
      { icon: ShoppingBag, label: 'Marketplace', href: '/admin/marketplace' },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>(['Overview', 'Compute', 'Storage', 'Network', 'Images', 'Management'])
  const [mobileOpen, setMobileOpen] = useState(false)
  const { sidebarVariant, sidebarPosition, sidebarOpen, toggleSidebar, sidebarCollapsible } = useTheme()
  
  const isCollapsed = !sidebarOpen && sidebarCollapsible === 'icon'
  const { data: uiSettings } = useSWR('/api/ui-settings', fetcher)

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] shadow-lg"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-900/30 z-30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Collapse Button */}
      <button
        onClick={toggleSidebar}
        className="hidden lg:flex fixed left-72 top-1/2 -translate-y-1/2 z-50 w-6 h-12 -ml-3 items-center justify-center bg-[var(--surface)] border border-[var(--border)] rounded-r-lg shadow-md hover:bg-[var(--accent)]/10 transition-all"
        style={{ left: sidebarOpen ? '18rem' : '0' }}
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-4 h-4 text-[var(--text)]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[var(--text)]" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 z-40 h-screen bg-sidebar overflow-y-auto',
          'transition-all duration-300 ease-in-out',
          sidebarPosition === 'right' ? 'right-0' : 'left-0',
          sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-0 lg:w-16 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : sidebarPosition === 'right' ? 'translate-x-full' : '-translate-x-full',
          'lg:relative lg:translate-x-0 lg:z-auto lg:shrink-0',
          sidebarVariant === 'floating' && 'm-4 h-[calc(100vh-2rem)] rounded-xl border border-sidebar-border shadow-lg',
          sidebarVariant === 'inset' && 'm-4 h-[calc(100vh-2rem)] rounded-xl border border-sidebar-border',
          sidebarVariant === 'default' && 'border-r border-sidebar-border'
        )}
      >
        <div className={cn('h-full', sidebarOpen ? 'p-6' : 'p-2 flex flex-col items-center')}>
          {/* Logo - ShadcnStore Style */}
          <Link href="/admin/dashboard" className={cn('flex items-center gap-3 mb-8', !sidebarOpen && 'lg:justify-center')}>
            <div className="w-8 h-8 bg-[var(--surface)] border border-[var(--border)] rounded-lg flex items-center justify-center shrink-0">
              <LayoutGrid className="w-4 h-4 text-[var(--text)]" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-sm font-bold text-sidebar-foreground">ShadcnStore</h1>
                <p className="text-xs text-muted-foreground">Admin Dashboard</p>
              </div>
            )}
          </Link>

          {/* Menu */}
          {sidebarOpen ? (
            <nav className="space-y-2">
              {menuSections.map((section) => (
                <div key={section.title}>
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-sidebar-foreground transition-colors"
                  >
                    {section.title}
                    <ChevronDownIcon
                      className={cn(
                        'w-4 h-4 transition-transform',
                        expandedSections.includes(section.title) && 'rotate-180'
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {expandedSections.includes(section.title) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 mt-1">
                          {section.items.map((item) => {
                            const isActive = pathname === item.href
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                                  isActive
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                                )}
                              >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                              </Link>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
          ) : (
            /* Collapsed Icons Only */
            <nav className="flex flex-col items-center gap-2">
              {menuSections.map((section) => (
                section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'p-2 rounded-lg transition-all',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                      title={item.label}
                    >
                      <item.icon className="w-5 h-5" />
                    </Link>
                  )
                })
              ))}
            </nav>
          )}

          {sidebarOpen && (
            <>
              {/* Welcome Card */}
              <div className="mt-6 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  <button 
                    onClick={() => setMobileOpen(false)}
                    className="ml-auto text-muted-foreground hover:text-sidebar-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-sm font-semibold text-sidebar-foreground mb-1">Welcome to ShadcnStore</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Explore our collection of Shadcn UI blocks to build your next project faster.
                </p>
              </div>

              {/* User Profile Footer */}
              <div className="mt-6 pt-4 border-t border-sidebar-border">
                <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent)] to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">A</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-sidebar-foreground">ShadcnStore</p>
                    <p className="text-xs text-muted-foreground">shadcn@example.com</p>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
