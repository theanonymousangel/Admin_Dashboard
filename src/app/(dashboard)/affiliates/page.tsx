
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Download,
  File,
  Save,
  Info,
  Trash2,
  MoreHorizontal,
  UserX,
  UserCheck,
} from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { mockAffiliates } from "@/lib/mock-data";
import type { Affiliate } from "@/lib/types";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CommissionRateEditor = ({ affiliate, onUpdate }: { affiliate: Affiliate; onUpdate: (id: string, data: Partial<Affiliate>) => void; }) => {
    const [rate, setRate] = useState<string>(affiliate.commissionRate.toString());
    const isDisabled = affiliate.status === 'Disabled';

    useEffect(() => {
        setRate(affiliate.commissionRate.toString());
    }, [affiliate.commissionRate]);

    const handleSave = () => {
        onUpdate(affiliate.id, { commissionRate: Number(rate) });
    };

    return (
        <div className="flex items-center gap-2 w-[150px]">
            <Input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-16 h-8"
                disabled={isDisabled}
            />
            <span>%</span>
            {Number(rate) !== affiliate.commissionRate && !isDisabled && (
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleSave}>
                    <Save className="h-4 w-4" />
                    <span className="sr-only">Save</span>
                </Button>
            )}
        </div>
    );
};

const AffiliateStatusEditor = ({ affiliate, onUpdate }: { affiliate: Affiliate; onUpdate: (id: string, data: Partial<Affiliate>) => void; }) => {
    return (
        <Select
            value={affiliate.status}
            onValueChange={(newStatus) => onUpdate(affiliate.id, { status: newStatus as Affiliate['status'] })}
            disabled={affiliate.status === 'Disabled'}
        >
            <SelectTrigger className="w-[130px] h-8">
                <SelectValue placeholder="Set Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Disabled">Disabled</SelectItem>
            </SelectContent>
        </Select>
    );
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

  const handleAffiliateUpdate = (affiliateId: string, data: Partial<Affiliate>) => {
    saveAffiliates(prev => 
      prev.map(aff => 
        aff.id === affiliateId ? { ...aff, ...data } : aff
      )
    );
    toast({
        title: "Affiliate Updated",
        description: "The affiliate's details have been saved.",
    });
  };
  
  const handleDeleteAffiliate = (affiliateId: string) => {
    saveAffiliates(prev => prev.filter(aff => aff.id !== affiliateId));
    toast({
        title: "Affiliate Deleted",
        description: "The selected affiliate has been permanently removed.",
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
      productClicks: [],
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
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates.map((affiliate) => (
                  <TableRow
                    key={affiliate.id}
                    className={affiliate.status === 'Disabled' ? 'opacity-60' : ''}
                  >
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
                    <TableCell>
                      <CommissionRateEditor affiliate={affiliate} onUpdate={handleAffiliateUpdate} />
                    </TableCell>
                    <TableCell>${affiliate.balance.toFixed(2)}</TableCell>
                    <TableCell>
                      <AffiliateStatusEditor affiliate={affiliate} onUpdate={handleAffiliateUpdate} />
                    </TableCell>
                    <TableCell>{affiliate.sales.length}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{affiliate.totalClicks?.toLocaleString() || 0}</span>
                        {affiliate.productClicks && affiliate.productClicks.length > 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 cursor-default">
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" align="center">
                                <div className="p-1">
                                  <h4 className="text-sm font-semibold mb-2 text-center">Clicks by Product</h4>
                                  <ul className="space-y-1">
                                    {affiliate.productClicks.map((pc) => (
                                      <li key={pc.productId} className="flex justify-between items-center gap-4 text-xs">
                                        <span>{pc.productName}</span>
                                        <span className="font-bold">{pc.clicks.toLocaleString()}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                  onClick={() => handleAffiliateUpdate(affiliate.id, { status: affiliate.status === 'Disabled' ? 'Active' : 'Disabled' })}
                              >
                                  {affiliate.status === 'Disabled' ? (
                                      <>
                                          <UserCheck className="mr-2 h-4 w-4" />
                                          <span>Enable</span>
                                      </>
                                  ) : (
                                      <>
                                          <UserX className="mr-2 h-4 w-4" />
                                          <span>Disable</span>
                                      </>
                                  )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                          className="text-destructive focus:text-destructive"
                                          onSelect={(e) => e.preventDefault()}
                                      >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          <span>Delete</span>
                                      </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                      <AlertDialogHeader>
                                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                              This will permanently delete the affiliate {affiliate.firstName} {affiliate.lastName}. This action cannot be undone.
                                          </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                              className={buttonVariants({ variant: "destructive" })}
                                              onClick={() => handleDeleteAffiliate(affiliate.id)}
                                          >
                                              Delete
                                          </AlertDialogAction>
                                      </AlertDialogFooter>
                                  </AlertDialogContent>
                              </AlertDialog>
                          </DropdownMenuContent>
                      </DropdownMenu>
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
