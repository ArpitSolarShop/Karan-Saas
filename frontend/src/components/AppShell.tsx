"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRealtimeState } from "@/hooks/useRealtimeState";
import { useCallStore } from "@/stores/useCallStore";
import { NotificationsBell } from "@/components/NotificationsBell";
import { InboundCallPopup } from "@/components/InboundCallPopup";
import { WrapUpTimer } from "@/components/WrapUpTimer";
import { 
  Users, Briefcase, Building2, HardDrive, 
  Settings, LogOut, ChevronLeft, ChevronRight,
  LayoutDashboard, Box, ScrollText, KanbanSquare, Zap, Target, ArrowRightLeft, MapPin, Search, Plus, Calendar as CalendarIcon, UserCircle2, Car, Database, FormInput, ShieldAlert, Workflow,
  PhoneOff, Mic, MicOff, Megaphone, BarChart2,
  ClipboardList, Shield, MessageSquare, ShieldCheck,
  CheckSquare, ShieldOff, FileText, BookOpen, ChevronDown, Menu, X, Table, TrendingUp,
  Headphones, Package, Gauge, BrainCircuit, Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "@/components/GlobalSearch";

const BYPASS_PATHS = ["/login", "/unauthorized"];

// ── Grouped Navigation ──────────────────────────────────────────────────────
interface NavGroup {
  id: string;
  label: string;
  icon: any;
  color: string;
  items: { href: string; label: string; icon: any; desc?: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "core",
    label: "CRM",
    icon: Users,
    color: "text-indigo-400",
    items: [
      { href: "/leads", label: "Leads", icon: Users, desc: "Contact registry" },
      { href: "/deals", label: "Deals", icon: Briefcase, desc: "Pipeline stages" },
      { href: "/companies", label: "Companies", icon: Building2, desc: "Accounts" },
      { href: "/tasks", label: "Tasks", icon: CheckSquare, desc: "To-do tracking" },
      { href: "/calendar", label: "Calendar", icon: CalendarIcon, desc: "Schedule" },
      { href: "/inbox", label: "Inbox", icon: MessageSquare, desc: "Omnichannel" },
    ],
  },
  {
    id: "telephony",
    label: "Telephony",
    icon: Headphones,
    color: "text-emerald-400",
    items: [
      { href: "/telephony", label: "Telephony", icon: PhoneOff, desc: "Call center" },
      { href: "/campaign-engine", label: "Dialer", icon: Megaphone, desc: "Auto-dial campaigns" },
      { href: "/supervisor", label: "Supervisor", icon: Shield, desc: "Agent monitoring" },
    ],
  },
  {
    id: "ai",
    label: "Intelligence",
    icon: BrainCircuit,
    color: "text-violet-400",
    items: [
      { href: "/analytics/sentiment", label: "AI Sentiment", icon: TrendingUp, desc: "Voice analytics" },
      { href: "/workflows/builder", label: "Automations", icon: Zap, desc: "Workflow builder" },
      { href: "/knowledge", label: "Knowledge", icon: BookOpen, desc: "Knowledge base" },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    icon: Package,
    color: "text-amber-400",
    items: [
      { href: "/products", label: "Products", icon: Box, desc: "Product catalog" },
      { href: "/invoices", label: "Invoices", icon: ScrollText, desc: "Billing" },
      { href: "/projects", label: "Projects", icon: KanbanSquare, desc: "Project mgmt" },
      { href: "/documents", label: "Documents", icon: HardDrive, desc: "File storage" },
    ],
  },
  {
    id: "ops",
    label: "Operations",
    icon: Gauge,
    color: "text-cyan-400",
    items: [
      { href: "/hr", label: "HR & Team", icon: UserCircle2, desc: "Gamification" },
      { href: "/assets", label: "Assets", icon: Car, desc: "Asset tracking" },
      { href: "/approvals", label: "Approvals", icon: ShieldAlert, desc: "Approval flows" },
      { href: "/web-forms", label: "Web Forms", icon: FormInput, desc: "Form builder" },
      { href: "/tickets", label: "Support", icon: MessageSquare, desc: "Ticket system" },
    ],
  },
];

const SETTINGS_LINKS = [
  { href: "/settings", label: "General" },
  { href: "/settings/users", label: "Users" },
  { href: "/settings/dnc", label: "DNC Manager" },
  { href: "/settings/whatsapp", label: "WhatsApp" },
  { href: "/audit-logs", label: "Audit Logs" },
];

// Flat nav links for mobile menu
const ALL_NAV_LINKS = NAV_GROUPS.flatMap(g => g.items);

function RealtimeStateMount() {
  const { user } = useAuth();
  useRealtimeState(user?.id);
  return null;
}

function ActiveCallBar() {
  const { activeCall, endCall, toggleMute } = useCallStore();
  if (!activeCall) return null;
  const mins = String(Math.floor(activeCall.durationSeconds / 60)).padStart(2, "0");
  const secs = String(activeCall.durationSeconds % 60).padStart(2, "0");
  return (
    <div className="bg-primary/10 border-b border-primary/20 px-6 py-2 flex items-center justify-between animate-slideDown">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
        <span className="text-xs font-bold text-primary uppercase tracking-widest">
          Live Call — {activeCall.leadName || activeCall.phone}
        </span>
        <span className="text-xs font-mono text-text-muted">{mins}:{secs}</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={toggleMute} className="p-1.5 rounded-md hover:bg-surface-2 transition">
          {activeCall.isMuted ? <MicOff size={14} className="text-red-400" /> : <Mic size={14} className="text-foreground" />}
        </button>
        <button
          onClick={endCall}
          className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-md text-[10px] font-bold text-red-400 flex items-center gap-1.5 transition"
        >
          <PhoneOff size={12} /> End Call
        </button>
      </div>
    </div>
  );
}

function NavDropdown({ group, pathname }: { group: NavGroup; pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActive = group.items.some(item => 
    item.href === pathname || (item.href !== "/" && pathname?.startsWith(item.href))
  );

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
          isActive
            ? "bg-primary text-white shadow-sm shadow-primary/30"
            : "text-text-muted hover:text-foreground hover:bg-surface-2"
        )}
      >
        <group.icon size={12} className={isActive ? "text-white" : group.color} />
        {group.label}
        <ChevronDown size={8} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-surface border border-border rounded-xl shadow-2xl shadow-black/40 py-2 min-w-[200px] backdrop-blur-xl">
            {/* Group header */}
            <div className="px-4 py-1.5 border-b border-border/50 mb-1">
              <span className={cn("text-[8px] font-black uppercase tracking-[0.25em]", group.color)}>
                {group.label}
              </span>
            </div>

            {group.items.map(item => {
              const isItemActive = item.href === pathname || (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 text-[11px] transition-all group/item mx-1 rounded-lg",
                    isItemActive
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-text-muted hover:text-foreground hover:bg-surface-2"
                  )}
                >
                  <div className={cn(
                    "h-6 w-6 rounded-md flex items-center justify-center shrink-0 transition-colors",
                    isItemActive ? "bg-primary/20" : "bg-surface-2 group-hover/item:bg-surface"
                  )}>
                    <item.icon size={12} className={isItemActive ? "text-primary" : ""} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold truncate">{item.label}</div>
                    {item.desc && (
                      <div className="text-[9px] text-text-muted opacity-60 truncate">{item.desc}</div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { activeCall } = useCallStore();
  const [showWrapUp, setShowWrapUp] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsHover, setSettingsHover] = useState(false);

  const prevCallRef: { current: typeof activeCall } = { current: activeCall };
  const isBypassPath = BYPASS_PATHS.some((p) => pathname?.startsWith(p));

  // Show wrap-up timer when call ends
  useEffect(() => {
    if (!activeCall && prevCallRef.current) {
      setShowWrapUp(true);
    }
    prevCallRef.current = activeCall;
  }, [activeCall]);

  // Handle auth redirection
  useEffect(() => {
    if (!isBypassPath && !isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isBypassPath, isLoading, isAuthenticated, router]);

  if (isBypassPath) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Branded styles for White-labelling
  const tenantSettings = (user as any)?.tenant?.settings || {};
  const primaryColor = tenantSettings.primaryColor || "#6366f1"; // Default indigo-500
  const brandLogo = tenantSettings.brandLogo;

  return (
    <main className="h-screen flex flex-col overflow-hidden">
      <style jsx global>{`
        :root {
          --primary: ${primaryColor};
        }
      `}</style>
      <RealtimeStateMount />

      {/* Global floating components */}
      <InboundCallPopup />
      {showWrapUp && <WrapUpTimer onComplete={() => setShowWrapUp(false)} onSkip={() => setShowWrapUp(false)} />}

      {/* Header */}
      <header className="border-b border-border bg-surface/90 backdrop-blur-xl sticky top-0 z-50 shrink-0">
        <div className="px-4 md:px-6 py-2.5 flex justify-between items-center">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                {brandLogo ? <img src={brandLogo} alt="Logo" className="w-5 h-5 object-contain" /> : <span className="text-white text-[10px] font-black">α</span>}
              </div>
              <h1 className="text-sm font-black tracking-tight uppercase text-foreground hidden sm:block">
                {tenantSettings.brandName || "Project Alpha"} <span className="text-primary">{tenantSettings.brandSuffix || "CRM"}</span>
              </h1>
            </Link>
          </div>

          {/* Navigation — grouped mega-menu dropdowns */}
          <nav className="hidden lg:flex items-center gap-1 bg-surface-2/50 p-1 rounded-xl border border-border/50 relative z-[100]">
            {/* Dashboard direct link */}
            <Link
              href="/"
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                pathname === "/"
                  ? "bg-primary text-white shadow-sm shadow-primary/30"
                  : "text-text-muted hover:text-foreground hover:bg-surface-2"
              )}
            >
              <LayoutDashboard size={12} />
              Dashboard
            </Link>

            {/* Grouped dropdowns */}
            {NAV_GROUPS.map(group => (
              <NavDropdown key={group.id} group={group} pathname={pathname} />
            ))}

            {/* Settings with submenu */}
            <div className="relative" onMouseEnter={() => setSettingsHover(true)} onMouseLeave={() => setSettingsHover(false)}>
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  pathname?.startsWith("/settings") || pathname?.startsWith("/audit-logs")
                    ? "bg-primary text-white shadow-sm shadow-primary/30"
                    : "text-text-muted hover:text-foreground hover:bg-surface-2"
                )}
              >
                <Settings size={12} />
                Settings
                <ChevronDown size={8} />
              </Link>
              {settingsHover && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-surface border border-border rounded-xl shadow-2xl shadow-black/40 py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-1.5 border-b border-border/50 mb-1">
                    <span className="text-[8px] font-black uppercase tracking-[0.25em] text-text-muted">Config</span>
                  </div>
                  {SETTINGS_LINKS.map(s => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="flex items-center gap-2 px-4 py-2 text-[11px] text-text-muted hover:text-foreground hover:bg-surface-2 transition mx-1 rounded-lg"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <GlobalSearch />
            <NotificationsBell recipientId={user?.id} />

            {/* User info */}
            <div className="flex items-center gap-2 group relative">
              <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center cursor-pointer">
                <span className="text-primary text-[10px] font-black">
                  {user?.firstName?.[0]?.toUpperCase() ?? "U"}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold">{user?.firstName}</p>
                <p className="text-[9px] text-text-muted uppercase tracking-widest">{user?.role}</p>
              </div>
              <button onClick={logout} title="Sign out" className="ml-1 p-1.5 rounded-md text-text-muted hover:text-red-400 hover:bg-red-500/10 transition">
                <LogOut size={13} />
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg border border-border text-text-muted hover:text-foreground transition">
              {mobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-surface px-4 py-3 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Dashboard */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition",
                pathname === "/" ? "bg-primary text-white" : "text-text-muted hover:text-foreground hover:bg-surface-2"
              )}
            >
              <LayoutDashboard size={13} /> Dashboard
            </Link>
            
            {NAV_GROUPS.map(group => (
              <div key={group.id}>
                <div className="flex items-center gap-2 px-3 py-1">
                  <group.icon size={10} className={group.color} />
                  <span className={cn("text-[9px] font-black uppercase tracking-[0.2em]", group.color)}>{group.label}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {group.items.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition",
                        pathname === href || (href !== "/" && pathname?.startsWith(href))
                          ? "bg-primary text-white"
                          : "text-text-muted hover:text-foreground hover:bg-surface-2"
                      )}
                    >
                      <Icon size={13} /> {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Active call banner */}
      <ActiveCallBar />

      {/* Page Content */}
      <div className="flex-grow relative overflow-auto">{children}</div>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-2.5 bg-surface/50 shrink-0">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <p className="text-[9px] text-text-muted uppercase tracking-[0.3em] opacity-40 italic">
            © 2026 Project Alpha CRM // Silicon Valley Night
          </p>
          <div className="flex gap-6 text-[9px] uppercase tracking-[0.2em] text-text-muted opacity-40">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
