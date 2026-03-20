"use client";

import { useState, useEffect } from "react";
import { 
  Ticket as TicketIcon, 
  Search, 
  Plus, 
  MessageSquare, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Filter
} from "lucide-react";
import { format } from "date-fns";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "URGENT": return "text-red-400 bg-red-400/10 border-red-400/20";
      case "HIGH": return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      case "MEDIUM": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      default: return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "OPEN": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "PENDING": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "CLOSED": return "text-slate-400 bg-slate-400/10 border-slate-400/20";
      default: return "text-purple-400 bg-purple-400/10 border-purple-400/20";
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject?.toLowerCase().includes(search.toLowerCase()) || 
    t.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-screen bg-background overflow-hidden font-sans">
      {/* Header */}
      <div className="px-8 py-6 border-b border-border bg-surface-2/50 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent tracking-tight">
              Support Tickets
            </h1>
            <p className="text-muted-foreground mt-1">Manage customer issues and support requests</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95">
            <Plus size={18} />
            New Ticket
          </button>
        </div>

        {/* Filters */}
        <div className="mt-8 flex items-center gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search tickets by subject or ID..."
              className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl hover:bg-surface-2 transition-colors text-sm font-medium">
            <Filter size={18} className="text-muted-foreground" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Ticket List */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 custom-scrollbar bg-background/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary shadow-lg shadow-primary/20"></div>
            <p className="text-muted-foreground text-sm animate-pulse">Syncing support queue...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 bg-surface-2 rounded-3xl flex items-center justify-center mb-6 border border-border shadow-inner rotate-3">
              <TicketIcon size={40} className="text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold text-white">No tickets found</h3>
            <p className="text-muted-foreground mt-2 max-w-xs mx-auto text-sm leading-relaxed">
              Your support efforts are looking clean. No active tickets match your search.
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div 
              key={ticket.id}
              className="group relative bg-surface border border-border rounded-2xl p-5 hover:border-primary/50 transition-all cursor-pointer hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-5 flex-1">
                  <div className={`p-4 rounded-2xl border flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${getPriorityColor(ticket.priority)}`}>
                    <AlertCircle size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors truncate">
                        {ticket.subject}
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-muted-foreground bg-surface-2 px-2 py-0.5 rounded border border-border uppercase tracking-wider shrink-0">
                        #{ticket.id.slice(0, 8)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-2 rounded-lg border border-border/50">
                        <MessageSquare size={13} className="text-primary/70" />
                        <span>{ticket._count?.messages || 0} messages</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-2 rounded-lg border border-border/50">
                        <Clock size={13} className="text-primary/70" />
                        <span>Raised {format(new Date(ticket.createdAt), 'MMM d, h:mm a')}</span>
                      </div>
                      {ticket.agent && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-2 rounded-lg border border-border/50">
                           <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] text-primary font-bold">
                             {ticket.agent.firstName[0]}
                           </div>
                           <span>{ticket.agent.firstName} {ticket.agent.lastName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest shadow-sm ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center border border-border group-hover:border-primary/50 group-hover:bg-primary/10 transition-all">
                    <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
