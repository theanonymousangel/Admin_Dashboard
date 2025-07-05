
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Box,
  Users,
  Network,
  Menu,
  ChevronDown,
  Receipt,
  Landmark,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const operationsNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/products", icon: Box, label: "Products" },
  { href: "/orders", icon: Receipt, label: "Transactions" },
  { href: "/customers", icon: Users, label: "Customers" },
  { href: "/affiliates", icon: Network, label: "Affiliates" },
  { href: "/payouts", icon: Landmark, label: "Income/Payouts" },
];

const NavLink = ({ href, icon: Icon, label, pathname }: { href: string; icon: React.ElementType; label: string; pathname: string; }) => (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md px-3 py-2 transition-all text-sm font-medium ${
        pathname === href
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-primary"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
);

const MobileNav = ({ pathname }: { pathname: string }) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="ghost" size="icon" className="shrink-0">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>
    </SheetTrigger>
    <SheetContent side="left" className="flex flex-col px-4 pt-6 bg-card w-[280px]">
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-semibold mb-4 pl-3"
      >
        <span className="font-headline text-lg tracking-wider">AERONE</span>
      </Link>
      <nav className="grid gap-4 text-base font-medium">
         <div className="flex flex-col gap-1">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operations</h3>
            {operationsNavItems.map((item) => (
              <NavLink key={item.href} {...item} pathname={pathname} />
            ))}
        </div>
      </nav>
    </SheetContent>
  </Sheet>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="font-headline text-lg tracking-wider">AERONE</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start p-4 text-sm font-medium">
                <div className="flex flex-col gap-1">
                    <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operations</h3>
                    {operationsNavItems.map((item) => (
                      <NavLink key={item.href} {...item} pathname={pathname} />
                    ))}
                </div>
            </nav>
          </div>
          <div className="mt-auto p-4 border-t">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-3 p-2 h-auto">
                         <Avatar className="h-9 w-9">
                            <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="woman avatar" alt="Viktor Jakjimovikj" />
                            <AvatarFallback>VJ</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                            <p className="text-sm font-medium leading-none">Viktor Jakjimovikj</p>
                        </div>
                        <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-background">
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:hidden">
          <MobileNav pathname={pathname} />
          <div className="ml-auto">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="woman avatar" alt="@admin" />
                      <AvatarFallback>VJ</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
