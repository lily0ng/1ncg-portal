'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { ArrowLeft, Info, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Role {
  id: string
  name: string
  type?: string
  isdefault?: boolean
  description?: string
  created?: string
}

interface RolePermission {
  id: string
  roleid: string
  rule: string
  permission: string
  description?: string
}

const TYPE_BADGES: Record<string, string> = {
  Admin: 'bg-red-500/20 text-red-400',
  DomainAdmin: 'bg-orange-500/20 text-orange-400',
  User: 'bg-blue-500/20 text-blue-400',
  ResourceAdmin: 'bg-green-500/20 text-green-400',
}

export default function RoleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [activeTab, setActiveTab] = useState('overview')

  const { data: rolesData, error, isLoading } = useSWR('/api/roles', fetcher)
  const { data: permData, error: permError } = useSWR(
    activeTab === 'rules' ? `/api/roles/${id}/permissions` : null,
    fetcher
  )

  const roles: Role[] = rolesData?.roles || []
  const role = roles.find(r => r.id === id)
  const permissions: RolePermission[] = permData?.rolepermissions || []

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/10 rounded w-48" />
        <div className="h-48 bg-white/5 rounded-xl" />
      </div>
    )
  }

  if (error || !role) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
        <p className="text-red-400">Role not found</p>
        <button onClick={() => router.back()} className="mt-3 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">Go Back</button>
      </div>
    )
  }

  const typeStyle = TYPE_BADGES[role.type || 'User'] || TYPE_BADGES.User

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <PageHeader
          title={role.name}
          action={<span className={`text-xs px-2 py-1 rounded-full ${typeStyle}`}>{role.type || 'User'}</span>}
        />
      </div>

      <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit">
        {['overview', 'rules'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4">Role Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'ID', value: role.id },
              { label: 'Name', value: role.name },
              { label: 'Type', value: <span className={`text-xs px-2 py-1 rounded-full ${typeStyle}`}>{role.type}</span> },
              { label: 'Is Default', value: role.isdefault ? 'Yes' : 'No' },
              { label: 'Description', value: role.description || '-' },
              { label: 'Created', value: role.created ? new Date(role.created).toLocaleString() : '-' },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-white/5 rounded-lg">
                <p className="text-white/40 text-xs mb-1">{label}</p>
                <div className="text-white text-sm font-medium">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-4">
          {permError ? (
            <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-blue-300 text-sm">Role permission rules are managed via the CloudStack API. Configure rules via the CloudStack UI or API directly.</p>
            </div>
          ) : permissions.length === 0 ? (
            <div className="rounded-xl bg-white/5 border border-white/10 p-12 text-center">
              <ShieldCheck className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-white/60 text-lg font-medium mb-2">No Rules Configured</h3>
              <p className="text-white/40 text-sm">This role has no explicit permission rules. It inherits default permissions for its type.</p>
            </div>
          ) : (
            <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 text-sm font-medium">Rule</th>
                    <th className="text-left p-4 text-white/60 text-sm font-medium">Permission</th>
                    <th className="text-left p-4 text-white/60 text-sm font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map(perm => (
                    <tr key={perm.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white/80 text-sm font-mono">{perm.rule}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${perm.permission === 'allow' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {perm.permission}
                        </span>
                      </td>
                      <td className="p-4 text-white/40 text-sm">{perm.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
