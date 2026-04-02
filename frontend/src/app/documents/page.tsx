"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Folder, File, UploadCloud, Search, Plus, MoreVertical, HardDrive, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: documents, error, isLoading } = useSWR("/documents", fetcher);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 -m-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HardDrive className="h-8 w-8 text-primary" />
            Document Vault
          </h2>
          <p className="text-muted-foreground mt-1">
            Secure cloud storage for your contracts, attachments, and company assets.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="border-border hover:bg-surface-2 transition-all shadow-sm">
            <Folder className="mr-2 h-4 w-4" /> New Folder
          </Button>
          <Button className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all">
            <UploadCloud className="mr-2 h-4 w-4" /> Upload File
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-md relative z-10 mt-6 shadow-sm">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2 w-full max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files and folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-surface border-border focus-visible:ring-primary h-9"
            />
          </div>
          <div className="flex bg-surface p-1 rounded-md border border-border">
            <Button variant="ghost" size="sm" className="h-7 w-8 px-0 text-muted-foreground hover:text-foreground">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-8 px-0 bg-surface-2 shadow-sm">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Folders Section */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Folders</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {['Contracts', 'Invoices', 'Legal', 'Marketing Assets'].map((folder) => (
                <div key={folder} className="p-4 rounded-lg border border-border bg-surface hover:border-primary/50 cursor-pointer transition-colors group flex flex-col items-center justify-center text-center">
                  <Folder className="h-10 w-10 text-primary mb-2 opacity-80 group-hover:opacity-100 transition-opacity" />
                  <span className="text-sm font-semibold">{folder}</span>
                  <span className="text-xs text-muted-foreground mt-1">12 files</span>
                </div>
              ))}
            </div>
          </div>

          {/* Files Section Mock */}
          <div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Recent Files</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {['Q3_Report.pdf', 'Logo_Vector.svg', 'NDA_Template.docx', 'Client_List.xlsx'].map((file) => (
                <div key={file} className="p-4 rounded-lg border border-border bg-surface hover:bg-surface-2 cursor-pointer transition-colors flex items-start gap-3 relative group">
                   <div className="h-10 w-10 flex-shrink-0 rounded bg-primary/10 text-primary flex items-center justify-center">
                      <File className="h-5 w-5" />
                   </div>
                   <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{file}</p>
                      <p className="text-xs text-muted-foreground uppercase mt-1">1.2 MB</p>
                   </div>
                   <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                     <MoreVertical className="h-4 w-4" />
                   </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
