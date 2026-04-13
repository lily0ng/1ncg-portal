'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface AffinityGroup {
  id: string
  name: string
  type: string
  description?: string
  virtualmachineIds?: string[]
  account?: string
  domain?: string
  created?: string
}

export default function AffinityGroupsPage() {
  const { data, error, isLoading, mutate } = useSWR('/api/compute/affinity-groups', fetcher)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AffinityGroup | null>(null)
  const [form, setForm] = useState({ name: '', type: 'host-anti-affinity', description: '' })
  const [submitting, setSubmitting] = useState(false)

  const groups: AffinityGroup[] = data?.affinitygroups || data?.groups || []

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/compute/affinity-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to create')
      toast.success('Affinity group created')
      setShowCreate(false)
      setForm({ name: '', type: 'host-anti-affinity', description: '' })
      mutate()
    } catch {
      toast.error('Failed to create affinity group')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/compute/affinity-groups?id=${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Affinity group deleted')
      setDeleteTarget(null)
      mutate()
    } catch {
      toast.error('Failed to delete affinity group')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Affinity Groups"
        description="Manage VM placement affinity groups"
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Group
          </button>
        }
      />

      {isLoading && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-white/5 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-32" />
              <div className="h-4 bg-white/10 rounded w-24" />
              <div className="h-4 bg-white/10 rounded w-48" />
              <div className="h-4 bg-white/10 rounded w-16 ml-auto" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
          <p className="text-red-400 mb-3">Failed to load affinity groups</p>
          <button onClick={() => mutate()} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/60 text-sm font-medium">Name</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Type</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Description</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">VMs</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Account</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Domain</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Created</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-white/40">No affinity groups found</td>
                </tr>
              ) : groups.map((g) => (
                <tr key={g.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-medium">{g.name}</td>
                  <td className="p-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">{g.type}</span>
                  </td>
                  <td className="p-4 text-white/60 text-sm">{g.description || '-'}</td>
                  <td className="p-4 text-white/60 text-sm">{g.virtualmachineIds?.length ?? 0}</td>
                  <td className="p-4 text-white/60 text-sm">{g.account || '-'}</td>
                  <td className="p-4 text-white/60 text-sm">{g.domain || '-'}</td>
                  <td className="p-4 text-white/60 text-sm">{g.created ? new Date(g.created).toLocaleDateString() : '-'}</td>
                  <td className="p-4">
                    <button
                      onClick={() => setDeleteTarget(g)}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Create Affinity Group</h2>
              <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
                  placeholder="my-affinity-group"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Type *</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="host-anti-affinity">Host Anti-Affinity</option>
                  <option value="host-affinity">Host Affinity</option>
                  <option value="non-strict-host-anti-affinity">Non-Strict Host Anti-Affinity</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors">
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-sm p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-2">Delete Affinity Group</h2>
            <p className="text-white/60 mb-6">Are you sure you want to delete <span className="text-white font-medium">{deleteTarget.name}</span>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
