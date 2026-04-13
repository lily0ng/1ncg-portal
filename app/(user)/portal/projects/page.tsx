'use client'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { FolderOpen, Plus } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ProjectsPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/compute/projects', fetcher)
  const projects = data?.projects || []

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Projects</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Organize resources into projects</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-sm">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {isLoading && <div className="animate-pulse h-64 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 text-sm">Failed to load projects. <button onClick={() => mutate()} className="underline">Retry</button></div>}

      {!isLoading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-muted)]">No projects found</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Create a project to organize your resources</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p: any) => (
          <motion.div key={p.id} whileHover={{ y: -2 }} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text)] text-sm">{p.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">{p.displaytext}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-[var(--text)] font-bold">{p.vmtotal || 0}</p>
                <p className="text-[var(--text-muted)]">VMs</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-[var(--text)] font-bold">{p.volumetotal || 0}</p>
                <p className="text-[var(--text-muted)]">Volumes</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-[var(--text)] font-bold">{p.networktotal || 0}</p>
                <p className="text-[var(--text-muted)]">Networks</p>
              </div>
            </div>
            <div className={`text-xs px-2 py-1 rounded-full inline-block ${p.state === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
              {p.state}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
