'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { MessageSquare, Plus, ChevronRight, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  resolved: 'bg-green-500/20 text-green-400',
  closed: 'bg-gray-500/20 text-gray-400',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-gray-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
}

export default function SupportPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('medium')
  const [submitting, setSubmitting] = useState(false)
  const { data, isLoading, error, mutate } = useSWR('/api/support/tickets', fetcher)
  const tickets = data?.tickets || []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, message, priority }),
    })
    setSubject('')
    setMessage('')
    setPriority('medium')
    setShowCreate(false)
    setSubmitting(false)
    mutate()
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Support</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Get help from our team</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-sm">
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[var(--text)] mb-4">Create Support Ticket</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Subject</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
                placeholder="Brief description of your issue"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full bg-[var(--bg)] border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                rows={4}
                placeholder="Describe your issue in detail..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors text-sm">
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 bg-white/10 text-[var(--text)] rounded-lg hover:bg-white/20 transition-colors text-sm">
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {isLoading && <div className="animate-pulse h-64 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 text-sm">Failed to load. <button onClick={() => mutate()} className="underline">Retry</button></div>}

      {!isLoading && tickets.length === 0 && !showCreate && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-muted)]">No support tickets</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Need help? Create a ticket above</p>
        </div>
      )}

      <div className="space-y-3">
        {tickets.map((t: any) => (
          <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <MessageSquare className="w-5 h-5 text-[var(--accent)]" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[var(--text)]">{t.subject}</p>
                  <span className={`text-xs font-medium ${PRIORITY_COLORS[t.priority] || 'text-gray-400'}`}>
                    {t.priority}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  #{t.id.slice(0, 8)} • {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[t.status] || 'bg-gray-500/20 text-gray-400'}`}>
                {t.status}
              </span>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
