'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { AlertTriangle, RefreshCw, Save, Info, Eye, EyeOff } from 'lucide-react'
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

const PROVIDERS = [
  {
    key: 'google',
    name: 'Google',
    description: 'Sign in with Google accounts',
    color: 'bg-red-500/20',
    iconColor: 'text-red-400',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
  {
    key: 'github',
    name: 'GitHub',
    description: 'Sign in with GitHub accounts',
    color: 'bg-white/10',
    iconColor: 'text-white',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    key: 'gitlab',
    name: 'GitLab',
    description: 'Sign in with GitLab accounts',
    color: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z" />
      </svg>
    ),
  },
]

interface OAuthProvider {
  key: string
  enabled: boolean
  clientId: string
  clientSecret: string
}

export default function OAuthProvidersPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/configuration/oauth', fetcher)
  const [saving, setSaving] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [providerForms, setProviderForms] = useState<Record<string, OAuthProvider>>({})

  function getProviderData(key: string): OAuthProvider {
    if (providerForms[key]) return providerForms[key]
    const existing = data?.[key] || data?.providers?.find((p: any) => p.key === key) || {}
    return {
      key,
      enabled: existing.enabled || false,
      clientId: existing.clientId || existing.client_id || '',
      clientSecret: existing.clientSecret || existing.client_secret || '',
    }
  }

  function updateProvider(key: string, update: Partial<OAuthProvider>) {
    setProviderForms((prev) => ({
      ...prev,
      [key]: { ...getProviderData(key), ...update },
    }))
  }

  async function handleSaveProvider(key: string) {
    const provData = getProviderData(key)
    setSaving(key)
    try {
      const res = await fetch('/api/configuration/oauth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: key, ...provData }),
      })
      if (!res.ok) throw new Error('Failed to save OAuth provider')
      toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} OAuth settings saved`)
      mutate()
    } catch (e: any) {
      toast.error(e.message || 'Error saving OAuth settings')
    } finally {
      setSaving(null)
    }
  }

  const callbackBase = typeof window !== 'undefined' ? window.location.origin : 'https://your-portal.example.com'

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title="OAuth Providers"
          description="Configure OAuth 2.0 providers for single sign-on"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-300 space-y-1">
          <p className="font-medium">Redirect URI Instructions</p>
          <p className="text-blue-300/70">Configure the following callback URL in each provider&apos;s OAuth app settings:</p>
          <p className="font-mono text-xs bg-blue-900/30 px-3 py-1.5 rounded mt-2 text-blue-200">
            {callbackBase}/api/auth/callback/[provider]
          </p>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Failed to load OAuth configuration.</p>
          <button onClick={() => mutate()} className="ml-auto flex items-center gap-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {PROVIDERS.map((provider) => {
          const provData = getProviderData(provider.key)
          const showSecret = showSecrets[provider.key] || false

          return (
            <motion.div
              key={provider.key}
              variants={itemVariants}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${provider.color} flex items-center justify-center ${provider.iconColor}`}>
                    {provider.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{provider.name}</h3>
                    <p className="text-sm text-white/50">{provider.description}</p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-white/60">{provData.enabled ? 'Enabled' : 'Disabled'}</span>
                  <div
                    onClick={() => updateProvider(provider.key, { enabled: !provData.enabled })}
                    className={`w-10 h-6 rounded-full transition-colors cursor-pointer flex items-center px-1 ${provData.enabled ? 'bg-indigo-600' : 'bg-white/10'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${provData.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Client ID</label>
                  <input
                    type="text"
                    value={provData.clientId}
                    onChange={(e) => updateProvider(provider.key, { clientId: e.target.value })}
                    placeholder={`${provider.name} Client ID`}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Client Secret</label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={provData.clientSecret}
                      onChange={(e) => updateProvider(provider.key, { clientSecret: e.target.value })}
                      placeholder={`${provider.name} Client Secret`}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecrets((s) => ({ ...s, [provider.key]: !s[provider.key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-white/50">
                  <span className="text-white/30">Redirect URI: </span>
                  <span className="font-mono text-white/60">{callbackBase}/api/auth/callback/{provider.key}</span>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => handleSaveProvider(provider.key)}
                  disabled={saving === provider.key}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {saving === provider.key
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Save className="w-4 h-4" />}
                  {saving === provider.key ? 'Saving...' : 'Save'}
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
