'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Plus, Trash2, X, Eye, Search, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Account {
  id: string
  name?: string
  username?: string
  email?: string
  accounttype?: number
  domain?: string
  domainid?: string
  state?: string
  vmcount?: number
  created?: string
  firstname?: string
  lastname?: string
}

const ACCOUNT_TYPE_LABELS: Record<number, { label: string; style: string }> = {
  0: { label: 'User', style: 'bg-blue-500/20 text-blue-400' },
  1: { label: 'Admin', style: 'bg-red-500/20 text-red-400' },
  2: { label: 'DomainAdmin', style: 'bg-orange-500/20 text-orange-400' },
  4: { label: 'ResourceAdmin', style: 'bg-green-500/20 text-green-400' },
}

export default function AccountsPage() {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useSWR('/api/accounts', fetcher)
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    username: '', password: '', email: '', firstname: '', lastname: '',
    accounttype: '0', domainid: '',
  })

  const accounts: Account[] = data?.accounts || []

  const filtered = accounts.filter(a => {
    const name = a.name || a.username || ''
    const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase())
    const matchState = !stateFilter || a.state?.toLowerCase() === stateFilter.toLowerCase()
    const matchType = !typeFilter || String(a.accounttype) === typeFilter
    return matchSearch && matchState && matchType
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, accounttype: parseInt(form.accounttype) }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Account created')
      setShowCreate(false)
      setForm({ username: '', password: '', email: '', firstname: '', lastname: '', accounttype: '0', domainid: '' })
      mutate()
    } catch {
      toast.error('Failed to create account')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/accounts?id=${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('Account deleted')
      setDeleteTarget(null)
      mutate()
    } catch {
      toast.error('Failed to delete account')
    }
  }

  const toggleState = async (account: Account) => {
    const action = account.state === 'enabled' ? 'disable' : 'enable'
    try {
      await fetch(`/api/accounts?id=${account.id}&action=${action}`, { method: 'POST' })
      toast.success(`Account ${action}d`)
      mutate()
    } catch {
      toast.error(`Failed to ${action} account`)
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
        title="Accounts"
        description="Manage user accounts"
        action={
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Create Account
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by username or email..." className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500" />
        </div>
        <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500">
          <option value="">All States</option>
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500">
          <option value="">All Types</option>
          <option value="0">User</option>
          <option value="1">Admin</option>
          <option value="2">DomainAdmin</option>
          <option value="4">ResourceAdmin</option>
        </select>
      </div>

      {isLoading && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-white/5 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-28" />
              <div className="h-4 bg-white/10 rounded w-40" />
              <div className="h-5 bg-white/10 rounded-full w-16" />
              <div className="h-4 bg-white/10 rounded w-24" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
          <p className="text-red-400 mb-3">Failed to load accounts</p>
          <button onClick={() => mutate()} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">Retry</button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/60 text-sm font-medium">Username</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Email</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Type</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Domain</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">State</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">VM Count</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Created</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-white/40">No accounts found</td></tr>
              ) : filtered.map(acc => {
                const typeInfo = ACCOUNT_TYPE_LABELS[acc.accounttype ?? 0] || ACCOUNT_TYPE_LABELS[0]
                return (
                  <tr key={acc.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <p className="text-white font-medium">{acc.name || acc.username}</p>
                      <p className="text-xs text-white/40">{acc.firstname} {acc.lastname}</p>
                    </td>
                    <td className="p-4 text-white/60 text-sm">{acc.email || '-'}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${typeInfo.style}`}>{typeInfo.label}</span>
                    </td>
                    <td className="p-4 text-white/60 text-sm">{acc.domain || '-'}</td>
                    <td className="p-4">
                      <button onClick={() => toggleState(acc)} className="cursor-pointer" title="Click to toggle state">
                        <StatusBadge status={acc.state || 'enabled'} />
                      </button>
                    </td>
                    <td className="p-4 text-white/60 text-sm">{acc.vmcount ?? 0}</td>
                    <td className="p-4 text-white/40 text-sm">{acc.created ? new Date(acc.created).toLocaleDateString() : '-'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleState(acc)} className={`p-1.5 rounded-lg transition-colors ${acc.state === 'enabled' ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`} title={acc.state === 'enabled' ? 'Disable' : 'Enable'}>
                          {acc.state === 'enabled' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => router.push(`/admin/accounts/${acc.id}`)} className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(acc)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors" title="Delete">
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

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Create Account</h2>
              <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">First Name *</label>
                  <input required value={form.firstname} onChange={e => setForm(f => ({ ...f, firstname: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Last Name *</label>
                  <input required value={form.lastname} onChange={e => setForm(f => ({ ...f, lastname: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Username *</label>
                <input required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500" placeholder="johndoe" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Email *</label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Password *</label>
                <div className="relative">
                  <input required type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors text-xs">
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Account Type</label>
                <select value={form.accounttype} onChange={e => setForm(f => ({ ...f, accounttype: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  <option value="0">User</option>
                  <option value="1">Admin</option>
                  <option value="2">DomainAdmin</option>
                  <option value="4">ResourceAdmin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Domain ID (optional)</label>
                <input value={form.domainid} onChange={e => setForm(f => ({ ...f, domainid: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500" placeholder="Leave blank for root domain" />
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
            <h2 className="text-lg font-semibold text-white mb-2">Delete Account</h2>
            <p className="text-white/60 mb-6">Delete <span className="text-white font-medium">{deleteTarget.name || deleteTarget.username}</span>? This cannot be undone.</p>
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
