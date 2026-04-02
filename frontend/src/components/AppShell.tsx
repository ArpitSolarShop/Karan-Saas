"use client";

import { useEffect, useState } from "react";
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
  ClipboardList, Shield, MessageSquare,
  CheckSquare, ShieldOff, FileText, BookOpen, ChevronDown, Menu, X, Table
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "@/components/GlobalSearch";

const BYPASS_PATHS = ["/login", "/unauthorized"];

const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/deals", label: "Deals", icon: Briefcase },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/documents", label: "Documents", icon: HardDrive },
  { href: "/workflows", label: "Automations", icon: Zap },
  { href: "/projects", label: "Projects", icon: KanbanSquare },
  { href: "/products", label: "Products", icon: Box },
  { href: "/invoices", label: "Invoices", icon: ScrollText },
  { href: "/calendar", label: "Calendar", icon: CalendarIcon },
  { href: "/hr", label: "HR & Gamification", icon: UserCircle2 },
  { href: "/assets", label: "Assets & Vehicles", icon: Car },
  { href: "/custom-objects", label: "Low Code Database", icon: Database },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/approvals", label: "Approvals", icon: ShieldAlert },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/web-forms", label: "Web Forms", icon: FormInput },
  { href: "/marketing", label: "Marketing", icon: Zap },
  { href: "/chains", label: "Macro Chains", icon: Workflow },
  { href: "/workbooks", label: "Sheets", icon: Table },
  { href: "/tickets", label: "Support", icon: MessageSquare },
  { href: "/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/supervisor", label: "Supervisor", icon: Shield },
  { href: "/settings", label: "Settings", icon: Settings },
];

const SETTINGS_LINKS = [
  { href: "/settings", label: "General" },
  { href: "/settings/users", label: "Users" },
  { href: "/settings/dnc", label: "DNC Manager" },
  { href: "/settings/whatsapp", label: "WhatsApp" },
  { href: "/settings/audit-logs", label: "Audit Logs" },
];

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
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              {brandLogo ? <img src={brandLogo} alt="Logo" className="w-5 h-5 object-contain" /> : <span className="text-white text-[10px] font-black">α</span>}
            </div>
            <h1 className="text-sm font-black tracking-tight uppercase text-foreground hidden sm:block">
              {tenantSettings.brandName || "Project Alpha"} <span className="text-primary">{tenantSettings.brandSuffix || "CRM"}</span>
            </h1>
          </div>

          {/* Navigation — desktop */}
          <nav className="hidden lg:flex items-center gap-0.5 bg-surface-2/50 p-1 rounded-lg border border-border/50 max-w-3xl flex-wrap">
            {NAV_LINKS.map(({ href, label }) => {
              const isSettings = href === "/settings";
              if (isSettings) {
                return (
                  <div key={href} className="relative" onMouseEnter={() => setSettingsHover(true)} onMouseLeave={() => setSettingsHover(false)}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all",
                        pathname?.startsWith("/settings")
                          ? "bg-primary text-white shadow-sm shadow-primary/30"
                          : "text-text-muted hover:text-foreground hover:bg-surface-2"
                      )}
                    >
                      {label} <ChevronDown size={9} />
                    </Link>
                    {settingsHover && (
                      <div className="absolute top-full left-0 mt-1 w-36 bg-surface border border-border rounded-xl shadow-xl shadow-black/30 py-1 z-50">
                        {SETTINGS_LINKS.map(s => (
                          <Link key={s.href} href={s.href} className="block px-3 py-2 text-[11px] hover:bg-surface-2 text-text-muted hover:text-foreground transition">
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all",
                    pathname === href || (href !== "/" && pathname?.startsWith(href))
                      ? "bg-primary text-white shadow-sm shadow-primary/30"
                      : "text-text-muted hover:text-foreground hover:bg-surface-2"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <GlobalSearch />
            <NotificationsBell recipientId={user?.id} />
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" title="System Online" />

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
          <div className="lg:hidden border-t border-border bg-surface px-4 py-3 grid grid-cols-2 gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition",
                  pathname === href ? "bg-primary text-white" : "text-text-muted hover:text-foreground hover:bg-surface-2"
                )}
              >
                <Icon size={13} /> {label}
              </Link>
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
