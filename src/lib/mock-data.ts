import type { Product, Order, Customer, Affiliate, Notification, AffiliateSale, AffiliateDocument } from './types';

export const mockProducts: Product[] = [
  { id: 'prod-001', name: 'Classic White Tee', price: 29.99, stock: 150, status: 'In Stock', image: 'https://placehold.co/80x80.png', category: 'T-Shirts', tags: ['classic', 'white', 'cotton'], description: 'A high-quality classic white t-shirt made from 100% premium cotton.' },
  { id: 'prod-002', name: 'Denim Jacket', price: 89.99, stock: 5, status: 'Low Stock', image: 'https://placehold.co/80x80.png', category: 'Jackets', tags: ['denim', 'blue', 'outerwear'], description: 'A timeless denim jacket for all seasons.' },
  { id: 'prod-003', name: 'Black Skinny Jeans', price: 79.99, stock: 75, status: 'In Stock', image: 'https://placehold.co/80x80.png', category: 'Pants', tags: ['jeans', 'black', 'skinny'], description: 'Comfortable and stylish black skinny jeans.' },
  { id: 'prod-004', name: 'Leather Boots', price: 129.99, stock: 0, status: 'Out of Stock', image: 'https://placehold.co/80x80.png', category: 'Shoes', tags: ['boots', 'leather', 'black'], description: 'Durable and fashionable leather boots.' },
  { id: 'prod-005', name: 'Beige Hoodie', price: 59.99, stock: 200, status: 'In Stock', image: 'https://placehold.co/80x80.png', category: 'Hoodies', tags: ['hoodie', 'beige', 'casual'], description: 'A cozy beige hoodie perfect for a relaxed look.' },
  { id: 'prod-006', name: 'Silk Scarf', price: 39.99, stock: 8, status: 'Low Stock', image: 'https://placehold.co/80x80.png', category: 'Accessories', tags: ['scarf', 'silk', 'patterned'], description: 'An elegant silk scarf with a unique pattern.' },
];

export const mockOrders: Order[] = [
  { id: 'ord-101', customerName: 'Jane Doe', customerEmail: 'jane.doe@example.com', customerPhone: '123-456-7890', customerAddress: '123 Oak St, Anytown, USA', products: [{ name: 'Classic White Tee', quantity: 2, size: 'M' }], amount: 59.98, status: 'Completed', date: '2023-10-26' },
  { id: 'ord-102', customerName: 'John Smith', customerEmail: 'john.smith@example.com', customerPhone: '234-567-8901', customerAddress: '456 Maple Ave, Somecity, USA', products: [{ name: 'Denim Jacket', quantity: 1, size: 'L' }, { name: 'Black Skinny Jeans', quantity: 1, size: 'L' }], amount: 169.98, status: 'Shipped', date: '2023-10-25' },
  { id: 'ord-103', customerName: 'Alice Johnson', customerEmail: 'alice.j@example.com', customerPhone: '345-678-9012', customerAddress: '789 Pine Rd, Otherville, USA', products: [{ name: 'Beige Hoodie', quantity: 1, size: 'S' }], amount: 59.99, status: 'Pending', date: '2023-10-27' },
  { id: 'ord-104', customerName: 'Bob Brown', customerEmail: 'bob.brown@example.com', customerPhone: '456-789-0123', customerAddress: '101 Birch Blvd, Anyplace, USA', products: [{ name: 'Leather Boots', quantity: 1, size: 'M' }], amount: 129.99, status: 'Cancelled', date: '2023-10-24' },
];

export const mockCustomers: Customer[] = [
  { id: 'cust-01', name: 'Jane Doe', email: 'jane.doe@example.com', totalOrders: 5, totalSpent: 450.50, lastPurchaseDate: '2023-10-26', avatar: 'https://placehold.co/40x40.png' },
  { id: 'cust-02', name: 'John Smith', email: 'john.smith@example.com', totalOrders: 3, totalSpent: 320.00, lastPurchaseDate: '2023-10-25', avatar: 'https://placehold.co/40x40.png' },
  { id: 'cust-03', name: 'Alice Johnson', email: 'alice.j@example.com', totalOrders: 8, totalSpent: 1200.75, lastPurchaseDate: '2023-10-27', avatar: 'https://placehold.co/40x40.png' },
  { id: 'cust-04', name: 'Bob Brown', email: 'bob.brown@example.com', totalOrders: 2, totalSpent: 180.25, lastPurchaseDate: '2023-09-15', avatar: 'https://placehold.co/40x40.png' },
];

const today = new Date();
const lastMonth = new Date();
lastMonth.setMonth(lastMonth.getMonth() - 1);

