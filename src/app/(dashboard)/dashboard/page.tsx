
"use client";

import {
  Activity,
  CreditCard,
  DollarSign,
  Users,
  Info,
  TrendingUp
} from "lucide-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";


const yearlyIncomeData = [
    { date: 'Jul, 2025', income: 800 },
    { date: 'Aug, 2025', income: 1600 },
    { date: 'Sep, 2025', income: 2500 },
    { date: 'Oct, 2025', income: 3300 },
    { date: 'Nov, 2025', income: 4100 },
    { date: 'Dec, 2025', income: 4900 },
    { date: 'Jan, 2026', income: 5900 },
    { date: 'Feb, 2026', income: 6900 },
    { date: 'Mar, 2026', income: 7900 },
    { date: 'Apr, 2026', income: 8900 },
    { date: 'May, 2026', income: 9900 },
    { date: 'Jun, 2026', income: 9950 },
    { date: 'Jul, 2026', income: 10000 },
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
  return (
    <>
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
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Sales Performance</CardTitle>
              <CardDescription>July, 2025 - July, 2026</CardDescription>
            </div>
            <Button asChild size="sm" variant="ghost" className="ml-auto gap-1">
                <Info className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
                <LineChart 
                  data={yearlyIncomeData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.split(',')[0]}
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
