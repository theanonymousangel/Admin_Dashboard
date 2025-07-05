
"use client";

import React, { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { mockCustomers, mockOrders } from "@/lib/mock-data";
import type { Customer, Order } from "@/lib/types";

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

const CustomerDetails = ({ customer, orders }: { customer: Customer, orders: Order[] }) => {
  const customerOrders = useMemo(() => {
    return orders.filter(order => order.customerEmail === customer.email)
                 .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [customer.email, orders]);

  return (
    <div className="p-6 bg-muted/50">
      <h3 className="text-lg font-semibold mb-4">Transaction History for {customer.name}</h3>
      {customerOrders.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Contact & Shipping</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{order.id.toUpperCase()}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {order.products.map(p => `${p.quantity}x ${p.name} (${p.size})`).join(', ')}
                    </TableCell>
                    <TableCell>${order.amount.toFixed(2)}</TableCell>
                    <TableCell><OrderStatusBadge status={order.status}/></TableCell>
                    <TableCell>{order.affiliateUsername || ""}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div>{order.customerPhone}</div>
                      <div>{order.customerAddress}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          This customer has no transaction history.
        </div>
      )}
    </div>
  );
};


export default function CustomersPage() {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [orders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [openCustomerId, setOpenCustomerId] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) {
      return customers;
    }
    const lowercasedTerm = searchTerm.toLowerCase();

    return customers.filter(customer => 
      customer.name.toLowerCase().includes(lowercasedTerm) ||
      customer.email.toLowerCase().includes(lowercasedTerm)
    );
  }, [customers, searchTerm]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="font-headline">Customers</CardTitle>
                <CardDescription>
                View and manage your customer base.
                </CardDescription>
            </div>
             <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search customers..."
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
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Total Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Purchase</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <React.Fragment key={customer.id}>
                <TableRow 
                  className="cursor-pointer"
                  onClick={() => setOpenCustomerId(openCustomerId === customer.id ? null : customer.id)}
                >
                  <TableCell>
                    <div className="font-medium">{customer.name}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {customer.email}
                    </div>
                  </TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                  <TableCell>{new Date(customer.lastPurchaseDate).toLocaleDateString()}</TableCell>
                </TableRow>
                {openCustomerId === customer.id && (
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableCell colSpan={4} className="p-0">
                      <CustomerDetails customer={customer} orders={orders} />
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
            Showing <strong>1-{filteredCustomers.length}</strong> of <strong>{filteredCustomers.length}</strong> customers
          </div>
      </CardFooter>
    </Card>
  );
}
