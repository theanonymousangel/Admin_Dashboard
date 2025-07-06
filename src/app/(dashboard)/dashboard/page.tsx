
"use client";

import { useState, useMemo } from "react";
import {
  Ban,
  CreditCard,
  DollarSign,
  Users,
  TrendingUp
} from "lucide-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, subMonths, startOfDay, endOfDay, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, parseISO } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockOrders } from "@/lib/mock-data";
import type { Order } from "@/lib/types";


interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType;
}

const StatCard = ({ title, value, description, icon: Icon }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const incomePayload = payload.find((p: any) => p.dataKey === 'income');
    
    if (!incomePayload) return null;

    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm min-w-[180px]">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(incomePayload.value)}</p>
        </div>
      </div>
    );
  }
  return null;
};


export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("last12months");
  const [amountRange, setAmountRange] = useState("all");

  const totalRefundedAmount = mockOrders
    .filter(order => order.status === 'Refunded' || order.status === 'Cancelled')
    .reduce((sum, order) => sum + order.amount, 0);

  const recentSales = useMemo(() => {
    return mockOrders
      .filter(o => o.status === 'Completed' || o.status === 'Shipped')
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
      .slice(0, 5)
      .map(order => ({
        name: order.customerName,
        email: order.customerEmail,
        amount: order.amount
      }));
  }, []);

  const filteredRecentSales = useMemo(() => {
    if (amountRange === 'all') return recentSales;
    return recentSales.filter(sale => {
      const amount = sale.amount;
      if (amountRange === 'under50') return amount < 50;
      if (amountRange === '50to200') return amount >= 50 && amount <= 200;
      if (amountRange === 'over200') return amount > 200;
      return true;
    });
  }, [recentSales, amountRange]);

  const salesChartData = useMemo(() => {
    const now = new Date();
    const completedOrders = mockOrders.filter(o => o.status === 'Completed' || o.status === 'Shipped');

    if (timeRange === "last30days") {
      const thirtyDaysAgo = subDays(now, 30);
      const interval = { start: startOfDay(thirtyDaysAgo), end: endOfDay(now) };
      const days = eachDayOfInterval(interval);

      return days.map(day => {
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);
        const dailyRevenue = completedOrders
          .filter(order => {
            const orderDate = parseISO(order.date);
            return orderDate >= dayStart && orderDate <= dayEnd;
          })
          .reduce((sum, order) => sum + order.amount, 0);

        return {
          date: format(day, 'MMM dd'),
          income: dailyRevenue,
        };
      });
    }
    
    if (timeRange === "last6months") {
      const sixMonthsAgo = subMonths(now, 5);
      const interval = { start: startOfMonth(sixMonthsAgo), end: endOfMonth(now) };
      const months = eachMonthOfInterval(interval);
      
      return months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const monthlyRevenue = completedOrders
          .filter(order => {
            const orderDate = parseISO(order.date);
            return orderDate >= monthStart && orderDate <= monthEnd;
          })
          .reduce((sum, order) => sum + order.amount, 0);

        return {
          date: format(month, 'MMM'),
          income: monthlyRevenue,
        };
      });
    }

    if (timeRange === "last12months") {
      const twelveMonthsAgo = subMonths(now, 11);
      const interval = { start: startOfMonth(twelveMonthsAgo), end: endOfMonth(now) };
      const months = eachMonthOfInterval(interval);
      
      return months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const monthlyRevenue = completedOrders
          .filter(order => {
            const orderDate = parseISO(order.date);
            return orderDate >= monthStart && orderDate <= monthEnd;
          })
          .reduce((sum, order) => sum + order.amount, 0);

        return {
          date: format(month, 'MMM'),
          income: monthlyRevenue,
        };
      });
    }

    return [];
  }, [timeRange]);
  
  const timeRangeDescriptions: Record<string, string> = {
    last30days: 'Showing data for the last 30 days',
    last6months: 'Showing data for the last 6 months',
    last12months: 'Showing data for the last 12 months',
  };


  return (
    <>
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of all of the sales and transactions.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Revenue"
            value="$45,231.89"
            description="+20.1% from last month"
            icon={DollarSign}
        />
        <StatCard 
            title="Earnings"
            value="$1,356.96"
            description="3% of total monthly revenue"
            icon={TrendingUp}
        />
        <StatCard 
            title="Sales"
            value="+12,234"
            description="Total sales transactions this month"
            icon={CreditCard}
        />
         <StatCard 
            title="Refunds"
            value={`$${totalRefundedAmount.toFixed(2)}`}
            description="Total value of refunded/cancelled orders"
            icon={Ban}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Sales Performance</CardTitle>
              <CardDescription>
                {timeRangeDescriptions[timeRange]}
              </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="ml-auto w-[160px]">
                    <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                    <SelectItem value="last6months">Last 6 Months</SelectItem>
                    <SelectItem value="last12months">Last 12 Months</SelectItem>
                </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
                <LineChart 
                  data={salesChartData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value / 1000}K`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Line 
                      dataKey="income" 
                      name="Income" 
                      type="monotone" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2} 
                      dot={{ r: 4, fill: 'hsl(var(--primary))' }} 
                      activeDot={{ r: 8, strokeWidth: 2 }} />
                </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Recent Sales</CardTitle>
                        <CardDescription>A list of the most recent sales.</CardDescription>
                    </div>
                     <Select value={amountRange} onValueChange={setAmountRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by amount" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Amounts</SelectItem>
                            <SelectItem value="under50">Under $50</SelectItem>
                            <SelectItem value="50to200">$50 - $200</SelectItem>
                            <SelectItem value="over200">Over $200</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {filteredRecentSales.length > 0 ? filteredRecentSales.map((sale, index) => (
                        <div className="flex items-center" key={`${sale.email}-${index}`}>
                            <div className="h-9 w-9 bg-muted rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{sale.name}</p>
                                <p className="text-sm text-muted-foreground">{sale.email}</p>
                            </div>
                            <div className="ml-auto font-medium">+${sale.amount.toFixed(2)}</div>
                        </div>
                    )) : (
                      <div className="text-center text-sm text-muted-foreground py-10">
                        No recent sales in this amount range.
                      </div>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
