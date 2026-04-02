"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { 
  Zap, Plus, Search, Filter, Play, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, MoreVertical 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function WorkflowsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: workflows, error, isLoading } = useSWR("/workflows", fetcher);

  // Mock Workflows
  const mockWorkflows = [
    { id: '1', name: 'Auto-Send Invoice on Won', trigger: 'DEAL_WON', action: 'SEND_INVOICE', status: 'ACTIVE', runs: 243, lastRun: '10 mins ago' },
    { id: '2', name: 'Escalate High-Value Ticket', trigger: 'TICKET_CREATED', action: 'NOTIFY_MANAGER', status: 'ACTIVE', runs: 12, lastRun: '2 days ago' },
    { id: '3', name: 'Welcome Email Drop', trigger: 'LEAD_CREATED', action: 'SEND_EMAIL', status: 'INACTIVE', runs: 0, lastRun: 'Never' },
    { id: '4', name: 'Sync SAP ERP via n8n', trigger: 'INVOICE_PAID', action: 'WEBHOOK_POST', status: 'ACTIVE', runs: 8, lastRun: '1 hour ago' },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 relative overflow-hidden bg-background">
      <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            Automation Engine
          </h2>
          <p className="text-muted-foreground mt-1">
            Trigger-Condition-Action (TCA) workflows powered by the global Event Bus.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all">
            <Plus className="mr-2 h-4 w-4" /> New Workflow
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 relative z-10">
        {/* Sidebar Controls */}
        <Card className="col-span-1 bg-surface border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm uppercase tracking-widest font-black text-muted-foreground flex items-center">
              <Filter className="mr-2 h-4 w-4" /> Filter Views
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-surface-2 border-border"
              />
            </div>
            <div className="space-y-1">
              {['All Workflows', 'Active', 'Errors', 'Inactive', 'Webhooks Only'].map((l, i) => (
                <div key={i} className="px-3 py-2 text-sm font-semibold text-muted-foreground rounded hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors">
                  {l}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="col-span-1 md:col-span-3 bg-card/50 backdrop-blur-md border-border shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-surface/50">
                <TableRow className="border-border">
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground h-10">Name</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Trigger</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Action</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground text-right">Metrics</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockWorkflows.map((wf) => (
                  <TableRow key={wf.id} className="border-border hover:bg-surface-2 transition-colors group cursor-pointer">
                    <TableCell className="px-4 py-4">
                      {wf.status === 'ACTIVE' ? (
                        <ToggleRight className="text-success h-6 w-6" />
                      ) : (
                        <ToggleLeft className="text-muted-foreground h-6 w-6" />
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-sm text-foreground">{wf.name}</span>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                        {wf.status === 'ACTIVE' ? <CheckCircle2 className="h-3 w-3 text-success" /> : <AlertCircle className="h-3 w-3 text-warning" />}
                        Last run: {wf.lastRun}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-mono bg-primary/5 text-primary border-primary/20">
                        {wf.trigger}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-mono bg-surface-2 text-foreground border-border">
                        {wf.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-xs font-bold text-muted-foreground">{wf.runs} runs</span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
