import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatsCard } from '../../components/shared/StatsCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/Table';
import { Percent, DollarSign, TrendingUp, Award, Info } from 'lucide-react';

const COMMISSION_RATE = 0.15;

const allCommissions = [
  { month: '2024-01', customerRevenue: 3960.5, rate: 0.15, earned: 594.08, status: 'Paid', year: '2024' },
  { month: '2024-02', customerRevenue: 4120.75, rate: 0.15, earned: 618.11, status: 'Paid', year: '2024' },
  { month: '2024-03', customerRevenue: 3850.0, rate: 0.15, earned: 577.5, status: 'Paid', year: '2024' },
  { month: '2024-04', customerRevenue: 4300.0, rate: 0.15, earned: 645.0, status: 'Pending', year: '2024' },
  { month: '2023-10', customerRevenue: 3100.0, rate: 0.12, earned: 372.0, status: 'Paid', year: '2023' },
  { month: '2023-11', customerRevenue: 3250.0, rate: 0.12, earned: 390.0, status: 'Paid', year: '2023' },
  { month: '2023-12', customerRevenue: 3800.0, rate: 0.12, earned: 456.0, status: 'Paid', year: '2023' },
];

export function ResellerCommissionsPage() {
  const [yearFilter, setYearFilter] = useState('2024');

  const filtered = allCommissions.filter((c) => c.year === yearFilter);
  const totalRevenue = filtered.reduce((a, c) => a + c.customerRevenue, 0);
  const totalCommission = filtered.reduce((a, c) => a + c.earned, 0);
  const ytdCommission = allCommissions.reduce((a, c) => a + c.earned, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="My Commissions" description="Track your earned commissions from customer revenue." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Commission Rate" value={`${(COMMISSION_RATE * 100).toFixed(0)}%`} icon={Percent} delay={0.1} />
        <StatsCard title="Total Customer Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={DollarSign} delay={0.2} />
        <StatsCard title="My Commission" value={`$${totalCommission.toFixed(2)}`} icon={TrendingUp} delay={0.3} />
        <StatsCard title="YTD Commission" value={`$${ytdCommission.toFixed(2)}`} icon={Award} delay={0.4} />
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
      >
        <Info className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-300">
          Your commission is calculated on customer usage × your commission rate. Commission is paid out monthly after invoice settlement.
        </p>
      </motion.div>

      {/* Year Filter + Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Commission Breakdown</CardTitle>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['2024', '2023'].map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Customer Revenue</TableHead>
                  <TableHead>Commission Rate</TableHead>
                  <TableHead>Commission Earned</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No commission data for selected year.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row, i) => (
                    <motion.tr
                      key={row.month}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{row.month}</TableCell>
                      <TableCell>${row.customerRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>{(row.rate * 100).toFixed(0)}%</TableCell>
                      <TableCell className="font-semibold text-green-500">
                        ${row.earned.toFixed(2)}
                      </TableCell>
                      <TableCell><StatusBadge status={row.status} /></TableCell>
                    </motion.tr>
                  ))
                )}
                {filtered.length > 0 && (
                  <TableRow className="bg-muted/30 font-semibold">
                    <TableCell>Total</TableCell>
                    <TableCell>${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell className="text-green-500">${totalCommission.toFixed(2)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
