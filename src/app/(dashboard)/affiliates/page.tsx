
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Download,
  File,
} from "lucide-react";

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
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { mockAffiliates } from "@/lib/mock-data";
import type { Affiliate } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const AffiliateStatusBadge = ({ status }: { status: Affiliate['status'] }) => {
  const styles: Record<Affiliate['status'], string> = {
    'Active': 'bg-green-100 text-green-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Disabled': 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200',
  };
  return <Badge className={`border-none ${styles[status]}`}>{status}</Badge>;
};

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const { toast } = useToast();
  const [newAffiliateData, setNewAffiliateData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    commissionRate: 10,
  });

  useEffect(() => {
    try {
      const storedAffiliates = localStorage.getItem("affiliatesData");
      if (storedAffiliates) {
        setAffiliates(JSON.parse(storedAffiliates));
      } else {
        setAffiliates(mockAffiliates);
        localStorage.setItem("affiliatesData", JSON.stringify(mockAffiliates));
      }
    } catch (error) {
      console.error("Failed to parse affiliates from localStorage", error);
      setAffiliates(mockAffiliates);
    }
  }, []);

  const saveAffiliates = (updater: (affs: Affiliate[]) => Affiliate[]) => {
    setAffiliates((prev) => {
      const updated = updater(prev);
      localStorage.setItem("affiliatesData", JSON.stringify(updated));
      return updated;
    });
  };

  const handleNewAffiliateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewAffiliateData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddAffiliate = () => {
    if (
      !newAffiliateData.username ||
      !newAffiliateData.email ||
      !newAffiliateData.firstName ||
      !newAffiliateData.lastName
    ) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all required fields.",
      });
      return;
    }
    const newAffiliate: Affiliate = {
      id: `aff-${Date.now()}`,
      username: newAffiliateData.username,
      firstName: newAffiliateData.firstName,
      lastName: newAffiliateData.lastName,
      email: newAffiliateData.email,
      commissionRate: Number(newAffiliateData.commissionRate),
      totalSales: 0,
      totalClicks: 0,
      balance: 0,
      status: "Pending",
      sales: [],
      documents: [],
      payoutDetails: {},
      promotableProductIds: [],
    };
    saveAffiliates((prev) => [newAffiliate, ...prev]);
    setIsAddSheetOpen(false);
    setNewAffiliateData({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      commissionRate: 10,
    });
    toast({
        title: "Affiliate Added",
        description: `${newAffiliate.firstName} ${newAffiliate.lastName} has been added as an affiliate.`
    })
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Affiliates</CardTitle>
              <CardDescription>
                Manage your affiliate partners and their performance.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-8 gap-1"
                onClick={() => setIsAddSheetOpen(true)}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Affiliate
                </span>
              </Button>
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Export
                </span>
              </Button>
            </div>
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
                <TableHead>Total Clicks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates.map((affiliate) => (
                  <TableRow key={affiliate.id}>
                    <TableCell>
                      <Link
                        href={`/affiliates/${affiliate.id}`}
                        className="font-medium hover:underline"
                      >
                        {affiliate.username}
                      </Link>
                    </TableCell>
                    <TableCell>
                      ${affiliate.totalSales.toLocaleString()}
                    </TableCell>
                    <TableCell>{affiliate.commissionRate}%</TableCell>
                    <TableCell>${affiliate.balance.toFixed(2)}</TableCell>
                    <TableCell>
                      <AffiliateStatusBadge status={affiliate.status} />
                    </TableCell>
                    <TableCell>{affiliate.sales.length}</TableCell>
                    <TableCell>
                      {affiliate.totalClicks?.toLocaleString() || 0}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{affiliates.length}</strong> of{" "}
            <strong>{affiliates.length}</strong> affiliates
          </div>
        </CardFooter>
      </Card>
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Add New Affiliate</SheetTitle>
            <SheetDescription>
              Fill in the details below to manually add a new affiliate.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Jane"
                  value={newAffiliateData.firstName}
                  onChange={handleNewAffiliateChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={newAffiliateData.lastName}
                  onChange={handleNewAffiliateChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="jane.doe"
                value={newAffiliateData.username}
                onChange={handleNewAffiliateChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane.d@example.com"
                value={newAffiliateData.email}
                onChange={handleNewAffiliateChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={newAffiliateData.password}
                onChange={handleNewAffiliateChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                value={newAffiliateData.commissionRate}
                onChange={handleNewAffiliateChange}
              />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button onClick={handleAddAffiliate}>Save Affiliate</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
