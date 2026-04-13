'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { motion } from 'framer-motion'

const data = [
  { month: 'Jan', revenue: 2800 },
  { month: 'Feb', revenue: 3200 },
  { month: 'Mar', revenue: 3100 },
  { month: 'Apr', revenue: 3500 },
  { month: 'May', revenue: 3800 },
  { month: 'Jun', revenue: 3600 },
  { month: 'Jul', revenue: 4200 },
  { month: 'Aug', revenue: 4500 },
  { month: 'Sep', revenue: 4100 },
  { month: 'Oct', revenue: 3900 },
  { month: 'Nov', revenue: 4300 },
  { month: 'Dec', revenue: 4800 },
]

export function RevenueChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 border border-slate-800 rounded-xl p-5"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend (12 Months)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: number) => [`$${value}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
