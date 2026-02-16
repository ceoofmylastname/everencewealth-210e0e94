import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { cn } from "@/lib/utils";
import {
  Shield, LogOut, Users, Menu, X, ChevronRight,
  LayoutDashboard, UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "./NotificationBell";

const adminNav = [
  { label: "Agents", icon: UserCog, href: "/portal/admin/agents" },
  { label: "Clients", icon: Users, href: "/portal/admin/clients" },
  { label: "Advisor Dashboard", icon: LayoutDashboard, href: "/portal/advisor/dashboard" },
];

export function AdminPortalLayout() {
  const { portalUser, signOut } = usePortalAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/portal/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#0F2922] flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-5">
          <Link to="/portal/admin/agents" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-white" />
            <span className="font-bold text-lg text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Everence
            </span>
            <span className="ml-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.5 rounded">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10" onClick={() => setMobileOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {adminNav.map((item) => {
            const active = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
                {active && <ChevronRight className="h-3 w-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
              {portalUser?.first_name?.[0]}{portalUser?.last_name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {portalUser?.first_name} {portalUser?.last_name}
              </p>
              <p className="text-xs text-white/60 capitalize">{portalUser?.role}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-white/60 hover:text-white hover:bg-white/10" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card flex items-center px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-3 font-semibold text-foreground flex-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Admin Panel
          </span>
          <NotificationBell />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" style={{ backgroundColor: "#F0F2F1" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
