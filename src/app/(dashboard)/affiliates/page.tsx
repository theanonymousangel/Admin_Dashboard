
"use client";

import React, { useState, useMemo } from "react";
import {
  PlusCircle,
  Download,
  CalendarDays,
  DollarSign,
  ClipboardList,
  Hourglass,
} from "lucide-react";
import { addDays, format, isAfter, isBefore, setDate, addMonths } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { mockAffiliates } from "@/lib/mock-data";
import type { Affiliate, AffiliateSale, Payout } from "@/lib/types";

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

function calculatePayouts(sales: AffiliateSale[], commissionRate: number) {
  const today = new Date();
  let nextPayoutDate: Date | null = null;
  let nextPayoutTotal = 0;
  let pendingTotal = 0;

  const payouts = sales.map((sale): Payout => {
    const saleDate = new Date(sale.date);
    const eligibleDate = addDays(saleDate, 14);
    const payoutDate = getNextPayoutDate(eligibleDate);
    const commission = sale.amount * (commissionRate / 100);

    let status: Payout["status"];
    if (isAfter(today, payoutDate)) {
      status = "Paid";
    } else if (isAfter(today, eligibleDate)) {
      status = "Eligible for Payout";
    } else {
      status = "Pending Eligibility";
    }

    if (status === "Pending Eligibility") {
        pendingTotal += commission;
    }

    if (status !== 'Paid' && (!nextPayoutDate || isBefore(payoutDate, nextPayoutDate))) {
      nextPayoutDate = payoutDate;
    }

    return { saleId: sale.id, saleAmount: sale.amount, commission, saleDate, eligibleDate, payoutDate, status };
  }).sort((a,b) => b.saleDate.getTime() - a.saleDate.getTime());

  if (nextPayoutDate) {
    payouts.forEach(p => {
        if(p.status === 'Eligible for Payout' && p.payoutDate.getTime() === nextPayoutDate?.getTime()) {
            nextPayoutTotal += p.commission;
        }
    })
  }

  const totalCommissionPending = payouts
    .filter(p => p.status !== 'Paid')
    .reduce((acc, p) => acc + p.commission, 0);

  return { payouts, nextPayoutTotal, nextPayoutDate, pendingTotal, totalCommissionPending };
}

function PayoutStatusBadge({ status }: { status: Payout["status"] }) {
  const variant: Record<Payout["status"], "default" | "secondary" | "outline"> = {
    "Paid": "default",
    "Eligible for Payout": "secondary",
    "Pending Eligibility": "outline",
  };
  const bgColors: Record<Payout["status"], string> = {
    "Paid": "bg-green-100 text-green-800",
    "Eligible for Payout": "bg-blue-100 text-blue-800",
    "Pending Eligibility": "bg-yellow-100 text-yellow-800",
  }

  return <Badge variant={variant[status]} className={`border-none ${bgColors[status]}`}>{status}</Badge>;
}

const AffiliatePayoutDetails = ({ affiliate }: { affiliate: Affiliate }) => {
  const { payouts, nextPayoutTotal, nextPayoutDate, totalCommissionPending } = useMemo(
    () => calculatePayouts(affiliate.sales, affiliate.commissionRate),
    [affiliate.sales, affiliate.commissionRate]
  );
  
  const [filter, setFilter] = useState("all");

  const filteredPayouts = useMemo(() => {
    return payouts.filter(p => {
      if (filter === 'all') return true;
      if (filter === 'eligible') return p.status === 'Eligible for Payout';
      if (filter === 'pending') return p.status === 'Pending Eligibility';
      if (filter === 'paid') return p.status === 'Paid';
      return false;
    });
  }, [payouts, filter]);

  return (
    <div className="p-6 bg-background">
        <h3 className="text-lg font-semibold mb-4 font-headline">Payout Overview</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Eligible for Next Payout</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${nextPayoutTotal.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Next Payout Date</CardTitle>
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{nextPayoutDate ? format(nextPayoutDate, "MMM dd, yyyy") : 'N/A'}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Outstanding Commission</CardTitle>
                    <Hourglass className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${totalCommissionPending.toFixed(2)}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Payouts to Date</CardTitle>
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${affiliate.balance.toFixed(2)}</div>
                </CardContent>
            </Card>
        </div>
        <Separator className="my-4" />
        <Tabs defaultValue="all" onValueChange={setFilter}>
            <div className="flex items-center mb-4">
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="eligible">Eligible</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="paid">Paid</TabsTrigger>
                </TabsList>
                <Button size="sm" variant="outline" className="ml-auto h-8 gap-1">
                    <Download className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
                </Button>
            </div>
            <Card>
            <TabsContent value={filter} className="m-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sale ID</TableHead>
                            <TableHead>Sale Amount</TableHead>
                            <TableHead>Sale Date</TableHead>
                            <TableHead>Eligible Payout Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPayouts.length > 0 ? filteredPayouts.map((payout) => (
                            <TableRow key={payout.saleId}>
                                <TableCell className="font-mono text-xs">{payout.saleId}</TableCell>
                                <TableCell>${payout.saleAmount.toFixed(2)}</TableCell>
                                <TableCell>{format(payout.saleDate, 'MMM dd, yyyy')}</TableCell>
                                <TableCell>{format(payout.eligibleDate, 'MMM dd, yyyy')}</TableCell>
                                <TableCell><PayoutStatusBadge status={payout.status} /></TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">No payouts in this category.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TabsContent>
            </Card>
        </Tabs>
    </div>
  )
}

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>(mockAffiliates);
  
  const handleCommissionChange = (affiliateId: string, newCommission: number) => {
    setAffiliates(prev => prev.map(aff => 
      aff.id === affiliateId ? { ...aff, commissionRate: newCommission } : aff
    ));
  };

  const handleStatusChange = (affiliateId: string, newStatus: Affiliate['status']) => {
    setAffiliates(prev => prev.map(aff => 
      aff.id === affiliateId ? { ...aff, status: newStatus } : aff
    ));
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-headline">Affiliates</CardTitle>
            <CardDescription>
              Manage your affiliate partners and their performance.
            </CardDescription>
          </div>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Affiliate
            </span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Total Sales</TableHead>
              <TableHead>Commission Rate</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {affiliates.map((affiliate) => (
              <Collapsible asChild key={affiliate.id}>
                <>
                  <TableRow className="group">
                    <CollapsibleTrigger asChild>
                      <td className="font-medium p-4 align-middle cursor-pointer">{affiliate.name}</td>
                    </CollapsibleTrigger>
                    <TableCell>${affiliate.totalSales.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={affiliate.commissionRate}
                          onChange={(e) => {
                              handleCommissionChange(affiliate.id, Number(e.target.value))
                          }}
                          className="w-20 h-8"
                        />
                         <span className="text-muted-foreground">%</span>
                      </div>
                    </TableCell>
                    <TableCell>${affiliate.balance.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={affiliate.status}
                        onValueChange={(value) => {
                            handleStatusChange(affiliate.id, value as Affiliate['status']);
                        }}
                       >
                        <SelectTrigger
                            className="w-[120px] h-8"
                        >
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                  <CollapsibleContent asChild>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableCell colSpan={5}>
                        <AffiliatePayoutDetails affiliate={affiliate} />
                      </TableCell>
                    </TableRow>
                  </CollapsibleContent>
                </>
              </Collapsible>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-{affiliates.length}</strong> of <strong>{affiliates.length}</strong> affiliates
        </div>
      </CardFooter>
    </Card>
  );
}
