import React from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable, Column } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { mockNetworks } from '../../lib/mockData';
import { Network } from '../../types/cloudstack';
export function AdminNetworksPage() {
  const columns: Column<Network>[] = [
  {
    header: 'Name',
    accessorKey: 'name',
    cell: (net) =>
    <span className="font-medium text-primary">{net.name}</span>

  },
  {
    header: 'State',
    accessorKey: 'state',
    cell: (net) => <StatusBadge status={net.state} />
  },
  {
    header: 'Type',
    accessorKey: 'type',
    cell: (net) =>
    <span className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground">
          {net.type}
        </span>

  },
  {
    header: 'CIDR',
    accessorKey: 'cidr',
    cell: (net) =>
    net.cidr || <span className="text-muted-foreground">—</span>
  },
  {
    header: 'Zone',
    accessorKey: 'zonename'
  },
  {
    header: 'Account',
    accessorKey: 'account'
  },
  {
    header: 'Created',
    accessorKey: 'created',
    cell: (net) => new Date(net.created).toLocaleDateString()
  }];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guest Networks"
        description="Manage guest networks across all zones."
        breadcrumbs={[
        {
          label: 'Admin',
          href: '/admin/dashboard'
        },
        {
          label: 'Network'
        },
        {
          label: 'Guest Networks'
        }]
        }>
        
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Network
        </Button>
      </PageHeader>

      <DataTable
        data={mockNetworks}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search networks..." />
      
    </div>);

}