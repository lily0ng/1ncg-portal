'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Package, RefreshCw } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AppsPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/marketplace/apps?installed=true', fetcher)
  const apps = data?.apps || []

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">My Apps</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{apps.length} installed app{apps.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => mutate()} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <RefreshCw className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
      </div>

      {isLoading && <div className="animate-pulse h-64 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 text-sm">Failed to load. <button onClick={() => mutate()} className="underline">Retry</button></div>}

      {!isLoading && apps.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-muted)]">No apps installed</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Visit the Marketplace to deploy applications</p>
          <a href="/portal/store" className="mt-4 px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:bg-[var(--accent-hover)] transition-colors">
            Go to Marketplace
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app: any) => (
          <div key={app.id} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center text-2xl">
                {app.icon || '📦'}
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text)]">{app.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">{app.version}</p>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full inline-block ${app.status === 'running' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
              {app.status || 'deployed'}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
