'use client'

import React, { useEffect, useState } from 'react';
import {
  Server,
  HardDrive,
  Network,
  AlertTriangle,
  Activity,
  Clock,
  Database,
  Cpu,
  Wifi,
  Layers,
  Zap,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';

interface DashboardData {
  infrastructure: {
    pods: number;
    clusters: number;
    hosts: number;
    hostsInAlert: number;
    primaryStorage: number;
    systemVMs: number;
    virtualRouters: number;
    instances: number;
  };
  compute: {
    memory: { used: number; total: number; percent: number };
    cpu: { used: number; total: number; percent: number };
    cpuCores: { used: number; total: number };
    gpu: { used: number; total: number };
  };
  storage: {
    primaryUsed: { used: number; total: number; percent: number };
    primaryAllocated: { used: number; total: number; percent: number };
    secondary: { used: number; total: number; percent: number };
  };
  network: {
    vlan: { used: number; total: number; percent: number };
    publicIPs: { used: number; total: number; percent: number };
    managementIPs: { used: number; total: number; percent: number };
  };
  alerts: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
    level: string;
  }>;
  events: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
    user: string;
    level: string;
  }>;
  zones: Array<{ id: string; name: string }>;
}

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState('All Zones');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/summary');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const summary = await res.json();
      setData(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
        <p className="text-destructive">Error loading dashboard: {error}</p>
        <Button onClick={fetchData} variant="outline" className="mt-2">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const { infrastructure, compute, storage, network, alerts, events, zones } = data;

  // Format bytes to human readable
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format MHz to GHz
  const formatGHz = (mhz: number) => {
    return (mhz / 1000).toFixed(2) + ' GHz'
  }

  const ProgressBar = ({ percent, color = 'bg-primary' }: { percent: number; color?: string }) => (
    <div className="w-full bg-muted rounded-full h-2 mt-1">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${Math.min(percent, 100)}%` }} />
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Header with Zone Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <select 
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="appearance-none bg-background border border-border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option>All Zones</option>
              {zones.map(zone => (
                <option key={zone.id} value={zone.name}>{zone.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Fetch latest
          </Button>
        </div>
      </div>

      {/* Main Grid - CloudStack Native Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Infrastructure Section */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{infrastructure.pods}</p>
                  <p className="text-xs text-muted-foreground">Pods</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{infrastructure.clusters}</p>
                  <p className="text-xs text-muted-foreground">Clusters</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{infrastructure.hosts}</p>
                  <p className="text-xs text-muted-foreground">Hosts</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-5 h-5 ${infrastructure.hostsInAlert > 0 ? 'text-red-500' : 'text-green-500'}`} />
                <div>
                  <p className="text-2xl font-bold">{infrastructure.hostsInAlert}</p>
                  <p className="text-xs text-muted-foreground">Hosts in alert</p>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-cyan-500" />
                <div>
                  <p className="text-xl font-bold">{infrastructure.primaryStorage}</p>
                  <p className="text-xs text-muted-foreground">Primary Storage</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-xl font-bold">{infrastructure.systemVMs}</p>
                  <p className="text-xs text-muted-foreground">System VMs</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="text-xl font-bold">{infrastructure.virtualRouters}</p>
                  <p className="text-xs text-muted-foreground">Virtual Routers</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-xl font-bold">{infrastructure.instances}</p>
                  <p className="text-xs text-muted-foreground">Instances</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compute Section */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              Compute
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Memory */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Memory</span>
                <span className="text-xs text-muted-foreground">{compute.memory.percent.toFixed(2)}%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatBytes(compute.memory.used)} Used | {formatBytes(compute.memory.total)} Total
              </p>
              <ProgressBar percent={compute.memory.percent} color="bg-green-500" />
            </div>

            {/* CPU */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">CPU</span>
                <span className="text-xs text-muted-foreground">{compute.cpu.percent.toFixed(2)}%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatGHz(compute.cpu.used)} Used | {formatGHz(compute.cpu.total)} Total
              </p>
              <ProgressBar percent={compute.cpu.percent} color="bg-blue-500" />
            </div>

            {/* CPU Cores */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">CPU cores</span>
                <span className="text-xs text-muted-foreground">18.75%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                3 Used | 16 Total
              </p>
              <ProgressBar percent={18.75} color="bg-emerald-500" />
            </div>

            {/* GPU */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">GPU</span>
                <span className="text-xs text-muted-foreground">0%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                0 Used | 0 Total
              </p>
              <ProgressBar percent={0} color="bg-gray-500" />
            </div>
          </CardContent>
        </Card>

        {/* Storage Section */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Primary Storage Used */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Primary Storage used</span>
                <span className="text-xs text-muted-foreground">{storage.primaryUsed.percent.toFixed(2)}%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatBytes(storage.primaryUsed.used)} Used | {formatBytes(storage.primaryUsed.total)} Total
              </p>
              <ProgressBar percent={storage.primaryUsed.percent} color="bg-cyan-500" />
            </div>

            {/* Primary Storage Allocated */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Primary Storage allocated</span>
                <span className="text-xs text-muted-foreground">{storage.primaryAllocated.percent.toFixed(2)}%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatBytes(storage.primaryAllocated.used)} Allocated | {formatBytes(storage.primaryAllocated.total)} Total
              </p>
              <ProgressBar percent={storage.primaryAllocated.percent} color="bg-teal-500" />
            </div>

            {/* Secondary Storage */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Secondary Storage</span>
                <span className="text-xs text-muted-foreground">{storage.secondary.percent}%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatBytes(storage.secondary.used)} Allocated | {formatBytes(storage.secondary.total)} Total
              </p>
              <ProgressBar percent={storage.secondary.percent} color="bg-indigo-500" />
            </div>
          </CardContent>
        </Card>

        {/* Network Section */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Network className="w-5 h-5 text-primary" />
              Network
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* VLAN/VNI */}
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium">VLAN/VNI</p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{network.vlan.used} Allocated | {network.vlan.total} Total</span>
                  <span>{network.vlan.percent.toFixed(2)}%</span>
                </div>
                <ProgressBar percent={network.vlan.percent} color="bg-green-500" />
              </div>
            </div>

            {/* Public IP addresses */}
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium">Public IP addresses</p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{network.publicIPs.used} Allocated | {network.publicIPs.total} Total</span>
                  <span>{network.publicIPs.percent.toFixed(2)}%</span>
                </div>
                <ProgressBar percent={network.publicIPs.percent} color="bg-blue-500" />
              </div>
            </div>

            {/* Management IP addresses */}
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium">Management IP addresses</p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{network.managementIPs.used} Allocated | {network.managementIPs.total} Total</span>
                  <span>{network.managementIPs.percent.toFixed(2)}%</span>
                </div>
                <ProgressBar percent={network.managementIPs.percent} color="bg-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Section */}
        <Card className="border-border/50 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Alerts
              {alerts.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-destructive/20 text-destructive rounded-full">
                  {alerts.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No active alerts</p>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${alert.level === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">{new Date(alert.date).toLocaleString()}</span>
                        <span className="px-1.5 py-0.5 bg-destructive/20 text-destructive rounded text-[10px] font-medium">
                          {alert.type}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{alert.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Events Section */}
        <Card className="border-border/50 md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent events</p>
              ) : (
                events.map((event, index) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      event.level === 'ERROR' ? 'bg-red-500' : 
                      event.level === 'WARN' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(event.date).toLocaleString()}
                    </div>
                    <span className="px-1.5 py-0.5 bg-primary/20 text-primary rounded text-[10px] font-medium flex-shrink-0">
                      {event.type}
                    </span>
                    <span className="text-sm text-muted-foreground flex-shrink-0">
                      {event.user}
                    </span>
                    <p className="text-sm truncate flex-1">{event.description}</p>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}