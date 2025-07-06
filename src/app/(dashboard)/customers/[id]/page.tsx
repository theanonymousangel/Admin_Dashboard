
"use client";

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { mockCustomers, mockOrders, mockAffiliates, mockProducts } from '@/lib/mock-data';
import type { Customer } from '@/lib/types';
import React from 'react';

type PurchaseHistoryItem = {
    productName: string;
    productDetails: string;
    orderDate: string;
    orderAmount: number;
    affiliateUsername: string | null;
};

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
    const customer = mockCustomers.find((c) => c.id === params.id);
    
    if (!customer) {
        notFound();
    }

    const customerOrders = mockOrders.filter(
        (order) => order.customerEmail === customer.email
    );

    const purchaseHistory: PurchaseHistoryItem[] = customerOrders.flatMap((order) => {
        const affiliate = mockAffiliates.find(
            (a) => a.username === order.affiliateUsername
        );

        return order.products.map((p) => {
            const productInfo = mockProducts.find((mp) => mp.name === p.name);
            const price = productInfo ? productInfo.price : 0;
            const itemTotal = price * p.quantity;
            
            return {
                productName: `${p.quantity > 1 ? `${p.quantity}x ` : ''}${p.name}`,
                productDetails: [p.size, p.color].filter(Boolean).join(', '),
                orderDate: format(new Date(order.date), 'yyyy-MM-dd'),
                orderAmount: itemTotal,
                affiliateUsername: affiliate ? affiliate.username : null,
            };
        });
    });
    
    purchaseHistory.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Link href="/customers">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">{customer.name}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Purchase History</CardTitle>
                    <CardDescription>
                        A list of all purchases made by {customer.name}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Order Date</TableHead>
                                <TableHead className="text-right">Order Amount</TableHead>
                                <TableHead className="text-right">Affiliate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchaseHistory.length > 0 ? (
                                purchaseHistory.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="font-medium">{item.productName}</div>
                                            {item.productDetails && <div className="text-sm text-muted-foreground">{item.productDetails}</div>}
                                        </TableCell>
                                        <TableCell>{item.orderDate}</TableCell>
                                        <TableCell className="text-right">
                                            ${item.orderAmount.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.affiliateUsername ? (
                                                <span className="font-medium">{item.affiliateUsername}</span>
                                            ) : (
                                                <span className="text-muted-foreground">N/A</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        This customer has no purchase history.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
