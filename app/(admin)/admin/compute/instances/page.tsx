'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Play, Square, RotateCcw, Trash2, Terminal, Plus,
  Search, RefreshCw, Server, Filter, MoreVertical,
  Cpu, MemoryStick, HardDrive, Globe,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { VMCreateModal } from '@/components/compute/VMCreateModal'
import { cn } from '@/lib/utils'

const STATE_VARIANTS: Record<string, 'success' | 'warning' | 'destructive' | 'secondary' | 'info'> = {
  Running: 'success',
  Stopped: 'warning',
  Error: 'destructive',
  Destroyed: 'secondary',
  Starting: 'info',
  Stopping: 'warning',
  Migrating: 'info',
}

const STATE_DOT: Record<string, string> = {
  Running: 'bg-green-500',
  Stopped: 'bg-yellow-500',
  Error: 'bg-red-500',
  Destroyed: 'bg-gray-500',
  Starting: 'bg-blue-500 animate-pulse',
  Stopping: 'bg-orange-500 animate-pulse',
  Migrating: 'bg-purple-500 animate-pulse',
}

export default function InstancesPage() {
  const router = useRouter()
  const [vms, setVMs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [deployOpen, setDeployOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchVMs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await fetch('/api/compute/vms')
      const data = await res.json()
      setVMs(data.vms || [])
    } catch {
      toast.error('Failed to fetch instances')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchVMs() }, [fetchVMs])

  const handleAction = async (action: string, id: string, name: string) => {
    setActionLoading(`${action}-${id}`)
    try {
      const res = await fetch(`/api/compute/vms/${id}/${action}`, { method: 'POST' })
      if (res.ok) {
        toast.success(`${name}: ${action} initiated`)
        setTimeout(() => fetchVMs(true), 2000)
      } else {
        const err = await res.json()
        toast.error(err.error || `Failed to ${action}`)
      }
    } catch {
      toast.error(`Failed to ${action} instance`)
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = vms.filter((vm) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      vm.name?.toLowerCase().includes(q) ||
      vm.displayname?.toLowerCase().includes(q) ||
      vm.state?.toLowerCase().includes(q) ||
      vm.zonename?.toLowerCase().includes(q) ||
      vm.templatename?.toLowerCase().includes(q) ||
      vm.ipaddress?.includes(q)
    )
  })

  const runningCount = vms.filter((v) => v.state === 'Running').length
  const stoppedCount = vms.filter((v) => v.state === 'Stopped').length
  const errorCount = vms.filter((v) => v.state === 'Error').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Instances</h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">
            {loading ? 'Loading…' : `${vms.length} total · ${runningCount} running · ${stoppedCount} stopped${errorCount > 0 ? ` · ${errorCount} error` : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchVMs(true)}
            disabled={refreshing}
          >
            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
          </Button>
          <Button onClick={() => setDeployOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Deploy Instance
          </Button>
        </div>
      </div>

      {/* Stats mini cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Play className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text)]">{runningCount}</p>
              <p className="text-xs text-[var(--text-muted)]">Running</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Square className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text)]">{stoppedCount}</p>
              <p className="text-xs text-[var(--text-muted)]">Stopped</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Server className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text)]">{vms.length}</p>
              <p className="text-xs text-[var(--text-muted)]">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <Input
                placeholder="Search instances..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Server className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
              <p className="text-[var(--text-muted)]">{search ? 'No instances match your search' : 'No instances found'}</p>
              {!search && (
                <Button onClick={() => setDeployOpen(true)} className="mt-4 gap-2">
                  <Plus className="w-4 h-4" />
                  Deploy your first instance
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden md:table-cell">Specs</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden lg:table-cell">Template</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden lg:table-cell">Zone</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden xl:table-cell">IP</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filtered.map((vm) => (
                    <motion.tr
                      key={vm.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-[var(--bg)] cursor-pointer transition-colors group"
                      onClick={() => router.push(`/admin/compute/instances/${vm.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-blue-500/20 shrink-0">
                            <Server className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[var(--text)] truncate">{vm.displayname || vm.name}</p>
                            <p className="text-xs text-[var(--text-muted)] truncate font-mono">{vm.id?.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn('w-2 h-2 rounded-full shrink-0', STATE_DOT[vm.state] || 'bg-gray-500')} />
                          <Badge variant={STATE_VARIANTS[vm.state] as any || 'secondary'} className="text-xs">
                            {vm.state}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                          {vm.cpunumber && (
                            <span className="flex items-center gap-1">
                              <Cpu className="w-3 h-3" />{vm.cpunumber} vCPU
                            </span>
                          )}
                          {vm.memory && (
                            <span className="flex items-center gap-1">
                              <MemoryStick className="w-3 h-3" />{Math.round(vm.memory / 1024)}GB
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <p className="text-sm text-[var(--text-muted)] truncate max-w-[160px]">{vm.templatename || '—'}</p>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <p className="text-sm text-[var(--text-muted)]">{vm.zonename || '—'}</p>
                      </td>
                      <td className="px-6 py-4 hidden xl:table-cell">
                        <p className="text-sm font-mono text-[var(--text-muted)]">{vm.ipaddress || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          {vm.state === 'Stopped' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                              onClick={() => handleAction('start', vm.id, vm.displayname || vm.name)}
                              disabled={actionLoading === `start-${vm.id}`}
                              title="Start"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          {vm.state === 'Running' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                                onClick={() => handleAction('stop', vm.id, vm.displayname || vm.name)}
                                disabled={actionLoading === `stop-${vm.id}`}
                                title="Stop"
                              >
                                <Square className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                onClick={() => handleAction('reboot', vm.id, vm.displayname || vm.name)}
                                disabled={actionLoading === `reboot-${vm.id}`}
                                title="Reboot"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                            onClick={() => window.open(`/api/compute/vms/${vm.id}/console`, '_blank')}
                            title="Console"
                          >
                            <Terminal className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => handleAction('destroy', vm.id, vm.displayname || vm.name)}
                            disabled={actionLoading === `destroy-${vm.id}`}
                            title="Destroy"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <VMCreateModal open={deployOpen} onClose={() => setDeployOpen(false)} onRefresh={() => { setDeployOpen(false); fetchVMs(true) }} />
    </div>
  )
}
