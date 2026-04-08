"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Linkedin, 
  Users, 
  Briefcase, 
  FileText, 
  History, 
  Loader2, 
  ArrowLeft,
  Plus,
  ExternalLink,
  Edit,
  TrendingUp,
  CreditCard,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import CompanyModal from "@/components/companies/CompanyModal";
import { useState } from "react";

export default function CompanyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const { data: company, error, isLoading, mutate } = useSWR(`/companies/${id}`, fetcher);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <p className="text-red-500">Failed to load company details.</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const dealTotal = company.deals?.reduce((acc: number, deal: any) => acc + (deal.value || 0), 0) || 0;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {company.name}
              {company.industry && (
                <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20">
                  {company.industry}
                </Badge>
              )}
            </h2>
            <div className="flex items-center gap-4 mt-1 text-muted-foreground text-sm">
              <span className="flex items-center gap-1">
                <Building2 size={14} /> Corporate Account
              </span>
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Globe size={14} /> {company.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {company.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {company.city}, {company.country}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
          <Button className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25">
            <Plus className="mr-2 h-4 w-4" /> New Deal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stats Section */}
        <Card className="bg-card/50 backdrop-blur-md border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <TrendingUp size={14} className="text-success" /> Pipeline Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">₹ {dealTotal.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Across {company.deals?.length || 0} active deals</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-md border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Users size={14} className="text-blue-500" /> Linked Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{company.leads?.length || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Active contacts for this account</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-md border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <CreditCard size={14} className="text-amber-500" /> Revenue Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{company.revenue || "N/A"}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Self-reported annual revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-md border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Briefcase size={14} className="text-primary" /> Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{company.size || "N/A"}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Total workforce size</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="bg-surface-2 border border-border p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:text-primary px-6 py-2 transition-all">
            Overview
          </TabsTrigger>
          <TabsTrigger value="leads" className="data-[state=active]:bg-background data-[state=active]:text-primary px-6 py-2 transition-all">
            Leads ({company.leads?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="deals" className="data-[state=active]:bg-background data-[state=active]:text-primary px-6 py-2 transition-all">
            Deals ({company.deals?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-background data-[state=active]:text-primary px-6 py-2 transition-all">
            Activity History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-border bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Business Description</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                {company.description || "No description provided for this company."}
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-surface border border-border">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Phone</div>
                    <div className="font-medium">{company.phone || "Not set"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-surface border border-border">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Email</div>
                    <div className="font-medium text-primary hover:underline cursor-pointer">{company.email || "Not set"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-surface border border-border">
                    <Linkedin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Social</div>
                    <div className="font-medium text-primary hover:underline cursor-pointer">LinkedIn Profile</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="mt-0">
          <Card className="border-border bg-card/50 backdrop-blur p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface/50">
                  <TableHead>Contact Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {company.leads?.map((lead: any) => (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-surface/50 group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-border shadow-sm">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black uppercase">
                            {lead.firstName[0]}{lead.lastName?.[0] || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium group-hover:text-primary transition-colors">{lead.firstName} {lead.lastName}</div>
                          <div className="text-[10px] text-muted-foreground">{lead.phone}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm italic text-muted-foreground">Manager</TableCell>
                    <TableCell className="text-sm">{lead.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest">{lead.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => router.push(`/leads`)}>
                          <ExternalLink className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!company.leads?.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                       No leads associated with this account.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="mt-0">
          <Card className="border-border bg-card/50 backdrop-blur p-0">
             <Table>
                <TableHeader>
                  <TableRow className="bg-surface/50">
                    <TableHead>Deal Name</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {company.deals?.map((deal: any) => (
                    <TableRow key={deal.id} className="cursor-pointer hover:bg-surface/50">
                       <TableCell className="font-medium text-foreground">{deal.name}</TableCell>
                       <TableCell>
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold tracking-widest">
                            {deal.stage}
                          </Badge>
                       </TableCell>
                       <TableCell className="font-black tabular-nums">₹ {deal.value.toLocaleString()}</TableCell>
                       <TableCell className="text-sm text-muted-foreground">{deal.owner?.name || "Unassigned"}</TableCell>
                       <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                             <ExternalLink className="h-4 w-4" />
                          </Button>
                       </TableCell>
                    </TableRow>
                  ))}
                  {!company.deals?.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        No active deals for this account.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
             </Table>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
           <Card className="border-border bg-card/50 backdrop-blur h-[500px]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                   <History className="text-primary h-5 w-5" /> Account Audit History
                </CardTitle>
                <CardDescription>
                   Tracking all changes and engagements across the organization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <ScrollArea className="h-[380px] pr-4">
                    <div className="space-y-6">
                       {/* Mock activity for now - in production we aggregate from linked leads */}
                       <div className="flex gap-4 relative">
                          <div className="absolute left-[15px] top-[40px] bottom-[-20px] w-px bg-border group-last:hidden" />
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 z-10">
                              <Plus size={14} className="text-primary" />
                          </div>
                          <div>
                             <div className="text-sm font-bold">Account Created</div>
                             <div className="text-xs text-muted-foreground mb-1">System Audit // {new Date(company.createdAt).toLocaleString()}</div>
                             <div className="text-[11px] bg-surface rounded p-2 border border-border">
                                Initial B2B record established for {company.name}.
                             </div>
                          </div>
                       </div>

                       {company.leads?.map((lead: any, idx: number) => (
                         <div key={lead.id + idx} className="flex gap-4 relative">
                            <div className="absolute left-[15px] top-[40px] bottom-[-20px] w-px bg-border" />
                            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0 z-10">
                                <Users size={14} className="text-blue-500" />
                            </div>
                            <div>
                               <div className="text-sm font-bold">Lead Linked: {lead.firstName} {lead.lastName}</div>
                               <div className="text-xs text-muted-foreground mb-1">CRM Logic // {new Date(lead.updatedAt).toLocaleString()}</div>
                               <div className="text-[11px] bg-surface rounded p-2 border border-border italic text-muted-foreground">
                                  Contact associated with corporate hierarchy.
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </ScrollArea>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>

      <CompanyModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => mutate()}
        company={company}
      />
    </div>
  );
}
