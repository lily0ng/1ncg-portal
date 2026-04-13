import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable, Column } from '../../components/shared/DataTable';
import { Button } from '../../components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { DropdownMenuItem } from '../../components/ui/DropdownMenu';
import { Badge } from '../../components/ui/Badge';
import { Rocket, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { mockTemplates, mockZones } from '../../lib/mockData';
import { Template } from '../../types/cloudstack';

export function UserTemplatesPage() {
  const navigate = useNavigate();
  const [zoneFilter, setZoneFilter] = useState('All');

  const filtered = useMemo(() => {
    return mockTemplates;
  }, [zoneFilter]);

  const columns: Column<Template>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (t) => <span className="font-medium">{t.name}</span>,
    },
    {
      header: 'OS',
      accessorKey: 'ostypename',
    },
    {
      header: 'Zone',
      accessorKey: 'ostypename',
      cell: () => zoneFilter === 'All' ? 'us-east-1' : zoneFilter,
    },
    {
      header: 'Size',
      accessorKey: 'id',
      cell: () => '10 GB',
    },
    {
      header: 'Public',
      accessorKey: 'isready',
      cell: () => (
        <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">Yes</Badge>
      ),
    },
    {
      header: 'Featured',
      accessorKey: 'isready',
      cell: (t) => t.isready ? (
        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Featured</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'created',
      cell: (t) => new Date(t.created).toLocaleDateString(),
    },
  ];

  const actions = (t: Template) => (
    <>
      <DropdownMenuItem onClick={() => navigate(`/portal/instances?template=${t.id}`)}>
        <Rocket className="mr-2 h-4 w-4" /> Deploy VM
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => toast.info(`Template: ${t.displaytext}`)}>
        <Eye className="mr-2 h-4 w-4" /> View Details
      </DropdownMenuItem>
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Templates" description="Browse available OS templates for VM deployment." />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap gap-3"
      >
        <Select value={zoneFilter} onValueChange={setZoneFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Zone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Zones</SelectItem>
            {mockZones.map((z) => <SelectItem key={z.id} value={z.name}>{z.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <DataTable
          data={filtered}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search templates…"
          actions={actions}
        />
      </motion.div>
    </div>
  );
}
