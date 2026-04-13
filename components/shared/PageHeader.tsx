'use client'

import { motion } from 'framer-motion'

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  actions?: React.ReactNode
}

export function PageHeader({ title, description, action, actions }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && <p className="text-slate-400 mt-1">{description}</p>}
      </div>
      {(action || actions) && <div>{action || actions}</div>}
    </motion.div>
  )
}
