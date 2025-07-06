export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: 'In Stock' | 'Out of Stock' | 'Low Stock';
  image: string[];
  category: string;
  tags: string[];
  description: string;
  sizes?: string[];
  colors?: string[];
};

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress: string;
  products: { name: string; quantity: number; size?: string; color?: string }[];
  amount: number;
  status: 'Pending' | 'Completed' | 'Shipped' | 'Refunded' | 'Cancelled' | 'Rejected';
  date: string;
  affiliateUsername?: string;
};

export type Customer = {
  id:string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  lastPurchaseDate: string;
};

export type AffiliateSale = {
  id: string;
  productName: string;
  productSize?: string;
  productColor?: string;
  amount: number;
  date: string; // ISO date string e.g. "2024-07-01T10:00:00Z"
  customerName: string;
  status?: 'Pending Eligibility' | 'Eligible for Payout' | 'Paid';
};

export type Payout = {
    saleId: string;
    productName: string;
    productSize?: string;
    productColor?: string;
    saleAmount: number;
    commission: number;
    saleDate: Date;
    eligibleDate: Date;
    payoutDate: Date;
    status: 'Pending Eligibility' | 'Eligible for Payout' | 'Paid';
    customerName: string;
};

export type AffiliateDocument = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
};

export type PayoutDetails = {
  payoutMethod?: 'usd' | 'eur';
  usd?: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    routingNumber: string;
  };
  eur?: {
    accountHolder: string;
    iban: string;
    bic: string;
  }
};

export type ProductClicks = {
  productId: string;
  productName: string;
  clicks: number;
};

export type Affiliate = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  totalSales: number;
  totalClicks?: number;
  commissionRate: number;
  balance: number;
  status: 'Active' | 'Pending' | 'Rejected' | 'Disabled';
  sales: AffiliateSale[];
  documents: AffiliateDocument[];
  payoutDetails?: PayoutDetails;
  promotableProductIds?: string[];
  productClicks?: ProductClicks[];
};

export type Notification = {
  id: string;
  type: 'new_order' | 'new_affiliate' | 'low_stock' | 'refund_request';
  title: string;
  description: string;
  date: string;
  read: boolean;
};

export type Transaction = {
  id: string;
  type: 'Commission' | 'Payout' | 'Refund' | 'Income';
  productName?: string;
  productSize?: string;
  productColor?: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Reversed';
  saleId?: string;
  customerName?: string;
  affiliateName?: string;
  date: Date;
  notes?: string;
};
