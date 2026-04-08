"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";
import { 
  Activity, 
  User, 
  Database, 
  Terminal, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Search,
  Filter
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  entityType: string;
  entityId: string;
  action: string;
  details: any;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AuditLogsPage() {
  const { data: logs = [], isLoading } = useSWR<AuditLog[]>("/audit/recent", fetcher);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter(log => 
    log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.newValues?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6 mb-8">
        <div>
           <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3">
             <ShieldCheck size={36} className="text-primary fill-primary/10" />
             Audit <span className="text-primary not-italic">Timeline</span>
           </h1>
           <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Systemic Event Logs // Immutable Record</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                className="pl-9 h-9 w-64 bg-surface border-border text-[10px] font-mono tracking-widest uppercase"
                placeholder="REGISTRY QUERY..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <Button variant="outline" size="sm" className="h-9 text-[10px] uppercase font-bold tracking-widest gap-2">
             <Filter size={12} /> Clear Filter
           </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-surface border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Terminal size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Events</p>
                <p className="text-2xl font-black text-foreground tabular-nums">{logs.length}</p>
             </div>
          </CardContent>
        </Card>
        <Card className="bg-surface border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-orange-400/10 flex items-center justify-center text-orange-400">
                <Activity size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Recent Activity</p>
                <p className="text-2xl font-black text-foreground tabular-nums">{logs.filter(l => new Date(l.createdAt).getTime() > Date.now() - 3600000).length}</p>
             </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <ShieldCheck size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">System Status</p>
                <p className="text-2xl font-black text-green-500 uppercase tracking-tighter">Verified</p>
             </div>
          </CardContent>
        </Card>
      </div>

      <ScrollArea className="h-[calc(100vh-320px)] border-l border-border pl-6">
        <div className="space-y-8 relative">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-surface animate-pulse rounded-2xl border border-border" />
            ))
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
               <Database size={48} className="mb-4" />
               <p className="text-sm font-black uppercase tracking-widest leading-none">Registry Empty</p>
               <p className="text-[10px] mt-2">No audit records matching your current filter set.</p>
            </div>
          ) : filteredLogs.map((log, idx) => (
            <div key={log.id} className="relative group">
              {/* Timeline Connector */}
              <div className="absolute -left-[30px] top-6 w-3 h-3 rounded-full bg-primary border-[3px] border-background z-10" />
              
              <div className="flex flex-col gap-3">
                 <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5 bg-surface px-2 py-0.5 rounded border border-border">
                       <Clock size={10} /> {new Date(log.createdAt).toLocaleString()}
                    </span>
                    <span className={cn(
                      "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest",
                      log.action === 'CREATE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                      log.action === 'DELETE' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      'bg-primary/10 text-primary border border-primary/20'
                    )}>
                      {log.action}
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">on</span>
                    <span className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
                       <Database size={10} className="text-primary" /> {log.entityType}
                    </span>
                 </div>

                 <Card className="bg-surface group-hover:bg-background border-border transition-all shadow-sm">
                   <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-surface-2 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                               <User size={18} />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Origin Agent</p>
                               <p className="text-sm font-bold text-foreground">
                                 {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System Engine'}
                               </p>
                               <p className="text-[9px] text-muted-foreground lowercase mt-0.5">{log.user?.email || 'admin@system.local'}</p>
                            </div>
                         </div>
                         
                         <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Subject UUID</p>
                            <code className="text-[10px] bg-background px-3 py-1.5 rounded border border-border font-mono text-primary block w-fit truncate max-w-full">
                               {log.entityId}
                            </code>
                         </div>
                      </div>

                      <div className="bg-background/50 rounded-xl p-4 border border-border">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 flex items-center justify-between">
                            Snapshot Data
                            <span className="text-[8px] font-mono opacity-50 px-1 bg-surface border border-border rounded">JSON VIEW</span>
                         </p>
                         <div className="space-y-2">
                            {log.details?.newValues?.name && (
                               <div className="flex items-center justify-between p-2 rounded bg-surface/50 border border-border/50 shadow-sm">
                                  <span className="text-[9px] font-black text-muted-foreground uppercase">Entity Name</span>
                                  <div className="flex items-center gap-2">
                                     <span className="text-[9px] line-through text-muted-foreground/50 opacity-40">{log.details?.oldValues?.name || 'N/A'}</span>
                                     <ArrowRight size={10} className="text-primary" />
                                     <span className="text-[10px] font-bold text-foreground">{log.details.newValues.name}</span>
                                  </div>
                               </div>
                            )}
                            {log.details?.newValues?.status && (
                               <div className="flex items-center justify-between p-2 rounded bg-surface/50 border border-border/50 shadow-sm">
                                  <span className="text-[9px] font-black text-muted-foreground uppercase">Status Transition</span>
                                  <div className="flex items-center gap-2">
                                     <span className="text-[9px] line-through text-muted-foreground/50 opacity-40">{log.details?.oldValues?.status || 'N/A'}</span>
                                     <ArrowRight size={10} className="text-primary" />
                                     <span className="text-[10px] font-bold text-primary">{log.details.newValues.status}</span>
                                  </div>
                               </div>
                            )}
                            <div className="mt-4 pt-3 border-t border-border/50 text-right">
                               <Button variant="ghost" size="sm" className="h-6 text-[8px] font-black text-primary hover:bg-primary/10 uppercase tracking-widest">
                                 View Raw Payload
                               </Button>
                            </div>
                         </div>
                      </div>
                   </CardContent>
                 </Card>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
