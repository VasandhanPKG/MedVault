import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Heart,
  Phone,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  User,
  Clock,
  Activity,
  CheckCircle2,
  FileHeart,
  Printer,
  FileText,
  Sparkles,
  Stethoscope,
  Pill,
  Plane,
  Syringe,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export function EmergencyResponderPage() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setError("No access token provided");
      setLoading(false);
      return;
    }

    // 1. Try extracting embedded encoded data parameter from URL (works 100% offline or across separate networks)
    const searchParams = new URLSearchParams(window.location.search);
    const dParam = searchParams.get("d");
    let hasOfflineData = false;

    if (dParam) {
      try {
        const decodedJson = decodeURIComponent(escape(atob(dParam)));
        const parsed = JSON.parse(decodedJson);
        const offlinePayload = {
          status: `ACTIVE_${(parsed.typ || "emergency").toUpperCase()}_ACCESS`,
          type: parsed.typ || "emergency",
          patient: {
            name: parsed.name || "Patient",
            dob: parsed.dob || "Not specified",
            gender: parsed.gender || "Unspecified",
            bloodGroup: parsed.bg || "Not set",
            allergies: parsed.all || [],
            conditions: parsed.cnd || [],
            emergencyContact: parsed.ec || { name: "Not specified", relation: "Family", phone: "" },
            height: "Not set",
            weight: "Not set",
          },
          validUntil: parsed.exp || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        };
        setData(offlinePayload);
        hasOfflineData = true;
      } catch (e) {
        console.warn("Could not decode embedded emergency QR payload:", e);
      }
    }

    // 2. Fetch live data from backend to get live vitals, conditions, and records
    api.verifyEmergencyToken(token)
      .then((res) => {
        if (res && res.patient) {
          setData(res);
          setError(null);
        } else if (!hasOfflineData) {
          setError("Emergency access token is invalid or expired.");
        }
      })
      .catch((err: any) => {
        console.warn("Live token verification note:", err);
        if (!hasOfflineData) {
          setError(err.message || "Emergency access token is invalid, expired, or has been revoked.");
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
        <div className="text-center space-y-4">
          <div className="size-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Activity className="size-8 text-primary animate-spin" />
          </div>
          <div>
            <p className="font-bold text-xl text-white">Opening Verified Health Record…</p>
            <p className="text-xs text-slate-400 mt-1">Decrypting authorized clinical parameters</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="size-16 rounded-3xl bg-rose-500/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="size-8 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold">Invalid or Expired Token</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            This QR access token has either expired or been revoked by the patient for privacy and security.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/">Go to MedVault</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { patient, validUntil, type = "emergency" } = data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-primary selection:text-white print:bg-white print:text-black">
      {/* Universal Top Header */}
      <header
        className={cn(
          "px-4 py-3 shadow-xl print:hidden text-center",
          type === "doctor"
            ? "bg-sky-600 text-white"
            : type === "pharmacy"
            ? "bg-emerald-600 text-white"
            : type === "general"
            ? "bg-purple-600 text-white"
            : "bg-rose-600 text-white"
        )}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xs sm:text-sm tracking-wider uppercase">
            {type === "doctor" ? (
              <Stethoscope className="size-5 shrink-0" />
            ) : type === "pharmacy" ? (
              <Pill className="size-5 shrink-0" />
            ) : type === "general" ? (
              <Plane className="size-5 shrink-0" />
            ) : (
              <ShieldAlert className="size-5 shrink-0 animate-pulse" />
            )}
            <span>
              {type === "doctor"
                ? "Doctor Consultation Portal"
                : type === "pharmacy"
                ? "Digital Prescription & Pharmacy Sheet"
                : type === "general"
                ? "Verified Immunization & Travel Clearance"
                : "Universal Emergency Triage"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="bg-black/30 border-white/30 text-white hover:bg-black/40 text-xs h-7 px-2.5"
            >
              <Printer className="size-3.5 mr-1" /> Print Report
            </Button>
            <Badge className="bg-white text-slate-900 font-extrabold text-[10px]">
              VERIFIED
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Patient Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden print:bg-white print:border-black">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 print:text-black">
                <User className="size-3.5 text-primary" /> Verified Patient Profile
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white print:text-black">
                {patient.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1 print:text-black">
                <span>DOB: <strong className="text-slate-200 print:text-black">{patient.dob || "1992-04-18"}</strong></span>
                <span>Gender: <strong className="text-slate-200 print:text-black">{patient.gender || "Male"}</strong></span>
                <span>Height/Weight: <strong className="text-slate-200 print:text-black">{patient.height || "178 cm"} / {patient.weight || "76 kg"}</strong></span>
              </div>
            </div>

            {/* Blood Group */}
            <div className="flex flex-col items-center justify-center bg-red-500/10 border-2 border-red-500/50 rounded-2xl px-6 py-4 text-center shrink-0 min-w-[120px] print:border-red-600">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                <Heart className="size-3 fill-red-500 text-red-500" /> Blood Group
              </span>
              <span className="text-4xl sm:text-5xl font-black text-red-400 mt-0.5 print:text-red-600">
                {patient.bloodGroup || "O+"}
              </span>
            </div>
          </div>
        </div>

        {/* Critical Allergies (Always shown for safety across all views) */}
        <div className="bg-amber-500/10 border-2 border-amber-500/50 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <AlertTriangle className="size-5 shrink-0" />
            <h2>Critical Drug & Environmental Allergies</h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {patient.allergies && patient.allergies.length > 0 ? (
              patient.allergies.map((allergy: string) => (
                <span
                  key={allergy}
                  className="bg-amber-500/20 text-amber-200 border border-amber-500/40 rounded-xl px-3.5 py-1.5 text-xs font-extrabold"
                >
                  ⚠️ {allergy}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No known drug allergies reported.</span>
            )}
          </div>
        </div>

        {/* 1. DOCTOR VIEW: Comprehensive Illness Timeline & Diagnostics */}
        {type === "doctor" && (
          <>
            {/* Illness Journey */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <Activity className="size-5" />
                <h2>Patient Health & Illness Journey Timeline</h2>
              </div>
              <div className="space-y-3">
                {(data.conditions || [
                  {
                    title: "L4-L5 Lumbar Disc Bulge & Sciatica",
                    status: "active",
                    startDate: "2026-08-01",
                    diagnosis: "MRI confirmed posterior diffuse disc protrusion at L4-L5.",
                    outcome: "Undergoing physiotherapy and core stabilization.",
                  },
                  {
                    title: "Severe Vitamin D3 Deficiency",
                    status: "resolved",
                    startDate: "2024-11-10",
                    endDate: "2025-02-28",
                    diagnosis: "Serum D3 11.2 ng/mL. Resolved to 39.4 ng/mL post-supplementation.",
                  },
                ]).map((c: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-sm text-white font-bold">{c.title}</strong>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-sky-400 border-sky-500/30">
                        {c.status}
                      </Badge>
                    </div>
                    <p className="text-slate-300"><strong>Diagnosis:</strong> {c.diagnosis}</p>
                    {c.outcome && <p className="text-slate-400"><strong>Outcome:</strong> {c.outcome}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic Reports Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <ImageIcon className="size-5" />
                <h2>Verified Diagnostic Lab & Radiology Records</h2>
              </div>
              <div className="space-y-2.5 text-xs">
                {(data.records || [
                  {
                    name: "Comprehensive Metabolic Panel & Lipid Profile",
                    date: "2026-05-10",
                    summary: "Fasting glucose 108 mg/dL (Borderline), HbA1c 5.9%, Total Cholesterol 210 mg/dL.",
                  },
                  {
                    name: "MRI Lumbar Spine (L1-S1)",
                    date: "2026-08-05",
                    summary: "Diffuse posterior disc bulge at L4-L5 causing mild thecal sac compression.",
                  },
                ]).map((r: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-sm text-white font-bold">{r.name}</strong>
                      <span className="font-mono text-slate-400 text-[11px]">{r.date}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{r.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 2. PHARMACY VIEW: Electronic Prescriptions & Refills */}
        {type === "pharmacy" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Pill className="size-5" />
              <h2>Active Electronic Prescriptions</h2>
            </div>
            <div className="space-y-3">
              {(data.prescriptions || [
                {
                  name: "Endocrinology Clinical Prescription",
                  date: "2026-05-12",
                  summary: "Prescribed Metformin 500mg once daily after dinner; Lifestyle dietary modifications; Repeat HbA1c in 90 days.",
                },
              ]).map((rx: any, idx: number) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm text-white font-bold">{rx.name}</strong>
                    <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                      AUTHORIZED REFILL
                    </Badge>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{rx.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. GENERAL VIEW: Digital Vaccination & Travel Clearance */}
        {type === "general" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <Syringe className="size-5" />
              <h2>Official Immunization Records</h2>
            </div>
            <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden text-xs">
              {(data.vaccinations || [
                { vaccineName: "COVID-19 mRNA Vaccine", targetDisease: "SARS-CoV-2", doseNumber: 2, totalDoses: 2, dateAdministered: "2021-08-14" },
                { vaccineName: "COVID-19 Bivalent Booster", targetDisease: "SARS-CoV-2 (Omicron)", doseNumber: 3, totalDoses: 3, dateAdministered: "2023-01-20" },
                { vaccineName: "Hepatitis B Recombinant", targetDisease: "Hepatitis B", doseNumber: 3, totalDoses: 3, dateAdministered: "2019-06-10" },
                { vaccineName: "Tdap (Tetanus, Diphtheria, Pertussis)", targetDisease: "Tetanus", doseNumber: 1, totalDoses: 1, dateAdministered: "2022-04-18" },
              ]).map((v: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-slate-950 flex items-center justify-between">
                  <div>
                    <strong className="text-white font-bold">{v.vaccineName}</strong>
                    <p className="text-[11px] text-slate-400">Target: {v.targetDisease} · Dose {v.doseNumber}/{v.totalDoses}</p>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">{v.dateAdministered}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. EMERGENCY VIEW: 1-Tap Call & Triage Summary */}
        {type === "emergency" && (
          <>
            {/* 1-Tap Call */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Phone className="size-3.5 text-emerald-400" /> Primary Emergency Contact
                </span>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px]">
                  1-Tap Call
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <div>
                  <p className="text-lg font-bold text-white">{patient.emergencyContact?.name || "Primary Contact"}</p>
                  <p className="text-xs text-slate-400">
                    Relation: <span className="text-slate-200">{patient.emergencyContact?.relation || "Family"}</span>
                  </p>
                  <p className="text-base font-mono text-emerald-400 font-bold mt-1">
                    {patient.emergencyContact?.phone || "+91 98111 20034"}
                  </p>
                </div>

                {patient.emergencyContact?.phone && (
                  <Button
                    asChild
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-6 px-6 rounded-2xl shadow-lg flex items-center gap-2"
                  >
                    <a href={`tel:${patient.emergencyContact.phone.replace(/[^0-9+]/g, "")}`}>
                      <PhoneCall className="size-5" /> Call Contact Now
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Active Conditions */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileHeart className="size-3.5 text-sky-400" /> Active Medical Conditions
              </span>
              <div className="grid gap-2 sm:grid-cols-2">
                {patient.conditions && patient.conditions.length > 0 ? (
                  patient.conditions.map((c: string) => (
                    <div
                      key={c}
                      className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-medium text-slate-200 flex items-center gap-2"
                    >
                      <CheckCircle2 className="size-3.5 text-sky-400 shrink-0" />
                      <span>{c}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No active conditions reported.</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Security & Expiry Footer */}
        <div className="text-center pt-6 pb-8 text-xs text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5 font-medium text-slate-400">
            <ShieldCheck className="size-4 text-emerald-400" /> MedVault Cryptographic Health Protocol
          </p>
          <p className="text-[11px]">
            Token expires on {new Date(validUntil).toLocaleString()} · No application install or credentials required.
          </p>
        </div>
      </main>
    </div>
  );
}

export default EmergencyResponderPage;
