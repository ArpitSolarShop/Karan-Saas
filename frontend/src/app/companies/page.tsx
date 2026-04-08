"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Plus, Search, Building2, MapPin, Globe, Loader2, MoreHorizontal, Edit, Trash, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import CompanyModal from "@/components/companies/CompanyModal";
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

export default function CompaniesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  
  const { data: companies, error, isLoading, mutate } = useSWR("/companies", fetcher);

  const filteredCompanies = companies?.filter((c: any) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (company: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this company?")) return;
    try {
      await api.delete(`/companies/${id}`);
      toast.success("Company deleted");
      mutate();
    } catch (error) {
      toast.error("Failed to delete company");
    }
  };

  const handleAdd = () => {
    setSelectedCompany(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 relative overflow-hidden bg-background">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Companies
            </h2>
          </div>
          <p className="text-muted-foreground">
            Manage your B2B accounts, track revenue, and monitor linked leads.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleAdd} className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all">
            <Plus className="mr-2 h-4 w-4" /> Add Company
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-sm relative z-10">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2 w-full max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies by name or industry..."
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
              Failed to load companies.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-surface/50">
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="font-semibold w-[300px]">Company Name</TableHead>
                  <TableHead className="font-semibold">Industry</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold text-right">Linked Leads</TableHead>
                  <TableHead className="font-semibold text-right">Added On</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No companies found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies?.map((company: any) => (
                    <TableRow 
                      key={company.id} 
                      onClick={() => router.push(`/companies/${company.id}`)}
                      className="hover:bg-surface/50 border-b border-border/50 group cursor-pointer transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner overflow-hidden border border-primary/5">
                            {company.logo ? (
                              <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                            ) : (
                              company.name.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {company.name}
                            </p>
                            {company.website && (
                              <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                                <Globe className="h-3 w-3 mr-1" />
                                {company.website.replace(/^https?:\/\//, '')}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {company.industry ? (
                          <span className="inline-flex items-center rounded-full bg-secondary/50 border border-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                            {company.industry}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                          {company.city ? `${company.city}${company.country ? `, ${company.country}` : ''}` : 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium tabular-nums text-foreground">
                          {company._count?.leads || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                        {new Date(company.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/companies/${company.id}`)}>
                              <ExternalLink className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleEdit(company, e)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => handleDelete(company.id, e)} className="text-red-500 hover:text-red-400">
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

      <CompanyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => mutate()}
        company={selectedCompany}
      />
    </div>
  );
}
