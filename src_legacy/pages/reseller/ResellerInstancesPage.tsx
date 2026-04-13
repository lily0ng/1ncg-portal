import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { DataTable, Column } from '../../components/shared/DataTable';
import { Button } from '../../components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { DropdownMenuItem } from '../../components/ui/DropdownMenu';
import { Play, Square, RotateCcw, Terminal, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { mockVMs, mockZones } from '../../lib/mockData';
import { VM } from '../../types/cloudstack';

const accounts = ['All', 'admin', 'user1', 'user2'];

export function ResellerInstancesPage() {
  const navigate = useNavigate();
  const [accountFilter, setAccountFilter] = useState('All');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    return mockVMs.filter((vm) => {
      return (
        (accountFilter === 'All' || vm.account === accountFilter) &&
        (zoneFilter === 'All' || vm.zonename === zoneFilter) &&
        (statusFilter === 'All' || vm.state === statusFilter)
      );
    });
  }, [accountFilter, zoneFilter, statusFilter]);

  const handleAction = async (action: string, vm: VM) => {
    const labels: Record<string, string> = {
      start: 'Starting',
      stop: 'Stopping',
      reboot: 'Rebooting',
    };
    if (action === 'console') {
      window.open(`/console/${vm.id}`, '_blank');
      return;
    }
    try {
      await new Promise((r) => setTimeout(r, 600));
      toast.success(`${labels[action] ?? action} ${vm.name} — request sent`);
    } catch {
      toast.error(`Failed to ${action} ${vm.name}`);
    }
  };

  const columns: Column<VM>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (vm) => (
        <span
          className="font-medium text-blue-500 hover:underline cursor-pointer"
          onClick={(e) => { e.stopPropagation(); navigate(`/admin/compute/instances/${vm.id}`); }}
        >
          {vm.name}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'state',
      cell: (vm) => <StatusBadge status={vm.state} />,
    },
    {
      header: 'Customer Account',
      accessorKey: 'account',
    },
    {
      header: 'IP Address',
      accessorKey: 'ipaddress',
    },
    {
      header: 'vCPUs',
      accessorKey: 'cpunumber',
    },
    {
      header: 'RAM',
      accessorKey: 'memory',
      cell: (vm) => `${vm.memory / 1024} GB`,
    },
    {
      header: 'Zone',
      accessorKey: 'zonename',
    },
    {
      header: 'Created',
      accessorKey: 'created',
      cell: (vm) => new Date(vm.created).toLocaleDateString(),
    },
  ];

  const actions = (vm: VM) => (
    <>
      <DropdownMenuItem onClick={() => handleAction('start', vm)} disabled={vm.state === 'Running'}>
        <Play className="mr-2 h-4 w-4" /> Start
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleAction('stop', vm)} disabled={vm.state !== 'Running'}>
        <Square className="mr-2 h-4 w-4" /> Stop
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleAction('reboot', vm)} disabled={vm.state !== 'Running'}>
        <RotateCcw className="mr-2 h-4 w-4" /> Reboot
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleAction('console', vm)} disabled={vm.state !== 'Running'}>
        <Terminal className="mr-2 h-4 w-4" /> Console
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => navigate(`/admin/compute/instances/${vm.id}`)}>
        <Eye className="mr-2 h-4 w-4" /> View Details
      </DropdownMenuItem>
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Instances" description="View and manage all customer virtual machines.">
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 800); toast.success('Refreshed'); }}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </PageHeader>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap gap-3"
      >
        <Select value={accountFilter} onValueChange={setAccountFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={zoneFilter} onValueChange={setZoneFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Zone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Zones</SelectItem>
            {mockZones.map((z) => <SelectItem key={z.id} value={z.name}>{z.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {['All', 'Running', 'Stopped', 'Error', 'Starting', 'Stopping'].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
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
          searchPlaceholder="Search instances…"
          actions={actions}
          onRowClick={(vm) => navigate(`/admin/compute/instances/${vm.id}`)}
        />
      </motion.div>
    </div>
  );
}
