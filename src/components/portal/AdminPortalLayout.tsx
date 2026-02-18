import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { cn } from "@/lib/utils";
import {
  LogOut, Users, Menu, X, ChevronRight,
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
    <div className="min-h-screen bg-gray-50 flex">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo area */}
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-5">
          <Link to="/portal/admin/agents" className="flex items-center gap-2">
            <img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Everence Wealth" className="h-8 w-auto" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg text-gray-900 font-serif leading-none">Everence</span>
              <span className="text-[10px] font-light tracking-[0.2em] uppercase text-gray-400">Wealth</span>
            </div>
            <span className="ml-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
              style={{
                background: "hsla(51,78%,65%,0.15)",
                color: "#8B6914",
                borderColor: "hsla(51,78%,65%,0.4)",
              }}>
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Button variant="ghost" size="icon" className="lg:hidden text-gray-500 hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
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
                    ? "bg-[#F0F5F3] text-[#1A4D3E]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
                style={active ? { borderLeft: "3px solid #1A4D3E", paddingLeft: "calc(0.75rem - 3px)" } : { borderLeft: "3px solid transparent", paddingLeft: "calc(0.75rem - 3px)" }}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-[#1A4D3E]" : "text-gray-400")} />
                {item.label}
                {active && <ChevronRight className="h-3 w-3 ml-auto text-[#1A4D3E]" />}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: "#1A4D3E" }}>
                {portalUser?.first_name?.[0]}{portalUser?.last_name?.[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {portalUser?.first_name} {portalUser?.last_name}
                </p>
                <p className="text-xs text-gray-400 capitalize">{portalUser?.role}</p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5 text-gray-600" />
          </Button>
          <div className="ml-3 flex items-center gap-2 flex-1">
            <img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Everence Wealth" className="h-6 w-auto" />
            <span className="font-semibold text-gray-900 font-serif">Everence <span className="text-[9px] font-light tracking-[0.2em] uppercase text-gray-400">Wealth</span></span>
          </div>
          <NotificationBell />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
