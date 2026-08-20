import { useEffect, useState } from "react";
import { HeartPulse, Lock, Phone, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api, getStoredUser, setStoredUser } from "@/lib/api-client";

const privacy = [
  {
    label: "Allow emergency QR access",
    desc: "Responders can view your emergency profile with a valid token.",
    on: true,
  },
  {
    label: "AI analysis of new uploads",
    desc: "Automatically extract values and generate insights.",
    on: true,
  },
  {
    label: "Share anonymised trends for research",
    desc: "Never includes identity or document contents.",
    on: false,
  },
  { label: "Email me monthly health summaries", desc: "A digest of your trends and insights.", on: true },
];

export function ProfilePage() {
  const [profile, setProfile] = useState<any>(
    getStoredUser() || {
      name: "Patient",
      email: "",
      dob: "",
      gender: "Unspecified",
      bloodGroup: "Not set",
      phone: "",
      height: "175 cm",
      weight: "70 kg",
      allergies: [],
      conditions: [],
      emergencyContact: { name: "", relation: "", phone: "" },
    }
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getProfile()
      .then((data) => {
        if (data && data.name) {
          setProfile(data);
          setStoredUser(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.updateProfile(profile);
      if (res && res.profile) {
        setProfile(res.profile);
        setStoredUser(res.profile);
      } else {
        setStoredUser(profile);
      }
      toast.success("Patient profile updated successfully!");
    } catch {
      setStoredUser(profile);
      toast.success("Profile saved locally!");
    } finally {
      setSaving(false);
    }
  };

  const initials = profile.name
    ? profile.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "PT";

  return (
    <AppShell title="Profile" description="Your identity and emergency details.">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="surface-card flex flex-col items-center p-8 text-center">
          <span className="flex size-24 items-center justify-center rounded-3xl bg-primary text-2xl font-extrabold text-primary-foreground">
            {initials}
          </span>
          <p className="mt-4 text-lg font-bold">{profile.name}</p>
          <p className="text-sm text-muted-foreground">{profile.email || "No email on file"}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">Blood group {profile.bloodGroup || "Not set"}</Badge>
            <Badge variant="outline">{profile.gender || "Unspecified"}</Badge>
          </div>
          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            {[
              ["Height", profile.height || "175 cm"],
              ["Weight", profile.weight || "70 kg"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-surface p-3">
                <p className="text-xs text-muted-foreground">{k}</p>
                <p className="font-semibold">{v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <User className="size-[18px] text-primary" />
            <h2 className="font-bold">Personal information</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-name">Full name</Label>
              <Input
                id="p-name"
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-dob">Date of birth</Label>
              <Input
                id="p-dob"
                type="date"
                value={profile.dob || ""}
                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-email">Email</Label>
              <Input
                id="p-email"
                type="email"
                value={profile.email || ""}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-phone">Phone</Label>
              <Input
                id="p-phone"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-blood">Blood group</Label>
              <Input
                id="p-blood"
                value={profile.bloodGroup || ""}
                onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-allergy">Known allergies (comma-separated)</Label>
              <Input
                id="p-allergy"
                value={Array.isArray(profile.allergies) ? profile.allergies.join(", ") : ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    allergies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
            </div>
          </div>
          <Button className="mt-5" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>

        <div className="surface-card p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Phone className="size-[18px] text-primary" />
            <h2 className="font-bold">Emergency contact</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="e-name">Contact Name</Label>
              <Input
                id="e-name"
                value={profile.emergencyContact?.name || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    emergencyContact: { ...profile.emergencyContact, name: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-rel">Relationship</Label>
              <Input
                id="e-rel"
                value={profile.emergencyContact?.relation || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    emergencyContact: { ...profile.emergencyContact, relation: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-phone">Phone Number</Label>
              <Input
                id="e-phone"
                value={profile.emergencyContact?.phone || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    emergencyContact: { ...profile.emergencyContact, phone: e.target.value },
                  })
                }
              />
            </div>
          </div>
          <Button variant="outline" className="mt-5" onClick={handleSave} disabled={saving}>
            Update contact
          </Button>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center gap-2">
            <HeartPulse className="size-[18px] text-primary" />
            <h2 className="font-bold">Conditions</h2>
          </div>
          <ul className="mt-4 space-y-2">
            {profile.conditions && profile.conditions.length > 0 ? (
              profile.conditions.map((c: string) => (
                <li key={c} className="rounded-xl bg-surface px-4 py-3 text-sm font-medium">
                  {c}
                </li>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-2">No chronic conditions listed.</p>
            )}
          </ul>
        </div>

        <div className="surface-card p-6 lg:col-span-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-[18px] text-primary" />
            <h2 className="font-bold">Privacy settings</h2>
          </div>
          <ul className="mt-5 divide-y divide-border">
            {privacy.map((p) => (
              <li key={p.label} className="flex items-center justify-between gap-6 py-4">
                <div>
                  <p className="text-sm font-semibold">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
                <Switch defaultChecked={p.on} />
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="size-3.5" /> Documents remain encrypted with keys only you control.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
export default ProfilePage;
