'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Plus, Trash2, AlertCircle, RefreshCw, Key, Download, Copy, Eye } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface SSHKeyPair {
  id?: string
  name: string
  fingerprint?: string
  account?: string
  domain?: string
  created?: string
}

export default function SSHKeysPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [privateKeyModal, setPrivateKeyModal] = useState<{ name: string; key: string } | null>(null)
  const [form, setForm] = useState({ name: '', publickey: '' })
  const [submitting, setSubmitting] = useState(false)

  const { data, error, isLoading, mutate } =
    useSWR<{ sshkeypairs: SSHKeyPair[] }>('/api/compute/ssh-keys', fetcher)

  // Normalize: DataTable requires id field
  const rows = (data?.sshkeypairs ?? []).map((k, i) => ({ ...k, id: k.name || String(i) }))

  const handleDelete = async (key: SSHKeyPair & { id: string }) => {
    if (!confirm(`Delete SSH key "${key.name}"?`)) return
    try {
      const res = await fetch(`/api/compute/ssh-keys/${encodeURIComponent(key.name)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success(`SSH key "${key.name}" deleted`)
      mutate()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete SSH key')
    }
  }

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Key name is required'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/compute/ssh-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, publickey: form.publickey || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create SSH key')
      toast.success(`SSH key "${form.name}" created`)
      setCreateOpen(false)
      setForm({ name: '', publickey: '' })
      mutate()
      // If a private key was generated, show it
      if (data.privatekey || data.keypair?.privatekey) {
        setPrivateKeyModal({ name: form.name, key: data.privatekey || data.keypair?.privatekey })
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create SSH key')
    } finally {
      setSubmitting(false)
    }
  }

  const downloadPrivateKey = (name: string, key: string) => {
    const blob = new Blob([key], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}.pem`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Private key downloaded')
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      cell: (k: SSHKeyPair & { id: string }) => (
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-yellow-400 shrink-0" />
          <span className="font-medium text-white">{k.name}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'fingerprint',
      header: 'Fingerprint',
      cell: (k: SSHKeyPair & { id: string }) => (
        <span className="text-xs font-mono text-slate-300 truncate max-w-[200px] block">{k.fingerprint ?? '—'}</span>
      ),
    },
    {
      key: 'account',
      header: 'Account',
      cell: (k: SSHKeyPair & { id: string }) => <span className="text-sm text-slate-300">{k.account ?? '—'}</span>,
    },
    {
      key: 'domain',
      header: 'Domain',
      cell: (k: SSHKeyPair & { id: string }) => <span className="text-sm text-slate-300">{k.domain ?? '—'}</span>,
    },
    {
      key: 'created',
      header: 'Created',
      cell: (k: SSHKeyPair & { id: string }) => (
        <span className="text-sm text-slate-300">{k.created ? new Date(k.created).toLocaleDateString() : '—'}</span>
      ),
      sortable: true,
    },
  ]

  const rowActions = (k: SSHKeyPair & { id: string }) => (
    <button
      onClick={() => handleDelete(k)}
      className="flex items-center gap-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs transition-colors"
    >
      <Trash2 className="w-3 h-3" /> Delete
    </button>
  )

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-slate-400">Failed to load SSH keys</p>
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
        title="SSH Key Pairs"
        description="Manage SSH key pairs for secure VM access"
        action={
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Key Pair
          </button>
        }
      />

      <DataTable columns={columns} data={rows} loading={isLoading} rowActions={rowActions} />

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
              <Key className="w-5 h-5 text-yellow-400" /> Create SSH Key Pair
            </h2>
            <p className="text-slate-400 text-xs mb-4">
              Leave the public key blank to generate a new key pair. The private key will be shown once and cannot be retrieved later.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Key Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="my-ssh-key"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Public Key <span className="text-slate-500">(optional — paste existing public key)</span>
                </label>
                <textarea
                  value={form.publickey}
                  onChange={e => setForm(f => ({ ...f, publickey: e.target.value }))}
                  placeholder="ssh-rsa AAAA..."
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setCreateOpen(false)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating…' : 'Create Key'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Private Key Display Modal */}
      {privateKeyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-yellow-500/30 rounded-2xl p-6 w-full max-w-xl"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg mt-0.5">
                <Eye className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Your Private Key</h2>
                <p className="text-yellow-400 text-xs mt-1">
                  ⚠ This is the ONLY time you can see this private key. Save it now — it cannot be recovered.
                </p>
              </div>
            </div>
            <pre className="bg-slate-950 border border-slate-700 rounded-lg p-4 text-xs text-green-400 font-mono overflow-x-auto max-h-64 overflow-y-auto whitespace-pre">
              {privateKeyModal.key}
            </pre>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { navigator.clipboard.writeText(privateKeyModal.key); toast.success('Copied to clipboard') }}
                className="flex items-center gap-2 flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button
                onClick={() => downloadPrivateKey(privateKeyModal.name, privateKeyModal.key)}
                className="flex items-center gap-2 flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-sm transition-colors"
              >
                <Download className="w-4 h-4" /> Download .pem
              </button>
              <button
                onClick={() => setPrivateKeyModal(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
