
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  File,
  Search
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import { mockOrders, mockCustomers, mockAffiliates } from "@/lib/mock-data";
import type { Order, Affiliate } from "@/lib/types";


const TransactionsView = ({ orders, searchTerm, setSearchTerm }: { orders: Order[], searchTerm: string, setSearchTerm: (term: string) => void }) => {
    const customerIdMap = useMemo(() => {
        const map = new Map<string, string>();
        mockCustomers.forEach(customer => {
            map.set(customer.email, customer.id);
        });
        return map;
    }, []);

    const affiliateMap = useMemo(() => {
        const map = new Map<string, Affiliate>();
        mockAffiliates.forEach(affiliate => {
            map.set(affiliate.username, affiliate);
        });
        return map;
    }, []);

    return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
            <CardTitle className="font-headline">Transactions</CardTitle>
            <CardDescription>
              A list of all recent transactions from your store.
            </CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="h-8 w-[150px] pl-8 lg:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Affiliate</TableHead>
              <TableHead className="hidden lg:table-cell">Phone Number</TableHead>
              <TableHead className="hidden lg:table-cell">Address</TableHead>
              <TableHead className="hidden xl:table-cell">Products</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Platform Commission</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const customerId = customerIdMap.get(order.customerEmail);
              const affiliate = order.affiliateUsername ? affiliateMap.get(order.affiliateUsername) : null;
              
              const orderAmountInDollars = order.amount;
              let platformCommission = order.amount;

              if (affiliate) {
                  const commissionAmount = order.amount * (affiliate.commissionRate / 100);
                  platformCommission -= commissionAmount;
              }

              return (
                <TableRow key={order.id}>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{order.id.toUpperCase()}</TableCell>
                  <TableCell>
                    {customerId ? (
                        <Link href={`/customers/${customerId}`} className="hover:underline">
                            {order.customerName}
                        </Link>
                    ) : (
                        order.customerName
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{order.affiliateUsername || ""}</TableCell>
                  <TableCell className="hidden lg:table-cell">{order.customerPhone || 'N/A'}</TableCell>
                  <TableCell className="hidden lg:table-cell">{order.customerAddress}</TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {order.products.map((p, index) => {
                        const details = [`Qty: ${p.quantity}`, p.size, p.color].filter(Boolean).join(' | ');
                        return (
                            <div key={index} className={index > 0 ? "mt-2" : ""}>
                                <div className="font-medium">{p.name}</div>
                                <div className="text-xs text-muted-foreground">{details}</div>
                            </div>
                        )
                    })}
                  </TableCell>
                  <TableCell>${orderAmountInDollars.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${(platformCommission).toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
       <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{orders.length}</strong> of <strong>{orders.length}</strong> transactions
          </div>
        </CardFooter>
    </Card>
    );
};

const StatusBadge = ({ status }: { status: Order["status"] }) => {
    const variantMap: Record<Order["status"], "default" | "secondary" | "destructive" | "outline"> = {
        Completed: "default",
        Shipped: "secondary",
        Pending: "outline",
        Refunded: "destructive",
        Cancelled: "destructive",
        Rejected: "destructive",
    };

    const colorMap: Record<Order["status"], string> = {
        Completed: "bg-green-100 text-green-800",
        Shipped: "bg-blue-100 text-blue-800",
        Pending: "bg-yellow-100 text-yellow-800",
        Refunded: "bg-orange-100 text-orange-800",
        Cancelled: "bg-zinc-200 text-zinc-800",
        Rejected: "bg-red-100 text-red-800",
    };

    return <Badge variant={variantMap[status]} className={`border-none ${colorMap[status]}`}>{status}</Badge>;
};


const DeliveriesView = ({ orders, onStatusChange, searchTerm, setSearchTerm }: { orders: Order[]; onStatusChange: (orderId: string, newStatus: Order['status']) => void; searchTerm: string, setSearchTerm: (term: string) => void }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Manage Deliveries</CardTitle>
                    <CardDescription>Update the status of customer orders.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search orders..."
                        className="h-8 w-[150px] pl-8 lg:w-[250px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                      <File className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Export
                      </span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead className="hidden sm:table-cell">Products</TableHead>
                            <TableHead className="hidden md:table-cell">Affiliate</TableHead>
                            <TableHead className="hidden lg:table-cell">Phone Number</TableHead>
                            <TableHead className="hidden lg:table-cell">Address</TableHead>
                            <TableHead>Current Status</TableHead>
                            <TableHead className="w-[180px]">Update Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                <TableCell className="font-medium">{order.id.toUpperCase()}</TableCell>
                                <TableCell>{order.customerName}</TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    {order.products.map((p, index) => {
                                        const details = [`Qty: ${p.quantity}`, p.size, p.color].filter(Boolean).join(' | ');
                                        return (
                                            <div key={index} className={index > 0 ? "mt-2" : ""}>
                                                <div className="font-medium">{p.name}</div>
                                                <div className="text-xs text-muted-foreground">{details}</div>
                                            </div>
                                        )
                                    })}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{order.affiliateUsername || 'N/A'}</TableCell>
                                <TableCell className="hidden lg:table-cell">{order.customerPhone || 'N/A'}</TableCell>
                                <TableCell className="hidden lg:table-cell">{order.customerAddress}</TableCell>
                                <TableCell><StatusBadge status={order.status} /></TableCell>
                                <TableCell>
                                    <Select
                                        value={order.status}
                                        onValueChange={(newStatus) => onStatusChange(order.id, newStatus as Order['status'])}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Set status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Shipped">Shipped</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                            <SelectItem value="Refunded">Refunded</SelectItem>
                                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            <SelectItem value="Rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                <div className="text-xs text-muted-foreground">
                    Showing <strong>{orders.length}</strong> of <strong>{orders.length}</strong> deliveries.
                </div>
            </CardFooter>
        </Card>
    );
};


export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        try {
            const storedOrders = localStorage.getItem('ordersData');
            if (storedOrders) {
                setOrders(JSON.parse(storedOrders));
            } else {
                setOrders(mockOrders);
                localStorage.setItem('ordersData', JSON.stringify(mockOrders));
            }
        } catch (error) {
            console.error("Failed to parse orders from localStorage", error);
            setOrders(mockOrders);
        }
    }, []);

    const saveOrders = (updater: (ords: Order[]) => Order[]) => {
        setOrders(prev => {
            const updated = updater(prev);
            localStorage.setItem('ordersData', JSON.stringify(updated));
            return updated;
        });
    };

    const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
        saveOrders(prevOrders => 
            prevOrders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );
        toast({
            title: "Order Status Updated",
            description: `Order #${orderId.toUpperCase()} has been set to "${newStatus}".`,
        });
    };
  
  const filteredOrders = useMemo(() => {
    let results = orders;

    if (!searchTerm) {
      return results;
    }
    const lowercasedTerm = searchTerm.toLowerCase();

    return results.filter(order => 
      order.id.toLowerCase().includes(lowercasedTerm) ||
      (order.affiliateUsername && order.affiliateUsername.toLowerCase().includes(lowercasedTerm)) ||
      order.customerName.toLowerCase().includes(lowercasedTerm) ||
      (order.customerPhone && order.customerPhone.includes(lowercasedTerm)) ||
      order.customerAddress.toLowerCase().includes(lowercasedTerm) ||
      order.products.some(p => p.name.toLowerCase().includes(lowercasedTerm)) ||
      (order.amount).toFixed(2).includes(lowercasedTerm) ||
      order.status.toLowerCase().includes(lowercasedTerm)
    );
  }, [orders, searchTerm]);

  return (
    <Tabs defaultValue="transactions">
      <div className="flex items-center">
        <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="transactions">
        <TransactionsView orders={filteredOrders} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </TabsContent>
      <TabsContent value="deliveries">
        <DeliveriesView orders={filteredOrders} onStatusChange={handleStatusChange} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </TabsContent>
    </Tabs>
  );
}
