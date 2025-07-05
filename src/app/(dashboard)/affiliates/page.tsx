
"use client";

import React, { useState, useMemo } from "react";
import {
  PlusCircle,
  Download,
  CalendarDays,
  DollarSign,
  ClipboardList,
  Hourglass,
  UploadCloud,
  Trash2,
  File as FileIcon,
  MoreHorizontal,
  UserX,
  UserCheck,
} from "lucide-react";
import { addDays, format, isAfter, isBefore, setDate, addMonths } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


import { mockAffiliates } from "@/lib/mock-data";
import type { Affiliate, AffiliateSale, Payout, AffiliateDocument, Transaction, PayoutDetails } from "@/lib/types";

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

    return { saleId: sale.id, productName: sale.productName, saleAmount: sale.amount, commission, saleDate, eligibleDate, payoutDate, status, customerName: sale.customerName };
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

const PayoutsView = ({ affiliate }: { affiliate: Affiliate }) => {
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
                    <CardTitle className="text-sm font-medium">Unpaid Commission</CardTitle>
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
                            <TableHead>Customer</TableHead>
                            <TableHead>Product</TableHead>
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
                                <TableCell>{payout.customerName}</TableCell>
                                <TableCell>{payout.productName}</TableCell>
                                <TableCell>${payout.saleAmount.toFixed(2)}</TableCell>
                                <TableCell>{format(payout.saleDate, 'MMM dd, yyyy')}</TableCell>
                                <TableCell>{format(payout.eligibleDate, 'MMM dd, yyyy')}</TableCell>
                                <TableCell><PayoutStatusBadge status={payout.status} /></TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">No payouts in this category.</TableCell>
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

const AccountView = ({ affiliate, onUpdate }: { affiliate: Affiliate, onUpdate: (id: string, data: Partial<Affiliate>) => void }) => {
    const isDeleted = affiliate.status === 'Deleted';
    const [formData, setFormData] = useState({
        firstName: affiliate.firstName,
        lastName: affiliate.lastName,
        username: affiliate.username,
        email: affiliate.email,
        paypalEmail: affiliate.payoutDetails?.paypalEmail ?? '',
        accountHolder: affiliate.payoutDetails?.accountHolder ?? '',
        bankName: affiliate.payoutDetails?.bankName ?? '',
        accountNumber: affiliate.payoutDetails?.accountNumber ?? '',
        routingNumber: affiliate.payoutDetails?.routingNumber ?? '',
    });
    const [documents, setDocuments] = useState<AffiliateDocument[]>(affiliate.documents);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSaveDetails = () => {
        const { firstName, lastName, username, email } = formData;
        onUpdate(affiliate.id, { firstName, lastName, username, email });
    };

    const handleSavePayoutDetails = () => {
        const { paypalEmail, accountHolder, bankName, accountNumber, routingNumber } = formData;
        const payoutDetails: Partial<PayoutDetails> = { paypalEmail, accountHolder, bankName, accountNumber, routingNumber };
        onUpdate(affiliate.id, { payoutDetails });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                id: `doc-${Date.now()}-${Math.random()}`,
                name: file.name,
                url: '#', // Placeholder URL
                uploadedAt: new Date().toISOString().split('T')[0],
            }));
            const updatedDocuments = [...documents, ...newFiles];
            setDocuments(updatedDocuments);
            onUpdate(affiliate.id, { documents: updatedDocuments });
        }
    };

    const handleRemoveDocument = (docId: string) => {
        const updatedDocuments = documents.filter(doc => doc.id !== docId);
        setDocuments(updatedDocuments);
        onUpdate(affiliate.id, { documents: updatedDocuments });
    };

    return (
        <div className="p-6 bg-background grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal & Account Details</CardTitle>
                        <CardDescription>Edit the affiliate's personal and login information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" value={formData.firstName} onChange={handleInputChange} disabled={isDeleted} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" value={formData.lastName} onChange={handleInputChange} disabled={isDeleted} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" value={formData.username} onChange={handleInputChange} disabled={isDeleted} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} disabled={isDeleted} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSaveDetails} disabled={isDeleted}>Save Details</Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" placeholder="••••••••" disabled={isDeleted}/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" placeholder="••••••••" disabled={isDeleted}/>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button disabled={isDeleted}>Update Password</Button>
                    </CardFooter>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Payout Information</CardTitle>
                        <CardDescription>Banking or PayPal details for sending payouts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="paypalEmail">PayPal Email</Label>
                            <Input id="paypalEmail" value={formData.paypalEmail} onChange={handleInputChange} placeholder="affiliate@paypal.com" disabled={isDeleted} />
                        </div>
                        <div className="relative my-4">
                            <Separator />
                            <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-background px-2 text-sm text-muted-foreground">OR</span>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="accountHolder">Account Holder Name</Label>
                            <Input id="accountHolder" value={formData.accountHolder} onChange={handleInputChange} placeholder="Jane Doe" disabled={isDeleted} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="bankName">Bank Name</Label>
                            <Input id="bankName" value={formData.bankName} onChange={handleInputChange} placeholder="Global Bank" disabled={isDeleted} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="accountNumber">Account Number</Label>
                            <Input id="accountNumber" value={formData.accountNumber} onChange={handleInputChange} placeholder="**** **** **** 1234" disabled={isDeleted} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="routingNumber">Routing Number</Label>
                            <Input id="routingNumber" value={formData.routingNumber} onChange={handleInputChange} placeholder="123456789" disabled={isDeleted} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSavePayoutDetails} disabled={isDeleted}>Save Payout Info</Button>
                    </CardFooter>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Affiliate Documents</CardTitle>
                        <CardDescription>Upload or manage documents for this affiliate.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            {documents.length > 0 ? (
                                <ul className="space-y-2">
                                    {documents.map(doc => (
                                        <li key={doc.id} className="flex items-center justify-between text-sm p-2 rounded-md border">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <span className="font-medium truncate" title={doc.name}>{doc.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10" onClick={() => handleRemoveDocument(doc.id)} disabled={isDeleted}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center text-sm text-muted-foreground py-4">
                                    No documents uploaded.
                                </div>
                            )}
                        </div>
                        <div className="relative border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2"/>
                            <Label htmlFor="file-upload" className={`font-semibold ${isDeleted ? 'cursor-not-allowed text-muted-foreground' : 'text-primary cursor-pointer'}`}>
                                Upload Documents
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">Select one or more files to upload.</p>
                            <Input id="file-upload" type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={isDeleted}/>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const TransactionsView = ({ affiliate }: { affiliate: Affiliate }) => {

  const transactions = useMemo(() => {
    const { payouts } = calculatePayouts(affiliate.sales, affiliate.commissionRate);
    const generatedTransactions: Transaction[] = [];

    payouts.forEach(payout => {
      generatedTransactions.push({
        id: `${payout.saleId}-comm`,
        date: payout.saleDate,
        type: 'Commission',
        productName: payout.productName,
        amount: payout.commission,
        status: payout.status === 'Paid' ? 'Completed' : 'Pending',
        saleId: payout.saleId,
        customerName: payout.customerName,
      });
    });
    
    if (affiliate.id === 'aff-01' && affiliate.sales.length > 0) {
       const saleToRefund = affiliate.sales[0];
       const commissionToRefund = saleToRefund.amount * (affiliate.commissionRate / 100);
        generatedTransactions.push({
            id: `${saleToRefund.id}-refund`,
            date: addDays(new Date(saleToRefund.date), 5),
            type: 'Refund',
            productName: saleToRefund.productName,
            amount: -commissionToRefund,
            status: 'Reversed',
            saleId: saleToRefund.id,
            customerName: saleToRefund.customerName,
        })
    }


    return generatedTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [affiliate]);

  const TransactionBadge = ({ status, type }: { status: Transaction['status'], type: Transaction['type'] }) => {
    let text: string;
    let colorClass: string;

    if (type === 'Refund') {
        text = 'Refunded';
        colorClass = 'bg-red-100 text-red-800';
    } else {
        switch(status) {
            case 'Completed':
                text = 'Successful';
                colorClass = 'bg-green-100 text-green-800';
                break;
            case 'Pending':
                text = 'Pending';
                colorClass = 'bg-yellow-100 text-yellow-800';
                break;
            case 'Reversed':
                text = 'Reversed';
                colorClass = 'bg-red-100 text-red-800';
                break;
        }
    }
    return <Badge className={`border-none ${colorClass}`}>{text}</Badge>;
  }

  return (
    <div className="p-6 bg-background">
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>A log of all sales commissions and refunds for this affiliate.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                  <TableCell>{format(new Date(tx.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{tx.customerName}</TableCell>
                  <TableCell>{tx.productName}</TableCell>
                  <TableCell><TransactionBadge status={tx.status} type={tx.type} /></TableCell>
                  <TableCell className={`text-right font-medium ${tx.amount > 0 ? '' : 'text-destructive'}`}>
                    {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">No transactions to display.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const AffiliateDetails = ({ affiliate, onUpdate }: { affiliate: Affiliate; onUpdate: (id: string, data: Partial<Affiliate>) => void }) => {
    return (
        <Tabs defaultValue="account" className="w-full">
            <TabsList className="px-6">
                <TabsTrigger value="account">Account Overview</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="payouts">Payout Overview</TabsTrigger>
            </TabsList>
            <Separator />
            <TabsContent value="account" className="m-0">
                <AccountView affiliate={affiliate} onUpdate={onUpdate} />
            </TabsContent>
            <TabsContent value="transactions" className="m-0">
                <TransactionsView affiliate={affiliate} />
            </TabsContent>
            <TabsContent value="payouts" className="m-0">
                <PayoutsView affiliate={affiliate} />
            </TabsContent>
        </Tabs>
    );
};


export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>(mockAffiliates);
  const [openAffiliateId, setOpenAffiliateId] = useState<string | null>(null);
  
  const handleAffiliateUpdate = (affiliateId: string, data: Partial<Affiliate>) => {
    setAffiliates(prev => prev.map(aff =>
      aff.id === affiliateId ? { ...aff, ...data } : aff
    ));
    // If status is changed to 'Deleted', close the details view
    if (data.status === 'Deleted') {
      setOpenAffiliateId(null);
    }
  };
  
  const handlePermanentDelete = (affiliateId: string) => {
    setAffiliates(prev => prev.filter(aff => aff.id !== affiliateId));
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
              <TableHead>Username</TableHead>
              <TableHead>Sales Value</TableHead>
              <TableHead>Commission Rate</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Sales</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {affiliates.map((affiliate) => (
              <React.Fragment key={affiliate.id}>
                <TableRow 
                  className="border-b cursor-pointer"
                  onClick={() => {
                    setOpenAffiliateId(openAffiliateId === affiliate.id ? null : affiliate.id)
                  }}
                >
                  <TableCell className="font-medium">{affiliate.username}</TableCell>
                  <TableCell>${affiliate.totalSales.toLocaleString()}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={affiliate.commissionRate}
                        onChange={(e) => {
                            handleAffiliateUpdate(affiliate.id, { commissionRate: Number(e.target.value) })
                        }}
                        className="w-20 h-8"
                        disabled={affiliate.status === 'Deleted'}
                      />
                        <span className="text-muted-foreground">%</span>
                    </div>
                  </TableCell>
                  <TableCell>${affiliate.balance.toFixed(2)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      defaultValue={affiliate.status}
                      onValueChange={(value) => {
                          handleAffiliateUpdate(affiliate.id, { status: value as Affiliate['status'] });
                      }}
                      >
                      <SelectTrigger
                          className={`w-[120px] h-8 ${affiliate.status === 'Deleted' ? 'text-muted-foreground' : ''}`}
                      >
                          <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                          <SelectItem value="Deleted">Deleted</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{affiliate.sales.length}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {affiliate.status !== 'Deleted' ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-2">
                                <UserX className="h-4 w-4" />
                                <span>Disable Account</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Disable Affiliate Account?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Disabling this account will revoke their access and stop commission tracking. Their data will be retained. Are you sure?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleAffiliateUpdate(affiliate.id, { status: 'Deleted' })}>
                                  Yes, Disable
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <DropdownMenuItem onClick={() => handleAffiliateUpdate(affiliate.id, { status: 'Active' })} className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            <span>Enable Account</span>
                          </DropdownMenuItem>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                              onSelect={(e) => e.preventDefault()}
                              disabled={affiliate.status !== 'Deleted'}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Permanently Delete</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the affiliate and all of their associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handlePermanentDelete(affiliate.id)} className={buttonVariants({ variant: "destructive" })}>
                                Yes, Permanently Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                {openAffiliateId === affiliate.id && (
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableCell colSpan={7} className="p-0">
                      <AffiliateDetails affiliate={affiliate} onUpdate={handleAffiliateUpdate} />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
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
