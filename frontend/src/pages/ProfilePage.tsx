import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HeartPulse, Lock, Phone, ShieldCheck, User, Heart, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
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
import { api, getStoredUser, setStoredUser, isProfileComplete } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genders = ["Male", "Female", "Non-binary", "Other", "Prefer not to say"];

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
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState<any>(
    getStoredUser() || {
      name: "",
      email: "",
      dob: "",
      gender: "Male",
      bloodGroup: "O+",
      phone: "",
      height: "175 cm",
      weight: "70 kg",
      allergies: [],
      conditions: [],
      emergencyContact: { name: "", relation: "", phone: "" },
      isProfileComplete: false,
    }
  );
  const [saving, setSaving] = useState(false);

  const isComplete = isProfileComplete(profile);

  useEffect(() => {
    api.getProfile()
      .then((data) => {
        if (data && (data.name || data.email)) {
          setProfile((prev: any) => ({
            ...prev,
            ...data,
            gender: data.gender && data.gender !== "Unspecified" ? data.gender : prev.gender || "Male",
            bloodGroup: data.bloodGroup && data.bloodGroup !== "Not set" ? data.bloodGroup : prev.bloodGroup || "O+",
            emergencyContact: data.emergencyContact || prev.emergencyContact || { name: "", relation: "", phone: "" }
          }));
          setStoredUser({ ...getStoredUser(), ...data });
        }
      })
      .catch(() => {});
  }, []);

  const todayDate = new Date().toISOString().split("T")[0];

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!profile.name || profile.name.trim().length === 0) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!profile.dob) {
      toast.error("Please enter your date of birth.");
      return;
    }

    if (profile.dob > todayDate) {
      toast.error("Date of birth cannot be in the future. Please select a valid date.");
      return;
    }

    if (!profile.phone || profile.phone.trim().length < 6 || profile.phone.includes("00000 00000")) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    if (!profile.emergencyContact?.name || profile.emergencyContact.name.trim().length === 0) {
      toast.error("Please provide an emergency contact name.");
      return;
    }

    if (!profile.emergencyContact?.phone || profile.emergencyContact.phone.trim().length < 6 || profile.emergencyContact.phone.includes("00000 00000")) {
      toast.error("Please provide a valid emergency contact phone number.");
      return;
    }

    setSaving(true);
    const updatedPayload = {
      ...profile,
      isProfileComplete: true,
    };

    try {
      const res = await api.updateProfile(updatedPayload);
      const savedUser = res?.profile || updatedPayload;
      setProfile(savedUser);
      setStoredUser(savedUser);
      
      // Dispatch custom storage event so other components immediately update
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("profileUpdated", { detail: savedUser }));

      toast.success("Patient profile completed and saved successfully!");

      if (location.state?.requiredSetup || !isComplete) {
        setTimeout(() => {
          navigate("/dashboard");
        }, 800);
      }
    } catch (err: any) {
      console.warn("Profile update remote warning, saving locally:", err);
      setProfile(updatedPayload);
      setStoredUser(updatedPayload);
      window.dispatchEvent(new Event("storage"));
      toast.success("Profile saved successfully!");

      if (location.state?.requiredSetup || !isComplete) {
        setTimeout(() => {
          navigate("/dashboard");
        }, 800);
      }
    } finally {
      setSaving(false);
    }
  };

  const initials = profile.name
    ? profile.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "PT";

  return (
    <AppShell title="Profile" description="Your identity and emergency details.">
      <div className="space-y-6">
        {/* Onboarding / Incomplete Profile Notice Banner */}
        {!isComplete && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-6 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-amber-600 dark:text-amber-400">
                    Profile Setup Required
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Please complete and save your medical details below (Date of Birth, Blood Group, Phone, and Emergency Contact) to unlock access to all MedVault features.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold shrink-0 shadow-md gap-2"
              >
                {saving ? "Saving…" : "Save & Activate Vault"} <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Identity Card */}
          <div className="surface-card flex flex-col items-center p-8 text-center">
            <span className="flex size-24 items-center justify-center rounded-3xl bg-primary text-2xl font-extrabold text-primary-foreground shadow-soft">
              {initials}
            </span>
            <p className="mt-4 text-lg font-bold">{profile.name || "Patient"}</p>
            <p className="text-sm text-muted-foreground">{profile.email || "No email on file"}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="font-bold flex items-center gap-1">
                <Heart className="size-3 text-red-500 fill-red-500" /> Blood Group: {profile.bloodGroup || "O+"}
              </Badge>
              <Badge variant="outline">{profile.gender || "Unspecified"}</Badge>
              {isComplete ? (
                <Badge className="bg-emerald-600 text-white font-semibold flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> Profile Active
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1 font-semibold">
                  <Lock className="size-3" /> Setup Required
                </Badge>
              )}
            </div>
            <div className="mt-6 grid w-full grid-cols-2 gap-3">
              {[
                ["Height", profile.height || "175 cm"],
                ["Weight", profile.weight || "70 kg"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-surface p-3 border border-border/50">
                  <p className="text-xs text-muted-foreground">{k}</p>
                  <p className="font-semibold">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Details Form */}
          <div className="surface-card p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="size-[18px] text-primary" />
                <h2 className="font-bold">Personal information</h2>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                All fields are required
              </span>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="p-name">Full name *</Label>
                  <Input
                    id="p-name"
                    required
                    value={profile.name || ""}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="p-dob">Date of birth *</Label>
                  <Input
                    id="p-dob"
                    type="date"
                    required
                    max={todayDate}
                    value={profile.dob || ""}
                    onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="p-gender">Gender *</Label>
                  <Select
                    value={profile.gender || "Male"}
                    onValueChange={(val) => setProfile({ ...profile, gender: val })}
                  >
                    <SelectTrigger id="p-gender" className="w-full">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((g) => (
                        <SelectItem key={g} value={g} className="font-medium">
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="p-phone">Phone number *</Label>
                  <Input
                    id="p-phone"
                    required
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="p-email">Email</Label>
                  <Input
                    id="p-email"
                    type="email"
                    value={profile.email || ""}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="name@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="p-height">Height</Label>
                      <Input
                        id="p-height"
                        value={profile.height || ""}
                        onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                        placeholder="175 cm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="p-weight">Weight</Label>
                      <Input
                        id="p-weight"
                        value={profile.weight || ""}
                        onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                        placeholder="70 kg"
                      />
                    </div>
                  </div>
                </div>

                {/* Blood Group Select Dropdown & Quick-Select Buttons */}
                <div className="space-y-2 sm:col-span-2 pt-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="p-blood" className="flex items-center gap-1.5 font-bold">
                      <Heart className="size-3.5 text-red-500 fill-red-500" /> Blood Group *
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Chosen: <strong className="text-primary font-bold">{profile.bloodGroup || "O+"}</strong>
                    </span>
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
                    placeholder="e.g. Penicillin, Sulfa drugs, Peanuts, Pollen"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  disabled={saving}
                >
                  {saving ? "Saving…" : isComplete ? "Save changes" : "Complete Profile & Unlock Vault"}
                </Button>
              </div>
            </form>
          </div>

          {/* Emergency Contact */}
          <div className="surface-card p-6 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Phone className="size-[18px] text-primary" />
              <h2 className="font-bold">Emergency contact *</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Required for your Smart Emergency QR badge. Responders will contact this person in critical situations.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="e-name">Contact Name *</Label>
                <Input
                  id="e-name"
                  required
                  value={profile.emergencyContact?.name || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      emergencyContact: { ...profile.emergencyContact, name: e.target.value },
                    })
                  }
                  placeholder="e.g. Jane Doe"
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
                  placeholder="e.g. Spouse / Parent / Sibling"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-phone">Phone number *</Label>
                <Input
                  id="e-phone"
                  required
                  value={profile.emergencyContact?.phone || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      emergencyContact: { ...profile.emergencyContact, phone: e.target.value },
                    })
                  }
                  placeholder="e.g. +91 98111 22334"
                />
              </div>
            </div>
            <Button
              type="button"
              className="mt-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : isComplete ? "Save changes" : "Complete Profile & Unlock Vault"}
            </Button>
          </div>

          {/* Privacy Preferences */}
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
      </div>
    </AppShell>
  );
}

export default ProfilePage;
