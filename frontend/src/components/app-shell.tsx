import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  Bell,
  BrainCircuit,
  FileText,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  QrCode,
  Settings,
  ShieldPlus,
  Upload,
  User,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { api, getStoredUser } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/records", label: "Medical Records", icon: FileText },
  { to: "/upload", label: "Upload Report", icon: Upload },
  { to: "/assistant", label: "AI Assistant", icon: BrainCircuit },
  { to: "/analytics", label: "Health Analytics", icon: LineChart },
  { to: "/risk", label: "Risk Assessment", icon: Activity },
  { to: "/emergency", label: "Emergency QR", icon: QrCode },
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
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="size-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarInner({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Brand className="px-2 pt-2" />
      <NavList onNavigate={onNavigate} />
      <div className="mt-auto flex flex-col gap-3">
        <div className="rounded-2xl bg-accent p-4">
          <p className="text-sm font-semibold text-accent-foreground">Vault secured</p>
          <p className="mt-1 text-xs text-muted-foreground">
            End-to-end encrypted. Only you control access to your records.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          onClick={() => api.logout()}
        >
          <LogOut className="size-4" /> Sign out
        </Button>
      </div>
    </div>
  );
}

export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string | undefined;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState<string>("Patient");

  useEffect(() => {
    const stored = getStoredUser();
    if (stored && stored.name) {
      setUserName(stored.name);
    } else {
      api.getProfile()
        .then((p) => {
          if (p && p.name) setUserName(p.name);
        })
        .catch(() => {});
    }
  }, []);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "PT";

  return (
    <div className="flex min-h-screen w-full bg-surface">
      <aside className="hidden w-[264px] shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarInner />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md md:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-sidebar p-0">
              <SidebarInner onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold tracking-tight md:text-lg">{title}</h1>
            {description ? (
              <p className="hidden truncate text-xs text-muted-foreground md:block">{description}</p>
            ) : null}
          </div>

          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="size-[18px]" />
          </Button>
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-3 pl-1 transition-colors hover:bg-accent"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {initials}
            </span>
            <span className="hidden text-sm font-medium sm:block">{userName}</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            title="Sign out"
            onClick={() => api.logout()}
          >
            <LogOut className="size-4" />
          </Button>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
