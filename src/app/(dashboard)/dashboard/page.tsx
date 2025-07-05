"use client";

import {
  Activity,
  CalendarClock,
  CalendarDays,
  CreditCard,
  DollarSign,
  Goal,
  Info,
  Wallet,
} from "lucide-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const yearlyIncomeData = [
    { month: 'Jul, 2025', income: 0 },
    { month: 'Aug, 2025', income: 1100 },
    { month: 'Sep, 2025', income: 1500 },
    { month: 'Oct, 2025', income: 2300 },
    { month: 'Nov, 2025', income: 3400 },
    { month: 'Dec, 2025', income: 4100 },
    { month: 'Jan, 2026', income: 4500 },
    { month: 'Feb, 2026', income: 5200 },
    { month: 'Mar, 2026', income: 6100 },
    { month: 'Apr, 2026', income: 7200 },
    { month: 'May, 2026', income: 8300 },
    { month: 'Jun, 2026', income: 9400 },
    { month: 'Jul, 2026', income: 10000 },
];


interface StatCardProps {
    title: string;
    value: string;
    goal: string;
    progress: number;
    icon: React.ElementType;
    isPrimary?: boolean;
}

const StatCard = ({ title, value, goal, progress, icon: Icon, isPrimary = false }: StatCardProps) => (
  <Card className={isPrimary ? "bg-primary text-primary-foreground" : "bg-card"}>
    <CardHeader className="pb-4">
      <div className="flex items-start justify-between">
        <div className={`rounded-md p-2 ${isPrimary ? 'bg-white/20' : 'bg-primary/10'}`}>
            <Icon className={`h-5 w-5 ${isPrimary ? 'text-primary-foreground' : 'text-primary'}`} />
        </div>
        <Info className={`h-4 w-4 cursor-pointer ${isPrimary ? 'text-primary-foreground/60' : 'text-muted-foreground'}`} />
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className={`text-3xl font-bold ${isPrimary ? '' : 'text-foreground'}`}>{value}</div>
      <p className={`text-xs ${isPrimary ? 'text-primary-foreground/80' : 'text-muted-foreground'} mt-1`}>Goal: {goal}</p>
      <Progress value={progress} className={`mt-4 h-2 ${isPrimary ? '[&>div]:bg-white' : ''}`} />
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  return (
    <>
      <div className="flex items-center justify-between">
          <div className="grid gap-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Executive</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
                <Goal className="mr-2 h-4 w-4"/>
                Edit Goal
            </Button>
            <Button variant="outline" className="hidden sm:flex">
                VENDOR
            </Button>
          </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
            title="Daily net income"
            value="$0.00"
            goal="$27.40"
            progress={0}
            icon={DollarSign}
            isPrimary
        />
        <StatCard 
            title="Monthly net income"
            value="$0.00"
            goal="$739.80"
            progress={0}
            icon={CalendarDays}
        />
        <StatCard 
            title="Yearly net income"
            value="$0.00"
            goal="$10,000.00"
            progress={0}
            icon={Wallet}
        />
         <StatCard 
            title="Average order value"
            value="$0.00"
            goal="$200.00"
            progress={0}
            icon={CreditCard}
        />
        <StatCard 
            title="Daily transactions"
            value="0"
            goal="1"
            progress={0}
            icon={Activity}
        />
        <StatCard 
            title="Days elapsed since goal start"
            value="1 Day(s)"
            goal="364 left"
            progress={1}
            icon={CalendarClock}
        />
      </div>
      
      <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <CardTitle className="font-bold">Yearly net income performance</CardTitle>
                </div>
                <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-primary"></span>
                        Goal
                     </div>
                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-2 w-2 rounded-full border-2 border-primary"></span>
                        Jul, 2025 - Jul, 2026
                     </div>
                    <Info className="h-5 w-5 text-muted-foreground cursor-pointer" />
                </div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] w-full pr-8">
            <ResponsiveContainer>
              <LineChart
                data={yearlyIncomeData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                    dataKey="month" 
                    tickLine={false}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickMargin={10}
                    fontSize={12}
                 />
                <YAxis 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(2)}K`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    fontSize={12}
                    domain={[0, 'dataMax + 1000']}
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
                <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--primary-foreground))', stroke: 'hsl(var(--primary))' }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
    </>
  );
}
