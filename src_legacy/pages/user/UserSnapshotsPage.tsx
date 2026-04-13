import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/Table';
import { Switch } from '../../components/ui/Switch';
import { Plus, Camera, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { mockVMs } from '../../lib/mockData';

interface Snapshot {
  id: string;
  name: string;
  vm: string;
  vmid: string;
  state: string;
  type: string;
  memorySnapshot: boolean;
  created: string;
}

const initialSnapshots: Snapshot[] = [
  { id: 'snap-1', name: 'before-upgrade', vm: 'test-env-1', vmid: 'vm-3', state: 'BackedUp', type: 'MANUAL', memorySnapshot: false, created: '2024-03-10T08:00:00Z' },
  { id: 'snap-2', name: 'daily-2024-03-15', vm: 'dev-box-john', vmid: 'vm-8', state: 'BackedUp', type: 'AUTO', memorySnapshot: false, created: '2024-03-15T00:00:00Z' },
  { id: 'snap-3', name: 'with-memory-state', vm: 'dev-box-jane', vmid: 'vm-9', state: 'BackedUp', type: 'MANUAL', memorySnapshot: true, created: '2024-03-20T14:30:00Z' },
];

const userVMs = mockVMs.filter((v) => v.account === 'user1');

export function UserSnapshotsPage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>(initialSnapshots);
  const [createOpen, setCreateOpen] = useState(false);
  const [vmSelect, setVmSelect] = useState('');
  const [snapName, setSnapName] = useState('');
  const [memorySnap, setMemorySnap] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!vmSelect || !snapName) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      const vm = userVMs.find((v) => v.id === vmSelect);
      const newSnap: Snapshot = {
        id: `snap-${Date.now()}`,
        name: snapName,
        vm: vm?.name ?? vmSelect,
        vmid: vmSelect,
        state: 'BackedUp',
        type: 'MANUAL',
        memorySnapshot: memorySnap,
        created: new Date().toISOString(),
      };
      setSnapshots((prev) => [newSnap, ...prev]);
      toast.success(`Snapshot "${snapName}" created successfully`);
      setCreateOpen(false);
      setVmSelect('');
      setSnapName('');
      setMemorySnap(false);
    } catch {
      toast.error('Failed to create snapshot');
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (snap: Snapshot) => {
    try {
      await new Promise((r) => setTimeout(r, 800));
      toast.success(`Reverting VM to snapshot "${snap.name}"`);
    } catch {
      toast.error('Revert failed');
    }
  };

  const handleDelete = async (snap: Snapshot) => {
    try {
      await new Promise((r) => setTimeout(r, 600));
      setSnapshots((prev) => prev.filter((s) => s.id !== snap.id));
      toast.success(`Snapshot "${snap.name}" deleted`);
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="VM Snapshots" description="Create and manage VM snapshots.">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Snapshot
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
              <TableHead>Name</TableHead>
              <TableHead>VM</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Memory Snapshot</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {snapshots.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No snapshots found. Create your first snapshot.
                </TableCell>
              </TableRow>
            ) : (
              snapshots.map((snap, i) => (
                <motion.tr
                  key={snap.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-muted-foreground" />
                      {snap.name}
                    </div>
                  </TableCell>
                  <TableCell>{snap.vm}</TableCell>
                  <TableCell><StatusBadge status={snap.state} /></TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${snap.type === 'AUTO' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {snap.type}
                    </span>
                  </TableCell>
                  <TableCell>{snap.memorySnapshot ? '✓' : '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(snap.created).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleRevert(snap)}>
                        <RotateCcw className="mr-1 h-3 w-3" /> Revert
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-red-500 hover:text-red-400"
                        onClick={() => handleDelete(snap)}
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
            <DialogTitle>Create VM Snapshot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Virtual Machine</label>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Snapshot Name</label>
              <Input placeholder="e.g., before-upgrade" value={snapName} onChange={(e) => setSnapName(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Memory Snapshot</p>
                <p className="text-xs text-muted-foreground">Include RAM state in snapshot</p>
              </div>
              <Switch checked={memorySnap} onCheckedChange={setMemorySnap} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreate} disabled={loading}>
                {loading ? 'Creating…' : 'Create Snapshot'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
