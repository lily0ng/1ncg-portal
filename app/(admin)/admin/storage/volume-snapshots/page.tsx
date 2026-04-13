'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSWR from 'swr'
import { Trash2, MoreHorizontal, Image, HardDrive, X, Search } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DataTable } from '@/components/shared/DataTable'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Snapshot {
  id: string
  name: string
  state: string
  volumeid: string
  volumename: string
  size?: number
  intervaltype?: string
  zonename?: string
  account: string
  created: string
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
          className="relative z-10 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
        >
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

export default function VolumeSnapshotsPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/storage/snapshots', fetcher)
  const snapshots: Snapshot[] = data?.snapshots || []

  const [templateModal, setTemplateModal] = useState<Snapshot | null>(null)
  const [volumeModal, setVolumeModal] = useState<Snapshot | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Snapshot | null>(null)
  const [templateForm, setTemplateForm] = useState({ name: '', displaytext: '' })
  const [volumeName, setVolumeName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = snapshots.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.volumename?.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreateTemplate = async () => {
    if (!templateForm.name || !templateModal) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/images/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...templateForm, snapshotid: templateModal.id }),
      })
      if (!res.ok) throw new Error()
      toast.success('Template created from snapshot')
      setTemplateModal(null)
      setTemplateForm({ name: '', displaytext: '' })
    } catch {
      toast.error('Failed to create template')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateVolume = async () => {
    if (!volumeName || !volumeModal) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/storage/volumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: volumeName, snapshotid: volumeModal.id }),
      })
      if (!res.ok) throw new Error()
      toast.success('Volume created from snapshot')
      setVolumeModal(null)
      setVolumeName('')
    } catch {
      toast.error('Failed to create volume')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/storage/snapshots/${deleteConfirm.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Snapshot deleted')
      setDeleteConfirm(null)
      mutate()
    } catch {
      toast.error('Failed to delete snapshot')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'name', header: 'Name', sortable: true,
      cell: (s: Snapshot) => (
        <div>
          <p className="font-medium text-white">{s.name}</p>
          <p className="text-xs text-slate-500 font-mono">{s.id?.slice(0, 8)}...</p>
        </div>
      ),
    },
    { key: 'state', header: 'State', cell: (s: Snapshot) => <StatusBadge status={s.state} /> },
    { key: 'volumename', header: 'Volume', cell: (s: Snapshot) => <span className="text-sm text-slate-300">{s.volumename || '-'}</span> },
    {
      key: 'size', header: 'Size',
      cell: (s: Snapshot) => <span className="text-sm text-slate-300">{s.size ? `${(s.size / 1073741824).toFixed(2)} GB` : '-'}</span>,
    },
    { key: 'intervaltype', header: 'Interval', cell: (s: Snapshot) => <span className="text-sm text-slate-400">{s.intervaltype || 'Manual'}</span> },
    { key: 'zonename', header: 'Zone', cell: (s: Snapshot) => <span className="text-sm text-slate-400">{s.zonename || '-'}</span> },
    { key: 'account', header: 'Account', cell: (s: Snapshot) => <span className="text-sm text-slate-400">{s.account}</span> },
    {
      key: 'created', header: 'Created', sortable: true,
      cell: (s: Snapshot) => <span className="text-sm text-slate-400">{s.created ? new Date(s.created).toLocaleDateString() : '-'}</span>,
    },
  ]

  const rowActions = (s: Snapshot) => (
    <DropdownMenu items={[
      { label: 'Create Template', icon: <Image className="w-3.5 h-3.5" />, onClick: () => setTemplateModal(s) },
      { label: 'Create Volume', icon: <HardDrive className="w-3.5 h-3.5" />, onClick: () => setVolumeModal(s) },
      { label: 'Delete', icon: <Trash2 className="w-3.5 h-3.5" />, onClick: () => setDeleteConfirm(s), danger: true },
    ]} />
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader title="Volume Snapshots" description="Manage point-in-time snapshots of your volumes" />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search snapshots..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          Failed to load snapshots. Please try again.
        </div>
      )}

      <DataTable columns={columns} data={filtered} loading={isLoading} rowActions={rowActions} searchable={false} />

      {/* Create Template Modal */}
      <Modal open={!!templateModal} onClose={() => setTemplateModal(null)} title="Create Template from Snapshot">
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">Create a template from snapshot <strong className="text-white">{templateModal?.name}</strong>.</p>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Template Name <span className="text-red-400">*</span></label>
            <input type="text" value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              placeholder="my-template"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Display Text</label>
            <input type="text" value={templateForm.displaytext} onChange={(e) => setTemplateForm({ ...templateForm, displaytext: e.target.value })}
              placeholder="My Template Description"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setTemplateModal(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm">Cancel</button>
            <button onClick={handleCreateTemplate} disabled={submitting || !templateForm.name}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-medium disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Volume Modal */}
      <Modal open={!!volumeModal} onClose={() => setVolumeModal(null)} title="Create Volume from Snapshot">
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">Create a volume from snapshot <strong className="text-white">{volumeModal?.name}</strong>.</p>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Volume Name <span className="text-red-400">*</span></label>
            <input type="text" value={volumeName} onChange={(e) => setVolumeName(e.target.value)}
              placeholder="my-volume"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setVolumeModal(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm">Cancel</button>
            <button onClick={handleCreateVolume} disabled={submitting || !volumeName}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-medium disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Volume'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Snapshot</h3>
            <p className="text-slate-400 mb-6">Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={submitting} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors text-sm font-medium disabled:opacity-50">
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
