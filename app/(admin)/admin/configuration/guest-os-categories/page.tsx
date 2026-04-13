'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { Plus, Pencil, Trash2, AlertTriangle, RefreshCw, X, Monitor } from 'lucide-react'
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

interface OSCategory {
  id: string
  name: string
}

export default function GuestOSCategoriesPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/configuration/os-categories', fetcher)
  const [showModal, setShowModal] = useState(false)
  const [editCategory, setEditCategory] = useState<OSCategory | null>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const categories: OSCategory[] = data?.oscategories || data?.categories || []

  function openCreate() {
    setEditCategory(null)
    setName('')
    setShowModal(true)
  }

  function openEdit(c: OSCategory) {
    setEditCategory(c)
    setName(c.name)
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      const method = editCategory ? 'PUT' : 'POST'
      const url = editCategory ? `/api/configuration/os-categories/${editCategory.id}` : '/api/configuration/os-categories'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('Failed to save category')
      toast.success(editCategory ? 'Category updated' : 'Category created')
      setShowModal(false)
      mutate()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/configuration/os-categories/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Category deleted')
      setDeleteId(null)
      mutate()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Guest OS Categories"
          description="Manage guest operating system categories"
          action={
            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors text-sm">
              <Plus className="w-4 h-4" /> Add Category
            </button>
          }
        />
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Failed to load OS categories.</p>
          <button onClick={() => mutate()} className="ml-auto flex items-center gap-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-12 bg-white/5 rounded" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/60 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center gap-3 text-white/40">
                      <Monitor className="w-10 h-10 opacity-40" />
                      <p>No OS categories found</p>
                    </div>
                  </td>
                </tr>
              ) : categories.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white/40 font-mono text-xs">{c.id}</td>
                  <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-white/60 hover:text-indigo-400 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">{editCategory ? 'Edit Category' : 'Add OS Category'}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Name <span className="text-red-400">*</span></label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Linux"
                  required autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {saving ? 'Saving...' : editCategory ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

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
                <h2 className="text-base font-semibold text-white">Delete Category</h2>
                <p className="text-sm text-white/50">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {deleting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
