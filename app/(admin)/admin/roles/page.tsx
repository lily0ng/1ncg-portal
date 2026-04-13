'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Plus, Trash2, X, Edit } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Role {
  id: string
  name: string
  type?: string
  isdefault?: boolean
  description?: string
  created?: string
}

const TYPE_BADGES: Record<string, string> = {
  Admin: 'bg-red-500/20 text-red-400',
  DomainAdmin: 'bg-orange-500/20 text-orange-400',
  User: 'bg-blue-500/20 text-blue-400',
  ResourceAdmin: 'bg-green-500/20 text-green-400',
}

export default function RolesPage() {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useSWR('/api/roles', fetcher)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const [form, setForm] = useState({ name: '', type: 'User', description: '' })
  const [submitting, setSubmitting] = useState(false)

  const roles: Role[] = data?.roles || []

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Role created')
      setShowCreate(false)
      setForm({ name: '', type: 'User', description: '' })
      mutate()
    } catch {
      toast.error('Failed to create role')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/roles?id=${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('Role deleted')
      setDeleteTarget(null)
      mutate()
    } catch {
      toast.error('Failed to delete role')
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
        title="Roles"
        description="Manage access control roles"
        action={
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Create Role
          </button>
        }
      />

      {isLoading && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-white/5 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-32" />
              <div className="h-5 bg-white/10 rounded-full w-20" />
              <div className="h-4 bg-white/10 rounded w-12" />
              <div className="h-4 bg-white/10 rounded w-24 ml-auto" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
          <p className="text-red-400 mb-3">Failed to load roles</p>
          <button onClick={() => mutate()} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">Retry</button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/60 text-sm font-medium">Name</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Type</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Is Default</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Created</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-white/40">No roles found</td></tr>
              ) : roles.map(role => {
                const typeStyle = TYPE_BADGES[role.type || 'User'] || TYPE_BADGES.User
                return (
                  <tr key={role.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-white font-medium">{role.name}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${typeStyle}`}>{role.type || 'User'}</span>
                    </td>
                    <td className="p-4">
                      {role.isdefault ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">Yes</span>
                      ) : (
                        <span className="text-white/40 text-sm">-</span>
                      )}
                    </td>
                    <td className="p-4 text-white/40 text-sm">{role.created ? new Date(role.created).toLocaleDateString() : '-'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => router.push(`/admin/roles/${role.id}`)} className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(role)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Create Role</h2>
              <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500" placeholder="My Role" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                  <option value="DomainAdmin">DomainAdmin</option>
                  <option value="ResourceAdmin">ResourceAdmin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500 resize-none" placeholder="Role description" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors">{submitting ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Delete Role</h2>
            <p className="text-white/60 mb-6">Delete <span className="text-white font-medium">{deleteTarget.name}</span>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
