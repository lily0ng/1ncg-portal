import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/Table';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft, Play, Square, RotateCcw, Terminal, Trash2,
  HardDrive, Camera, Server, Cpu, MemoryStick, Network as NetworkIcon, Clock, Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { mockVMs, mockVolumes } from '../../lib/mockData';

// Mock snapshots
const mockSnapshots = [
  { id: 'snap-1', name: 'before-upgrade', state: 'BackedUp', type: 'MANUAL', created: '2024-03-10T08:00:00Z', virtualmachineid: 'vm-3' },
  { id: 'snap-2', name: 'daily-2024-03-15', state: 'BackedUp', type: 'AUTO', created: '2024-03-15T00:00:00Z', virtualmachineid: 'vm-3' },
];

const cpuHistory = Array.from({ length: 12 }, (_, i) => ({
  time: `${i * 2}:00`,
  cpu: Math.floor(Math.random() * 50) + 10,
  memory: Math.floor(Math.random() * 30) + 40,
}));

export function UserInstanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [consoleUrl, setConsoleUrl] = useState<string | null>(null);
  const [consoleLoading, setConsoleLoading] = useState(false);
  const [createSnapOpen, setCreateSnapOpen] = useState(false);
  const [snapName, setSnapName] = useState('');

  const vm = mockVMs.find((v) => v.id === id) || mockVMs[0];
  const attachedVolumes = mockVolumes.filter((v) => v.vmname === vm.name);
  const vmSnapshots = mockSnapshots.filter((s) => s.virtualmachineid === vm.id);

  useEffect(() => {
    if (vm.state === 'Running') {
      setConsoleLoading(true);
      setTimeout(() => {
        setConsoleUrl(`/api/compute/vms/${vm.id}/console`);
        setConsoleLoading(false);
      }, 800);
    }
  }, [vm.id, vm.state]);

  const handleAction = async (action: string) => {
    if (action === 'console') {
      window.open(`/console/${vm.id}`, '_blank');
      return;
    }
    if (action === 'delete') { setDeleteOpen(true); return; }
    const msgs: Record<string, string> = { start: 'Starting', stop: 'Stopping', reboot: 'Rebooting' };
    try {
      await new Promise((r) => setTimeout(r, 600));
      toast.success(`${msgs[action]} ${vm.name}`);
    } catch {
      toast.error(`Failed to ${action} ${vm.name}`);
    }
  };

  const handleDelete = async () => {
    await new Promise((r) => setTimeout(r, 800));
    toast.success(`${vm.name} deleted`);
    setDeleteOpen(false);
    navigate('/portal/instances');
  };

  const handleCreateSnapshot = async () => {
    if (!snapName) { toast.error('Snapshot name required'); return; }
    await new Promise((r) => setTimeout(r, 800));
    toast.success(`Snapshot "${snapName}" created`);
    setSnapName('');
    setCreateSnapOpen(false);
  };

  const metrics = { cpu: 34, memory: 62, networkIn: 1.2, networkOut: 0.8 };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/portal/instances')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm text-muted-foreground">
          Instances / <span className="text-foreground font-medium">{vm.name}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Server className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              {vm.name}
              <StatusBadge status={vm.state} />
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">ID: {vm.id}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleAction('start')} disabled={vm.state === 'Running'}>
            <Play className="mr-2 h-4 w-4" /> Start
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleAction('stop')} disabled={vm.state !== 'Running'}>
            <Square className="mr-2 h-4 w-4" /> Stop
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleAction('reboot')} disabled={vm.state !== 'Running'}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reboot
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleAction('console')} disabled={vm.state !== 'Running'}>
            <Terminal className="mr-2 h-4 w-4" /> Console
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleAction('delete')}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-[640px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
          <TabsTrigger value="console">Console</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-border/50">
                <CardHeader><CardTitle>Instance Details</CardTitle></CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    {[
                      ['ID', vm.id],
                      ['Zone', vm.zonename],
                      ['Host', 'host-01.' + vm.zonename],
                      ['IP Address', vm.ipaddress],
                      ['OS Template', vm.osdisplayname],
                      ['Service Offering', `${vm.cpunumber} vCPU / ${vm.memory / 1024} GB RAM`],
                      ['Account', vm.account],
                      ['Created', new Date(vm.created).toLocaleString()],
                    ].map(([label, val]) => (
                      <div key={String(label)}>
                        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
                        <dd className="mt-1 text-sm font-mono">{val}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="border-border/50">
                <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline" size="sm" onClick={() => handleAction('reboot')}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Reboot VM
                  </Button>
                  <Button className="w-full justify-start" variant="outline" size="sm" onClick={() => setCreateSnapOpen(true)}>
                    <Camera className="mr-2 h-4 w-4" /> Take Snapshot
                  </Button>
                  <Button className="w-full justify-start" variant="outline" size="sm" onClick={() => handleAction('console')}>
                    <Terminal className="mr-2 h-4 w-4" /> Open Console
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'CPU Usage', value: metrics.cpu, color: 'bg-blue-500', max: 100, unit: '%' },
              { label: 'Memory Usage', value: metrics.memory, color: 'bg-purple-500', max: 100, unit: '%' },
              { label: 'Network In', value: metrics.networkIn, color: 'bg-green-500', max: 10, unit: ' MB/s' },
            ].map(({ label, value, color, max, unit }) => (
              <Card key={label} className="border-border/50">
                <CardContent className="pt-5 pb-5">
                  <p className="text-sm text-muted-foreground mb-2">{label}</p>
                  <p className="text-2xl font-bold mb-3">{value}{unit}</p>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(value / max) * 100}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-border/50">
            <CardHeader><CardTitle>CPU History (12h)</CardTitle></CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cpuHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    formatter={(v: number) => [`${v}%`]}
                  />
                  <Bar dataKey="cpu" name="CPU %" fill="var(--primary)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage */}
        <TabsContent value="storage" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-medium">Attached Volumes</h3>
            <Button size="sm" variant="outline" onClick={() => toast.info('Attach volume dialog coming soon')}>
              <Plus className="mr-2 h-4 w-4" /> Attach Volume
            </Button>
          </div>
          <Card className="border-border/50">
            <CardContent className="pt-4">
              {attachedVolumes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No volumes attached.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attachedVolumes.map((vol) => (
                      <TableRow key={vol.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <HardDrive className="h-4 w-4 text-muted-foreground" /> {vol.name}
                        </TableCell>
                        <TableCell>{vol.type}</TableCell>
                        <TableCell>{vol.size} GB</TableCell>
                        <TableCell><StatusBadge status={vol.state} /></TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={vol.type === 'ROOT'}
                            onClick={() => toast.success(`Detaching ${vol.name}`)}
                          >
                            Detach
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Snapshots */}
        <TabsContent value="snapshots" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-medium">VM Snapshots</h3>
            <Button size="sm" variant="outline" onClick={() => setCreateSnapOpen(true)}>
              <Camera className="mr-2 h-4 w-4" /> Create Snapshot
            </Button>
          </div>
          <Card className="border-border/50">
            <CardContent className="pt-4">
              {vmSnapshots.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No snapshots found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vmSnapshots.map((snap) => (
                      <TableRow key={snap.id}>
                        <TableCell className="font-medium">{snap.name}</TableCell>
                        <TableCell><StatusBadge status={snap.state} /></TableCell>
                        <TableCell>{snap.type}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(snap.created).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => toast.success(`Reverting to ${snap.name}`)}>Revert</Button>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => toast.success(`Deleted ${snap.name}`)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Console */}
        <TabsContent value="console" className="mt-6">
          <Card className="border-border/50">
            <CardHeader><CardTitle>VM Console</CardTitle></CardHeader>
            <CardContent>
              {vm.state !== 'Running' ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground space-y-2">
                  <Terminal className="h-8 w-8 opacity-50" />
                  <p>Console is not available for stopped VMs.</p>
                  <Button size="sm" onClick={() => handleAction('start')}>Start VM</Button>
                </div>
              ) : consoleLoading ? (
                <div className="h-[600px] animate-pulse bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Loading console…</p>
                </div>
              ) : consoleUrl ? (
                <iframe
                  src={consoleUrl}
                  className="w-full h-[600px] border border-white/10 rounded-lg bg-black"
                  title="VM Console"
                />
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Instance"
        description={`Are you sure you want to delete ${vm.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />

      {/* Create Snapshot Dialog */}
      {createSnapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setCreateSnapOpen(false)}>
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Create Snapshot</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Snapshot Name</label>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="e.g., before-upgrade"
                value={snapName}
                onChange={(e) => setSnapName(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setCreateSnapOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreateSnapshot}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
