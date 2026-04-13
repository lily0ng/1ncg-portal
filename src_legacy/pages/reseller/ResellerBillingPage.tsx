import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatsCard } from '../../components/shared/StatsCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/Table';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { DollarSign, FileText, TrendingUp, Users, Plus, Eye, CheckCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { mockInvoices, mockUsers } from '../../lib/mockData';

// Mock reseller-scoped data
const customerAccounts = mockUsers.filter((u) => u.role === 'user');

const customerRevenue = [
  { name: 'user1', revenue: 1250.0 },
  { name: 'user2', revenue: 980.5 },
  { name: 'user3', revenue: 760.0 },
  { name: 'user4', revenue: 540.0 },
  { name: 'user5', revenue: 430.25 },
];

const recentInvoices = [...mockInvoices].slice(0, 5);

export function ResellerBillingPage() {
  const [generateOpen, setGenerateOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(false);

  const totalRevenue = customerRevenue.reduce((a, c) => a + c.revenue, 0);
  const pendingCount = mockInvoices.filter((i) => i.status === 'Unpaid' || i.status === 'Overdue').length;
  const commissionRate = 0.15;
  const commissionEarned = totalRevenue * commissionRate;

  const handleGenerate = async () => {
    if (!selectedAccount || !selectedMonth) {
      toast.error('Please select account and month');
      return;
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      toast.success('Invoice generated successfully');
      setGenerateOpen(false);
      setSelectedAccount('');
      setSelectedMonth('');
    } catch {
      toast.error('Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Billing Overview" description="Monitor customer revenue and manage invoices.">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setGenerateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Generate Invoice
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Revenue This Month" value={`$${totalRevenue.toFixed(2)}`} icon={DollarSign} delay={0.1} />
        <StatsCard title="Pending Invoices" value={pendingCount} icon={FileText} delay={0.2} />
        <StatsCard title="Commission Earned" value={`$${commissionEarned.toFixed(2)}`} icon={TrendingUp} delay={0.3} />
        <StatsCard title="Active Customers" value={customerAccounts.length} icon={Users} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Customer Revenue (Top 10)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Invoices</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setGenerateOpen(true)}>
                <Plus className="mr-2 h-3 w-3" /> Generate
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice#</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                      <TableCell>{inv.account}</TableCell>
                      <TableCell>${inv.amount.toFixed(2)}</TableCell>
                      <TableCell><StatusBadge status={inv.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Generate Invoice Modal */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Account</label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account..." />
                </SelectTrigger>
                <SelectContent>
                  {customerAccounts.map((u) => (
                    <SelectItem key={u.id} value={u.account}>{u.account} — {u.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Billing Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month..." />
                </SelectTrigger>
                <SelectContent>
                  {['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setGenerateOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleGenerate} disabled={loading}>
                {loading ? 'Generating…' : 'Generate'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
