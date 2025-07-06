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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-2">
      <h1 className="text-3xl font-semibold font-headline">Settings</h1>
      <Tabs defaultValue="store">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
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
        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Legal Policies</CardTitle>
              <CardDescription>
                Manage your store's legal policies and where they are displayed on your sales website.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Terms of Service */}
              <div className="space-y-4 rounded-lg border p-4">
                <div className="space-y-2">
                  <Label htmlFor="terms-of-service" className="text-base font-semibold">Terms of Service</Label>
                  <Textarea id="terms-of-service" placeholder="Enter your terms of service..." rows={6} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Visibility</Label>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms-visibility-main" />
                      <Label htmlFor="terms-visibility-main" className="font-normal text-sm">Main Page (Footer)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms-visibility-product" />
                      <Label htmlFor="terms-visibility-product" className="font-normal text-sm">Product Pages</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms-visibility-checkout" />
                      <Label htmlFor="terms-visibility-checkout" className="font-normal text-sm">Checkout Page</Label>
                    </div>
                  </div>
                </div>
              </div>
              {/* Privacy Policy */}
              <div className="space-y-4 rounded-lg border p-4">
                <div className="space-y-2">
                  <Label htmlFor="privacy-policy" className="text-base font-semibold">Privacy Policy</Label>
                  <Textarea id="privacy-policy" placeholder="Enter your privacy policy..." rows={6} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Visibility</Label>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="privacy-visibility-main" />
                      <Label htmlFor="privacy-visibility-main" className="font-normal text-sm">Main Page (Footer)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="privacy-visibility-product" />
                      <Label htmlFor="privacy-visibility-product" className="font-normal text-sm">Product Pages</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="privacy-visibility-checkout" />
                      <Label htmlFor="privacy-visibility-checkout" className="font-normal text-sm">Checkout Page</Label>
                    </div>
                  </div>
                </div>
              </div>
              {/* Refund Policy */}
              <div className="space-y-4 rounded-lg border p-4">
                <div className="space-y-2">
                  <Label htmlFor="refund-policy" className="text-base font-semibold">Refund Policy</Label>
                  <Textarea id="refund-policy" placeholder="Enter your refund policy..." rows={6} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Visibility</Label>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="refund-visibility-main" />
                      <Label htmlFor="refund-visibility-main" className="font-normal text-sm">Main Page (Footer)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="refund-visibility-product" />
                      <Label htmlFor="refund-visibility-product" className="font-normal text-sm">Product Pages</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="refund-visibility-checkout" />
                      <Label htmlFor="refund-visibility-checkout" className="font-normal text-sm">Checkout Page</Label>
                    </div>
                  </div>
                </div>
              </div>
              {/* Affiliate Agreement */}
              <div className="space-y-4 rounded-lg border p-4">
                <div className="space-y-2">
                  <Label htmlFor="affiliate-agreement" className="text-base font-semibold">Affiliate Agreement</Label>
                  <Textarea id="affiliate-agreement" placeholder="Enter your affiliate agreement..." rows={6} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Visibility</Label>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="affiliate-visibility-page" />
                      <Label htmlFor="affiliate-visibility-page" className="font-normal text-sm">Affiliate Application Page</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Policies</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
