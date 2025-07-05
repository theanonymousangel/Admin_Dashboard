"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-2">
      <h1 className="text-3xl font-semibold font-headline">Settings</h1>
      <Tabs defaultValue="store">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Store Details</CardTitle>
              <CardDescription>
                Update your store name, logo, and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="store-name">Store Name</Label>
                <Input id="store-name" defaultValue="Aerøne Admin" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input id="contact-email" type="email" defaultValue="contact@adminzen.com" />
              </div>
               <div className="space-y-1">
                <Label htmlFor="logo">Store Logo</Label>
                <Input id="logo" type="file" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Admin Account</CardTitle>
              <CardDescription>
                Manage your administrator account settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input id="admin-email" type="email" defaultValue="admin@example.com" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
         <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings like currency, tax, and maintenance mode.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" defaultValue="USD" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input id="tax-rate" type="number" defaultValue="8" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <CardDescription>
                    Temporarily disable public access to your store.
                  </CardDescription>
                </div>
                <Switch />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save System Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
