"use client";

import React, { useState, useMemo } from "react";
import { addDays, format, isAfter, isBefore, setDate, addMonths, parseISO } from "date-fns";
import {
  DollarSign,
  Users,
  Wallet,
  CalendarClock,
  Download,
  AlertTriangle,
  ArrowRightLeft,
  Banknote,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { mockAffiliates } from "@/lib/mock-data";
import type { Affiliate, AffiliateSale, Payout, Transaction } from "@/lib/types";

// Payout Logic
function getNextPayoutDate(eligibleDate: Date): Date {
  const payoutDays = [7, 14, 21, 28];
  const eligibleDayOfMonth = eligibleDate.getDate();
  for (const day of payoutDays) {
    if (eligibleDayOfMonth <= day) {
      return setDate(eligibleDate, day);
    }
  }
  const nextMonth = addMonths(eligibleDate, 1);
  return setDate(nextMonth, 7);
}

const processAffiliateData = (affiliates: Affiliate[]) => {
  let totalEarnings = 0;
  let totalPaidOut = 0;
  let totalPending = 0;
  let totalAvailable = 0;
  const allTransactions: Transaction[] = [];
  const affiliateDataMap = new Map<string, any>();
  
  const today = new Date();

  affiliates.forEach(affiliate => {
    let affiliateTotalEarnings = 0;
    let affiliateTotalPaid = 0;
    let affiliateTotalPending = 0;
    let affiliateTotalAvailable = 0;
    let affiliateNextPayoutDate: Date | null = null;

    const payouts: Payout[] = affiliate.sales.map(sale => {
      const saleDate = parseISO(sale.date);
      const commission = sale.amount * (affiliate.commissionRate / 100);
      const eligibleDate = addDays(saleDate, 14);
      const payoutDate = getNextPayoutDate(eligibleDate);

      let status: Payout["status"] = "Pending Eligibility";
      if (isAfter(today, payoutDate)) {
        status = "Paid";
      } else if (isAfter(today, eligibleDate)) {
        status = "Eligible for Payout";
      }

      allTransactions.push({
        id: `${affiliate.id}-${sale.id}-income`,
        type: "Income",
        affiliateName: affiliate.name,
        amount: sale.amount,
        date: saleDate,
        status: "Completed",
        notes: `Sale #${sale.id}`,
      });

      if (status === "Paid") {
         allTransactions.push({
            id: `${affiliate.id}-${sale.id}-payout`,
            type: "Payout",
            affiliateName: affiliate.name,
            amount: commission,
            date: payoutDate,
            status: "Completed",
            notes: `Commission for sale #${sale.id}`,
         });
      }

      affiliateTotalEarnings += commission;
      if (status === "Paid") affiliateTotalPaid += commission;
      if (status === "Pending Eligibility") affiliateTotalPending += commission;
      if (status === "Eligible for Payout") affiliateTotalAvailable += commission;
      
      if (status === 'Eligible for Payout' && (!affiliateNextPayoutDate || isBefore(payoutDate, affiliateNextPayoutDate))) {
        affiliateNextPayoutDate = payoutDate;
      }

      return { saleId: sale.id, saleAmount: sale.amount, commission, saleDate, eligibleDate, payoutDate, status };
    });

    affiliateDataMap.set(affiliate.id, {
      ...affiliate,
      calculated: {
        totalEarnings: affiliateTotalEarnings,
        totalPaid: affiliateTotalPaid,
        totalPending: affiliateTotalPending,
        totalAvailable: affiliateTotalAvailable,
        nextPayoutDate: affiliateNextPayoutDate,
        payouts: payouts.sort((a,b) => b.saleDate.getTime() - a.saleDate.getTime()),
      }
    });

    totalEarnings += affiliateTotalEarnings;
    totalPaidOut += affiliateTotalPaid;
    totalPending += affiliateTotalPending;
    totalAvailable += affiliateTotalAvailable;
  });

  const nextPayouts = Array.from(affiliateDataMap.values())
    .filter(a => a.calculated.nextPayoutDate)
    .map(a => ({ date: a.calculated.nextPayoutDate, affiliate: a }));

  let nextGlobalPayoutDate: Date | null = null;
  let nextGlobalPayoutAmount = 0;
  let nextGlobalPayoutAffiliateCount = 0;

  if (nextPayouts.length > 0) {
    nextGlobalPayoutDate = nextPayouts.reduce((earliest, p) => (p.date < earliest ? p.date : earliest), nextPayouts[0].date);
    
    const affiliatesForNextDate = new Set<string>();
    Array.from(affiliateDataMap.values()).forEach(aff => {
      aff.calculated.payouts.forEach((p: Payout) => {
        if(p.status === 'Eligible for Payout' && p.payoutDate.getTime() === nextGlobalPayoutDate?.getTime()){
          nextGlobalPayoutAmount += p.commission;
          affiliatesForNextDate.add(aff.id);
        }
      });
    });
    nextGlobalPayoutAffiliateCount = affiliatesForNextDate.size;
  }

  allTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

  const monthlyData: { [key: string]: { month: string, income: number, payouts: number } } = {};
  allTransactions.forEach(t => {
      const monthKey = format(t.date, 'yyyy-MM');
      if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: format(t.date, 'MMM yy'), income: 0, payouts: 0 };
      }
      if (t.type === 'Income') {
          monthlyData[monthKey].income += t.amount;
      } else if (t.type === 'Payout') {
          monthlyData[monthKey].payouts += t.amount;
      }
  });
  const chartData = Object.values(monthlyData).sort((a,b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  return {
    globalStats: { totalEarnings, totalPaidOut, totalPending, totalAvailable },
    nextPayoutInfo: { date: nextGlobalPayoutDate, amount: nextGlobalPayoutAmount, count: nextGlobalPayoutAffiliateCount },
    allTransactions,
    affiliateDataMap,
    chartData,
  };
};

const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string, icon: React.ElementType, description?: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
);

