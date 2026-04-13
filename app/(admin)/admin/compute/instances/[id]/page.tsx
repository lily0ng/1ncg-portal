'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Play, Square, RotateCcw, Terminal, Trash2, ArrowLeft,
  Cpu, MemoryStick, HardDrive, Network, Camera, Clock,
  AlertCircle, RefreshCw, Plus, Unplug, Server, Globe,
  Activity, Info, Calendar, User, Shield, Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const STATE_VARIANT: Record<string, any> = {
  Running: 'success', Stopped: 'warning', Error: 'destructive',
  Starting: 'info', Stopping: 'warning', Migrating: 'info',
}

function InfoRow({ label, value, mono }: { label: string; value?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-[var(--border)] last:border-0">
      <span className="text-sm text-[var(--text-muted)] w-44 shrink-0">{label}</span>
      <span className={cn('text-sm text-[var(--text)] text-right flex-1', mono && 'font-mono text-xs')}>{value ?? '—'}</span>
    </div>
  )
}

function UsageBar({ label, percent, color = 'bg-blue-500' }: { label: string; percent: number; color?: string }) {
  const pct = Math.min(100, Math.max(0, percent))
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span className="text-[var(--text)] font-medium">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color, pct > 85 && 'bg-red-500', pct > 70 && pct <= 85 && 'bg-yellow-500')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function InstanceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = (params?.id ?? '') as string

  const [activeTab, setActiveTab] = useState('overview')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [snapshotName, setSnapshotName] = useState('')
  const [snapshotMemory, setSnapshotMemory] = useState(false)
  const [creatingSnapshot, setCreatingSnapshot] = useState(false)

  const { data: vmData, error: vmError, isLoading: vmLoading, mutate: mutateVM } =
    useSWR<{ vm: any }>(`/api/compute/vms/${id}`, fetcher, { refreshInterval: 15000 })

  const { data: volumeData, isLoading: volLoading, mutate: mutateVols } =
    useSWR<{ volumes: any[] }>(`/api/storage/volumes?virtualmachineid=${id}`, fetcher)

  const { data: snapshotData, isLoading: snapLoading, mutate: mutateSnaps } =
    useSWR<{ snapshots: any[] }>(`/api/compute/snapshots?virtualmachineid=${id}`, fetcher)

  const { data: eventData, isLoading: eventLoading } =
    useSWR<{ events: any[] }>(`/api/events?resourceid=${id}&pagesize=50`, fetcher, { refreshInterval: 30000 })

  const vm = vmData?.vm
  const volumes = volumeData?.volumes || []
  const snapshots = snapshotData?.snapshots || []
  const events = eventData?.events || []

  const handleAction = async (action: string) => {
    if (action === 'destroy') {
      if (!confirm(`Destroy "${vm?.displayname || vm?.name}"? This cannot be undone.`)) return
    }
    setActionLoading(action)
    try {
      const res = await fetch(`/api/compute/vms/${id}/${action}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Failed to ${action}`)
      toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} initiated`)
      setTimeout(() => mutateVM(), 2000)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateSnapshot = async () => {
    if (!snapshotName.trim()) { toast.error('Please enter a snapshot name'); return }
    setCreatingSnapshot(true)
    try {
      const res = await fetch('/api/compute/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ virtualmachineid: id, name: snapshotName, snapshotmemory: snapshotMemory }),
      })
      if (!res.ok) throw new Error('Failed to create snapshot')
      toast.success('Snapshot creation initiated')
      setSnapshotName('')
      mutateSnaps()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setCreatingSnapshot(false)
    }
  }

  const memUsedMB = vm ? Math.max(0, (vm.memory ?? 0) - Math.round((vm.memoryintfreekbs ?? 0) / 1024)) : 0
  const memPct = vm?.memory ? Math.round((memUsedMB / vm.memory) * 100) : 0
  const cpuPct = parseFloat(vm?.cpuused?.replace('%', '') ?? '0')

  if (vmError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-[var(--text-muted)]">Failed to load instance details</p>
        <Button onClick={() => mutateVM()}>
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back to Instances
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20">
            <Server className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            {vmLoading ? (
              <div className="h-7 w-48 rounded bg-[var(--border)] animate-pulse" />
            ) : (
              <>
                <h1 className="text-xl font-bold text-[var(--text)]">{vm?.displayname || vm?.name || id}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={STATE_VARIANT[vm?.state] || 'secondary'}>{vm?.state || '—'}</Badge>
                  <span className="text-xs text-[var(--text-muted)] font-mono">{id.slice(0, 12)}…</span>
                </div>
              </>
            )}
          </div>
        </div>

        {vm && (
          <div className="flex items-center gap-2 flex-wrap">
            {vm.state === 'Stopped' && (
              <Button variant="outline" size="sm" onClick={() => handleAction('start')} disabled={!!actionLoading} className="gap-2 border-green-600/40 text-green-400 hover:bg-green-500/10">
                <Play className="w-4 h-4" />{actionLoading === 'start' ? 'Starting…' : 'Start'}
              </Button>
            )}
            {vm.state === 'Running' && (
              <>
                <Button variant="outline" size="sm" onClick={() => handleAction('stop')} disabled={!!actionLoading} className="gap-2 border-yellow-600/40 text-yellow-400 hover:bg-yellow-500/10">
                  <Square className="w-4 h-4" />{actionLoading === 'stop' ? 'Stopping…' : 'Stop'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAction('reboot')} disabled={!!actionLoading} className="gap-2 border-blue-600/40 text-blue-400 hover:bg-blue-500/10">
                  <RotateCcw className="w-4 h-4" />{actionLoading === 'reboot' ? 'Rebooting…' : 'Reboot'}
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => window.open(`/api/compute/vms/${id}/console`, '_blank')} className="gap-2 border-purple-600/40 text-purple-400 hover:bg-purple-500/10">
              <Terminal className="w-4 h-4" /> Console
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAction('destroy')} disabled={!!actionLoading} className="gap-2 border-red-600/40 text-red-400 hover:bg-red-500/10">
              <Trash2 className="w-4 h-4" />{actionLoading === 'destroy' ? 'Destroying…' : 'Destroy'}
            </Button>
          </div>
        )}
      </div>

      {/* Quick stats */}
      {vm && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-[var(--text-muted)]">CPU</span>
              </div>
              <p className="text-2xl font-bold text-[var(--text)]">{vm.cpunumber ?? '—'}</p>
              <p className="text-xs text-[var(--text-muted)]">vCPU cores</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MemoryStick className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-[var(--text-muted)]">Memory</span>
              </div>
              <p className="text-2xl font-bold text-[var(--text)]">{vm.memory ? `${Math.round(vm.memory / 1024)}` : '—'}</p>
              <p className="text-xs text-[var(--text-muted)]">GB RAM</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-green-400" />
                <span className="text-xs text-[var(--text-muted)]">IP Address</span>
              </div>
              <p className="text-lg font-bold text-[var(--text)] font-mono">{vm.ipaddress || '—'}</p>
              <p className="text-xs text-[var(--text-muted)]">Private IP</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-[var(--text-muted)]">CPU Usage</span>
              </div>
              <p className="text-2xl font-bold text-[var(--text)]">{cpuPct}%</p>
              <p className="text-xs text-[var(--text-muted)]">Current</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full border border-[var(--border)] bg-[var(--bg)] p-1">
          {['overview', 'performance', 'storage', 'snapshots', 'events'].map(tab => (
            <TabsTrigger key={tab} value={tab} className="flex-1 capitalize text-xs sm:text-sm">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Info className="w-4 h-4" /> General</CardTitle></CardHeader>
              <CardContent>
                {vmLoading ? <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-8 rounded bg-[var(--border)] animate-pulse" />)}</div> : (
                  <>
                    <InfoRow label="Name" value={vm?.displayname || vm?.name} />
                    <InfoRow label="ID" value={vm?.id} mono />
                    <InfoRow label="State" value={vm?.state && <Badge variant={STATE_VARIANT[vm.state]}>{vm.state}</Badge>} />
                    <InfoRow label="OS Type" value={vm?.ostypename} />
                    <InfoRow label="Hypervisor" value={vm?.hypervisor} />
                    <InfoRow label="Host" value={vm?.hostname} />
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Server className="w-4 h-4" /> Configuration</CardTitle></CardHeader>
              <CardContent>
                {vmLoading ? <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-8 rounded bg-[var(--border)] animate-pulse" />)}</div> : (
                  <>
                    <InfoRow label="Service Offering" value={vm?.serviceofferingname} />
                    <InfoRow label="Template" value={vm?.templatename} />
                    <InfoRow label="Zone" value={vm?.zonename} />
                    <InfoRow label="Account" value={vm?.account} />
                    <InfoRow label="Domain" value={vm?.domain} />
                    <InfoRow label="Created" value={vm?.created ? new Date(vm.created).toLocaleString() : '—'} />
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Network className="w-4 h-4" /> Network</CardTitle></CardHeader>
              <CardContent>
                {vmLoading ? <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-8 rounded bg-[var(--border)] animate-pulse" />)}</div> : (
                  <>
                    <InfoRow label="Private IP" value={vm?.ipaddress} mono />
                    <InfoRow label="Public IP" value={vm?.publicip} mono />
                    <InfoRow label="Network Read" value={vm?.networkkbsread != null ? `${(vm.networkkbsread / 1024).toFixed(1)} MB` : '—'} />
                    <InfoRow label="Network Write" value={vm?.networkkbswrite != null ? `${(vm.networkkbswrite / 1024).toFixed(1)} MB` : '—'} />
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-4 h-4" /> HA & Groups</CardTitle></CardHeader>
              <CardContent>
                {vmLoading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-8 rounded bg-[var(--border)] animate-pulse" />)}</div> : (
                  <>
                    <InfoRow label="HA Enabled" value={vm?.haenable ? <Badge variant="success">Yes</Badge> : <Badge variant="secondary">No</Badge>} />
                    <InfoRow label="Instance Group" value={vm?.instancegroupname} />
                    <InfoRow label="Tags" value={vm?.tags?.length ? `${vm.tags.length} tags` : 'None'} />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Performance ── */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-4 h-4" /> Resource Usage</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                {vmLoading ? (
                  <div className="space-y-5">{[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded bg-[var(--border)] animate-pulse" />)}</div>
                ) : (
                  <>
                    <UsageBar label="CPU Usage" percent={cpuPct} color="bg-blue-500" />
                    <UsageBar label={`Memory (${memUsedMB} / ${memTotalMB} MB)`} percent={memPct} color="bg-purple-500" />
                    <div className="pt-2 border-t border-[var(--border)]">
                      <p className="text-xs text-[var(--text-muted)] mb-3">Disk I/O</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-[var(--text-muted)] text-xs">Read</p>
                          <p className="font-medium text-[var(--text)]">{vm?.diskioread ?? '—'} ops</p>
                        </div>
                        <div>
                          <p className="text-[var(--text-muted)] text-xs">Write</p>
                          <p className="font-medium text-[var(--text)]">{vm?.diskiowrite ?? '—'} ops</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Network className="w-4 h-4" /> Network I/O</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 mt-2">
                  <div className="text-center p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                    <p className="text-3xl font-bold text-blue-400">
                      {vm?.networkkbsread != null ? `${(vm.networkkbsread / 1024).toFixed(1)}` : '—'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">MB Read</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                    <p className="text-3xl font-bold text-green-400">
                      {vm?.networkkbswrite != null ? `${(vm.networkkbswrite / 1024).toFixed(1)}` : '—'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">MB Written</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)] text-center mt-4">Auto-refreshes every 15s</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Storage ── */}
        <TabsContent value="storage">
          <div className="mt-4 space-y-4">
            {volLoading ? (
              <Card><CardContent className="p-8 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></CardContent></Card>
            ) : volumes.length === 0 ? (
              <Card><CardContent className="p-12 text-center"><HardDrive className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)] opacity-40" /><p className="text-[var(--text-muted)]">No volumes attached</p></CardContent></Card>
            ) : volumes.map((vol) => (
              <Card key={vol.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <HardDrive className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text)]">{vol.name}</p>
                        <p className="text-xs text-[var(--text-muted)] font-mono">{vol.id?.slice(0, 12)}…</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <Badge variant={vol.state === 'Ready' ? 'success' : 'secondary'}>{vol.state}</Badge>
                      <Badge variant="secondary">{vol.type}</Badge>
                      <span className="text-sm text-[var(--text-muted)]">
                        {vol.size ? `${Math.round(vol.size / (1024 ** 3))} GB` : '—'}
                      </span>
                      {vol.type !== 'ROOT' && (
                        <Button variant="outline" size="sm" onClick={() => {
                          if (!confirm('Detach this volume?')) return
                          fetch(`/api/storage/volumes/${vol.id}/detach`, { method: 'POST' })
                            .then(r => r.ok ? (toast.success('Volume detached'), mutateVols()) : toast.error('Failed to detach'))
                        }} className="gap-1 text-[var(--text-muted)] border-[var(--border)]">
                          <Unplug className="w-3.5 h-3.5" /> Detach
                        </Button>
                      )}
                    </div>
                  </div>
                  {vol.diskofferingname && (
                    <p className="text-xs text-[var(--text-muted)] mt-3 pl-14">Offering: {vol.diskofferingname}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Snapshots ── */}
        <TabsContent value="snapshots">
          <div className="mt-4 space-y-4">
            {/* Create snapshot form */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Camera className="w-4 h-4" /> Create Snapshot</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Snapshot name…"
                    value={snapshotName}
                    onChange={(e) => setSnapshotName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateSnapshot()}
                    className="flex-1"
                  />
                  <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={snapshotMemory}
                      onChange={(e) => setSnapshotMemory(e.target.checked)}
                      className="rounded"
                    />
                    Include memory
                  </label>
                  <Button onClick={handleCreateSnapshot} disabled={creatingSnapshot} className="gap-2">
                    {creatingSnapshot ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Create
                  </Button>
                </div>
              </CardContent>
            </Card>

            {snapLoading ? (
              <Card><CardContent className="p-8 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></CardContent></Card>
            ) : snapshots.length === 0 ? (
              <Card><CardContent className="p-12 text-center"><Camera className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)] opacity-40" /><p className="text-[var(--text-muted)]">No snapshots found</p></CardContent></Card>
            ) : snapshots.map((snap) => (
              <Card key={snap.id}>
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Camera className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text)]">{snap.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{snap.created ? new Date(snap.created).toLocaleString() : '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={snap.state === 'BackedUp' ? 'success' : 'secondary'}>{snap.state}</Badge>
                    {snap.type && <Badge variant="secondary">{snap.type}</Badge>}
                    <Button variant="outline" size="sm" onClick={() => {
                      if (!confirm(`Delete snapshot "${snap.name}"?`)) return
                      fetch(`/api/compute/snapshots/${snap.id}`, { method: 'DELETE' })
                        .then(r => r.ok ? (toast.success('Snapshot deleted'), mutateSnaps()) : toast.error('Failed to delete'))
                    }} className="gap-1 text-red-400 border-red-600/30 hover:bg-red-500/10">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Events ── */}
        <TabsContent value="events">
          <div className="mt-4 space-y-2">
            {eventLoading ? (
              <Card><CardContent className="p-8 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></CardContent></Card>
            ) : events.length === 0 ? (
              <Card><CardContent className="p-12 text-center"><Clock className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)] opacity-40" /><p className="text-[var(--text-muted)]">No events found</p></CardContent></Card>
            ) : events.map((event, i) => {
              const isError = event.level === 'ERROR'
              const isWarn = event.level === 'WARN'
              return (
                <div key={event.id || i} className={cn('flex items-start gap-3 p-4 rounded-lg border', isError ? 'border-red-600/30 bg-red-500/5' : isWarn ? 'border-yellow-600/30 bg-yellow-500/5' : 'border-[var(--border)] bg-[var(--card)]')}>
                  <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', isError ? 'bg-red-500' : isWarn ? 'bg-yellow-500' : 'bg-blue-500')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-[var(--text)] truncate">{event.type}</p>
                      <span className="text-xs text-[var(--text-muted)] shrink-0">{event.created ? new Date(event.created).toLocaleString() : '—'}</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] truncate">{event.description}</p>
                    {event.account && <p className="text-xs text-[var(--text-muted)] mt-0.5">by {event.account}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
