'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { motion } from 'framer-motion'

interface Props {
  vms?: any[]
  loading?: boolean
}

const COLORS: Record<string, string> = {
  Running: '#22c55e',
  Stopped: '#f59e0b',
  Error: '#ef4444',
  Destroyed: '#6b7280',
  Starting: '#3b82f6',
  Stopping: '#f97316',
  Migrating: '#8b5cf6',
  Unknown: '#64748b',
}

export function VMStatusChart({ vms = [], loading }: Props) {
  // Build distribution from real VM state data
  const stateCounts: Record<string, number> = {}
  vms.forEach((vm) => {
    const state = vm.state || 'Unknown'
    stateCounts[state] = (stateCounts[state] || 0) + 1
  })

  const data = Object.entries(stateCounts).map(([name, value]) => ({
    name,
    value,
    color: COLORS[name] || '#64748b',
  }))

  const isEmpty = data.length === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5"
    >
      <h3 className="text-lg font-semibold text-[var(--text)] mb-4">VM Status Distribution</h3>
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isEmpty ? (
        <div className="h-64 flex items-center justify-center text-[var(--text-muted)] text-sm">
          No VMs found
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}
