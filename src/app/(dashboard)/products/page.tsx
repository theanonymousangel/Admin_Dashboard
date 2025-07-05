
"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  File,
  PlusCircle,
  Search,
  UploadCloud,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { mockProducts } from "@/lib/mock-data";
import type { Product } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

function ProductStatusBadge({ status }: { status: Product["status"] }) {
  const variant = {
    "In Stock": "default",
    "Out of Stock": "destructive",
    "Low Stock": "secondary",
  }[status] as "default" | "destructive" | "secondary";

  return <Badge variant={variant}>{status}</Badge>;
}

const ProductDetails = ({ product, onUpdate, onDelete }: { product: Product; onUpdate: (id: string, data: Partial<Product>) => void; onDelete: (id: string) => void }) => {
    const [formData, setFormData] = useState({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        status: product.status,
        sizes: product.sizes?.join(', ') || '',
        colors: product.colors?.join(', ') || '',
    });
    const [images, setImages] = useState<string[]>(product.image);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: 'category' | 'status', value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    }

    const handleSave = () => {
        const { sizes, colors, price, stock, ...rest } = formData;
        const updatedData: Partial<Product> = {
            ...rest,
            price: Number(price),
            stock: Number(stock),
            sizes: sizes.split(',').map(s => s.trim()).filter(Boolean),
            colors: colors.split(',').map(c => c.trim()).filter(Boolean),
            image: images,
        };
        onUpdate(product.id, updatedData);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImageUrls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
            setImages(prev => [...prev, ...newImageUrls]);
        }
    };
    
    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    }

    return (
        <div className="p-6 bg-muted/50 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Product</CardTitle>
                        <CardDescription>Update product details. Click "Save Changes" when you're done.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input id="name" value={formData.name} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price</Label>
                                <Input id="price" type="number" value={formData.price} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={formData.description} onChange={handleInputChange} />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="T-Shirts">T-Shirts</SelectItem>
                                        <SelectItem value="Jackets">Jackets</SelectItem>
                                        <SelectItem value="Pants">Pants</SelectItem>
                                        <SelectItem value="Shoes">Shoes</SelectItem>
                                        <SelectItem value="Accessories">Accessories</SelectItem>
                                         <SelectItem value="Hoodies">Hoodies</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                 <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="In Stock">In Stock</SelectItem>
                                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="stock">Stock Quantity</Label>
                                <Input id="stock" type="number" value={formData.stock} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                                <Input id="sizes" value={formData.sizes} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="colors">Colors (comma-separated)</Label>
                            <Input id="colors" value={formData.colors} onChange={handleInputChange} />
                        </div>
                    </CardContent>
                    <CardFooter className="justify-between">
                       <div className="flex items-center gap-2">
                         <Button onClick={handleSave}>Save Changes</Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="h-4 w-4 mr-2"/>
                                    Delete Product
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this product from your store.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDelete(product.id)} className={buttonVariants({ variant: "destructive" })}>
                                        Yes, Delete Product
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                       </div>
                    </CardFooter>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Product Images</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            {images.map((img, index) => (
                                <div key={index} className="relative group">
                                    <Image alt={`Product image ${index + 1}`} className="aspect-square rounded-md object-cover" height="100" src={img} width="100" data-ai-hint="product image"/>
                                    <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImage(index)}>
                                        <Trash2 className="h-3 w-3"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                         <div className="relative border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2"/>
                            <Label htmlFor="image-upload" className="text-primary cursor-pointer font-semibold">
                                Upload Images
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">Add one or more images.</p>
                            <Input id="image-upload" type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageUpload}/>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [openProductId, setOpenProductId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleProductUpdate = (productId: string, data: Partial<Product>) => {
    setProducts(prev => 
        prev.map(p => p.id === productId ? { ...p, ...data } : p)
    );
  };

  const handleProductDelete = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setOpenProductId(null);
  };
  
  const handleGenerateLink = (productId: string) => {
    const link = `${window.location.origin}/checkout?product_id=${productId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Generated & Copied",
      description: `A checkout link has been copied to your clipboard.`,
    });
  };

  return (
    <>
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">In Stock</TabsTrigger>
            <TabsTrigger value="low">Low Stock</TabsTrigger>
            <TabsTrigger value="archived" className="hidden sm:flex">
              Out of Stock
            </TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1" onClick={() => setIsSheetOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Product
              </span>
            </Button>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Products</CardTitle>
              <CardDescription>
                Manage your products and view their sales performance.
              </CardDescription>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search products..." className="w-full pl-8 sm:w-1/3" />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                      Image
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Price</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Stock Quantity
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">Sizes</TableHead>
                    <TableHead className="hidden lg:table-cell">Colors</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <React.Fragment key={product.id}>
                        <TableRow className="cursor-pointer" onClick={() => setOpenProductId(openProductId === product.id ? null : product.id)}>
                          <TableCell className="hidden sm:table-cell">
                            <Image
                              alt={product.name}
                              className="aspect-square rounded-md object-cover"
                              height="64"
                              src={product.image[0]}
                              width="64"
                              data-ai-hint="product image"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="hidden md:table-cell">{product.category}</TableCell>
                          <TableCell>
                            <ProductStatusBadge status={product.status} />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            ${product.price.toFixed(2)}
                          </TableCell>
                          <TableCell
                            className={`hidden md:table-cell ${
                              product.status === "Low Stock" ? "text-destructive font-bold" : ""
                            }`}
                          >
                            {product.stock}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {product.sizes?.join(", ") || "N/A"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {product.colors?.join(", ") || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateLink(product.id);
                              }}
                            >
                              <LinkIcon className="h-3.5 w-3.5" />
                              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Get Link
                              </span>
                            </Button>
                          </TableCell>
                        </TableRow>
                        {openProductId === product.id && (
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableCell colSpan={9} className="p-0">
                                    <ProductDetails product={product} onUpdate={handleProductUpdate} onDelete={handleProductDelete} />
                                </TableCell>
                            </TableRow>
                        )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing <strong>1-{products.length}</strong> of <strong>{products.length}</strong> products
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="font-body">Add New Product</SheetTitle>
            <SheetDescription>
              Fill in the details below to add a new product to your store.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" placeholder="Classic White Tee" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" placeholder="A high-quality classic white t-shirt..." className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price</Label>
              <Input id="price" type="number" placeholder="29.99" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="t-shirts">T-Shirts</SelectItem>
                  <SelectItem value="jackets">Jackets</SelectItem>
                  <SelectItem value="pants">Pants</SelectItem>
                  <SelectItem value="shoes">Shoes</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">Stock</Label>
              <Input id="stock" type="number" placeholder="150" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sizes" className="text-right">Sizes</Label>
              <Input id="sizes" placeholder="S, M, L, XL, 2XL" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="colors" className="text-right">Colors</Label>
              <Input id="colors" placeholder="White, Black, Blue" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Images</Label>
              <div className="col-span-3">
                <Input id="picture" type="file" multiple />
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
            <Button type="submit">Save Product</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
