'use client'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Square, RotateCcw, Terminal, Monitor, Cpu, HardDrive, Network, Clock, Tag } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

function StatCard({ icon: Icon, label, value }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-[var(--accent)]" />
      </div>
      <div>
        <p className="text-xs text-[var(--text-muted)]">{label}</p>
        <p className="text-sm font-semibold text-[var(--text)]">{value}</p>
      </div>
    </div>
  )
}

export default function InstanceDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const { data, isLoading, mutate } = useSWR(`/api/compute/vms/${id}`, fetcher)

  const vm = data?.vm

  async function doAction(action: string) {
    await fetch(`/api/compute/vms/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
    mutate()
  }

  const statusColor: Record<string, string> = {
    Running: 'text-green-400', Stopped: 'text-gray-400', Starting: 'text-yellow-400', Stopping: 'text-orange-400', Error: 'text-red-400'
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">{isLoading ? '...' : vm?.name || 'Instance Detail'}</h1>
          <p className="text-sm text-[var(--text-muted)]">{vm?.id}</p>
        </div>
        {vm?.state && (
          <span className={`ml-auto text-sm font-medium px-3 py-1 rounded-full bg-white/10 ${statusColor[vm.state] || 'text-[var(--text)]'}`}>
            {vm.state}
          </span>
        )}
      </div>

      {isLoading && <div className="animate-pulse h-40 bg-white/5 rounded-xl" />}

      {vm && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Cpu} label="vCPUs" value={vm.cpunumber || '—'} />
            <StatCard icon={HardDrive} label="Memory" value={vm.memory ? `${(vm.memory/1024).toFixed(0)} GB` : '—'} />
            <StatCard icon={Network} label="IP Address" value={vm.nic?.[0]?.ipaddress || '—'} />
            <StatCard icon={Clock} label="Created" value={vm.created ? new Date(vm.created).toLocaleDateString() : '—'} />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text)]">Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => doAction('start')} disabled={vm.state === 'Running'} className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">
                <Play className="w-4 h-4" /> Start
              </button>
              <button onClick={() => doAction('stop')} disabled={vm.state === 'Stopped'} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">
                <Square className="w-4 h-4" /> Stop
              </button>
              <button onClick={() => doAction('reboot')} disabled={vm.state !== 'Running'} className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">
                <RotateCcw className="w-4 h-4" /> Reboot
              </button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text)]">Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {[
                ['Zone', vm.zonename],
                ['Template', vm.templatename],
                ['Service Offering', vm.serviceofferingname],
                ['Hypervisor', vm.hypervisor],
                ['OS Type', vm.ostypename],
                ['Account', vm.account],
                ['Domain', vm.domain],
                ['Group', vm.group || '—'],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-2 border-b border-white/5">
                  <dt className="text-[var(--text-muted)]">{k}</dt>
                  <dd className="text-[var(--text)] font-medium">{v || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          {vm.nic && vm.nic.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-[var(--text)]">Network Interfaces</h2>
              {vm.nic.map((nic: any) => (
                <div key={nic.id} className="flex items-center justify-between py-2 border-b border-white/5 text-sm last:border-0">
                  <span className="text-[var(--text-muted)]">{nic.networkname}</span>
                  <span className="text-[var(--text)]">{nic.ipaddress}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
