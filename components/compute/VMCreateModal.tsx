'use client'

import { useEffect, useState, useCallback } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronRight,
  ChevronLeft,
  Globe,
  Layers,
  Cpu,
  Network,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Server,
  HardDrive,
  Key,
  Code2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Zone        { id: string; name: string; allocationstate?: string }
interface Template    { id: string; name: string; ostypename?: string; size?: number; hypervisor?: string }
interface Offering    { id: string; name: string; cpunumber?: number; memory?: number; displaytext?: string }
interface NetworkItem { id: string; name: string; type?: string; cidr?: string }
interface SSHKey      { name: string; fingerprint?: string }

interface FormData {
  zoneid:            string
  templateid:        string
  serviceofferingid: string
  networkid:         string
  displayname:       string
  keypair:           string
  userdata:          string
}

interface Props {
  open:        boolean
  onClose:     () => void
  onRefresh?:  () => void
}

// ---------------------------------------------------------------------------
// Step metadata
// ---------------------------------------------------------------------------
const STEPS = [
  { id: 1, label: 'Zone',     icon: Globe      },
  { id: 2, label: 'Template', icon: Layers     },
  { id: 3, label: 'Offering', icon: Cpu        },
  { id: 4, label: 'Network',  icon: Network    },
  { id: 5, label: 'Details',  icon: FileText   },
  { id: 6, label: 'Review',   icon: CheckCircle2 }
]

// ---------------------------------------------------------------------------
// Small reusable pieces
// ---------------------------------------------------------------------------
function StepBadge({ step, current }: { step: typeof STEPS[number]; current: number }) {
  const done   = step.id < current
  const active = step.id === current

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200',
          done   && 'bg-cyan-500 text-white',
          active && 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400',
          !done && !active && 'bg-slate-800 border border-slate-700 text-slate-500'
        )}
      >
        {done ? <CheckCircle2 className="w-4 h-4" /> : step.id}
      </div>
      <span className={cn(
        'text-xs hidden sm:block',
        active ? 'text-cyan-400 font-medium' : done ? 'text-slate-400' : 'text-slate-600'
      )}>
        {step.label}
      </span>
    </div>
  )
}

function StepConnector({ done }: { done: boolean }) {
  return (
    <div className={cn(
      'flex-1 h-px mt-4 sm:mt-4 transition-colors duration-300',
      done ? 'bg-cyan-500' : 'bg-slate-700'
    )} />
  )
}

