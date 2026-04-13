'use client'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { ArrowLeft, HardDrive, Camera, Trash2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function VolumeDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const { data, isLoading, mutate } = useSWR(`/api/storage/volumes/${id}`, fetcher)
  const volume = data?.volume

  async function createSnapshot() {
    await fetch(`/api/storage/volumes/${id}/snapshot`, { method: 'POST' })
    mutate()
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">{isLoading ? '...' : volume?.name || 'Volume Detail'}</h1>
          <p className="text-sm text-[var(--text-muted)]">{volume?.id}</p>
        </div>
      </div>

      {isLoading && <div className="animate-pulse h-64 bg-white/5 rounded-xl" />}

      {volume && (
        <>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text)]">Actions</h2>
            <div className="flex gap-3">
              <button onClick={createSnapshot} className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm">
                <Camera className="w-4 h-4" /> Take Snapshot
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm" disabled={!!volume.vmname}>
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
            {volume.vmname && <p className="text-xs text-[var(--text-muted)]">Detach from {volume.vmname} before deleting</p>}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text)]">Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {[
                ['Type', volume.type],
                ['Size', volume.size ? `${(volume.size/(1024**3)).toFixed(0)} GB` : '—'],
                ['State', volume.state],
                ['Zone', volume.zonename],
                ['Storage', volume.storagetype],
                ['Attached VM', volume.vmname || 'None'],
                ['Created', volume.created ? new Date(volume.created).toLocaleDateString() : '—'],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-2 border-b border-white/5">
                  <dt className="text-[var(--text-muted)]">{k}</dt>
                  <dd className="text-[var(--text)] font-medium">{v || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </>
      )}
    </motion.div>
  )
}
