
"use client";

import React, { useState, useMemo } from "react";
import {
  MoreHorizontal,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { mockOrders } from "@/lib/mock-data";
import type { Order } from "@/lib/types";

function OrderStatusBadge({ status }: { status: Order["status"] }) {
    const variantMapping: Record<Order['status'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
        Pending: 'secondary',
        Completed: 'default',
        Shipped: 'outline',
        Refunded: 'destructive',
        Cancelled: 'destructive'
    };
  return <Badge variant={variantMapping[status]}>{status}</Badge>;
}


export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(prevOrders => prevOrders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };
  
  const filteredOrders = useMemo(() => {
    if (!searchTerm) {
      return orders;
    }
    const lowercasedTerm = searchTerm.toLowerCase();

    return orders.filter(order => 
      order.id.toLowerCase().includes(lowercasedTerm) ||
      (order.affiliateUsername && order.affiliateUsername.toLowerCase().includes(lowercasedTerm)) ||
      order.customerName.toLowerCase().includes(lowercasedTerm) ||
      (order.customerPhone && order.customerPhone.includes(lowercasedTerm)) ||
      order.customerAddress.toLowerCase().includes(lowercasedTerm) ||
      order.products.some(p => p.name.toLowerCase().includes(lowercasedTerm)) ||
      order.amount.toString().includes(lowercasedTerm) ||
      order.status.toLowerCase().includes(lowercasedTerm)
    );
  }, [orders, searchTerm]);
  
  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
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
      </div>
      <TabsContent value="all">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Transactions</CardTitle>
            <CardDescription>
              A list of all recent transactions from your store.
            </CardDescription>
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
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{order.id.toUpperCase()}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell className="hidden md:table-cell">{order.affiliateUsername || ""}</TableCell>
                    <TableCell className="hidden lg:table-cell">{order.customerPhone || 'N/A'}</TableCell>
                    <TableCell className="hidden lg:table-cell">{order.customerAddress}</TableCell>
                    <TableCell className="hidden xl:table-cell max-w-[300px] truncate" title={order.products.map(p => {
                          const details = [p.size, p.color].filter(Boolean).join(', ');
                          return `${p.quantity}x ${p.name}${details ? ` (${details})` : ''}`;
                      }).join('; ')}>
                        {order.products.map(p => {
                            const details = [p.size, p.color].filter(Boolean).join(', ');
                            return `${p.quantity}x ${p.name}${details ? ` (${details})` : ''}`;
                        }).join('; ')}
                    </TableCell>
                    <TableCell>${order.amount.toFixed(2)}</TableCell>
                    <TableCell>
                       <Select onValueChange={(value) => handleStatusChange(order.id, value as Order['status'])} defaultValue={order.status}>
                            <SelectTrigger className="w-[120px] h-8">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Shipped">Shipped</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Refunded">Refunded</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Customer History</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
           <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing <strong>1-{filteredOrders.length}</strong> of <strong>{filteredOrders.length}</strong> transactions
              </div>
            </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
