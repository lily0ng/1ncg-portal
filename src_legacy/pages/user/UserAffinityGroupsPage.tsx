import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { DropdownMenuItem } from '../../components/ui/DropdownMenu';
import { DataTable, Column } from '../../components/shared/DataTable';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AffinityGroup {
  id: string;
  name: string;
  type: string;
  description: string;
  vms: number;
  created: string;
}

const initialGroups: AffinityGroup[] = [
  { id: 'ag-1', name: 'web-anti-affinity', type: 'host anti-affinity', description: 'Keep web servers on different hosts', vms: 3, created: '2024-01-15T10:00:00Z' },
  { id: 'ag-2', name: 'db-affinity', type: 'host affinity', description: 'Keep database servers on the same host', vms: 2, created: '2024-02-01T09:00:00Z' },
];

const AFFINITY_TYPES = ['host affinity', 'host anti-affinity'];

export function UserAffinityGroupsPage() {
  const [groups, setGroups] = useState<AffinityGroup[]>(initialGroups);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !type) { toast.error('Name and type are required'); return; }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const newGroup: AffinityGroup = {
        id: `ag-${Date.now()}`,
        name,
        type,
        description,
        vms: 0,
        created: new Date().toISOString(),
      };
      setGroups((prev) => [newGroup, ...prev]);
      toast.success(`Affinity group "${name}" created`);
      setOpen(false);
      setName('');
      setType('');
      setDescription('');
    } catch {
      toast.error('Failed to create affinity group');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (group: AffinityGroup) => {
    try {
      await new Promise((r) => setTimeout(r, 600));
      setGroups((prev) => prev.filter((g) => g.id !== group.id));
      toast.success(`Affinity group "${group.name}" deleted`);
    } catch {
      toast.error('Failed to delete affinity group');
    }
  };

  const columns: Column<AffinityGroup>[] = [
    { header: 'Name', accessorKey: 'name', cell: (g) => <span className="font-medium">{g.name}</span> },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (g) => (
        <span className={`text-xs px-2 py-0.5 rounded-full ${g.type.includes('anti') ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
          {g.type}
        </span>
      ),
    },
    { header: 'Description', accessorKey: 'description', cell: (g) => <span className="text-muted-foreground text-sm">{g.description || '—'}</span> },
    { header: 'VMs', accessorKey: 'vms' },
    { header: 'Created', accessorKey: 'created', cell: (g) => new Date(g.created).toLocaleDateString() },
  ];

  const actions = (g: AffinityGroup) => (
    <DropdownMenuItem
      onClick={() => handleDelete(g)}
      className="text-red-500 focus:text-red-500"
    >
      <Trash2 className="mr-2 h-4 w-4" /> Delete
    </DropdownMenuItem>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Affinity Groups" description="Control VM placement across hosts.">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Group
        </Button>
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DataTable
          data={groups}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search affinity groups…"
          actions={actions}
        />
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Affinity Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input placeholder="e.g., web-anti-affinity" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type…" />
                </SelectTrigger>
                <SelectContent>
                  {AFFINITY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input placeholder="Optional description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreate} disabled={loading}>
                {loading ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
