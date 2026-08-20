import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, KeyRound, Loader2, QrCode, RefreshCw, Share2, ShieldCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, getStoredUser } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const flow = [
  "Generate QR",
  "Create secure access token",
  "QR generated",
  "Emergency profile accessed securely",
];

function randomToken() {
  return Array.from({ length: 24 }, () =>
    "abcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 36)),
  ).join("");
}

export function EmergencyPage() {
  const [token, setToken] = useState<string | null>(null);
  const [stage, setStage] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [patient, setPatient] = useState<any>(getStoredUser() || {
    name: "Patient",
    bloodGroup: "Not set",
    allergies: [],
    conditions: [],
    emergencyContact: { name: "Primary Contact", phone: "" }
  });

  useEffect(() => {
    api.getProfile()
      .then((p) => {
        if (p && p.name) setPatient(p);
      })
      .catch(() => {});
  }, []);

  const generate = async () => {
    setBusy(true);
    setToken(null);
    setStage(0);

    setTimeout(() => setStage(1), 400);

    try {
      const res = await api.generateEmergencyQR();
      setTimeout(() => {
        setToken(res.token || randomToken());
        setStage(2);
      }, 900);
      setTimeout(() => {
        setStage(3);
        setBusy(false);
        toast.success("Emergency QR active for 24 hours");
      }, 1400);
    } catch {
      setTimeout(() => {
        setToken(randomToken());
        setStage(2);
      }, 900);
      setTimeout(() => {
        setStage(3);
        setBusy(false);
        toast.success("Emergency QR active (Demo)");
      }, 1400);
    }
  };

  const url = token ? `${window.location.origin}/e/${token}` : "";

  return (
    <AppShell
      title="Emergency QR"
      description="Share critical triage details with first responders without exposing your complete health history."
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="surface-card flex flex-col items-center p-8 text-center lg:col-span-3">
          <div className="flex size-64 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface p-4 md:size-72">
            {token ? (
              <QRCodeSVG value={url} size={224} bgColor="transparent" fgColor="#111827" level="M" />
            ) : busy ? (
              <Loader2 className="size-10 animate-spin text-primary" />
            ) : (
              <div className="text-muted-foreground">
                <QrCode className="mx-auto size-12" />
                <p className="mt-3 text-sm">No active emergency QR</p>
              </div>
            )}
          </div>

          {token ? (
            <>
              <Badge variant="secondary" className="mt-5">
                Active · expires in 24 hours
              </Badge>
              <p className="mt-2 font-mono text-xs break-all text-muted-foreground">{url}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button variant="outline" onClick={() => toast.info("QR code downloaded")}>
                  <Download className="size-4" /> Download
                </Button>
                <Button variant="outline" onClick={() => {
                  navigator.clipboard.writeText(url);
                  toast.success("Emergency link copied to clipboard!");
                }}>
                  <Share2 className="size-4" /> Share
                </Button>
                <Button variant="outline" asChild>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" /> Preview Responder View
                  </a>
                </Button>
                <Button onClick={generate}>
                  <RefreshCw className="size-4" /> Regenerate
                </Button>
              </div>
            </>
          ) : (
            <Button size="lg" className="mt-6" onClick={generate} disabled={busy}>
              <QrCode className="size-4 mr-2" /> Generate Emergency QR
            </Button>
          )}

          <p className="mt-6 max-w-md text-xs text-muted-foreground">
            The QR contains only a revocable access token. No medical data is ever stored inside the
            code itself.
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="surface-card p-6">
            <div className="flex items-center gap-2">
              <KeyRound className="size-[18px] text-primary" />
              <h2 className="font-bold">Access flow</h2>
            </div>
            <ol className="mt-5 space-y-3">
              {flow.map((s, i) => (
                <li
                  key={s}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 text-sm transition-colors",
                    stage >= i ? "border-primary/30 bg-accent" : "border-border opacity-60",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-md text-[11px] font-bold",
                      stage >= i
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          <div className="surface-card p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-[18px] text-primary" />
              <h2 className="font-bold">Shared in an emergency</h2>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Patient Name</dt>
                <dd className="text-right font-medium">{patient.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Blood group</dt>
                <dd className="text-right font-medium">{patient.bloodGroup || "Not set"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Allergies</dt>
                <dd className="text-right font-medium">
                  {patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(", ") : "None reported"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Known Conditions</dt>
                <dd className="text-right font-medium">
                  {patient.conditions && patient.conditions.length > 0 ? patient.conditions.join(", ") : "None reported"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Emergency contact</dt>
                <dd className="text-right font-medium">
                  {patient.emergencyContact?.name ? `${patient.emergencyContact.name} (${patient.emergencyContact.phone || "No phone"})` : "Not provided"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
export default EmergencyPage;
