"use client";

import {
  Activity,
  CreditCard,
  DollarSign,
  Users,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const yearlyIncomeData = [
    { month: 'Jan', income: 4500 },
    { month: 'Feb', income: 5200 },
    { month: 'Mar', income: 6100 },
    { month: 'Apr', income: 7200 },
    { month: 'May', income: 8300 },
    { month: 'Jun', income: 9400 },
    { month: 'Jul', income: 10000 },
    { month: 'Aug', income: 11000 },
    { month: 'Sep', income: 9800 },
    { month: 'Oct', income: 12000 },
    { month: 'Nov', income: 13500 },
    { month: 'Dec', income: 15000 },
];

const recentSignups = [
    { name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: '+$1,999.00' },
    { name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: '+$39.00' },
    { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: '+$299.00' },
    { name: 'William Kim', email: 'will@email.com', amount: '+$99.00' },
    { name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: '+$39.00' },
];

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

export default function DashboardPage() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Total Revenue"
            value="$45,231.89"
            description="+20.1% from last month"
            icon={DollarSign}
        />
        <StatCard 
            title="Subscriptions"
            value="+2350"
            description="+180.1% from last month"
            icon={Users}
        />
        <StatCard 
            title="Sales"
            value="+12,234"
            description="+19% from last month"
            icon={CreditCard}
        />
         <StatCard 
            title="Active Now"
            value="+573"
            description="+201 since last hour"
            icon={Activity}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={yearlyIncomeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="month"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value / 1000}K`}
                    />
                     <Tooltip 
                        contentStyle={{
                            borderRadius: '0.5rem',
                            borderColor: 'hsl(var(--border))',
                            backgroundColor: 'hsl(var(--background))'
                        }}
                        labelStyle={{
                            fontWeight: 'bold'
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Income']}
                    />
                    <Bar dataKey="income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>You made 265 sales this month.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {recentSignups.map(signup => (
                        <div className="flex items-center" key={signup.email}>
                            <div className="h-9 w-9 bg-muted rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{signup.name}</p>
                                <p className="text-sm text-muted-foreground">{signup.email}</p>
                            </div>
                            <div className="ml-auto font-medium">{signup.amount}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
