'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Eye, X, Info } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface VM {
  id: string
  name: string
  displayname?: string
  account?: string
  zonename?: string
  userdata?: string
}

export default function UserDataPage() {
  const { data, error, isLoading, mutate } = useSWR('/api/compute/vms', fetcher)
  const [viewTarget, setViewTarget] = useState<VM | null>(null)

  const allVMs: VM[] = data?.vms || data?.virtualmachine || []
  const vmsWithUserdata = allVMs.filter(vm => vm.userdata !== undefined && vm.userdata !== null && vm.userdata !== '')

  const decodeUserdata = (ud: string) => {
    try {
      return atob(ud)
    } catch {
      return ud
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader title="User Data" description="View cloud-init user data scripts for virtual machines" />

      <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-blue-300 text-sm">
          User Data scripts are injected into VMs at first boot via cloud-init. Only VMs with user data configured are shown below.
        </p>
      </div>

      {isLoading && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-white/5 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-32" />
              <div className="h-4 bg-white/10 rounded w-24" />
              <div className="h-4 bg-white/10 rounded w-20" />
              <div className="h-4 bg-white/10 rounded w-48" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
          <p className="text-red-400 mb-3">Failed to load VM data</p>
          <button onClick={() => mutate()} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/60 text-sm font-medium">VM Name</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Account</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Zone</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Has UserData</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Preview</th>
                <th className="text-left p-4 text-white/60 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vmsWithUserdata.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/40">No VMs with user data found</td>
                </tr>
              ) : vmsWithUserdata.map(vm => {
                const decoded = decodeUserdata(vm.userdata!)
                return (
                  <tr key={vm.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <p className="text-white font-medium">{vm.displayname || vm.name}</p>
                      <p className="text-xs text-white/40">{vm.id}</p>
                    </td>
                    <td className="p-4 text-white/60 text-sm">{vm.account || '-'}</td>
                    <td className="p-4 text-white/60 text-sm">{vm.zonename || '-'}</td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">Yes</span>
                    </td>
                    <td className="p-4 text-white/40 text-sm font-mono">
                      {decoded.slice(0, 50)}{decoded.length > 50 ? '...' : ''}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setViewTarget(vm)}
                        className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                        title="View UserData"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* View UserData Modal */}
      {viewTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-lg font-semibold text-white">User Data</h2>
                <p className="text-white/40 text-sm mt-0.5">{viewTarget.displayname || viewTarget.name}</p>
              </div>
              <button onClick={() => setViewTarget(null)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <pre className="bg-black/40 border border-white/10 rounded-lg p-4 text-white/80 text-sm font-mono overflow-auto max-h-96 whitespace-pre-wrap break-all">
                {decodeUserdata(viewTarget.userdata!)}
              </pre>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
