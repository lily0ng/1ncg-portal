import React from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { DataTable, Column } from '../../components/shared/DataTable';
import { mockNetworks } from '../../lib/mockData';
import { Network } from '../../types/cloudstack';

export function ResellerNetworksPage() {
  const columns: Column<Network>[] = [
    { header: 'Name', accessorKey: 'name', cell: (n) => <span className="font-medium">{n.name}</span> },
    { header: 'State', accessorKey: 'state', cell: (n) => <StatusBadge status={n.state} /> },
    { header: 'Type', accessorKey: 'type' },
    { header: 'CIDR', accessorKey: 'cidr', cell: (n) => <span className="font-mono text-sm">{n.cidr || '—'}</span> },
    { header: 'Zone', accessorKey: 'zonename' },
    { header: 'Account', accessorKey: 'account' },
    {
      header: 'Created',
      accessorKey: 'created',
      cell: (n) => new Date(n.created).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Networks" description="View all guest networks across customer accounts." />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DataTable
          data={mockNetworks}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search networks…"
        />
      </motion.div>
    </div>
  );
}
