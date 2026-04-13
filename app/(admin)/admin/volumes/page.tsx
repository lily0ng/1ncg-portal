'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { useVolumes } from '@/hooks/useVolumes'
import { Volume } from '@/types/cloudstack'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function VolumesPage() {
  const { volumes, isLoading } = useVolumes()

  const columns = [
    {
      key: 'name',
      header: 'Name',
      cell: (volume: Volume) => (
        <div>
          <p className="font-medium text-white">{volume.name}</p>
          <p className="text-xs text-slate-500">{volume.id}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      cell: (volume: Volume) => (
        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
          {volume.type}
        </span>
      ),
    },
    {
      key: 'state',
      header: 'Status',
      cell: (volume: Volume) => (
        <span className={`text-sm ${volume.state === 'Ready' ? 'text-green-400' : 'text-yellow-400'}`}>
          {volume.state}
        </span>
      ),
    },
    {
      key: 'size',
      header: 'Size',
      cell: (volume: Volume) => (
        <span className="text-sm text-slate-300">
          {volume.size ? `${(volume.size / 1073741824).toFixed(2)} GB` : '-'}
        </span>
      ),
    },
    {
      key: 'vmname',
      header: 'Attached to',
      cell: (volume: Volume) => (
        <span className="text-sm text-slate-300">{volume.vmname || 'Not attached'}</span>
      ),
    },
    {
      key: 'zonename',
      header: 'Zone',
      cell: (volume: Volume) => (
        <span className="text-sm text-slate-300">{volume.zonename || '-'}</span>
      ),
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <PageHeader
        title="Volumes"
        description="Manage storage volumes"
        action={
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Create Volume
          </button>
        }
      />

      <motion.div variants={itemVariants}>
        <DataTable
          columns={columns}
          data={volumes}
          loading={isLoading}
        />
      </motion.div>
    </motion.div>
  )
}
