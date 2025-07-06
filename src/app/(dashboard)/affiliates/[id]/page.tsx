
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import {
  ArrowLeft,
  PlusCircle,
  Download,
  CalendarDays,
  DollarSign,
  ClipboardList,
  Hourglass,
  UploadCloud,
  Trash2,
  File,
  MoreHorizontal,
  UserX,
  UserCheck,
  Info,
  Save,
  CheckCircle2,
  XCircle,
  Pencil,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { mockAffiliates, mockProducts } from "@/lib/mock-data";
import type { Affiliate, AffiliateSale, Payout, AffiliateDocument, Transaction, PayoutDetails, Product } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// --- Helper Functions and Components ---

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
    
    if (sale.status) {
      status = sale.status;
    } else {
      if (isAfter(today, eligibleDate)) {
        status = "Eligible for Payout";
      } else {
        status = "Pending Payout";
      }
    }

    if (status === "Pending Payout") {
        pendingTotal += commission;
    }

    if (status !== 'Paid' && (!nextPayoutDate || isBefore(payoutDate, nextPayoutDate))) {
      nextPayoutDate = payoutDate;
    }

    return { saleId: sale.id, productName: sale.productName, productSize: sale.productSize, productColor: sale.productColor, saleAmount: sale.amount, commission, saleDate, eligibleDate, payoutDate, status, customerName: sale.customerName };
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
    "Pending Payout": "outline",
  };
  const bgColors: Record<Payout["status"], string> = {
    "Paid": "bg-green-100 text-green-800",
    "Eligible for Payout": "bg-blue-100 text-blue-800",
    "Pending Payout": "bg-yellow-100 text-yellow-800",
  }

  return <Badge variant={variant[status]} className={`border-none ${bgColors[status]}`}>{status}</Badge>;
}