const salesForAffiliate1: AffiliateSale[] = [
    { id: 'sale-01', productName: 'Denim Jacket', amount: 150.00, date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString(), customerName: 'Liam Johnson' },
    { id: 'sale-02', productName: 'Classic White Tee', amount: 75.50, date: new Date(today.getFullYear(), today.getMonth(), 6).toISOString(), customerName: 'Olivia Smith' },
    { id: 'sale-03', productName: 'Beige Hoodie', amount: 220.00, date: new Date(today.getFullYear(), today.getMonth(), 25).toISOString(), customerName: 'Noah Williams' },
    { id: 'sale-07', productName: 'Black Skinny Jeans', amount: 350.00, date: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 10).toISOString(), customerName: 'Emma Brown' },
];
const salesForAffiliate2: AffiliateSale[] = [
    { id: 'sale-04', productName: 'Silk Scarf', amount: 99.99, date: new Date(today.getFullYear(), today.getMonth(), 2).toISOString(), customerName: 'Ava Jones' },
    { id: 'sale-05', productName: 'Classic White Tee', amount: 125.00, date: new Date(today.getFullYear(), today.getMonth(), 20).toISOString(), customerName: 'James Garcia' },
    { id: 'sale-06', productName: 'Leather Boots', amount: 50.25, date: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 25).toISOString(), customerName: 'Sophia Miller' },
];
const salesForAffiliate3: AffiliateSale[] = [];
const salesForAffiliate4: AffiliateSale[] = [];

export const mockAffiliates: Affiliate[] = [
  { id: 'aff-01', username: 'fashion_blog', firstName: 'Jane', lastName: 'Doe', email: 'contact@fashionistablog.com', totalSales: 12500, commissionRate: 10, balance: 1250, status: 'Active', sales: salesForAffiliate1, documents: [
      { id: 'doc-1', name: 'Affiliate Agreement.pdf', url: '#', uploadedAt: '2024-07-01' },
      { id: 'doc-2', name: 'Tax Form W9.pdf', url: '#', uploadedAt: '2024-07-01' },
  ], payoutDetails: { paypalEmail: 'contact@fashionistablog.com' } },
  { id: 'aff-02', username: 'style_influencer', firstName: 'John', lastName: 'Smith', email: 'style@influencer.com', totalSales: 8200, commissionRate: 12, balance: 984, status: 'Active', sales: salesForAffiliate2, documents: [], payoutDetails: { bankName: 'Global Bank Inc.', accountHolder: 'John Smith', accountNumber: '**** **** **** 5678', routingNumber: '987654321' } },
  { id: 'aff-03', username: 'newtrendsco', firstName: 'Alice', lastName: 'Johnson', email: 'trends@newco.com', totalSales: 500, commissionRate: 10, balance: 50, status: 'Inactive', sales: salesForAffiliate3, documents: [], payoutDetails: {} },
  { id: 'aff-04', username: 'urban_stylist', firstName: 'Bob', lastName: 'Brown', email: 'urban@stylist.com', totalSales: 0, commissionRate: 10, balance: 0, status: 'Pending', sales: salesForAffiliate4, documents: [], payoutDetails: {} },
];

export const mockNotifications: Notification[] = [
    { id: 'notif-1', type: 'new_order', title: 'New Order #ord-103', description: 'Alice Johnson placed an order for $59.99.', date: '2023-10-27T10:00:00Z', read: false },
    { id: 'notif-2', type: 'low_stock', title: 'Low Stock Alert', description: 'Denim Jacket stock is at 5 units.', date: '2023-10-27T09:30:00Z', read: false },
    { id: 'notif-3', type: 'new_affiliate', title: 'New Affiliate Application', description: 'Urban Stylist has applied to be an affiliate.', date: '2023-10-26T15:00:00Z', read: true },
    { id: 'notif-4', type: 'refund_request', title: 'Refund Request', description: 'John Smith requested a refund for order #ord-102.', date: '2023-10-26T11:00:00Z', read: true },
];

export const salesData = [
  { date: 'Jan 23', revenue: 4230 },
  { date: 'Feb 23', revenue: 3120 },
  { date: 'Mar 23', revenue: 5402 },
  { date: 'Apr 23', revenue: 6103 },
  { date: 'May 23', revenue: 4890 },
  { date: 'Jun 23', revenue: 7032 },
  { date: 'Jul 23', revenue: 6890 },
  { date: 'Aug 23', revenue: 7241 },
  { date: 'Sep 23', revenue: 8102 },
  { date: 'Oct 23', revenue: 9201 },
];

export const salesByCategory = [
  { name: 'T-Shirts', value: 400, fill: 'var(--color-chart-1)' },
  { name: 'Jackets', value: 300, fill: 'var(--color-chart-2)' },
  { name: 'Pants', value: 300, fill: 'var(--color-chart-3)' },
  { name: 'Shoes', value: 200, fill: 'var(--color-chart-4)' },
  { name: 'Accessories', value: 278, fill: 'var(--color-chart-5)' },
];
