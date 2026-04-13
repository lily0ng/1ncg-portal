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
  FileCode, Users, ChevronRight, Clipboard, Edit2, Disc,
  ArrowUpDown, Move, DatabaseBackup, Filter,
  ChevronLeftIcon, ChevronRightIcon, MessageSquare, Timer,
  TrendingUp, Eye, EyeOff,
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
  | 'events' | 'settings' | 'comments'

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
      { id: 'comments',      label: 'Comments',         icon: MessageSquare },
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
  const [evtFilter,      setEvtFilter]      = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL')
  const [evtPage,        setEvtPage]        = useState(1)
  const EVT_PAGE_SIZE = 10

  // Metrics time range
  const [metricsRange,   setMetricsRange]   = useState<'1h' | '6h' | '12h' | '24h' | 'custom'>('1h')

  // Volume modal
  const [addVolOpen,     setAddVolOpen]     = useState(false)
  const [volForm,        setVolForm]        = useState({ name: '', size: 10, diskofferingid: '' })
  const [creatingVol,    setCreatingVol]    = useState(false)

  // NIC modal
  const [addNicOpen,     setAddNicOpen]     = useState(false)
  const [nicForm,        setNicForm]        = useState({ networkid: '', ipaddress: '' })
  const [addingNic,      setAddingNic]      = useState(false)

  // Comments
  const [commentText,    setCommentText]    = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  // ── SWR ────────────────────────────────────────────────────────────────
  const { data: vmData,   error: vmError, isLoading: vmLoading, mutate: mutateVM } =
    useSWR<{ vm: any }>(`/api/compute/vms/${id}`, fetcher, { refreshInterval: 15000 })
  const { data: volData,  isLoading: volLoading, mutate: mutateVols }  = useSWR<{ volumes: any[] }>(`/api/storage/volumes?virtualmachineid=${id}`, fetcher)
  const { data: snapData, isLoading: snapLoading, mutate: mutateSnaps }= useSWR<{ snapshots: any[] }>(`/api/compute/snapshots?virtualmachineid=${id}`, fetcher)
  const { data: evtData,  isLoading: evtLoading }                      = useSWR<{ events: any[] }>(`/api/events?resourceid=${id}&pagesize=50`, fetcher, { refreshInterval: 30000 })
  const { data: fwData,   isLoading: fwLoading,  mutate: mutateFW  }  = useSWR<{ rules: any[] }>(`/api/compute/vms/${id}/firewall`, fetcher)
  const { data: pfData,   isLoading: pfLoading,  mutate: mutatePF  }  = useSWR<{ rules: any[] }>(`/api/compute/vms/${id}/portforwarding`, fetcher)
  const { data: nicData,  isLoading: nicLoading }                      = useSWR<{ nics: any[] }>(`/api/compute/vms/${id}/nics`, fetcher)
  const { data: backupData, isLoading: backupLoading, mutate: mutateBackups } = useSWR<{ backups: any[] }>(`/api/storage/backups?virtualmachineid=${id}`, fetcher)
  const { data: scheduleData, isLoading: scheduleLoading, mutate: mutateSchedules } = useSWR<{ schedules: any[] }>(`/api/compute/vms/${id}/schedules`, fetcher)
  const { data: metricsData, isLoading: metricsLoading } = useSWR<{ cpu: number; memory: { used: number; total: number }; network: { rx: number; tx: number }; disk: { read: number; write: number } }>(`/api/compute/vms/${id}/metrics?range=${metricsRange}`, fetcher, { refreshInterval: 30000 })
  const { data: settingsData, isLoading: settingsLoading } = useSWR<{ settings: any[] }>(`/api/compute/vms/${id}/settings`, fetcher)
  const { data: commentsData, isLoading: commentsLoading, mutate: mutateComments } = useSWR<{ comments: any[] }>(`/api/compute/vms/${id}/comments`, fetcher)

  const vm        = vmData?.vm
  const volumes   = volData?.volumes   || []
  const snapshots = snapData?.snapshots|| []
  const events    = evtData?.events    || []
  const fwRules   = fwData?.rules      || []
  const pfRules   = pfData?.rules      || []
  const nics      = nicData?.nics      || []
  const backups   = backupData?.backups || []
  const schedules = scheduleData?.schedules || []
  const settings  = settingsData?.settings || []
  const comments  = commentsData?.comments || []

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

  const createVolume = async () => {
    if (!volForm.name.trim()) { toast.error('Enter a volume name'); return }
    if (volForm.size < 1) { toast.error('Size must be at least 1 GB'); return }
    setCreatingVol(true)
    try {
      const res = await fetch('/api/storage/volumes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: volForm.name, size: volForm.size * 1073741824, diskofferingid: volForm.diskofferingid || undefined }),
      })
      if (!res.ok) throw new Error('Failed to create volume')
      const data = await res.json()
      // Attach volume to VM
      const attachRes = await fetch(`/api/storage/volumes/${data.volume?.id || data.id}/attach`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ virtualmachineid: id }),
      })
      if (!attachRes.ok) throw new Error('Volume created but failed to attach')
      toast.success('Volume created and attached'); setAddVolOpen(false); setVolForm({ name: '', size: 10, diskofferingid: '' }); mutateVols()
    } catch (err: any) { toast.error(err.message) }
    finally { setCreatingVol(false) }
  }

  const addNic = async () => {
    if (!nicForm.networkid) { toast.error('Select a network'); return }
    setAddingNic(true)
    try {
      const res = await fetch(`/api/compute/vms/${id}/nics`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ networkid: nicForm.networkid, ipaddress: nicForm.ipaddress || undefined }),
      })
      if (!res.ok) throw new Error('Failed to add NIC')
      toast.success('NIC added successfully'); setAddNicOpen(false); setNicForm({ networkid: '', ipaddress: '' })
      // Refresh NICs - using a manual fetch since we may not have a mutate function
      window.location.reload()
    } catch (err: any) { toast.error(err.message) }
    finally { setAddingNic(false) }
  }

  const submitComment = async () => {
    if (!commentText.trim()) { toast.error('Enter a comment'); return }
    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/compute/vms/${id}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText }),
      })
      if (!res.ok) throw new Error('Failed to add comment')
      toast.success('Comment added'); setCommentText(''); mutateComments()
    } catch (err: any) { toast.error(err.message) }
    finally { setSubmittingComment(false) }
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
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Console */}
            <Button variant="outline" size="sm"
              onClick={() => window.open(`/api/compute/vms/${id}/console`, '_blank')}
              className="gap-1.5 border-purple-600/40 text-purple-400 hover:bg-purple-500/10 text-xs h-8 px-3">
              <Terminal className="w-3.5 h-3.5" /> Console
            </Button>
            {/* Copy console URL */}
            <Button variant="outline" size="sm" title="Copy Console URL"
              onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/api/compute/vms/${id}/console`); toast.success('Console URL copied') }}
              className="gap-1.5 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] text-xs h-8 px-2.5">
              <Clipboard className="w-3.5 h-3.5" />
            </Button>
            {/* Edit */}
            <Button variant="outline" size="sm" title="Edit Instance"
              onClick={() => setSection('changehostname')}
              className="gap-1.5 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] text-xs h-8 px-2.5">
              <Edit2 className="w-3.5 h-3.5" />
            </Button>

            <div className="w-px h-6 bg-[var(--border)] mx-0.5" />

            {/* Start (only when stopped) */}
            {vm.state === 'Stopped' && (
              <Button variant="outline" size="sm" onClick={() => handleAction('start')} disabled={!!actionLoading}
                className="gap-1.5 border-green-600/40 text-green-400 hover:bg-green-500/10 text-xs h-8 px-3">
                <Play className="w-3.5 h-3.5" />{actionLoading === 'start' ? 'Starting…' : 'Start'}
              </Button>
            )}
            {/* Stop */}
            {vm.state === 'Running' && (
              <Button variant="outline" size="sm" onClick={() => handleAction('stop')} disabled={!!actionLoading}
                className="gap-1.5 border-yellow-600/40 text-yellow-400 hover:bg-yellow-500/10 text-xs h-8 px-3">
                <Square className="w-3.5 h-3.5" />{actionLoading === 'stop' ? 'Stopping…' : 'Stop'}
              </Button>
            )}
            {/* Reboot */}
            {vm.state === 'Running' && (
              <Button variant="outline" size="sm" onClick={() => handleAction('reboot')} disabled={!!actionLoading}
                className="gap-1.5 border-blue-600/40 text-blue-400 hover:bg-blue-500/10 text-xs h-8 px-3">
                <RotateCcw className="w-3.5 h-3.5" />{actionLoading === 'reboot' ? 'Rebooting…' : 'Reboot'}
              </Button>
            )}
            {/* Reinstall */}
            <Button variant="outline" size="sm" title="Reinstall Instance"
              onClick={() => setSection('changeos')}
              className="gap-1.5 border-orange-600/40 text-orange-400 hover:bg-orange-500/10 text-xs h-8 px-3">
              <HardDrive className="w-3.5 h-3.5" /> Reinstall
            </Button>

            <div className="w-px h-6 bg-[var(--border)] mx-0.5" />

            {/* Take VM Snapshot */}
            <Button variant="outline" size="sm" title="Take Instance Snapshot"
              onClick={() => setSection('snapshots')}
              className="gap-1.5 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] text-xs h-8 px-2.5">
              <Camera className="w-3.5 h-3.5" />
            </Button>
            {/* Take Volume Snapshot */}
            <Button variant="outline" size="sm" title="Take Volume Snapshot"
              onClick={() => { const rootVol = (volData?.volumes || []).find((v: any) => v.type === 'ROOT'); if (!rootVol) { toast.error('No root volume found'); return } fetch(`/api/storage/volumes/${rootVol.id}/snapshot`, { method: 'POST' }).then((r) => { if (r.ok) toast.success('Volume snapshot initiated'); else toast.error('Failed') }) }}
              className="gap-1.5 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] text-xs h-8 px-2.5">
              <Archive className="w-3.5 h-3.5" />
            </Button>
            {/* Assign to Backup Offering */}
            <Button variant="outline" size="sm" title="Assign to Backup Offering"
              onClick={() => { toast.info('Select a backup offering to assign') }}
              className="gap-1.5 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] text-xs h-8 px-2.5">
              <DatabaseBackup className="w-3.5 h-3.5" />
            </Button>
            {/* Attach ISO */}
            <Button variant="outline" size="sm" title="Attach ISO"
              onClick={() => { toast.info('Select an ISO to attach') }}
              className="gap-1.5 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] text-xs h-8 px-2.5">
              <Disc className="w-3.5 h-3.5" />
            </Button>
            {/* Scale */}
            <Button variant="outline" size="sm" title="Scale Instance"
              onClick={() => setSection('changeplan')}
              className="gap-1.5 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] text-xs h-8 px-2.5">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </Button>
            {/* Migrate */}
            <Button variant="outline" size="sm" title="Migrate Instance"
              onClick={() => { if (!confirm('Migrate this instance to another host?')) return; handleAction('migrate') }}
              className="gap-1.5 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] text-xs h-8 px-2.5">
              <Move className="w-3.5 h-3.5" />
            </Button>

            <div className="w-px h-6 bg-[var(--border)] mx-0.5" />

            {/* Destroy */}
            <Button variant="outline" size="sm" onClick={() => handleAction('destroy')} disabled={!!actionLoading}
              className="gap-1.5 border-red-600/40 text-red-400 hover:bg-red-500/10 text-xs h-8 px-3">
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
                  {/* Top stat cards row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: Cpu,         color: 'text-blue-400',   bg: 'bg-blue-500/20',   label: 'vCPU',      value: vmLoading ? null : (vm?.cpunumber ?? '—'), sub: 'cores' },
                      { icon: MemoryStick, color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Memory',    value: vmLoading ? null : (vm?.memory ? `${Math.round(vm.memory / 1024)}` : '—'), sub: 'GB RAM' },
                      { icon: Activity,    color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'CPU Usage', value: vmLoading ? null : `${cpuPct}%`, sub: 'current' },
                      { icon: HardDrive,   color: 'text-teal-400',   bg: 'bg-teal-500/20',   label: 'Storage',   value: vmLoading ? null : ((volData?.volumes || []).reduce((a: number, v: any) => a + (v.size ?? 0), 0) > 0 ? `${Math.round((volData?.volumes || []).reduce((a: number, v: any) => a + (v.size ?? 0), 0) / 1073741824)}` : '—'), sub: 'GB total' },
                    ].map(({ icon: Icon, color, bg, label, value, sub }) => (
                      <Card key={label}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={cn('p-1.5 rounded-lg', bg)}><Icon className={cn('w-4 h-4', color)} /></div>
                            <span className="text-xs text-[var(--text-muted)]">{label}</span>
                          </div>
                          {vmLoading ? <div className="h-7 w-14 rounded bg-[var(--border)] animate-pulse" /> : <>
                            <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>
                          </>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* IP / Network cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Private IP card */}
                    <Card>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-green-500/20 shrink-0">
                          <Globe className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-[var(--text-muted)] mb-0.5">Private IP</p>
                          {vmLoading
                            ? <div className="h-5 w-32 rounded bg-[var(--border)] animate-pulse" />
                            : <p className="text-sm font-mono font-semibold text-[var(--text)] truncate">{vm?.ipaddress || '—'}</p>}
                        </div>
                        {vm?.ipaddress && (
                          <button
                            onClick={() => { navigator.clipboard.writeText(vm.ipaddress); toast.success('Copied') }}
                            className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors shrink-0"
                            title="Copy IP">
                            <Clipboard className="w-4 h-4" />
                          </button>
                        )}
                      </CardContent>
                    </Card>
                    {/* Public IP card */}
                    <Card>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-blue-500/20 shrink-0">
                          <Shield className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-[var(--text-muted)] mb-0.5">Public IP</p>
                          {vmLoading
                            ? <div className="h-5 w-32 rounded bg-[var(--border)] animate-pulse" />
                            : <p className="text-sm font-mono font-semibold text-[var(--text)] truncate">{vm?.publicip || 'Not assigned'}</p>}
                        </div>
                        {vm?.publicip && (
                          <button
                            onClick={() => { navigator.clipboard.writeText(vm.publicip); toast.success('Copied') }}
                            className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors shrink-0"
                            title="Copy IP">
                            <Clipboard className="w-4 h-4" />
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Zone / Host / Template / OS cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: Server,    color: 'text-indigo-400', bg: 'bg-indigo-500/20', label: 'Zone',     value: vm?.zonename },
                      { icon: Cpu,       color: 'text-sky-400',    bg: 'bg-sky-500/20',    label: 'Host',     value: vm?.hostname },
                      { icon: HardDrive, color: 'text-pink-400',   bg: 'bg-pink-500/20',   label: 'Template', value: vm?.templatename },
                      { icon: Settings,  color: 'text-amber-400',  bg: 'bg-amber-500/20',  label: 'Offering', value: vm?.serviceofferingname },
                    ].map(({ icon: Icon, color, bg, label, value }) => (
                      <Card key={label}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={cn('p-1.5 rounded-lg', bg)}><Icon className={cn('w-4 h-4', color)} /></div>
                            <span className="text-xs text-[var(--text-muted)]">{label}</span>
                          </div>
                          {vmLoading
                            ? <div className="h-5 w-20 rounded bg-[var(--border)] animate-pulse" />
                            : <p className="text-sm font-medium text-[var(--text)] truncate" title={value}>{value || '—'}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Resource usage + network/disk I/O row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Resource Usage</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        {vmLoading ? <Spinner /> : <>
                          <UsageBar label="CPU Usage" percent={cpuPct} color="bg-blue-500" />
                          <UsageBar label={`Memory — ${memUsedMB} / ${memTotalMB} MB`} percent={memPct} color="bg-purple-500" />
                        </>}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle className="text-sm">I/O Statistics</CardTitle></CardHeader>
                      <CardContent>
                        {vmLoading ? <Spinner /> : (
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: 'Net Read',   value: vm?.networkkbsread  != null ? `${(vm.networkkbsread  / 1024).toFixed(1)} MB` : '—', color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
                              { label: 'Net Write',  value: vm?.networkkbswrite != null ? `${(vm.networkkbswrite / 1024).toFixed(1)} MB` : '—', color: 'text-green-400',  bg: 'bg-green-500/10'  },
                              { label: 'Disk Read',  value: `${vm?.diskioread  ?? '—'} ops`, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                              { label: 'Disk Write', value: `${vm?.diskiowrite ?? '—'} ops`, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                            ].map(({ label, value, color, bg }) => (
                              <div key={label} className={cn('text-center p-3 rounded-xl border border-[var(--border)]', bg)}>
                                <p className={cn('text-lg font-bold', color)}>{value}</p>
                                <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* ═══ DETAILS ═══ */}
              {section === 'details' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <Card>
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Info className="w-4 h-4" />General Information</CardTitle></CardHeader>
                    <CardContent>
                      {vmLoading ? <Spinner /> : <>
                        <InfoRow label="Name" value={vm?.name} />
                        <InfoRow label="Display name" value={vm?.displayname} />
                        <InfoRow label="ID" value={vm?.id} mono />
                        <InfoRow label="State" value={<Badge variant={STATE_VARIANT[vm?.state] || 'secondary'}>{vm?.state}</Badge>} />
                        <InfoRow label="Template" value={vm?.templatename} />
                        <InfoRow label="Compute Offering" value={vm?.serviceofferingname} />
                        <InfoRow label="Dynamically Scalable" value={vm?.isdynamicallyscalable ? <Badge variant="success">Yes</Badge> : <Badge variant="secondary">No</Badge>} />
                        <InfoRow label="HA Enabled" value={vm?.haenable ? <Badge variant="success">Yes</Badge> : <Badge variant="secondary">No</Badge>} />
                        <InfoRow label="Hypervisor" value={vm?.hypervisor} />
                        <InfoRow label="Arch" value={vm?.arch || vm?.guestosid || 'x86_64'} />
                      </>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4" />Ownership & Location</CardTitle></CardHeader>
                    <CardContent>
                      {vmLoading ? <Spinner /> : <>
                        <InfoRow label="Account" value={vm?.account} />
                        <InfoRow label="Domain" value={vm?.domain} />
                        <InfoRow label="Zone" value={vm?.zonename} />
                        <InfoRow label="Pod" value={vm?.podname} />
                        <InfoRow label="Cluster" value={vm?.clustername} />
                        <InfoRow label="Host" value={vm?.hostname} />
                        <InfoRow label="Compute Resource Status" value={vm?.resourcedetails?.status || vm?.state || '—'} />
                        <InfoRow label="Delete Protection" value={vm?.isdeletedprotection ? <Badge variant="success">Enabled</Badge> : <Badge variant="secondary">Disabled</Badge>} />
                      </>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Network className="w-4 h-4" />Network Information</CardTitle></CardHeader>
                    <CardContent>
                      {vmLoading ? <Spinner /> : <>
                        <InfoRow label="Private IP" value={vm?.ipaddress} mono />
                        <InfoRow label="Public IP"  value={vm?.publicip} mono />
                        <InfoRow label="Network Name" value={vm?.networkname || nics?.[0]?.networkname} />
                        <InfoRow label="MAC Address" value={vm?.macaddress || nics?.[0]?.macaddress} mono />
                        <InfoRow label="Net Read"   value={vm?.networkkbsread  != null ? `${(vm.networkkbsread  / 1024).toFixed(1)} MB` : '—'} />
                        <InfoRow label="Net Write"  value={vm?.networkkbswrite != null ? `${(vm.networkkbswrite / 1024).toFixed(1)} MB` : '—'} />
                      </>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4" />System Details</CardTitle></CardHeader>
                    <CardContent>
                      {vmLoading ? <Spinner /> : <>
                        <InfoRow label="OS Type" value={vm?.ostypename} />
                        <InfoRow label="vCPUs" value={vm?.cpunumber} />
                        <InfoRow label="Memory" value={vm?.memory ? `${Math.round(vm.memory / 1024)} GB` : '—'} />
                        <InfoRow label="CPU Speed" value={vm?.cpuspeed ? `${vm.cpuspeed} MHz` : '—'} />
                        <InfoRow label="Key Pair" value={vm?.keypair} />
                        <InfoRow label="Group" value={vm?.group || '—'} />
                        <InfoRow label="Created" value={vm?.created ? new Date(vm.created).toLocaleString() : '—'} />
                        <InfoRow label="Last Updated" value={vm?.updated ? new Date(vm.updated).toLocaleString() : '—'} />
                      </>}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ═══ METRICS ═══ */}
              {section === 'metrics' && (
                <div className="space-y-4">
                  {/* Time Range Selector */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4" />Metrics Time Range</CardTitle>
                        <div className="flex items-center gap-1 bg-[var(--bg)] rounded-lg p-1">
                          {(['1h', '6h', '12h', '24h', 'custom'] as const).map((range) => (
                            <button
                              key={range}
                              onClick={() => setMetricsRange(range)}
                              className={cn(
                                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                                metricsRange === range
                                  ? 'bg-blue-600 text-white'
                                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]'
                              )}
                            >
                              {range === '1h' ? '1 Hour' : range === '6h' ? '6 Hours' : range === '12h' ? '12 Hours' : range === '24h' ? '24 Hours' : 'Custom'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* CPU & Memory Metrics */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Cpu className="w-4 h-4" />CPU Usage</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        {metricsLoading ? <Spinner /> : <>
                          <UsageBar label="Current CPU Usage" percent={metricsData?.cpu || cpuPct} color="bg-blue-500" />
                          <div className="grid grid-cols-3 gap-3 pt-2">
                            <div className="text-center p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                              <p className="text-lg font-bold text-blue-400">{metricsData?.cpu || cpuPct}%</p>
                              <p className="text-xs text-[var(--text-muted)]">Current</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                              <p className="text-lg font-bold text-blue-400">{vm?.cpunumber || '—'}</p>
                              <p className="text-xs text-[var(--text-muted)]">vCPUs</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                              <p className="text-lg font-bold text-blue-400">{vm?.cpuspeed ? `${vm.cpuspeed} MHz` : '—'}</p>
                              <p className="text-xs text-[var(--text-muted)]">Speed</p>
                            </div>
                          </div>
                        </>}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MemoryStick className="w-4 h-4" />Memory Usage</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        {metricsLoading ? <Spinner /> : <>
                          <UsageBar label={`Memory (${metricsData?.memory?.used || memUsedMB} / ${metricsData?.memory?.total || memTotalMB} MB)`} percent={metricsData?.memory?.total ? (metricsData.memory.used / metricsData.memory.total) * 100 : memPct} color="bg-purple-500" />
                          <div className="grid grid-cols-3 gap-3 pt-2">
                            <div className="text-center p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                              <p className="text-lg font-bold text-purple-400">{Math.round((metricsData?.memory?.used || memUsedMB) / 1024 * 100) / 100} GB</p>
                              <p className="text-xs text-[var(--text-muted)]">Used</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                              <p className="text-lg font-bold text-purple-400">{Math.round((metricsData?.memory?.total || memTotalMB) / 1024 * 100) / 100} GB</p>
                              <p className="text-xs text-[var(--text-muted)]">Total</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                              <p className="text-lg font-bold text-purple-400">{Math.round(((metricsData?.memory?.total || memTotalMB) - (metricsData?.memory?.used || memUsedMB)) / 1024 * 100) / 100} GB</p>
                              <p className="text-xs text-[var(--text-muted)]">Free</p>
                            </div>
                          </div>
                        </>}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Disk I/O & IOPS */}
                  <Card>
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><HardDrive className="w-4 h-4" />Disk I/O & IOPS</CardTitle></CardHeader>
                    <CardContent>
                      {metricsLoading ? <Spinner /> : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                            <p className="text-2xl font-bold text-green-400">{metricsData?.disk?.read ? `${(metricsData.disk.read / 1024).toFixed(1)} MB` : vm?.diskkbsread ? `${(vm.diskkbsread / 1024).toFixed(1)} MB` : '—'}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">Disk Read</p>
                          </div>
                          <div className="text-center p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                            <p className="text-2xl font-bold text-blue-400">{metricsData?.disk?.write ? `${(metricsData.disk.write / 1024).toFixed(1)} MB` : vm?.diskkbswrite ? `${(vm.diskkbswrite / 1024).toFixed(1)} MB` : '—'}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">Disk Write</p>
                          </div>
                          <div className="text-center p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                            <p className="text-2xl font-bold text-orange-400">{vm?.diskioread ?? '—'}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">IOPS Read</p>
                          </div>
                          <div className="text-center p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                            <p className="text-2xl font-bold text-red-400">{vm?.diskiowrite ?? '—'}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">IOPS Write</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Network Metrics */}
                  <Card>
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Wifi className="w-4 h-4" />Network Traffic</CardTitle></CardHeader>
                    <CardContent>
                      {metricsLoading ? <Spinner /> : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                            <p className="text-2xl font-bold text-green-400">{metricsData?.network?.rx ? `${(metricsData.network.rx / 1024).toFixed(1)} MB` : vm?.networkkbsread ? `${(vm.networkkbsread / 1024).toFixed(1)} MB` : '—'}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">Network In (RX)</p>
                          </div>
                          <div className="text-center p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                            <p className="text-2xl font-bold text-blue-400">{metricsData?.network?.tx ? `${(metricsData.network.tx / 1024).toFixed(1)} MB` : vm?.networkkbswrite ? `${(vm.networkkbswrite / 1024).toFixed(1)} MB` : '—'}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">Network Out (TX)</p>
                          </div>
                          <div className="text-center p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                            <p className="text-2xl font-bold text-purple-400">{nics?.length || vm?.nic?.length || '—'}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">NICs</p>
                          </div>
                          <div className="text-center p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                            <p className="text-2xl font-bold text-orange-400">{vm?.ipaddress || '—'}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">Primary IP</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <p className="text-xs text-center text-[var(--text-muted)]">Auto-refreshes every 30 s · Range: {metricsRange === '1h' ? '1 Hour' : metricsRange === '6h' ? '6 Hours' : metricsRange === '12h' ? '12 Hours' : metricsRange === '24h' ? '24 Hours' : 'Custom'}</p>
                </div>
              )}

              {/* ═══ VOLUMES ═══ */}
              {section === 'volumes' && (
                <div className="space-y-4">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[var(--text)]">Attached Volumes</h2>
                    <button
                      onClick={() => setAddVolOpen(true)}
                      className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Create and Add Volume
                    </button>
                  </div>

                  {/* Add Volume Modal */}
                  {addVolOpen && (
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <p className="text-sm font-semibold text-[var(--text)]">Create and Attach New Volume</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Volume Name</Label>
                            <Input
                              value={volForm.name}
                              onChange={(e) => setVolForm((f) => ({ ...f, name: e.target.value }))}
                              placeholder="Enter volume name"
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Size (GB)</Label>
                            <Input
                              type="number"
                              min={1}
                              max={1024}
                              value={volForm.size}
                              onChange={(e) => setVolForm((f) => ({ ...f, size: parseInt(e.target.value) || 10 }))}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Disk Offering (Optional)</Label>
                            <Input
                              value={volForm.diskofferingid}
                              onChange={(e) => setVolForm((f) => ({ ...f, diskofferingid: e.target.value }))}
                              placeholder="Disk offering ID"
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => setAddVolOpen(false)} className="h-8 text-xs">Cancel</Button>
                          <Button size="sm" onClick={createVolume} disabled={creatingVol} className="h-8 text-xs gap-1">
                            {creatingVol ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                            Create & Attach
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Volumes Table */}
                  {volLoading ? <Spinner /> : volumes.length === 0 ? <EmptyState icon={HardDrive} title="No volumes attached" /> : (
                    <FlatTable headers={['Name', 'State', 'Type', 'Size', 'Storage', 'Actions']} footer={`Showing ${volumes.length} volume${volumes.length !== 1 ? 's' : ''}`}>
                      {volumes.map((vol) => (
                        <tr key={vol.id} className="hover:bg-[var(--bg)] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-lg bg-blue-500/20"><HardDrive className="w-4 h-4 text-blue-400" /></div>
                              <div>
                                <p className="font-medium text-[var(--text)] text-sm">{vol.name}</p>
                                <p className="text-xs text-[var(--text-muted)] font-mono">{vol.id?.slice(0, 12)}…</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><Badge variant={vol.state === 'Ready' ? 'success' : 'secondary'}>{vol.state}</Badge></td>
                          <td className="px-4 py-3"><Badge variant="secondary">{vol.type}</Badge></td>
                          <td className="px-4 py-3 text-sm text-[var(--text)]">{vol.size ? `${Math.round(vol.size / 1073741824)} GB` : '—'}</td>
                          <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{vol.storage || vol.storagetype || '—'}</td>
                          <td className="px-4 py-3">
                            {vol.type !== 'ROOT' && (
                              <button
                                className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                                onClick={() => { if (!confirm('Detach this volume?')) return; fetch(`/api/storage/volumes/${vol.id}/detach`, { method: 'POST' }).then((r) => { if (r.ok) { toast.success('Volume detached'); mutateVols() } else toast.error('Failed to detach') }) }}
                                title="Detach Volume"
                              >
                                <Unplug className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </FlatTable>
                  )}
                </div>
              )}

              {/* ═══ NICS ═══ */}
              {section === 'nics' && (
                <div className="space-y-4">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[var(--text)]">Network Interfaces</h2>
                    <button
                      onClick={() => setAddNicOpen(true)}
                      className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Network to Instance
                    </button>
                  </div>

                  {/* Add NIC Modal */}
                  {addNicOpen && (
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <p className="text-sm font-semibold text-[var(--text)]">Add Network Interface</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Network ID</Label>
                            <Input
                              value={nicForm.networkid}
                              onChange={(e) => setNicForm((f) => ({ ...f, networkid: e.target.value }))}
                              placeholder="Enter network ID"
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">IP Address (Optional)</Label>
                            <Input
                              value={nicForm.ipaddress}
                              onChange={(e) => setNicForm((f) => ({ ...f, ipaddress: e.target.value }))}
                              placeholder="e.g. 10.0.0.50"
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => setAddNicOpen(false)} className="h-8 text-xs">Cancel</Button>
                          <Button size="sm" onClick={addNic} disabled={addingNic} className="h-8 text-xs gap-1">
                            {addingNic ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                            Add NIC
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* NICs Table */}
                  {nicLoading ? <Spinner /> : nics.length === 0 ? <EmptyState icon={Wifi} title="No NICs found" /> : (
                    <FlatTable headers={['Device ID', 'Network Name', 'MAC Address', 'IP Address', 'Netmask', 'Gateway']} footer={`Showing ${nics.length} NIC${nics.length !== 1 ? 's' : ''}`}>
                      {nics.map((nic, i) => (
                        <tr key={nic.id || i} className="hover:bg-[var(--bg)] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-green-500/20"><Wifi className="w-4 h-4 text-green-400" /></div>
                              <span className="font-medium text-sm text-[var(--text)]">{nic.deviceid ?? i}</span>
                              {nic.isdefault && <Badge variant="info">Default</Badge>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--text)]">{nic.networkname || '—'}</td>
                          <td className="px-4 py-3 text-sm font-mono text-[var(--text-muted)]">{nic.macaddress || '—'}</td>
                          <td className="px-4 py-3 text-sm font-mono text-[var(--text)]">{nic.ipaddress || '—'}</td>
                          <td className="px-4 py-3 text-sm font-mono text-[var(--text-muted)]">{nic.netmask || '—'}</td>
                          <td className="px-4 py-3 text-sm font-mono text-[var(--text-muted)]">{nic.gateway || '—'}</td>
                        </tr>
                      ))}
                    </FlatTable>
                  )}
                </div>
              )}

              {/* ═══ SNAPSHOTS ═══ */}
              {section === 'snapshots' && (
                <div className="space-y-4">
                  {/* Create Snapshot Card */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input placeholder="Snapshot name…" value={snapName} onChange={(e) => setSnapName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createSnapshot()} className="flex-1" />
                        <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer whitespace-nowrap">
                          <input type="checkbox" checked={snapMem} onChange={(e) => setSnapMem(e.target.checked)} className="rounded" />Include memory
                        </label>
                        <Button onClick={createSnapshot} disabled={creatingSnap} className="gap-2 shrink-0">
                          {creatingSnap ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Snapshot
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Snapshots Table */}
                  {snapLoading ? <Spinner /> : snapshots.length === 0 ? <EmptyState icon={Camera} title="No snapshots found" /> : (
                    <FlatTable headers={['Display Name', 'State', 'Type', 'Created', 'Actions']} footer={`Showing ${snapshots.length} snapshot${snapshots.length !== 1 ? 's' : ''}`}>
                      {snapshots.map((snap) => (
                        <tr key={snap.id} className="hover:bg-[var(--bg)] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-lg bg-purple-500/20"><Camera className="w-4 h-4 text-purple-400" /></div>
                              <div>
                                <p className="font-medium text-[var(--text)] text-sm">{snap.displayname || snap.name}</p>
                                <p className="text-xs text-[var(--text-muted)] font-mono">{snap.id?.slice(0, 12)}…</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><Badge variant={snap.state === 'BackedUp' ? 'success' : snap.state === 'Error' ? 'destructive' : 'secondary'}>{snap.state}</Badge></td>
                          <td className="px-4 py-3"><Badge variant="secondary">{snap.type || 'VM'}</Badge></td>
                          <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{snap.created ? new Date(snap.created).toLocaleString() : '—'}</td>
                          <td className="px-4 py-3">
                            <button
                              className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                              onClick={() => { if (!confirm(`Delete snapshot "${snap.displayname || snap.name}"?`)) return; fetch(`/api/compute/snapshots/${snap.id}`, { method: 'DELETE' }).then((r) => { if (r.ok) { toast.success('Snapshot deleted'); mutateSnaps() } else toast.error('Failed to delete') }) }}
                              title="Delete Snapshot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </FlatTable>
                  )}
                </div>
              )}

              {/* ═══ BACKUPS ═══ */}
              {section === 'backups' && (
                <div className="space-y-4">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[var(--text)]">Instance Backups</h2>
                    <button
                      onClick={() => toast.info('Backup creation coming soon')}
                      className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Create Backup
                    </button>
                  </div>

                  {/* Backups Table */}
                  {backupLoading ? <Spinner /> : backups.length === 0 ? <EmptyState icon={Archive} title="No backups configured" sub="Set up backup policies to protect your instance" /> : (
                    <FlatTable headers={['Name', 'Status', 'Size', 'Virtual Size', 'Type', 'Interval Type', 'Created']} footer={`Showing ${backups.length} backup${backups.length !== 1 ? 's' : ''}`}>
                      {backups.map((backup) => (
                        <tr key={backup.id} className="hover:bg-[var(--bg)] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-lg bg-amber-500/20"><Archive className="w-4 h-4 text-amber-400" /></div>
                              <div>
                                <p className="font-medium text-[var(--text)] text-sm">{backup.name || backup.id?.slice(0, 8)}</p>
                                <p className="text-xs text-[var(--text-muted)] font-mono">{backup.id?.slice(0, 12)}…</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><Badge variant={backup.status === 'BackedUp' ? 'success' : backup.status === 'Error' ? 'destructive' : 'secondary'}>{backup.status || backup.state || '—'}</Badge></td>
                          <td className="px-4 py-3 text-sm text-[var(--text)]">{backup.size ? `${Math.round(backup.size / 1073741824)} GB` : '—'}</td>
                          <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{backup.virtualsize ? `${Math.round(backup.virtualsize / 1073741824)} GB` : '—'}</td>
                          <td className="px-4 py-3 text-sm text-[var(--text)]">{backup.type || '—'}</td>
                          <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{backup.intervaltype || backup.backupofferingtype || '—'}</td>
                          <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{backup.created ? new Date(backup.created).toLocaleString() : '—'}</td>
                        </tr>
                      ))}
                    </FlatTable>
                  )}
                </div>
              )}

              {/* ═══ SCHEDULES ═══ */}
              {section === 'schedules' && (
                <div className="space-y-4">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[var(--text)]">Instance Schedules</h2>
                    <button
                      onClick={() => toast.info('Schedule creation coming soon')}
                      className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Schedule
                    </button>
                  </div>

                  {/* Schedules Table */}
                  {scheduleLoading ? <Spinner /> : schedules.length === 0 ? <EmptyState icon={CalendarDays} title="No schedules configured" sub="Add schedules to automate operations on this instance" /> : (
                    <FlatTable headers={['Action', 'State', 'Description', 'Schedule', 'Timezone', 'Start Date', 'End Date', 'Created', 'Actions']} footer={`Showing ${schedules.length} schedule${schedules.length !== 1 ? 's' : ''}`}>
                      {schedules.map((sched) => (
                        <tr key={sched.id} className="hover:bg-[var(--bg)] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-cyan-500/20"><Timer className="w-4 h-4 text-cyan-400" /></div>
                              <span className="font-medium text-sm text-[var(--text)]">{sched.action}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3"><Badge variant={sched.state === 'Enabled' ? 'success' : 'secondary'}>{sched.state}</Badge></td>
                          <td className="px-4 py-3 text-sm text-[var(--text)] max-w-xs truncate" title={sched.description}>{sched.description || '—'}</td>
                          <td className="px-4 py-3 text-sm font-mono text-[var(--text-muted)]">{sched.schedule || '—'}</td>
                          <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{sched.timezone || 'UTC'}</td>
                          <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{sched.startdate ? new Date(sched.startdate).toLocaleString() : '—'}</td>
                          <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{sched.enddate ? new Date(sched.enddate).toLocaleString() : '—'}</td>
                          <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{sched.created ? new Date(sched.created).toLocaleString() : '—'}</td>
                          <td className="px-4 py-3">
                            <button
                              className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                              onClick={() => { if (!confirm(`Delete schedule for "${sched.action}"?`)) return; toast.info('Schedule deletion coming soon') }}
                              title="Delete Schedule"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </FlatTable>
                  )}
                </div>
              )}

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
              {section === 'events' && (() => {
                const filteredEvts = events.filter((e: any) => evtFilter === 'ALL' || e.level === evtFilter)
                const totalPages   = Math.max(1, Math.ceil(filteredEvts.length / EVT_PAGE_SIZE))
                const pageEvts     = filteredEvts.slice((evtPage - 1) * EVT_PAGE_SIZE, evtPage * EVT_PAGE_SIZE)
                return (
                  <div className="space-y-3">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <h2 className="text-base font-semibold text-[var(--text)]">Events</h2>
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-[var(--text-muted)]" />
                        {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((lvl) => (
                          <button key={lvl}
                            onClick={() => { setEvtFilter(lvl); setEvtPage(1) }}
                            className={cn('px-2.5 py-1 rounded-lg text-xs font-medium transition-colors', evtFilter === lvl
                              ? lvl === 'ERROR' ? 'bg-red-500/20 text-red-400 border border-red-600/30'
                                : lvl === 'WARN'  ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-600/30'
                                : lvl === 'INFO'  ? 'bg-blue-500/20 text-blue-400 border border-blue-600/30'
                                : 'bg-[var(--border)] text-[var(--text)] border border-[var(--border)]'
                              : 'text-[var(--text-muted)] hover:bg-[var(--border)] border border-transparent'
                            )}>
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Events Table */}
                    {evtLoading ? <Spinner /> : filteredEvts.length === 0
                      ? <EmptyState icon={Clock} title="No events found" sub={evtFilter !== 'ALL' ? `No ${evtFilter} events for this instance` : undefined} />
                      : (
                        <FlatTable headers={['Level', 'Type', 'State', 'Username', 'Account', 'Domain', 'Created', 'Message']} footer={`Showing ${pageEvts.length} of ${filteredEvts.length} events`}>
                          {pageEvts.map((evt: any) => {
                            const isError = evt.level === 'ERROR'
                            const isWarn  = evt.level === 'WARN'
                            return (
                              <tr key={evt.id} className={cn('hover:bg-[var(--bg)] transition-colors', isError ? 'bg-red-500/5' : isWarn ? 'bg-yellow-500/5' : '')}>
                                <td className="px-4 py-3">
                                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full',
                                    isError ? 'bg-red-500/20 text-red-400' : isWarn ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-400'
                                  )}>{evt.level || 'INFO'}</span>
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-[var(--text)]">{evt.type || '—'}</td>
                                <td className="px-4 py-3"><Badge variant={evt.state === 'Completed' ? 'success' : evt.state === 'Error' ? 'destructive' : 'secondary'}>{evt.state || '—'}</Badge></td>
                                <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{evt.username || '—'}</td>
                                <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{evt.account || '—'}</td>
                                <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{evt.domain || '—'}</td>
                                <td className="px-4 py-3 text-sm text-[var(--text-muted)] whitespace-nowrap">{evt.created ? new Date(evt.created).toLocaleString() : '—'}</td>
                                <td className="px-4 py-3 text-sm text-[var(--text-muted)] max-w-xs truncate" title={evt.description}>{evt.description || '—'}</td>
                              </tr>
                            )
                          })}
                        </FlatTable>
                      )}

                    {/* Pagination */}
                    {!evtLoading && filteredEvts.length > EVT_PAGE_SIZE && (
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-xs text-[var(--text-muted)]">
                          Showing {(evtPage - 1) * EVT_PAGE_SIZE + 1}–{Math.min(evtPage * EVT_PAGE_SIZE, filteredEvts.length)} of {filteredEvts.length} events
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            disabled={evtPage === 1}
                            onClick={() => setEvtPage((p) => p - 1)}
                            className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--border)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            <ChevronLeftIcon className="w-4 h-4" />
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button key={p} onClick={() => setEvtPage(p)}
                              className={cn('w-7 h-7 rounded-lg text-xs font-medium transition-colors border',
                                p === evtPage ? 'bg-blue-600 text-white border-blue-600' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--border)]'
                              )}>{p}</button>
                          ))}
                          <button
                            disabled={evtPage === totalPages}
                            onClick={() => setEvtPage((p) => p + 1)}
                            className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--border)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            <ChevronRightIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* ═══ SETTINGS ═══ */}
              {section === 'settings' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[var(--text)]">Instance Settings</h2>
                    <button
                      onClick={() => toast.info('Add setting coming soon')}
                      className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Setting
                    </button>
                  </div>

                  {/* Settings Table */}
                  {settingsLoading ? <Spinner /> : settings.length === 0 ? (
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
                  ) : (
                    <FlatTable headers={['Setting Name', 'Value', 'Description', 'Actions']} footer={`Showing ${settings.length} setting${settings.length !== 1 ? 's' : ''}`}>
                      {settings.map((setting: any) => (
                        <tr key={setting.id || setting.name} className="hover:bg-[var(--bg)] transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-[var(--text)]">{setting.name}</td>
                          <td className="px-4 py-3 text-sm font-mono text-[var(--text-muted)]">{setting.value}</td>
                          <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{setting.description || '—'}</td>
                          <td className="px-4 py-3">
                            <button
                              className="p-1.5 text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded transition-colors"
                              onClick={() => toast.info('Edit setting coming soon')}
                              title="Edit Setting"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </FlatTable>
                  )}

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

              {/* ═══ COMMENTS ═══ */}
              {section === 'comments' && (
                <div className="space-y-4">
                  {/* Add Comment */}
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm font-semibold text-[var(--text)]">Add Comment</p>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Enter your comment about this instance..."
                        className="w-full min-h-[80px] rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                      />
                      <div className="flex justify-end">
                        <Button size="sm" onClick={submitComment} disabled={submittingComment} className="gap-1 text-xs h-8">
                          {submittingComment ? <RefreshCw className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
                          Add Comment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Comments List */}
                  {commentsLoading ? <Spinner /> : comments.length === 0 ? (
                    <EmptyState icon={MessageSquare} title="No comments yet" sub="Be the first to add a comment about this instance" />
                  ) : (
                    <div className="space-y-3">
                      {comments.map((comment: any) => (
                        <Card key={comment.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                <span className="text-xs font-medium text-blue-400">{(comment.username || comment.account || 'U').charAt(0).toUpperCase()}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-[var(--text)]">{comment.username || comment.account || 'Unknown'}</span>
                                    {comment.domain && <span className="text-xs text-[var(--text-muted)]">({comment.domain})</span>}
                                  </div>
                                  <span className="text-xs text-[var(--text-muted)]">{comment.created ? new Date(comment.created).toLocaleString() : '—'}</span>
                                </div>
                                <p className="text-sm text-[var(--text-muted)] whitespace-pre-wrap">{comment.text || comment.message || comment.comment}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
