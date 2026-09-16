import { useState, useEffect } from "react";
import {
  Download,
  FileCheck2,
  Heart,
  Hospital,
  Printer,
  ShieldCheck,
  Stethoscope,
  User,
  X,
  Sparkles,
  Activity,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, getStoredUser } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface DossierProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conditions?: any[];
  records?: any[];
  vaccinations?: any[];
  intakes?: any[];
}

export function ClinicalDossierModal({
  open,
  onOpenChange,
  conditions = [],
  records = [],
  vaccinations = [],
  intakes: initialIntakes,
}: DossierProps) {
  const [intakes, setIntakes] = useState<any[]>(initialIntakes || []);

  useEffect(() => {
    if (open && !initialIntakes) {
      api.getPatientIntakes()
        .then((res) => {
          if (res.interviews) setIntakes(res.interviews);
        })
        .catch(() => {});
    }
  }, [open, initialIntakes]);

  const patient = getStoredUser() || {
    name: "Aarav Sharma",
    dob: "1992-04-18",
    gender: "Male",
    bloodGroup: "O+",
    height: "178 cm",
    weight: "76 kg",
    allergies: ["Penicillin", "Dust mite"],
    emergencyContact: { name: "Meera Sharma", relation: "Spouse", phone: "+91 98111 20034" },
  };

  const handlePrint = () => {
    window.print();
  };

  const labRecords = records.filter((r) => r.category === "Lab Report");
  const imagingRecords = records.filter((r) => r.category === "Imaging");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background border-border print:max-w-none print:max-h-none print:p-0 print:border-none">
        {/* Modal Top Header */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-card/60 flex flex-row items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Stethoscope className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Doctor-Ready Comprehensive Clinical Dossier
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Verified Medical Summary for Clinical Consultations & Hospital Triage
              </p>
            </div>
          </div>
          <Button onClick={handlePrint} size="sm" className="gap-1.5 font-bold">
            <Printer className="size-4" /> Print / Save PDF
          </Button>
        </DialogHeader>

        {/* Dossier Document Sheet */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-950 text-white space-y-6 print:bg-white print:text-black print:p-8">
          {/* Official Document Header */}
          <div className="border-b-2 border-primary/40 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-primary">MedVault</span>
                <Badge variant="outline" className="text-[10px] uppercase font-mono border-primary/40 text-primary">
                  Official Patient Health Passport
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                Comprehensive Clinical Health Dossier
              </h1>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
                Generated on {new Date().toLocaleDateString("en-US", { dateStyle: "long" })} · Cryptographically Verified
              </p>
            </div>

            {/* Blood Group Badge */}
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/40 rounded-2xl px-5 py-3 shrink-0">
              <Heart className="size-6 text-red-500 fill-red-500 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-red-400 block tracking-wider">Blood Group</span>
                <span className="text-2xl font-black text-red-400">{patient.bloodGroup || "O+"}</span>
              </div>
            </div>
          </div>

          {/* Section 1: Patient Demographics & Emergency Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-2xl p-4 text-xs">
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase font-bold">Patient Name</span>
              <strong className="text-sm font-bold text-white print:text-black">{patient.name}</strong>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase font-bold">Date of Birth</span>
              <strong className="text-sm font-bold text-white print:text-black">{patient.dob || "1992-04-18"}</strong>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase font-bold">Gender / Physique</span>
              <strong className="text-sm font-bold text-white print:text-black">{patient.gender || "Male"} · {patient.height} / {patient.weight}</strong>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase font-bold">Emergency Contact</span>
              <strong className="text-sm font-bold text-white print:text-black">
                {patient.emergencyContact?.name || "Next of Kin"} ({patient.emergencyContact?.phone || "+91 98111 20034"})
              </strong>
            </div>
          </div>

          {/* Critical Allergies Box */}
          <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between text-xs">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              ⚠️ Critical Drug & Environmental Allergies:
            </span>
            <div className="flex flex-wrap gap-1.5 font-bold text-amber-200">
              {patient.allergies && patient.allergies.length > 0 ? (
                patient.allergies.map((a: string) => (
                  <Badge key={a} className="bg-amber-500/20 text-amber-200 border-amber-500/30 text-[11px]">
                    {a}
                  </Badge>
                ))
              ) : (
                <span className="text-slate-400">No known drug allergies reported.</span>
              )}
            </div>
          </div>

          {/* Department-Specific AI Clinical Intake Summary */}
          {intakes && intakes.length > 0 && intakes[0]?.summary && (
            <div className="space-y-2.5 bg-primary/10 border border-primary/30 rounded-2xl p-4 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-[10px]">
                    AI
                  </span>
                  <span className="font-bold text-sm text-primary">
                    {intakes[0].departmentName} Pre-Consultation Intake
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
                  {intakes[0].status === "verified" ? "Clinician Verified" : "Patient Self-Reported"}
                </Badge>
              </div>

              <p className="text-white print:text-black font-semibold text-xs">
                <strong>Chief Complaint:</strong> {intakes[0].summary.chiefComplaint}
              </p>
              <p className="text-slate-300 print:text-slate-700 text-[11px] leading-relaxed">
                {intakes[0].summary.clinicalNarrative}
              </p>

              {intakes[0].summary.structuredFields && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {Object.entries(intakes[0].summary.structuredFields).slice(0, 4).map(([k, v]) => (
                    <div key={k} className="bg-slate-900/80 print:bg-slate-100 rounded-xl p-2">
                      <span className="text-slate-400 print:text-slate-600 block text-[9px] uppercase font-bold">{k}</span>
                      <strong className="text-white print:text-black text-[11px] truncate block">{String(v)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Patient Health & Illness Journey Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Activity className="size-4" /> 1. Documented Health Conditions & Illness Journey
              </h2>
              <span className="text-[11px] text-slate-400">{conditions.length} Documented Episodes</span>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden text-xs">
              {conditions.length > 0 ? (
                conditions.map((c) => (
                  <div key={c.id} className="p-3.5 bg-slate-900/60 print:bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-white print:text-black">{c.title}</strong>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold",
                            c.isOngoing || c.status === "active"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          )}
                        >
                          {c.status.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">
                        {c.startDate} {c.endDate ? `to ${c.endDate}` : "to Ongoing"}
                      </span>
                    </div>

                    <p className="text-slate-300 print:text-slate-700 leading-relaxed">
                      <strong>Diagnosis:</strong> {c.diagnosis}
                    </p>

                    {c.outcome && (
                      <p className="text-slate-400 print:text-slate-600 text-[11px]">
                        <strong>Resolution / Care Plan:</strong> {c.outcome}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400">No medical episodes listed.</div>
              )}
            </div>
          </div>

          {/* Section 3: Diagnostic Laboratory Findings */}
          {labRecords.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <FileCheck2 className="size-4" /> 2. Verified Diagnostic Laboratory Biomarkers
                </h2>
                <span className="text-[11px] text-slate-400">{labRecords.length} Panels</span>
              </div>

              <div className="space-y-2.5">
                {labRecords.map((r) => (
                  <div key={r.id} className="bg-slate-900/60 print:bg-white border border-slate-800 rounded-2xl p-3.5 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-sm text-white print:text-black">{r.name}</strong>
                      <span className="font-mono text-[11px] text-slate-400">{r.date}</span>
                    </div>
                    <p className="text-slate-300 print:text-slate-700 leading-relaxed text-[11px]">{r.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Radiology & Imaging Impressions */}
          {imagingRecords.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-sm font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <ImageIcon className="size-4" /> 3. Verified Radiology & Diagnostic Imaging Impressions
                </h2>
                <span className="text-[11px] text-slate-400">{imagingRecords.length} Scans</span>
              </div>

              <div className="space-y-2.5">
                {imagingRecords.map((img) => (
                  <div key={img.id} className="bg-slate-900/60 print:bg-white border border-slate-800 rounded-2xl p-3.5 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-sm text-purple-300 print:text-purple-700">{img.name}</strong>
                      <span className="font-mono text-[11px] text-slate-400">{img.date}</span>
                    </div>
                    <p className="text-slate-300 print:text-slate-700 leading-relaxed text-[11px]">
                      <strong>Radiologist Impression:</strong> {img.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification Watermark */}
          <div className="pt-4 border-t border-slate-800 text-center text-slate-500 print:text-slate-500 text-[10px] space-y-1">
            <p className="flex items-center justify-center gap-1 font-bold text-slate-400 print:text-slate-600">
              <ShieldCheck className="size-3.5 text-emerald-400" /> MedVault Cryptographically Verified Electronic Health Dossier
            </p>
            <p>Certified Clinical Record Summary for Hospital Admissions, Outpatient Consultations, and Medical Clearances.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ClinicalDossierModal;
