export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: 'In Stock' | 'Out of Stock' | 'Low Stock';
  image: string;
  category: string;
  tags: string[];
  description: string;
};

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  products: { name: string; quantity: number }[];
  amount: number;
  status: 'Pending' | 'Completed' | 'Shipped' | 'Refunded' | 'Cancelled';
  date: string;
};

export type Customer = {
  id:string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastPurchaseDate: string;
  avatar: string;
};

export type AffiliateSale = {
  id: string;
  amount: number;
  date: string; // ISO date string e.g. "2024-07-01T10:00:00Z"
};

export type Payout = {
    saleId: string;
    saleAmount: number;
    commission: number;
    saleDate: Date;
    eligibleDate: Date;
    payoutDate: Date;
    status: 'Pending Eligibility' | 'Eligible for Payout' | 'Paid';
};

export type Affiliate = {
  id: string;
  name: string;
  email: string;
  totalSales: number;
  commissionRate: number;
  balance: number;
  status: 'Active' | 'Inactive';
  sales: AffiliateSale[];
};

export type Notification = {
  id: string;
  type: 'new_order' | 'new_affiliate' | 'low_stock' | 'refund_request';
  title: string;
  description: string;
  date: string;
  read: boolean;
};
