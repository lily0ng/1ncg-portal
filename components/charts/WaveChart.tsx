'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface WaveChartProps {
  title: string
  subtitle: string
  className?: string
}

// Generate sample wave data
const generateWaveData = (points: number, offset: number = 0) => {
  return Array.from({ length: points }, (_, i) => {
    const x = (i / (points - 1)) * 100
    // Create wave pattern using sine with some randomness
    const base = Math.sin((i + offset) * 0.3) * 30 + 50
    const variation = Math.sin((i + offset) * 0.7) * 15
    const noise = (Math.random() - 0.5) * 10
    return { x, y: Math.max(10, Math.min(90, base + variation + noise)) }
  })
}

const timeRanges = [
  { id: '3months', label: 'Last 3 months' },
  { id: '30days', label: 'Last 30 days' },
  { id: '7days', label: 'Last 7 days' },
]

const dateLabels = ['Apr 5', 'Apr 8', 'Apr 13', 'Apr 17', 'Apr 21', 'Apr 25', 'Apr 29', 'May 3', 'May 7', 'May 11', 'May 15', 'May 19', 'May 23', 'May 28', 'Jun 1', 'Jun 5', 'Jun 9', 'Jun 13', 'Jun 17', 'Jun 21', 'Jun 25', 'Jun 30']

export function WaveChart({ title, subtitle, className }: WaveChartProps) {
  const [activeRange, setActiveRange] = useState('3months')
  const [data] = useState(() => generateWaveData(100))
  
  // Create SVG path from data
  const linePath = data.reduce((path, point, i) => {
    const command = i === 0 ? 'M' : 'L'
    return `${path} ${command} ${point.x} ${100 - point.y}`
  }, '')
  
  // Create area path (close the loop)
  const areaPath = `${linePath} L 100 100 L 0 100 Z`
  
  return (
    <div className={cn('bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
          <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
        </div>
        <div className="flex gap-1">
          {timeRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => setActiveRange(range.id)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                activeRange === range.id
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Chart */}
      <div className="relative h-48 mb-4">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Gradient for area fill */}
            <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--text)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--text)" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {/* Area fill */}
          <motion.path
            d={areaPath}
            fill="url(#waveGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
          
          {/* Line stroke */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="var(--text)"
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        
        {/* Date labels */}
        <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
          {dateLabels.filter((_, i) => i % 3 === 0).slice(0, 8).map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
