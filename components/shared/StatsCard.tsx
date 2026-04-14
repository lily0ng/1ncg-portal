'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon?: React.ComponentType<{ className?: string }>
  color?: 'default' | 'green' | 'red' | 'blue' | 'yellow'
  trend?: { positive: boolean; value: string; text?: string }
  loading?: boolean
  percentChange?: string
}

const colorVariants = {
  default: 'bg-[var(--surface)] border-[var(--border)]',
  green: 'bg-green-500/10 border-green-500/30',
  red: 'bg-red-500/10 border-red-500/30',
  blue: 'bg-blue-500/10 border-blue-500/30',
  yellow: 'bg-yellow-500/10 border-yellow-500/30',
}

const iconColorVariants = {
  default: 'bg-purple-500/20 text-purple-400',
  green: 'bg-green-500/20 text-green-400',
  red: 'bg-red-500/20 text-red-400',
  blue: 'bg-blue-500/20 text-blue-400',
  yellow: 'bg-yellow-500/20 text-yellow-400',
}

export function StatsCard({ title, value, icon: Icon, trend, loading, color = 'default', percentChange }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        'p-6 rounded-xl border transition-all duration-200 bg-[var(--surface)] border-[var(--border)]'
      )}
    >
      {/* Header with title and percentage */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[var(--text-muted)] text-xs font-medium">{title}</p>
        {percentChange && (
          <span
            className={cn(
              'text-xs font-medium px-1.5 py-0.5 rounded',
              percentChange.startsWith('+') ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
            )}
          >
            {percentChange}
          </span>
        )}
      </div>
      
      {/* Value */}
      {loading ? (
        <div className="mb-2">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
        </div>
      ) : (
        <motion.h3
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-3xl font-semibold text-[var(--text)] mb-3"
        >
          {value}
        </motion.h3>
      )}
      
      {/* Trend indicator with description */}
      {trend && !loading && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {trend.positive ? (
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-400" />
            )}
            <span
              className={cn(
                'text-xs font-medium',
                trend.positive ? 'text-green-400' : 'text-red-400'
              )}
            >
              {trend.positive ? '+' : '-'}{trend.value}%
            </span>
          </div>
          <span className="text-[var(--text-muted)] text-xs">{trend.text || 'vs last month'}</span>
        </div>
      )}
    </motion.div>
  )
}
