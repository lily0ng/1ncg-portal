'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { AlertTriangle, RefreshCw, Lock, CheckCircle2, XCircle, Trash2, Save } from 'lucide-react'
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

interface LDAPConfig {
  hostname?: string
  port?: number
  ssl?: boolean
  binddn?: string
  bindpassword?: string
  searchbase?: string
  searchfilter?: string
  userobjectclass?: string
  usersearchattribute?: string
  emailattribute?: string
  configured?: boolean
}

interface FormState extends LDAPConfig {
  bindpassword: string
}

export default function LDAPConfigPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/configuration/ldap', fetcher)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState<FormState>({
    hostname: '',
    port: 389,
    ssl: false,
    binddn: '',
    bindpassword: '',
    searchbase: '',
    searchfilter: '(objectClass=inetOrgPerson)',
    userobjectclass: 'inetOrgPerson',
    usersearchattribute: 'uid',
    emailattribute: 'mail',
  })

  const config: LDAPConfig = data?.ldapconfig || data || {}
  const isConfigured = config?.hostname && config.hostname.length > 0

  function f(key: keyof FormState) {
    return form[key] !== undefined ? form[key] : (config[key as keyof LDAPConfig] ?? '')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.hostname) { toast.error('Hostname is required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/configuration/ldap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to save LDAP configuration')
      toast.success('LDAP configuration saved')
      mutate()
    } catch (e: any) {
      toast.error(e.message || 'Error saving LDAP config')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch('/api/configuration/ldap', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to reset LDAP configuration')
      toast.success('LDAP configuration reset')
      mutate()
    } catch (e: any) {
      toast.error(e.message || 'Error resetting LDAP config')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title="LDAP Configuration"
          description="Configure LDAP/Active Directory authentication"
        />
      </motion.div>

      {/* Status Banner */}
      <motion.div variants={itemVariants}>
        <div className={`flex items-center gap-3 rounded-xl p-4 border ${
          isConfigured
            ? 'bg-green-500/10 border-green-500/20'
            : 'bg-white/5 border-white/10'
        }`}>
          {isConfigured
            ? <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            : <XCircle className="w-5 h-5 text-white/40 flex-shrink-0" />}
          <div>
            <p className={`text-sm font-medium ${isConfigured ? 'text-green-400' : 'text-white/60'}`}>
              {isConfigured ? 'LDAP Connected' : 'Not Configured'}
            </p>
            {isConfigured && (
              <p className="text-xs text-white/50 mt-0.5">
                {config.hostname}:{config.port} {config.ssl ? '(SSL)' : ''}
              </p>
            )}
          </div>
          {isConfigured && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs transition-colors"
            >
              {deleting
                ? <div className="w-3.5 h-3.5 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                : <Trash2 className="w-3.5 h-3.5" />}
              Reset Configuration
            </button>
          )}
        </div>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Failed to load LDAP configuration.</p>
          <button onClick={() => mutate()} className="ml-auto flex items-center gap-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </motion.div>
      )}

      {isLoading ? (
        <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 bg-white/5 rounded" />)}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="text-base font-semibold text-white">LDAP Settings</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-white/60 mb-1.5">Hostname <span className="text-red-400">*</span></label>
                <input
                  value={form.hostname ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, hostname: e.target.value }))}
                  placeholder="ldap.example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Port</label>
                <input
                  type="number"
                  value={form.port ?? 389}
                  onChange={(e) => setForm((f) => ({ ...f, port: parseInt(e.target.value) }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm((f) => ({ ...f, ssl: !f.ssl }))}
                className={`w-10 h-6 rounded-full transition-colors cursor-pointer flex items-center px-1 ${form.ssl ? 'bg-indigo-600' : 'bg-white/10'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${form.ssl ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm text-white">Use SSL/TLS (port 636)</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Bind DN</label>
                <input
                  value={form.binddn ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, binddn: e.target.value }))}
                  placeholder="cn=admin,dc=example,dc=com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Bind Password</label>
                <input
                  type="password"
                  value={form.bindpassword}
                  onChange={(e) => setForm((f) => ({ ...f, bindpassword: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Search Base</label>
                <input
                  value={form.searchbase ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, searchbase: e.target.value }))}
                  placeholder="dc=example,dc=com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Search Filter</label>
                <input
                  value={form.searchfilter ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, searchfilter: e.target.value }))}
                  placeholder="(objectClass=inetOrgPerson)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">User Object Class</label>
                <input
                  value={form.userobjectclass ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, userobjectclass: e.target.value }))}
                  placeholder="inetOrgPerson"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">User Search Attribute</label>
                <input
                  value={form.usersearchattribute ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, usersearchattribute: e.target.value }))}
                  placeholder="uid"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Email Attribute</label>
                <input
                  value={form.emailattribute ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, emailattribute: e.target.value }))}
                  placeholder="mail"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-white/10">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </motion.div>
  )
}
