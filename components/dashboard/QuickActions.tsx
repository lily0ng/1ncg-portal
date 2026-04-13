'use client'

import { motion } from 'framer-motion'
import {
  Plus,
  Network,
  UserPlus,
  RefreshCw,
  Server,
  Cloud,
} from 'lucide-react'
import Link from 'next/link'

const actions = [
  { icon: Plus, label: 'Deploy VM', href: '/admin/compute/instances', color: 'bg-blue-500' },
  { icon: Network, label: 'Create Network', href: '/admin/network/guest-networks', color: 'bg-purple-500' },
  { icon: UserPlus, label: 'Add User', href: '/admin/accounts', color: 'bg-green-500' },
  { icon: RefreshCw, label: 'Sync CloudStack', href: '/admin/sync-cloudstack', color: 'bg-orange-500' },
]

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 border border-slate-800 rounded-xl p-5"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Link key={action.label} href={action.href}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className={`${action.color} p-3 rounded-lg`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-slate-300 text-center">{action.label}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  )
}
