import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Square, RotateCcw, Trash2, Terminal } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable, Column } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { DropdownMenuItem } from '../../components/ui/DropdownMenu';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { mockVMs } from '../../lib/mockData';
import { VM } from '../../types/cloudstack';
import { toast } from 'sonner';
export function UserInstancesPage() {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVm, setSelectedVm] = useState<VM | null>(null);
  // Filter for user1
  const userVMs = mockVMs.filter((vm) => vm.account === 'user1');
  const handleAction = (action: string, vm: VM) => {
    switch (action) {
      case 'start':
        toast.success(`Starting instance ${vm.name}`);
        break;
      case 'stop':
        toast.success(`Stopping instance ${vm.name}`);
        break;
      case 'reboot':
        toast.success(`Rebooting instance ${vm.name}`);
        break;
      case 'console':
        toast.info(`Opening console for ${vm.name}`);
        break;
      case 'delete':
        setSelectedVm(vm);
        setDeleteDialogOpen(true);
        break;
    }
  };
  const confirmDelete = () => {
    if (selectedVm) {
      toast.success(`Instance ${selectedVm.name} deleted successfully`);
      setDeleteDialogOpen(false);
    }
  };
  const columns: Column<VM>[] = [
  {
    header: 'Name',
    accessorKey: 'name',
    cell: (vm) =>
    <div
      className="font-medium text-blue-500 hover:underline cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/portal/instances/${vm.id}`);
      }}>
      
          {vm.name}
        </div>

  },
  {
    header: 'State',
    accessorKey: 'state',
    cell: (vm) => <StatusBadge status={vm.state} />
  },
  {
    header: 'IP Address',
    accessorKey: 'ipaddress'
  },
  {
    header: 'Zone',
    accessorKey: 'zonename'
  },
  {
    header: 'Compute',
    accessorKey: 'cpunumber',
    cell: (vm) => `${vm.cpunumber} vCPU / ${vm.memory / 1024} GB`
  },
  {
    header: 'Created',
    accessorKey: 'created',
    cell: (vm) => new Date(vm.created).toLocaleDateString()
  }];

  const actions = (vm: VM) =>
  <>
      <DropdownMenuItem
      onClick={() => handleAction('start', vm)}
      disabled={vm.state === 'Running'}>
      
        <Play className="mr-2 h-4 w-4" /> Start
      </DropdownMenuItem>
      <DropdownMenuItem
      onClick={() => handleAction('stop', vm)}
      disabled={vm.state !== 'Running'}>
      
        <Square className="mr-2 h-4 w-4" /> Stop
      </DropdownMenuItem>
      <DropdownMenuItem
      onClick={() => handleAction('reboot', vm)}
      disabled={vm.state !== 'Running'}>
      
        <RotateCcw className="mr-2 h-4 w-4" /> Reboot
      </DropdownMenuItem>
      <DropdownMenuItem
      onClick={() => handleAction('console', vm)}
      disabled={vm.state !== 'Running'}>
      
        <Terminal className="mr-2 h-4 w-4" /> Console
      </DropdownMenuItem>
      <DropdownMenuItem
      onClick={() => handleAction('delete', vm)}
      className="text-red-500 focus:text-red-500">
      
        <Trash2 className="mr-2 h-4 w-4" /> Destroy
      </DropdownMenuItem>
    </>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Instances"
        description="Manage your virtual machines.">
        
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Deploy Instance
        </Button>
      </PageHeader>

      <DataTable
        data={userVMs}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search instances..."
        onRowClick={(vm) => navigate(`/portal/instances/${vm.id}`)}
        actions={actions} />
      

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Destroy Instance"
        description={`Are you sure you want to destroy ${selectedVm?.name}? This action cannot be undone and all data will be lost.`}
        confirmLabel="Destroy"
        variant="danger"
        onConfirm={confirmDelete} />
      
    </div>);

}