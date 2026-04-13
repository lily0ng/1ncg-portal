'use client'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { MessageSquare } from 'lucide-react'

export default function CommentsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Annotations & Comments" description="Resource annotations and notes" />
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-8 h-8 text-indigo-400" />
          <div>
            <h3 className="font-medium text-white">Resource Annotations</h3>
            <p className="text-sm text-white/60">CloudStack supports adding annotations/comments to resources for documentation and tracking</p>
          </div>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 text-sm text-indigo-300">
          Annotations can be added to VMs, networks, volumes, hosts, and other resources via the resource detail pages.
        </div>
      </div>
    </motion.div>
  )
}