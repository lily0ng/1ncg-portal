'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Search, Download, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Event {
  id: string
  level?: string
  type: string
  description?: string
  account?: string
  domain?: string
  resourcename?: string
  zonename?: string
  created?: string
}

const LEVEL_STYLES: Record<string, string> = {
  ERROR:  'bg-red-500/20 text-red-400',
  ALERT:  'bg-red-500/20 text-red-400',
  WARN:   'bg-yellow-500/20 text-yellow-400',
  WARNING:'bg-yellow-500/20 text-yellow-400',
  INFO:   'bg-blue-500/20 text-blue-400',
  USER:   'bg-purple-500/20 text-purple-400',
}

export default function EventsPage() {
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch] = useState('')

  const url = `/api/events?page=${page}&pagesize=50${typeFilter && typeFilter !== 'ALL' ? `&type=${typeFilter}` : ''}`

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    refreshInterval: 30000,
  })

  const allEvents: Event[] = data?.events || []
  const filtered = search
    ? allEvents.filter(e =>
        e.description?.toLowerCase().includes(search.toLowerCase()) ||
        e.type?.toLowerCase().includes(search.toLowerCase()) ||
        e.account?.toLowerCase().includes(search.toLowerCase())
      )
    : allEvents

  const exportCSV = () => {
    const headers = ['Level', 'Type', 'Description', 'Account', 'Domain', 'Zone', 'Created']
    const rows = filtered.map(e => [
      e.level || '',
      e.type,
      e.description || '',
      e.account || '',
      e.domain || '',
      e.zonename || '',
      e.created || '',
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `events-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Events"
        description="System and user activity events — auto-refreshes every 30s"
        action={
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Levels</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
          <option value="USER">USER</option>
          <option value="ALERT">ALERT</option>
        </select>
        <button
          onClick={() => mutate()}
          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isLoading && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-white/5 animate-pulse">
              <div className="h-5 bg-white/10 rounded-full w-16" />
              <div className="h-4 bg-white/10 rounded w-32" />
              <div className="h-4 bg-white/10 rounded w-64" />
              <div className="h-4 bg-white/10 rounded w-24 ml-auto" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
          <p className="text-red-400 mb-3">Failed to load events</p>
          <button onClick={() => mutate()} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Level</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Type</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Description</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Account</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Domain</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Zone</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-white/40">No events found</td>
                  </tr>
                ) : filtered.map(evt => {
                  const lvl = (evt.level || 'INFO').toUpperCase()
                  const style = LEVEL_STYLES[lvl] || LEVEL_STYLES.INFO
                  return (
                    <tr key={evt.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${style}`}>{lvl}</span>
                      </td>
                      <td className="p-4 text-white/80 text-sm font-mono">{evt.type}</td>
                      <td className="p-4 text-white/60 text-sm max-w-xs truncate">{evt.description || '-'}</td>
                      <td className="p-4 text-white/60 text-sm">{evt.account || '-'}</td>
                      <td className="p-4 text-white/60 text-sm">{evt.domain || '-'}</td>
                      <td className="p-4 text-white/60 text-sm">{evt.zonename || '-'}</td>
                      <td className="p-4 text-white/40 text-xs whitespace-nowrap">
                        {evt.created ? new Date(evt.created).toLocaleString() : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-sm">Page {page} &bull; {filtered.length} events shown</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 rounded-lg disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 bg-white/5 border border-white/10 text-white rounded-lg text-sm">{page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={filtered.length < 50}
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 rounded-lg disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
