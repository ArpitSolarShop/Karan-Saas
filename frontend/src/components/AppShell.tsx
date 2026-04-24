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
  Headphones, Package, Gauge, BrainCircuit, Mail, Focus
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
      { href: "/contacts", label: "Contacts", icon: UserCircle2, desc: "Qualified people" },
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

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { activeCall } = useCallStore();
  const [showWrapUp, setShowWrapUp] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  const primaryColor = tenantSettings.primaryColor || "#4F46E5"; // Default indigo
  const brandLogo = tenantSettings.brandLogo;

  return (
    <div className="h-screen flex overflow-hidden bg-background font-sans text-foreground selection:bg-primary selection:text-white">
      <style jsx global>{`
        :root {
          --primary: ${primaryColor};
        }
      `}</style>
      <RealtimeStateMount />
      
      {/* Global floating components */}
      <InboundCallPopup />
      {showWrapUp && <WrapUpTimer onComplete={() => setShowWrapUp(false)} onSkip={() => setShowWrapUp(false)} />}

      {/* NavigationDrawer Shell (from Stitch) */}
      <aside className="w-64 border-r border-border bg-surface flex-col p-4 gap-y-1 hidden md:flex shrink-0">
        <div className="mb-6 px-3 pt-4 flex items-center gap-2">
          {brandLogo ? (
            <img src={brandLogo} alt="Logo" className="h-6 object-contain" />
          ) : (
            <Focus className="h-6 w-6 text-primary" />
          )}
          <span className="text-sm font-black uppercase tracking-[0.05em] text-foreground">
            {tenantSettings.brandName || "KARAN SAAS"}
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
          <div className="space-y-1">
            <div className="mb-2 px-3">
              <span className="text-[0.65rem] font-bold tracking-[0.1em] text-muted-foreground uppercase">MAIN NAVIGATION</span>
            </div>
            <Link 
              href="/"
              className={cn("flex items-center gap-3 p-2 rounded-md tracking-[-0.01em] text-[0.75rem] transition-all", 
                pathname === "/" ? "bg-surface-2 text-primary shadow-sm font-semibold border border-border/50" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground font-medium"
              )}
            >
              <LayoutDashboard size={16} />
              <span>Overview</span>
            </Link>
          </div>

          {NAV_GROUPS.map(group => (
            <div key={group.id} className="space-y-1">
              <div className="mb-2 px-3">
                <span className="text-[0.65rem] font-bold tracking-[0.1em] text-muted-foreground uppercase">{group.label}</span>
              </div>
              {group.items.map(item => {
                const isActive = item.href === pathname || (item.href !== "/" && pathname?.startsWith(item.href));
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={cn("flex items-center gap-3 p-2 rounded-md tracking-[-0.01em] text-[0.75rem] transition-all", 
                      isActive ? "bg-surface-2 text-primary shadow-sm font-semibold border border-border/50" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground font-medium"
                    )}
                  >
                    <item.icon size={16} className={isActive ? "text-primary" : ""} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-border/50 space-y-1">
           {SETTINGS_LINKS.map(s => {
             const isActive = pathname?.startsWith(s.href);
             return (
               <Link 
                  key={s.href} 
                  href={s.href}
                  className={cn("flex items-center gap-3 p-2 rounded-md tracking-[-0.01em] text-[0.75rem] transition-all", 
                    isActive ? "bg-surface-2 text-primary shadow-sm font-semibold border border-border/50" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground font-medium"
                  )}
                >
                  <Settings size={16} />
                  <span>{s.label}</span>
               </Link>
             )
           })}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Active Call Bar */}
        <ActiveCallBar />

        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-border bg-surface/50 backdrop-blur-xl px-4 md:px-8 py-3 shrink-0 z-40">
          <div className="flex items-center gap-4 text-sm font-semibold tracking-[-0.02em] md:hidden">
            <span className="text-foreground font-black uppercase">KARAN SAAS</span>
          </div>
          
          <div className="hidden md:flex items-center gap-4 text-sm font-semibold tracking-[-0.02em]">
            <span className="text-muted-foreground font-normal">Workspace /</span>
            <span className="text-primary border-b-2 border-primary pb-1 capitalize">
              {pathname === "/" ? "Dashboard" : pathname?.split('/')[1]?.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <GlobalSearch />
            <NotificationsBell recipientId={user?.id} />

            <div className="flex items-center gap-3 md:ml-2 md:border-l md:border-border/50 md:pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-[0.75rem] font-bold text-foreground">{user?.firstName}</p>
                <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">{user?.role}</p>
              </div>
              <button 
                onClick={logout} 
                title="Sign out"
                className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-[0.65rem] font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                {user?.firstName?.[0]?.toUpperCase() ?? "U"}
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-surface-2 hover:text-foreground transition">
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-surface px-4 py-3 space-y-4 max-h-[70vh] overflow-y-auto">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition",
                pathname === "/" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
              )}
            >
              <LayoutDashboard size={13} /> Dashboard
            </Link>
            
            {NAV_GROUPS.map(group => (
              <div key={group.id}>
                <div className="flex items-center gap-2 px-3 py-1">
                  <group.icon size={10} className={cn("text-primary")} />
                  <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] text-primary")}>{group.label}</span>
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
                          : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
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

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
