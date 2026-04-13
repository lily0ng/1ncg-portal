'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Server,
  HardDrive,
  Network,
  Image,
  CalendarDays,
  FolderKanban,
  UserCog,
  Users,
  Building2,
  CloudCog,
  Settings,
  Puzzle,
  Wrench,
  Palette,
  CreditCard,
  Tag,
  RefreshCw,
  ShoppingBag,
  ChevronRight,
  ChevronDown,
  ServerIcon,
  X,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

// Import missing icons
import { Cpu, Database, AlertTriangle, Shield } from 'lucide-react'

export function AdminSidebar() {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>(['Overview', 'Compute', 'Storage', 'Network', 'Images', 'Management'])
  const [mobileOpen, setMobileOpen] = useState(false)

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
          'fixed left-0 top-0 z-40 h-screen w-72 bg-sidebar border-r border-sidebar-border overflow-y-auto',
          'transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:translate-x-0 lg:z-auto lg:shrink-0'
        )}
      >
        <div className="p-6">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">CloudStack</h1>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>
          </Link>

          {/* Menu */}
          <nav className="space-y-2">
            {menuSections.map((section) => (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-sidebar-foreground transition-colors"
                >
                  {section.title}
                  <ChevronDown
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
        </div>
      </aside>
    </>
  )
}
