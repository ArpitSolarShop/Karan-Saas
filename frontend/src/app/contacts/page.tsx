"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { 
  UserCircle2, Search, Plus, MapPin, Loader2, 
  MoreHorizontal, Edit, Trash, ExternalLink, 
  Mail, Phone, Building2, Tag, ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const lifecycleColors: Record<string, string> = {
  SUBSCRIBER: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  LEAD: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  MQL: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  SQL: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  CUSTOMER: "bg-green-500/10 text-green-500 border-green-500/20",
  EVANGELIST: "bg-pink-500/10 text-pink-500 border-pink-500/20",
};

export default function ContactsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: contacts, error, isLoading, mutate } = useSWR("/contacts", fetcher);

  const filteredContacts = contacts?.filter((c: any) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
      await api.delete(`/contacts/${id}`);
      toast.success("Contact deleted");
      mutate();
    } catch (error) {
      toast.error("Failed to delete contact");
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 relative overflow-hidden bg-background">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCircle2 className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Contacts
            </h2>
          </div>
          <p className="text-muted-foreground">
            Qualified people who are part of your active customer ecosystem.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* We'll add a 'Add Contact' modal later if needed, but primary way is Lead Conversion */}
          <Button disabled className="bg-primary/50 text-white cursor-not-allowed">
            <Plus className="mr-2 h-4 w-4" /> Add Contact
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-sm relative z-10 shadow-xl shadow-black/5">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2 w-full max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-surface/50 border-border focus-visible:ring-primary h-9"
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
              Failed to load contacts.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-surface/50">
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="font-semibold px-4 py-3">Contact</TableHead>
                  <TableHead className="font-semibold">Company</TableHead>
                  <TableHead className="font-semibold">Lifecycle</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold text-right">Score</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No contacts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContacts?.map((contact: any) => (
                    <TableRow 
                      key={contact.id} 
                      className="hover:bg-surface/50 border-b border-border/50 group cursor-pointer transition-colors"
                    >
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold shadow-sm border border-primary/10">
                            {contact.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {contact.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {contact.email && (
                                <span className="flex items-center text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {contact.email}
                                </span>
                              )}
                              {contact.phone && (
                                <span className="flex items-center text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3 mr-1 ml-2" />
                                  {contact.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {contact.company ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium">{contact.company.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={lifecycleColors[contact.lifecycle || 'CUSTOMER']}>
                          {contact.lifecycle || 'CUSTOMER'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground text-xs">
                          <MapPin className="h-3 w-3 mr-1 opacity-70" />
                          {contact.city ? `${contact.city}${contact.country ? `, ${contact.country}` : ''}` : 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold tabular-nums ${contact.score > 50 ? 'text-green-500' : 'text-foreground'}`}>
                          {contact.score}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-surface-accent">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border shadow-2xl">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <ExternalLink className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => handleDelete(contact.id, e)} className="text-red-500 hover:text-red-400 focus:bg-red-500/10">
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Help Tip */}
      <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-lg flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-2 bg-primary/10 rounded-full text-primary mt-1">
          <ArrowRight className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-semibold text-primary">Pro-Tip: Lead Conversion</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Contacts are best created by converting successful **Leads**. This preserves all call recordings, 
            WhatsApp history, and notes while simultaneously providing options to create a **Company** 
            and an **Opportunity** (Deal).
          </p>
        </div>
      </div>
    </div>
  );
}
