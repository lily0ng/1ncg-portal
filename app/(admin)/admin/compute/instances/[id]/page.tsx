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
  Activity, Info, Calendar, User, Shield, Tag, Settings,
  MessageSquare, Zap, Database, Lock, FileText, BarChart3,
  Wifi, Download, Upload, Disc, Timer, CalendarClock,
  ChevronDown, MoreHorizontal, Edit, Copy, Check, Key,
  TrendingUp, Layers, Archive, Repeat, Paperclip, Maximize2, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// Time range options for metrics
const TIME_RANGES = [
  { label: '1H', value: '1h', description: 'Last 1 hour' },
  { label: '6H', value: '6h', description: 'Last 6 hours' },
  { label: '12H', value: '12h', description: 'Last 12 hours' },
  { label: '24H', value: '24h', description: 'Last 24 hours' },
  { label: 'Custom', value: 'custom', description: 'Custom range' },
]

const fetcher = async (url: string): Promise<any> => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }
  return res.json()
}

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
  const [metricsRange, setMetricsRange] = useState('1h')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [eventLevelFilter, setEventLevelFilter] = useState<string>('ALL')
  const [selectedNic, setSelectedNic] = useState<any>(null)

  // Main VM data
  const { data: vmData, error: vmError, isLoading: vmLoading, mutate: mutateVM } =
    useSWR<{ vm: any }>(`/api/compute/vms/${id}`, fetcher, { refreshInterval: 15000 })

  // Storage data with error handling
  const { data: volumeData, isLoading: volLoading, error: volError, mutate: mutateVols } =
    useSWR<{ volumes: any[]; count?: number }>(`/api/storage/volumes?virtualmachineid=${id}`, fetcher)

  // Snapshots data with error handling
  const { data: snapshotData, isLoading: snapLoading, error: snapError, mutate: mutateSnaps } =
    useSWR<{ snapshots: any[]; count?: number }>(`/api/compute/snapshots?virtualmachineid=${id}`, fetcher)

  // Events data with error handling and level filter - 10s auto refresh
  const eventQueryParams = new URLSearchParams({ resourceid: id, pagesize: '50' })
  if (eventLevelFilter !== 'ALL') eventQueryParams.set('level', eventLevelFilter)

  const { data: eventData, isLoading: eventLoading, error: eventError, mutate: mutateEvents } =
    useSWR<{ events: any[]; count?: number }>(
      `/api/events?${eventQueryParams.toString()}`,
      fetcher,
      { refreshInterval: 10000 }  // 10 seconds auto refresh
    )

  // Metrics data with time range
  const { data: metricsData, isLoading: metricsLoading } =
    useSWR<{ cpu: number; memory: { used: number; total: number }; network: { rx: number; tx: number }; disk: { read: number; write: number } }>(
      `/api/compute/vms/${id}/metrics?range=${metricsRange}`,
      fetcher,
      { refreshInterval: 30000 }
    )

  // NICs data with error handling
  const { data: nicsData, isLoading: nicsLoading, error: nicsError } =
    useSWR<{ nics: any[]; count?: number }>(`/api/compute/vms/${id}/nics`, fetcher)

  // Backups data with error handling
  const { data: backupsData, isLoading: backupsLoading, error: backupsError, mutate: mutateBackups } =
    useSWR<{ backups: any[]; count?: number }>(`/api/storage/backups?virtualmachineid=${id}`, fetcher)

  // Instance snapshots (VM snapshots) with error handling
  const { data: vmSnapshotData, isLoading: vmSnapLoading, error: vmSnapError, mutate: mutateVmSnaps } =
    useSWR<{ snapshots: any[]; count?: number }>(`/api/compute/vms/${id}/snapshots`, fetcher)

  // Schedules data with error handling
  const { data: schedulesData, isLoading: schedulesLoading, error: schedulesError } =
    useSWR<{ schedules: any[]; count?: number }>(`/api/compute/vms/${id}/schedules`, fetcher)

  // Firewall rules data
  const { data: firewallData, isLoading: firewallLoading, error: firewallError, mutate: mutateFirewall } =
    useSWR<{ rules: any[]; count?: number }>(`/api/compute/vms/${id}/firewall`, fetcher)

  // Port forwarding rules data
  const { data: portForwardingData, isLoading: pfLoading, error: pfError, mutate: mutatePortForwarding } =
    useSWR<{ rules: any[]; count?: number }>(`/api/compute/vms/${id}/portforwarding`, fetcher)

  const vm = vmData?.vm
  const volumes = volumeData?.volumes || []
  const snapshots = snapshotData?.snapshots || []
  const events = eventData?.events || []
  const nics = nicsData?.nics || []
  const backups = backupsData?.backups || []
  const vmSnapshots = vmSnapshotData?.snapshots || []
  const schedules = schedulesData?.schedules || []
  const firewallRules = firewallData?.rules || []
  const portForwardingRules = portForwardingData?.rules || []

  // Copy to clipboard helper
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleAction = async (action: string, payload?: any) => {
    // Confirmations for destructive actions
    if (action === 'destroy') {
      if (!confirm(`Destroy "${vm?.displayname || vm?.name}"? This cannot be undone.`)) return
    }
    if (action === 'reinstall') {
      if (!confirm(`Reinstall "${vm?.displayname || vm?.name}"? All data will be lost.`)) return
    }
    if (action === 'stop') {
      if (!confirm(`Stop "${vm?.displayname || vm?.name}"?`)) return
    }

    setActionLoading(action)
    try {
      let res: Response
      let data: any

      switch (action) {
        // Basic lifecycle actions
        case 'start':
        case 'stop':
        case 'reboot':
        case 'destroy':
          res = await fetch(`/api/compute/vms/${id}/${action}`, { method: 'POST' })
          data = await res.json()
          if (!res.ok) throw new Error(data.error || `Failed to ${action}`)
          toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} initiated`)
          break

        // VM Snapshots (instance snapshots)
        case 'snapshot':
          res = await fetch('/api/compute/snapshots', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ virtualmachineid: id, name: `vm-snapshot-${Date.now()}`, snapshotmemory: true }),
          })
          data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to create VM snapshot')
          toast.success('Instance snapshot initiated')
          mutateVmSnaps()
          break

        // Scale / Change Service Offering
        case 'scale':
          res = await fetch(`/api/compute/vms/${id}/scale`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serviceofferingid: payload?.serviceofferingid }),
          })
          data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to scale instance')
          toast.success('Instance scale initiated')
          break

        // Migrate to another host
        case 'migrate':
          res = await fetch(`/api/compute/vms/${id}/migrate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hostid: payload?.hostid }),
          })
          data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to migrate instance')
          toast.success('Instance migration initiated')
          break

        // Reinstall / Restore VM
        case 'reinstall':
          res = await fetch(`/api/compute/vms/${id}/reinstall`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ templateid: payload?.templateid || vm?.templateid }),
          })
          data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to reinstall instance')
          toast.success('Instance reinstall initiated')
          break

        // Reset Password
        case 'resetPassword':
          res = await fetch(`/api/compute/vms/${id}/resetPassword`, { method: 'POST' })
          data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to reset password')
          toast.success(`New password: ${data.password || 'Check email'}`, { duration: 10000 })
          break

        // Attach ISO
        case 'attachISO':
          res = await fetch(`/api/compute/vms/${id}/attachIso`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isoid: payload?.isoid }),
          })
          data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to attach ISO')
          toast.success('ISO attach initiated')
          break

        // Detach ISO
        case 'detachISO':
          res = await fetch(`/api/compute/vms/${id}/detachIso`, { method: 'POST' })
          data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to detach ISO')
          toast.success('ISO detach initiated')
          break

        // Update display name
        case 'changeName':
        case 'updateDisplayName':
          const newName = prompt('Enter new display name:', vm?.displayname || '')
          if (!newName) return
          res = await fetch(`/api/compute/vms/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ displayname: newName }),
          })
          data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to update name')
          toast.success('Display name updated')
          break

        // Update hostname
        case 'changeHostname':
          const newHostname = prompt('Enter new hostname:', vm?.hostname || '')
          if (!newHostname) return
          res = await fetch(`/api/compute/vms/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hostname: newHostname }),
          })
          data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to update hostname')
          toast.success('Hostname updated')
          break

        // Change group
        case 'changeGroup':
          const newGroup = prompt('Enter new group:', vm?.group || '')
          if (!newGroup) return
          res = await fetch(`/api/compute/vms/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ group: newGroup }),
          })
          data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to update group')
          toast.success('Group updated')
          break

        // Change OS (reinstall with different template)
        case 'changeOS':
          router.push(`/admin/images/templates?vmid=${id}&action=reinstall`)
          return

        // Edit instance (redirect to settings)
        case 'edit':
          setActiveTab('settings')
          return

        // Add volume
        case 'addVolume':
          router.push(`/admin/storage/volumes?vmid=${id}&action=attach`)
          return

        // Toggle HA
        case 'toggleHA':
          res = await fetch(`/api/compute/vms/${id}/ha`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ haenable: !vm?.haenable }),
          })
          data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to toggle HA')
          toast.success(`HA ${!vm?.haenable ? 'enabled' : 'disabled'}`)
          break

        // Toggle dynamic scaling
        case 'toggleScaling':
          res = await fetch(`/api/compute/vms/${id}/scaling`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isdynamicallyscalable: !vm?.isdynamicallyscalable }),
          })
          data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to toggle scaling')
          toast.success(`Dynamic scaling ${!vm?.isdynamicallyscalable ? 'enabled' : 'disabled'}`)
          break

        // Toggle delete protection
        case 'toggleDeleteProtection':
          res = await fetch(`/api/compute/vms/${id}/protection`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deleteprotection: !vm?.deletedProtection }),
          })
          data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to toggle protection')
          toast.success(`Delete protection ${!vm?.deletedProtection ? 'enabled' : 'disabled'}`)
          break

        // Startup script / user data
        case 'startupScript':
          const newUserData = prompt('Enter user data (cloud-init):', vm?.userdata || '')
          if (newUserData === null) return
          res = await fetch(`/api/compute/vms/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userdata: newUserData }),
          })
          data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to update user data')
          toast.success('Startup script updated')
          break

        // Assign backup offering
        case 'assignBackup':
          router.push(`/admin/storage/backups?vmid=${id}&action=assign`)
          return

        // Configure IPv6
        case 'configureIPv6':
          toast.info('IPv6 configuration coming soon')
          return

        // Add Firewall Rule
        case 'addFirewallRule':
          router.push(`/admin/network/firewall?vmid=${id}&action=add`)
          return

        // Delete Firewall Rule
        case 'deleteFirewallRule':
          if (!confirm('Delete this firewall rule?')) return
          res = await fetch(`/api/compute/vms/${id}/firewall?ruleId=${payload?.ruleId}`, {
            method: 'DELETE'
          })
          data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to delete firewall rule')
          toast.success('Firewall rule deleted')
          mutateFirewall()
          return

        // Add Port Forwarding Rule
        case 'addPortForwardingRule':
          router.push(`/admin/network/public-ips?vmid=${id}&action=portforward`)
          return

        // Delete Port Forwarding Rule
        case 'deletePortForwardingRule':
          if (!confirm('Delete this port forwarding rule?')) return
          res = await fetch(`/api/compute/vms/${id}/portforwarding?ruleId=${payload?.ruleId}`, {
            method: 'DELETE'
          })
          data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to delete port forwarding rule')
          toast.success('Port forwarding rule deleted')
          mutatePortForwarding()
          return

        default:
          toast.error(`Unknown action: ${action}`)
      }

      // Refresh VM data after action
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

  const memTotalMB = vm?.memory ?? 0
  const memUsedMB = vm ? Math.max(0, (vm.memory ?? 0) - Math.round((vm.memoryintfreekbs ?? 0) / 1024)) : 0
  const memPct = memTotalMB > 0 ? Math.round((memUsedMB / memTotalMB) * 100) : 0
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
            {/* View Console */}
            <button
              onClick={() => window.open(`/api/compute/vms/${id}/console`, '_blank')}
              className="group relative p-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--accent)]/10 hover:border-[var(--accent)] transition-all"
              title="View Console"
            >
              <Terminal className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)]" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                View Console
              </span>
            </button>

            {/* Copy Console URL */}
            <button
              onClick={() => copyToClipboard(`${window.location.origin}/api/compute/vms/${id}/console`, 'console')}
              className="group relative p-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-blue-500/10 hover:border-blue-500 transition-all"
              title="Copy console URL to clipboard"
            >
              <Copy className="w-5 h-5 text-[var(--text-muted)] group-hover:text-blue-400" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Copy console URL to clipboard
              </span>
            </button>

            {/* Edit Instance */}
            <button
              onClick={() => handleAction('edit')}
              className="group relative p-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-purple-500/10 hover:border-purple-500 transition-all"
              title="Edit Instance"
            >
              <Edit className="w-5 h-5 text-[var(--text-muted)] group-hover:text-purple-400" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Edit Instance
              </span>
            </button>

            {/* Stop/Start Instance */}
            {vm.state === 'Running' ? (
              <button
                onClick={() => handleAction('stop')}
                disabled={!!actionLoading}
                className="group relative p-2.5 rounded-full border border-yellow-600/40 bg-[var(--surface)] hover:bg-yellow-500/10 transition-all disabled:opacity-50"
                title="Stop Instance"
              >
                {actionLoading === 'stop' ? (
                  <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" />
                ) : (
                  <Square className="w-5 h-5 text-yellow-400" />
                )}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Stop Instance
                </span>
              </button>
            ) : (
              <button
                onClick={() => handleAction('start')}
                disabled={!!actionLoading}
                className="group relative p-2.5 rounded-full border border-green-600/40 bg-[var(--surface)] hover:bg-green-500/10 transition-all disabled:opacity-50"
                title="Start Instance"
              >
                {actionLoading === 'start' ? (
                  <RefreshCw className="w-5 h-5 text-green-400 animate-spin" />
                ) : (
                  <Play className="w-5 h-5 text-green-400" />
                )}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Start Instance
                </span>
              </button>
            )}

            {/* Reboot Instance */}
            <button
              onClick={() => handleAction('reboot')}
              disabled={!!actionLoading}
              className="group relative p-2.5 rounded-full border border-blue-600/40 bg-[var(--surface)] hover:bg-blue-500/10 transition-all disabled:opacity-50"
              title="Reboot Instance"
            >
              {actionLoading === 'reboot' ? (
                <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
              ) : (
                <RotateCcw className="w-5 h-5 text-blue-400" />
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Reboot Instance
              </span>
            </button>

            {/* Reinstall Instance */}
            <button
              onClick={() => handleAction('reinstall')}
              disabled={!!actionLoading}
              className="group relative p-2.5 rounded-full border border-orange-600/40 bg-[var(--surface)] hover:bg-orange-500/10 transition-all disabled:opacity-50"
              title="Reinstall Instance"
            >
              {actionLoading === 'reinstall' ? (
                <RefreshCw className="w-5 h-5 text-orange-400 animate-spin" />
              ) : (
                <Repeat className="w-5 h-5 text-orange-400" />
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Reinstall Instance
              </span>
            </button>

            {/* Take Instance Snapshot */}
            <button
              onClick={() => handleAction('snapshot')}
              disabled={!!actionLoading}
              className="group relative p-2.5 rounded-full border border-cyan-600/40 bg-[var(--surface)] hover:bg-cyan-500/10 transition-all disabled:opacity-50"
              title="Take Instance Snapshot"
            >
              {actionLoading === 'snapshot' ? (
                <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-cyan-400" />
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Take Instance Snapshot
              </span>
            </button>

            {/* Take Volume Snapshot */}
            <button
              onClick={() => setActiveTab('snapshots')}
              className="group relative p-2.5 rounded-full border border-pink-600/40 bg-[var(--surface)] hover:bg-pink-500/10 transition-all"
              title="Take Instance volume Snapshot"
            >
              <HardDrive className="w-5 h-5 text-pink-400" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Take Instance volume Snapshot
              </span>
            </button>

            {/* Assign to Backup Offering */}
            <button
              onClick={() => handleAction('assignBackup')}
              disabled={!!actionLoading}
              className="group relative p-2.5 rounded-full border border-indigo-600/40 bg-[var(--surface)] hover:bg-indigo-500/10 transition-all disabled:opacity-50"
              title="Assign Instance to backup offering"
            >
              {actionLoading === 'assignBackup' ? (
                <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
              ) : (
                <Archive className="w-5 h-5 text-indigo-400" />
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Assign Instance to backup offering
              </span>
            </button>

            {/* Attach ISO */}
            <button
              onClick={() => handleAction('attachISO')}
              disabled={!!actionLoading}
              className="group relative p-2.5 rounded-full border border-lime-600/40 bg-[var(--surface)] hover:bg-lime-500/10 transition-all disabled:opacity-50"
              title="Attach ISO"
            >
              {actionLoading === 'attachISO' ? (
                <RefreshCw className="w-5 h-5 text-lime-400 animate-spin" />
              ) : (
                <Disc className="w-5 h-5 text-lime-400" />
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Attach ISO
              </span>
            </button>

            {/* Scale Instance */}
            <button
              onClick={() => handleAction('scale')}
              disabled={!!actionLoading}
              className="group relative p-2.5 rounded-full border border-teal-600/40 bg-[var(--surface)] hover:bg-teal-500/10 transition-all disabled:opacity-50"
              title="Scale Instance"
            >
              {actionLoading === 'scale' ? (
                <RefreshCw className="w-5 h-5 text-teal-400 animate-spin" />
              ) : (
                <TrendingUp className="w-5 h-5 text-teal-400" />
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Scale Instance
              </span>
            </button>

            {/* Migrate Instance */}
            <button
              onClick={() => handleAction('migrate')}
              disabled={!!actionLoading}
              className="group relative p-2.5 rounded-full border border-amber-600/40 bg-[var(--surface)] hover:bg-amber-500/10 transition-all disabled:opacity-50"
              title="Migrate Instance to another host"
            >
              {actionLoading === 'migrate' ? (
                <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
              ) : (
                <Globe className="w-5 h-5 text-amber-400" />
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Migrate Instance to another host
              </span>
            </button>

            {/* Destroy Instance */}
            <button
              onClick={() => handleAction('destroy')}
              disabled={!!actionLoading}
              className="group relative p-2.5 rounded-full border border-red-600/40 bg-red-500/10 hover:bg-red-500/20 transition-all disabled:opacity-50"
              title="Destroy Instance"
            >
              {actionLoading === 'destroy' ? (
                <RefreshCw className="w-5 h-5 text-red-400 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5 text-red-400" />
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Destroy Instance
              </span>
            </button>
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
        <TabsList className="w-full border border-[var(--border)] bg-[var(--bg)] p-1 flex flex-wrap h-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Info },
            { id: 'details', label: 'Details', icon: FileText },
            { id: 'metrics', label: 'Metrics', icon: BarChart3 },
            { id: 'volumes', label: 'Volumes', icon: HardDrive },
            { id: 'nics', label: 'NICs', icon: Wifi },
            { id: 'snapshots', label: 'Snapshots', icon: Camera },
            { id: 'backups', label: 'Backups', icon: Archive },
            { id: 'schedules', label: 'Schedules', icon: CalendarClock },
            { id: 'firewall', label: 'Firewall', icon: Shield },
            { id: 'portforwarding', label: 'Port Forwarding', icon: Globe },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'events', label: 'Events', icon: Clock },
            { id: 'comments', label: 'Comments', icon: MessageSquare },
          ].map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex-1 min-w-[80px] text-xs sm:text-sm gap-1.5">
              <tab.icon className="w-3.5 h-3.5 hidden sm:inline" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
            {/* Quick Info */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-[var(--accent)]" /> Instance Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vmLoading ? (
                  <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-8 rounded bg-[var(--border)] animate-pulse" />)}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <div>
                      <InfoRow label="Name" value={vm?.name} />
                      <InfoRow label="Display Name" value={vm?.displayname} />
                      <InfoRow label="ID" value={vm?.id} mono />
                      <InfoRow label="State" value={vm?.state && <Badge variant={STATE_VARIANT[vm.state]}>{vm.state}</Badge>} />
                      <InfoRow label="Template" value={vm?.templatename} />
                      <InfoRow label="Compute Offering" value={vm?.serviceofferingname} />
                    </div>
                    <div>
                      <InfoRow label="Zone" value={vm?.zonename} />
                      <InfoRow label="Account" value={vm?.account} />
                      <InfoRow label="Domain" value={vm?.domain} />
                      <InfoRow label="Hypervisor" value={vm?.hypervisor} />
                      <InfoRow label="Arch" value={vm?.guestosid ? 'x86_64' : '—'} />
                      <InfoRow label="Created" value={vm?.created ? new Date(vm.created).toLocaleString() : '—'} />
                  </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--accent)]" /> Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vmLoading ? (
                  <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-8 rounded bg-[var(--border)] animate-pulse" />)}</div>
                ) : (
                  <>
                    <InfoRow label="HA Enabled" value={vm?.haenable ? <Badge variant="success">Yes</Badge> : <Badge variant="secondary">No</Badge>} />
                    <InfoRow label="Dynamically Scalable" value={vm?.isdynamicallyscalable ? <Badge variant="success">Yes</Badge> : <Badge variant="secondary">No</Badge>} />
                    <InfoRow label="Delete Protection" value={vm?.deletedProtection ? <Badge variant="success">Yes</Badge> : <Badge variant="secondary">No</Badge>} />
                    <InfoRow label="Compute Resource" value={vm?.hostname || '—'} />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Network Summary */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-[var(--accent)]" /> Network Interfaces
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vmLoading ? (
                  <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded bg-[var(--border)] animate-pulse" />)}</div>
                ) : nics.length === 0 ? (
                  <div className="text-center py-8 text-[var(--text-muted)]">
                    <Wifi className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p>No network interfaces found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nics.map((nic, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="font-medium text-sm">{nic.networkname || `NIC ${nic.deviceid || idx}`}</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] font-mono">{nic.ipaddress || '—'}</p>
                        <p className="text-xs text-[var(--text-muted)]">{nic.macaddress || '—'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Details ── */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--accent)]" /> Instance Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {vmLoading ? (
                  <div className="space-y-3">{[...Array(10)].map((_, i) => <div key={i} className="h-8 rounded bg-[var(--border)] animate-pulse" />)}</div>
                ) : (
                  <>
                    <InfoRow label="Name" value={vm?.name} />
                    <InfoRow label="Display Name" value={vm?.displayname} />
                    <InfoRow label="ID" value={vm?.id} mono />
                    <InfoRow label="State" value={vm?.state && <Badge variant={STATE_VARIANT[vm.state]}>{vm.state}</Badge>} />
                    <InfoRow label="Template" value={vm?.templatename} />
                    <InfoRow label="Compute Offering" value={vm?.serviceofferingname} />
                    <InfoRow label="Dynamically Scalable" value={vm?.isdynamicallyscalable ? 'Yes' : 'No'} />
                    <InfoRow label="HA Enabled" value={vm?.haenable ? 'Yes' : 'No'} />
                    <InfoRow label="Hypervisor" value={vm?.hypervisor} />
                    <InfoRow label="Architecture" value={vm?.guestosid ? 'x86_64' : '—'} />
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[var(--accent)]" /> Ownership & Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {vmLoading ? (
                  <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-8 rounded bg-[var(--border)] animate-pulse" />)}</div>
                ) : (
                  <>
                    <InfoRow label="Account" value={vm?.account} />
                    <InfoRow label="Domain" value={vm?.domain} />
                    <InfoRow label="Zone" value={vm?.zonename} />
                    <InfoRow label="Pod" value={vm?.podname} />
                    <InfoRow label="Cluster" value={vm?.clustername} />
                    <InfoRow label="Host" value={vm?.hostname} />
                    <InfoRow label="Compute Resource Status" value={vm?.resourcestate} />
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[var(--accent)]" /> Security & Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {vmLoading ? (
                  <div className="col-span-3 space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-8 rounded bg-[var(--border)] animate-pulse" />)}</div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <InfoRow label="Delete Protection" value={vm?.deletedProtection ? <Badge variant="success">Enabled</Badge> : <Badge variant="secondary">Disabled</Badge>} />
                      <InfoRow label="Password Enabled" value={vm?.passwordenabled ? 'Yes' : 'No'} />
                    </div>
                    <div className="space-y-3">
                      <InfoRow label="SSH Key Enabled" value={vm?.keypair ? <Badge variant="success">{vm.keypair}</Badge> : 'No key'} />
                      <InfoRow label="Boot Mode" value={vm?.bootmode || '—'} />
                    </div>
                    <div className="space-y-3">
                      <InfoRow label="User Data" value={vm?.userdata ? 'Configured' : 'None'} />
                      <InfoRow label="Affinity Group" value={vm?.affinitygroup?.[0]?.name || '—'} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Metrics ── */}
        <TabsContent value="metrics">
          <div className="mt-4 space-y-6">
            {/* Time Range Selector */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-[var(--accent)]" />
                  <span className="text-sm font-medium text-[var(--text)]">Time Range:</span>
                  <div className="flex gap-1">
                    {TIME_RANGES.map((range) => (
                      <Button
                        key={range.value}
                        variant={metricsRange === range.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMetricsRange(range.value)}
                        className={cn(
                          'text-xs px-3 py-1 h-7',
                          metricsRange === range.value ? 'bg-[var(--accent)]' : 'border-[var(--border)]'
                        )}
                        title={range.description}
                      >
                        {range.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CPU Metric */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Cpu className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-sm text-[var(--text-muted)]">CPU Usage</span>
                    </div>
                    <span className="text-2xl font-bold text-[var(--text)]">
                      {metricsLoading ? '—' : `${metricsData?.cpu || 0}%`}
                    </span>
                  </div>
                  <UsageBar label="Current" percent={metricsData?.cpu || 0} color="bg-blue-500" />
                </CardContent>
              </Card>

              {/* Memory Metric */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <MemoryStick className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-sm text-[var(--text-muted)]">Memory</span>
                    </div>
                    <span className="text-2xl font-bold text-[var(--text)]">
                      {metricsLoading ? '—' : `${Math.round((metricsData?.memory?.used || 0) / (metricsData?.memory?.total || 1) * 100)}%`}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mb-2">
                    {metricsLoading ? '—' : `${Math.round((metricsData?.memory?.used || 0) / 1024)} / ${Math.round((metricsData?.memory?.total || 0) / 1024)} GB`}
                  </p>
                  <UsageBar label="Usage" percent={Math.round((metricsData?.memory?.used || 0) / (metricsData?.memory?.total || 1) * 100)} color="bg-purple-500" />
                </CardContent>
              </Card>

              {/* Network Read */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        <Download className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-sm text-[var(--text-muted)]">Network In</span>
                    </div>
                    <span className="text-2xl font-bold text-[var(--text)]">
                      {metricsLoading ? '—' : `${((metricsData?.network?.rx || 0) / 1024).toFixed(1)}`}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">MB/s received</p>
                </CardContent>
              </Card>

              {/* Network Write */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-orange-500/20">
                        <Upload className="w-4 h-4 text-orange-400" />
                      </div>
                      <span className="text-sm text-[var(--text-muted)]">Network Out</span>
                    </div>
                    <span className="text-2xl font-bold text-[var(--text)]">
                      {metricsLoading ? '—' : `${((metricsData?.network?.tx || 0) / 1024).toFixed(1)}`}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">MB/s transmitted</p>
                </CardContent>
              </Card>
            </div>

            {/* Disk I/O */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Disc className="w-4 h-4" /> Disk Read
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-center p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex-1">
                      <p className="text-3xl font-bold text-blue-400">
                        {metricsLoading ? '—' : `${(metricsData?.disk?.read || 0).toFixed(0)}`}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">KiB/s</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Disc className="w-4 h-4" /> Disk Write
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-center p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex-1">
                      <p className="text-3xl font-bold text-green-400">
                        {metricsLoading ? '—' : `${(metricsData?.disk?.write || 0).toFixed(0)}`}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">KiB/s</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <p className="text-xs text-[var(--text-muted)] text-center">
              Metrics auto-refresh every 30s • Range: {TIME_RANGES.find(r => r.value === metricsRange)?.description}
            </p>
          </div>
        </TabsContent>

        {/* ── Volumes ── */}
        <TabsContent value="volumes">
          <div className="mt-4 space-y-4">
            {/* Add Volume Button */}
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => router.push(`/admin/storage/volumes?vmid=${id}&action=attach`)} className="gap-2">
                <Plus className="w-4 h-4" /> Create and Add Volume
              </Button>
            </div>

            {volLoading ? (
              <Card><CardContent className="p-8 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></CardContent></Card>
            ) : volumes.length === 0 ? (
              <Card><CardContent className="p-12 text-center"><HardDrive className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)] opacity-40" /><p className="text-[var(--text-muted)]">No volumes attached</p></CardContent></Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">State</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Size</th>
                      <th className="pb-3 font-medium">Storage</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {volumes.map((vol) => (
                      <tr key={vol.id} className="border-b border-[var(--border)]/50 last:border-0">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded bg-blue-500/20">
                              <HardDrive className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-[var(--text)]">{vol.name}</p>
                              <p className="text-xs text-[var(--text-muted)] font-mono">{vol.id?.slice(0, 12)}…</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4"><Badge variant={vol.state === 'Ready' ? 'success' : 'secondary'}>{vol.state}</Badge></td>
                        <td className="py-4"><Badge variant="secondary">{vol.type}</Badge></td>
                        <td className="py-4">{vol.size ? `${Math.round(vol.size / (1024 ** 3))} GB` : '—'}</td>
                        <td className="py-4 text-[var(--text-muted)]">{vol.storagetype || '—'}</td>
                        <td className="py-4">
                          {vol.type !== 'ROOT' && (
                            <Button variant="outline" size="sm" onClick={() => {
                              if (!confirm('Detach this volume?')) return
                              fetch(`/api/storage/volumes/${vol.id}/detach`, { method: 'POST' })
                                .then(r => r.ok ? (toast.success('Volume detached'), mutateVols()) : toast.error('Failed to detach'))
                            }} className="gap-1 text-[var(--text-muted)] border-[var(--border)]">
                              <Unplug className="w-3.5 h-3.5" /> Detach
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── NICs ── */}
        <TabsContent value="nics">
          <div className="mt-4 space-y-4">
            {/* Header with count and add button */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">
                {nicsLoading && 'Loading NICs...'}
                {!nicsLoading && nicsData?.count !== undefined && `${nicsData.count} NICs found`}
                {!nicsLoading && nicsError && (
                  <span className="text-red-400">Error: {(nicsError as Error)?.message || 'Failed to load'}</span>
                )}
              </span>
              <Button variant="outline" size="sm" onClick={() => router.push(`/admin/network/networks?vmid=${id}&action=add`)} className="gap-2">
                <Plus className="w-4 h-4" /> Add Network to Instance
              </Button>
            </div>

            {nicsLoading && !nicsData ? (
              <Card><CardContent className="p-8 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></CardContent></Card>
            ) : nicsError ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
                  <p className="text-red-400 mb-2">Failed to load NICs</p>
                  <p className="text-xs text-[var(--text-muted)] mb-4">{(nicsError as Error)?.message || 'Unknown error'}</p>
                </CardContent>
              </Card>
            ) : !nics || nics.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Wifi className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
                  <p className="text-[var(--text-muted)]">No network interfaces found</p>
                  <p className="text-xs text-[var(--text-muted)] mt-2">Add a network to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
                <table className="w-full">
                  <thead className="bg-[var(--bg)]">
                    <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
                      <th className="pb-3 pt-3 px-4 font-medium">Device ID</th>
                      <th className="pb-3 pt-3 px-4 font-medium">Network Name</th>
                      <th className="pb-3 pt-3 px-4 font-medium">MAC Address</th>
                      <th className="pb-3 pt-3 px-4 font-medium">IP Address</th>
                      <th className="pb-3 pt-3 px-4 font-medium">Netmask</th>
                      <th className="pb-3 pt-3 px-4 font-medium">Gateway</th>
                      <th className="pb-3 pt-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {Array.isArray(nics) && nics.map((nic, idx) => (
                      <tr key={nic?.id || idx} className="border-b border-[var(--border)]/50 last:border-0 hover:bg-[var(--bg)]/50">
                        <td className="py-3 px-4 font-mono">{nic?.deviceid ?? idx}</td>
                        <td className="py-3 px-4">{nic?.networkname || '—'}</td>
                        <td className="py-3 px-4 font-mono">{nic?.macaddress || '—'}</td>
                        <td className="py-3 px-4 font-mono">{nic?.ipaddress || '—'}</td>
                        <td className="py-3 px-4 font-mono">{nic?.netmask || '—'}</td>
                        <td className="py-3 px-4 font-mono">{nic?.gateway || '—'}</td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedNic(nic)}
                            className="text-[var(--accent)] hover:text-[var(--accent)]"
                          >
                            <Info className="w-4 h-4 mr-1" /> View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* NIC Details Card */}
            {selectedNic && (
              <Card className="mt-4 border-[var(--accent)]/30">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Wifi className="w-4 h-4 text-[var(--accent)]" />
                    NIC {selectedNic.deviceid || 0} Details
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedNic(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <InfoRow label="Network Name" value={selectedNic.networkname || '—'} />
                    <InfoRow label="Network ID" value={selectedNic.networkid} mono />
                    <InfoRow label="MAC Address" value={selectedNic.macaddress} mono />
                    <InfoRow label="IP Address" value={selectedNic.ipaddress} mono />
                    <InfoRow label="Netmask" value={selectedNic.netmask} mono />
                    <InfoRow label="Gateway" value={selectedNic.gateway} mono />
                    <InfoRow label="Broadcast URI" value={selectedNic.broadcasturi} mono />
                    <InfoRow label="Isolation URI" value={selectedNic.isolationuri} mono />
                    <InfoRow label="Type" value={selectedNic.type || '—'} />
                    <InfoRow label="Is Default" value={selectedNic.isdefault ? 'Yes' : 'No'} />
                    {selectedNic.secondaryip && (
                      <div className="md:col-span-2">
                        <p className="text-[var(--text-muted)] text-xs mb-1">Secondary IPs</p>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(selectedNic.secondaryip) ? selectedNic.secondaryip.map((ip: any, i: number) => (
                            <Badge key={i} variant="secondary">{ip.ipaddress}</Badge>
                          )) : (
                            <Badge variant="secondary">{selectedNic.secondaryip.ipaddress}</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
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

        {/* ── Backups ── */}
        <TabsContent value="backups">
          <div className="mt-4 space-y-4">
            {backupsLoading ? (
              <Card><CardContent className="p-8 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></CardContent></Card>
            ) : backups.length === 0 ? (
              <Card><CardContent className="p-12 text-center"><Archive className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)] opacity-40" /><p className="text-[var(--text-muted)]">No backups found</p></CardContent></Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Size</th>
                      <th className="pb-3 font-medium">Virtual Size</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Interval</th>
                      <th className="pb-3 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {backups.map((backup) => (
                      <tr key={backup.id} className="border-b border-[var(--border)]/50 last:border-0">
                        <td className="py-4">{backup.name}</td>
                        <td className="py-4"><Badge variant={backup.status === 'BackedUp' ? 'success' : 'secondary'}>{backup.status}</Badge></td>
                        <td className="py-4">{backup.size ? `${(backup.size / (1024 ** 3)).toFixed(2)} GB` : '—'}</td>
                        <td className="py-4">{backup.virtualsize ? `${(backup.virtualsize / (1024 ** 3)).toFixed(2)} GB` : '—'}</td>
                        <td className="py-4">{backup.type || '—'}</td>
                        <td className="py-4">{backup.intervaltype || '—'}</td>
                        <td className="py-4">{backup.created ? new Date(backup.created).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Schedules ── */}
        <TabsContent value="schedules">
          <div className="mt-4 space-y-4">
            {schedulesLoading ? (
              <Card><CardContent className="p-8 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></CardContent></Card>
            ) : schedules.length === 0 ? (
              <Card><CardContent className="p-12 text-center"><CalendarClock className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)] opacity-40" /><p className="text-[var(--text-muted)]">No schedules found</p></CardContent></Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
                      <th className="pb-3 font-medium">Action</th>
                      <th className="pb-3 font-medium">State</th>
                      <th className="pb-3 font-medium">Description</th>
                      <th className="pb-3 font-medium">Schedule</th>
                      <th className="pb-3 font-medium">Timezone</th>
                      <th className="pb-3 font-medium">Start Date</th>
                      <th className="pb-3 font-medium">End Date</th>
                      <th className="pb-3 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {schedules.map((schedule) => (
                      <tr key={schedule.id} className="border-b border-[var(--border)]/50 last:border-0">
                        <td className="py-4">{schedule.action || '—'}</td>
                        <td className="py-4"><Badge variant={schedule.state === 'Enabled' ? 'success' : 'secondary'}>{schedule.state}</Badge></td>
                        <td className="py-4">{schedule.description || '—'}</td>
                        <td className="py-4 font-mono">{schedule.schedule || '—'}</td>
                        <td className="py-4">{schedule.timezone || '—'}</td>
                        <td className="py-4">{schedule.startdate ? new Date(schedule.startdate).toLocaleString() : '—'}</td>
                        <td className="py-4">{schedule.enddate ? new Date(schedule.enddate).toLocaleString() : '—'}</td>
                        <td className="py-4">{schedule.created ? new Date(schedule.created).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Settings ── */}
        <TabsContent value="settings">
          <div className="mt-4 space-y-4">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[var(--accent)]" /> General Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vmLoading ? (
                  <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-8 rounded bg-[var(--border)] animate-pulse" />)}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start gap-3 h-auto py-3" onClick={() => handleAction('changeName')}>
                      <div className="p-2 rounded-lg bg-blue-500/20"><Edit className="w-4 h-4 text-blue-400" /></div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Change Display Name</p>
                        <p className="text-xs text-[var(--text-muted)]">{vm?.displayname || 'Not set'}</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start gap-3 h-auto py-3" onClick={() => handleAction('changeHostname')}>
                      <div className="p-2 rounded-lg bg-green-500/20"><Server className="w-4 h-4 text-green-400" /></div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Change Hostname</p>
                        <p className="text-xs text-[var(--text-muted)]">{vm?.hostname || 'Auto-assigned'}</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start gap-3 h-auto py-3" onClick={() => handleAction('changeGroup')}>
                      <div className="p-2 rounded-lg bg-purple-500/20"><Layers className="w-4 h-4 text-purple-400" /></div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Change Instance Group</p>
                        <p className="text-xs text-[var(--text-muted)]">{vm?.instancegroupname || 'No group'}</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start gap-3 h-auto py-3" onClick={() => handleAction('changeOS')}>
                      <div className="p-2 rounded-lg bg-orange-500/20"><Disc className="w-4 h-4 text-orange-400" /></div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Change OS / Template</p>
                        <p className="text-xs text-[var(--text-muted)]">{vm?.templatename || '—'}</p>
                      </div>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resource & Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[var(--accent)]" /> Resource Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vmLoading ? (
                  <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-8 rounded bg-[var(--border)] animate-pulse" />)}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start gap-3 h-auto py-3" onClick={() => handleAction('scale')}>
                      <div className="p-2 rounded-lg bg-indigo-500/20"><TrendingUp className="w-4 h-4 text-indigo-400" /></div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Change Service Plan</p>
                        <p className="text-xs text-[var(--text-muted)]">{vm?.serviceofferingname || '—'}</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start gap-3 h-auto py-3" onClick={() => handleAction('addVolume')}>
                      <div className="p-2 rounded-lg bg-cyan-500/20"><HardDrive className="w-4 h-4 text-cyan-400" /></div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Add / Attach Volume</p>
                        <p className="text-xs text-[var(--text-muted)]">{volumes.length} volumes attached</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start gap-3 h-auto py-3" onClick={() => handleAction('toggleHA')}>
                      <div className="p-2 rounded-lg bg-pink-500/20"><Shield className="w-4 h-4 text-pink-400" /></div>
                      <div className="text-left">
                        <p className="text-sm font-medium">{vm?.haenable ? 'Disable' : 'Enable'} HA</p>
                        <p className="text-xs text-[var(--text-muted)]">High Availability: {vm?.haenable ? 'On' : 'Off'}</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start gap-3 h-auto py-3" onClick={() => handleAction('toggleScaling')}>
                      <div className="p-2 rounded-lg bg-amber-500/20"><Zap className="w-4 h-4 text-amber-400" /></div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Dynamic Scaling</p>
                        <p className="text-xs text-[var(--text-muted)]">{vm?.isdynamicallyscalable ? 'Enabled' : 'Disabled'}</p>
                      </div>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security & Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[var(--accent)]" /> Security & Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vmLoading ? (
                  <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-8 rounded bg-[var(--border)] animate-pulse" />)}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start gap-3 h-auto py-3" onClick={() => handleAction('resetPassword')}>
                      <div className="p-2 rounded-lg bg-red-500/20"><Lock className="w-4 h-4 text-red-400" /></div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Reset Password</p>
                        <p className="text-xs text-[var(--text-muted)]">Generate new root password</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start gap-3 h-auto py-3" onClick={() => router.push('/admin/compute/ssh-keys')}>
                      <div className="p-2 rounded-lg bg-teal-500/20"><Key className="w-4 h-4 text-teal-400" /></div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Manage SSH Keys</p>
                        <p className="text-xs text-[var(--text-muted)]">{vm?.keypair || 'No key pair'}</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start gap-3 h-auto py-3" onClick={() => handleAction('startupScript')}>
                      <div className="p-2 rounded-lg bg-lime-500/20"><FileText className="w-4 h-4 text-lime-400" /></div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Startup Script / User Data</p>
                        <p className="text-xs text-[var(--text-muted)]">{vm?.userdata ? 'Configured' : 'Not configured'}</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start gap-3 h-auto py-3" onClick={() => handleAction('toggleDeleteProtection')}>
                      <div className="p-2 rounded-lg bg-rose-500/20"><Shield className="w-4 h-4 text-rose-400" /></div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Delete Protection</p>
                        <p className="text-xs text-[var(--text-muted)]">{vm?.deletedProtection ? 'Enabled' : 'Disabled'}</p>
                      </div>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Network & Firewall */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-[var(--accent)]" /> Network & Firewall
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vmLoading ? (
                  <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-8 rounded bg-[var(--border)] animate-pulse" />)}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start gap-3 h-auto py-3" onClick={() => router.push(`/admin/network/networks?vmid=${id}`)}>
                      <div className="p-2 rounded-lg bg-blue-500/20"><Network className="w-4 h-4 text-blue-400" /></div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Manage Networks</p>
                        <p className="text-xs text-[var(--text-muted)]">{nics.length} NICs attached</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start gap-3 h-auto py-3" onClick={() => router.push(`/admin/network/firewall?vmid=${id}`)}>
                      <div className="p-2 rounded-lg bg-red-500/20"><Shield className="w-4 h-4 text-red-400" /></div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Firewall Rules</p>
                        <p className="text-xs text-[var(--text-muted)]">Configure security groups</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start gap-3 h-auto py-3" onClick={() => router.push(`/admin/network/public-ips?vmid=${id}`)}>
                      <div className="p-2 rounded-lg bg-sky-500/20"><Globe className="w-4 h-4 text-sky-400" /></div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Port Forwarding</p>
                        <p className="text-xs text-[var(--text-muted)]">Manage public IPs & rules</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start gap-3 h-auto py-3" onClick={() => handleAction('configureIPv6')}>
                      <div className="p-2 rounded-lg bg-violet-500/20"><Wifi className="w-4 h-4 text-violet-400" /></div>
                      <div className="text-left">
                        <p className="text-sm font-medium">IPv6 Configuration</p>
                        <p className="text-xs text-[var(--text-muted)]">Configure IPv6 addressing</p>
                      </div>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Events ── */}
        <TabsContent value="events">
          <div className="mt-4 space-y-4">
            {/* Header with filter and refresh */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Level Filter */}
                <select
                  value={eventLevelFilter}
                  onChange={(e) => setEventLevelFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="ALL">All Levels</option>
                  <option value="INFO">INFO</option>
                  <option value="WARN">WARN</option>
                  <option value="ERROR">ERROR</option>
                </select>
                <span className="text-xs text-[var(--text-muted)]">
                  {eventLoading && 'Loading...'}
                  {!eventLoading && eventData?.count !== undefined && `${eventData.count} events`}
                  {!eventLoading && eventError && 'Error loading'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)]">Auto-refresh: 10s</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => mutateEvents(undefined, { revalidate: true })}
                  disabled={eventLoading}
                  className="gap-2"
                >
                  <RefreshCw className={cn("w-4 h-4", eventLoading && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </div>

            {eventLoading && !eventData ? (
              <Card>
                <CardContent className="p-8 flex justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </CardContent>
              </Card>
            ) : eventError ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
                  <p className="text-red-400 mb-2">Failed to load events</p>
                  <p className="text-xs text-[var(--text-muted)] mb-4">
                    {(eventError as Error)?.message || 'Unknown error'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => mutateEvents(undefined, { revalidate: true })}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Retry
                  </Button>
                </CardContent>
              </Card>
            ) : !events || events.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
                  <p className="text-[var(--text-muted)]">No events found for this instance</p>
                  <p className="text-xs text-[var(--text-muted)] mt-2">Events will appear here when actions are performed</p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
                <table className="w-full">
                  <thead className="bg-[var(--bg)]">
                    <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
                      <th className="pb-3 pt-3 px-4 font-medium">Level</th>
                      <th className="pb-3 pt-3 px-4 font-medium">Type</th>
                      <th className="pb-3 pt-3 px-4 font-medium">State</th>
                      <th className="pb-3 pt-3 px-4 font-medium">Username</th>
                      <th className="pb-3 pt-3 px-4 font-medium">Domain</th>
                      <th className="pb-3 pt-3 px-4 font-medium">Created</th>
                      <th className="pb-3 pt-3 px-4 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {Array.isArray(events) && events.map((event, i) => (
                      <tr
                        key={event?.id || i}
                        className={cn(
                          'border-b border-[var(--border)]/50 last:border-0 hover:bg-[var(--bg)]/50 transition-colors',
                          event?.level === 'ERROR' && 'bg-red-500/5',
                          event?.level === 'WARN' && 'bg-yellow-500/5'
                        )}
                      >
                        <td className="py-3 px-4">
                          <Badge variant={
                            event?.level === 'ERROR' ? 'destructive' :
                            event?.level === 'WARN' ? 'warning' :
                            'secondary'
                          }>
                            {event?.level || 'INFO'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">
                          {event?.type || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={
                            event?.state === 'Completed' ? 'success' :
                            event?.state === 'Failed' ? 'destructive' :
                            'secondary'
                          }>
                            {event?.state || '—'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{event?.username || '—'}</td>
                        <td className="py-3 px-4">{event?.domain || '—'}</td>
                        <td className="py-3 px-4 text-xs">
                          {event?.created ? new Date(event.created).toLocaleString() : '—'}
                        </td>
                        <td className="py-3 px-4 max-w-md">
                          <p className="truncate text-xs" title={event?.description}>
                            {event?.description || '—'}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Comments ── */}
        <TabsContent value="comments">
          <div className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[var(--accent)]" /> Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)] opacity-40" />
                  <p className="text-[var(--text-muted)] mb-2">No comments yet</p>
                  <p className="text-xs text-[var(--text-muted)]">Comments feature coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Firewall ── */}
        <TabsContent value="firewall">
          <div className="mt-4 space-y-4">
            {/* Header with count and add button */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">
                {firewallLoading && 'Loading firewall rules...'}
                {!firewallLoading && firewallData?.count !== undefined && `${firewallData.count} rules`}
                {!firewallLoading && firewallError && (
                  <span className="text-red-400">Error: {(firewallError as Error)?.message || 'Failed to load'}</span>
                )}
              </span>
              <Button variant="outline" size="sm" onClick={() => handleAction('addFirewallRule')} className="gap-2">
                <Plus className="w-4 h-4" /> Add Firewall Rule
              </Button>
            </div>

            {firewallLoading && !firewallData ? (
              <Card><CardContent className="p-8 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></CardContent></Card>
            ) : firewallError ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
                  <p className="text-red-400 mb-2">Failed to load firewall rules</p>
                  <p className="text-xs text-[var(--text-muted)] mb-4">{(firewallError as Error)?.message || 'Unknown error'}</p>
                </CardContent>
              </Card>
            ) : !firewallRules || firewallRules.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Shield className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
                  <p className="text-[var(--text-muted)]">No firewall rules configured</p>
                  <p className="text-xs text-[var(--text-muted)] mt-2">Add rules to control inbound/outbound traffic</p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
                <table className="w-full">
                  <thead className="bg-[var(--bg)]">
                    <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
                      <th className="pb-3 pt-3 px-4 font-medium">Protocol</th>
                      <th className="pb-3 pt-3 px-4 font-medium">Start Port</th>
                      <th className="pb-3 pt-3 px-4 font-medium">End Port</th>
                      <th className="pb-3 pt-3 px-4 font-medium">CIDR</th>
                      <th className="pb-3 pt-3 px-4 font-medium">Action</th>
                      <th className="pb-3 pt-3 px-4 font-medium">State</th>
                      <th className="pb-3 pt-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {Array.isArray(firewallRules) && firewallRules.map((rule, idx) => (
                      <tr key={rule?.id || idx} className="border-b border-[var(--border)]/50 last:border-0 hover:bg-[var(--bg)]/50">
                        <td className="py-3 px-4">{rule?.protocol || '—'}</td>
                        <td className="py-3 px-4 font-mono">{rule?.startport || rule?.icmptype || '—'}</td>
                        <td className="py-3 px-4 font-mono">{rule?.endport || rule?.icmpcode || '—'}</td>
                        <td className="py-3 px-4 font-mono text-xs">{rule?.cidrlist || '0.0.0.0/0'}</td>
                        <td className="py-3 px-4">
                          <Badge variant={rule?.action === 'Allow' ? 'success' : 'destructive'}>
                            {rule?.action || 'Allow'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={rule?.state === 'Active' ? 'success' : 'secondary'}>
                            {rule?.state || 'Active'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction('deleteFirewallRule', { ruleId: rule?.id })}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Port Forwarding ── */}
        <TabsContent value="portforwarding">
          <div className="mt-4 space-y-4">
            {/* Header with count and add button */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">
                {pfLoading && 'Loading port forwarding rules...'}
                {!pfLoading && portForwardingData?.count !== undefined && `${portForwardingData.count} rules`}
                {!pfLoading && pfError && (
                  <span className="text-red-400">Error: {(pfError as Error)?.message || 'Failed to load'}</span>
                )}
              </span>
              <Button variant="outline" size="sm" onClick={() => handleAction('addPortForwardingRule')} className="gap-2">
                <Plus className="w-4 h-4" /> Add Port Forwarding Rule
              </Button>
            </div>

            {pfLoading && !portForwardingData ? (
              <Card><CardContent className="p-8 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></CardContent></Card>
            ) : pfError ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
                  <p className="text-red-400 mb-2">Failed to load port forwarding rules</p>
                  <p className="text-xs text-[var(--text-muted)] mb-4">{(pfError as Error)?.message || 'Unknown error'}</p>
                </CardContent>
              </Card>
            ) : !portForwardingRules || portForwardingRules.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Globe className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
                  <p className="text-[var(--text-muted)]">No port forwarding rules configured</p>
                  <p className="text-xs text-[var(--text-muted)] mt-2">Forward external ports to VM private ports</p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
                <table className="w-full">
                  <thead className="bg-[var(--bg)]">
                    <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
                      <th className="pb-3 pt-3 px-4 font-medium">Public IP</th>
                      <th className="pb-3 pt-3 px-4 font-medium">Public Port</th>
                      <th className="pb-3 pt-3 px-4 font-medium">Private IP</th>
                      <th className="pb-3 pt-3 px-4 font-medium">Private Port</th>
                      <th className="pb-3 pt-3 px-4 font-medium">Protocol</th>
                      <th className="pb-3 pt-3 px-4 font-medium">State</th>
                      <th className="pb-3 pt-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {Array.isArray(portForwardingRules) && portForwardingRules.map((rule, idx) => (
                      <tr key={rule?.id || idx} className="border-b border-[var(--border)]/50 last:border-0 hover:bg-[var(--bg)]/50">
                        <td className="py-3 px-4 font-mono text-xs">{rule?.ipaddress || rule?.publicip || '—'}</td>
                        <td className="py-3 px-4 font-mono">{rule?.publicport || rule?.publicstartport || '—'}</td>
                        <td className="py-3 px-4 font-mono text-xs">{rule?.virtualmachinename || rule?.privateip || '—'}</td>
                        <td className="py-3 px-4 font-mono">{rule?.privateport || rule?.privateendport || '—'}</td>
                        <td className="py-3 px-4">{rule?.protocol || 'TCP'}</td>
                        <td className="py-3 px-4">
                          <Badge variant={rule?.state === 'Active' ? 'success' : 'secondary'}>
                            {rule?.state || 'Active'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction('deletePortForwardingRule', { ruleId: rule?.id })}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
