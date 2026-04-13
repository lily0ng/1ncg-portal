import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '../../components/ui/Collapsible';
import { Send, ChevronDown, Mail, Phone, Clock } from 'lucide-react';
import { toast } from 'sonner';

const faqs = [
  {
    q: 'How do I add a new customer account?',
    a: 'Navigate to Accounts section and click "Create Account". Fill in the required details and assign appropriate permissions.',
  },
  {
    q: 'How is billing calculated for my customers?',
    a: 'Billing is based on resource usage — vCPUs, memory, storage and IPs consumed. Usage is tracked hourly and invoiced monthly.',
  },
  {
    q: 'How do I set my commission rate?',
    a: 'Commission rates are set by the admin. Contact support or your account manager to update your commission structure.',
  },
  {
    q: 'Can I generate invoices for my customers?',
    a: 'Yes. Navigate to Billing > Customer Invoices and click "Generate Invoice". Select the customer account and billing month.',
  },
  {
    q: 'How do I view a customer\'s resource usage?',
    a: 'Go to Billing Overview. The customer revenue chart shows usage per account. For detailed breakdowns, use the Usage API endpoint.',
  },
  {
    q: 'What happens when a customer invoice is overdue?',
    a: 'Overdue invoices are flagged in the system. You can manually mark them as paid once payment is received, or contact support for automated reminders.',
  },
];

export function ResellerSupportPage() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !category || !priority || !description) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      toast.success('Support ticket submitted successfully! We\'ll respond within 24 hours.');
      setSubject('');
      setCategory('');
      setPriority('');
      setDescription('');
    } catch {
      toast.error('Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Support Center" description="Get help with your reseller portal." />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Tabs defaultValue="ticket" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[480px]">
            <TabsTrigger value="ticket">Submit Ticket</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
          </TabsList>

          {/* Submit Ticket */}
          <TabsContent value="ticket" className="mt-6">
            <Card className="border-border/50 max-w-2xl">
              <CardHeader>
                <CardTitle>New Support Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject <span className="text-red-500">*</span></label>
                    <Input
                      placeholder="Brief description of your issue"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category <span className="text-red-500">*</span></label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category…" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technical">Technical</SelectItem>
                          <SelectItem value="Billing">Billing</SelectItem>
                          <SelectItem value="General">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority <span className="text-red-500">*</span></label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority…" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description <span className="text-red-500">*</span></label>
                    <textarea
                      className="w-full min-h-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      placeholder="Provide detailed information about your issue…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={submitting}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {submitting ? 'Submitting…' : 'Submit Ticket'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq" className="mt-6">
            <div className="max-w-2xl space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Collapsible
                    open={openFaq === i}
                    onOpenChange={(open) => setOpenFaq(open ? i : null)}
                  >
                    <CollapsibleTrigger asChild>
                      <button className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-card p-4 text-left hover:bg-muted/50 transition-colors">
                        <span className="font-medium text-sm">{faq.q}</span>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border border-t-0 border-border/50 rounded-b-lg bg-muted/20 px-4 py-3">
                        <p className="text-sm text-muted-foreground">{faq.a}</p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Contact Info */}
          <TabsContent value="contact" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
              {[
                {
                  icon: Mail,
                  title: 'Email Support',
                  value: 'reseller@cloudmgmt.io',
                  sub: 'Response within 4 hours',
                  color: 'text-blue-400',
                  bg: 'bg-blue-500/10',
                },
                {
                  icon: Phone,
                  title: 'Phone Support',
                  value: '+1 (800) 555-0199',
                  sub: 'Mon – Fri, 9am – 6pm',
                  color: 'text-green-400',
                  bg: 'bg-green-500/10',
                },
                {
                  icon: Clock,
                  title: 'Support Hours',
                  value: '24 / 7',
                  sub: 'Critical issues only',
                  color: 'text-purple-400',
                  bg: 'bg-purple-500/10',
                },
              ].map(({ icon: Icon, title, value, sub, color, bg }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border-border/50 text-center">
                    <CardContent className="pt-6 pb-6 space-y-3">
                      <div className={`mx-auto w-12 h-12 rounded-full ${bg} flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="font-semibold mt-1">{value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
