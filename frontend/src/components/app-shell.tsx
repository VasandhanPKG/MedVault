import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  Bell,
  BrainCircuit,
  FileHeart,
  FileText,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  QrCode,
  Settings,
  ShieldPlus,
  Syringe,
  Upload,
  User,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { api, getStoredUser } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/timeline", label: "Health Journey", icon: FileHeart },
  { to: "/records", label: "Medical Records", icon: FileText },
  { to: "/vaccinations", label: "Vaccine Passport", icon: Syringe },
  { to: "/upload", label: "Upload Report", icon: Upload },
  { to: "/analytics", label: "Biomarker Trends", icon: LineChart },
  { to: "/assistant", label: "AI Assistant", icon: BrainCircuit },
  { to: "/risk", label: "Risk Assessment", icon: Activity },
  { to: "/emergency", label: "Smart QR Suite", icon: QrCode },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Brand({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <ShieldPlus className="size-5" />
      </span>
      <span className="text-lg font-extrabold tracking-tight">MedVault</span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent font-semibold text-accent-foreground shadow-xs"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            )}
          >
            <item.icon className={cn("size-4", active ? "text-primary" : "text-muted-foreground")} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description?: string;
}) {
  const [user, setUser] = useState<any>(getStoredUser() || { name: "Patient", email: "" });

  useEffect(() => {
    api.getProfile()
      .then((data) => {
        if (data && data.name) {
          setUser(data);
        }
      })
      .catch(() => {});
  }, []);

  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "PT";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card/60 p-4 lg:flex lg:flex-col lg:justify-between">
        <div className="space-y-6">
          <Brand className="px-2 pt-2" />
          <NavList />
        </div>
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                {initials}
              </span>
              <div className="truncate">
                <p className="truncate text-xs font-semibold">{user.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{user.email || user.bloodGroup || "Patient Vault"}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={() => api.logout()}
              title="Log out"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card/40 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile Navigation Drawer Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-4">
                <Brand className="px-2 pb-6 pt-2" />
                <NavList />
              </SheetContent>
            </Sheet>

            <div>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h1>
              {description ? (
                <p className="hidden text-xs text-muted-foreground sm:block">{description}</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex gap-1.5 text-xs">
              <Link to="/emergency">
                <QrCode className="size-3.5 text-primary" /> Emergency QR
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5 text-xs">
              <Link to="/upload">
                <Upload className="size-3.5" /> Upload Report
              </Link>
            </Button>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
