import React from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatsCard } from '../../components/shared/StatsCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle } from
'../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockInvoices } from '../../lib/mockData';
import { CreditCard, Receipt, AlertCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
'../../components/ui/Table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
export function UserBillingPage() {
  const userInvoices = mockInvoices.filter((inv) => inv.account === 'user1');
  const totalPaid = userInvoices.
  filter((i) => i.status === 'Paid').
  reduce((a, i) => a + i.amount, 0);
  const totalUnpaid = userInvoices.
  filter((i) => i.status === 'Unpaid').
  reduce((a, i) => a + i.amount, 0);
  const usageData = [
  {
    month: 'Jan',
    amount: 185.5
  },
  {
    month: 'Feb',
    amount: 210.0
  },
  {
    month: 'Mar',
    amount: 195.75
  },
  {
    month: 'Apr',
    amount: 220.0
  }];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Manage your billing and payments." />
      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Current Balance"
          value="$195.75"
          icon={CreditCard}
          delay={0.1} />
        
        <StatsCard
          title="Total Paid"
          value={`$${totalPaid.toFixed(0)}`}
          icon={Receipt}
          delay={0.2} />
        
        <StatsCard
          title="Unpaid"
          value={`$${totalUnpaid.toFixed(0)}`}
          icon={AlertCircle}
          delay={0.3}
          className="border-yellow-500/50" />
        
        <StatsCard
          title="Avg Monthly"
          value="$203"
          icon={TrendingUp}
          delay={0.4} />
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Monthly Usage</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false} />
                
                <XAxis
                  dataKey="month"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false} />
                
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`} />
                
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px'
                  }}
                  itemStyle={{
                    color: 'var(--foreground)'
                  }}
                  formatter={(value: number) => [
                  `$${value.toFixed(2)}`,
                  'Cost']
                  } />
                
                <Bar
                  dataKey="amount"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]} />
                
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invoices</CardTitle>
            <Button variant="outline" size="sm">
              Pay Now
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userInvoices.map((inv, i) =>
                <motion.tr
                  key={inv.id}
                  initial={{
                    opacity: 0,
                    y: 10
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  transition={{
                    delay: i * 0.05
                  }}
                  className="border-b">
                  
                    <TableCell className="font-medium">{inv.month}</TableCell>
                    <TableCell>${inv.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <StatusBadge status={inv.status} />
                    </TableCell>
                  </motion.tr>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>);

}