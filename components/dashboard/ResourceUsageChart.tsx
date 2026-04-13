'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { motion } from 'framer-motion'

interface Props {
  summary?: any
  loading?: boolean
}

export function ResourceUsageChart({ summary, loading }: Props) {
  // Build chart data from real capacity data
  const cpu = summary?.compute?.cpu
  const memory = summary?.compute?.memory
  const storage = summary?.storage?.primaryUsed

  const data = [
    {
      name: 'CPU',
      used: Math.round(cpu?.percent ?? 0),
      free: Math.round(100 - (cpu?.percent ?? 0)),
    },
    {
      name: 'Memory',
      used: Math.round(memory?.percent ?? 0),
      free: Math.round(100 - (memory?.percent ?? 0)),
    },
    {
      name: 'Storage',
      used: Math.round(storage?.percent ?? 0),
      free: Math.round(100 - (storage?.percent ?? 0)),
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5"
    >
      <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Resource Usage</h3>
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" domain={[0, 100]} stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={12} width={60} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                }}
                formatter={(value: any) => [`${value}%`]}
              />
              <Legend />
              <Bar dataKey="used" fill="#3b82f6" name="Used %" stackId="a" radius={[0, 4, 4, 0]} />
              <Bar dataKey="free" fill="#1e293b" name="Free %" stackId="a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}
