'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { Plus, Pencil, Trash2, AlertTriangle, RefreshCw, X, Check, Cpu } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

interface ComputeOffering {
  id: string
  name: string
  displaytext?: string
  cpunumber?: number
  cpuspeed?: number
  memory?: number
  storagetype?: string
  offerha?: boolean
  limitcpuuse?: boolean
  iscustomized?: boolean
  ispublic?: boolean
  created?: string
}

interface FormData {
  name: string
  displaytext: string
  cpunumber: string
  cpuspeed: string
  memory: string
  storagetype: string
  offerha: boolean
  limitcpuuse: boolean
  iscustomized: boolean
}

const defaultForm: FormData = {
  name: '',
  displaytext: '',
  cpunumber: '2',
  cpuspeed: '2000',
  memory: '2048',
  storagetype: 'shared',
  offerha: false,
  limitcpuuse: false,
  iscustomized: false,
}

export default function ComputeOfferingsPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/service-offerings/compute', fetcher)
  const [showModal, setShowModal] = useState(false)
  const [editOffering, setEditOffering] = useState<ComputeOffering | null>(null)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const offerings: ComputeOffering[] = data?.serviceofferings || data?.offerings || []

  function openCreate() {
    setEditOffering(null)
    setForm(defaultForm)
    setShowModal(true)
  }

  function openEdit(o: ComputeOffering) {
    setEditOffering(o)
    setForm({
      name: o.name || '',
      displaytext: o.displaytext || '',
      cpunumber: String(o.cpunumber || 2),
      cpuspeed: String(o.cpuspeed || 2000),
      memory: String(o.memory || 2048),
      storagetype: o.storagetype || 'shared',
      offerha: !!o.offerha,
      limitcpuuse: !!o.limitcpuuse,
      iscustomized: !!o.iscustomized,
    })
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      const method = editOffering ? 'PUT' : 'POST'
      const url = editOffering
        ? `/api/service-offerings/compute/${editOffering.id}`
        : '/api/service-offerings/compute'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          cpunumber: parseInt(form.cpunumber),
          cpuspeed: parseInt(form.cpuspeed),
          memory: parseInt(form.memory),
        }),
      })
      if (!res.ok) throw new Error('Failed to save offering')
      toast.success(editOffering ? 'Offering updated' : 'Offering created')
      setShowModal(false)
      mutate()
    } catch (e: any) {
      toast.error(e.message || 'Error saving offering')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/service-offerings/compute/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Offering deleted')
      setDeleteId(null)
      mutate()
    } catch (e: any) {
      toast.error(e.message || 'Error deleting offering')
    } finally {
      setDeleting(false)
    }
  }

  const headers = ['Name', 'vCPUs', 'CPU Speed (MHz)', 'RAM (MB)', 'Storage Type', 'HA', 'Limit CPU', 'Public', 'Created', 'Actions']

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Compute Offerings"
          description="Manage virtual machine service offerings"
          action={
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> Create Offering
            </button>
          }
        />
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Failed to load compute offerings.</p>
          <button onClick={() => mutate()} className="ml-auto flex items-center gap-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-white/5 rounded" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead>
                <tr className="border-b border-white/10 text-white/60 text-xs uppercase tracking-wider">
                  {headers.map((h) => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {offerings.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-10 text-center text-white/40">No compute offerings found</td></tr>
                ) : offerings.map((o) => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{o.name}</p>
                        {o.displaytext && o.displaytext !== o.name && (
                          <p className="text-xs text-white/40">{o.displaytext}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/80">{o.cpunumber ?? '-'}</td>
                    <td className="px-4 py-3 text-white/80">{o.cpuspeed ? `${o.cpuspeed} MHz` : '-'}</td>
                    <td className="px-4 py-3 text-white/80">{o.memory ? `${o.memory} MB` : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${o.storagetype === 'local' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {o.storagetype || 'shared'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {o.offerha ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-white/30" />}
                    </td>
                    <td className="px-4 py-3">
                      {o.limitcpuuse ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-white/30" />}
                    </td>
                    <td className="px-4 py-3">
                      {o.ispublic !== false ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-white/30" />}
                    </td>
                    <td className="px-4 py-3 text-white/50 text-xs">
                      {o.created ? new Date(o.created).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(o)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-white/60 hover:text-indigo-400 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(o.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  {editOffering ? 'Edit Compute Offering' : 'Create Compute Offering'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-white/60 mb-1.5">Name <span className="text-red-400">*</span></label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Small Instance"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-white/60 mb-1.5">Display Text</label>
                  <input
                    value={form.displaytext}
                    onChange={(e) => setForm((f) => ({ ...f, displaytext: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Friendly display name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">vCPUs</label>
                  <input
                    type="number"
                    min="1"
                    value={form.cpunumber}
                    onChange={(e) => setForm((f) => ({ ...f, cpunumber: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">CPU Speed (MHz)</label>
                  <input
                    type="number"
                    min="100"
                    value={form.cpuspeed}
                    onChange={(e) => setForm((f) => ({ ...f, cpuspeed: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">RAM (MB)</label>
                  <input
                    type="number"
                    min="128"
                    value={form.memory}
                    onChange={(e) => setForm((f) => ({ ...f, memory: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Storage Type</label>
                  <select
                    value={form.storagetype}
                    onChange={(e) => setForm((f) => ({ ...f, storagetype: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="shared">Shared</option>
                    <option value="local">Local</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3 pt-1">
                {[
                  { key: 'offerha', label: 'HA Enabled', desc: 'Enable High Availability for VMs using this offering' },
                  { key: 'limitcpuuse', label: 'Limit CPU Use', desc: 'Limit CPU usage to the specified speed' },
                  { key: 'iscustomized', label: 'Customized', desc: 'Allow users to customize CPU/RAM values' },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={form[key as keyof FormData] as boolean}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                        className="sr-only"
                      />
                      <div
                        onClick={() => setForm((f) => ({ ...f, [key]: !f[key as keyof FormData] }))}
                        className={`w-10 h-6 rounded-full transition-colors cursor-pointer flex items-center px-1 ${
                          form[key as keyof FormData] ? 'bg-indigo-600' : 'bg-white/10'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${form[key as keyof FormData] ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-white">{label}</p>
                      <p className="text-xs text-white/40">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {saving ? 'Saving...' : editOffering ? 'Save Changes' : 'Create Offering'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Delete Offering</h2>
                <p className="text-sm text-white/50">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {deleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
