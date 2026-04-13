'use client'
import { cn } from '@/lib/utils'

interface Props { status: string; className?: string }

const STATUS_MAP: Record<string, { dot: string; text: string; pulse?: boolean; spin?: boolean }> = {
  running:     { dot: 'bg-green-500',  text: 'text-green-400',  pulse: true },
  active:      { dot: 'bg-green-500',  text: 'text-green-400',  pulse: true },
  enabled:     { dot: 'bg-green-500',  text: 'text-green-400' },
  stopped:     { dot: 'bg-gray-500',   text: 'text-gray-400' },
  allocated:   { dot: 'bg-gray-500',   text: 'text-gray-400' },
  disabled:    { dot: 'bg-gray-500',   text: 'text-gray-400' },
  error:       { dot: 'bg-red-500',    text: 'text-red-400',    pulse: true },
  failed:      { dot: 'bg-red-500',    text: 'text-red-400',    pulse: true },
  starting:    { dot: 'bg-yellow-500', text: 'text-yellow-400', spin: true },
  stopping:    { dot: 'bg-yellow-500', text: 'text-yellow-400', spin: true },
  migrating:   { dot: 'bg-yellow-500', text: 'text-yellow-400', spin: true },
  expunging:   { dot: 'bg-orange-500', text: 'text-orange-400', spin: true },
  destroyed:   { dot: 'bg-gray-600',   text: 'text-gray-500' },
  creating:    { dot: 'bg-blue-500',   text: 'text-blue-400',   spin: true },
  pending:     { dot: 'bg-blue-500',   text: 'text-blue-400',   spin: true },
  deploying:   { dot: 'bg-blue-500',   text: 'text-blue-400',   spin: true },
  ready:       { dot: 'bg-green-500',  text: 'text-green-400' },
  degraded:    { dot: 'bg-orange-500', text: 'text-orange-400', pulse: true },
  unavailable: { dot: 'bg-red-500',    text: 'text-red-400' },
  up:          { dot: 'bg-green-500',  text: 'text-green-400' },
  down:        { dot: 'bg-red-500',    text: 'text-red-400',    pulse: true },
  alert:       { dot: 'bg-red-500',    text: 'text-red-400',    pulse: true },
  paid:        { dot: 'bg-green-500',  text: 'text-green-400' },
  unpaid:      { dot: 'bg-yellow-500', text: 'text-yellow-400' },
  overdue:     { dot: 'bg-red-500',    text: 'text-red-400',    pulse: true },
  cancelled:   { dot: 'bg-gray-500',   text: 'text-gray-400' },
}

export function StatusBadge({ status, className }: Props) {
  const key = status?.toLowerCase() || 'unknown'
  const cfg = STATUS_MAP[key] || { dot: 'bg-gray-400', text: 'text-gray-400' }
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', className)}>
      <span
        className={cn(
          'w-2 h-2 rounded-full flex-shrink-0',
          cfg.dot,
          cfg.pulse && 'animate-pulse',
          cfg.spin && 'animate-spin'
        )}
      />
      <span className={cfg.text}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    </span>
  )
}
