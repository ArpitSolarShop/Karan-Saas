"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Lock, 
  Zap, 
  Database, 
  Terminal, 
  Activity, 
  Settings2,
  PhoneCall,
  Bot,
  Globe,
  Plus,
  X,
  Check,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function SettingsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [dispositions, setDispositions] = useState<any[]>([]);
  const [showRegister, setShowRegister] = useState(false);
  const [showDisposition, setShowDisposition] = useState(false);
  const [regForm, setRegForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'AGENT' });
  const [dispForm, setDispForm] = useState({ name: '', code: '', category: 'NEUTRAL', colorHex: '#888888' });
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetch(`${API_URL}/auth/users`).then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API_URL}/dispositions`).then(r => r.json()).then(d => setDispositions(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const registerUser = async () => {
    try {
      await fetch(`${API_URL}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });
      setShowRegister(false);
      setRegForm({ email: '', password: '', firstName: '', lastName: '', role: 'AGENT' });
      const res = await fetch(`${API_URL}/auth/users`);
      setUsers(await res.json());
    } catch (err) { console.error(err); }
  };

  const createDisposition = async () => {
    try {
      await fetch(`${API_URL}/dispositions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dispForm),
      });
      setShowDisposition(false);
      setDispForm({ name: '', code: '', category: 'NEUTRAL', colorHex: '#888888' });
      const res = await fetch(`${API_URL}/dispositions`);
      setDispositions(await res.json());
    } catch (err) { console.error(err); }
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-primary text-white', 
    MANAGER: 'bg-primary/60 text-white', 
    SUPERVISOR: 'bg-primary/40 text-white', 
    TEAM_LEAD: 'bg-surface-2 text-text-muted', 
    AGENT: 'bg-surface-2 text-text-muted', 
    QA: 'bg-surface-2 text-text-muted'
  };

  const tabs = [
    { id: 'users', label: 'Team Matrix', icon: Users },
    { id: 'dispositions', label: 'Outcome Codes', icon: Zap },
    { id: 'telephony', label: 'Voice Ops', icon: PhoneCall },
    { id: 'automation', label: 'Neural Flow', icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white pb-20">
      <main className="p-8 max-w-[1400px] mx-auto space-y-12">
        {/* Settings Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2 mb-2">
                <Settings2 size={18} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">System Configuration</span>
             </div>
             <h2 className="text-5xl font-black tracking-tighter uppercase italic">
               Operational <span className="not-italic text-primary">Core</span>
             </h2>
          </div>
          <div className="flex items-center gap-2 bg-surface p-1 rounded-lg border border-border">
             {tabs.map((tab) => (
               <Button 
                 key={tab.id}
                 variant={activeTab === tab.id ? "default" : "ghost"}
                 onClick={() => setActiveTab(tab.id)} 
                 className={cn(
                   "text-[9px] font-black uppercase tracking-widest h-9 px-4 transition-all rounded-md",
                   activeTab === tab.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-muted hover:text-foreground"
                 )}
               >
                 <tab.icon size={12} className="mr-2" />
                 {tab.label}
               </Button>
             ))}
          </div>
        </div>

        {/* Dynamic Protocol Panels */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Team Matrix (Users) */}
          {activeTab === 'users' && (
            <Card className="bg-surface border-border overflow-hidden flex flex-col">
              <CardHeader className="bg-surface-2/30 border-b border-border p-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Shield size={14} className="text-primary" /> Personnel Registry
                  </CardTitle>
                </div>
                <Button 
                  onClick={() => setShowRegister(!showRegister)} 
                  className={cn(
                    "h-9 text-[10px] uppercase font-black tracking-widest transition-all",
                    showRegister ? "bg-surface-2 text-foreground" : "bg-primary text-white hover:bg-primary-dark"
                  )}
                >
                  {showRegister ? 'Abort Access' : 'Authorize User'}
                </Button>
              </CardHeader>

              {showRegister && (
                <div className="p-8 border-b border-border bg-surface-2/50 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">First Designation</label>
                         <Input className="bg-surface border-border h-11" placeholder="First Name" value={regForm.firstName} onChange={e => setRegForm({ ...regForm, firstName: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">Last Designation</label>
                         <Input className="bg-surface border-border h-11" placeholder="Last Name" value={regForm.lastName} onChange={e => setRegForm({ ...regForm, lastName: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">Secure Link (Email)</label>
                         <Input className="bg-surface border-border h-11" placeholder="Email" value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">Secret Hash (Pass)</label>
                         <Input className="bg-surface border-border h-11" type="password" value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })} />
                      </div>
                   </div>
                   <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-8 flex-grow">
                         <div className="flex flex-col gap-1 min-w-[200px]">
                            <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">Privilege Rank</label>
                            <Select value={regForm.role} onValueChange={v => setRegForm({ ...regForm, role: v })}>
                               <SelectTrigger className="h-10 bg-surface-2 border-border font-bold text-xs">
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent className="bg-surface border-border">
                                  <SelectItem value="ADMIN">Administrator</SelectItem>
                                  <SelectItem value="MANAGER">Manager</SelectItem>
                                  <SelectItem value="AGENT">Field Agent</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                      </div>
                      <Button onClick={registerUser} className="bg-primary text-white font-black uppercase tracking-widest px-10 h-11 ml-8">Commit to Registry</Button>
                   </div>
                </div>
              )}

              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-background/50">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="px-8 h-12 text-[9px] font-black uppercase tracking-widest text-text-muted italic">Operator Entity</TableHead>
                      <TableHead className="px-8 h-12 text-[9px] font-black uppercase tracking-widest text-text-muted italic">Comm Link</TableHead>
                      <TableHead className="px-8 h-12 text-[9px] font-black uppercase tracking-widest text-text-muted italic">Level</TableHead>
                      <TableHead className="px-8 h-12 text-[9px] font-black uppercase tracking-widest text-text-muted italic text-right">Integrity Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u: any) => (
                      <TableRow key={u.id} className="border-border hover:bg-primary/[0.01] transition-colors group">
                        <TableCell className="px-8 py-5">
                          <div className="flex items-center gap-4">
                             <Avatar className="h-10 w-10 border border-border group-hover:border-primary/50 transition-colors">
                                <AvatarImage src={`https://avatar.vercel.sh/${u.firstName}.png`} />
                                <AvatarFallback className="bg-surface-2 text-xs font-black">{(u.firstName || "U").charAt(0)}</AvatarFallback>
                             </Avatar>
                             <div className="flex flex-col">
                                <span className="font-black text-sm uppercase tracking-tight">{u.firstName} {u.lastName}</span>
                                <span className="text-[9px] text-text-muted font-bold tracking-widest opacity-50 uppercase italic">Registered Node</span>
                             </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-5 font-mono text-xs text-text-muted">{u.email}</TableCell>
                        <TableCell className="px-8 py-5">
                          <span className={cn(
                            "px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] rounded border",
                            roleColors[u.role] || 'bg-surface-2 text-text-muted border-border'
                          )}>
                            {u.role}
                          </span>
                        </TableCell>
                        <TableCell className="px-8 py-5 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest",
                                u.isActive ? 'text-success' : 'text-text-muted opacity-40'
                              )}>
                                {u.isActive ? '// ONLINE' : '// DECOUPLED'}
                              </span>
                              <div className={cn("h-1.5 w-1.5 rounded-full", u.isActive ? 'bg-success animate-pulse' : 'bg-surface-2')} />
                           </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Outcome Codes (Dispositions) */}
          {activeTab === 'dispositions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Zap size={20} className="text-primary" />
                    <h3 className="text-xl font-black uppercase tracking-tighter italic">Signal <span className="not-italic text-primary">Templates</span></h3>
                 </div>
                 <Button onClick={() => setShowDisposition(!showDisposition)} className="bg-primary text-white font-black uppercase tracking-widest px-6 text-[10px] h-10 shadow-lg shadow-primary/20">
                    {showDisposition ? 'Close' : '+ Create Signal'}
                 </Button>
              </div>

              {showDisposition && (
                <Card className="bg-surface border-border p-6 shadow-2xl animate-in slide-in-from-right-4">
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">Display Label</label>
                         <Input className="bg-surface-2 border-border" placeholder="Label" value={dispForm.name} onChange={e => setDispForm({ ...dispForm, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">Internal Code</label>
                         <Input className="bg-surface-2 border-border font-mono" placeholder="Internal Code" value={dispForm.code} onChange={e => setDispForm({ ...dispForm, code: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">Sentiment Bias</label>
                         <Select value={dispForm.category} onValueChange={v => setDispForm({ ...dispForm, category: v })}>
                            <SelectTrigger className="bg-surface-2 border-border">
                               <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-surface border-border">
                               <SelectItem value="POSITIVE">Positive Signal</SelectItem>
                               <SelectItem value="NEGATIVE">Negative Signal</SelectItem>
                               <SelectItem value="NEUTRAL">Neutral Point</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="flex items-end">
                         <Button onClick={createDisposition} className="w-full bg-primary text-white uppercase font-black tracking-widest h-10">Push Control</Button>
                      </div>
                   </div>
                </Card>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {dispositions.map((d: any) => (
                  <Card key={d.id} className="bg-surface border-border hover:border-primary/50 transition-all p-5 group flex flex-col justify-between min-h-[140px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                       <Zap size={40} className="text-primary font-black"/>
                    </div>
                    <div>
                       <div className="text-xs font-black uppercase tracking-[0.1em] group-hover:text-primary transition-colors">{d.name}</div>
                       <div className="text-[9px] font-mono text-text-muted uppercase mt-1 tracking-tighter">REF: {d.code}</div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                       <span className={cn(
                         "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded",
                         d.category === 'POSITIVE' ? 'bg-success/20 text-success' : 
                         d.category === 'NEGATIVE' ? 'bg-destructive/20 text-destructive' : 
                         'bg-surface-2 text-text-muted'
                       )}>{d.category}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Infrastructure (Telephony/Automation Placeholder) */}
          {(activeTab === 'telephony' || activeTab === 'automation') && (
            <Card className="bg-surface border-border border-dashed">
               <CardContent className="py-24 flex flex-col items-center text-center space-y-6">
                  <div className="h-20 w-20 rounded-full bg-surface-2 border border-border flex items-center justify-center animate-pulse">
                     <Terminal size={40} className="text-text-muted opacity-30" />
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-xs font-black uppercase tracking-[0.3em]">Neural Protocol Synchronized</h3>
                     <p className="text-[10px] text-text-muted italic">Awaiting secure handshake with regional gateway...</p>
                  </div>
                  <Button variant="outline" className="border-border text-text-muted h-10 text-[9px] font-black uppercase tracking-widest px-8">Refresh Link</Button>
               </CardContent>
            </Card>
          )}

        </div>

        {/* Global System Integrity Footer */}
        <footer className="pt-12 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
           <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                 <Shield size={12} className="text-primary"/>
                 <span className="text-[9px] font-black uppercase tracking-[0.2em]">RBAC Matrix Validated</span>
              </div>
              <div className="flex items-center gap-2">
                 <Database size={12} className="text-text-muted"/>
                 <span className="text-[9px] font-black uppercase tracking-[0.2em]">Primary Cluster: Region-01</span>
              </div>
           </div>
           <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest italic">
              Silicon Valley Night // Command Core // v3.2.0
           </div>
        </footer>
      </main>
    </div>
  );
}
