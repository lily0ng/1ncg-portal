'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSWR from 'swr'
import { Plus, Trash2, RotateCcw, MoreHorizontal, X, Search } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DataTable } from '@/components/shared/DataTable'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Backup {
  id: string
  name: string
  state: string
  vmname?: string
  vmid?: string
  size?: number
  zonename: string
  backupofferingname?: string
  account?: string
  created: string
}

interface VM {
  id: string
  name: string
  displayname?: string
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
          className="relative z-10 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function DropdownMenu({ items }: { items: { label: string; icon?: React.ReactNode; onClick: () => void; danger?: boolean }[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-xl min-w-[180px] py-1">
            {items.map((item, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setOpen(false); item.onClick() }}
                className={cn('w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
                  item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-300 hover:bg-slate-700')}>
                {item.icon}{item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function BackupsPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/storage/backups', fetcher)
  const { data: vmsData } = useSWR('/api/compute/vms', fetcher)

  const backups: Backup[] = data?.backup || data?.backups || []
  const vms: VM[] = vmsData?.virtualmachine || vmsData?.vms || []

  const [createModal, setCreateModal] = useState(false)
  const [restoreConfirm, setRestoreConfirm] = useState<Backup | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Backup | null>(null)
  const [selectedVmId, setSelectedVmId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = backups.filter((b) =>
    !search || b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.vmname?.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    if (!selectedVmId) { toast.error('Please select a VM'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/storage/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ virtualmachineid: selectedVmId }),
      })
      if (!res.ok) throw new Error()
      toast.success('Backup created successfully')
      setCreateModal(false)
      setSelectedVmId('')
      mutate()
    } catch {
      toast.error('Failed to create backup')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRestore = async () => {
    if (!restoreConfirm) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/storage/backups/${restoreConfirm.id}/restore`, { method: 'POST' })
      if (!res.ok) throw new Error()
      toast.success('Backup restore initiated')
      setRestoreConfirm(null)
    } catch {
      toast.error('Failed to restore backup')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/storage/backups/${deleteConfirm.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Backup deleted')
      setDeleteConfirm(null)
      mutate()
    } catch {
      toast.error('Failed to delete backup')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'name', header: 'Name', sortable: true,
      cell: (b: Backup) => (
        <div>
          <p className="font-medium text-white">{b.name}</p>
          <p className="text-xs text-slate-500 font-mono">{b.id?.slice(0, 8)}...</p>
        </div>
      ),
    },
    { key: 'vmname', header: 'VM', cell: (b: Backup) => <span className="text-sm text-slate-300">{b.vmname || '-'}</span> },
    { key: 'state', header: 'State', cell: (b: Backup) => <StatusBadge status={b.state} /> },
    {
      key: 'size', header: 'Size',
      cell: (b: Backup) => <span className="text-sm text-slate-300">{b.size ? `${(b.size / 1073741824).toFixed(2)} GB` : '-'}</span>,
    },
    { key: 'zonename', header: 'Zone', cell: (b: Backup) => <span className="text-sm text-slate-400">{b.zonename}</span> },
    { key: 'backupofferingname', header: 'Backup Offering', cell: (b: Backup) => <span className="text-sm text-slate-400">{b.backupofferingname || '-'}</span> },
    {
      key: 'created', header: 'Created', sortable: true,
      cell: (b: Backup) => <span className="text-sm text-slate-400">{b.created ? new Date(b.created).toLocaleDateString() : '-'}</span>,
    },
  ]

  const rowActions = (b: Backup) => (
    <DropdownMenu items={[
      { label: 'Restore to VM', icon: <RotateCcw className="w-3.5 h-3.5" />, onClick: () => setRestoreConfirm(b) },
      { label: 'Delete', icon: <Trash2 className="w-3.5 h-3.5" />, onClick: () => setDeleteConfirm(b), danger: true },
    ]} />
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Backups"
        description="Manage VM backups and recovery points"
        action={
          <button onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors text-sm">
            <Plus className="w-4 h-4" />
            Create Backup
          </button>
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search backups..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          Failed to load backups. Please try again.
        </div>
      )}

      <DataTable columns={columns} data={filtered} loading={isLoading} rowActions={rowActions} searchable={false} />

      {/* Create Backup Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Backup">
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">Select a virtual machine to create a backup for.</p>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Virtual Machine <span className="text-red-400">*</span></label>
            <select value={selectedVmId} onChange={(e) => setSelectedVmId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select VM</option>
              {vms.map((vm) => <option key={vm.id} value={vm.id}>{vm.displayname || vm.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setCreateModal(false)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm">Cancel</button>
            <button onClick={handleCreate} disabled={submitting || !selectedVmId}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-medium disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Backup'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Restore Confirm */}
      {restoreConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRestoreConfirm(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Restore Backup</h3>
            <p className="text-slate-400 mb-6">Restore "{restoreConfirm.name}" to VM "{restoreConfirm.vmname}"? This will overwrite current VM data.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRestoreConfirm(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm">Cancel</button>
              <button onClick={handleRestore} disabled={submitting}
                className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors text-sm font-medium disabled:opacity-50">
                {submitting ? 'Restoring...' : 'Restore'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Backup</h3>
            <p className="text-slate-400 mb-6">Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={submitting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors text-sm font-medium disabled:opacity-50">
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
