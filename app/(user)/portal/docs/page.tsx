'use client'
import { motion } from 'framer-motion'
import { BookOpen, ExternalLink, ChevronRight, Cpu, HardDrive, Network, Shield, Box, CreditCard } from 'lucide-react'

const DOCS_SECTIONS = [
  {
    icon: Cpu,
    title: 'Compute',
    description: 'Deploy and manage virtual machines',
    articles: [
      'Getting started with instances',
      'Instance types and sizes',
      'Managing SSH keys',
      'Console access and VNC',
      'Instance snapshots',
    ]
  },
  {
    icon: HardDrive,
    title: 'Storage',
    description: 'Block storage and volume management',
    articles: [
      'Creating volumes',
      'Attaching and detaching volumes',
      'Volume snapshots',
      'Backup policies',
    ]
  },
  {
    icon: Network,
    title: 'Networking',
    description: 'Virtual networks and connectivity',
    articles: [
      'Guest networks overview',
      'Public IP addresses',
      'Load balancing',
      'VPN setup',
      'Firewall rules',
    ]
  },
  {
    icon: Box,
    title: 'Kubernetes',
    description: 'Managed Kubernetes clusters',
    articles: [
      'Creating a cluster',
      'Connecting with kubectl',
      'Scaling node groups',
      'Cluster upgrades',
    ]
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Security groups and access control',
    articles: [
      'Security groups',
      'Two-factor authentication',
      'API keys',
    ]
  },
  {
    icon: CreditCard,
    title: 'Billing',
    description: 'Pricing and invoice management',
    articles: [
      'Understanding your bill',
      'Invoice download',
      'Payment methods',
    ]
  },
]

export default function DocsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Documentation</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Learn how to use the platform</p>
      </div>

      <div className="relative">
        <input
          placeholder="Search documentation..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
        />
        <BookOpen className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3.5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOCS_SECTIONS.map((section) => (
          <div key={section.title} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center">
                <section.icon className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text)] text-sm">{section.title}</h3>
                <p className="text-xs text-[var(--text-muted)]">{section.description}</p>
              </div>
            </div>
            <ul className="space-y-2">
              {section.articles.map((article) => (
                <li key={article}>
                  <button className="w-full flex items-center justify-between text-xs text-[var(--text-muted)] hover:text-[var(--text)] py-1 group transition-colors">
                    <span>{article}</span>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
