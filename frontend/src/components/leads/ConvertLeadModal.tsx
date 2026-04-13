"use client";

import { useState, useEffect } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, UserCircle2, Building2, Briefcase, 
  CheckCircle2, AlertCircle, Phone, Mail, 
  Globe, IndianRupee, History 
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ConvertLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  onSuccess?: () => void;
}

export default function ConvertLeadModal({ isOpen, onClose, lead, onSuccess }: ConvertLeadModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("contact");
  const [duplicateContact, setDuplicateContact] = useState<any>(null);

  // Form State
  const [contactData, setContactData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
    lifecycle: "CUSTOMER"
  });

  const [companyData, setCompanyData] = useState({
    useExisting: false,
    id: "",
    name: "",
    website: "",
    industry: ""
  });

  const [dealData, setDealData] = useState({
    createDeal: true,
    name: "",
    value: "",
    stage: "PROSPECTING"
  });

  const [transferHistory, setTransferHistory] = useState(true);

  // Initialize data from lead
  useEffect(() => {
    if (lead) {
      setContactData({
        firstName: lead.firstName || "",
        lastName: lead.lastName || "",
        email: lead.email || "",
        phone: lead.phone || "",
        title: lead.title || "Decision Maker",
        lifecycle: "CUSTOMER"
      });

      setCompanyData({
        useExisting: !!lead.companyId,
        id: lead.companyId || "",
        name: lead.companyName || "",
        website: "",
        industry: ""
      });

      setDealData({
        createDeal: true,
        name: `${lead.companyName || lead.firstName}'s Deal`,
        value: "0",
        stage: "PROSPECTING"
      });

      // Check for duplicates
      checkDuplicates(lead.phone, lead.email);
    }
  }, [lead]);

  const checkDuplicates = async (phone: string, email: string) => {
    try {
      const resp = await api.get(`/contacts/check-duplicate?phone=${phone}&email=${email}`);
      if (resp.data) {
        setDuplicateContact(resp.data);
      } else {
        setDuplicateContact(null);
      }
    } catch (e) {
      console.error("Duplicate check failed", e);
    }
  };

  const handleConvert = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        leadId: lead.id,
        contact: contactData,
        company: companyData.name || companyData.id ? {
          id: companyData.useExisting ? companyData.id : undefined,
          name: !companyData.useExisting ? companyData.name : undefined,
          website: companyData.website,
          industry: companyData.industry
        } : null,
        deal: dealData.createDeal ? {
          name: dealData.name,
          value: parseFloat(dealData.value) || 0,
          stage: dealData.stage
        } : null,
        transferHistory
      };

      const resp = await api.post("/contacts/convert-from-lead", payload);
      toast.success("Lead converted successfully!");
      if (onSuccess) onSuccess();
      onClose();
      router.push(`/contacts/${resp.data.contact.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Conversion failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-background border-border p-0 overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        <DialogHeader className="p-6 bg-gradient-to-r from-primary/10 via-background to-background border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight">Convert Lead to Contact</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                Qualify {lead.firstName} {lead.lastName} and bridge them into your active ecosystem.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {duplicateContact && (
          <div className="mx-6 mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-3 text-yellow-600 dark:text-yellow-500 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-bold text-xs uppercase tracking-wider block mb-0.5">Duplicate Warning</span>
              A contact named <span className="underline font-medium">{duplicateContact.name}</span> already exists with this phone/email. 
              Converting might create a duplicate record.
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 border-b border-border bg-surface/30">
            <TabsList className="bg-transparent border-0 h-14 p-0 gap-8">
              <TabsTrigger 
                value="contact" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-1 gap-2 border-b-2 border-transparent"
              >
                <UserCircle2 size={16} /> Contact Details
              </TabsTrigger>
              <TabsTrigger 
                value="company" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-1 gap-2 border-b-2 border-transparent"
              >
                <Building2 size={16} /> Company/Account
              </TabsTrigger>
              <TabsTrigger 
                value="deal" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-1 gap-2 border-b-2 border-transparent"
              >
                <Briefcase size={16} /> Opportunity (Deal)
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6 bg-surface/10">
            <TabsContent value="contact" className="m-0 space-y-6 animate-in fade-in">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={contactData.firstName} onChange={e => setContactData({...contactData, firstName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={contactData.lastName} onChange={e => setContactData({...contactData, lastName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Mail size={12} className="text-muted-foreground" /> Email</Label>
                  <Input value={contactData.email} onChange={e => setContactData({...contactData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Phone size={12} className="text-muted-foreground" /> Phone</Label>
                  <Input value={contactData.phone} onChange={e => setContactData({...contactData, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input value={contactData.title} onChange={e => setContactData({...contactData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Lifecycle Stage</Label>
                  <Select value={contactData.lifecycle} onValueChange={v => setContactData({...contactData, lifecycle: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MQL">Marketing Qualified (MQL)</SelectItem>
                      <SelectItem value="SQL">Sales Qualified (SQL)</SelectItem>
                      <SelectItem value="CUSTOMER">Customer</SelectItem>
                      <SelectItem value="EVANGELIST">Evangelist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <History className="text-primary h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Transfer Lead History</p>
                    <p className="text-xs text-muted-foreground">Re-link calls, notes, and records to the new contact.</p>
                  </div>
                </div>
                <input type="checkbox" checked={transferHistory} onChange={e => setTransferHistory(e.target.checked)} className="h-5 w-5 accent-primary cursor-pointer" />
              </div>
            </TabsContent>

            <TabsContent value="company" className="m-0 space-y-6 animate-in fade-in">
              <div className="space-y-4">
                <div className="p-1 bg-surface-accent rounded-lg inline-flex w-full">
                  <Button 
                    variant={!companyData.useExisting ? "secondary" : "ghost"} 
                    className="flex-1 rounded-md text-sm"
                    onClick={() => setCompanyData({...companyData, useExisting: false})}
                  >
                    New Company
                  </Button>
                  <Button 
                    variant={companyData.useExisting ? "secondary" : "ghost"} 
                    className="flex-1 rounded-md text-sm"
                    onClick={() => setCompanyData({...companyData, useExisting: true})}
                    disabled={!lead.companyId}
                  >
                    Existing Company
                  </Button>
                </div>

                {!companyData.useExisting ? (
                  <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-left-2 delay-100">
                    <div className="space-y-2 col-span-2">
                      <Label>Company Name</Label>
                      <Input value={companyData.name} onChange={e => setCompanyData({...companyData, name: e.target.value})} placeholder="e.g. Acme Corp" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5"><Globe size={12} className="text-muted-foreground" /> Website</Label>
                      <Input value={companyData.website} onChange={e => setCompanyData({...companyData, website: e.target.value})} placeholder="https://acme.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Input value={companyData.industry} onChange={e => setCompanyData({...companyData, industry: e.target.value})} placeholder="Technology" />
                    </div>
                  </div>
                ) : (
                  <div className="p-6 border border-dashed border-primary/20 bg-primary/5 rounded-xl flex items-center gap-4 animate-in zoom-in-95">
                    <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                      <Building2 />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{lead.company?.name || lead.companyName}</p>
                      <p className="text-sm text-muted-foreground">Lead is already associated with this company.</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="deal" className="m-0 space-y-6 animate-in fade-in">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="text-primary h-5 w-5" />
                    <Label className="text-lg font-bold">Create an Opportunity?</Label>
                  </div>
                  <input type="checkbox" checked={dealData.createDeal} onChange={e => setDealData({...dealData, createDeal: e.target.checked})} className="h-6 w-6 accent-primary cursor-pointer" />
                </div>

                {dealData.createDeal && (
                  <div className="grid grid-cols-2 gap-6 p-6 bg-surface/50 border border-border rounded-xl animate-in slide-in-from-bottom-2">
                    <div className="space-y-2 col-span-2">
                      <Label>Deal Name</Label>
                      <Input value={dealData.name} onChange={e => setDealData({...dealData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5"><IndianRupee size={12} className="text-muted-foreground" /> Expected Value</Label>
                      <Input type="number" value={dealData.value} onChange={e => setDealData({...dealData, value: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Initial Stage</Label>
                      <Select value={dealData.stage} onValueChange={v => setDealData({...dealData, stage: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PROSPECTING">Prospecting</SelectItem>
                          <SelectItem value="QUALIFICATION">Qualification</SelectItem>
                          <SelectItem value="PROPOSAL">Proposal</SelectItem>
                          <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="p-6 bg-surface/50 border-t border-border gap-2 flex flex-row items-center justify-between">
          <div className="flex items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${activeTab === 'contact' ? 'bg-primary' : 'bg-muted-foreground'}`} />
            <div className={`h-2 w-2 rounded-full ${activeTab === 'company' ? 'bg-primary' : 'bg-muted-foreground'}`} />
            <div className={`h-2 w-2 rounded-full ${activeTab === 'deal' ? 'bg-primary' : 'bg-muted-foreground'}`} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel Conversion
            </Button>
            {activeTab !== 'deal' ? (
              <Button 
                onClick={() => setActiveTab(activeTab === 'contact' ? 'company' : 'deal')}
                className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
              >
                Next Step
              </Button>
            ) : (
              <Button 
                onClick={handleConvert}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-white min-w-[180px] shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  "Complete Conversion"
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
