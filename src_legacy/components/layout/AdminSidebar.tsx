import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  HardDrive,
  Network,
  Image as ImageIcon,
  Activity,
  FolderKanban,
  Shield,
  Users,
  Building2,
  Globe,
  Settings,
  Wrench,
  MonitorPlay,
  CreditCard,
  DollarSign,
  RefreshCw,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  Cloud,
  Puzzle,
  Layers } from
'lucide-react';
import { ScrollArea } from '../ui/ScrollArea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger } from
'../ui/Collapsible';
interface NavChild {
  name: string;
  path: string;
}
interface NavItem {
  name: string;
  icon: React.ElementType;
  path?: string;
  id?: string;
  children?: NavChild[];
}
interface AdminSidebarProps {
  isOpen: boolean;
}
export function AdminSidebar({ isOpen }: AdminSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    compute: true
  });
  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin/dashboard'
  },
  {
    name: 'Compute',
    icon: Server,
    id: 'compute',
    children: [
    {
      name: 'Instances',
      path: '/admin/compute/instances'
    },
    {
      name: 'Instance Snapshots',
      path: '/admin/compute/instance-snapshots'
    },
    {
      name: 'Kubernetes',
      path: '/admin/compute/kubernetes'
    },
    {
      name: 'AutoScaling',
      path: '/admin/compute/autoscaling'
    },
    {
      name: 'Instance Groups',
      path: '/admin/compute/instance-groups'
    },
    {
      name: 'SSH Keys',
      path: '/admin/compute/ssh-keys'
    },
    {
      name: 'User Data',
      path: '/admin/compute/user-data'
    },
    {
      name: 'CNI Config',
      path: '/admin/compute/cni-config'
    },
    {
      name: 'Affinity Groups',
      path: '/admin/compute/affinity-groups'
    }]

  },
  {
    name: 'Storage',
    icon: HardDrive,
    id: 'storage',
    children: [
    {
      name: 'Volumes',
      path: '/admin/storage/volumes'
    },
    {
      name: 'Volume Snapshots',
      path: '/admin/storage/volume-snapshots'
    },
    {
      name: 'Snapshot Policies',
      path: '/admin/storage/snapshot-policies'
    },
    {
      name: 'Backups',
      path: '/admin/storage/backups'
    },
    {
      name: 'Backup Schedules',
      path: '/admin/storage/backup-schedules'
    },
    {
      name: 'Buckets',
      path: '/admin/storage/buckets'
    },
    {
      name: 'Shared FileSystems',
      path: '/admin/storage/shared-filesystems'
    }]

  },
  {
    name: 'Network',
    icon: Network,
    id: 'network',
    children: [
    {
      name: 'Guest Networks',
      path: '/admin/network/guest-networks'
    },
    {
      name: 'VPC',
      path: '/admin/network/vpc'
    },
    {
      name: 'VNF Appliances',
      path: '/admin/network/vnf-appliances'
    },
    {
      name: 'Public IPs',
      path: '/admin/network/public-ips'
    },
    {
      name: 'AS Numbers',
      path: '/admin/network/as-numbers'
    },
    {
      name: 'Site-to-Site VPN',
      path: '/admin/network/site-to-site-vpn'
    },
    {
      name: 'VPN Connections',
      path: '/admin/network/vpn-connections'
    },
    {
      name: 'Network ACLs',
      path: '/admin/network/network-acls'
    },
    {
      name: 'VPN Users',
      path: '/admin/network/vpn-users'
    },
    {
      name: 'Customer Gateway',
      path: '/admin/network/vpn-customer-gateway'
    },
    {
      name: 'Guest VLAN',
      path: '/admin/network/guest-vlan'
    },
    {
      name: 'IPv4 Subnets',
      path: '/admin/network/ipv4-subnets'
    }]

  },
  {
    name: 'Images',
    icon: ImageIcon,
    id: 'images',
    children: [
    {
      name: 'Templates',
      path: '/admin/images/templates'
    },
    {
      name: 'ISOs',
      path: '/admin/images/isos'
    },
    {
      name: 'Kubernetes ISOs',
      path: '/admin/images/kubernetes-isos'
    }]

  },
  {
    name: 'Events',
    icon: Activity,
    path: '/admin/events'
  },
  {
    name: 'Projects',
    icon: FolderKanban,
    path: '/admin/projects'
  },
  {
    name: 'Roles',
    icon: Shield,
    path: '/admin/roles'
  },
  {
    name: 'Accounts',
    icon: Users,
    path: '/admin/accounts'
  },
  {
    name: 'Domains',
    icon: Building2,
    path: '/admin/domains'
  },
  {
    name: 'Infrastructure',
    icon: Globe,
    id: 'infrastructure',
    children: [
    {
      name: 'Summary',
      path: '/admin/infrastructure/summary'
    },
    {
      name: 'Pods',
      path: '/admin/infrastructure/pods'
    },
    {
      name: 'Clusters',
      path: '/admin/infrastructure/clusters'
    },
    {
      name: 'Hosts',
      path: '/admin/infrastructure/hosts'
    },
    {
      name: 'Primary Storage',
      path: '/admin/infrastructure/primary-storage'
    },
    {
      name: 'Secondary Storage',
      path: '/admin/infrastructure/secondary-storage'
    },
    {
      name: 'Backup Repository',
      path: '/admin/infrastructure/backup-repository'
    },
    {
      name: 'Object Storage',
      path: '/admin/infrastructure/object-storage'
    },
    {
      name: 'System VMs',
      path: '/admin/infrastructure/system-vms'
    },
    {
      name: 'Virtual Routers',
      path: '/admin/infrastructure/virtual-routers'
    },
    {
      name: 'Internal LB',
      path: '/admin/infrastructure/internal-lb'
    },
    {
      name: 'Management Servers',
      path: '/admin/infrastructure/management-servers'
    },
    {
      name: 'CPU Sockets',
      path: '/admin/infrastructure/cpu-sockets'
    },
    {
      name: 'DB/Usage Server',
      path: '/admin/infrastructure/db-usage-server'
    },
    {
      name: 'Alerts',
      path: '/admin/infrastructure/alerts'
    }]

  },
  {
    name: 'Service Offerings',
    icon: Layers,
    id: 'offerings',
    children: [
    {
      name: 'Compute',
      path: '/admin/service-offerings/compute'
    },
    {
      name: 'System',
      path: '/admin/service-offerings/system'
    },
    {
      name: 'Disk',
      path: '/admin/service-offerings/disk'
    },
    {
      name: 'Backup',
      path: '/admin/service-offerings/backup'
    },
    {
      name: 'Network',
      path: '/admin/service-offerings/network'
    },
    {
      name: 'VPC',
      path: '/admin/service-offerings/vpc'
    }]

  },
  {
    name: 'Configuration',
    icon: Settings,
    id: 'configuration',
    children: [
    {
      name: 'Global Settings',
      path: '/admin/configuration/global-settings'
    },
    {
      name: 'LDAP',
      path: '/admin/configuration/ldap'
    },
    {
      name: 'OAuth',
      path: '/admin/configuration/oauth'
    },
    {
      name: 'Hypervisor Caps',
      path: '/admin/configuration/hypervisor-capabilities'
    },
    {
      name: 'Guest OS Categories',
      path: '/admin/configuration/guest-os-categories'
    },
    {
      name: 'Guest OS',
      path: '/admin/configuration/guest-os'
    },
    {
      name: 'Guest OS Mappings',
      path: '/admin/configuration/guest-os-mappings'
    },
    {
      name: 'GPU Card Types',
      path: '/admin/configuration/gpu-card-types'
    }]

  },
  {
    name: 'Extensions',
    icon: Puzzle,
    path: '/admin/extensions'
  },
  {
    name: 'Tools',
    icon: Wrench,
    id: 'tools',
    children: [
    {
      name: 'Comments',
      path: '/admin/tools/comments'
    },
    {
      name: 'Usage',
      path: '/admin/tools/usage'
    },
    {
      name: 'Import-Export',
      path: '/admin/tools/import-export'
    },
    {
      name: 'Import Volumes',
      path: '/admin/tools/import-volumes'
    },
    {
      name: 'Webhooks',
      path: '/admin/tools/webhooks'
    }]

  },
  {
    name: 'UI Management',
    icon: MonitorPlay,
    path: '/admin/ui-management'
  },
  {
    name: 'Billing',
    icon: CreditCard,
    id: 'billing',
    children: [
    {
      name: 'Overview',
      path: '/admin/billing-management'
    },
    {
      name: 'Invoices',
      path: '/admin/billing-management/invoices'
    },
    {
      name: 'Payments',
      path: '/admin/billing-management/payments'
    },
    {
      name: 'Credits',
      path: '/admin/billing-management/credits'
    },
    {
      name: 'Reports',
      path: '/admin/billing-management/reports'
    }]

  },
  {
    name: 'Pricing',
    icon: DollarSign,
    id: 'pricing',
    children: [
    {
      name: 'Overview',
      path: '/admin/pricing-management'
    },
    {
      name: 'Plans',
      path: '/admin/pricing-management/plans'
    },
    {
      name: 'Custom Pricing',
      path: '/admin/pricing-management/custom-pricing'
    }]

  },
  {
    name: 'Sync CloudStack',
    icon: RefreshCw,
    path: '/admin/sync-cloudstack'
  },
  {
    name: 'Marketplace',
    icon: ShoppingBag,
    path: '/admin/marketplace'
  }];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full sm:translate-x-0 sm:w-16'}`}>
      
      <div className="flex h-14 items-center border-b border-sidebar-border px-4 py-3 gap-2">
        <Cloud className="h-6 w-6 text-primary shrink-0" />
        {isOpen &&
        <span className="text-lg font-bold tracking-tight truncate">
            CloudStack CMP
          </span>
        }
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-0.5 px-2">
          {navItems.map((item, index) =>
          <div key={index}>
              {item.children && item.id ?
            <Collapsible
              open={isOpen ? openSections[item.id] : false}
              onOpenChange={() => toggleSection(item.id!)}>
              
                  <CollapsibleTrigger asChild>
                    <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                      <div className="flex items-center">
                        <item.icon className="h-4 w-4 mr-3 shrink-0" />
                        {isOpen &&
                    <span className="truncate">{item.name}</span>
                    }
                      </div>
                      {isOpen && (
                  openSections[item.id!] ?
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> :

                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />)
                  }
                    </button>
                  </CollapsibleTrigger>
                  {isOpen &&
              <CollapsibleContent className="space-y-0.5 pl-5 pr-1 py-0.5">
                      {item.children.map((child, i) =>
                <NavLink
                  key={i}
                  to={child.path}
                  className={({ isActive }) =>
                  `block rounded-md px-3 py-1.5 text-[13px] transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`
                  }>
                  
                          {child.name}
                        </NavLink>
                )}
                    </CollapsibleContent>
              }
                </Collapsible> :

            <NavLink
              to={item.path!}
              className={({ isActive }) =>
              `flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`
              }>
              
                  <item.icon
                className={`h-4 w-4 shrink-0 ${isOpen ? 'mr-3' : 'mx-auto'}`} />
              
                  {isOpen && <span className="truncate">{item.name}</span>}
                </NavLink>
            }
            </div>
          )}
        </nav>
      </ScrollArea>

      {/* Version footer */}
      {isOpen &&
      <div className="border-t border-sidebar-border px-4 py-3">
          <p className="text-xs text-muted-foreground">CloudStack CMP v1.0</p>
          <p className="text-xs text-muted-foreground">
            Apache CloudStack 4.22
          </p>
        </div>
      }
    </aside>);

}