const TransactionStatusBadge = ({ status }: { status: Payout['status'] | 'Completed' }) => {
    const styles: {[key: string]: React.CSSProperties} = {
      'Paid': { backgroundColor: '#E8F5E9', color: '#198754'},
      'Completed': { backgroundColor: '#E8F5E9', color: '#198754'},
      'Eligible for Payout': { backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))'},
      'Pending Eligibility': { backgroundColor: '#FFFBEB', color: '#F59E0B' },
    }
    const style = styles[status] || {};
    return <Badge style={style} className="border-transparent font-normal text-xs">{status}</Badge>;
}


export default function PayoutsPage() {
    const [affiliates] = useState<Affiliate[]>(mockAffiliates);
    const [selectedAffiliateId, setSelectedAffiliateId] = useState<string | null>(null);

    const { globalStats, nextPayoutInfo, allTransactions, affiliateDataMap, chartData } = useMemo(
        () => processAffiliateData(affiliates),
        [affiliates]
    );

    const selectedAffiliateData = selectedAffiliateId ? affiliateDataMap.get(selectedAffiliateId) : null;
    
    return (
        <div className="flex flex-col gap-6">
            {nextPayoutInfo.date && (
                <Alert className="bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]">
                    <AlertTriangle className="h-4 w-4 !text-[#F59E0B]" />
                    <AlertTitle className="font-semibold">Upcoming Payouts</AlertTitle>
                    <AlertDescription>
                        You have <span className="font-bold">${nextPayoutInfo.amount.toFixed(2)}</span> in payouts for {nextPayoutInfo.count} affiliate(s) scheduled for <span className="font-bold">{format(nextPayoutInfo.date, "MMM dd, yyyy")}</span>.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <StatCard title="Total Affiliate Earnings" value={`$${globalStats.totalEarnings.toFixed(2)}`} icon={DollarSign} description="All-time gross commission."/>
                <StatCard title="Total Paid Out" value={`$${globalStats.totalPaidOut.toFixed(2)}`} icon={Banknote} description="All-time paid commissions."/>
                <StatCard title="Pending Commission" value={`$${globalStats.totalPending.toFixed(2)}`} icon={Wallet} description="Commissions in 14-day hold."/>
                <StatCard title="Available for Payout" value={`$${globalStats.totalAvailable.toFixed(2)}`} icon={ArrowRightLeft} description="Ready for next payout cycle."/>
                <StatCard title="Next Global Payout" value={nextPayoutInfo.date ? format(nextPayoutInfo.date, 'MMM dd, yyyy') : 'N/A'} icon={CalendarClock} description="Next scheduled payout date."/>
            </div>

            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overall View</TabsTrigger>
                    <TabsTrigger value="byAffiliate">Affiliate Breakdown</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Income vs. Payouts</CardTitle>
                            <CardDescription>A summary of total sales income generated by affiliates versus commissions paid out.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                           <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                        labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Legend wrapperStyle={{fontSize: "12px", paddingTop: '10px'}}/>
                                    <Bar dataKey="income" fill="hsl(var(--muted))" name="Total Sales" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="payouts" fill="hsl(var(--primary))" name="Commissions Paid" radius={[4, 4, 0, 0]} />
                                </BarChart>
                           </ResponsiveContainer>
                        </CardContent>
                     </Card>
                     <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Transactions</CardTitle>
                                    <CardDescription>A log of all income and payout transactions.</CardDescription>
                                </div>
                                <Button variant="default" size="sm"><Download className="mr-2 h-4 w-4"/>Export CSV</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Affiliate</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allTransactions.slice(0, 10).map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-medium">{t.type}</TableCell>
                                            <TableCell>{t.affiliateName}</TableCell>
                                            <TableCell>${t.amount.toFixed(2)}</TableCell>
                                            <TableCell>{format(t.date, 'MMM dd, yyyy')}</TableCell>
                                            <TableCell><TransactionStatusBadge status="Completed" /></TableCell>
                                            <TableCell className="text-muted-foreground">{t.notes}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                     </Card>
                </TabsContent>
                
                <TabsContent value="byAffiliate" className="space-y-4">
                    <Card>
                        <CardHeader>
                             <CardTitle>Affiliate Balance Viewer</CardTitle>
                             <CardDescription>Select an affiliate to view their detailed financial summary.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <Select onValueChange={setSelectedAffiliateId}>
                                <SelectTrigger className="w-full md:w-[320px]">
                                    <SelectValue placeholder="Select an affiliate" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from(affiliateDataMap.values()).map(a => (
                                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            
                            {selectedAffiliateData && (
                                <div className="border-t pt-4 mt-4 space-y-4">
                                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                     <StatCard title="Total Earned" value={`$${selectedAffiliateData.calculated.totalEarnings.toFixed(2)}`} icon={DollarSign} />
                                     <StatCard title="Total Paid" value={`$${selectedAffiliateData.calculated.totalPaid.toFixed(2)}`} icon={Banknote} />
                                     <StatCard title="Pending Commission" value={`$${selectedAffiliateData.calculated.totalPending.toFixed(2)}`} icon={Wallet} />
                                     <StatCard title="Next Payout Date" value={selectedAffiliateData.calculated.nextPayoutDate ? format(selectedAffiliateData.calculated.nextPayoutDate, 'MMM dd, yyyy') : 'N/A'} icon={CalendarClock} />
                                  </div>
                                  <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Payout Details</CardTitle>
                                                <CardDescription>A detailed log of this affiliate's sales and commission status.</CardDescription>
                                            </div>
                                             <Button variant="default" size="sm"><Download className="mr-2 h-4 w-4"/>Export CSV</Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Sale Date</TableHead>
                                                    <TableHead>Sale Amount</TableHead>
                                                    <TableHead>Commission</TableHead>
                                                    <TableHead>Eligibility Date</TableHead>
                                                    <TableHead>Scheduled Payout</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedAffiliateData.calculated.payouts.map((p: Payout) => (
                                                  <TableRow key={p.saleId}>
                                                    <TableCell>{format(p.saleDate, 'MMM dd, yyyy')}</TableCell>
                                                    <TableCell>${p.saleAmount.toFixed(2)}</TableCell>
                                                    <TableCell>${p.commission.toFixed(2)}</TableCell>
                                                    <TableCell>{format(p.eligibleDate, 'MMM dd, yyyy')}</TableCell>
                                                    <TableCell>{format(p.payoutDate, 'MMM dd, yyyy')}</TableCell>
                                                    <TableCell>
                                                        <TransactionStatusBadge status={p.status}/>
                                                    </TableCell>
                                                  </TableRow>  
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                  </Card>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
