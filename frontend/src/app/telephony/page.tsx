"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import api, { fetcher } from "@/lib/api";
import IvrBuilder from "./ivr/builder";

const tenantId = typeof window !== "undefined" ? localStorage.getItem("crm_tenantId") || "" : "";

// ── Reusable Components ─────────────────────────────────────────────────────
function StatCard({ label, value, icon, color = "var(--accent)" }: { label: string; value: number | string; icon: string; color?: string }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>{value}</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

function DataTable({ columns, data, onRowClick }: { columns: { key: string; label: string; render?: (v: any, row: any) => any }[]; data: any[]; onRowClick?: (row: any) => void }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>{columns.map(c => <th key={c.key} style={{ textAlign: "left", padding: "12px 16px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} onClick={() => onRowClick?.(row)} style={{ cursor: onRowClick ? "pointer" : "default", borderBottom: "1px solid var(--border)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              {columns.map(c => <td key={c.key} style={{ padding: "12px 16px", fontSize: 14, color: "var(--text)" }}>{c.render ? c.render(row[c.key], row) : row[c.key] ?? "—"}</td>)}
            </tr>
          ))}
          {data.length === 0 && <tr><td colSpan={columns.length} style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>No records found</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ children, color = "#6366f1" }: { children: React.ReactNode; color?: string }) {
  return <span style={{ background: `${color}22`, color, padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{children}</span>;
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={onClose}>
      <div style={{ background: "var(--surface)", borderRadius: 16, padding: 32, minWidth: 480, maxWidth: 600, maxHeight: "80vh", overflow: "auto", border: "1px solid var(--border)" }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "extensions", label: "📞 Extensions", icon: "📞" },
  { id: "trunks", label: "🔌 SIP Trunks", icon: "🔌" },
  { id: "queues", label: "📋 ACD Queues", icon: "📋" },
  { id: "ivr", label: "🌳 IVR Menus", icon: "🌳" },
  { id: "skills", label: "🎯 Skills", icon: "🎯" },
  { id: "ring-groups", label: "🔔 Ring Groups", icon: "🔔" },
  { id: "time-conditions", label: "⏰ Time Conditions", icon: "⏰" },
  { id: "cdr", label: "📊 CDR Reports", icon: "📊" },
];

// ── Extensions Panel ─────────────────────────────────────────────────────────
function ExtensionsPanel() {
  const { data: extensions, mutate: reload } = useSWR(`/telephony/extensions?tenantId=${tenantId}`, fetcher);
  const { data: stats } = useSWR(`/telephony/extensions/stats?tenantId=${tenantId}`, fetcher);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ number: "", name: "", password: "", type: "SIP", callerIdName: "", voicemailEnabled: false, callRecording: false });

  const handleCreate = async () => {
    await api.post("/telephony/extensions", { ...form, tenantId });
    reload(); setShowForm(false); setForm({ number: "", name: "", password: "", type: "SIP", callerIdName: "", voicemailEnabled: false, callRecording: false });
  };

  const handleDelete = async (id: string) => { if (confirm("Delete this extension?")) { await api.delete(`/telephony/extensions/${id}`); reload(); } };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Extensions" value={stats?.total ?? 0} icon="📞" />
        <StatCard label="Active" value={stats?.active ?? 0} icon="✅" color="#22c55e" />
        <StatCard label="WebRTC" value={stats?.webrtc ?? 0} icon="🌐" color="#3b82f6" />
        <StatCard label="Voicemail" value={stats?.withVoicemail ?? 0} icon="✉️" color="#f59e0b" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ color: "var(--text)", margin: 0 }}>Extensions</h3>
        <button onClick={() => setShowForm(true)} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 600 }}>+ New Extension</button>
      </div>
      <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
        <DataTable columns={[
          { key: "number", label: "Number" },
          { key: "name", label: "Name" },
          { key: "type", label: "Type", render: v => <Badge>{v}</Badge> },
          { key: "user", label: "Assigned To", render: v => v ? `${v.firstName} ${v.lastName}` : "—" },
          { key: "isActive", label: "Status", render: v => <Badge color={v ? "#22c55e" : "#ef4444"}>{v ? "Active" : "Inactive"}</Badge> },
          { key: "voicemailEnabled", label: "VM", render: v => v ? "✅" : "—" },
          { key: "callRecording", label: "Rec", render: v => v ? "🔴" : "—" },
          { key: "id", label: "", render: (_, row) => <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>🗑️</button> },
        ]} data={extensions || []} />
      </div>
      {showForm && (
        <ModalOverlay onClose={() => setShowForm(false)}>
          <h3 style={{ color: "var(--text)", marginTop: 0 }}>Create Extension</h3>
          {[{ key: "number", label: "Extension Number", placeholder: "1001" }, { key: "name", label: "Display Name", placeholder: "Agent 1" }, { key: "password", label: "SIP Password", placeholder: "secure123" }, { key: "callerIdName", label: "Caller ID Name", placeholder: "Company" }].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 4 }}>{f.label}</label>
              <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--background)", color: "var(--text)", fontSize: 14 }} />
            </div>
          ))}
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 4 }}>Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--background)", color: "var(--text)" }}>
              {["SIP", "IAX", "PJSIP", "WEBRTC"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text)", cursor: "pointer" }}>
              <input type="checkbox" checked={form.voicemailEnabled} onChange={e => setForm({ ...form, voicemailEnabled: e.target.checked })} /> Voicemail
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text)", cursor: "pointer" }}>
              <input type="checkbox" checked={form.callRecording} onChange={e => setForm({ ...form, callRecording: e.target.checked })} /> Call Recording
            </label>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={() => setShowForm(false)} style={{ padding: "10px 20px", border: "1px solid var(--border)", borderRadius: 8, background: "transparent", color: "var(--text)", cursor: "pointer" }}>Cancel</button>
            <button onClick={handleCreate} style={{ padding: "10px 20px", border: "none", borderRadius: 8, background: "var(--accent)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Create</button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── SIP Trunks Panel ─────────────────────────────────────────────────────────
function TrunksPanel() {
  const { data: trunks, mutate: reload } = useSWR(`/telephony/trunks?tenantId=${tenantId}`, fetcher);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", host: "", port: 5060, username: "", password: "", transport: "udp", maxChannels: 30, provider: "" });

  const handleCreate = async () => { await api.post("/telephony/trunks", { ...form, tenantId }); reload(); setShowForm(false); };
  const handleDelete = async (id: string) => { if (confirm("Delete?")) { await api.delete(`/telephony/trunks/${id}`); reload(); } };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ color: "var(--text)", margin: 0 }}>SIP Trunks</h3>
        <button onClick={() => setShowForm(true)} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 600 }}>+ New Trunk</button>
      </div>
      <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
        <DataTable columns={[
          { key: "name", label: "Name" },
          { key: "host", label: "Host" },
          { key: "port", label: "Port" },
          { key: "transport", label: "Transport", render: v => <Badge>{v?.toUpperCase()}</Badge> },
          { key: "maxChannels", label: "Max CH" },
          { key: "provider", label: "Provider" },
          { key: "isActive", label: "Status", render: v => <Badge color={v ? "#22c55e" : "#ef4444"}>{v ? "Active" : "Off"}</Badge> },
          { key: "id", label: "", render: (_, row) => <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>🗑️</button> },
        ]} data={trunks || []} />
      </div>
      {showForm && (
        <ModalOverlay onClose={() => setShowForm(false)}>
          <h3 style={{ color: "var(--text)", marginTop: 0 }}>Create SIP Trunk</h3>
          {[{ key: "name", label: "Name" }, { key: "host", label: "Host/IP" }, { key: "username", label: "Username" }, { key: "password", label: "Password" }, { key: "provider", label: "Provider" }].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 4 }}>{f.label}</label>
              <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--background)", color: "var(--text)" }} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={() => setShowForm(false)} style={{ padding: "10px 20px", border: "1px solid var(--border)", borderRadius: 8, background: "transparent", color: "var(--text)", cursor: "pointer" }}>Cancel</button>
            <button onClick={handleCreate} style={{ padding: "10px 20px", border: "none", borderRadius: 8, background: "var(--accent)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Create</button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── ACD Queues Panel ─────────────────────────────────────────────────────────
function QueuesPanel() {
  const { data: queues, mutate: reload } = useSWR(`/telephony/queues?tenantId=${tenantId}`, fetcher);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", strategy: "RING_ALL", timeout: 30, wrapUpTime: 15, maxWaitTime: 300, serviceLevelSec: 60 });

  const handleCreate = async () => { await api.post("/telephony/queues", { ...form, tenantId }); reload(); setShowForm(false); };
  const handleDelete = async (id: string) => { if (confirm("Delete?")) { await api.delete(`/telephony/queues/${id}`); reload(); } };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ color: "var(--text)", margin: 0 }}>ACD Queues</h3>
        <button onClick={() => setShowForm(true)} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 600 }}>+ New Queue</button>
      </div>
      <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
        <DataTable columns={[
          { key: "name", label: "Queue Name" },
          { key: "strategy", label: "Strategy", render: v => <Badge color="#8b5cf6">{v?.replace(/_/g, " ")}</Badge> },
          { key: "_count", label: "Members", render: v => v?.members ?? 0 },
          { key: "timeout", label: "Timeout (s)" },
          { key: "wrapUpTime", label: "Wrap Up (s)" },
          { key: "serviceLevelSec", label: "SLA (s)" },
          { key: "isActive", label: "Status", render: v => <Badge color={v ? "#22c55e" : "#ef4444"}>{v ? "Active" : "Off"}</Badge> },
          { key: "id", label: "", render: (_, row) => <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>🗑️</button> },
        ]} data={queues || []} />
      </div>
      {showForm && (
        <ModalOverlay onClose={() => setShowForm(false)}>
          <h3 style={{ color: "var(--text)", marginTop: 0 }}>Create ACD Queue</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 4 }}>Queue Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--background)", color: "var(--text)" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 4 }}>Strategy</label>
            <select value={form.strategy} onChange={e => setForm({ ...form, strategy: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--background)", color: "var(--text)" }}>
              {["RING_ALL", "LEAST_RECENT", "FEWEST_CALLS", "RANDOM", "ROUND_ROBIN", "LINEAR"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[{ key: "timeout", label: "Timeout (s)" }, { key: "wrapUpTime", label: "Wrap Up (s)" }, { key: "serviceLevelSec", label: "SLA (s)" }].map(f => (
              <div key={f.key}>
                <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 4 }}>{f.label}</label>
                <input type="number" value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: parseInt(e.target.value) })} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--background)", color: "var(--text)" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={() => setShowForm(false)} style={{ padding: "10px 20px", border: "1px solid var(--border)", borderRadius: 8, background: "transparent", color: "var(--text)", cursor: "pointer" }}>Cancel</button>
            <button onClick={handleCreate} style={{ padding: "10px 20px", border: "none", borderRadius: 8, background: "var(--accent)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Create</button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── IVR Panel ────────────────────────────────────────────────────────────────
function IvrPanel() {
  const { data: ivrs, mutate: reload } = useSWR(`/telephony/ivr?tenantId=${tenantId}`, fetcher);
  const [selectedIvr, setSelectedIvr] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", timeout: 10, retries: 3 });

  const handleCreate = async () => { await api.post("/telephony/ivr", { ...form, tenantId, nodes: [{ key: "1", action: "QUEUE", target: "" }, { key: "2", action: "EXTENSION", target: "" }, { key: "0", action: "OPERATOR", target: "" }] }); reload(); setShowForm(false); };

  return (
    <div>
      {selectedIvr && (
        <IvrBuilder 
          ivrId={selectedIvr} 
          onClose={() => setSelectedIvr(null)} 
          onSave={() => reload()} 
        />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ color: "var(--text)", margin: 0 }}>IVR Menus</h3>
        <button onClick={() => setShowForm(true)} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 600 }}>+ New IVR</button>
      </div>
      <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
        <DataTable columns={[
          { key: "name", label: "Name" },
          { key: "description", label: "Description" },
          { key: "timeout", label: "Timeout (s)" },
          { key: "retries", label: "Retries" },
          { key: "isActive", label: "Status", render: v => <Badge color={v ? "#22c55e" : "#ef4444"}>{v ? "Active" : "Off"}</Badge> },
          { key: "nodes", label: "Nodes", render: v => Array.isArray(v) ? v.length : 0 },
          { key: "actions", label: "", render: (_, row) => (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setSelectedIvr(row.id)} style={{ background: "var(--accent)22", border: "1px solid var(--accent)44", color: "var(--accent)", padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700 }}>🎨 Edit Flow</button>
              <button onClick={async () => { if (confirm("Delete?")) { await api.delete(`/telephony/ivr/${row.id}`); reload(); } }} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>🗑️</button>
            </div>
          )},
        ]} data={ivrs || []} />
      </div>
      {showForm && (
        <ModalOverlay onClose={() => setShowForm(false)}>
          <h3 style={{ color: "var(--text)", marginTop: 0 }}>Create IVR Menu</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 4 }}>Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--background)", color: "var(--text)" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 4 }}>Description</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--background)", color: "var(--text)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 4 }}>Timeout (s)</label>
              <input type="number" value={form.timeout} onChange={e => setForm({ ...form, timeout: parseInt(e.target.value) })} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--background)", color: "var(--text)" }} />
            </div>
            <div>
              <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 4 }}>Retries</label>
              <input type="number" value={form.retries} onChange={e => setForm({ ...form, retries: parseInt(e.target.value) })} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--background)", color: "var(--text)" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={() => setShowForm(false)} style={{ padding: "10px 20px", border: "1px solid var(--border)", borderRadius: 8, background: "transparent", color: "var(--text)", cursor: "pointer" }}>Cancel</button>
            <button onClick={handleCreate} style={{ padding: "10px 20px", border: "none", borderRadius: 8, background: "var(--accent)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Create</button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Skills Panel ─────────────────────────────────────────────────────────────
function SkillsPanel() {
  const { data: skills, mutate: reload } = useSWR(`/telephony/skills?tenantId=${tenantId}`, fetcher);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const handleCreate = async () => { await api.post("/telephony/skills", { ...form, tenantId }); reload(); setShowForm(false); setForm({ name: "", description: "" }); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ color: "var(--text)", margin: 0 }}>Agent Skills</h3>
        <button onClick={() => setShowForm(true)} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 600 }}>+ New Skill</button>
      </div>
      <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
        <DataTable columns={[
          { key: "name", label: "Skill Name" },
          { key: "description", label: "Description" },
          { key: "_count", label: "Agents", render: v => v?.agents ?? 0 },
          { key: "_count", label: "Queues", render: v => v?.queueSkills ?? 0 },
        ]} data={skills || []} />
      </div>
      {showForm && (
        <ModalOverlay onClose={() => setShowForm(false)}>
          <h3 style={{ color: "var(--text)", marginTop: 0 }}>Create Skill</h3>
          {[{ key: "name", label: "Skill Name" }, { key: "description", label: "Description" }].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 4 }}>{f.label}</label>
              <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--background)", color: "var(--text)" }} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={() => setShowForm(false)} style={{ padding: "10px 20px", border: "1px solid var(--border)", borderRadius: 8, background: "transparent", color: "var(--text)", cursor: "pointer" }}>Cancel</button>
            <button onClick={handleCreate} style={{ padding: "10px 20px", border: "none", borderRadius: 8, background: "var(--accent)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Create</button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Ring Groups Panel ────────────────────────────────────────────────────────
function RingGroupsPanel() {
  const { data: groups, mutate: reload } = useSWR(`/telephony/ring-groups?tenantId=${tenantId}`, fetcher);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", number: "", strategy: "RING_ALL", ringTime: 20 });

  const handleCreate = async () => { await api.post("/telephony/ring-groups", { ...form, tenantId }); reload(); setShowForm(false); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ color: "var(--text)", margin: 0 }}>Ring Groups</h3>
        <button onClick={() => setShowForm(true)} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 600 }}>+ New Group</button>
      </div>
      <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
        <DataTable columns={[
          { key: "name", label: "Name" },
          { key: "number", label: "Number" },
          { key: "strategy", label: "Strategy", render: v => <Badge>{v?.replace(/_/g, " ")}</Badge> },
          { key: "ringTime", label: "Ring Time (s)" },
          { key: "_count", label: "Members", render: v => v?.members ?? 0 },
          { key: "isActive", label: "Status", render: v => <Badge color={v ? "#22c55e" : "#ef4444"}>{v ? "Active" : "Off"}</Badge> },
        ]} data={groups || []} />
      </div>
      {showForm && (
        <ModalOverlay onClose={() => setShowForm(false)}>
          <h3 style={{ color: "var(--text)", marginTop: 0 }}>Create Ring Group</h3>
          {[{ key: "name", label: "Name" }, { key: "number", label: "Group Number" }].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 4 }}>{f.label}</label>
              <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--background)", color: "var(--text)" }} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={() => setShowForm(false)} style={{ padding: "10px 20px", border: "1px solid var(--border)", borderRadius: 8, background: "transparent", color: "var(--text)", cursor: "pointer" }}>Cancel</button>
            <button onClick={handleCreate} style={{ padding: "10px 20px", border: "none", borderRadius: 8, background: "var(--accent)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Create</button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Time Conditions Panel ────────────────────────────────────────────────────
function TimeConditionsPanel() {
  const { data: conditions, mutate: reload } = useSWR(`/telephony/time-conditions?tenantId=${tenantId}`, fetcher);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ color: "var(--text)", margin: 0 }}>Time Conditions</h3>
      </div>
      <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
        <DataTable columns={[
          { key: "name", label: "Name" },
          { key: "matchAction", label: "Match Action", render: v => <Badge color="#22c55e">{v}</Badge> },
          { key: "matchTarget", label: "Match Target" },
          { key: "noMatchAction", label: "No-Match Action", render: v => <Badge color="#ef4444">{v}</Badge> },
          { key: "isActive", label: "Active", render: v => v ? "✅" : "❌" },
        ]} data={conditions || []} />
      </div>
    </div>
  );
}

