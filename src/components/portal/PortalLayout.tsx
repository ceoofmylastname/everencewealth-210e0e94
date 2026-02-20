import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { cn } from "@/lib/utils";
import {
  Shield, LogOut, LayoutDashboard, FileText, Users, Send,
  FolderOpen, Menu, X, ChevronRight, MessageSquare,
  Building2, TrendingUp, Wrench, GraduationCap, Megaphone, Calendar, Newspaper,
  Settings, ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "./NotificationBell";

const BRAND_GREEN = "#1A4D3E";
const BRAND_GREEN_LIGHT = "#F0F5F3";

const advisorNavGroups = [
  {
    label: "Portal",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/portal/advisor/dashboard" },
      { label: "Clients", icon: Users, href: "/portal/advisor/clients" },
      { label: "Policies", icon: FileText, href: "/portal/advisor/policies" },
      { label: "CNA", icon: ClipboardList, href: "/portal/advisor/cna" },
      { label: "Messages", icon: MessageSquare, href: "/portal/advisor/messages" },
    ],
  },
  {
    label: "Market",
    items: [
      { label: "Carriers", icon: Building2, href: "/portal/advisor/carriers" },
      { label: "News", icon: Newspaper, href: "/portal/advisor/news" },
      { label: "Performance", icon: TrendingUp, href: "/portal/advisor/performance" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Tools", icon: Wrench, href: "/portal/advisor/tools" },
      { label: "Training", icon: GraduationCap, href: "/portal/advisor/training" },
      { label: "Marketing", icon: Megaphone, href: "/portal/advisor/marketing" },
      { label: "Schedule", icon: Calendar, href: "/portal/advisor/schedule" },
    ],
  },
  {
    label: "Compliance",
    items: [
      { label: "Compliance", icon: Shield, href: "/portal/advisor/compliance" },
      { label: "Documents", icon: FolderOpen, href: "/portal/advisor/documents" },
      { label: "Invite Client", icon: Send, href: "/portal/advisor/invite" },
      { label: "Settings", icon: Settings, href: "/portal/advisor/settings" },
    ],
  },
];

const clientNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/portal/client/dashboard" },
  { label: "My Policies", icon: FileText, href: "/portal/client/policies" },
  { label: "Documents", icon: FolderOpen, href: "/portal/client/documents" },
  { label: "Messages", icon: MessageSquare, href: "/portal/client/messages" },
];

function NavItem({ item, active, onClick }: { item: { label: string; icon: React.ElementType; href: string }; active: boolean; onClick?: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative group"
      style={active ? {
        background: BRAND_GREEN_LIGHT,
        color: BRAND_GREEN,
        borderLeft: `3px solid ${BRAND_GREEN}`,
        paddingLeft: "9px",
      } : {
        color: "#6B7280",
        borderLeft: "3px solid transparent",
        paddingLeft: "9px",
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = "#F9FAFB";
          (e.currentTarget as HTMLElement).style.color = "#111827";
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.color = "#6B7280";
        }
      }}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
      {active && <ChevronRight className="h-3 w-3 ml-auto" style={{ color: BRAND_GREEN }} />}
    </Link>
  );
}

export function PortalLayout() {
  const { portalUser, signOut } = usePortalAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdvisor = portalUser?.role === "advisor" || portalUser?.role === "admin";
  const isAdmin = portalUser?.role === "admin";

  const handleSignOut = async () => {
    await signOut();
    navigate("/portal/login", { replace: true });
  };

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
        <Link
          to={isAdvisor ? "/portal/advisor/dashboard" : "/portal/client/dashboard"}
          className="flex items-center gap-2.5"
        >
          <img
            src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png"
            alt="Everence Wealth"
            className="h-8 w-auto"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-lg text-gray-900 font-serif leading-none">Everence</span>
            <span className="text-[10px] font-light tracking-[0.2em] uppercase" style={{ color: "#C9A84C" }}>
              Wealth
            </span>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-gray-400 hover:text-gray-700"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-4">
        {isAdvisor ? (
          advisorNavGroups.map((group) => {
            const groupItems = isAdmin && group.label === "Compliance"
              ? [...group.items, { label: "Admin Panel", icon: Settings, href: "/portal/admin/agents" }]
              : group.items;
            return (
              <div key={group.label}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-1.5">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {groupItems.map((item) => (
                    <NavItem
                      key={item.href}
                      item={item}
                      active={isActive(item.href)}
                      onClick={() => setMobileOpen(false)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="space-y-0.5">
            {clientNav.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                active={isActive(item.href)}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 mb-3">
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
            style={{ background: BRAND_GREEN }}
          >
            {portalUser?.first_name?.[0]}{portalUser?.last_name?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {portalUser?.first_name} {portalUser?.last_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">{portalUser?.role}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="h-14 flex items-center px-4 lg:hidden bg-white border-b border-gray-200">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-900"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-3 flex items-center gap-2 flex-1">
            <img
              src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png"
              alt="Everence Wealth"
              className="h-6 w-auto"
            />
            <span className="font-semibold text-gray-900 font-serif text-sm">Everence</span>
          </div>
          <NotificationBell />
        </header>

        {/* Desktop top bar */}
        <header className="hidden lg:flex h-14 items-center justify-end px-8 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: BRAND_GREEN }}
            >
              {portalUser?.first_name?.[0]}{portalUser?.last_name?.[0]}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 pb-[env(safe-area-inset-bottom)]">
          <div className="p-3 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
