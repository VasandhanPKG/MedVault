import { useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Printer,
  FileText,
  Save,
  Download,
  Copy,
  QrCode,
  RotateCcw,
  Layers,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DoctorIntakeViewerProps {
  session: any;
  summary: any;
  isDoctorView?: boolean;
  onVerify?: (doctorName: string, doctorNotes?: string) => Promise<void>;
  onUpdateSummary?: (updatedSummary: any, doctorNotes?: string) => Promise<void>;
  onStartNew?: () => void;
}

export function DoctorIntakeViewer({
  session,
  summary,
  onUpdateSummary,
  onStartNew,
}: DoctorIntakeViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState<Record<string, string>>(
    summary?.structuredFields || {}
  );
  const [saving, setSaving] = useState(false);
  const [qrMode, setQrMode] = useState<"text" | "json" | "token">("text");

  // Format the structured summary text for clinical handoff
  const patientName = session?.patientName || "Patient";
  const departmentName = summary?.department || session?.departmentName || "Clinical";
  const chiefComplaint = summary?.chiefComplaint || "Pre-Consultation Intake";
  const triageLevel = summary?.suggestedTriageLevel || "Routine";
  const narrative = summary?.clinicalNarrative || "Pre-consultation intake completed.";
  const structuredFields = summary?.structuredFields || {};
  const redFlags = summary?.redFlags || session?.redFlags || [];
  const sessionDate = new Date(session?.createdAt || Date.now()).toLocaleDateString();

  const formattedTextSummary = `[MEDVAULT CLINICAL INTAKE]
Patient: ${patientName}
Department: ${departmentName}
Date: ${sessionDate}
Chief Complaint: ${chiefComplaint}
Triage: ${triageLevel}

CLINICAL NARRATIVE:
${narrative}

STRUCTURED ATTRIBUTES:
${Object.entries(structuredFields)
  .map(([k, v]) => `• ${k.replace(/([A-Z])/g, " $1").trim()}: ${v}`)
  .join("\n")}
${redFlags.length > 0 ? `\nCRITICAL RED FLAGS:\n${redFlags.map((f: string) => `⚠️ ${f}`).join("\n")}` : ""}

Session ID: ${session?.id || "N/A"}`.trim();

  // Compact JSON EMR payload for scanners
  const jsonEmrPayload = JSON.stringify(
    {
      source: "MedVault-AI-Intake",
      version: "1.0",
      sessionId: session?.id,
      date: sessionDate,
      patient: patientName,
      department: departmentName,
      triage: triageLevel,
      chiefComplaint,
      narrative,
      findings: structuredFields,
      redFlags,
    },
    null,
    2
  );

  // Payload passed into the QR code based on selected mode
  const qrPayload =
    qrMode === "text"
      ? formattedTextSummary
      : qrMode === "json"
      ? jsonEmrPayload
      : `https://medvault.health/intake/${session?.id || "dossier"}?token=${session?.id || ""}`;

  const handleCopySummary = () => {
    navigator.clipboard.writeText(formattedTextSummary);
    toast.success("Structured clinical summary copied to clipboard!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    const svgElement = document.getElementById("clinical-intake-qr-svg");
    if (!svgElement) {
      toast.error("QR Code element not found");
      return;
    }

    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = 600;
        canvas.height = 600;
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 50, 50, 500, 500);
          const pngFile = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.download = `MedVault-Intake-QR-${departmentName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
          toast.success("QR Code downloaded as high-res PNG!");
        }
      };

      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.error("Failed to download QR:", err);
      toast.error("Could not download QR image");
    }
  };

  const handleSaveEdit = async () => {
    if (!onUpdateSummary) return;
    setSaving(true);
    try {
      const updated = {
        ...summary,
        structuredFields: editedFields,
      };
      await onUpdateSummary(updated);
      setIsEditing(false);
      toast.success("Intake fields updated & re-synced to Medical Records!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header Banner */}
      <div className="surface-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold shadow-soft">
            <Stethoscope className="size-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-foreground">
                {departmentName} Pre-Consultation Summary
              </h2>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-xs">
                <CheckCircle2 className="size-3" /> Synced to Medical Records
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
              <span>Patient: <strong className="text-foreground font-semibold">{patientName}</strong></span>
              <span>•</span>
              <span>Date: {sessionDate}</span>
              <span>•</span>
              <span className="font-mono text-[11px] text-muted-foreground">{session?.id}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs font-semibold">
            <Printer className="size-3.5" /> Print Dossier
          </Button>
          {onUpdateSummary && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Edit3 className="size-3.5" /> Edit Fields
            </Button>
          )}
          {onStartNew && (
            <Button variant="secondary" size="sm" onClick={onStartNew} className="gap-1.5 text-xs font-semibold">
              <RotateCcw className="size-3.5" /> New Intake
            </Button>
          )}
        </div>
      </div>

      {/* Red Flags Alert (if any) */}
      {redFlags.length > 0 && (
        <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-5 space-y-2">
          <div className="flex items-center gap-2 font-bold text-red-600 dark:text-red-400 text-sm">
            <AlertTriangle className="size-5 shrink-0" />
            <span>CRITICAL CLINICAL RED FLAGS DETECTED (HIGH PRIORITY ATTENTION)</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-red-700 dark:text-red-300 font-medium pl-1">
            {redFlags.map((flag: string, i: number) => (
              <li key={i}>{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Grid: Formatted Summary (Left) & Smart QR Code Suite (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Formatted Clinical Intake Summary */}
        <div className="lg:col-span-7 space-y-6">
          <div className="surface-card rounded-3xl border border-border bg-card p-6 sm:p-7 space-y-6 shadow-sm">
            {/* Chief Complaint & Triage Tag */}
            <div className="space-y-3 pb-5 border-b border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Activity className="size-3.5" /> Chief Complaint & Synthesis
                </span>
                <Badge
                  variant={triageLevel === "Routine" ? "secondary" : "destructive"}
                  className={cn(
                    "text-[11px] font-bold px-2.5 py-0.5",
                    triageLevel === "Routine"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  )}
                >
                  Triage: {triageLevel}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {chiefComplaint}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {narrative}
              </p>
            </div>

            {/* Structured Clinical Attributes */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-primary" /> Structured Clinical Attributes
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(structuredFields).map(([key, val]) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-border/80 bg-accent/30 p-3.5 space-y-1 transition-colors hover:bg-accent/50"
                  >
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {key.replace(/([A-Z])/g, " $1")}
                    </p>
                    <p className="text-xs font-semibold text-foreground break-words">
                      {String(val) || "Not reported"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Synced to Medical Records Box */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-primary" /> Saved to Medical Records Vault
                </p>
                <p className="text-[11px] text-muted-foreground">
                  This intake dossier has been filed into your Medical Records & Health Timeline.
                </p>
              </div>
              <Button
                size="sm"
                asChild
                className="gap-1.5 text-xs font-bold shrink-0"
              >
                <Link to="/records">
                  <FileText className="size-3.5" /> View in Records
                </Link>
              </Button>
            </div>

            {/* Non-Diagnosis Disclaimer */}
            <div className="border-t border-border pt-4 text-[11px] text-muted-foreground leading-relaxed">
              <p className="font-semibold text-foreground/80">
                ⚠️ Clinical Disclaimer:
              </p>
              <p>
                {summary?.disclaimer ||
                  "AI PRE-CONSULTATION INTAKE: Generated automatically from patient self-reported dialogue. Not a medical diagnosis. For physician review, physical examination, and clinical decision-making only."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Smart QR Code Suite */}
        <div className="lg:col-span-5 space-y-6">
          <div className="surface-card rounded-3xl border border-border bg-card p-6 sm:p-7 space-y-5 shadow-sm flex flex-col items-center text-center">
            <div className="w-full flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                  <QrCode className="size-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-foreground">Clinical Intake QR</h4>
                  <p className="text-[11px] text-muted-foreground">Scan for instant pre-consultation handoff</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                {qrMode.toUpperCase()}
              </Badge>
            </div>

            {/* Mode Switcher */}
            <Tabs
              value={qrMode}
              onValueChange={(v) => setQrMode(v as any)}
              className="w-full print:hidden"
            >
              <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-accent/40 p-1 border border-border">
                <TabsTrigger value="text" className="rounded-xl text-[11px] font-bold">
                  Formatted
                </TabsTrigger>
                <TabsTrigger value="json" className="rounded-xl text-[11px] font-bold">
                  EMR JSON
                </TabsTrigger>
                <TabsTrigger value="token" className="rounded-xl text-[11px] font-bold">
                  Direct Link
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Stylized QR Code Container */}
            <div className="relative my-2 p-5 rounded-3xl bg-white dark:bg-white shadow-[0_15px_35px_rgba(0,0,0,0.08)] border border-slate-200 transition-all hover:scale-[1.01]">
              <QRCodeSVG
                id="clinical-intake-qr-svg"
                value={qrPayload}
                size={210}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="M"
                includeMargin={false}
              />
              <div className="absolute size-9 rounded-xl bg-white shadow-sm border border-slate-200 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                <Stethoscope className="size-5 text-primary" />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-snug">
              {qrMode === "text"
                ? "Scan with any camera or phone to view formatted clinical notes."
                : qrMode === "json"
                ? "Scannable by hospital EMR/EHR intake terminals."
                : "Direct cryptographic intake link for authorized doctors."}
            </p>

            {/* Action Buttons */}
            <div className="w-full space-y-2 pt-2 border-t border-border print:hidden">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadQr}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Download className="size-3.5" /> Save PNG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySummary}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Copy className="size-3.5" /> Copy Text
                </Button>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrint}
                className="w-full gap-1.5 text-xs font-bold"
              >
                <Printer className="size-3.5" /> Print Pre-Consultation Slip
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Fields Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Edit Structured Intake Fields
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {Object.keys(editedFields).map((k) => (
              <div key={k} className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  {k.replace(/([A-Z])/g, " $1")}
                </label>
                <Input
                  value={editedFields[k]}
                  onChange={(e) =>
                    setEditedFields({ ...editedFields, [k]: e.target.value })
                  }
                  className="h-10 text-xs"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEdit} disabled={saving} className="gap-1.5 font-bold">
              <Save className="size-3.5" /> Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DoctorIntakeViewer;
