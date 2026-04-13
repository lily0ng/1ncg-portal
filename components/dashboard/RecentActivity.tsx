'use client'

import { motion } from 'framer-motion'
import {
  Play,
  Square,
  RotateCcw,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle,
  Server,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CSEvent {
  id: string
  type: string
  description: string
  date: string
  user?: string
  level?: string
}

interface Props {
  events?: CSEvent[]
  loading?: boolean
}

function getEventIcon(type: string) {
  const t = type?.toLowerCase() || ''
  if (t.includes('start')) return Play
  if (t.includes('stop')) return Square
  if (t.includes('reboot')) return RotateCcw
  if (t.includes('destroy') || t.includes('delete')) return Trash2
  if (t.includes('create')) return Plus
  if (t.includes('alert') || t.includes('error')) return AlertTriangle
  if (t.includes('complete') || t.includes('success')) return CheckCircle
  return Server
}

function getEventColor(level?: string, type?: string) {
  const t = type?.toLowerCase() || ''
  if (level === 'error' || t.includes('error') || t.includes('destroy')) return 'bg-red-500/20 text-red-400'
  if (level === 'warn' || t.includes('stop') || t.includes('alert')) return 'bg-yellow-500/20 text-yellow-400'
  if (t.includes('start') || t.includes('complete')) return 'bg-green-500/20 text-green-400'
  return 'bg-blue-500/20 text-blue-400'
}

function timeAgo(dateStr: string) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function RecentActivity({ events, loading }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5"
    >
      <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Recent Activity</h3>
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-[var(--border)] animate-pulse" />
          ))}
        </div>
      ) : !events?.length ? (
        <p className="text-[var(--text-muted)] text-sm">No recent events</p>
      ) : (
        <div className="space-y-3">
          {events.map((event, index) => {
            const Icon = getEventIcon(event.type)
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg)] hover:bg-[var(--border)] transition-colors"
              >
                <div className={cn('p-2 rounded-lg shrink-0', getEventColor(event.level, event.type))}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text)] truncate">{event.type}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{event.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-[var(--text-muted)]">{event.user || '—'}</p>
                  <p className="text-xs text-[var(--text-muted)]">{timeAgo(event.date)}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
