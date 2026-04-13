import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { DataTable, Column } from '../../components/shared/DataTable';
import { DropdownMenuItem } from '../../components/ui/DropdownMenu';
import { Paperclip, Scissors, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { mockVolumes } from '../../lib/mockData';
import { Volume } from '../../types/cloudstack';

export function ResellerVolumesPage() {
  const columns: Column<Volume>[] = [
    { header: 'Name', accessorKey: 'name', cell: (v) => <span className="font-medium">{v.name}</span> },
    { header: 'State', accessorKey: 'state', cell: (v) => <StatusBadge status={v.state} /> },
    { header: 'Type', accessorKey: 'type' },
    { header: 'Size', accessorKey: 'size', cell: (v) => `${v.size} GB` },
    { header: 'VM Attached', accessorKey: 'vmname', cell: (v) => v.vmname ?? <span className="text-muted-foreground">—</span> },
    { header: 'Account', accessorKey: 'account' },
    { header: 'Zone', accessorKey: 'zonename' },
    { header: 'Created', accessorKey: 'created', cell: (v) => new Date(v.created).toLocaleDateString() },
  ];

  const actions = (vol: Volume) => (
    <>
      <DropdownMenuItem
        onClick={() => toast.success(`Attach request sent for ${vol.name}`)}
        disabled={!!vol.vmname}
      >
        <Paperclip className="mr-2 h-4 w-4" /> Attach
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => toast.success(`Detach request sent for ${vol.name}`)}
        disabled={!vol.vmname}
      >
        <Scissors className="mr-2 h-4 w-4" /> Detach
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => toast.info(`Opening snapshots for ${vol.name}`)}>
        <Camera className="mr-2 h-4 w-4" /> View Snapshots
      </DropdownMenuItem>
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Volumes" description="View and manage all customer storage volumes." />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DataTable
          data={mockVolumes}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search volumes…"
          actions={actions}
        />
      </motion.div>
    </div>
  );
}
