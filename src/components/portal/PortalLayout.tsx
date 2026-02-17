import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { cn } from "@/lib/utils";
import {
  Shield, LogOut, LayoutDashboard, FileText, Users, Send,
  FolderOpen, Menu, X, ChevronRight, MessageSquare,
  Building2, TrendingUp, Wrench, GraduationCap, Megaphone, Calendar, Newspaper,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "./NotificationBell";

const advisorNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/portal/advisor/dashboard" },
  { label: "Clients", icon: Users, href: "/portal/advisor/clients" },
  { label: "Policies", icon: FileText, href: "/portal/advisor/policies" },
  { label: "Carriers", icon: Building2, href: "/portal/advisor/carriers" },
  { label: "News", icon: Newspaper, href: "/portal/advisor/news" },
  { label: "Performance", icon: TrendingUp, href: "/portal/advisor/performance" },
  { label: "Tools", icon: Wrench, href: "/portal/advisor/tools" },
  { label: "Training", icon: GraduationCap, href: "/portal/advisor/training" },
  { label: "Marketing", icon: Megaphone, href: "/portal/advisor/marketing" },
  { label: "Schedule", icon: Calendar, href: "/portal/advisor/schedule" },
  { label: "Compliance", icon: Shield, href: "/portal/advisor/compliance" },
  { label: "Documents", icon: FolderOpen, href: "/portal/advisor/documents" },
  { label: "Invite Client", icon: Send, href: "/portal/advisor/invite" },
  { label: "Messages", icon: MessageSquare, href: "/portal/advisor/messages" },
  { label: "Settings", icon: Settings, href: "/portal/advisor/settings" },
];

const clientNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/portal/client/dashboard" },
  { label: "My Policies", icon: FileText, href: "/portal/client/policies" },
  { label: "Documents", icon: FolderOpen, href: "/portal/client/documents" },
  { label: "Messages", icon: MessageSquare, href: "/portal/client/messages" },
];

export function PortalLayout() {
  const { portalUser, signOut } = usePortalAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdvisor = portalUser?.role === "advisor" || portalUser?.role === "admin";
  const isAdmin = portalUser?.role === "admin";
  const baseNav = isAdvisor ? advisorNav : clientNav;
  const navItems = isAdmin
    ? [...baseNav, { label: "Admin Panel", icon: Settings, href: "/portal/admin/agents" }]
    : baseNav;

  const handleSignOut = async () => {
    await signOut();
    navigate("/portal/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="h-16 border-b border-border flex items-center justify-between px-5">
          <Link to={isAdvisor ? "/portal/advisor/dashboard" : "/portal/client/dashboard"} className="flex items-center gap-2.5">
            <img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Everence Wealth" className="h-8 w-auto" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg text-foreground font-serif leading-none">Everence</span>
              <span className="text-[10px] font-light tracking-[0.2em] uppercase text-muted-foreground">Wealth</span>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
                {active && <ChevronRight className="h-3 w-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User / Sign out */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {portalUser?.first_name?.[0]}{portalUser?.last_name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {portalUser?.first_name} {portalUser?.last_name}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{portalUser?.role}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="h-16 border-b border-border bg-card flex items-center px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-3 flex items-center gap-2 flex-1">
            <img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Everence Wealth" className="h-6 w-auto" />
            <span className="font-semibold text-foreground font-serif">Everence <span className="text-[9px] font-light tracking-[0.2em] uppercase text-muted-foreground">Wealth</span></span>
          </div>
          <NotificationBell />
        </header>

        {/* Desktop top bar */}
        <header className="hidden lg:flex h-16 border-b border-border bg-card items-center justify-end px-8">
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              {portalUser?.first_name?.[0]}{portalUser?.last_name?.[0]}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
