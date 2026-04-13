'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Plus, Trash2, AlertCircle, RefreshCw, Camera } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface VMSnapshot {
  id: string
  name: string
  virtualmachineid?: string
  virtualmachinename?: string
  state: string
  type?: string
  snapshotmemory?: boolean
  created?: string
}

interface VirtualMachine {
  id: string
  name: string
  displayname?: string
  state: string
}

export default function InstanceSnapshotsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ virtualmachineid: '', name: '', snapshotmemory: false })
  const [submitting, setSubmitting] = useState(false)

  const { data, error, isLoading, mutate } =
    useSWR<{ snapshots: VMSnapshot[] }>('/api/compute/snapshots', fetcher, { refreshInterval: 30000 })

  const { data: vmData } =
    useSWR<{ vms: VirtualMachine[] }>('/api/compute/vms', fetcher)

  const handleDelete = async (snap: VMSnapshot) => {
    if (!confirm(`Delete snapshot "${snap.name}"?`)) return
    try {
      const res = await fetch(`/api/compute/snapshots/${snap.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success(`Snapshot "${snap.name}" deleted`)
      mutate()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete snapshot')
    }
  }

  const handleCreate = async () => {
    if (!form.virtualmachineid) { toast.error('Please select a VM'); return }
    if (!form.name.trim()) { toast.error('Please enter a snapshot name'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/compute/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to create snapshot')
      toast.success('Snapshot creation initiated')
      setModalOpen(false)
      setForm({ virtualmachineid: '', name: '', snapshotmemory: false })
      mutate()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create snapshot')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      cell: (snap: VMSnapshot) => (
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-slate-400 shrink-0" />
          <div>
            <p className="font-medium text-white">{snap.name}</p>
            <p className="text-xs text-slate-500 font-mono">{snap.id}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'virtualmachinename',
      header: 'VM Name',
      cell: (snap: VMSnapshot) => <span className="text-sm text-slate-300">{snap.virtualmachinename ?? '—'}</span>,
      sortable: true,
    },
    {
      key: 'state',
      header: 'State',
      cell: (snap: VMSnapshot) => <StatusBadge status={(snap.state ?? 'unknown').toLowerCase()} />,
      sortable: true,
    },
    {
      key: 'type',
      header: 'Type',
      cell: (snap: VMSnapshot) => <span className="text-sm text-slate-300">{snap.type ?? '—'}</span>,
    },
    {
      key: 'snapshotmemory',
      header: 'Memory Snapshot',
      cell: (snap: VMSnapshot) => (
        <span className={snap.snapshotmemory ? 'text-green-400 text-sm' : 'text-slate-500 text-sm'}>
          {snap.snapshotmemory ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      cell: (snap: VMSnapshot) => (
        <span className="text-sm text-slate-300">
          {snap.created ? new Date(snap.created).toLocaleString() : '—'}
        </span>
      ),
      sortable: true,
    },
  ]

  const rowActions = (snap: VMSnapshot) => (
    <button
      onClick={() => handleDelete(snap)}
      className="flex items-center gap-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs transition-colors"
    >
      <Trash2 className="w-3 h-3" /> Delete
    </button>
  )

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-slate-400">Failed to load snapshots</p>
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
        title="VM Snapshots"
        description="Manage VM snapshots across all instances"
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Snapshot
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.snapshots ?? []}
        loading={isLoading}
        rowActions={rowActions}
      />

      {/* Create Snapshot Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-400" /> Create VM Snapshot
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Select VM</label>
                <select
                  value={form.virtualmachineid}
                  onChange={e => setForm(f => ({ ...f, virtualmachineid: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— Select a VM —</option>
                  {vmData?.vms?.map(vm => (
                    <option key={vm.id} value={vm.id}>{vm.displayname || vm.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Snapshot Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="my-snapshot"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.snapshotmemory}
                  onChange={e => setForm(f => ({ ...f, snapshotmemory: e.target.checked }))}
                  className="rounded border-slate-600 bg-slate-800 text-blue-500"
                />
                <span className="text-sm text-slate-300">Include memory state (quiesced snapshot)</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating…' : 'Create Snapshot'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
