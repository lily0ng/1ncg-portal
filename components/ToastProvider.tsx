'use client'

import { Toaster } from 'sonner'
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react'

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      duration={4000}
      gap={12}
      visibleToasts={6}
      toastOptions={{
        style: {
          background: 'var(--surface)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '16px 20px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
        },
        className: 'custom-toast',
      }}
      icons={{
        success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
        error: <XCircle className="w-5 h-5 text-red-400" />,
        warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
        info: <Info className="w-5 h-5 text-blue-400" />,
      }}
    />
  )
}
