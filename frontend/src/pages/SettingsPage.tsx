import { useEffect, useState } from "react";
import { Bell, KeyRound, Monitor, Moon, Palette, Sun } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const themes = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
] as const;

const notifications = [
  { label: "Report processing complete", desc: "When AI finishes analysing an upload.", on: true },
  { label: "New AI insight", desc: "When a meaningful change is detected in your trends.", on: true },
  { label: "Emergency QR accessed", desc: "Immediate alert when your token is used.", on: true },
  { label: "Health reminders", desc: "Alerts for medication schedules or upcoming follow-ups.", on: true },
];

export function SettingsPage() {
  const [theme, setTheme] = useState<(typeof themes)[number]["id"]>("light");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const dark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }, [theme]);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully!");
    }, 500);
  };

  return (
    <AppShell title="Settings" description="Control appearance, password, and notification preferences.">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface-card p-6">
          <div className="flex items-center gap-2">
            <Palette className="size-[18px] text-primary" />
            <h2 className="font-bold">Theme & Appearance</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            MedVault is designed light-first for clinical clarity.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors",
                  theme === t.id
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border hover:bg-muted",
                )}
              >
                <t.icon className="size-5" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center gap-2">
            <KeyRound className="size-[18px] text-primary" />
            <h2 className="font-bold">Change Password</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your account password to maintain security.
          </p>
          <form onSubmit={handlePasswordUpdate} className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cur">Current password</Label>
              <Input
                id="cur"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New password</Label>
              <Input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conf">Confirm new password</Label>
              <Input
                id="conf"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>
            <Button type="submit" disabled={updating}>
              {updating ? "Updating…" : "Update password"}
            </Button>
          </form>
        </div>

        <div className="surface-card p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Bell className="size-[18px] text-primary" />
            <h2 className="font-bold">Notification Preferences</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose what alerts and summaries you receive from MedVault.
          </p>
          <ul className="mt-5 divide-y divide-border">
            {notifications.map((n) => (
              <li key={n.label} className="flex items-center justify-between gap-6 py-3.5">
                <div>
                  <p className="text-sm font-semibold">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <Switch defaultChecked={n.on} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
export default SettingsPage;
