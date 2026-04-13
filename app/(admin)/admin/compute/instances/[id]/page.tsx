'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Play, Square, RotateCcw, Terminal, Trash2, ArrowLeft,
  Cpu, MemoryStick, HardDrive, Network, Camera, Clock,
  AlertCircle, RefreshCw, Plus, Unplug, Server, Globe,
  Activity, Info, Shield, Settings, Key, Wifi,
  BarChart3, Archive, CalendarDays, Search, Layers, Lock,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STATE_VARIANT: Record<string, any> = {
  Running: 'success', Stopped: 'warning', Error: 'destructive',
  Starting: 'info', Stopping: 'warning', Migrating: 'info',
}

// ─── Sidebar nav definition ────────────────────────────────────────────
type Section =
  | 'overview' | 'details' | 'metrics'
  | 'volumes' | 'nics' | 'snapshots' | 'backups' | 'schedules'
  | 'firewall' | 'portforwarding'
  | 'settings' | 'events'

interface NavGroup { label: string; items: { id: Section; label: string; icon: React.ElementType }[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Instance',
    items: [
      { id: 'overview', label: 'Overview', icon: Info },
      { id: 'details', label: 'Details', icon: Server },
      { id: 'metrics', label: 'Metrics', icon: BarChart3 },
    ],
  },
  {
    label: 'Storage',
    items: [
      { id: 'volumes', label: 'Volumes', icon: HardDrive },
      { id: 'snapshots', label: 'Snapshots', icon: Camera },
      { id: 'backups', label: 'Backups', icon: Archive },
      { id: 'schedules', label: 'Schedules', icon: CalendarDays },
    ],
  },
  {
    label: 'Networking',
    items: [
      { id: 'nics', label: 'NICs', icon: Wifi },
      { id: 'firewall', label: 'Firewall', icon: Shield },
      { id: 'portforwarding', label: 'Port Forwarding', icon: Layers },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'events', label: 'Events', icon: Clock },
    ],
  },
]

// ─── Small helpers ─────────────────────────────────────────────────────
function InfoRow({ label, value, mono }: { label: string; value?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-[var(--border)] last:border-0 gap-4">
      <span className="text-sm text-[var(--text-muted)] w-44 shrink-0">{label}</span>
      <span className={cn('text-sm text-[var(--text)] text-right flex-1 break-all', mono && 'font-mono text-xs')}>
        {value ?? '—'}
      </span>
    </div>
  )
}

