'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { toast } from 'sonner'
import { Mail, Phone, Clock } from 'lucide-react'

const FAQ = [
  {q:'How do I add a customer?', a:'Go to Customers and click Add Customer. Fill in the account details and a CloudStack account will be created in your reseller domain.'},
  {q:'How is my commission calculated?', a:'Your commission is calculated as a percentage of total customer resource usage for each billing period.'},
  {q:'How do I generate invoices?', a:'Go to Billing → Invoices and click Generate Invoice. Select the customer and billing period.'},
  {q:'Can I set custom pricing for customers?', a:'Contact your administrator to set up custom pricing plans for specific accounts.'},
]

export default function ResellerSupportPage() {
  const [openFaq, setOpenFaq] = useState<number|null>(null)
  const [form, setForm] = useState({ subject:'', category:'Technical', description:'' })

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Support Center" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-white">Submit a Ticket</h3>
          <div><label className="text-sm text-white/60 block mb-1">Subject</label><input value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>
          <div><label className="text-sm text-white/60 block mb-1">Category</label>
            <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
              {['Technical','Billing','Account','General'].map(c=><option key={c}>{c}</option>)}
            </select></div>
          <div><label className="text-sm text-white/60 block mb-1">Description</label><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm h-24" /></div>
          <button onClick={() => { toast.success('Ticket submitted! We will respond within 24 hours.'); setForm({subject:'',category:'Technical',description:''}) }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm">Submit Ticket</button>
        </div>
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
            <h3 className="font-semibold text-white">Contact Us</h3>
            {[[Mail,'support@1cng.com'],[Phone,'+1-800-CLOUD-01'],[Clock,'24/7 Support Available']].map(([Icon,v]: any) => (
              <div key={v as string} className="flex items-center gap-3 text-sm text-white/70"><Icon className="w-4 h-4 text-indigo-400" />{v}</div>
            ))}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
            <h3 className="font-semibold text-white">FAQ</h3>
            {FAQ.map((f,i) => (
              <div key={i} className="border-b border-white/10 pb-2">
                <button onClick={() => setOpenFaq(openFaq===i?null:i)} className="text-sm text-white text-left w-full">{f.q}</button>
                {openFaq===i && <p className="text-sm text-white/60 mt-2">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}