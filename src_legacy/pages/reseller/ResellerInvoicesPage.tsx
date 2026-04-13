import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/Table';
import { Plus, Search, Eye, CheckCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { mockInvoices, mockUsers } from '../../lib/mockData';
import { Invoice } from '../../types/cloudstack';

const MMK_RATE = 2100;

const customerAccounts = mockUsers.filter((u) => u.role === 'user');

export function ResellerInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [genAccount, setGenAccount] = useState('');
  const [genMonth, setGenMonth] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
      const matchSearch = inv.account.toLowerCase().includes(search.toLowerCase()) ||
        inv.id.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [invoices, statusFilter, search]);

  const handleMarkPaid = async (inv: Invoice) => {
    try {
      await new Promise((r) => setTimeout(r, 600));
      setInvoices((prev) => prev.map((i) => i.id === inv.id ? { ...i, status: 'Paid' } : i));
      toast.success(`Invoice ${inv.id} marked as paid`);
    } catch {
      toast.error('Failed to update invoice');
    }
  };

  const handleDownload = (inv: Invoice) => {
    toast.info(`Downloading invoice ${inv.id}…`);
  };

  const handleGenerate = async () => {
    if (!genAccount || !genMonth) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      const newInv: Invoice = {
        id: `inv-${Date.now()}`,
        account: genAccount,
        amount: Math.floor(Math.random() * 800) + 200,
        status: 'Unpaid',
        month: genMonth,
        created: new Date().toISOString(),
      };
      setInvoices((prev) => [newInv, ...prev]);
      toast.success('Invoice generated successfully');
      setGenerateOpen(false);
      setGenAccount('');
      setGenMonth('');
    } catch {
      toast.error('Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Invoices" description="Manage and generate invoices for your customers.">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setGenerateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Generate Invoice
        </Button>
      </PageHeader>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer or invoice…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['All', 'Unpaid', 'Paid', 'Overdue'].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-md border bg-card"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice#</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Amount (USD)</TableHead>
              <TableHead>Amount (MMK)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((inv, i) => (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                  <TableCell className="font-medium">{inv.account}</TableCell>
                  <TableCell>{inv.month}</TableCell>
                  <TableCell>${inv.amount.toFixed(2)}</TableCell>
                  <TableCell>{(inv.amount * MMK_RATE).toLocaleString()} MMK</TableCell>
                  <TableCell><StatusBadge status={inv.status} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(new Date(inv.created).getTime() + 30 * 86400000).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(inv.created).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="View">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {inv.status !== 'Paid' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-green-500 hover:text-green-400"
                          title="Mark as Paid"
                          onClick={() => handleMarkPaid(inv)}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        title="Download"
                        onClick={() => handleDownload(inv)}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Generate Invoice Modal */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Account</label>
              <Select value={genAccount} onValueChange={setGenAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account…" />
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
              <Select value={genMonth} onValueChange={setGenMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month…" />
                </SelectTrigger>
                <SelectContent>
                  {['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setGenerateOpen(false)}>Cancel</Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? 'Generating…' : 'Generate Invoice'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