function UsageBar({ label, percent, color = 'bg-blue-500' }: { label: string; percent: number; color?: string }) {
  const pct = Math.min(100, Math.max(0, Math.round(percent)))
  const barColor = pct > 85 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : color
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span className="font-semibold text-[var(--text)]">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', barColor)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="w-10 h-10 text-[var(--text-muted)] opacity-30 mb-3" />
      <p className="text-sm text-[var(--text-muted)]">{text}</p>
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────
export default function InstanceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = (params?.id ?? '') as string

  const [section, setSection] = useState<Section>('overview')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [snapshotName, setSnapshotName] = useState('')
  const [snapshotMemory, setSnapshotMemory] = useState(false)
  const [creatingSnap, setCreatingSnap] = useState(false)
  const [fwSearch, setFwSearch] = useState('')
  const [pfSearch, setPfSearch] = useState('')
  const [addFwOpen, setAddFwOpen] = useState(false)
  const [addPfOpen, setAddPfOpen] = useState(false)
  const [fwForm, setFwForm] = useState({ cidr: '0.0.0.0/0', protocol: 'TCP', startport: '', endport: '', direction: 'ingress' })
  const [pfForm, setPfForm] = useState({ publicport: '', privateport: '', protocol: 'TCP' })

  // ── SWR fetches ──────────────────────────────────────────────────────
  const { data: vmData, error: vmError, isLoading: vmLoading, mutate: mutateVM } =
    useSWR<{ vm: any }>(`/api/compute/vms/${id}`, fetcher, { refreshInterval: 15000 })

  const { data: volData, isLoading: volLoading, mutate: mutateVols } =
    useSWR<{ volumes: any[] }>(`/api/storage/volumes?virtualmachineid=${id}`, fetcher)

  const { data: snapData, isLoading: snapLoading, mutate: mutateSnaps } =
    useSWR<{ snapshots: any[] }>(`/api/compute/snapshots?virtualmachineid=${id}`, fetcher)

  const { data: evtData, isLoading: evtLoading } =
    useSWR<{ events: any[] }>(`/api/events?resourceid=${id}&pagesize=50`, fetcher, { refreshInterval: 30000 })

  const { data: fwData, isLoading: fwLoading, mutate: mutateFW } =
    useSWR<{ rules: any[] }>(`/api/compute/vms/${id}/firewall`, fetcher)

  const { data: pfData, isLoading: pfLoading, mutate: mutatePF } =
    useSWR<{ rules: any[] }>(`/api/compute/vms/${id}/portforwarding`, fetcher)

  const { data: nicData, isLoading: nicLoading } =
    useSWR<{ nics: any[] }>(`/api/compute/vms/${id}/nics`, fetcher)

  const vm       = vmData?.vm
  const volumes  = volData?.volumes || []
  const snapshots= snapData?.snapshots || []
  const events   = evtData?.events || []
  const fwRules  = fwData?.rules || []
  const pfRules  = pfData?.rules || []
  const nics     = nicData?.nics || []

  const memTotalMB = vm?.memory ?? 0
  const memUsedMB  = vm ? Math.max(0, memTotalMB - Math.round((vm.memoryintfreekbs ?? 0) / 1024)) : 0
  const memPct     = memTotalMB > 0 ? (memUsedMB / memTotalMB) * 100 : 0
  const cpuPct     = parseFloat(vm?.cpuused?.replace('%', '') ?? '0')

  // ── Actions ──────────────────────────────────────────────────────────
  const handleAction = async (action: string) => {
    if (action === 'destroy' && !confirm(`Destroy "${vm?.displayname || vm?.name}"? This cannot be undone.`)) return
    setActionLoading(action)
    try {
      const res  = await fetch(`/api/compute/vms/${id}/${action}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Failed to ${action}`)
      toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} initiated`)
      setTimeout(() => mutateVM(), 2000)
    } catch (err: any) { toast.error(err.message) }
    finally { setActionLoading(null) }
  }

  const createSnapshot = async () => {
    if (!snapshotName.trim()) { toast.error('Enter a snapshot name'); return }
    setCreatingSnap(true)
    try {
      const res = await fetch('/api/compute/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ virtualmachineid: id, name: snapshotName, snapshotmemory: snapshotMemory }),
      })
      if (!res.ok) throw new Error('Failed to create snapshot')
      toast.success('Snapshot initiated')
      setSnapshotName('')
      mutateSnaps()
    } catch (err: any) { toast.error(err.message) }
    finally { setCreatingSnap(false) }
  }

  const addFirewallRule = async () => {
    if (!fwForm.startport && fwForm.protocol !== 'ICMP') { toast.error('Start port required'); return }
    try {
      const res = await fetch(`/api/compute/vms/${id}/firewall`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fwForm),
      })
      if (!res.ok) throw new Error('Failed to add rule')
      toast.success('Firewall rule added')
      setAddFwOpen(false)
      setFwForm({ cidr: '0.0.0.0/0', protocol: 'TCP', startport: '', endport: '', direction: 'ingress' })
      mutateFW()
    } catch (err: any) { toast.error(err.message) }
  }

  const addPortForwardingRule = async () => {
    if (!pfForm.publicport || !pfForm.privateport) { toast.error('Both ports required'); return }
    try {
      const res = await fetch(`/api/compute/vms/${id}/portforwarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pfForm, virtualmachineid: id }),
      })
      if (!res.ok) throw new Error('Failed to add rule')
      toast.success('Port forwarding rule added')
      setAddPfOpen(false)
      setPfForm({ publicport: '', privateport: '', protocol: 'TCP' })
      mutatePF()
    } catch (err: any) { toast.error(err.message) }
  }

  // ── Error state ───────────────────────────────────────────────────────
  if (vmError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-[var(--text-muted)]">Failed to load instance details</p>
        <Button onClick={() => mutateVM()}><RefreshCw className="w-4 h-4 mr-2" /> Retry</Button>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text)]">
        <ArrowLeft className="w-4 h-4" /> Back to Instances
      </Button>

      {/* ── VM Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 shrink-0">
            <Server className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            {vmLoading ? (
              <div className="space-y-2">
                <div className="h-6 w-52 rounded bg-[var(--border)] animate-pulse" />
                <div className="h-4 w-36 rounded bg-[var(--border)] animate-pulse" />
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold text-[var(--text)]">{vm?.displayname || vm?.name || id}</h1>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <Badge variant={STATE_VARIANT[vm?.state] || 'secondary'}>{vm?.state || '—'}</Badge>
                  <span className="text-xs text-[var(--text-muted)] font-mono">{id.slice(0, 12)}…</span>
                  {vm?.zonename && <span className="text-xs text-[var(--text-muted)]">· {vm.zonename}</span>}
                </div>
              </>
            )}
          </div>
        </div>

        {vm && (
          <div className="flex items-center gap-2 flex-wrap">
            {vm.state === 'Stopped' && (
              <Button variant="outline" size="sm" onClick={() => handleAction('start')} disabled={!!actionLoading} className="gap-1.5 border-green-600/40 text-green-400 hover:bg-green-500/10 text-xs">
                <Play className="w-3.5 h-3.5" />{actionLoading === 'start' ? 'Starting…' : 'Start'}
              </Button>
            )}
            {vm.state === 'Running' && (
              <>
                <Button variant="outline" size="sm" onClick={() => handleAction('stop')} disabled={!!actionLoading} className="gap-1.5 border-yellow-600/40 text-yellow-400 hover:bg-yellow-500/10 text-xs">
                  <Square className="w-3.5 h-3.5" />{actionLoading === 'stop' ? 'Stopping…' : 'Stop'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAction('reboot')} disabled={!!actionLoading} className="gap-1.5 border-blue-600/40 text-blue-400 hover:bg-blue-500/10 text-xs">
                  <RotateCcw className="w-3.5 h-3.5" />{actionLoading === 'reboot' ? 'Rebooting…' : 'Reboot'}
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => window.open(`/api/compute/vms/${id}/console`, '_blank')} className="gap-1.5 border-purple-600/40 text-purple-400 hover:bg-purple-500/10 text-xs">
              <Terminal className="w-3.5 h-3.5" /> Console
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAction('destroy')} disabled={!!actionLoading} className="gap-1.5 border-red-600/40 text-red-400 hover:bg-red-500/10 text-xs">
              <Trash2 className="w-3.5 h-3.5" />{actionLoading === 'destroy' ? 'Destroying…' : 'Destroy'}
            </Button>
          </div>
        )}
      </div>

      {/* ── Body: sidebar + content ── */}
      <div className="flex gap-6 min-h-[600px]">

        {/* Left sidebar nav */}
        <aside className="w-52 shrink-0">
          <nav className="space-y-5">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] px-3 mb-1.5">{group.label}</p>
                <div className="space-y-0.5">
                  {group.items.map(({ id: sid, label, icon: Icon }) => (
                    <button
                      key={sid}
                      onClick={() => setSection(sid)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left',
                        section === sid
                          ? 'bg-blue-600 text-white font-medium shadow-sm'
                          : 'text-[var(--text-muted)] hover:bg-[var(--border)] hover:text-[var(--text)]'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{label}</span>
                      {section === sid && <ChevronRight className="w-3.5 h-3.5 ml-auto shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Right content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >

              {/* ═══════════════════════════════════════ OVERVIEW */}
              {section === 'overview' && (
                <div className="space-y-5">
                  {/* Quick stat cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: Cpu,          color: 'text-blue-400',   bg: 'bg-blue-500/20',   label: 'vCPU',      value: vmLoading ? null : (vm?.cpunumber ?? '—'),                                     sub: 'cores' },
                      { icon: MemoryStick,  color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Memory',    value: vmLoading ? null : (vm?.memory ? `${Math.round(vm.memory / 1024)}` : '—'),      sub: 'GB RAM' },
                      { icon: Globe,        color: 'text-green-400',  bg: 'bg-green-500/20',  label: 'Private IP',value: vmLoading ? null : (vm?.ipaddress || '—'),                                      sub: 'address', mono: true },
                      { icon: Activity,     color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'CPU Usage', value: vmLoading ? null : `${cpuPct}%`,                                                sub: 'current' },
                    ].map(({ icon: Icon, color, bg, label, value, sub, mono }) => (
                      <Card key={label}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={cn('p-1.5 rounded-lg', bg)}><Icon className={cn('w-4 h-4', color)} /></div>
                            <span className="text-xs text-[var(--text-muted)]">{label}</span>
                          </div>
                          {vmLoading
                            ? <div className="h-7 w-16 rounded bg-[var(--border)] animate-pulse" />
                            : <><p className={cn('text-2xl font-bold text-[var(--text)]', mono && 'text-sm font-mono')}>{value}</p><p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p></>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {/* Resource usage */}
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Activity className="w-4 h-4" /> Resource Usage</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {vmLoading ? <Spinner /> : <>
                        <UsageBar label="CPU Usage" percent={cpuPct} color="bg-blue-500" />
                        <UsageBar label={`Memory (${memUsedMB} / ${memTotalMB} MB)`} percent={memPct} color="bg-purple-500" />
                      </>}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ═══════════════════════════════════════ DETAILS */}
              {section === 'details' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <Card>
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Info className="w-4 h-4" /> General</CardTitle></CardHeader>
                    <CardContent>
                      {vmLoading ? <Spinner /> : <>
                        <InfoRow label="Name" value={vm?.displayname || vm?.name} />
                        <InfoRow label="ID" value={vm?.id} mono />
                        <InfoRow label="State" value={<Badge variant={STATE_VARIANT[vm?.state] || 'secondary'}>{vm?.state}</Badge>} />
                        <InfoRow label="OS Type" value={vm?.ostypename} />
                        <InfoRow label="Hypervisor" value={vm?.hypervisor} />
                        <InfoRow label="Host" value={vm?.hostname} />
                        <InfoRow label="Created" value={vm?.created ? new Date(vm.created).toLocaleString() : '—'} />
                      </>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Server className="w-4 h-4" /> Configuration</CardTitle></CardHeader>
                    <CardContent>
                      {vmLoading ? <Spinner /> : <>
                        <InfoRow label="Service Offering" value={vm?.serviceofferingname} />
                        <InfoRow label="Template" value={vm?.templatename} />
                        <InfoRow label="Zone" value={vm?.zonename} />
                        <InfoRow label="Account" value={vm?.account} />
                        <InfoRow label="Domain" value={vm?.domain} />
                        <InfoRow label="HA Enabled" value={vm?.haenable ? <Badge variant="success">Yes</Badge> : <Badge variant="secondary">No</Badge>} />
                      </>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Network className="w-4 h-4" /> Network</CardTitle></CardHeader>
                    <CardContent>
                      {vmLoading ? <Spinner /> : <>
                        <InfoRow label="Private IP" value={vm?.ipaddress} mono />
                        <InfoRow label="Public IP" value={vm?.publicip} mono />
                        <InfoRow label="Net Read" value={vm?.networkkbsread != null ? `${(vm.networkkbsread / 1024).toFixed(1)} MB` : '—'} />
                        <InfoRow label="Net Write" value={vm?.networkkbswrite != null ? `${(vm.networkkbswrite / 1024).toFixed(1)} MB` : '—'} />
                      </>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4" /> Performance</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {vmLoading ? <Spinner /> : <>
                        <UsageBar label="CPU" percent={cpuPct} color="bg-blue-500" />
                        <UsageBar label={`Memory (${memUsedMB}/${memTotalMB} MB)`} percent={memPct} color="bg-purple-500" />
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="text-center p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                            <p className="text-xl font-bold text-[var(--text)]">{vm?.diskioread ?? '—'}</p>
                            <p className="text-xs text-[var(--text-muted)]">Disk Read ops</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                            <p className="text-xl font-bold text-[var(--text)]">{vm?.diskiowrite ?? '—'}</p>
                            <p className="text-xs text-[var(--text-muted)]">Disk Write ops</p>
                          </div>
                        </div>
                      </>}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ═══════════════════════════════════════ METRICS */}
              {section === 'metrics' && (
                <Card>
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Live Metrics</CardTitle></CardHeader>
                  <CardContent className="space-y-5">
                    {vmLoading ? <Spinner /> : <>
                      <UsageBar label="CPU Usage" percent={cpuPct} color="bg-blue-500" />
                      <UsageBar label={`Memory (${memUsedMB} / ${memTotalMB} MB)`} percent={memPct} color="bg-purple-500" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        {[
                          { label: 'Net Read',    value: vm?.networkkbsread != null  ? `${(vm.networkkbsread  / 1024).toFixed(1)} MB` : '—', color: 'text-blue-400' },
                          { label: 'Net Write',   value: vm?.networkkbswrite != null ? `${(vm.networkkbswrite / 1024).toFixed(1)} MB` : '—', color: 'text-green-400' },
                          { label: 'Disk Read',   value: `${vm?.diskioread  ?? '—'} ops`, color: 'text-purple-400' },
                          { label: 'Disk Write',  value: `${vm?.diskiowrite ?? '—'} ops`, color: 'text-orange-400' },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="text-center p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                            <p className={cn('text-2xl font-bold', color)}>{value}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">{label}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-center text-[var(--text-muted)]">Auto-refreshes every 15s</p>
                    </>}
                  </CardContent>
                </Card>
              )}

              {/* ═══════════════════════════════════════ VOLUMES */}
              {section === 'volumes' && (
                <div className="space-y-3">
                  {volLoading ? <Spinner /> : volumes.length === 0
                    ? <EmptyState icon={HardDrive} text="No volumes attached" />
                    : volumes.map((vol) => (
                      <Card key={vol.id}>
                        <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20 shrink-0"><HardDrive className="w-4 h-4 text-blue-400" /></div>
                            <div>
                              <p className="font-medium text-[var(--text)] text-sm">{vol.name}</p>
                              <p className="text-xs text-[var(--text-muted)] font-mono">{vol.id?.slice(0, 12)}…</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={vol.state === 'Ready' ? 'success' : 'secondary'}>{vol.state}</Badge>
                            <Badge variant="secondary">{vol.type}</Badge>
                            <span className="text-sm text-[var(--text-muted)]">{vol.size ? `${Math.round(vol.size / 1073741824)} GB` : '—'}</span>
                            {vol.type !== 'ROOT' && (
                              <Button variant="outline" size="sm" className="gap-1 text-[var(--text-muted)] border-[var(--border)] text-xs h-7"
                                onClick={() => { if (!confirm('Detach this volume?')) return; fetch(`/api/storage/volumes/${vol.id}/detach`, { method: 'POST' }).then((r) => { if (r.ok) { toast.success('Detached'); mutateVols() } else { toast.error('Failed') } }) }}>
                                <Unplug className="w-3 h-3" /> Detach
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}

              {/* ═══════════════════════════════════════ NICs */}
              {section === 'nics' && (
                <div className="space-y-3">
                  {nicLoading ? <Spinner /> : nics.length === 0
                    ? <EmptyState icon={Wifi} text="No NICs found" />
                    : nics.map((nic, i) => (
                      <Card key={nic.id || i}>
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-green-500/20"><Wifi className="w-4 h-4 text-green-400" /></div>
                              <span className="font-medium text-sm text-[var(--text)]">NIC {i + 1}</span>
                              {nic.isdefault && <Badge variant="info">Default</Badge>}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4">
                            <InfoRow label="IP Address" value={nic.ipaddress} mono />
                            <InfoRow label="Network" value={nic.networkname} />
                            <InfoRow label="MAC Address" value={nic.macaddress} mono />
                            <InfoRow label="Netmask" value={nic.netmask} mono />
                            <InfoRow label="Gateway" value={nic.gateway} mono />
                            <InfoRow label="Type" value={nic.type} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}

              {/* ═══════════════════════════════════════ SNAPSHOTS */}
              {section === 'snapshots' && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Camera className="w-4 h-4" /> Create Snapshot</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input placeholder="Snapshot name…" value={snapshotName} onChange={(e) => setSnapshotName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createSnapshot()} className="flex-1" />
                        <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer whitespace-nowrap">
                          <input type="checkbox" checked={snapshotMemory} onChange={(e) => setSnapshotMemory(e.target.checked)} className="rounded" />Include memory
                        </label>
                        <Button onClick={createSnapshot} disabled={creatingSnap} className="gap-2 shrink-0">
                          {creatingSnap ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  {snapLoading ? <Spinner /> : snapshots.length === 0
                    ? <EmptyState icon={Camera} text="No snapshots found" />
                    : snapshots.map((snap) => (
                      <Card key={snap.id}>
                        <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/20 shrink-0"><Camera className="w-4 h-4 text-purple-400" /></div>
                            <div>
                              <p className="font-medium text-[var(--text)] text-sm">{snap.name}</p>
                              <p className="text-xs text-[var(--text-muted)]">{snap.created ? new Date(snap.created).toLocaleString() : '—'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={snap.state === 'BackedUp' ? 'success' : 'secondary'}>{snap.state}</Badge>
                            {snap.type && <Badge variant="secondary">{snap.type}</Badge>}
                            <Button variant="outline" size="sm" className="gap-1 text-red-400 border-red-600/30 hover:bg-red-500/10 text-xs h-7"
                              onClick={() => { if (!confirm(`Delete "${snap.name}"?`)) return; fetch(`/api/compute/snapshots/${snap.id}`, { method: 'DELETE' }).then((r) => { if (r.ok) { toast.success('Deleted'); mutateSnaps() } else { toast.error('Failed') } }) }}>
                              <Trash2 className="w-3 h-3" /> Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}

              {/* ═══════════════════════════════════════ BACKUPS */}
              {section === 'backups' && <Card><CardContent><EmptyState icon={Archive} text="No backups configured" /></CardContent></Card>}

              {/* ═══════════════════════════════════════ SCHEDULES */}
              {section === 'schedules' && <Card><CardContent><EmptyState icon={CalendarDays} text="No schedules configured" /></CardContent></Card>}

              {/* ═══════════════════════════════════════ FIREWALL */}
              {section === 'firewall' && (
                <div className="space-y-4">
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                      <Input placeholder="Search rules…" value={fwSearch} onChange={(e) => setFwSearch(e.target.value)} className="pl-9 h-8 text-sm" />
                    </div>
                    <Button size="sm" onClick={() => setAddFwOpen(!addFwOpen)} className="gap-2 h-8 text-xs">
                      <Plus className="w-3.5 h-3.5" /> Add Firewall Rule
                    </Button>
                  </div>

                  {/* Add rule form */}
                  {addFwOpen && (
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <p className="text-sm font-medium text-[var(--text)]">New Firewall Rule</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Source CIDR</Label>
                            <Input value={fwForm.cidr} onChange={(e) => setFwForm(f => ({ ...f, cidr: e.target.value }))} placeholder="0.0.0.0/0" className="h-8 text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Protocol</Label>
                            <select value={fwForm.protocol} onChange={(e) => setFwForm(f => ({ ...f, protocol: e.target.value }))}
                              className="flex h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-xs text-[var(--text)]">
                              <option>TCP</option><option>UDP</option><option>ICMP</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Direction</Label>
                            <select value={fwForm.direction} onChange={(e) => setFwForm(f => ({ ...f, direction: e.target.value }))}
                              className="flex h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-xs text-[var(--text)]">
                              <option value="ingress">Ingress</option><option value="egress">Egress</option>
                            </select>
                          </div>
                          {fwForm.protocol !== 'ICMP' && <>
                            <div className="space-y-1">
                              <Label className="text-xs">Start Port</Label>
                              <Input value={fwForm.startport} onChange={(e) => setFwForm(f => ({ ...f, startport: e.target.value }))} placeholder="e.g. 22" className="h-8 text-xs" type="number" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">End Port</Label>
                              <Input value={fwForm.endport} onChange={(e) => setFwForm(f => ({ ...f, endport: e.target.value }))} placeholder="e.g. 22" className="h-8 text-xs" type="number" />
                            </div>
                          </>}
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => setAddFwOpen(false)} className="h-8 text-xs">Cancel</Button>
                          <Button size="sm" onClick={addFirewallRule} className="h-8 text-xs gap-1"><Plus className="w-3.5 h-3.5" /> Add Rule</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Rules table */}
                  <Card>
                    <CardContent className="p-0">
                      {fwLoading ? <Spinner /> : (() => {
                        const filtered = fwRules.filter((r) => !fwSearch || JSON.stringify(r).toLowerCase().includes(fwSearch.toLowerCase()))
                        return filtered.length === 0 ? (
                          <EmptyState icon={Shield} text="No firewall rules configured" />
                        ) : (
                          <>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                                    {['Source CIDR','Protocol','ICMP Type','ICMP Code','Start Port','End Port','Direction','Action'].map(h => (
                                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                  {filtered.map((rule, i) => (
                                    <tr key={rule.ruleid || i} className="hover:bg-[var(--bg)] transition-colors">
                                      <td className="px-4 py-3 font-mono text-xs text-[var(--text)]">{rule.cidr || rule.startcidr || '0.0.0.0/0'}</td>
                                      <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{rule.protocol?.toUpperCase()}</Badge></td>
                                      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{rule.icmptype ?? 'NA'}</td>
                                      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{rule.icmpcode ?? 'NA'}</td>
                                      <td className="px-4 py-3 text-xs font-mono text-[var(--text)]">{rule.startport ?? 'NA'}</td>
                                      <td className="px-4 py-3 text-xs font-mono text-[var(--text)]">{rule.endport ?? 'NA'}</td>
                                      <td className="px-4 py-3"><Badge variant={rule.direction === 'egress' ? 'warning' : 'info'} className="text-xs capitalize">{rule.direction || 'ingress'}</Badge></td>
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => { if (!confirm('Delete this rule?')) return; fetch(`/api/compute/vms/${id}/firewall/${rule.ruleid}`, { method: 'DELETE' }).then((r) => { if (r.ok) { toast.success('Rule deleted'); mutateFW() } else { toast.error('Failed to delete') } }) }}
                                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                          title="Delete rule"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <p className="px-4 py-2 text-xs text-[var(--text-muted)] border-t border-[var(--border)]">Showing {filtered.length} of {fwRules.length} rules</p>
                          </>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ═══════════════════════════════════════ PORT FORWARDING */}
              {section === 'portforwarding' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                      <Input placeholder="Search rules…" value={pfSearch} onChange={(e) => setPfSearch(e.target.value)} className="pl-9 h-8 text-sm" />
                    </div>
                    <Button size="sm" onClick={() => setAddPfOpen(!addPfOpen)} className="gap-2 h-8 text-xs">
                      <Plus className="w-3.5 h-3.5" /> Add Rule
                    </Button>
                  </div>

                  {addPfOpen && (
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <p className="text-sm font-medium text-[var(--text)]">New Port Forwarding Rule</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Public Port</Label>
                            <Input value={pfForm.publicport} onChange={(e) => setPfForm(f => ({ ...f, publicport: e.target.value }))} placeholder="e.g. 8080" className="h-8 text-xs" type="number" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Private Port</Label>
                            <Input value={pfForm.privateport} onChange={(e) => setPfForm(f => ({ ...f, privateport: e.target.value }))} placeholder="e.g. 80" className="h-8 text-xs" type="number" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Protocol</Label>
                            <select value={pfForm.protocol} onChange={(e) => setPfForm(f => ({ ...f, protocol: e.target.value }))}
                              className="flex h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-xs text-[var(--text)]">
                              <option>TCP</option><option>UDP</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => setAddPfOpen(false)} className="h-8 text-xs">Cancel</Button>
                          <Button size="sm" onClick={addPortForwardingRule} className="h-8 text-xs gap-1"><Plus className="w-3.5 h-3.5" /> Add Rule</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardContent className="p-0">
                      {pfLoading ? <Spinner /> : (() => {
                        const filtered = pfRules.filter((r) => !pfSearch || JSON.stringify(r).toLowerCase().includes(pfSearch.toLowerCase()))
                        return filtered.length === 0 ? (
                          <EmptyState icon={Layers} text="No port forwarding rules configured" />
                        ) : (
                          <>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                                    {['Public Port','Private Port','Protocol','VM Guest IP','Public IP','Status','Action'].map(h => (
                                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                  {filtered.map((rule, i) => (
                                    <tr key={rule.id || i} className="hover:bg-[var(--bg)] transition-colors">
                                      <td className="px-4 py-3 font-mono text-xs text-[var(--text)]">{rule.publicport}/{rule.publicendport || rule.publicport}</td>
                                      <td className="px-4 py-3 font-mono text-xs text-[var(--text)]">{rule.privateport}/{rule.privateendport || rule.privateport}</td>
                                      <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{rule.protocol?.toUpperCase()}</Badge></td>
                                      <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">{rule.vmguestip || vm?.ipaddress || '—'}</td>
                                      <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">{rule.ipaddress || '—'}</td>
                                      <td className="px-4 py-3">
                                        <Badge variant={rule.state === 'Active' ? 'success' : 'secondary'} className="gap-1 text-xs">
                                          {rule.state === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />}
                                          {rule.state || 'Active'}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => { if (!confirm('Delete this rule?')) return; fetch(`/api/compute/vms/${id}/portforwarding/${rule.id}`, { method: 'DELETE' }).then((r) => { if (r.ok) { toast.success('Rule deleted'); mutatePF() } else { toast.error('Failed to delete') } }) }}
                                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                          title="Delete rule"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <p className="px-4 py-2 text-xs text-[var(--text-muted)] border-t border-[var(--border)]">Showing {filtered.length} of {pfRules.length} rules</p>
                          </>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ═══════════════════════════════════════ SETTINGS */}
              {section === 'settings' && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Settings className="w-4 h-4" /> Instance Settings</CardTitle></CardHeader>
                    <CardContent className="divide-y divide-[var(--border)]">
                      {[
                        { label: 'Change Hostname', desc: 'Update the display name of this instance', icon: Server, action: 'Change' },
                        { label: 'Reset Password', desc: 'Generate a new root/admin password', icon: Lock, action: 'Reset' },
                        { label: 'Change Service Offering', desc: 'Scale CPU and memory for this instance', icon: Cpu, action: 'Change' },
                        { label: 'Change OS', desc: 'Reinstall with a different template', icon: HardDrive, action: 'Change' },
                        { label: 'Manage SSH Keys', desc: 'Add or remove SSH key pairs', icon: Key, action: 'Manage' },
                        { label: 'User Data', desc: 'View or update cloud-init user data', icon: Info, action: 'Edit' },
                      ].map(({ label, desc, icon: Icon, action }) => (
                        <div key={label} className="flex items-center justify-between py-4 gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] shrink-0">
                              <Icon className="w-4 h-4 text-[var(--text-muted)]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[var(--text)]">{label}</p>
                              <p className="text-xs text-[var(--text-muted)]">{desc}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="shrink-0 h-8 text-xs">{action}</Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-red-600/30">
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2 text-red-400"><Trash2 className="w-4 h-4" /> Danger Zone</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between gap-4 py-2">
                        <div>
                          <p className="text-sm font-medium text-[var(--text)]">Destroy Instance</p>
                          <p className="text-xs text-[var(--text-muted)]">Permanently delete this instance and all attached data</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleAction('destroy')} disabled={!!actionLoading}
                          className="shrink-0 h-8 text-xs gap-1 border-red-600/40 text-red-400 hover:bg-red-500/10">
                          <Trash2 className="w-3.5 h-3.5" /> Destroy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ═══════════════════════════════════════ EVENTS */}
              {section === 'events' && (
                <div className="space-y-2">
                  {evtLoading ? <Spinner /> : events.length === 0
                    ? <EmptyState icon={Clock} text="No events found" />
                    : events.map((evt, i) => {
                      const isError = evt.level === 'ERROR'
                      const isWarn  = evt.level === 'WARN'
                      return (
                        <div key={evt.id || i} className={cn('flex items-start gap-3 p-4 rounded-xl border',
                          isError ? 'border-red-600/30 bg-red-500/5' : isWarn ? 'border-yellow-600/30 bg-yellow-500/5' : 'border-[var(--border)] bg-[var(--card)]')}>
                          <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', isError ? 'bg-red-500' : isWarn ? 'bg-yellow-500' : 'bg-blue-500')} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <p className="text-sm font-medium text-[var(--text)] truncate">{evt.type}</p>
                              <span className="text-xs text-[var(--text-muted)] shrink-0">{evt.created ? new Date(evt.created).toLocaleString() : '—'}</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] truncate">{evt.description}</p>
                            {evt.account && <p className="text-xs text-[var(--text-muted)] mt-0.5">by {evt.account}</p>}
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
