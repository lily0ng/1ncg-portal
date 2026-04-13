import React from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable, Column } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { mockVPCs } from '../../lib/mockData';
import { VPC } from '../../types/cloudstack';
export function AdminVPCPage() {
  const columns: Column<VPC>[] = [
  {
    header: 'Name',
    accessorKey: 'name',
    cell: (vpc) =>
    <span className="font-medium text-primary">{vpc.name}</span>

  },
  {
    header: 'State',
    accessorKey: 'state',
    cell: (vpc) => <StatusBadge status={vpc.state} />
  },
  {
    header: 'CIDR',
    accessorKey: 'cidr'
  },
  {
    header: 'Zone',
    accessorKey: 'zonename'
  },
  {
    header: 'Networks',
    accessorKey: 'networkcount',
    cell: (vpc) =>
    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
          {vpc.networkcount}
        </span>

  },
  {
    header: 'Created',
    accessorKey: 'created',
    cell: (vpc) => new Date(vpc.created).toLocaleDateString()
  }];

  return (
    <div className="space-y-6">
      <PageHeader
        title="VPC"
        description="Manage Virtual Private Clouds."
        breadcrumbs={[
        {
          label: 'Admin',
          href: '/admin/dashboard'
        },
        {
          label: 'Network'
        },
        {
          label: 'VPC'
        }]
        }>
        
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create VPC
        </Button>
      </PageHeader>

      <DataTable
        data={mockVPCs}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search VPCs..." />
      
    </div>);

}