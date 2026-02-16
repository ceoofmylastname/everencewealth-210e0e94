import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { cn } from "@/lib/utils";
import {
  Shield, LogOut, LayoutDashboard, FileText, Users, Send,
  FolderOpen, Menu, X, ChevronRight, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "./NotificationBell";

const advisorNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/portal/advisor/dashboard" },
  { label: "Clients", icon: Users, href: "/portal/advisor/clients" },
  { label: "Policies", icon: FileText, href: "/portal/advisor/policies" },
  { label: "Documents", icon: FolderOpen, href: "/portal/advisor/documents" },
  { label: "Invite Client", icon: Send, href: "/portal/advisor/invite" },
  { label: "Messages", icon: MessageSquare, href: "/portal/advisor/messages" },
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
  const navItems = isAdvisor ? advisorNav : clientNav;

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
          <Link to={isAdvisor ? "/portal/advisor/dashboard" : "/portal/client/dashboard"} className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              Everence
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
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
          <span className="ml-3 font-semibold text-foreground flex-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            {isAdvisor ? "Advisor Portal" : "Client Portal"}
          </span>
          <NotificationBell />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
