import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/Table';
import { Plus, RotateCcw, Trash2, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { mockVMs } from '../../lib/mockData';

interface Backup {
  id: string;
  vm: string;
  vmid: string;
  state: string;
  size: number;
  zone: string;
  created: string;
}

const initialBackups: Backup[] = [
  { id: 'bkp-1', vm: 'test-env-1', vmid: 'vm-3', state: 'BackedUp', size: 22, zone: 'eu-west-1', created: '2024-03-10T02:00:00Z' },
  { id: 'bkp-2', vm: 'dev-box-john', vmid: 'vm-8', state: 'BackedUp', size: 22, zone: 'eu-west-1', created: '2024-03-15T02:00:00Z' },
  { id: 'bkp-3', vm: 'dev-box-jane', vmid: 'vm-9', state: 'BackingUp', size: 22, zone: 'eu-west-1', created: '2024-03-20T02:00:00Z' },
];

const userVMs = mockVMs.filter((v) => v.account === 'user1');

export function UserBackupsPage() {
  const [backups, setBackups] = useState<Backup[]>(initialBackups);
  const [createOpen, setCreateOpen] = useState(false);
  const [vmSelect, setVmSelect] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!vmSelect) { toast.error('Please select a VM'); return; }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      const vm = userVMs.find((v) => v.id === vmSelect);
      const newBackup: Backup = {
        id: `bkp-${Date.now()}`,
        vm: vm?.name ?? vmSelect,
        vmid: vmSelect,
        state: 'BackingUp',
        size: 22,
        zone: vm?.zonename ?? 'unknown',
        created: new Date().toISOString(),
      };
      setBackups((prev) => [newBackup, ...prev]);
      toast.success(`Backup started for ${vm?.name}`);
      setCreateOpen(false);
      setVmSelect('');
    } catch {
      toast.error('Failed to start backup');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (bkp: Backup) => {
    try {
      await new Promise((r) => setTimeout(r, 800));
      toast.success(`Restore initiated for ${bkp.vm}`);
    } catch {
      toast.error('Restore failed');
    }
  };

  const handleDelete = async (bkp: Backup) => {
    try {
      await new Promise((r) => setTimeout(r, 600));
      setBackups((prev) => prev.filter((b) => b.id !== bkp.id));
      toast.success(`Backup deleted`);
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Backups" description="Manage VM backups for disaster recovery.">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Backup
        </Button>
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-md border bg-card"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>VM</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No backups found. Create your first backup.
                </TableCell>
              </TableRow>
            ) : (
              backups.map((bkp, i) => (
                <motion.tr
                  key={bkp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4 text-muted-foreground" />
                      {bkp.vm}
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={bkp.state} /></TableCell>
                  <TableCell>{bkp.size} GB</TableCell>
                  <TableCell>{bkp.zone}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(bkp.created).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleRestore(bkp)}>
                        <RotateCcw className="mr-1 h-3 w-3" /> Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-red-500 hover:text-red-400"
                        onClick={() => handleDelete(bkp)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Backup</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Virtual Machine</label>
              <Select value={vmSelect} onValueChange={setVmSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select VM…" />
                </SelectTrigger>
                <SelectContent>
                  {userVMs.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name} ({v.state})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              A full backup of the VM will be created. This may take a few minutes.
            </p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreate} disabled={loading}>
                {loading ? 'Starting…' : 'Create Backup'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
