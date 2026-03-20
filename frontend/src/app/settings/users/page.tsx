"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/api";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Users, Plus, Pencil, Trash2, Shield, UserCheck, X, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  role: string;
  agentStatus: string;
  isActive: boolean;
  extension?: string;
  teamId?: string;
  createdAt: string;
}

const ROLE_COLOR: Record<string, string> = {
  ADMIN: "bg-red-500/10 text-red-400 border-red-500/20",
  MANAGER: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  SUPERVISOR: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  AGENT: "bg-green-500/10 text-green-400 border-green-500/20",
  QA: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const ROLES = ["ADMIN", "MANAGER", "SUPERVISOR", "TEAM_LEAD", "AGENT", "QA", "VIEWER"];

export default function UsersAdminPage() {
  const { data: users = [], isLoading } = useSWR<User[]>("/auth/users", fetcher);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", role: "AGENT", extension: "",
  });
  const [saving, setSaving] = useState(false);

  async function createUser() {
    if (!form.firstName || !form.email || !form.password) return;
    setSaving(true);
    try {
      await api.post("/auth/register", form);
      mutate("/auth/users");
      setShowCreate(false);
      setForm({ firstName: "", lastName: "", email: "", password: "", role: "AGENT", extension: "" });
    } finally { setSaving(false); }
  }

  async function updateUser() {
    if (!editUser) return;
    setSaving(true);
    try {
      await api.patch(`/auth/users/${editUser.id}`, { role: form.role, extension: form.extension, isActive: editUser.isActive });
      mutate("/auth/users");
      setEditUser(null);
    } finally { setSaving(false); }
  }

  async function toggleActive(user: User) {
    await api.patch(`/auth/users/${user.id}`, { isActive: !user.isActive });
    mutate("/auth/users");
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this user?")) return;
    await api.delete(`/auth/users/${id}`);
    mutate("/auth/users");
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            User <span className="text-primary not-italic">Management</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">{users.filter(u => u.isActive).length} active users · {users.length} total</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-primary text-white font-black uppercase tracking-widest text-[10px] h-9 px-5">
          <Plus size={12} className="mr-1.5" /> Add User
        </Button>
      </div>

      {/* Create modal */}
      {(showCreate || editUser) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-surface border-border w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-black uppercase text-sm tracking-widest">{editUser ? "Edit User" : "Add User"}</h3>
              <button onClick={() => { setShowCreate(false); setEditUser(null); }} className="text-text-muted hover:text-foreground"><X size={16} /></button>
            </div>
            <CardContent className="p-4 space-y-3">
              {!editUser && (
                <>
                  <div className="flex gap-2">
                    <Input placeholder="First name*" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="bg-surface-2 border-border" />
                    <Input placeholder="Last name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="bg-surface-2 border-border" />
                  </div>
                  <Input type="email" placeholder="Email*" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="bg-surface-2 border-border" />
                  <div className="relative">
                    <Input
                      type={showPw ? "text" : "password"}
                      placeholder="Password*"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      className="bg-surface-2 border-border pr-10"
                    />
                    <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </>
              )}
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <Input placeholder="SIP extension (e.g. 1001)" value={form.extension} onChange={e => setForm(f => ({ ...f, extension: e.target.value }))} className="bg-surface-2 border-border" />
              <div className="flex gap-2">
                <Button onClick={editUser ? updateUser : createUser} disabled={saving} size="sm" className="bg-primary text-white flex-1">
                  {saving ? "Saving…" : editUser ? "Update" : "Create User"}
                </Button>
                <Button onClick={() => { setShowCreate(false); setEditUser(null); }} variant="ghost" size="sm">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User table */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-2/50 border-b border-border">
            <tr>
              {["User", "Email", "Role", "Status", "Extension", "Active", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/30">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-2 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-text-muted text-sm"><Users size={24} className="mx-auto mb-2 opacity-40" />No users yet</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="border-b border-border/30 hover:bg-surface-2/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                        {user.firstName[0]}{user.lastName?.[0] || ""}
                      </div>
                      <span className="font-medium">{user.firstName} {user.lastName || ""}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-muted text-[11px]">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full border tracking-wider", ROLE_COLOR[user.role] || "bg-surface text-text-muted border-border")}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[9px] font-medium uppercase tracking-wider", user.agentStatus === "AVAILABLE" ? "text-green-400" : user.agentStatus === "ON_CALL" ? "text-primary" : "text-text-muted")}>
                      {user.agentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted text-[11px] font-mono">{user.extension || "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(user)} className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", user.isActive ? "bg-primary" : "bg-surface-2 border border-border")}>
                      <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform", user.isActive ? "translate-x-4" : "translate-x-1")} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditUser(user); setForm(f => ({ ...f, role: user.role, extension: user.extension || "" })); }} className="p-1.5 text-text-muted hover:text-primary transition"><Pencil size={13} /></button>
                      <button onClick={() => deleteUser(user.id)} className="p-1.5 text-text-muted hover:text-red-400 transition"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
