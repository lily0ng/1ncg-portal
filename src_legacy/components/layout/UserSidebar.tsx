import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ShoppingBag,
  Server,
  HardDrive,
  Network,
  CreditCard,
  LifeBuoy,
  BookOpen,
  Cloud,
  Camera,
  Archive,
  Image as ImageIcon,
  Users,
  AppWindow,
  Scaling,
  LoaderPinwheel,
  Shield,
  BoxIcon } from
'lucide-react';
import { ScrollArea } from '../ui/ScrollArea';
import { Badge } from '../ui/Badge';
interface UserSidebarProps {
  isOpen: boolean;
}
export function UserSidebar({ isOpen }: UserSidebarProps) {
  const mainItems = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    path: '/portal/dashboard'
  },
  {
    name: 'Projects',
    icon: FolderKanban,
    path: '/portal/projects'
  },
  {
    name: 'Store',
    icon: ShoppingBag,
    path: '/portal/store'
  }];

  const vmItems = [
  {
    name: 'Instances',
    icon: Server,
    path: '/portal/instances'
  },
  {
    name: 'VNF Appliances',
    icon: Shield,
    path: '/portal/vnf-appliances'
  },
  {
    name: 'Snapshots',
    icon: Camera,
    path: '/portal/snapshots'
  },
  {
    name: 'Backups',
    icon: Archive,
    path: '/portal/backups'
  },
  {
    name: 'Templates',
    icon: ImageIcon,
    path: '/portal/templates'
  },
  {
    name: 'Affinity Groups',
    icon: Users,
    path: '/portal/affinity-groups'
  },
  {
    name: 'Kubernetes',
    icon: BoxIcon,
    path: '/portal/kubernetes'
  },
  {
    name: 'Apps',
    icon: AppWindow,
    path: '/portal/apps'
  },
  {
    name: 'Auto-scaling',
    icon: Scaling,
    path: '/portal/auto-scaling'
  },
  {
    name: 'Volumes',
    icon: HardDrive,
    path: '/portal/volumes'
  }];

  const networkItems = [
  {
    name: 'Networks',
    icon: Network,
    path: '/portal/networks'
  },
  {
    name: 'Load Balancers',
    icon: LoaderPinwheel,
    path: '/portal/load-balancers'
  }];

  const footerItems = [
  {
    name: 'Billing',
    icon: CreditCard,
    path: '/portal/billing',
    badge: 'MMK'
  },
  {
    name: 'Support',
    icon: LifeBuoy,
    path: '/portal/support'
  },
  {
    name: 'Docs',
    icon: BookOpen,
    path: '/portal/docs'
  }];

  const renderNavLink = (item: {
    name: string;
    icon: React.ElementType;
    path: string;
    badge?: string;
  }) =>
  <NavLink
    key={item.path}
    to={item.path}
    className={({ isActive }) =>
    `flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`
    }>
    
      <item.icon
      className={`h-4 w-4 shrink-0 ${isOpen ? 'mr-3' : 'mx-auto'}`} />
    
      {isOpen && <span className="flex-1 truncate">{item.name}</span>}
      {isOpen && item.badge &&
    <Badge
      variant="secondary"
      className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-primary/20 text-primary border-0">
      
          {item.badge}
        </Badge>
    }
    </NavLink>;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full sm:translate-x-0 sm:w-16'}`}>
      
      <div className="flex h-14 items-center border-b border-sidebar-border px-4 py-3 gap-2">
        <Cloud className="h-6 w-6 text-primary shrink-0" />
        {isOpen &&
        <span className="text-lg font-bold tracking-tight truncate">
            Cloud Portal
          </span>
        }
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-1 px-2">
          {/* Main items */}
          {mainItems.map(renderNavLink)}

          {/* VM Section */}
          {isOpen &&
          <div className="pt-4 pb-1 px-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Virtual Machines
              </p>
            </div>
          }
          {vmItems.map(renderNavLink)}

          {/* Network Section */}
          {isOpen &&
          <div className="pt-4 pb-1 px-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Networking
              </p>
            </div>
          }
          {networkItems.map(renderNavLink)}

          {/* Footer items */}
          <div className="pt-4 border-t border-sidebar-border mt-4">
            {footerItems.map(renderNavLink)}
          </div>
        </nav>
      </ScrollArea>

      {/* User info footer */}
      {isOpen &&
      <div className="border-t border-sidebar-border px-4 py-3">
          <p className="text-xs text-muted-foreground">Cloud Portal v1.0</p>
        </div>
      }
    </aside>);

}