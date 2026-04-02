"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Plus, Search, Box, Package, IndianRupee, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: products, error, isLoading } = useSWR("/products", fetcher);

  const filteredProducts = products?.filter((p: any) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 relative overflow-hidden bg-background">
      <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Box className="h-8 w-8 text-primary" />
            Product Catalog
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your service and inventory catalog for quotes and invoices.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-sm relative z-10 mt-6">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2 w-full max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products or SKUs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-surface border-border focus-visible:ring-primary h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-500">
              Failed to load products.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-surface/50">
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="font-semibold w-[350px]">Product</TableHead>
                  <TableHead className="font-semibold">SKU</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold text-right">Unit Price</TableHead>
                  <TableHead className="font-semibold text-right">In Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts?.map((product: any) => (
                    <TableRow key={product.id} className="hover:bg-surface/50 border-b border-border/50 group cursor-pointer transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center text-secondary-foreground shadow-sm">
                            <Package className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {product.name}
                            </p>
                            {product.category && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {product.category.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground bg-surface px-2 py-1 rounded border border-border">
                          {product.sku || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0 border-border/50 bg-secondary/20 text-secondary-foreground">
                          {product.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end font-medium tabular-nums text-foreground">
                          <IndianRupee className="h-3 w-3 mr-0.5 text-muted-foreground" />
                          {product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {product.type === "GOODS" ? (
                          <div className="inline-flex items-center">
                            <span className={`font-medium tabular-nums ${product.stockQuantity > 10 ? 'text-green-500' : product.stockQuantity > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                              {product.stockQuantity || 0}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">{product.unitOfMeasure}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
