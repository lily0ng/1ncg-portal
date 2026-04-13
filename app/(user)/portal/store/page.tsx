'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { ShoppingBag, Download, Star, ExternalLink } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function StorePage() {
  const { data, isLoading, error, mutate } = useSWR('/api/marketplace/apps', fetcher)
  const apps = data?.apps || []

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Marketplace</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Deploy pre-configured applications and services</p>
      </div>

      {isLoading && <div className="animate-pulse h-64 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 text-sm">Failed to load. <button onClick={() => mutate()} className="underline">Retry</button></div>}

      {!isLoading && apps.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-muted)]">No apps available</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app: any) => (
          <motion.div key={app.id} whileHover={{ y: -2 }} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center text-2xl">
                  {app.icon || '📦'}
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text)]">{app.name}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{app.category}</p>
                </div>
              </div>
              {app.featured && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
            </div>
            <p className="text-sm text-[var(--text-muted)] line-clamp-2">{app.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-[var(--text-muted)]">{app.version}</span>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-xs">
                <Download className="w-3 h-3" /> Deploy
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
