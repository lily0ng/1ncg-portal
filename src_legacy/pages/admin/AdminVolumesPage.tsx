import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable, Column } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { mockVolumes } from '../../lib/mockData';
import { Volume } from '../../types/cloudstack';
export function AdminVolumesPage() {
  const navigate = useNavigate();
  const columns: Column<Volume>[] = [
  {
    header: 'Name',
    accessorKey: 'name',
    cell: (vol) =>
    <span className="font-medium text-primary">{vol.name}</span>

  },
  {
    header: 'State',
    accessorKey: 'state',
    cell: (vol) => <StatusBadge status={vol.state} />
  },
  {
    header: 'Type',
    accessorKey: 'type',
    cell: (vol) =>
    <span
      className={`text-xs font-medium px-2 py-1 rounded ${vol.type === 'ROOT' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
      
          {vol.type}
        </span>

  },
  {
    header: 'Size (GB)',
    accessorKey: 'size'
  },
  {
    header: 'VM',
    accessorKey: 'vmname',
    cell: (vol) =>
    vol.vmname || <span className="text-muted-foreground">—</span>
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
    cell: (vol) => new Date(vol.created).toLocaleDateString()
  }];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volumes"
        description="Manage storage volumes across all accounts."
        breadcrumbs={[
        {
          label: 'Admin',
          href: '/admin/dashboard'
        },
        {
          label: 'Storage'
        },
        {
          label: 'Volumes'
        }]
        }>
        
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Volume
        </Button>
      </PageHeader>

      <DataTable
        data={mockVolumes}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search volumes..." />
      
    </div>);

}