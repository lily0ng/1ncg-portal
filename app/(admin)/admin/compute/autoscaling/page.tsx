'use client'

import useSWR from 'swr'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { AlertCircle, RefreshCw, ToggleLeft, ToggleRight, Trash2, Scale } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface AutoScaleGroup {
  id: string
  name: string
  state?: string
  minmembers?: number
  maxmembers?: number
  availablevirtualmachinecount?: number
  lbruleid?: string
  lbrulename?: string
  account?: string
  domain?: string
  created?: string
}

export default function AutoscalingPage() {
  const { data, error, isLoading, mutate } =
    useSWR<{ autoscalevmgroups: AutoScaleGroup[] }>('/api/compute/autoscaling', fetcher, { refreshInterval: 30000 })

  const handleToggle = async (group: AutoScaleGroup) => {
    const action = group.state?.toLowerCase() === 'enabled' ? 'disable' : 'enable'
    try {
      const res = await fetch(`/api/compute/autoscaling/${group.id}/${action}`, { method: 'POST' })
      if (!res.ok) throw new Error(`Failed to ${action} autoscale group`)
      toast.success(`Autoscale group "${group.name}" ${action}d`)
      mutate()
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} group`)
    }
  }

  const handleDelete = async (group: AutoScaleGroup) => {
    if (!confirm(`Delete autoscale group "${group.name}"?`)) return
    try {
      const res = await fetch(`/api/compute/autoscaling/${group.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success(`Autoscale group "${group.name}" deleted`)
      mutate()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete group')
    }
  }

  const groups = data?.autoscalevmgroups ?? []

  const columns = [
    {
      key: 'name',
      header: 'Name',
      cell: (g: AutoScaleGroup) => (
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <p className="font-medium text-white">{g.name}</p>
            <p className="text-xs text-slate-500 font-mono">{g.id}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'state',
      header: 'State',
      cell: (g: AutoScaleGroup) => <StatusBadge status={(g.state ?? 'disabled').toLowerCase()} />,
      sortable: true,
    },
    {
      key: 'minmembers',
      header: 'Min Members',
      cell: (g: AutoScaleGroup) => <span className="text-sm text-slate-300">{g.minmembers ?? '—'}</span>,
    },
    {
      key: 'maxmembers',
      header: 'Max Members',
      cell: (g: AutoScaleGroup) => <span className="text-sm text-slate-300">{g.maxmembers ?? '—'}</span>,
    },
    {
      key: 'availablevirtualmachinecount',
      header: 'Available VMs',
      cell: (g: AutoScaleGroup) => (
        <span className="text-sm font-semibold text-white">{g.availablevirtualmachinecount ?? 0}</span>
      ),
    },
    {
      key: 'lbrulename',
      header: 'Load Balancer Rule',
      cell: (g: AutoScaleGroup) => <span className="text-sm text-slate-300">{g.lbrulename ?? '—'}</span>,
    },
    {
      key: 'created',
      header: 'Created',
      cell: (g: AutoScaleGroup) => (
        <span className="text-sm text-slate-300">{g.created ? new Date(g.created).toLocaleDateString() : '—'}</span>
      ),
      sortable: true,
    },
  ]

  const rowActions = (g: AutoScaleGroup) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleToggle(g)}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
          g.state?.toLowerCase() === 'enabled'
            ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
            : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
        }`}
      >
        {g.state?.toLowerCase() === 'enabled'
          ? <><ToggleRight className="w-3 h-3" /> Disable</>
          : <><ToggleLeft className="w-3 h-3" /> Enable</>
        }
      </button>
      <button
        onClick={() => handleDelete(g)}
        className="flex items-center gap-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs transition-colors"
      >
        <Trash2 className="w-3 h-3" /> Delete
      </button>
    </div>
  )

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-slate-400">Failed to load autoscaling groups</p>
        <button onClick={() => mutate()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Autoscaling Groups"
        description="Manage VM autoscale groups for dynamic workload scaling"
      />

      {!isLoading && groups.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 gap-4 bg-slate-900/50 border border-slate-800 rounded-xl"
        >
          <Scale className="w-16 h-16 text-slate-600" />
          <h3 className="text-lg font-medium text-slate-400">No Autoscaling Groups</h3>
          <p className="text-sm text-slate-500 text-center max-w-sm">
            No autoscale VM groups have been configured. Create autoscale groups via the Load Balancer rules section.
          </p>
        </motion.div>
      ) : (
        <DataTable
          columns={columns}
          data={groups}
          loading={isLoading}
          rowActions={rowActions}
        />
      )}
    </motion.div>
  )
}
