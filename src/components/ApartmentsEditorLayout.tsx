import { ReactNode, useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FileText, Building2, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
const logo = "https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png";

const navItems = [
  { name: "Page Content", href: "/apartments/dashboard/content", icon: FileText },
  { name: "Properties", href: "/apartments/dashboard/properties", icon: Building2 },
];

export const ApartmentsEditorLayout = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email || "");
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/apartments/login");
  };

  const NavLinks = () => (
    <div className="space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`
          }
        >
          <item.icon className="h-4 w-4" />
          <span>{item.name}</span>
        </NavLink>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-card">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <img src={logo} alt="Del Sol Prime Homes" className="h-14 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]" />
          <ThemeToggle />
        </div>
        <nav className="flex-1 p-4">
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Apartments</p>
          <NavLinks />
        </nav>
        <div className="border-t p-4 space-y-2">
          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile */}
      <div className="flex-1 flex flex-col">
        <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-4 lg:hidden">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><Menu className="h-6 w-6" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-16 items-center px-6 border-b justify-center">
                  <img src={logo} alt="Del Sol Prime Homes" className="h-14 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]" />
                </div>
                <nav className="p-4">
                  <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Apartments</p>
                  <NavLinks />
                </nav>
                <div className="border-t p-4 space-y-2">
                  <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                  <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <img src={logo} alt="Del Sol Prime Homes" className="h-14 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]" />
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
