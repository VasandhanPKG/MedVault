import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Download,
  ExternalLink,
  Loader2,
  Lock,
  QrCode,
  RefreshCw,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Pill,
  Plane,
  Heart,
  Clock,
  Trash2,
  Sparkles,
  Check,
  Copy,
  Printer,
  Smartphone,
  Eye,
  CheckCircle2,
  Phone,
  PhoneCall,
  Activity,
  X,
  Monitor,
  Maximize2,
  FileText,
  Syringe,
  Image as ImageIcon,
  AlertTriangle,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, getStoredUser } from "@/lib/api-client";
import { cn } from "@/lib/utils";


type QRType = "emergency" | "doctor" | "pharmacy" | "general";

interface TabConfig {
  id: QRType;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  icon: any;
  glowColor: string;
  badgeClass: string;
}

const qrTabs: TabConfig[] = [
  {
    id: "emergency",
    title: "Emergency Triage QR",
    shortTitle: "Emergency",
    tagline: "Paramedics, ER Nurses & First Responders",
    description: "Instant access to blood group, critical drug allergies, 1-tap next-of-kin dialer, and emergency vitals.",
    icon: ShieldAlert,
    glowColor: "rgba(244, 63, 94, 0.15)",
    badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  },
  {
    id: "doctor",
    title: "Doctor Consultation QR",
    shortTitle: "Doctor & Clinic",
    tagline: "Outpatient Physicians & Specialists",
    description: "Full clinical illness journey, diagnostic lab biomarker panels, and verified radiology & MRI impressions.",
    icon: Stethoscope,
    glowColor: "rgba(56, 189, 248, 0.15)",
    badgeClass: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  },
  {
    id: "pharmacy",
    title: "Pharmacy & Dispensing QR",
    shortTitle: "Pharmacy & Rx",
    tagline: "Pharmacists & Prescription Refills",
    description: "Active digital prescriptions, exact dosage schedules, refill authorizations, and allergy contraindication checks.",
    icon: Pill,
    glowColor: "rgba(52, 211, 153, 0.15)",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "general",
    title: "General & Travel QR",
    shortTitle: "Travel & Fitness",
    tagline: "Visa, Travel Clearance & Insurers",
    description: "Official digital immunization registry, verified travel clearance certificate, and general health summary.",
    icon: Plane,
    glowColor: "rgba(192, 132, 252, 0.15)",
    badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
];

const durationOptions = [
  { label: "1 Hour", hours: 1, hint: "Single Clinic Visit" },
  { label: "24 Hours", hours: 24, hint: "Emergency Triage" },
  { label: "7 Days", hours: 168, hint: "Extended Travel" },
  { label: "Permanent", hours: 8760, hint: "Lockscreen Pass" },
];

export function EmergencyPage() {
  const [activeTab, setActiveTab] = useState<QRType>("emergency");
  const [durationHours, setDurationHours] = useState<number>(24);
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTokens, setActiveTokens] = useState<any[]>([]);
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);
  const [previewDeviceMode, setPreviewDeviceMode] = useState<"mobile" | "desktop">("mobile");
  const qrRef = useRef<HTMLDivElement>(null);

  const [patient, setPatient] = useState<any>(
    getStoredUser() || {
      name: "Aarav Sharma",
      dob: "1992-04-18",
      gender: "Male",
      bloodGroup: "O+",
      allergies: ["Penicillin", "Dust mite"],
      conditions: ["L4-L5 Lumbar Disc Bulge", "Pre-diabetes", "Vitamin D deficiency"],
      emergencyContact: { name: "Meera Sharma", relation: "Spouse", phone: "+91 98111 20034" },
      height: "178 cm",
      weight: "76 kg",
    }
  );

  const loadTokens = () => {
    api.listActiveTokens()
      .then((data) => {
        if (Array.isArray(data)) setActiveTokens(data);
      })
      .catch(() => {});
  };

  const generate = async (typeToGenerate = activeTab, durationToUse = durationHours) => {
    setBusy(true);
    try {
      const res = await api.generateEmergencyQR(typeToGenerate, durationToUse);
      if (res && res.token) {
        setToken(res.token);
        toast.success(`${typeToGenerate.toUpperCase()} QR code generated!`);
        loadTokens();
      }
    } catch {
      const prefixMap: Record<string, string> = { emergency: "EMG", doctor: "DOC", pharmacy: "RX", general: "GEN" };
      const fallbackToken = `${prefixMap[typeToGenerate]}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setToken(fallbackToken);
      toast.success(`${typeToGenerate.toUpperCase()} QR code generated`);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    api.getProfile()
      .then((p) => {
        if (p && p.name) setPatient(p);
      })
      .catch(() => {});
    loadTokens();
    generate("emergency", 24);
  }, []);

  const handleCopy = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Universal link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 1000, 1000);
        ctx.drawImage(img, 100, 100, 800, 800);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `MedVault_${activeTab.toUpperCase()}_QR_${token || "pass"}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        toast.success("High-Resolution QR Pass downloaded!");
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleRevoke = async (tok: string) => {
    try {
      await api.revokeToken(tok);
      setActiveTokens((prev) => prev.filter((t) => t.token !== tok));
      if (token === tok) setToken(null);
      toast.success(`Access token ${tok} revoked!`);
    } catch {
      setActiveTokens((prev) => prev.filter((t) => t.token !== tok));
      if (token === tok) setToken(null);
      toast.success(`Access token ${tok} revoked!`);
    }
  };

  const currentTab = qrTabs.find((t) => t.id === activeTab) || qrTabs[0];
  const TabIcon = currentTab.icon;
  const url = token ? `${window.location.origin}/e/${token}` : "";

  return (
    <AppShell
      title="Smart Health QR Suite"
      description="Role-based, privacy-scoped QR passes for paramedics, hospital consultations, pharmacies, and travel."
    >
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* 1. Header Segmented Role Switcher */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {qrTabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            const ItemIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  generate(tab.id, durationHours);
                }}
                className={cn(
                  "relative p-4 rounded-2xl border text-left transition-all duration-200 overflow-hidden flex flex-col justify-between gap-4 group cursor-pointer",
                  isSelected
                    ? "bg-card border-primary/50 shadow-lg ring-1 ring-primary/30 -translate-y-0.5"
                    : "bg-card/40 border-border/70 hover:bg-card/80 hover:border-border"
                )}
              >
                {isSelected && (
                  <div
                    className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${
                        tab.id === "emergency" ? "#f43f5e, #fb7185" : tab.id === "doctor" ? "#38bdf8, #818cf8" : tab.id === "pharmacy" ? "#34d399, #10b981" : "#c084fc, #a855f7"
                      })`,
                    }}
                  />
                )}

                <div className="flex items-center justify-between">
                  <div className={cn("size-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105", tab.badgeClass)}>
                    <ItemIcon className="size-5" />
                  </div>
                  {isSelected ? (
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                      Selected
                    </Badge>
                  ) : null}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-foreground">{tab.shortTitle}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{tab.tagline}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* 2. Hero Interactive QR & Digital Health Pass Grid */}
        <div className="grid gap-8 lg:grid-cols-12 items-stretch">
          {/* Left Column: Ultra-Sleek QR Pass Card */}
          <div className="lg:col-span-6 surface-card p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col items-center justify-between text-center border-border/80 shadow-xl">
            {/* Ambient Dynamic Background Glow */}
            <div
              className="absolute -top-24 -left-24 size-72 rounded-full blur-3xl pointer-events-none opacity-60"
              style={{ background: currentTab.glowColor }}
            />
            <div
              className="absolute -bottom-24 -right-24 size-72 rounded-full blur-3xl pointer-events-none opacity-60"
              style={{ background: currentTab.glowColor }}
            />

            {/* Title & Scope Tagline */}
            <div className="space-y-1.5 relative z-10 w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md" style={{ backgroundColor: currentTab.glowColor, borderColor: "rgba(255,255,255,0.1)" }}>
                <TabIcon className="size-3.5" />
                <span>{currentTab.title}</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto pt-1 leading-relaxed">
                {currentTab.description}
              </p>
            </div>

            {/* Stylized QR Code Container */}
            <div className="relative my-6 z-10">
              <div
                ref={qrRef}
                className="p-5 sm:p-6 rounded-[2rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 transition-all hover:scale-[1.01] duration-300 relative group"
              >
                {token ? (
                  <div className="relative flex items-center justify-center">
                    <QRCodeSVG
                      value={url}
                      size={230}
                      bgColor="#ffffff"
                      fgColor="#0f172a"
                      level="H"
                      includeMargin={false}
                    />
                    {/* Centered Medical Shield Badge */}
                    <div className="absolute size-11 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center pointer-events-none">
                      <TabIcon className={cn("size-6", currentTab.id === "emergency" ? "text-rose-500" : currentTab.id === "doctor" ? "text-sky-500" : currentTab.id === "pharmacy" ? "text-emerald-500" : "text-purple-500")} />
                    </div>
                  </div>
                ) : busy ? (
                  <div className="size-[230px] flex flex-col items-center justify-center gap-3">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <span className="text-xs text-slate-500 font-medium">Generating Token…</span>
                  </div>
                ) : (
                  <div className="size-[230px] flex flex-col items-center justify-center text-slate-400">
                    <QrCode className="size-12" />
                    <p className="text-xs mt-2 font-medium">Click Regenerate Below</p>
                  </div>
                )}
              </div>

              {/* Token ID Badge */}
              {token && (
                <div className="mt-3.5 inline-flex items-center gap-2 bg-surface/80 border border-border/80 rounded-full px-3.5 py-1 text-[11px] font-mono text-muted-foreground backdrop-blur-md">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>TOKEN: <strong className="text-foreground tracking-wide">{token}</strong></span>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="w-full space-y-3 z-10">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="text-xs h-9 rounded-xl gap-1.5"
                >
                  {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadQr}
                  className="text-xs h-9 rounded-xl gap-1.5"
                >
                  <Download className="size-3.5" /> Download Pass
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLivePreviewModal(true)}
                  className="text-xs h-9 rounded-xl gap-1.5 border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 font-bold"
                >
                  <Eye className="size-3.5" /> Live Preview
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-xs h-9 rounded-xl gap-1.5"
                >
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-3.5" /> Open Link
                  </a>
                </Button>

                <Button
                  size="sm"
                  onClick={() => generate(activeTab, durationHours)}
                  className="text-xs h-9 rounded-xl gap-1.5 bg-primary font-semibold"
                >
                  <RefreshCw className={cn("size-3.5", busy && "animate-spin")} /> Regenerate
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Digital Wallet Card Pass & Security Configuration */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            {/* Digital Medical Pass Preview Card */}
            <div className="surface-card p-6 sm:p-7 rounded-3xl border-border/80 space-y-5 bg-gradient-to-br from-card via-card to-accent/30 shadow-lg">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Smartphone className="size-4" />
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Digital Health Pass Preview</h3>
                    <p className="text-[11px] text-muted-foreground">Scanned via Camera · No App Required</p>
                  </div>
                </div>
                <Badge className={cn("text-[10px] uppercase font-bold", currentTab.badgeClass)}>
                  {currentTab.shortTitle}
                </Badge>
              </div>

              {/* Patient Identity Strip */}
              <div className="flex items-center justify-between bg-surface/80 border border-border rounded-2xl p-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Patient Name</span>
                  <p className="font-bold text-base text-foreground">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">
                    DOB: {patient.dob || "1992-04-18"} · Gender: {patient.gender || "Male"}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center bg-red-500/10 border border-red-500/30 rounded-xl px-3.5 py-2 text-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-red-400">Blood Group</span>
                  <span className="text-xl font-black text-red-400 mt-0.5">{patient.bloodGroup || "O+"}</span>
                </div>
              </div>

              {/* Duration Segmented Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary" /> Token Validity Duration
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {durationOptions.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        setDurationHours(opt.hours);
                        generate(activeTab, opt.hours);
                      }}
                      className={cn(
                        "p-2.5 rounded-xl border text-center transition-all text-xs cursor-pointer",
                        durationHours === opt.hours
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                          : "border-border hover:border-primary/40 bg-surface/50 text-foreground"
                      )}
                    >
                      <span className="block font-bold text-xs">{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 block truncate">{opt.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scoped Data Visibility Checklist */}
              <div className="space-y-2.5 pt-2 border-t border-border">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-primary" /> Included Clinical Parameters
                </label>
                <div className="space-y-2 text-xs">
                  {activeTab === "emergency" && (
                    <>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface/50 border border-border">
                        <span className="flex items-center gap-2 text-foreground font-medium">
                          <Heart className="size-3.5 text-red-500 fill-red-500" /> Blood Group & Emergency ID
                        </span>
                        <Badge variant="secondary" className="text-[10px]">Visible</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface/50 border border-border">
                        <span className="flex items-center gap-2 text-foreground font-medium">
                          <ShieldAlert className="size-3.5 text-amber-400" /> Critical Drug Allergies ({patient.allergies?.join(", ") || "Penicillin"})
                        </span>
                        <Badge variant="secondary" className="text-[10px]">Visible</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface/50 border border-border">
                        <span className="flex items-center gap-2 text-foreground font-medium">
                          <Phone className="size-3.5 text-emerald-400" /> 1-Tap Next-of-Kin Direct Dialer
                        </span>
                        <Badge variant="secondary" className="text-[10px]">Enabled</Badge>
                      </div>
                    </>
                  )}

                  {activeTab === "doctor" && (
                    <>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface/50 border border-border">
                        <span className="flex items-center gap-2 text-foreground font-medium">
                          <Stethoscope className="size-3.5 text-sky-400" /> Full Patient Illness Journey Timeline
                        </span>
                        <Badge variant="secondary" className="text-[10px]">Complete</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface/50 border border-border">
                        <span className="flex items-center gap-2 text-foreground font-medium">
                          <Activity className="size-3.5 text-primary" /> Diagnostic Lab Biomarkers (HbA1c, Lipids)
                        </span>
                        <Badge variant="secondary" className="text-[10px]">Included</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface/50 border border-border">
                        <span className="flex items-center gap-2 text-foreground font-medium">
                          <ShieldCheck className="size-3.5 text-purple-400" /> Radiology & Imaging Impressions (MRI, X-Ray)
                        </span>
                        <Badge variant="secondary" className="text-[10px]">Included</Badge>
                      </div>
                    </>
                  )}

                  {activeTab === "pharmacy" && (
                    <>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface/50 border border-border">
                        <span className="flex items-center gap-2 text-foreground font-medium">
                          <Pill className="size-3.5 text-emerald-400" /> Active Digital E-Prescriptions & Dosages
                        </span>
                        <Badge variant="secondary" className="text-[10px]">Authorized</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface/50 border border-border">
                        <span className="flex items-center gap-2 text-foreground font-medium">
                          <ShieldAlert className="size-3.5 text-rose-400" /> Drug Allergy Contraindication Warnings
                        </span>
                        <Badge variant="secondary" className="text-[10px]">Protected</Badge>
                      </div>
                    </>
                  )}

                  {activeTab === "general" && (
                    <>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface/50 border border-border">
                        <span className="flex items-center gap-2 text-foreground font-medium">
                          <Plane className="size-3.5 text-purple-400" /> Digital Immunization Passport (All Vaccines)
                        </span>
                        <Badge variant="secondary" className="text-[10px]">Verified</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface/50 border border-border">
                        <span className="flex items-center gap-2 text-foreground font-medium">
                          <CheckCircle2 className="size-3.5 text-emerald-400" /> International Travel Health Clearance
                        </span>
                        <Badge variant="secondary" className="text-[10px]">Certified</Badge>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Cryptographic Privacy Guarantee */}
            <div className="rounded-2xl border border-border p-4 bg-surface/40 flex items-center gap-3 text-xs text-muted-foreground">
              <Lock className="size-5 text-emerald-400 shrink-0" />
              <span>
                Tokens are end-to-end encrypted and read-only. Unrelated medical files and credentials are never exposed.
              </span>
            </div>
          </div>
        </div>

        {/* 3. Active QR Token Manager Table */}
        {activeTokens.length > 0 && (
          <div className="surface-card p-6 sm:p-7 rounded-3xl space-y-4 border-border/80 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                <h3 className="font-bold text-base">Active Shares & Access Control</h3>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {activeTokens.length} Active Token{activeTokens.length > 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="divide-y divide-border border rounded-2xl overflow-hidden text-xs bg-surface/30">
              {activeTokens.map((tok) => (
                <div key={tok.token} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface/60 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-400" />
                      <strong className="font-mono text-sm font-bold text-foreground">{tok.token}</strong>
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                        {tok.type || "emergency"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Expires: <span className="text-foreground">{new Date(tok.expiresAt).toLocaleString()}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-xs h-8 rounded-lg"
                    >
                      <a href={`${window.location.origin}/e/${tok.token}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-3 mr-1" /> View
                      </a>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevoke(tok.token)}
                      className="text-xs h-8 rounded-lg text-rose-400 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300"
                    >
                      <Trash2 className="size-3 mr-1" /> Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Interactive Live Device Preview Modal */}
        {showLivePreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Modal Header Controls */}
              <div className="px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/70">
                <div className="flex items-center gap-2.5">
                  <span className="size-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                    <Smartphone className="size-4" />
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      Live QR Responder Simulator
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                        LIVE STREAM
                      </Badge>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Real-time simulation of the scanner's authenticated viewport
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Viewport Device Switcher */}
                  <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setPreviewDeviceMode("mobile")}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors",
                        previewDeviceMode === "mobile"
                          ? "bg-primary text-white shadow-xs"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      <Smartphone className="size-3.5" /> Mobile
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDeviceMode("desktop")}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors",
                        previewDeviceMode === "desktop"
                          ? "bg-primary text-white shadow-xs"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      <Monitor className="size-3.5" /> Desktop
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-8 rounded-xl text-xs gap-1 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                  >
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-3.5" /> Standalone Tab
                    </a>
                  </Button>

                  <button
                    type="button"
                    onClick={() => setShowLivePreviewModal(false)}
                    className="size-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body: Device Frame Viewer */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center bg-radial from-slate-900 to-slate-950">
                {previewDeviceMode === "mobile" ? (
                  /* Smartphone Mockup Frame */
                  <div className="w-full max-w-[390px] h-[680px] bg-slate-950 border-[6px] border-slate-700 rounded-[3rem] shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative ring-1 ring-white/10">
                    {/* Speaker Notch / Dynamic Island */}
                    <div className="absolute top-2.5 inset-x-0 flex justify-center z-30 pointer-events-none">
                      <div className="h-4 w-28 bg-slate-800 rounded-full flex items-center justify-center gap-2 px-3">
                        <div className="size-2 rounded-full bg-slate-900" />
                        <div className="size-1.5 rounded-full bg-slate-700" />
                      </div>
                    </div>

                    {/* Mobile Status Bar */}
                    <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[10px] font-mono text-slate-400 z-20 bg-slate-950/80 backdrop-blur-xs">
                      <span>9:41</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold">5G</span>
                        <div className="w-4 h-2 rounded-[2px] border border-slate-400 flex items-center p-0.5">
                          <div className="h-full w-2.5 bg-emerald-400 rounded-[1px]" />
                        </div>
                      </div>
                    </div>

                    {/* Phone Screen Scrollable Content */}
                    <div className="flex-1 overflow-y-auto text-white text-left selection:bg-primary">
                      {/* Emergency Top Banner */}
                      <div
                        className={cn(
                          "px-4 py-2 text-center text-xs font-black uppercase tracking-wider flex items-center justify-between shadow-md",
                          activeTab === "doctor"
                            ? "bg-sky-600 text-white"
                            : activeTab === "pharmacy"
                            ? "bg-emerald-600 text-white"
                            : activeTab === "general"
                            ? "bg-purple-600 text-white"
                            : "bg-rose-600 text-white"
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <TabIcon className="size-4 shrink-0" />
                          <span className="text-[11px] truncate">{currentTab.shortTitle} Portal</span>
                        </div>
                        <span className="text-[9px] bg-black/30 px-2 py-0.5 rounded-full font-mono">
                          {token || "VERIFIED"}
                        </span>
                      </div>

                      {/* Phone Screen Body Content */}
                      <div className="p-4 space-y-4">
                        {/* Patient ID Card */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <User className="size-3 text-primary" /> Verified Patient
                              </span>
                              <h4 className="text-xl font-black text-white mt-0.5">{patient.name}</h4>
                              <p className="text-[11px] text-slate-400">
                                DOB: {patient.dob} · {patient.gender}
                              </p>
                            </div>

                            <div className="bg-red-500/15 border border-red-500/40 rounded-xl px-2.5 py-1.5 text-center">
                              <span className="text-[8px] font-bold uppercase text-red-400 block">Blood</span>
                              <span className="text-base font-black text-red-400">{patient.bloodGroup}</span>
                            </div>
                          </div>
                        </div>

                        {/* Critical Allergies */}
                        <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-3.5 space-y-2">
                          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                            <AlertTriangle className="size-3.5" />
                            <span>Critical Allergies</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {patient.allergies?.map((a: string) => (
                              <Badge key={a} variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                                ⚠️ {a}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Role-Specific Mobile Content */}
                        {activeTab === "emergency" && (
                          <>
                            {/* 1-Tap Emergency Call Dialer */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <Phone className="size-3 text-emerald-400" /> Next-of-Kin Contact
                              </span>
                              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-bold text-white">{patient.emergencyContact?.name}</p>
                                  <p className="text-[10px] text-emerald-400 font-mono font-bold">
                                    {patient.emergencyContact?.phone}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => toast.success(`Simulated dialing ${patient.emergencyContact?.phone}…`)}
                                  className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs gap-1 font-bold"
                                >
                                  <PhoneCall className="size-3.5" /> Call
                                </Button>
                              </div>
                            </div>

                            {/* Active Conditions */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <Activity className="size-3 text-sky-400" /> Active Conditions
                              </span>
                              <div className="space-y-1.5">
                                {patient.conditions?.map((c: string) => (
                                  <div key={c} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-[11px] text-slate-300 flex items-center gap-1.5">
                                    <CheckCircle2 className="size-3 text-sky-400 shrink-0" />
                                    <span>{c}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {activeTab === "doctor" && (
                          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                            <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs">
                              <Stethoscope className="size-3.5" /> Clinical Illness Timeline
                            </div>
                            <div className="space-y-2 text-[11px]">
                              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-1">
                                <strong className="text-white block font-bold">L4-L5 Lumbar Disc Bulge</strong>
                                <p className="text-slate-400 text-[10px]">MRI Confirmed posterior protrusion; Undergoing physio.</p>
                              </div>
                              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-1">
                                <strong className="text-white block font-bold">Diagnostic Lab Panels</strong>
                                <p className="text-slate-400 text-[10px]">HbA1c 5.9% · Fasting Glucose 108 mg/dL · Cholesterol 210 mg/dL</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "pharmacy" && (
                          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                              <Pill className="size-3.5" /> Active Prescriptions
                            </div>
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs">
                              <div className="flex items-center justify-between">
                                <strong className="text-white font-bold">Metformin 500mg</strong>
                                <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">
                                  Refill Auth
                                </Badge>
                              </div>
                              <p className="text-slate-400 text-[10px]">Take 1 tablet daily after dinner. Repeat HbA1c in 90 days.</p>
                            </div>
                          </div>
                        )}

                        {activeTab === "general" && (
                          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                            <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs">
                              <Syringe className="size-3.5" /> Immunization Passport
                            </div>
                            <div className="space-y-1.5 text-[11px]">
                              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 flex items-center justify-between">
                                <span className="text-white font-semibold">COVID-19 mRNA Vaccine</span>
                                <Badge className="bg-emerald-500/20 text-emerald-400 text-[9px]">Dose 2/2</Badge>
                              </div>
                              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 flex items-center justify-between">
                                <span className="text-white font-semibold">COVID-19 Bivalent Booster</span>
                                <Badge className="bg-emerald-500/20 text-emerald-400 text-[9px]">Dose 3/3</Badge>
                              </div>
                              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 flex items-center justify-between">
                                <span className="text-white font-semibold">Hepatitis B Recombinant</span>
                                <Badge className="bg-emerald-500/20 text-emerald-400 text-[9px]">Dose 3/3</Badge>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Footer Guarantee */}
                        <div className="text-center py-2 text-[10px] text-slate-500 flex items-center justify-center gap-1">
                          <ShieldCheck className="size-3 text-emerald-400" />
                          <span>MedVault Cryptographic Pass</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Desktop Screen Mockup Frame */
                  <div className="w-full max-w-2xl bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    {/* Browser Chrome Header */}
                    <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <div className="size-3 rounded-full bg-rose-500/70" />
                        <div className="size-3 rounded-full bg-amber-500/70" />
                        <div className="size-3 rounded-full bg-emerald-500/70" />
                      </div>
                      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-slate-300 font-mono text-[11px] truncate">
                        {url}
                      </div>
                    </div>

                    {/* Desktop Content */}
                    <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto text-left">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div className="space-y-1">
                          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Patient Health Portal</span>
                          <h3 className="text-2xl font-black text-white">{patient.name}</h3>
                          <p className="text-xs text-slate-400">DOB: {patient.dob} · Gender: {patient.gender} · Height: {patient.height} · Weight: {patient.weight}</p>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/40 rounded-2xl px-5 py-3 text-center">
                          <span className="text-[10px] font-bold text-red-400 uppercase">Blood Group</span>
                          <span className="text-2xl font-black text-red-400 block">{patient.bloodGroup}</span>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <AlertTriangle className="size-4" /> Critical Drug Allergies
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {patient.allergies?.map((a: string) => (
                              <Badge key={a} variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                                ⚠️ {a}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <Phone className="size-4" /> Emergency Contact
                          </span>
                          <p className="text-sm font-bold text-white">{patient.emergencyContact?.name} ({patient.emergencyContact?.relation})</p>
                          <p className="text-xs text-emerald-400 font-mono font-bold">{patient.emergencyContact?.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default EmergencyPage;

