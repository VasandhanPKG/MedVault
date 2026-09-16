import { useEffect, useState } from "react";
import { HeartPulse, Lock, Phone, ShieldCheck, User, Heart } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, getStoredUser, setStoredUser } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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
      bloodGroup: "O+",
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

  const todayDate = new Date().toISOString().split("T")[0];

  const handleSave = async () => {
    if (profile.dob && profile.dob > todayDate) {
      toast.error("Date of birth cannot be in the future. Please select a valid date.");
      return;
    }
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
            <Badge variant="secondary" className="font-bold flex items-center gap-1">
              <Heart className="size-3 text-red-500 fill-red-500" /> Blood Group: {profile.bloodGroup || "O+"}
            </Badge>
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
                max={todayDate}
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
            
            {/* Blood Group Select Dropdown & Quick-Select Buttons */}
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="p-blood" className="flex items-center gap-1.5 font-bold">
                  <Heart className="size-3.5 text-red-500 fill-red-500" /> Select Blood Group
                </Label>
                <span className="text-xs text-muted-foreground">Chosen: <strong className="text-primary">{profile.bloodGroup || "O+"}</strong></span>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-1">
                {bloodGroups.map((bg) => {
                  const isSelected = profile.bloodGroup === bg;
                  return (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setProfile({ ...profile, bloodGroup: bg })}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                        isSelected
                          ? "bg-red-500 text-white border-red-600 shadow-md scale-105"
                          : "bg-surface text-foreground border-border hover:border-red-400/50 hover:bg-red-50/10"
                      )}
                    >
                      {bg}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <Select
                  value={profile.bloodGroup || "O+"}
                  onValueChange={(val) => setProfile({ ...profile, bloodGroup: val })}
                >
                  <SelectTrigger id="p-blood" className="w-full">
                    <SelectValue placeholder="Select Blood Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((b) => (
                      <SelectItem key={b} value={b} className="font-semibold">
                        🩸 {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
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
                placeholder="e.g. Penicillin, Sulfa drugs, Peanuts"
              />
            </div>
          </div>
          <Button className="mt-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold" onClick={handleSave} disabled={saving}>
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
              <Label htmlFor="e-phone">Phone</Label>
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
          <Button className="mt-5" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>

        <div className="surface-card p-6 lg:col-span-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-[18px] text-primary" />
            <h2 className="font-bold">Privacy & sharing preferences</h2>
          </div>
          <div className="mt-5 space-y-4">
            {privacy.map((p) => (
              <div
                key={p.label}
                className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-sm">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
                <Switch defaultChecked={p.on} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default ProfilePage;
