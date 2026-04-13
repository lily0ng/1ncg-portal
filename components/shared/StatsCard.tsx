'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Loader2, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    positive: boolean
  }
  loading?: boolean
  color?: 'default' | 'green' | 'red' | 'blue' | 'yellow'
}

const colorVariants = {
  default: 'bg-slate-800/50 border-slate-700',
  green: 'bg-green-500/10 border-green-500/30',
  red: 'bg-red-500/10 border-red-500/30',
  blue: 'bg-blue-500/10 border-blue-500/30',
  yellow: 'bg-yellow-500/10 border-yellow-500/30',
}

const iconColorVariants = {
  default: 'bg-slate-700 text-slate-300',
  green: 'bg-green-500/20 text-green-400',
  red: 'bg-red-500/20 text-red-400',
  blue: 'bg-blue-500/20 text-blue-400',
  yellow: 'bg-yellow-500/20 text-yellow-400',
}

export function StatsCard({ title, value, icon: Icon, trend, loading, color = 'default' }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        'p-5 rounded-xl border transition-all duration-200',
        colorVariants[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          {loading ? (
            <div className="mt-2">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            </div>
          ) : (
            <motion.h3
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-2xl font-bold text-white mt-1"
            >
              {value}
            </motion.h3>
          )}
          {trend && !loading && (
            <div className="flex items-center gap-1 mt-2">
              {trend.positive ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.positive ? 'text-green-400' : 'text-red-400'
                )}
              >
                {trend.positive ? '+' : '-'}{trend.value}%
              </span>
              <span className="text-slate-500 text-xs">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'p-3 rounded-lg',
            iconColorVariants[color]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  )
}