function SelectCard({
  label,
  sublabel,
  selected,
  onClick,
  disabled
}: {
  label: string
  sublabel?: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full text-left px-4 py-3 rounded-lg border transition-all duration-150',
        selected
          ? 'border-cyan-500 bg-cyan-500/10 text-white'
          : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <p className="text-sm font-medium leading-tight">{label}</p>
      {sublabel && (
        <p className="text-xs text-slate-500 mt-0.5 leading-tight">{sublabel}</p>
      )}
    </button>
  )
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-14 rounded-lg bg-slate-800/50 animate-pulse" />
      ))}
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-red-400 text-sm py-2">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Modal
// ---------------------------------------------------------------------------
export function VMCreateModal({ open, onClose, onRefresh }: Props) {
  const [step,     setStep]     = useState(1)
  const [formData, setFormData] = useState<FormData>({
    zoneid: '', templateid: '', serviceofferingid: '',
    networkid: '', displayname: '', keypair: '', userdata: ''
  })
  const [deploying,     setDeploying]     = useState(false)
  const [deployError,   setDeployError]   = useState('')
  const [deployProgress, setDeployProgress] = useState('')

  // Step data
  const [zones,     setZones]     = useState<Zone[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [networks,  setNetworks]  = useState<NetworkItem[]>([])
  const [sshKeys,   setSSHKeys]   = useState<SSHKey[]>([])
  const [loadingStep, setLoadingStep] = useState(false)
  const [stepError,   setStepError]   = useState('')

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setStep(1)
      setFormData({ zoneid: '', templateid: '', serviceofferingid: '', networkid: '', displayname: '', keypair: '', userdata: '' })
      setDeploying(false)
      setDeployError('')
      setDeployProgress('')
      setZones([])
      setTemplates([])
      setOfferings([])
      setNetworks([])
      setSSHKeys([])
    }
  }, [open])

  // Fetch data when step becomes active
  useEffect(() => {
    if (!open) return

    async function load() {
      setLoadingStep(true)
      setStepError('')

      try {
        if (step === 1) {
          const res  = await fetch('/api/zones')
          const data = await res.json()
          setZones(Array.isArray(data?.zones) ? data.zones : Array.isArray(data) ? data : [])
        }
        if (step === 2 && formData.zoneid) {
          const res  = await fetch(`/api/images/templates?zoneid=${formData.zoneid}&templatefilter=executable`)
          const data = await res.json()
          setTemplates(Array.isArray(data?.templates) ? data.templates : Array.isArray(data) ? data : [])
        }
        if (step === 3) {
          const res  = await fetch('/api/service-offerings/compute')
          const data = await res.json()
          setOfferings(Array.isArray(data?.offerings) ? data.offerings : Array.isArray(data) ? data : [])
        }
        if (step === 4 && formData.zoneid) {
          const res  = await fetch(`/api/network/networks?zoneid=${formData.zoneid}`)
          const data = await res.json()
          setNetworks(Array.isArray(data?.networks) ? data.networks : Array.isArray(data) ? data : [])
        }
        if (step === 5) {
          const res  = await fetch('/api/compute/ssh-keys')
          const data = await res.json()
          setSSHKeys(Array.isArray(data?.keypairs) ? data.keypairs : Array.isArray(data) ? data : [])
        }
      } catch (e: any) {
        setStepError(e.message || 'Failed to load data')
      } finally {
        setLoadingStep(false)
      }
    }

    load()
  }, [step, open, formData.zoneid])

  const set = useCallback(<K extends keyof FormData>(key: K, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  const canAdvance = () => {
    if (step === 1) return !!formData.zoneid
    if (step === 2) return !!formData.templateid
    if (step === 3) return !!formData.serviceofferingid
    if (step === 4) return true // network is optional
    if (step === 5) return !!formData.displayname.trim()
    return true
  }

  const handleNext = () => {
    if (canAdvance() && step < 6) setStep(s => s + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1)
  }

  const handleDeploy = async () => {
    setDeploying(true)
    setDeployError('')
    setDeployProgress('Submitting deployment...')

    try {
      const body: Record<string, string> = {
        zoneid:            formData.zoneid,
        templateid:        formData.templateid,
        serviceofferingid: formData.serviceofferingid,
        displayname:       formData.displayname.trim()
      }
      if (formData.networkid) body.networkids = formData.networkid
      if (formData.keypair)   body.keypair    = formData.keypair
      if (formData.userdata)  body.userdata   = btoa(formData.userdata)

      setDeployProgress('Deploying VM — this may take a minute...')
      const res = await fetch('/api/compute/vms', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body)
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || err.details || 'Deployment failed')
      }

      setDeployProgress('VM deployed successfully!')
      toast.success(`VM "${formData.displayname}" deployed successfully!`)
      onRefresh?.()
      setTimeout(() => onClose(), 800)
    } catch (e: any) {
      setDeployError(e.message)
      setDeployProgress('')
    } finally {
      setDeploying(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Zone info helpers for review step
  // ---------------------------------------------------------------------------
  const selectedZone     = zones.find(z => z.id === formData.zoneid)
  const selectedTemplate = templates.find(t => t.id === formData.templateid)
  const selectedOffering = offerings.find(o => o.id === formData.serviceofferingid)
  const selectedNetwork  = networks.find(n => n.id === formData.networkid)

  // ---------------------------------------------------------------------------
  // Render step content
  // ---------------------------------------------------------------------------
  const renderStep = () => {
    switch (step) {
      // -----------------------------------------------------------------------
      case 1:
        return (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Select the availability zone where your VM will run.</p>
            {loadingStep ? (
              <LoadingGrid />
            ) : stepError ? (
              <ErrorMessage message={stepError} />
            ) : zones.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No zones available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {zones.map(zone => (
                  <SelectCard
                    key={zone.id}
                    label={zone.name}
                    sublabel={zone.allocationstate}
                    selected={formData.zoneid === zone.id}
                    onClick={() => {
                      set('zoneid', zone.id)
                      // Reset downstream selections
                      set('templateid', '')
                      set('serviceofferingid', '')
                      set('networkid', '')
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )

      // -----------------------------------------------------------------------
      case 2:
        return (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Choose an OS template or image for your instance.</p>
            {loadingStep ? (
              <LoadingGrid />
            ) : stepError ? (
              <ErrorMessage message={stepError} />
            ) : templates.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No templates found for selected zone.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {templates.map(tmpl => (
                  <SelectCard
                    key={tmpl.id}
                    label={tmpl.name}
                    sublabel={[tmpl.ostypename, tmpl.hypervisor].filter(Boolean).join(' · ')}
                    selected={formData.templateid === tmpl.id}
                    onClick={() => set('templateid', tmpl.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )

      // -----------------------------------------------------------------------
      case 3:
        return (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Select the compute size (vCPUs and RAM) for your VM.</p>
            {loadingStep ? (
              <LoadingGrid />
            ) : stepError ? (
              <ErrorMessage message={stepError} />
            ) : offerings.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No service offerings available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {offerings.map(off => (
                  <SelectCard
                    key={off.id}
                    label={off.name}
                    sublabel={
                      off.cpunumber && off.memory
                        ? `${off.cpunumber} vCPU · ${(off.memory / 1024).toFixed(off.memory < 1024 ? 0 : 1)} GB RAM`
                        : off.displaytext
                    }
                    selected={formData.serviceofferingid === off.id}
                    onClick={() => set('serviceofferingid', off.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )

      // -----------------------------------------------------------------------
      case 4:
        return (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Attach a network to your VM. You can skip this step.</p>
            {loadingStep ? (
              <LoadingGrid />
            ) : stepError ? (
              <ErrorMessage message={stepError} />
            ) : (
              <>
                {/* "No network" option */}
                <SelectCard
                  label="No network (default)"
                  sublabel="CloudStack will assign a default network"
                  selected={formData.networkid === ''}
                  onClick={() => set('networkid', '')}
                />
                {networks.map(net => (
                  <SelectCard
                    key={net.id}
                    label={net.name}
                    sublabel={[net.type, net.cidr].filter(Boolean).join(' · ')}
                    selected={formData.networkid === net.id}
                    onClick={() => set('networkid', net.id)}
                  />
                ))}
              </>
            )}
          </div>
        )

      // -----------------------------------------------------------------------
      case 5:
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Configure display name, SSH key, and optional user data.</p>

            {/* Display name */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                Instance Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.displayname}
                onChange={e => set('displayname', e.target.value)}
                placeholder="my-web-server"
                className={cn(
                  'w-full px-3 py-2 rounded-lg text-sm bg-slate-800 border transition-colors',
                  'text-white placeholder-slate-500 outline-none',
                  'focus:border-cyan-500 border-slate-700'
                )}
              />
            </div>

            {/* SSH Key */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                SSH Key Pair <span className="text-slate-500">(optional)</span>
              </label>
              {loadingStep ? (
                <div className="h-9 rounded-lg bg-slate-800 animate-pulse" />
              ) : (
                <select
                  value={formData.keypair}
                  onChange={e => set('keypair', e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg text-sm bg-slate-800 border border-slate-700',
                    'text-white outline-none focus:border-cyan-500 transition-colors',
                    'appearance-none cursor-pointer'
                  )}
                >
                  <option value="">-- No SSH key --</option>
                  {sshKeys.map(k => (
                    <option key={k.name} value={k.name}>{k.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* User data */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                User Data / Cloud-Init <span className="text-slate-500">(optional)</span>
              </label>
              <textarea
                value={formData.userdata}
                onChange={e => set('userdata', e.target.value)}
                rows={5}
                placeholder={'#!/bin/bash\napt update && apt install -y nginx'}
                className={cn(
                  'w-full px-3 py-2 rounded-lg text-sm bg-slate-800 border border-slate-700',
                  'text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors',
                  'font-mono resize-none'
                )}
              />
              <p className="text-xs text-slate-600 mt-1">Will be base64-encoded automatically.</p>
            </div>
          </div>
        )

      // -----------------------------------------------------------------------
      case 6:
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Review your configuration before deploying.</p>

            <div className="rounded-xl border border-slate-700/60 overflow-hidden divide-y divide-slate-700/60">
              {[
                {
                  icon: Globe,
                  label: 'Zone',
                  value: selectedZone?.name || formData.zoneid
                },
                {
                  icon: Layers,
                  label: 'Template',
                  value: selectedTemplate ? `${selectedTemplate.name}${selectedTemplate.ostypename ? ` (${selectedTemplate.ostypename})` : ''}` : formData.templateid
                },
                {
                  icon: Cpu,
                  label: 'Service Offering',
                  value: selectedOffering
                    ? `${selectedOffering.name}${selectedOffering.cpunumber ? ` · ${selectedOffering.cpunumber} vCPU, ${selectedOffering.memory ? (selectedOffering.memory / 1024).toFixed(1) : '?'} GB` : ''}`
                    : formData.serviceofferingid
                },
                {
                  icon: Network,
                  label: 'Network',
                  value: selectedNetwork?.name || (formData.networkid ? formData.networkid : 'Default')
                },
                {
                  icon: Server,
                  label: 'Name',
                  value: formData.displayname
                },
                {
                  icon: Key,
                  label: 'SSH Key',
                  value: formData.keypair || 'None'
                },
                {
                  icon: Code2,
                  label: 'User Data',
                  value: formData.userdata ? `${formData.userdata.length} characters` : 'None'
                }
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3 bg-slate-800/30">
                  <Icon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-xs text-slate-500 w-28 flex-shrink-0">{label}</span>
                  <span className="text-sm text-white truncate">{value}</span>
                </div>
              ))}
            </div>

            {deployError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{deployError}</span>
              </div>
            )}

            {deployProgress && !deployError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                <span>{deployProgress}</span>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v && !deploying) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-full max-w-lg mx-4',
            'bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl',
            'flex flex-col max-h-[90vh]'
          )}
          onInteractOutside={e => { if (deploying) e.preventDefault() }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-700/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Server className="w-4 h-4 text-white" />
              </div>
              <div>
                <Dialog.Title className="text-base font-semibold text-white leading-tight">
                  Deploy New Instance
                </Dialog.Title>
                <p className="text-xs text-slate-500 leading-tight">Step {step} of {STEPS.length}</p>
              </div>
            </div>
            <Dialog.Close
              disabled={deploying}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          {/* Step progress */}
          <div className="flex items-start px-6 py-4 border-b border-slate-700/50 flex-shrink-0">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-start flex-1 min-w-0">
                <StepBadge step={s} current={step} />
                {i < STEPS.length - 1 && (
                  <StepConnector done={s.id < step} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  {(() => {
                    const s = STEPS.find(s => s.id === step)!
                    const Icon = s.icon
                    return (
                      <>
                        <Icon className="w-4 h-4 text-cyan-400" />
                        {s.label}
                      </>
                    )
                  })()}
                </h2>
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50 flex-shrink-0 gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1 || deploying}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                'border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white',
                'disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-2">
              {/* Dot indicators */}
              <div className="hidden sm:flex items-center gap-1 mr-2">
                {STEPS.map(s => (
                  <div
                    key={s.id}
                    className={cn(
                      'rounded-full transition-all duration-200',
                      s.id === step
                        ? 'w-4 h-1.5 bg-cyan-500'
                        : s.id < step
                          ? 'w-1.5 h-1.5 bg-cyan-700'
                          : 'w-1.5 h-1.5 bg-slate-700'
                    )}
                  />
                ))}
              </div>

              {step < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canAdvance() || deploying}
                  className={cn(
                    'flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    'bg-cyan-600 hover:bg-cyan-500 text-white',
                    'disabled:opacity-40 disabled:cursor-not-allowed'
                  )}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDeploy}
                  disabled={deploying}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {deploying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Server className="w-4 h-4" />
                      Deploy Instance
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
