"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companySchema, CompanyFormValues } from "@/lib/validations/company";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Building2, Globe, Phone, Mail, MapPin, Linkedin, Info } from "lucide-react";

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  company?: any; // If provided, we are in EDIT mode
}

export default function CompanyModal({ isOpen, onClose, onSuccess, company }: CompanyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      industry: "",
      sector: "",
      website: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      zipcode: "",
      size: "",
      revenue: "",
      description: "",
      logo: "",
      linkedinUrl: "",
      taxIdentifier: "",
    },
  });

  // Reset form when company changes (for edit mode)
  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name || "",
        industry: company.industry || "",
        sector: company.sector || "",
        website: company.website || "",
        phone: company.phone || "",
        email: company.email || "",
        address: company.address || "",
        city: company.city || "",
        state: company.state || "",
        country: company.country || "India",
        zipcode: company.zipcode || "",
        size: company.size || "",
        revenue: company.revenue || "",
        description: company.description || "",
        logo: company.logo || "",
        linkedinUrl: company.linkedinUrl || "",
        taxIdentifier: company.taxIdentifier || "",
      });
    } else {
      form.reset({
        name: "",
        industry: "",
        sector: "",
        website: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        country: "India",
        zipcode: "",
        size: "",
        revenue: "",
        description: "",
        logo: "",
        linkedinUrl: "",
        taxIdentifier: "",
      });
    }
  }, [company, form]);

  const onSubmit = async (data: CompanyFormValues) => {
    setIsSubmitting(true);
    try {
      if (company?.id) {
        await api.patch(`/companies/${company.id}`, data);
        toast.success("Company updated successfully");
      } else {
        await api.post("/companies", data);
        toast.success("Company created successfully");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to save company:", error);
      toast.error(error.response?.data?.message || "Failed to save company");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-background border-border p-0 overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        <DialogHeader className="p-6 bg-surface-2 border-b border-border relative">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Building2 size={80} />
          </div>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {company ? "Edit Company" : "Add New Company"}
          </DialogTitle>
          <DialogDescription>
            {company ? "Update details for " + company.name : "Create a new B2B account to track leads and deals."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <form id="company-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                <Info size={16} /> Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input 
                    id="name" 
                    placeholder="Acme Corp" 
                    {...form.register("name")}
                    className={form.formState.errors.name ? "border-red-500" : ""}
                  />
                  {form.formState.errors.name && (
                    <p className="text-[10px] text-red-500 font-medium">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select 
                    onValueChange={(val) => form.setValue("industry", val)} 
                    defaultValue={form.getValues("industry")}
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                <Phone size={16} /> Contact & Web
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-1.5">
                    <Globe size={12} className="text-muted-foreground" /> Website
                  </Label>
                  <Input id="website" placeholder="https://acme.com" {...form.register("website")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1.5">
                    <Mail size={12} className="text-muted-foreground" /> Support Email
                  </Label>
                  <Input id="email" placeholder="contact@acme.com" {...form.register("email")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+1..." {...form.register("phone")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl" className="flex items-center gap-1.5">
                    <Linkedin size={12} className="text-muted-foreground" /> LinkedIn URL
                  </Label>
                  <Input id="linkedinUrl" placeholder="https://linkedin.com/company/..." {...form.register("linkedinUrl")} />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                <MapPin size={16} /> Location
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3 space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" placeholder="123 Business Way" {...form.register("address")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Mumbai" {...form.register("city")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" placeholder="Maharashtra" {...form.register("state")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="India" {...form.register("country")} />
                </div>
              </div>
            </div>

            {/* Firmographics */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                <Building2 size={16} /> Firmographics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Employee Count</Label>
                  <Select 
                    onValueChange={(val) => form.setValue("size", val)} 
                    defaultValue={form.getValues("size")}
                  >
                    <SelectTrigger id="size">
                      <SelectValue placeholder="Size range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501-1000">501-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="revenue">Annual Revenue</Label>
                  <Input id="revenue" placeholder="$1M - $5M" {...form.register("revenue")} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Short summary of the business..." 
                    className="min-h-[100px]"
                    {...form.register("description")} 
                  />
                </div>
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="p-6 bg-surface-2 border-t border-border gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="company-form"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              company ? "Update Company" : "Create Company"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
