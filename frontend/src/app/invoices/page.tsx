"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Plus, Search, ScrollText, IndianRupee, Clock, Loader2, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: invoices, error, isLoading } = useSWR("/invoices", fetcher);

  const filteredInvoices = invoices?.filter((i: any) =>
    i.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PAID": return { color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 };
      case "OVERDUE": return { color: "bg-red-500/10 text-red-500 border-red-500/20", icon: AlertCircle };
      case "SENT": return { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: ArrowUpRight };
      case "DRAFT": return { color: "bg-muted text-muted-foreground border-border", icon: ScrollText };
      default: return { color: "bg-muted text-muted-foreground border-border", icon: Clock };
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 -m-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ScrollText className="h-8 w-8 text-primary" />
            Billing & Invoices
          </h2>
          <p className="text-muted-foreground mt-1">
            Track receivables, generate invoices, and monitor quote-to-cash conversions.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all">
            <Plus className="mr-2 h-4 w-4" /> Generate Invoice
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-sm relative z-10 mt-6">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2 w-full max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice # or company..."
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
              Failed to load invoices.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-surface/50">
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="font-semibold w-[250px]">Invoice Number</TableHead>
                  <TableHead className="font-semibold">Billed To</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Issue Date</TableHead>
                  <TableHead className="font-semibold text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices?.map((invoice: any) => {
                    const StatusIcon = getStatusConfig(invoice.status).icon;
                    return (
                      <TableRow key={invoice.id} className="hover:bg-surface/50 border-b border-border/50 group cursor-pointer transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {invoice.number}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-foreground">
                            {invoice.company?.name || 'Unknown Company'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`px-2.5 py-0.5 border ${getStatusConfig(invoice.status).color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground tabular-nums">
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end font-semibold text-foreground tabular-nums">
                            <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" />
                            {invoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
