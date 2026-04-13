'use client'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { Puzzle } from 'lucide-react'

const EXTENSIONS = [
  { name: 'Nicira NVP', desc: 'Network Virtualization Platform integration', status: 'Available' },
  { name: 'VMware NSX', desc: 'VMware NSX network virtualization', status: 'Available' },
  { name: 'BigSwitch BCF', desc: 'Big Cloud Fabric SDN controller', status: 'Available' },
  { name: 'Brocade VCS', desc: 'Brocade VCS Fabric integration', status: 'Available' },
  { name: 'F5 BigIP', desc: 'F5 load balancer integration', status: 'Available' },
  { name: 'NetScaler', desc: 'Citrix NetScaler load balancer', status: 'Available' },
]

export default function ExtensionsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Extensions" description="CloudStack plugins and integrations" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXTENSIONS.map(ext => (
          <div key={ext.name} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg"><Puzzle className="w-5 h-5 text-indigo-400" /></div>
              <div>
                <h3 className="font-medium text-white">{ext.name}</h3>
                <p className="text-sm text-white/60 mt-1">{ext.desc}</p>
                <span className="mt-2 inline-block text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">{ext.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}