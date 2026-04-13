'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSWR from 'swr'
import {
  Plus,
  MoreHorizontal,
  Download,
  Search,
  Paperclip,
  Unlink,
  Camera,
  Expand,
  Trash2,
  X,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { DataTable } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Volume {
  id: string
  name: string
  state: string
  type: string
  size: number
  vmname?: string
  vmid?: string
  zonename: string
  storagetype?: string
  storage?: string
  account: string
  created: string
  diskofferingname?: string
}

interface Zone {
  id: string
  name: string
}

interface VM {
  id: string
  name: string
  displayname?: string
}

interface DiskOffering {
  id: string
  name: string
  disksize?: number
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
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

function ConfirmDialog({ open, onClose, onConfirm, title, message }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-slate-400 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm">
          Cancel
        </button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors text-sm font-medium">
          Confirm
        </button>
      </div>
    </Modal>
  )
}

function DropdownMenu({ items }: { items: { label: string; icon?: React.ReactNode; onClick: () => void; danger?: boolean; disabled?: boolean }[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-xl min-w-[180px] py-1 overflow-hidden">
            {items.map((item, i) => (
              <button
                key={i}
                disabled={item.disabled}
                onClick={(e) => { e.stopPropagation(); setOpen(false); item.onClick() }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
                  item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-300 hover:bg-slate-700',
                  item.disabled && 'opacity-40 cursor-not-allowed'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function VolumesPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/storage/volumes', fetcher, { refreshInterval: 30000 })
  const { data: zonesData } = useSWR('/api/zones', fetcher)
  const { data: vmsData } = useSWR('/api/compute/vms', fetcher)
  const { data: diskOfferingsData } = useSWR('/api/service-offerings/disk', fetcher)

  const volumes: Volume[] = data?.volumess || data?.volumes || []
  const zones: Zone[] = zonesData?.zones || []
  const vms: VM[] = vmsData?.virtualmachine || vmsData?.vms || []
  const diskOfferings: DiskOffering[] = diskOfferingsData?.diskoffering || []

  const [search, setSearch] = useState('')
  const [filterZone, setFilterZone] = useState('')
  const [filterState, setFilterState] = useState('')
  const [filterType, setFilterType] = useState('')

  // Modals
  const [createModal, setCreateModal] = useState(false)
  const [attachModal, setAttachModal] = useState<Volume | null>(null)
  const [snapshotModal, setSnapshotModal] = useState<Volume | null>(null)
  const [resizeModal, setResizeModal] = useState<Volume | null>(null)
  const [detachConfirm, setDetachConfirm] = useState<Volume | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Volume | null>(null)

  // Form state
  const [createForm, setCreateForm] = useState({ name: '', diskofferingid: '', zoneid: '', size: '' })
  const [attachVmId, setAttachVmId] = useState('')
  const [snapshotName, setSnapshotName] = useState('')
  const [newSize, setNewSize] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const filteredVolumes = volumes.filter((v) => {
    if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterZone && v.zonename !== filterZone) return false
    if (filterState && v.state.toLowerCase() !== filterState.toLowerCase()) return false
    if (filterType && v.type !== filterType) return false
    return true
  })

  const exportCSV = () => {
    const headers = ['Name', 'State', 'Type', 'Size (GB)', 'VM', 'Zone', 'Account', 'Created']
    const rows = filteredVolumes.map((v) => [
      v.name, v.state, v.type,
      v.size ? (v.size / 1073741824).toFixed(2) : '0',
      v.vmname || '', v.zonename, v.account,
      v.created ? new Date(v.created).toLocaleDateString() : '',
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'volumes.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const handleCreate = async () => {
    if (!createForm.name || !createForm.diskofferingid || !createForm.zoneid) {
      toast.error('Please fill all required fields')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/storage/volumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Volume created successfully')
      setCreateModal(false)
      setCreateForm({ name: '', diskofferingid: '', zoneid: '', size: '' })
      mutate()
    } catch {
      toast.error('Failed to create volume')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAttach = async () => {
    if (!attachVmId || !attachModal) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/storage/volumes/${attachModal.id}/attach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ virtualmachineid: attachVmId }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Volume attached successfully')
      setAttachModal(null)
      setAttachVmId('')
      mutate()
    } catch {
      toast.error('Failed to attach volume')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDetach = async () => {
    if (!detachConfirm) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/storage/volumes/${detachConfirm.id}/detach`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      toast.success('Volume detached successfully')
      setDetachConfirm(null)
      mutate()
    } catch {
      toast.error('Failed to detach volume')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSnapshot = async () => {
    if (!snapshotName || !snapshotModal) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/storage/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volumeid: snapshotModal.id, name: snapshotName }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Snapshot created successfully')
      setSnapshotModal(null)
      setSnapshotName('')
    } catch {
      toast.error('Failed to create snapshot')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResize = async () => {
    if (!newSize || !resizeModal) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/storage/volumes/${resizeModal.id}/resize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ size: parseInt(newSize) }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Volume resized successfully')
      setResizeModal(null)
      setNewSize('')
      mutate()
    } catch {
      toast.error('Failed to resize volume')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/storage/volumes/${deleteConfirm.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('Volume deleted successfully')
      setDeleteConfirm(null)
      mutate()
    } catch {
      toast.error('Failed to delete volume')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      cell: (v: Volume) => (
        <div>
          <p className="font-medium text-white">{v.name}</p>
          <p className="text-xs text-slate-500 font-mono">{v.id?.slice(0, 8)}...</p>
        </div>
      ),
    },
    {
      key: 'state',
      header: 'State',
      sortable: true,
      cell: (v: Volume) => <StatusBadge status={v.state} />,
    },
    {
      key: 'type',
      header: 'Type',
      cell: (v: Volume) => (
        <span className={cn('px-2 py-0.5 rounded text-xs font-medium',
          v.type === 'ROOT' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
        )}>
          {v.type}
        </span>
      ),
    },
    {
      key: 'size',
      header: 'Size',
      sortable: true,
      cell: (v: Volume) => (
        <span className="text-sm text-slate-300">
          {v.size ? `${(v.size / 1073741824).toFixed(0)} GB` : '-'}
        </span>
      ),
    },
    {
      key: 'vmname',
      header: 'VM Attached',
      cell: (v: Volume) => (
        <span className={cn('text-sm', v.vmname ? 'text-slate-300' : 'text-slate-500')}>
          {v.vmname || 'None'}
        </span>
      ),
    },
    {
      key: 'zonename',
      header: 'Zone',
      cell: (v: Volume) => <span className="text-sm text-slate-300">{v.zonename}</span>,
    },
    {
      key: 'storage',
      header: 'Storage Pool',
      cell: (v: Volume) => <span className="text-sm text-slate-400">{v.storage || '-'}</span>,
    },
    {
      key: 'account',
      header: 'Account',
      cell: (v: Volume) => <span className="text-sm text-slate-400">{v.account}</span>,
    },
    {
      key: 'created',
      header: 'Created',
      sortable: true,
      cell: (v: Volume) => (
        <span className="text-sm text-slate-400">
          {v.created ? new Date(v.created).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ]

  const rowActions = (v: Volume) => (
    <DropdownMenu items={[
      {
        label: 'Attach',
        icon: <Paperclip className="w-3.5 h-3.5" />,
        onClick: () => setAttachModal(v),
        disabled: v.state !== 'Allocated' || !!v.vmid,
      },
      {
        label: 'Detach',
        icon: <Unlink className="w-3.5 h-3.5" />,
        onClick: () => setDetachConfirm(v),
        disabled: !v.vmid,
      },
      {
        label: 'Take Snapshot',
        icon: <Camera className="w-3.5 h-3.5" />,
        onClick: () => setSnapshotModal(v),
      },
      {
        label: 'Resize',
        icon: <Expand className="w-3.5 h-3.5" />,
        onClick: () => setResizeModal(v),
      },
      {
        label: 'Delete',
        icon: <Trash2 className="w-3.5 h-3.5" />,
        onClick: () => setDeleteConfirm(v),
        danger: true,
      },
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
        title="Volumes"
        description="Manage block storage volumes"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => setCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Create Volume
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search volumes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterZone}
          onChange={(e) => setFilterZone(e.target.value)}
          className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Zones</option>
          {zones.map((z) => <option key={z.id} value={z.name}>{z.name}</option>)}
        </select>
        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All States</option>
          <option value="Allocated">Allocated</option>
          <option value="Ready">Ready</option>
          <option value="Expunging">Expunging</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="ROOT">ROOT</option>
          <option value="DATADISK">DATADISK</option>
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          Failed to load volumes. Please try again.
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredVolumes}
        loading={isLoading}
        rowActions={rowActions}
        searchable={false}
      />

      {/* Create Volume Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Volume">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="my-volume"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Disk Offering <span className="text-red-400">*</span></label>
            <select
              value={createForm.diskofferingid}
              onChange={(e) => setCreateForm({ ...createForm, diskofferingid: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select disk offering</option>
              {diskOfferings.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Zone <span className="text-red-400">*</span></label>
            <select
              value={createForm.zoneid}
              onChange={(e) => setCreateForm({ ...createForm, zoneid: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select zone</option>
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Size (GB)</label>
            <input
              type="number"
              value={createForm.size}
              onChange={(e) => setCreateForm({ ...createForm, size: e.target.value })}
              placeholder="50"
              min="1"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setCreateModal(false)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={submitting} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-medium disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Volume'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Attach Modal */}
      <Modal open={!!attachModal} onClose={() => setAttachModal(null)} title="Attach Volume">
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">Select a virtual machine to attach <strong className="text-white">{attachModal?.name}</strong> to.</p>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Virtual Machine</label>
            <select
              value={attachVmId}
              onChange={(e) => setAttachVmId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select VM</option>
              {vms.map((vm) => <option key={vm.id} value={vm.id}>{vm.displayname || vm.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setAttachModal(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm">Cancel</button>
            <button onClick={handleAttach} disabled={submitting || !attachVmId} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-medium disabled:opacity-50">
              {submitting ? 'Attaching...' : 'Attach'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Snapshot Modal */}
      <Modal open={!!snapshotModal} onClose={() => setSnapshotModal(null)} title="Take Snapshot">
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">Create a snapshot of <strong className="text-white">{snapshotModal?.name}</strong>.</p>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Snapshot Name</label>
            <input
              type="text"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              placeholder="my-snapshot"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setSnapshotModal(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm">Cancel</button>
            <button onClick={handleSnapshot} disabled={submitting || !snapshotName} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-medium disabled:opacity-50">
              {submitting ? 'Creating...' : 'Take Snapshot'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Resize Modal */}
      <Modal open={!!resizeModal} onClose={() => setResizeModal(null)} title="Resize Volume">
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">Resize <strong className="text-white">{resizeModal?.name}</strong>. Current size: {resizeModal?.size ? `${(resizeModal.size / 1073741824).toFixed(0)} GB` : 'unknown'}.</p>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">New Size (GB)</label>
            <input
              type="number"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="100"
              min="1"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setResizeModal(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm">Cancel</button>
            <button onClick={handleResize} disabled={submitting || !newSize} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-medium disabled:opacity-50">
              {submitting ? 'Resizing...' : 'Resize'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Detach Confirm */}
      <ConfirmDialog
        open={!!detachConfirm}
        onClose={() => setDetachConfirm(null)}
        onConfirm={handleDetach}
        title="Detach Volume"
        message={`Are you sure you want to detach "${detachConfirm?.name}" from "${detachConfirm?.vmname}"?`}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Volume"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
      />
    </motion.div>
  )
}
