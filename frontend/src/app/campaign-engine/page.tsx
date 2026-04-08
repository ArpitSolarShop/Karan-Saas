"use client";
import { useState } from "react";
import useSWR from "swr";
import api, { fetcher } from "@/lib/api";

const tenantId = typeof window !== "undefined" ? localStorage.getItem("crm_tenantId") || "" : "";

function Badge({ children, color = "#6366f1" }: { children: React.ReactNode; color?: string }) {
  return <span style={{ background: `${color}22`, color, padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{children}</span>;
}

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

// ── DNC Management ───────────────────────────────────────────────────────────
function DncPanel() {
  const { data: dncData, mutate: reload } = useSWR(`/campaigns/dnc?tenantId=${tenantId}`, fetcher);
  const { data: stats } = useSWR(`/campaigns/dnc/stats?tenantId=${tenantId}`, fetcher);
  const [phone, setPhone] = useState(""); const [reason, setReason] = useState("");
  const [checkPhone, setCheckPhone] = useState(""); const [checkResult, setCheckResult] = useState<any>(null);

  const handleAdd = async () => { if (!phone) return; await api.post("/campaigns/dnc", { phone, reason, tenantId, source: "MANUAL" }); reload(); setPhone(""); setReason(""); };
  const handleCheck = async () => { if (!checkPhone) return; const { data } = await api.get(`/campaigns/dnc/check/${checkPhone}?tenantId=${tenantId}`); setCheckResult(data); };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Entries" value={stats?.total ?? 0} icon="🚫" />
        <StatCard label="Active" value={stats?.active ?? 0} icon="⛔" color="#ef4444" />
        <StatCard label="Manual" value={stats?.manual ?? 0} icon="✋" color="#f59e0b" />
        <StatCard label="Imported" value={stats?.imported ?? 0} icon="📥" color="#3b82f6" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <div style={{ background: "var(--surface)", borderRadius: 12, padding: 24, border: "1px solid var(--border)" }}>
          <h4 style={{ color: "var(--text)", margin: "0 0 16px" }}>➕ Add to DNC List</h4>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--background)", color: "var(--text)", marginBottom: 12 }} />
          <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason (optional)" style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--background)", color: "var(--text)", marginBottom: 12 }} />
          <button onClick={handleAdd} style={{ width: "100%", padding: "10px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Add to DNC</button>
        </div>
        <div style={{ background: "var(--surface)", borderRadius: 12, padding: 24, border: "1px solid var(--border)" }}>
          <h4 style={{ color: "var(--text)", margin: "0 0 16px" }}>🔍 Check Number</h4>
          <input value={checkPhone} onChange={e => setCheckPhone(e.target.value)} placeholder="Phone to check" style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--background)", color: "var(--text)", marginBottom: 12 }} />
          <button onClick={handleCheck} style={{ width: "100%", padding: "10px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Check DNC Status</button>
          {checkResult && (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: checkResult.isDnc ? "#ef444422" : "#22c55e22", color: checkResult.isDnc ? "#ef4444" : "#22c55e", fontWeight: 600 }}>
              {checkResult.isDnc ? "⛔ Number is on DNC list" : "✅ Number is NOT on DNC list"}
            </div>
          )}
        </div>
      </div>
      <h4 style={{ color: "var(--text)", marginBottom: 12 }}>DNC Entries</h4>
      <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            {["Phone", "Source", "Reason", "Added", "Status", ""].map(h => <th key={h} style={{ textAlign: "left", padding: "12px 16px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 12, textTransform: "uppercase" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {(dncData?.records || []).map((r: any) => (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "12px 16px", color: "var(--text)" }}>{r.phone}</td>
                <td style={{ padding: "12px 16px" }}><Badge>{r.source}</Badge></td>
                <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{r.reason || "—"}</td>
                <td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: 13 }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: "12px 16px" }}><Badge color={r.isActive ? "#ef4444" : "#6b7280"}>{r.isActive ? "Active" : "Removed"}</Badge></td>
                <td style={{ padding: "12px 16px" }}><button onClick={async () => { await api.delete(`/campaigns/dnc/${r.id}`); reload(); }} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Agent Scripts ────────────────────────────────────────────────────────────
function ScriptsPanel() {
  const { data: scripts, mutate: reload } = useSWR(`/campaigns/scripts?tenantId=${tenantId}`, fetcher);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const handleCreate = async () => {
    await api.post("/campaigns/scripts", {
      ...form, tenantId,
      nodes: [
        { id: "1", type: "greeting", text: "Hello, am I speaking with {{firstName}}?", options: [{ label: "Yes", next: "2" }, { label: "No", next: "end" }] },
        { id: "2", type: "pitch", text: "Great! I'm calling about our special offer...", options: [{ label: "Interested", next: "3" }, { label: "Not Interested", next: "objection" }] },
        { id: "3", type: "close", text: "Excellent! Let me walk you through the details...", options: [] },
        { id: "objection", type: "objection", text: "I understand your concern. May I ask what's holding you back?", options: [{ label: "Continue", next: "3" }, { label: "End", next: "end" }] },
        { id: "end", type: "end", text: "Thank you for your time. Have a great day!", options: [] },
      ],
    });
    reload(); setShowForm(false); setForm({ name: "", description: "" });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ color: "var(--text)", margin: 0 }}>Agent Scripts</h3>
        <button onClick={() => setShowForm(true)} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 600 }}>+ New Script</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {(scripts || []).map((s: any) => (
          <div key={s.id} style={{ background: "var(--surface)", borderRadius: 12, padding: 24, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
              <div>
                <h4 style={{ color: "var(--text)", margin: "0 0 4px" }}>{s.name}</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>{s.description || "No description"}</p>
              </div>
              <Badge color={s.isActive ? "#22c55e" : "#ef4444"}>{s.isActive ? "Active" : "Draft"}</Badge>
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 13, color: "var(--text-secondary)" }}>
              <span>📝 v{s.version}</span>
              <span>🌳 {Array.isArray(s.nodes) ? s.nodes.length : 0} nodes</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={async () => { await api.post(`/campaigns/scripts/${s.id}/duplicate`); reload(); }} style={{ flex: 1, padding: "8px", background: "var(--background)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", cursor: "pointer", fontSize: 13 }}>Duplicate</button>
              <button onClick={async () => { if (confirm("Delete?")) { await api.delete(`/campaigns/scripts/${s.id}`); reload(); } }} style={{ padding: "8px 12px", background: "none", border: "1px solid #ef4444", borderRadius: 8, color: "#ef4444", cursor: "pointer", fontSize: 13 }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={() => setShowForm(false)}>
          <div style={{ background: "var(--surface)", borderRadius: 16, padding: 32, minWidth: 480, border: "1px solid var(--border)" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: "var(--text)", marginTop: 0 }}>Create Agent Script</h3>
            {[{ key: "name", label: "Script Name" }, { key: "description", label: "Description" }].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 4 }}>{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--background)", color: "var(--text)" }} />
              </div>
            ))}
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>A default branching script template will be created with greeting → pitch → objection handling → close nodes.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setShowForm(false)} style={{ padding: "10px 20px", border: "1px solid var(--border)", borderRadius: 8, background: "transparent", color: "var(--text)", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleCreate} style={{ padding: "10px 20px", border: "none", borderRadius: 8, background: "var(--accent)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Dialer Dashboard ─────────────────────────────────────────────────────────
function DialerPanel() {
  const { data: campaigns } = useSWR(`/campaigns?tenantId=${tenantId}`, fetcher);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const { data: progress } = useSWR(selectedCampaign ? `/campaigns/dialer/${selectedCampaign}/progress` : null, fetcher, { refreshInterval: 3000 });
  const { data: config } = useSWR(selectedCampaign ? `/campaigns/dialer/${selectedCampaign}/config` : null, fetcher);

  const handleDialerAction = async (action: string) => {
    if (!selectedCampaign) return;
    await api.post(`/campaigns/dialer/${selectedCampaign}/${action}`);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 8 }}>Select Campaign</label>
        <select value={selectedCampaign || ""} onChange={e => setSelectedCampaign(e.target.value || null)}
          style={{ padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", color: "var(--text)", minWidth: 300 }}>
          <option value="">Choose a campaign...</option>
          {(Array.isArray(campaigns) ? campaigns : []).map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.status})</option>)}
        </select>
      </div>
      {selectedCampaign && progress && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 24 }}>
            <StatCard label="Total Contacts" value={progress.total} icon="👥" />
            <StatCard label="Completed" value={progress.completed} icon="✅" color="#22c55e" />
            <StatCard label="Failed" value={progress.failed} icon="❌" color="#ef4444" />
            <StatCard label="Pending" value={progress.pending} icon="⏳" color="#f59e0b" />
            <StatCard label="Completion" value={`${progress.completionRate}%`} icon="📊" color="#3b82f6" />
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <button onClick={() => handleDialerAction("start")} style={{ padding: "12px 24px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 15 }}>▶️ Start Dialer</button>
            <button onClick={() => handleDialerAction("pause")} style={{ padding: "12px 24px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 15 }}>⏸️ Pause</button>
            <button onClick={() => handleDialerAction("stop")} style={{ padding: "12px 24px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 15 }}>⏹️ Stop</button>
          </div>
          {config && (
            <div style={{ background: "var(--surface)", borderRadius: 12, padding: 24, border: "1px solid var(--border)" }}>
              <h4 style={{ color: "var(--text)", margin: "0 0 16px" }}>Dialer Configuration</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <div><span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Mode</span><div style={{ color: "var(--text)", fontWeight: 600, marginTop: 4 }}>{config.mode}</div></div>
                <div><span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Calls/Agent</span><div style={{ color: "var(--text)", fontWeight: 600, marginTop: 4 }}>{config.callsPerAgent}</div></div>
                <div><span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Drop Rate Limit</span><div style={{ color: "var(--text)", fontWeight: 600, marginTop: 4 }}>{config.dropRateLimit}%</div></div>
                <div><span style={{ color: "var(--text-secondary)", fontSize: 13 }}>AMD</span><div style={{ color: "var(--text)", fontWeight: 600, marginTop: 4 }}>{config.amdEnabled ? "Enabled" : "Disabled"}</div></div>
                <div><span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Max Retries</span><div style={{ color: "var(--text)", fontWeight: 600, marginTop: 4 }}>{config.maxRetries}</div></div>
                <div><span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Pace Algorithm</span><div style={{ color: "var(--text)", fontWeight: 600, marginTop: 4 }}>{config.paceAlgorithm}</div></div>
              </div>
            </div>
          )}
          {/* Progress bar */}
          <div style={{ marginTop: 24 }}>
            <div style={{ height: 24, background: "var(--border)", borderRadius: 12, overflow: "hidden", position: "relative" }}>
              <div style={{ height: "100%", width: `${progress.completionRate}%`, background: "linear-gradient(90deg, #22c55e, #3b82f6)", borderRadius: 12, transition: "width 0.5s" }} />
              <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#fff", fontSize: 12, fontWeight: 700 }}>{progress.completionRate}% Complete</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Contact Management ───────────────────────────────────────────────────────
function ContactsPanel() {
  const { data: campaigns } = useSWR(`/campaigns?tenantId=${tenantId}`, fetcher);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const { data: lists, mutate: reloadLists } = useSWR(selectedCampaign ? `/campaigns/contacts/lists/${selectedCampaign}` : null, fetcher);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const { data: contactsData } = useSWR(selectedList ? `/campaigns/contacts/lists/${selectedList}/contacts` : null, fetcher);
  
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [uploading, setUploading] = useState(false);

  const handleCreateList = async () => {
    if (!selectedCampaign || !form.name) return;
    await api.post("/campaigns/contacts/lists", { ...form, campaignId: selectedCampaign, tenantId });
    reloadLists(); setShowForm(false); setForm({ name: "", description: "" });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedList) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      await api.post(`/campaigns/contacts/lists/${selectedList}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Contacts imported successfully!");
      reloadLists();
    } catch (err) {
      alert("Import failed. Check CSV format.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 8 }}>Campaign</label>
          <select value={selectedCampaign || ""} onChange={e => { setSelectedCampaign(e.target.value || null); setSelectedList(null); }}
            style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", color: "var(--text)" }}>
            <option value="">Select Campaign...</option>
            {(Array.isArray(campaigns) ? campaigns : []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 8 }}>Contact List</label>
          <div style={{ display: "flex", gap: 8 }}>
            <select value={selectedList || ""} onChange={e => setSelectedList(e.target.value || null)}
              style={{ flex: 1, padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", color: "var(--text)" }}>
              <option value="">Select List...</option>
              {(lists || []).map((l: any) => <option key={l.id} value={l.id}>{l.name} ({l._count.contacts})</option>)}
            </select>
            <button onClick={() => setShowForm(true)} disabled={!selectedCampaign} style={{ padding: "0 16px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 18 }}>+</button>
          </div>
        </div>
      </div>

      {selectedList && (
        <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h4 style={{ color: "var(--text)", margin: 0 }}>List Actions</h4>
            <div style={{ display: "flex", gap: 12 }}>
              <input type="file" id="contact-upload" hidden accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
              <button 
                onClick={() => document.getElementById("contact-upload")?.click()}
                disabled={uploading}
                style={{ padding: "10px 20px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
                {uploading ? "⌛ Uploading..." : "📥 Import Contacts (CSV/Excel)"}
              </button>
            </div>
          </div>
          
          <div style={{ height: 1, background: "var(--border)", marginBottom: 24 }} />
          
          <h4 style={{ color: "var(--text)", margin: "0 0 16px" }}>Preview Contacts ({contactsData?.total ?? 0})</h4>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              {["Name", "Phone", "Email", "Company", "Status"].map(h => <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: "var(--text-secondary)", fontSize: 12, textTransform: "uppercase" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {(contactsData?.records || []).map((c: any) => (
                <tr key={c.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 16px", color: "var(--text)" }}>{c.firstName} {c.lastName}</td>
                  <td style={{ padding: "12px 16px", color: "var(--text)" }}>{c.phone}</td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{c.email}</td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{c.company}</td>
                  <td style={{ padding: "12px 16px" }}><Badge>{c.status}</Badge></td>
                </tr>
              ))}
              {(!contactsData?.records || contactsData?.records.length === 0) && (
                <tr><td colSpan={5} style={{ padding: 48, textAlign: "center", color: "var(--text-secondary)" }}>No contacts in this list. Click Import to add some.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={() => setShowForm(false)}>
          <div style={{ background: "var(--surface)", borderRadius: 16, padding: 32, minWidth: 400, border: "1px solid var(--border)" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: "var(--text)", marginTop: 0 }}>New Contact List</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 4 }}>List Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--background)", color: "var(--text)" }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 4 }}>Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--background)", color: "var(--text)" }} />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setShowForm(false)} style={{ padding: "10px 20px", border: "1px solid var(--border)", borderRadius: 8, background: "transparent", color: "var(--text)", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleCreateList} style={{ padding: "10px 20px", border: "none", borderRadius: 8, background: "var(--accent)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Create List</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "dialer", label: "📞 Dialer Control" },
  { id: "contacts", label: "👥 Contacts" },
  { id: "dnc", label: "🚫 DNC List" },
  { id: "scripts", label: "📝 Agent Scripts" },
];

export default function CampaignEnginePage() {
  const [activeTab, setActiveTab] = useState("dialer");

  return (
    <div style={{ padding: "24px 32px", minHeight: "100vh" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--text)", fontSize: 28, fontWeight: 700, margin: 0 }}>🎯 Campaign Engine</h1>
        <p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>Manage dialer operations, DNC compliance, and agent scripts</p>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 18px", borderRadius: 10, border: activeTab === tab.id ? "2px solid var(--accent)" : "1px solid var(--border)",
              background: activeTab === tab.id ? "var(--accent)11" : "var(--surface)", color: activeTab === tab.id ? "var(--accent)" : "var(--text-secondary)",
              cursor: "pointer", fontWeight: 600, fontSize: 13,
            }}>
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "dialer" && <DialerPanel />}
      {activeTab === "contacts" && <ContactsPanel />}
      {activeTab === "dnc" && <DncPanel />}
      {activeTab === "scripts" && <ScriptsPanel />}
    </div>
  );
}
