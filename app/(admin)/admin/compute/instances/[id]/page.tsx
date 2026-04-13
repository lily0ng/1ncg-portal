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
  LayoutGrid, List, SlidersHorizontal, CheckCircle2,
  FileCode, Users, ChevronRight,
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

// ── Nav sections ─────────────────────────────────────────────────────────
type Section =
  | 'overview' | 'details' | 'metrics'
  | 'volumes' | 'snapshots' | 'backups' | 'schedules'
  | 'nics' | 'firewall' | 'portforwarding' | 'remotevpn' | 'networks'
  | 'changeplan' | 'changehostname' | 'changeos' | 'resetpassword'
  | 'startupscript' | 'sshkeys'
  | 'events' | 'settings'

interface NavItem { id: Section; label: string; icon: React.ElementType }
interface NavGroup { items: NavItem[]; dividerAfter?: boolean }

const NAV: NavGroup[] = [
  {
    dividerAfter: true,
    items: [
      { id: 'overview',      label: 'Overview',        icon: Activity },
      { id: 'details',       label: 'Details',          icon: Info },
      { id: 'metrics',       label: 'Metrics',          icon: BarChart3 },
    ],
  },
  {
    dividerAfter: true,
    items: [
      { id: 'volumes',       label: 'Volume',           icon: HardDrive },
      { id: 'snapshots',     label: 'Snapshots',        icon: Camera },
      { id: 'backups',       label: 'Backups',          icon: Archive },
      { id: 'schedules',     label: 'Schedules',        icon: CalendarDays },
    ],
  },
  {
    dividerAfter: true,
    items: [
      { id: 'nics',          label: 'NICs',             icon: Wifi },
      { id: 'firewall',      label: 'Firewall',         icon: Shield },
      { id: 'portforwarding',label: 'Port Forwarding',  icon: Layers },
      { id: 'remotevpn',     label: 'Remote Access VPNs', icon: Lock },
      { id: 'networks',      label: 'Networks',         icon: Network },
    ],
  },
  {
    dividerAfter: true,
    items: [
      { id: 'changeplan',    label: 'Change Plan',      icon: Cpu },
      { id: 'changehostname',label: 'Change Hostname',  icon: Server },
      { id: 'changeos',      label: 'Change OS',        icon: HardDrive },
      { id: 'resetpassword', label: 'Reset Password',   icon: Key },
      { id: 'startupscript', label: 'Change Startup Script', icon: FileCode },
      { id: 'sshkeys',       label: 'SSH Keys',         icon: Key },
    ],
  },
  {
    items: [
      { id: 'events',        label: 'Events',           icon: Clock },
      { id: 'settings',      label: 'Settings',         icon: Settings },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────
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
  const bar = pct > 85 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : color
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span className="font-semibold text-[var(--text)]">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', bar)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function Spinner() {
  return <div className="flex justify-center py-12"><div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
}

function EmptyState({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-14 h-14 rounded-full bg-[var(--border)] flex items-center justify-center">
        <Icon className="w-6 h-6 text-[var(--text-muted)]" />
      </div>
      <p className="text-sm font-medium text-[var(--text)]">{title}</p>
      {sub && <p className="text-xs text-[var(--text-muted)]">{sub}</p>}
    </div>
  )
}

// ── Toolbar used by Firewall + Port Forwarding ────────────────────────────
function SectionToolbar({
  title, addLabel, search, onSearch, onAdd, onRefresh, count,
}: {
  title: string; addLabel: string; search: string
  onSearch: (v: string) => void; onAdd: () => void; onRefresh: () => void; count: number
}) {
  return (
    <div className="space-y-3">
      {/* heading row */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--text)]">{title}</h2>
        <button onClick={onAdd} className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors">
          + {addLabel}
        </button>
      </div>
      {/* search + view controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search"
            className="w-full h-8 pl-9 pr-3 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onRefresh} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border)] transition-colors" title="Refresh"><RefreshCw className="w-4 h-4" /></button>
          <button className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border)] transition-colors" title="Filter"><SlidersHorizontal className="w-4 h-4" /></button>
          <button className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border)] transition-colors" title="Grid"><LayoutGrid className="w-4 h-4" /></button>
          <button className="p-1.5 rounded-lg bg-blue-600 text-white" title="List"><List className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  )
}

// ── Flat table wrapper ───────────────────────────────────────────────────
function FlatTable({ headers, children, footer }: { headers: string[]; children: React.ReactNode; footer?: string }) {
  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--bg)]">
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--border)]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">{children}</tbody>
      </table>
      {footer && <div className="px-4 py-2.5 text-xs text-[var(--text-muted)] border-t border-[var(--border)] bg-[var(--bg)]">{footer}</div>}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════
export default function InstanceDetailPage() {
  const params   = useParams()
  const router   = useRouter()
  const id       = (params?.id ?? '') as string

  const [section,        setSection]        = useState<Section>('overview')
  const [actionLoading,  setActionLoading]  = useState<string | null>(null)
  const [snapName,       setSnapName]       = useState('')
  const [snapMem,        setSnapMem]        = useState(false)
  const [creatingSnap,   setCreatingSnap]   = useState(false)
  const [fwSearch,       setFwSearch]       = useState('')
  const [pfSearch,       setPfSearch]       = useState('')
  const [addFwOpen,      setAddFwOpen]      = useState(false)
  const [addPfOpen,      setAddPfOpen]      = useState(false)
  const [fwForm,         setFwForm]         = useState({ cidr: '0.0.0.0/0', protocol: 'TCP', startport: '', endport: '', direction: 'ingress' })
  const [pfForm,         setPfForm]         = useState({ publicport: '', privateport: '', protocol: 'TCP' })

  // ── SWR ────────────────────────────────────────────────────────────────
  const { data: vmData,   error: vmError, isLoading: vmLoading, mutate: mutateVM } =
    useSWR<{ vm: any }>(`/api/compute/vms/${id}`, fetcher, { refreshInterval: 15000 })
  const { data: volData,  isLoading: volLoading, mutate: mutateVols }  = useSWR<{ volumes: any[] }>(`/api/storage/volumes?virtualmachineid=${id}`, fetcher)
  const { data: snapData, isLoading: snapLoading, mutate: mutateSnaps }= useSWR<{ snapshots: any[] }>(`/api/compute/snapshots?virtualmachineid=${id}`, fetcher)
  const { data: evtData,  isLoading: evtLoading }                      = useSWR<{ events: any[] }>(`/api/events?resourceid=${id}&pagesize=50`, fetcher, { refreshInterval: 30000 })
  const { data: fwData,   isLoading: fwLoading,  mutate: mutateFW  }  = useSWR<{ rules: any[] }>(`/api/compute/vms/${id}/firewall`, fetcher)
  const { data: pfData,   isLoading: pfLoading,  mutate: mutatePF  }  = useSWR<{ rules: any[] }>(`/api/compute/vms/${id}/portforwarding`, fetcher)
  const { data: nicData,  isLoading: nicLoading }                      = useSWR<{ nics: any[] }>(`/api/compute/vms/${id}/nics`, fetcher)

  const vm        = vmData?.vm
  const volumes   = volData?.volumes   || []
  const snapshots = snapData?.snapshots|| []
  const events    = evtData?.events    || []
  const fwRules   = fwData?.rules      || []
  const pfRules   = pfData?.rules      || []
  const nics      = nicData?.nics      || []

  const memTotalMB = vm?.memory ?? 0
  const memUsedMB  = vm ? Math.max(0, memTotalMB - Math.round((vm.memoryintfreekbs ?? 0) / 1024)) : 0
  const memPct     = memTotalMB > 0 ? (memUsedMB / memTotalMB) * 100 : 0
  const cpuPct     = parseFloat(vm?.cpuused?.replace('%', '') ?? '0')

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleAction = async (action: string) => {
    if (action === 'destroy' && !confirm(`Destroy "${vm?.displayname || vm?.name}"? Cannot be undone.`)) return
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
    if (!snapName.trim()) { toast.error('Enter a snapshot name'); return }
    setCreatingSnap(true)
    try {
      const res = await fetch('/api/compute/snapshots', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ virtualmachineid: id, name: snapName, snapshotmemory: snapMem }),
      })
      if (!res.ok) throw new Error('Failed to create snapshot')
      toast.success('Snapshot initiated'); setSnapName(''); mutateSnaps()
    } catch (err: any) { toast.error(err.message) }
    finally { setCreatingSnap(false) }
  }

  const addFwRule = async () => {
    if (!fwForm.startport && fwForm.protocol !== 'ICMP') { toast.error('Start port required'); return }
    try {
      const res = await fetch(`/api/compute/vms/${id}/firewall`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fwForm) })
      if (!res.ok) throw new Error('Failed to add rule')
      toast.success('Firewall rule added'); setAddFwOpen(false); mutateFW()
      setFwForm({ cidr: '0.0.0.0/0', protocol: 'TCP', startport: '', endport: '', direction: 'ingress' })
    } catch (err: any) { toast.error(err.message) }
  }

  const addPfRule = async () => {
    if (!pfForm.publicport || !pfForm.privateport) { toast.error('Both ports required'); return }
    try {
      const res = await fetch(`/api/compute/vms/${id}/portforwarding`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...pfForm, virtualmachineid: id }) })
      if (!res.ok) throw new Error('Failed to add rule')
      toast.success('Port forwarding rule added'); setAddPfOpen(false); mutatePF()
      setPfForm({ publicport: '', privateport: '', protocol: 'TCP' })
    } catch (err: any) { toast.error(err.message) }
  }

  if (vmError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-[var(--text-muted)]">Failed to load instance</p>
        <Button onClick={() => mutateVM()}><RefreshCw className="w-4 h-4 mr-2" /> Retry</Button>
      </div>
    )
  }

  // ── Get current nav item label ──────────────────────────────────────────
  const activeLabel = NAV.flatMap((g) => g.items).find((i) => i.id === section)?.label ?? ''

  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-4">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text)]">
        <ArrowLeft className="w-4 h-4" /> Back to Instances
      </Button>

      {/* ── VM header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 shrink-0">
            <Server className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            {vmLoading
              ? <div className="space-y-2"><div className="h-6 w-52 rounded bg-[var(--border)] animate-pulse" /><div className="h-4 w-36 rounded bg-[var(--border)] animate-pulse" /></div>
              : <>
                  <h1 className="text-xl font-bold text-[var(--text)]">{vm?.displayname || vm?.name || id}</h1>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge variant={STATE_VARIANT[vm?.state] || 'secondary'}>{vm?.state || '—'}</Badge>
                    <span className="text-xs text-[var(--text-muted)] font-mono">{id.slice(0, 12)}…</span>
                    {vm?.zonename && <span className="text-xs text-[var(--text-muted)]">· {vm.zonename}</span>}
                  </div>
                </>}
          </div>
        </div>
        {vm && (
          <div className="flex items-center gap-2 flex-wrap">
            {vm.state === 'Stopped' && (
              <Button variant="outline" size="sm" onClick={() => handleAction('start')} disabled={!!actionLoading} className="gap-1.5 border-green-600/40 text-green-400 hover:bg-green-500/10 text-xs">
                <Play className="w-3.5 h-3.5" />{actionLoading === 'start' ? 'Starting…' : 'Start'}
              </Button>
            )}
            {vm.state === 'Running' && (<>
              <Button variant="outline" size="sm" onClick={() => handleAction('stop')} disabled={!!actionLoading} className="gap-1.5 border-yellow-600/40 text-yellow-400 hover:bg-yellow-500/10 text-xs">
                <Square className="w-3.5 h-3.5" />{actionLoading === 'stop' ? 'Stopping…' : 'Stop'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleAction('reboot')} disabled={!!actionLoading} className="gap-1.5 border-blue-600/40 text-blue-400 hover:bg-blue-500/10 text-xs">
                <RotateCcw className="w-3.5 h-3.5" />{actionLoading === 'reboot' ? 'Rebooting…' : 'Reboot'}
              </Button>
            </>)}
            <Button variant="outline" size="sm" onClick={() => window.open(`/api/compute/vms/${id}/console`, '_blank')} className="gap-1.5 border-purple-600/40 text-purple-400 hover:bg-purple-500/10 text-xs">
              <Terminal className="w-3.5 h-3.5" /> Console
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAction('destroy')} disabled={!!actionLoading} className="gap-1.5 border-red-600/40 text-red-400 hover:bg-red-500/10 text-xs">
              <Trash2 className="w-3.5 h-3.5" />{actionLoading === 'destroy' ? 'Destroying…' : 'Destroy'}
            </Button>
          </div>
        )}
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="flex gap-0 min-h-[600px]">

        {/* ── Left sidebar nav ─────────────────────────────────────── */}
        <aside className="w-52 shrink-0 border-r border-[var(--border)] pr-0 mr-6">
          <nav>
            {NAV.map((group, gi) => (
              <div key={gi}>
                {group.items.map(({ id: sid, label, icon: Icon }) => (
                  <button
                    key={sid}
                    onClick={() => setSection(sid)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-all text-left relative',
                      section === sid
                        ? 'text-[var(--text)] font-medium bg-blue-50/50 dark:bg-blue-500/10'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]'
                    )}
                  >
                    {section === sid && (
                      <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600 rounded-r-full" />
                    )}
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
                {group.dividerAfter && <div className="my-1 border-b border-[var(--border)]" />}
              </div>
            ))}
          </nav>
        </aside>

        {/* ── Right content ────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={section} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>

              {/* ═══ OVERVIEW ═══ */}
              {section === 'overview' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: Cpu,         color: 'text-blue-400',   bg: 'bg-blue-500/20',   label: 'vCPU',      value: vmLoading ? null : (vm?.cpunumber ?? '—'), sub: 'cores' },
                      { icon: MemoryStick, color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Memory',    value: vmLoading ? null : (vm?.memory ? `${Math.round(vm.memory / 1024)}` : '—'), sub: 'GB RAM' },
                      { icon: Globe,       color: 'text-green-400',  bg: 'bg-green-500/20',  label: 'Private IP',value: vmLoading ? null : (vm?.ipaddress || '—'), sub: 'address', mono: true },
                      { icon: Activity,    color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'CPU Usage', value: vmLoading ? null : `${cpuPct}%`, sub: 'current' },
                    ].map(({ icon: Icon, color, bg, label, value, sub, mono }) => (
                      <Card key={label}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={cn('p-1.5 rounded-lg', bg)}><Icon className={cn('w-4 h-4', color)} /></div>
                            <span className="text-xs text-[var(--text-muted)]">{label}</span>
                          </div>
                          {vmLoading ? <div className="h-7 w-14 rounded bg-[var(--border)] animate-pulse" /> : <>
                            <p className={cn('text-2xl font-bold text-[var(--text)]', mono && 'text-sm font-mono')}>{value}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>
                          </>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Card>
                    <CardHeader><CardTitle className="text-sm">Resource Usage</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {vmLoading ? <Spinner /> : <>
                        <UsageBar label="CPU Usage" percent={cpuPct} color="bg-blue-500" />
                        <UsageBar label={`Memory (${memUsedMB} / ${memTotalMB} MB)`} percent={memPct} color="bg-purple-500" />
                      </>}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ═══ DETAILS ═══ */}
              {section === 'details' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <Card>
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Info className="w-4 h-4" />General</CardTitle></CardHeader>
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
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Server className="w-4 h-4" />Configuration</CardTitle></CardHeader>
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
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Network className="w-4 h-4" />Network</CardTitle></CardHeader>
                    <CardContent>
                      {vmLoading ? <Spinner /> : <>
                        <InfoRow label="Private IP" value={vm?.ipaddress} mono />
                        <InfoRow label="Public IP"  value={vm?.publicip} mono />
                        <InfoRow label="Net Read"   value={vm?.networkkbsread  != null ? `${(vm.networkkbsread  / 1024).toFixed(1)} MB` : '—'} />
                        <InfoRow label="Net Write"  value={vm?.networkkbswrite != null ? `${(vm.networkkbswrite / 1024).toFixed(1)} MB` : '—'} />
                      </>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4" />Performance</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {vmLoading ? <Spinner /> : <>
                        <UsageBar label="CPU" percent={cpuPct} color="bg-blue-500" />
                        <UsageBar label={`Memory ${memUsedMB}/${memTotalMB} MB`} percent={memPct} color="bg-purple-500" />
                        <div className="grid grid-cols-2 gap-3 pt-1">
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

              {/* ═══ METRICS ═══ */}
              {section === 'metrics' && (
                <Card>
                  <CardHeader><CardTitle className="text-sm">Live Metrics</CardTitle></CardHeader>
                  <CardContent className="space-y-5">
                    {vmLoading ? <Spinner /> : <>
                      <UsageBar label="CPU Usage" percent={cpuPct} color="bg-blue-500" />
                      <UsageBar label={`Memory (${memUsedMB} / ${memTotalMB} MB)`} percent={memPct} color="bg-purple-500" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                        {[
                          { label: 'Net Read',  value: vm?.networkkbsread  != null ? `${(vm.networkkbsread  / 1024).toFixed(1)} MB` : '—', color: 'text-blue-400' },
                          { label: 'Net Write', value: vm?.networkkbswrite != null ? `${(vm.networkkbswrite / 1024).toFixed(1)} MB` : '—', color: 'text-green-400' },
                          { label: 'Disk Read', value: `${vm?.diskioread  ?? '—'} ops`, color: 'text-purple-400' },
                          { label: 'Disk Write',value: `${vm?.diskiowrite ?? '—'} ops`, color: 'text-orange-400' },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="text-center p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                            <p className={cn('text-xl font-bold', color)}>{value}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">{label}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-center text-[var(--text-muted)]">Auto-refreshes every 15 s</p>
                    </>}
                  </CardContent>
                </Card>
              )}

              {/* ═══ VOLUMES ═══ */}
              {section === 'volumes' && (
                <div className="space-y-3">
                  {volLoading ? <Spinner /> : volumes.length === 0 ? <EmptyState icon={HardDrive} title="No volumes attached" /> :
                    volumes.map((vol) => (
                      <Card key={vol.id}>
                        <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20"><HardDrive className="w-4 h-4 text-blue-400" /></div>
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
                              <Button variant="outline" size="sm" className="gap-1 text-xs h-7"
                                onClick={() => { if (!confirm('Detach?')) return; fetch(`/api/storage/volumes/${vol.id}/detach`, { method: 'POST' }).then((r) => { if (r.ok) { toast.success('Detached'); mutateVols() } else toast.error('Failed') }) }}>
                                <Unplug className="w-3 h-3" /> Detach
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}

              {/* ═══ NICS ═══ */}
              {section === 'nics' && (
                <div className="space-y-3">
                  {nicLoading ? <Spinner /> : nics.length === 0 ? <EmptyState icon={Wifi} title="No NICs found" /> :
                    nics.map((nic, i) => (
                      <Card key={nic.id || i}>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 rounded-lg bg-green-500/20"><Wifi className="w-4 h-4 text-green-400" /></div>
                            <span className="font-medium text-sm text-[var(--text)]">NIC {i + 1}</span>
                            {nic.isdefault && <Badge variant="info">Default</Badge>}
                          </div>
                          <div className="grid grid-cols-2 gap-x-4">
                            <InfoRow label="IP Address"  value={nic.ipaddress}  mono />
                            <InfoRow label="Network"     value={nic.networkname} />
                            <InfoRow label="MAC Address" value={nic.macaddress} mono />
                            <InfoRow label="Netmask"     value={nic.netmask}    mono />
                            <InfoRow label="Gateway"     value={nic.gateway}    mono />
                            <InfoRow label="Type"        value={nic.type} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}

              {/* ═══ SNAPSHOTS ═══ */}
              {section === 'snapshots' && (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input placeholder="Snapshot name…" value={snapName} onChange={(e) => setSnapName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createSnapshot()} className="flex-1" />
                        <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer whitespace-nowrap">
                          <input type="checkbox" checked={snapMem} onChange={(e) => setSnapMem(e.target.checked)} className="rounded" />Include memory
                        </label>
                        <Button onClick={createSnapshot} disabled={creatingSnap} className="gap-2 shrink-0">
                          {creatingSnap ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  {snapLoading ? <Spinner /> : snapshots.length === 0 ? <EmptyState icon={Camera} title="No snapshots found" /> :
                    snapshots.map((snap) => (
                      <Card key={snap.id}>
                        <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/20"><Camera className="w-4 h-4 text-purple-400" /></div>
                            <div>
                              <p className="font-medium text-[var(--text)] text-sm">{snap.name}</p>
                              <p className="text-xs text-[var(--text-muted)]">{snap.created ? new Date(snap.created).toLocaleString() : '—'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={snap.state === 'BackedUp' ? 'success' : 'secondary'}>{snap.state}</Badge>
                            {snap.type && <Badge variant="secondary">{snap.type}</Badge>}
                            <Button variant="outline" size="sm" className="gap-1 text-red-400 border-red-600/30 hover:bg-red-500/10 text-xs h-7"
                              onClick={() => { if (!confirm(`Delete "${snap.name}"?`)) return; fetch(`/api/compute/snapshots/${snap.id}`, { method: 'DELETE' }).then((r) => { if (r.ok) { toast.success('Deleted'); mutateSnaps() } else toast.error('Failed') }) }}>
                              <Trash2 className="w-3 h-3" /> Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}

              {/* ═══ BACKUPS ═══ */}
              {section === 'backups' && <EmptyState icon={Archive} title="No backups configured" sub="Set up backup policies to protect your instance" />}

              {/* ═══ SCHEDULES ═══ */}
              {section === 'schedules' && <EmptyState icon={CalendarDays} title="No schedules configured" sub="Add schedules to automate operations on this instance" />}

              {/* ═══════════════════════════════ FIREWALL ═══════════════════════════════ */}
              {section === 'firewall' && (
                <div className="space-y-4">
                  <SectionToolbar
                    title="Firewall"
                    addLabel="Add A Firewall Rule"
                    search={fwSearch}
                    onSearch={setFwSearch}
                    onAdd={() => setAddFwOpen((v) => !v)}
                    onRefresh={() => mutateFW()}
                    count={fwRules.length}
                  />

                  {/* Add rule inline form */}
                  {addFwOpen && (
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <p className="text-sm font-semibold text-[var(--text)]">New Firewall Rule</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Source CIDR</Label>
                            <Input value={fwForm.cidr} onChange={(e) => setFwForm((f) => ({ ...f, cidr: e.target.value }))} placeholder="0.0.0.0/0" className="h-8 text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Protocol</Label>
                            <select value={fwForm.protocol} onChange={(e) => setFwForm((f) => ({ ...f, protocol: e.target.value }))} className="flex h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-xs text-[var(--text)]">
                              <option>TCP</option><option>UDP</option><option>ICMP</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Direction</Label>
                            <select value={fwForm.direction} onChange={(e) => setFwForm((f) => ({ ...f, direction: e.target.value }))} className="flex h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-xs text-[var(--text)]">
                              <option value="ingress">Ingress</option><option value="egress">Egress</option>
                            </select>
                          </div>
                          {fwForm.protocol !== 'ICMP' && (<>
                            <div className="space-y-1">
                              <Label className="text-xs">Start Port</Label>
                              <Input value={fwForm.startport} onChange={(e) => setFwForm((f) => ({ ...f, startport: e.target.value }))} placeholder="e.g. 22" className="h-8 text-xs" type="number" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">End Port</Label>
                              <Input value={fwForm.endport} onChange={(e) => setFwForm((f) => ({ ...f, endport: e.target.value }))} placeholder="e.g. 22" className="h-8 text-xs" type="number" />
                            </div>
                          </>)}
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => setAddFwOpen(false)} className="h-8 text-xs">Cancel</Button>
                          <Button size="sm" onClick={addFwRule} className="h-8 text-xs">Add Rule</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Firewall table */}
                  {fwLoading ? <Spinner /> : (() => {
                    const rows = fwRules.filter((r) => !fwSearch || JSON.stringify(r).toLowerCase().includes(fwSearch.toLowerCase()))
                    return rows.length === 0
                      ? <EmptyState icon={Shield} title="No firewall rules configured" sub="Add rules to control inbound/outbound traffic" />
                      : <FlatTable
                          headers={['Source CIDR', 'Protocol', 'ICMP type', 'ICMP Code', 'Start Port', 'End port', 'Action']}
                          footer={`Showing ${rows.length} of ${fwRules.length} Rows`}
                        >
                          {rows.map((rule, i) => (
                            <tr key={rule.ruleid || i} className="hover:bg-[var(--bg)] transition-colors">
                              <td className="px-4 py-3 text-sm font-mono text-[var(--text)]">{rule.cidr || rule.startcidr || '0.0.0.0/0'}</td>
                              <td className="px-4 py-3 text-sm text-[var(--text)]">{rule.protocol?.toUpperCase()}</td>
                              <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{rule.icmptype ?? 'NA'}</td>
                              <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{rule.icmpcode ?? 'NA'}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-[var(--text)]">{rule.startport ?? 'NA'}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-[var(--text)]">{rule.endport ?? 'NA'}</td>
                              <td className="px-4 py-3">
                                <button
                                  className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                                  onClick={() => { if (!confirm('Delete this rule?')) return; fetch(`/api/compute/vms/${id}/firewall/${rule.ruleid}`, { method: 'DELETE' }).then((r) => { if (r.ok) { toast.success('Rule deleted'); mutateFW() } else toast.error('Failed') }) }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </FlatTable>
                  })()}
                </div>
              )}

              {/* ═══════════════════════════════ PORT FORWARDING ═══════════════════════════════ */}
              {section === 'portforwarding' && (
                <div className="space-y-4">
                  <SectionToolbar
                    title="Port Forwarding"
                    addLabel="Add Rule"
                    search={pfSearch}
                    onSearch={setPfSearch}
                    onAdd={() => setAddPfOpen((v) => !v)}
                    onRefresh={() => mutatePF()}
                    count={pfRules.length}
                  />

                  {addPfOpen && (
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <p className="text-sm font-semibold text-[var(--text)]">New Port Forwarding Rule</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Public Port</Label>
                            <Input value={pfForm.publicport} onChange={(e) => setPfForm((f) => ({ ...f, publicport: e.target.value }))} placeholder="e.g. 8080" className="h-8 text-xs" type="number" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Private Port</Label>
                            <Input value={pfForm.privateport} onChange={(e) => setPfForm((f) => ({ ...f, privateport: e.target.value }))} placeholder="e.g. 80" className="h-8 text-xs" type="number" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Protocol</Label>
                            <select value={pfForm.protocol} onChange={(e) => setPfForm((f) => ({ ...f, protocol: e.target.value }))} className="flex h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-xs text-[var(--text)]">
                              <option>TCP</option><option>UDP</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => setAddPfOpen(false)} className="h-8 text-xs">Cancel</Button>
                          <Button size="sm" onClick={addPfRule} className="h-8 text-xs">Add Rule</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {pfLoading ? <Spinner /> : (() => {
                    const rows = pfRules.filter((r) => !pfSearch || JSON.stringify(r).toLowerCase().includes(pfSearch.toLowerCase()))
                    return rows.length === 0
                      ? <EmptyState icon={Layers} title="No port forwarding rules configured" sub="Add rules to forward public ports to this instance" />
                      : <FlatTable
                          headers={['Public Port', 'Private Port', 'Protocol', 'VM guest IP', 'Status', 'Action']}
                          footer={`Showing ${rows.length} of ${pfRules.length} Rows`}
                        >
                          {rows.map((rule, i) => (
                            <tr key={rule.id || i} className="hover:bg-[var(--bg)] transition-colors">
                              <td className="px-4 py-3 text-sm font-mono text-[var(--text)]">{rule.publicport}/{rule.publicendport || rule.publicport}</td>
                              <td className="px-4 py-3 text-sm font-mono text-[var(--text)]">{rule.privateport}/{rule.privateendport || rule.privateport}</td>
                              <td className="px-4 py-3 text-sm text-[var(--text)]">{rule.protocol?.toUpperCase()}</td>
                              <td className="px-4 py-3 text-sm font-mono text-[var(--text-muted)]">{rule.vmguestip || vm?.ipaddress || '—'}</td>
                              <td className="px-4 py-3">
                                <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400">
                                  <CheckCircle2 className="w-4 h-4" />{rule.state || 'Active'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                                  onClick={() => { if (!confirm('Delete this rule?')) return; fetch(`/api/compute/vms/${id}/portforwarding/${rule.id}`, { method: 'DELETE' }).then((r) => { if (r.ok) { toast.success('Rule deleted'); mutatePF() } else toast.error('Failed') }) }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </FlatTable>
                  })()}
                </div>
              )}

              {/* ═══ REMOTE ACCESS VPNs ═══ */}
              {section === 'remotevpn' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[var(--text)]">Remote Access VPNs</h2>
                    <button className="text-sm font-medium text-blue-500 hover:text-blue-400">+ Enable VPN</button>
                  </div>
                  <EmptyState icon={Lock} title="No VPN configured" sub="Enable remote access VPN to securely connect to this instance" />
                </div>
              )}

              {/* ═══ NETWORKS ═══ */}
              {section === 'networks' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[var(--text)]">Networks</h2>
                    <button className="text-sm font-medium text-blue-500 hover:text-blue-400">+ Add Network</button>
                  </div>
                  {vm?.publicip ? (
                    <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)]">
                      <div className="flex items-center gap-4 px-5 py-4">
                        <div className="p-2.5 rounded-full bg-blue-100 dark:bg-blue-500/20 shrink-0">
                          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[var(--text)]">{vm.publicip}</p>
                          <p className="text-sm text-[var(--text-muted)]">IP address</p>
                        </div>
                        {vm.networkname && (
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[var(--text)] truncate max-w-[200px]">{vm.networkname}</p>
                            <p className="text-xs text-[var(--text-muted)]">Network</p>
                          </div>
                        )}
                        <button className="text-sm font-semibold text-blue-500 hover:text-blue-400 ml-4 shrink-0">Manage</button>
                      </div>
                    </div>
                  ) : (
                    <EmptyState icon={Network} title="No networks attached" />
                  )}
                </div>
              )}

              {/* ═══ CHANGE PLAN ═══ */}
              {section === 'changeplan' && (
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-[var(--text)]">Change Plan</h2>
                  <Card>
                    <CardContent className="p-5 space-y-4">
                      <p className="text-sm text-[var(--text-muted)]">Current: <span className="font-medium text-[var(--text)]">{vm?.serviceofferingname || '—'}</span></p>
                      <p className="text-xs text-[var(--text-muted)]">Changing the service offering will resize CPU and memory. The instance must be stopped first.</p>
                      <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => toast.info('Stop the instance first to change the plan')}>
                        <Cpu className="w-4 h-4" /> Change Service Offering
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ═══ CHANGE HOSTNAME ═══ */}
              {section === 'changehostname' && (
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-[var(--text)]">Change Hostname</h2>
                  <Card>
                    <CardContent className="p-5 space-y-3">
                      <p className="text-sm text-[var(--text-muted)]">Current display name: <span className="font-medium text-[var(--text)]">{vm?.displayname || vm?.name || '—'}</span></p>
                      <div className="space-y-1 max-w-sm">
                        <Label className="text-xs">New Display Name</Label>
                        <Input placeholder="Enter new name…" className="h-8 text-sm" id="new-hostname" />
                      </div>
                      <Button size="sm" className="gap-2 text-xs" onClick={() => toast.info('Hostname update coming soon')}>
                        <Server className="w-4 h-4" /> Update Name
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ═══ CHANGE OS ═══ */}
              {section === 'changeos' && (
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-[var(--text)]">Change OS</h2>
                  <Card>
                    <CardContent className="p-5 space-y-3">
                      <p className="text-sm text-[var(--text-muted)]">Current: <span className="font-medium text-[var(--text)]">{vm?.ostypename || '—'}</span> · Template: <span className="font-medium text-[var(--text)]">{vm?.templatename || '—'}</span></p>
                      <p className="text-xs text-amber-500">⚠ Reinstalling the OS will destroy all data on the root disk.</p>
                      <Button variant="outline" size="sm" className="gap-2 text-xs border-amber-600/40 text-amber-500 hover:bg-amber-500/10" onClick={() => toast.info('Select a template to reinstall')}>
                        <HardDrive className="w-4 h-4" /> Reinstall / Change OS
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ═══ RESET PASSWORD ═══ */}
              {section === 'resetpassword' && (
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-[var(--text)]">Reset Password</h2>
                  <Card>
                    <CardContent className="p-5 space-y-3">
                      <p className="text-sm text-[var(--text-muted)]">This will generate a new root/admin password for the instance. The instance must support password reset.</p>
                      <Button size="sm" className="gap-2 text-xs" onClick={() => { if (!confirm('Reset the root password?')) return; handleAction('resetpassword') }}>
                        <Key className="w-4 h-4" /> Reset Password
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ═══ STARTUP SCRIPT ═══ */}
              {section === 'startupscript' && (
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-[var(--text)]">Change Startup Script</h2>
                  <Card>
                    <CardContent className="p-5 space-y-3">
                      <p className="text-sm text-[var(--text-muted)]">User data / cloud-init script that runs on boot.</p>
                      <textarea
                        className="w-full min-h-[120px] rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs text-[var(--text)] font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="#cloud-config&#10;runcmd:&#10;  - echo 'Hello World'"
                      />
                      <Button size="sm" className="gap-2 text-xs" onClick={() => toast.info('User data update coming soon')}>
                        <FileCode className="w-4 h-4" /> Update Startup Script
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ═══ SSH KEYS ═══ */}
              {section === 'sshkeys' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[var(--text)]">SSH Keys</h2>
                    <button className="text-sm font-medium text-blue-500 hover:text-blue-400">+ Add SSH Key</button>
                  </div>
                  {vm?.keypair ? (
                    <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)]">
                      <div className="flex items-center gap-4 px-5 py-4">
                        <div className="p-2.5 rounded-full bg-yellow-100 dark:bg-yellow-500/20">
                          <Key className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[var(--text)]">{vm.keypair}</p>
                          <p className="text-sm text-[var(--text-muted)]">SSH Key Pair</p>
                        </div>
                        <button className="text-sm font-semibold text-red-500 hover:text-red-400">Remove</button>
                      </div>
                    </div>
                  ) : (
                    <EmptyState icon={Key} title="No SSH keys attached" sub="Add an SSH key pair to enable key-based authentication" />
                  )}
                </div>
              )}

              {/* ═══ EVENTS ═══ */}
              {section === 'events' && (
                <div className="space-y-2">
                  <h2 className="text-base font-semibold text-[var(--text)] mb-3">Events</h2>
                  {evtLoading ? <Spinner /> : events.length === 0
                    ? <EmptyState icon={Clock} title="No events found" />
                    : events.map((evt, i) => {
                        const isError = evt.level === 'ERROR'
                        const isWarn  = evt.level === 'WARN'
                        return (
                          <div key={evt.id || i} className={cn('flex items-start gap-3 p-4 rounded-xl border', isError ? 'border-red-600/30 bg-red-500/5' : isWarn ? 'border-yellow-600/30 bg-yellow-500/5' : 'border-[var(--border)] bg-[var(--card)]')}>
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

              {/* ═══ SETTINGS ═══ */}
              {section === 'settings' && (
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-[var(--text)]">Settings</h2>
                  <Card>
                    <CardContent className="p-0 divide-y divide-[var(--border)]">
                      {[
                        { label: 'Change Plan',          desc: 'Scale CPU and memory',                 icon: Cpu,        sid: 'changeplan'    as Section },
                        { label: 'Change Hostname',       desc: 'Update the display name',              icon: Server,     sid: 'changehostname'as Section },
                        { label: 'Change OS',            desc: 'Reinstall with a different template',  icon: HardDrive,  sid: 'changeos'      as Section },
                        { label: 'Reset Password',       desc: 'Generate a new root password',         icon: Key,        sid: 'resetpassword' as Section },
                        { label: 'Change Startup Script',desc: 'Update cloud-init user data',          icon: FileCode,   sid: 'startupscript' as Section },
                        { label: 'Manage SSH Keys',      desc: 'Add or remove SSH key pairs',          icon: Key,        sid: 'sshkeys'       as Section },
                        { label: 'Firewall Rules',       desc: 'Manage security group rules',          icon: Shield,     sid: 'firewall'      as Section },
                        { label: 'Port Forwarding',      desc: 'Configure public port mappings',       icon: Layers,     sid: 'portforwarding'as Section },
                      ].map(({ label, desc, icon: Icon, sid }) => (
                        <button key={label} onClick={() => setSection(sid)}
                          className="w-full flex items-center justify-between px-5 py-4 gap-4 hover:bg-[var(--bg)] transition-colors text-left">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] shrink-0"><Icon className="w-4 h-4 text-[var(--text-muted)]" /></div>
                            <div>
                              <p className="text-sm font-medium text-[var(--text)]">{label}</p>
                              <p className="text-xs text-[var(--text-muted)]">{desc}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                  <Card className="border-red-600/30">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between px-5 py-4 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-red-500/10 shrink-0"><Trash2 className="w-4 h-4 text-red-400" /></div>
                          <div>
                            <p className="text-sm font-medium text-[var(--text)]">Destroy Instance</p>
                            <p className="text-xs text-[var(--text-muted)]">Permanently delete this instance — cannot be undone</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleAction('destroy')} disabled={!!actionLoading} className="gap-1.5 border-red-600/40 text-red-400 hover:bg-red-500/10 text-xs shrink-0">
                          <Trash2 className="w-3.5 h-3.5" /> Destroy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
