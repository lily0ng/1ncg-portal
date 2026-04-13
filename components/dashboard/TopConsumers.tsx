'use client'

import { motion } from 'framer-motion'
import { Server, HardDrive, Cpu, MemoryStick } from 'lucide-react'

const consumers = [
  { name: 'Production Cluster', vms: 24, cpu: 48, memory: 128, storage: 2048 },
  { name: 'Development Zone', vms: 12, cpu: 24, memory: 64, storage: 1024 },
  { name: 'Testing Environment', vms: 8, cpu: 16, memory: 32, storage: 512 },
  { name: 'Staging Area', vms: 6, cpu: 12, memory: 24, storage: 384 },
]

export function TopConsumers() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 border border-slate-800 rounded-xl p-5"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Top Resource Consumers</h3>
      <div className="space-y-4">
        {consumers.map((consumer, index) => (
          <motion.div
            key={consumer.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 rounded-lg bg-slate-800/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white">{consumer.name}</span>
              <span className="text-xs text-slate-400">{consumer.vms} VMs</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1 text-slate-400">
                <Cpu className="w-3 h-3" />
                {consumer.cpu} vCPUs
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <MemoryStick className="w-3 h-3" />
                {consumer.memory} GB
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <HardDrive className="w-3 h-3" />
                {consumer.storage} GB
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