// ── CDR Panel ────────────────────────────────────────────────────────────────
function CdrPanel() {
  const { data: cdrStats } = useSWR(`/telephony/cdr/stats?tenantId=${tenantId}`, fetcher);
  const { data: cdrData } = useSWR(`/telephony/cdr?tenantId=${tenantId}&limit=50`, fetcher);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Calls" value={cdrStats?.totalCalls ?? 0} icon="📞" />
        <StatCard label="Answered" value={cdrStats?.answered ?? 0} icon="✅" color="#22c55e" />
        <StatCard label="No Answer" value={cdrStats?.noAnswer ?? 0} icon="📵" color="#f59e0b" />
        <StatCard label="Answer Rate" value={`${cdrStats?.answerRate ?? 0}%`} icon="📊" color="#3b82f6" />
        <StatCard label="Avg Duration" value={`${cdrStats?.avgDuration ?? 0}s`} icon="⏱️" color="#8b5cf6" />
      </div>
      <h3 style={{ color: "var(--text)", marginBottom: 16 }}>Call Detail Records</h3>
      <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
        <DataTable columns={[
          { key: "startTime", label: "Time", render: v => v ? new Date(v).toLocaleString() : "—" },
          { key: "src", label: "Source" },
          { key: "dst", label: "Destination" },
          { key: "direction", label: "Direction", render: v => <Badge color={v === "OUTBOUND" ? "#3b82f6" : "#22c55e"}>{v}</Badge> },
          { key: "disposition", label: "Disposition", render: v => <Badge color={v === "ANSWERED" ? "#22c55e" : "#ef4444"}>{v || "—"}</Badge> },
          { key: "duration", label: "Duration", render: v => `${Math.floor((v || 0) / 60)}m ${(v || 0) % 60}s` },
          { key: "recordingUrl", label: "Recording", render: v => v ? "🎵" : "—" },
        ]} data={cdrData?.records || []} />
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function TelephonyPage() {
  const [activeTab, setActiveTab] = useState("extensions");

  return (
    <div style={{ padding: "24px 32px", minHeight: "100vh" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--text)", fontSize: 28, fontWeight: 700, margin: 0 }}>📞 Telephony Engine</h1>
        <p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>Manage extensions, trunks, queues, IVR, skills, and call records</p>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 18px", borderRadius: 10, border: activeTab === tab.id ? "2px solid var(--accent)" : "1px solid var(--border)",
              background: activeTab === tab.id ? "var(--accent)11" : "var(--surface)", color: activeTab === tab.id ? "var(--accent)" : "var(--text-secondary)",
              cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s",
            }}>
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "extensions" && <ExtensionsPanel />}
      {activeTab === "trunks" && <TrunksPanel />}
      {activeTab === "queues" && <QueuesPanel />}
      {activeTab === "ivr" && <IvrPanel />}
      {activeTab === "skills" && <SkillsPanel />}
      {activeTab === "ring-groups" && <RingGroupsPanel />}
      {activeTab === "time-conditions" && <TimeConditionsPanel />}
      {activeTab === "cdr" && <CdrPanel />}
    </div>
  );
}
