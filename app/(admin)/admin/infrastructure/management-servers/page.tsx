"use client"
import useSWR from "swr"
import { motion } from "framer-motion"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Page() {
  const { data, error, isLoading, mutate } = useSWR("/api/infrastructure/management-servers", fetcher)
  const raw = Array.isArray(data) ? data : (data?.managementserver || [])
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Management Servers" />
      {isLoading && <div className="animate-pulse h-40 bg-white/5 rounded-xl" />}
      {error && <div className="text-red-400 p-4 bg-red-400/10 rounded-xl">Failed to load. <button onClick={() => mutate()} className="underline">Retry</button></div>}
      {!isLoading && !error && (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10 text-white/60">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">State</th>
              <th className="px-4 py-3 text-left">Version</th>
              <th className="px-4 py-3 text-left">Created</th>
            </tr></thead>
            <tbody>
              {raw.map((item: any, i: number) => (
                <tr key={item.id || i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white">{item.name || item.username || item.displayname || item.hostname || "-"}</td>
                  <td className="px-4 py-3"><StatusBadge status={item.state || item.status || "active"} /></td>
                  <td className="px-4 py-3 text-white/70">{item.zonename || item.zone || item.hypervisor || item.type || "-"}</td>
                  <td className="px-4 py-3 text-white/60">{item.created ? new Date(item.created).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
              {raw.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-white/40">No items found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}