const PayoutStatusEditor = ({ payout, onStatusChange }: { payout: Payout, onStatusChange: (saleId: string, newStatus: Payout['status']) => void }) => {
    const [currentStatus, setCurrentStatus] = useState(payout.status);
    const [isDirty, setIsDirty] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setCurrentStatus(payout.status);
        setIsDirty(false);
    }, [payout.status]);

    const handleSelectChange = (newStatus: Payout['status']) => {
        setCurrentStatus(newStatus);
        setIsDirty(newStatus !== payout.status);
    };

    const handleSave = () => {
        onStatusChange(payout.saleId, currentStatus);
        setIsDirty(false);
        toast({
            title: "Status Updated",
            description: `Payout status for sale #${payout.saleId} has been saved.`,
        });
    };

    return (
        <div className="flex items-center gap-2">
            <Select
                value={currentStatus}
                onValueChange={handleSelectChange}
            >
                <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="Set Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Pending Payout">Pending Payout</SelectItem>
                    <SelectItem value="Eligible for Payout">Eligible for Payout</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
            </Select>
            {isDirty && (
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleSave}>
                    <Save className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
};

const PayoutsView = ({ affiliate, onUpdate }: { affiliate: Affiliate, onUpdate: (id: string, data: Partial<Affiliate>) => void }) => {
  const { payouts, nextPayoutTotal, nextPayoutDate, totalCommissionPending } = useMemo(
    () => calculatePayouts(affiliate.sales, affiliate.commissionRate),
    [affiliate.sales, affiliate.commissionRate]
  );
  
  const [filter, setFilter] = useState("all");

  const handleStatusChange = (saleId: string, newStatus: Payout['status']) => {
    const updatedSales = affiliate.sales.map(sale => 
        sale.id === saleId ? { ...sale, status: newStatus } : sale
    );
    onUpdate(affiliate.id, { sales: updatedSales });
  };

  const filteredPayouts = useMemo(() => {
    return payouts.filter(p => {
      if (filter === 'all') return true;
      if (filter === 'eligible') return p.status === 'Eligible for Payout';
      if (filter === 'pending') return p.status === 'Pending Payout';
      if (filter === 'paid') return p.status === 'Paid';
      return false;
    });
  }, [payouts, filter]);

  return (
    <div className="p-6 bg-background">
        <h3 className="text-lg font-semibold mb-4">Payout Overview</h3>
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
                            <TableHead>Sale Date</TableHead>
                            <TableHead>Sale ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Sale Amount</TableHead>
                            <TableHead>Eligible Payout Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPayouts.length > 0 ? filteredPayouts.map((payout) => (
                            <TableRow key={payout.saleId}>
                                <TableCell>{format(payout.saleDate, 'MMM dd, yyyy')}</TableCell>
                                <TableCell>{payout.saleId}</TableCell>
                                <TableCell>{payout.customerName}</TableCell>
                                <TableCell>
                                  {payout.productName}
                                  {(payout.productSize || payout.productColor) && 
                                    <div className="text-xs text-muted-foreground">
                                        {[payout.productSize, payout.productColor].filter(Boolean).join(', ')}
                                    </div>
                                  }
                                </TableCell>
                                <TableCell>${payout.saleAmount.toFixed(2)}</TableCell>
                                <TableCell>{format(payout.eligibleDate, 'MMM dd, yyyy')}</TableCell>
                                <TableCell>
                                    <PayoutStatusEditor payout={payout} onStatusChange={handleStatusChange} />
                                </TableCell>
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
    const isDisabled = affiliate.status === 'Disabled';
    const [payoutMethod, setPayoutMethod] = useState<'usd' | 'eur'>(affiliate.payoutDetails?.payoutMethod || 'usd');

    const [formData, setFormData] = useState({
        firstName: affiliate.firstName,
        lastName: affiliate.lastName,
        username: affiliate.username,
        email: affiliate.email,
        // USD fields
        usd_accountHolder: affiliate.payoutDetails?.usd?.accountHolder ?? '',
        usd_bankName: affiliate.payoutDetails?.usd?.bankName ?? '',
        usd_accountNumber: affiliate.payoutDetails?.usd?.accountNumber ?? '',
        usd_routingNumber: affiliate.payoutDetails?.usd?.routingNumber ?? '',
        // EUR fields
        eur_accountHolder: affiliate.payoutDetails?.eur?.accountHolder ?? '',
        eur_iban: affiliate.payoutDetails?.eur?.iban ?? '',
        eur_bic: affiliate.payoutDetails?.eur?.bic ?? '',
    });
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSaveDetails = () => {
        const { firstName, lastName, username, email } = formData;
        onUpdate(affiliate.id, { firstName, lastName, username, email });
    };

    const handleSavePayoutDetails = () => {
        const payoutDetails: PayoutDetails = { payoutMethod };
        if (payoutMethod === 'usd') {
            payoutDetails.usd = {
                accountHolder: formData.usd_accountHolder,
                bankName: formData.usd_bankName,
                accountNumber: formData.usd_accountNumber,
                routingNumber: formData.usd_routingNumber,
            };
        } else { // 'eur'
            payoutDetails.eur = {
                accountHolder: formData.eur_accountHolder,
                iban: formData.eur_iban,
                bic: formData.eur_bic,
            }
        }
        onUpdate(affiliate.id, { payoutDetails });
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
                                <Input id="firstName" value={formData.firstName} onChange={handleInputChange} disabled={isDisabled} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" value={formData.lastName} onChange={handleInputChange} disabled={isDisabled} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" value={formData.username} onChange={handleInputChange} disabled={isDisabled} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} disabled={isDisabled} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSaveDetails} disabled={isDisabled}>Save Details</Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" placeholder="••••••••" disabled={isDisabled}/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" placeholder="••••••••" disabled={isDisabled}/>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button disabled={isDisabled}>Update Password</Button>
                    </CardFooter>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Payout Information</CardTitle>
                        <CardDescription>Banking details for sending payouts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <RadioGroup defaultValue={payoutMethod} onValueChange={(value: 'usd' | 'eur') => setPayoutMethod(value)} className="grid grid-cols-2 gap-4" disabled={isDisabled}>
                            <div>
                                <RadioGroupItem value="usd" id="usd" className="peer sr-only" />
                                <Label
                                    htmlFor="usd"
                                    className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary ${isDisabled ? 'cursor-not-allowed opacity-70' : ''}`}
                                >
                                    USD (US Bank)
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="eur" id="eur" className="peer sr-only" />
                                <Label
                                    htmlFor="eur"
                                    className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary ${isDisabled ? 'cursor-not-allowed opacity-70' : ''}`}
                                >
                                    EUR (International)
                                </Label>
                            </div>
                        </RadioGroup>

                        {payoutMethod === 'usd' && (
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="usd_accountHolder">Account Holder Name</Label>
                                    <Input id="usd_accountHolder" value={formData.usd_accountHolder} onChange={handleInputChange} placeholder="Jane Doe" disabled={isDisabled} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="usd_bankName">Bank Name</Label>
                                    <Input id="usd_bankName" value={formData.usd_bankName} onChange={handleInputChange} placeholder="Global Bank" disabled={isDisabled} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="usd_accountNumber">Account Number</Label>
                                    <Input id="usd_accountNumber" value={formData.usd_accountNumber} onChange={handleInputChange} placeholder="**** **** **** 1234" disabled={isDisabled} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="usd_routingNumber">Routing Number</Label>
                                    <Input id="usd_routingNumber" value={formData.usd_routingNumber} onChange={handleInputChange} placeholder="123456789" disabled={isDisabled} />
                                </div>
                            </div>
                        )}

                        {payoutMethod === 'eur' && (
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="eur_accountHolder">Account Holder Name</Label>
                                    <Input id="eur_accountHolder" value={formData.eur_accountHolder} onChange={handleInputChange} placeholder="Jane Doe" disabled={isDisabled} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="eur_iban">IBAN</Label>
                                    <Input id="eur_iban" value={formData.eur_iban} onChange={handleInputChange} placeholder="DE89370400440532013000" disabled={isDisabled} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="eur_bic">BIC / SWIFT</Label>
                                    <Input id="eur_bic" value={formData.eur_bic} onChange={handleInputChange} placeholder="COBADEFFXXX" disabled={isDisabled} />
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSavePayoutDetails} disabled={isDisabled}>Save Payout Info</Button>
                    </CardFooter>
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
        productSize: payout.productSize,
        productColor: payout.productColor,
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
            productSize: saleToRefund.productSize,
            productColor: saleToRefund.productColor,
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
                <TableHead>Date</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{format(new Date(tx.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{tx.id}</TableCell>
                  <TableCell>{tx.customerName}</TableCell>
                  <TableCell>
                    {tx.productName}
                    {(tx.productSize || tx.productColor) && 
                      <div className="text-xs text-muted-foreground">
                          {[tx.productSize, tx.productColor].filter(Boolean).join(', ')}
                      </div>
                    }
                  </TableCell>
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

const PromotionsView = ({ affiliate, onUpdate }: { affiliate: Affiliate, onUpdate: (id: string, data: Partial<Affiliate>) => void }) => {
    const products = mockProducts; 
    const isDisabled = affiliate.status === 'Disabled';

    const handleProductToggle = (productId: string) => {
        const currentPromotableIds = affiliate.promotableProductIds || [];
        const isPromotable = currentPromotableIds.includes(productId);
        let updatedIds;
        if (isPromotable) {
            updatedIds = currentPromotableIds.filter(id => id !== productId);
        } else {
            updatedIds = [...currentPromotableIds, productId];
        }
        onUpdate(affiliate.id, { promotableProductIds: updatedIds });
    }

    return (
        <div className="p-6 bg-background">
            <Card>
                <CardHeader>
                    <CardTitle>Promotable Products</CardTitle>
                    <CardDescription>Select which products this affiliate is allowed to promote and generate links for.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {products.map((product: Product) => (
                            <div key={product.id} className="flex items-center justify-between p-3 rounded-md border">
                                <div className="flex items-center gap-4">
                                     <Image
                                        alt={product.name}
                                        className="aspect-square rounded-md object-cover"
                                        height="40"
                                        src={product.image[0]}
                                        width="40"
                                        data-ai-hint="product image"
                                    />
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {[
                                                product.sizes && product.sizes.length > 0 && `Sizes: ${product.sizes.join(', ')}`,
                                                product.colors && product.colors.length > 0 && `Colors: ${product.colors.join(', ')}`
                                            ].filter(Boolean).join(' | ')}
                                        </div>
                                    </div>
                                </div>
                                <Checkbox
                                    id={`product-${product.id}`}
                                    checked={(affiliate.promotableProductIds || []).includes(product.id)}
                                    onCheckedChange={() => handleProductToggle(product.id)}
                                    disabled={isDisabled}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
                 <CardFooter>
                    <p className="text-xs text-muted-foreground">Changes are saved automatically.</p>
                 </CardFooter>
            </Card>
        </div>
    );
};

const DocumentStatusBadge = ({ status }: { status: AffiliateDocument['status'] }) => {
  const styles: Record<AffiliateDocument['status'], string> = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
  };
  return <Badge className={`border-none text-xs font-normal ${styles[status]}`}>{status}</Badge>;
};

const DocumentsView = ({ affiliate, onUpdate }: { affiliate: Affiliate, onUpdate: (id: string, data: Partial<Affiliate>) => void }) => {
    const [documents, setDocuments] = useState<AffiliateDocument[]>(affiliate.documents);
    const isDisabled = affiliate.status === 'Disabled';

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                id: `doc-${Date.now()}-${Math.random()}`,
                name: file.name,
                url: '#', // Placeholder URL
                uploadedAt: new Date().toISOString(),
                uploadedBy: 'admin' as const,
                status: 'Approved' as const,
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

    const handleDocumentStatusChange = (docId: string, newStatus: AffiliateDocument['status']) => {
        const updatedDocuments = documents.map(doc => doc.id === docId ? {...doc, status: newStatus} : doc);
        setDocuments(updatedDocuments);
        onUpdate(affiliate.id, { documents: updatedDocuments });
    };

    return (
        <div className="p-6 bg-background">
            <Card>
                <CardHeader>
                    <CardTitle>Affiliate Documents</CardTitle>
                    <CardDescription>Upload or manage documents. Documents you upload are sent to the affiliate.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {documents.length > 0 ? (
                            <ul className="space-y-2">
                                {documents.map(doc => (
                                    <li key={doc.id} className="flex items-center justify-between text-sm p-3 rounded-md border">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            <div className="flex-grow overflow-hidden">
                                                <p className="font-medium truncate" title={doc.name}>{doc.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Uploaded by {doc.uploadedBy === 'admin' ? 'You' : 'Affiliate'} on {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DocumentStatusBadge status={doc.status} />
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {doc.uploadedBy === 'affiliate' && !isDisabled && (
                                                        <>
                                                          <DropdownMenuSub>
                                                              <DropdownMenuSubTrigger>
                                                                  <Pencil className="mr-2 h-4 w-4" />
                                                                  <span>Change Status</span>
                                                              </DropdownMenuSubTrigger>
                                                              <DropdownMenuPortal>
                                                                  <DropdownMenuSubContent>
                                                                      <DropdownMenuItem onClick={() => handleDocumentStatusChange(doc.id, 'Approved')}>
                                                                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-600"/>
                                                                          <span>Approved</span>
                                                                      </DropdownMenuItem>
                                                                      <DropdownMenuItem onClick={() => handleDocumentStatusChange(doc.id, 'Pending')}>
                                                                          <Info className="mr-2 h-4 w-4 text-yellow-600"/>
                                                                          <span>Pending</span>
                                                                      </DropdownMenuItem>
                                                                      <DropdownMenuItem onClick={() => handleDocumentStatusChange(doc.id, 'Rejected')}>
                                                                          <XCircle className="mr-2 h-4 w-4 text-red-600"/>
                                                                          <span>Rejected</span>
                                                                      </DropdownMenuItem>
                                                                  </DropdownMenuSubContent>
                                                              </DropdownMenuPortal>
                                                          </DropdownMenuSub>
                                                          <DropdownMenuSeparator />
                                                        </>
                                                    )}
                                                    <DropdownMenuItem>
                                                        <Download className="mr-2 h-4 w-4"/>
                                                        <span>Download</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleRemoveDocument(doc.id)}
                                                        disabled={isDisabled}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4"/>
                                                        <span>Delete</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
                        <Label htmlFor="file-upload" className={`font-semibold ${isDisabled ? 'cursor-not-allowed text-muted-foreground' : 'text-primary cursor-pointer'}`}>
                            Upload Documents
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">Select one or more files to upload.</p>
                        <Input id="file-upload" type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={isDisabled}/>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};


const AffiliateDetails = ({ affiliate, onUpdate }: { affiliate: Affiliate; onUpdate: (id: string, data: Partial<Affiliate>) => void }) => {
    return (
        <Tabs defaultValue="account" className="w-full">
            <TabsList className="px-6 border-b w-full justify-start rounded-none bg-background">
                <TabsTrigger value="account">Account Overview</TabsTrigger>
                <TabsTrigger value="promotions">Promotions</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="payouts">Payout Overview</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="m-0">
                <AccountView affiliate={affiliate} onUpdate={onUpdate} />
            </TabsContent>
            <TabsContent value="promotions" className="m-0">
                <PromotionsView affiliate={affiliate} onUpdate={onUpdate} />
            </TabsContent>
            <TabsContent value="transactions" className="m-0">
                <TransactionsView affiliate={affiliate} />
            </TabsContent>
            <TabsContent value="payouts" className="m-0">
                <PayoutsView affiliate={affiliate} onUpdate={onUpdate} />
            </TabsContent>
            <TabsContent value="documents" className="m-0">
                <DocumentsView affiliate={affiliate} onUpdate={onUpdate} />
            </TabsContent>
        </Tabs>
    );
};


// --- Main Page Component ---

export default function AffiliateDetailPage() {
    const params = useParams();
    const { toast } = useToast();
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    
    useEffect(() => {
        try {
            const storedAffiliates = localStorage.getItem('affiliatesData');
            if (storedAffiliates) {
                setAffiliates(JSON.parse(storedAffiliates));
            } else {
                setAffiliates(mockAffiliates);
                localStorage.setItem('affiliatesData', JSON.stringify(mockAffiliates));
            }
        } catch (error) {
            console.error("Failed to parse affiliates from localStorage", error);
            setAffiliates(mockAffiliates);
        }
    }, []);
    
    const affiliate = useMemo(() => affiliates.find((c) => c.id === params.id), [affiliates, params.id]);

    const handleAffiliateUpdate = (affiliateId: string, data: Partial<Affiliate>) => {
        const updatedAffiliates = affiliates.map(aff =>
            aff.id === affiliateId ? { ...aff, ...data } : aff
        );
        setAffiliates(updatedAffiliates);
        localStorage.setItem('affiliatesData', JSON.stringify(updatedAffiliates));

        toast({
            title: "Affiliate Updated",
            description: "The affiliate's details have been saved.",
        });
    };

    if (affiliates.length > 0 && !affiliate) {
        notFound();
    }
    
    if (!affiliate) {
        return <div>Loading...</div>; // Or a skeleton loader
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Link href="/affiliates" passHref>
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                     <h1 className="text-2xl font-bold">{affiliate.firstName} {affiliate.lastName}</h1>
                     <p className="text-sm text-muted-foreground">@{affiliate.username}</p>
                </div>
            </div>
            <Card>
                <AffiliateDetails affiliate={affiliate} onUpdate={handleAffiliateUpdate} />
            </Card>
        </div>
    );
}

    
