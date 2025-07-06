
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  File,
  Search
} from "lucide-react";

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
import { mockOrders, mockCustomers, mockAffiliates } from "@/lib/mock-data";
import type { Order, Affiliate } from "@/lib/types";

const OrdersDisplay = ({ orders }: { orders: Order[] }) => {
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
              <TableHead className="text-right">Platform Commission</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const customerId = customerIdMap.get(order.customerEmail);
              const affiliate = order.affiliateUsername ? affiliateMap.get(order.affiliateUsername) : null;
              
              const orderAmountInDollars = order.amount / 100;
              let platformEarnings = orderAmountInDollars;

              if (affiliate) {
                  const commissionAmount = orderAmountInDollars * (affiliate.commissionRate / 100);
                  platformEarnings -= commissionAmount;
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
                  <TableCell className="hidden xl:table-cell max-w-[300px] truncate" title={order.products.map(p => {
                        const details = [p.size, p.color].filter(Boolean).join(', ');
                        return `${p.quantity}x ${p.name}${details ? ` (${details})` : ''}`;
                    }).join('; ')}>
                      {order.products.map(p => {
                          const details = [p.size, p.color].filter(Boolean).join(', ');
                          return `${p.quantity}x ${p.name}${details ? ` (${details})` : ''}`;
                      }).join('; ')}
                  </TableCell>
                  <TableCell>${orderAmountInDollars.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${platformEarnings.toFixed(2)}
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

export default function OrdersPage() {
  const [orders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const filteredOrders = useMemo(() => {
    let results = orders;

    if (activeTab !== 'all') {
      results = results.filter(order => order.status.toLowerCase() === activeTab);
    }

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
      (order.amount / 100).toFixed(2).includes(lowercasedTerm) ||
      order.status.toLowerCase().includes(lowercasedTerm)
    );
  }, [orders, searchTerm, activeTab]);
  
  const tableContent = <OrdersDisplay orders={filteredOrders} />;

  return (
    <Tabs defaultValue="all" onValueChange={setActiveTab}>
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
        {tableContent}
      </TabsContent>
      <TabsContent value="pending">
        {tableContent}
      </TabsContent>
      <TabsContent value="shipped">
        {tableContent}
      </TabsContent>
      <TabsContent value="completed">
        {tableContent}
      </TabsContent>
    </Tabs>
  );
}
