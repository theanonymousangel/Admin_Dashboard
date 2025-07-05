
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { mockAffiliates } from "@/lib/mock-data";
import type { Affiliate, AffiliateSale, Payout, AffiliateDocument } from "@/lib/types";

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

const AccountView = ({ affiliate, onUpdate }: { affiliate: Affiliate, onUpdate: (id: string, data: Partial<Affiliate>) => void }) => {
    const [formData, setFormData] = useState({
        firstName: affiliate.firstName,
        lastName: affiliate.lastName,
        username: affiliate.username,
        email: affiliate.email,
    });
    const [documents, setDocuments] = useState<AffiliateDocument[]>(affiliate.documents);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSaveDetails = () => {
        onUpdate(affiliate.id, formData);
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
                                <Input id="firstName" value={formData.firstName} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" value={formData.lastName} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" value={formData.username} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSaveDetails}>Save Details</Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" placeholder="••••••••" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" placeholder="••••••••" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button>Update Password</Button>
                    </CardFooter>
                </Card>
            </div>
            <div className="lg:col-span-1">
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
                                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10" onClick={() => handleRemoveDocument(doc.id)}>
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
                            <Label htmlFor="file-upload" className="font-semibold text-primary cursor-pointer">
                                Upload Documents
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">Select one or more files to upload.</p>
                            <Input id="file-upload" type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const AffiliateDetails = ({ affiliate, onUpdate }: { affiliate: Affiliate; onUpdate: (id: string, data: Partial<Affiliate>) => void }) => {
    return (
        <Tabs defaultValue="account" className="w-full">
            <TabsList className="px-6">
                <TabsTrigger value="account">Account Overview</TabsTrigger>
                <TabsTrigger value="payouts">Payout Overview</TabsTrigger>
            </TabsList>
            <Separator />
            <TabsContent value="account" className="m-0">
                <AccountView affiliate={affiliate} onUpdate={onUpdate} />
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
              <TableHead>Total Sales</TableHead>
              <TableHead>Commission Rate</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {affiliates.map((affiliate) => (
              <React.Fragment key={affiliate.id}>
                <TableRow 
                  className="cursor-pointer border-b data-[state=open]:bg-muted/50"
                  onClick={() => setOpenAffiliateId(openAffiliateId === affiliate.id ? null : affiliate.id)}
                  data-state={openAffiliateId === affiliate.id ? 'open' : 'closed'}
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
                {openAffiliateId === affiliate.id && (
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableCell colSpan={5} className="p-0">
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
