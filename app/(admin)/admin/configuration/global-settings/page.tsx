'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { Search, Save, AlertTriangle, RefreshCw, Settings } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

interface GlobalSetting {
  name: string
  value: string
  category?: string
  description?: string
  scope?: string
  defaultvalue?: string
}

export default function GlobalSettingsPage() {
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 500)
  const { data, isLoading, error, mutate } = useSWR(
    `/api/configuration/global?keyword=${debouncedKeyword}`,
    fetcher
  )

  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const settings: GlobalSetting[] = data?.configurations || data?.settings || []

  // Group by category
  const grouped = settings.reduce<Record<string, GlobalSetting[]>>((acc, s) => {
    const cat = s.category || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

  function startEdit(s: GlobalSetting) {
    setEditingKey(s.name)
    setEditValue(s.value ?? '')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function cancelEdit() {
    setEditingKey(null)
    setEditValue('')
  }

  async function handleSave(name: string) {
    setSavingKey(name)
    try {
      const res = await fetch('/api/configuration/global', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, value: editValue }),
      })
      if (!res.ok) throw new Error('Failed to save setting')
      toast.success(`Setting "${name}" updated`)
      setEditingKey(null)
      mutate()
    } catch (e: any) {
      toast.error(e.message || 'Error saving setting')
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Global Settings"
          description="Configure CloudStack global configuration parameters"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search settings..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Failed to load settings.</p>
          <button onClick={() => mutate()} className="ml-auto flex items-center gap-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </motion.div>
      )}

      {isLoading ? (
        <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 bg-white/5 rounded" />)}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/3">
                <Settings className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-white/80">{category}</span>
                <span className="ml-auto text-xs text-white/30">{items.length} settings</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
                    <th className="px-4 py-2 text-left w-1/4">Name</th>
                    <th className="px-4 py-2 text-left w-1/4">Value</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-left w-24">Scope</th>
                    <th className="px-4 py-2 text-right w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.map((s) => (
                    <tr key={s.name} className="hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-indigo-300">{s.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        {editingKey === s.name ? (
                          <input
                            ref={inputRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSave(s.name)
                              if (e.key === 'Escape') cancelEdit()
                            }}
                            className="w-full bg-white/10 border border-indigo-500/50 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        ) : (
                          <span
                            className="text-white/80 cursor-pointer hover:text-white hover:bg-white/5 px-2 py-1 rounded transition-colors block truncate max-w-[200px]"
                            onClick={() => startEdit(s)}
                            title="Click to edit"
                          >
                            {s.value || <span className="text-white/30 italic">empty</span>}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white/50 text-xs max-w-[300px]">
                        <p className="line-clamp-2">{s.description || '-'}</p>
                      </td>
                      <td className="px-4 py-3">
                        {s.scope && (
                          <span className="px-2 py-0.5 bg-white/10 text-white/60 rounded text-xs">{s.scope}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editingKey === s.name ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleSave(s.name)}
                              disabled={savingKey === s.name}
                              className="p-1.5 rounded bg-green-600 hover:bg-green-500 text-white transition-colors"
                              title="Save"
                            >
                              {savingKey === s.name
                                ? <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                                : <Save className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors text-xs"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(s)}
                            className="px-2.5 py-1 text-xs bg-white/5 hover:bg-indigo-500/20 text-white/50 hover:text-indigo-400 rounded transition-colors"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {settings.length === 0 && !isLoading && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center text-white/40">
              No settings found matching &quot;{keyword}&quot;
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
