import React, { useState, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Square,
  RotateCcw,
  Trash2,
  Terminal,
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Clock,
  Shield } from
'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle } from
'../../components/ui/Card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger } from
'../../components/ui/Tabs';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { mockVMs, mockVolumes, mockNetworks } from '../../lib/mockData';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
export function AdminInstanceDetailPage() {
  const { id } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // In a real app, we'd fetch this. For now, find in mock data.
  // If not found, use the first one just for demo purposes.
  const vm = mockVMs.find((v) => v.id === id) || mockVMs[0];
  const attachedVolumes = mockVolumes.filter((v) => v.vmname === vm.name);
  // Mock performance data
  const perfData = Array.from({
    length: 24
  }).map((_, i) => ({
    time: `${i}:00`,
    cpu: Math.floor(Math.random() * 40) + (vm.state === 'Running' ? 20 : 0),
    ram: Math.floor(Math.random() * 20) + (vm.state === 'Running' ? 40 : 0)
  }));
  const handleAction = (action: string) => {
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
        setDeleteDialogOpen(true);
        break;
    }
  };
  const confirmDelete = () => {
    toast.success(`Instance ${vm.name} deleted successfully`);
    setDeleteDialogOpen(false);
    navigate('/admin/compute/instances');
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin/compute/instances')}>
          
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm text-muted-foreground">
          Compute / Instances /{' '}
          <span className="text-foreground font-medium">{vm.name}</span>
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
            <p className="text-muted-foreground mt-1">ID: {vm.id}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('start')}
            disabled={vm.state === 'Running'}>
            
            <Play className="mr-2 h-4 w-4" /> Start
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('stop')}
            disabled={vm.state !== 'Running'}>
            
            <Square className="mr-2 h-4 w-4" /> Stop
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('reboot')}
            disabled={vm.state !== 'Running'}>
            
            <RotateCcw className="mr-2 h-4 w-4" /> Reboot
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('console')}
            disabled={vm.state !== 'Running'}>
            
            <Terminal className="mr-2 h-4 w-4" /> Console
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleAction('delete')}>
            
            <Trash2 className="mr-2 h-4 w-4" /> Destroy
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Compute</p>
                  <p className="font-medium">{vm.cpunumber} vCPU</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                  <MemoryStick className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Memory</p>
                  <p className="font-medium">{vm.memory / 1024} GB</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                  <Network className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <p className="font-medium">{vm.ipaddress}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account</p>
                  <p className="font-medium">{vm.account}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Instance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    OS Display Name
                  </dt>
                  <dd className="mt-1 text-sm">{vm.osdisplayname}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Zone
                  </dt>
                  <dd className="mt-1 text-sm">{vm.zonename}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Template ID
                  </dt>
                  <dd className="mt-1 text-sm">{vm.templateid}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Domain
                  </dt>
                  <dd className="mt-1 text-sm">{vm.domain}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Created
                  </dt>
                  <dd className="mt-1 text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {new Date(vm.created).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Utilization (Last 24h)</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={perfData}
                  margin={{
                    top: 5,
                    right: 20,
                    bottom: 5,
                    left: 0
                  }}>
                  
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false} />
                  
                  <XAxis
                    dataKey="time"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false} />
                  
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    unit="%" />
                  
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px'
                    }}
                    itemStyle={{
                      color: 'var(--foreground)'
                    }} />
                  
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    name="CPU %"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={false} />
                  
                  <Line
                    type="monotone"
                    dataKey="ram"
                    name="RAM %"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false} />
                  
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Attached Volumes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attachedVolumes.map((vol) =>
                <div
                  key={vol.id}
                  className="flex items-center justify-between p-4 border rounded-lg">
                  
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-md">
                        <HardDrive className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">{vol.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {vol.type} • {vol.size} GB
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={vol.state} />
                  </div>
                )}
                {attachedVolumes.length === 0 &&
                <p className="text-center text-muted-foreground py-4">
                    No volumes attached.
                  </p>
                }
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Network Interfaces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-md">
                    <Network className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">nic0 (Default)</h4>
                    <p className="text-sm text-muted-foreground">
                      IP: {vm.ipaddress} • MAC: 02:00:2a:b1:c2:d3
                    </p>
                  </div>
                </div>
                <StatusBadge status="Active" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Destroy Instance"
        description={`Are you sure you want to destroy ${vm.name}? This action cannot be undone.`}
        confirmLabel="Destroy"
        variant="danger"
        onConfirm={confirmDelete} />
      
    </div>);

}