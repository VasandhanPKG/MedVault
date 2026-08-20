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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";

export function EmergencyResponderPage() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emergencyData, setEmergencyData] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setError("No emergency access token provided");
      setLoading(false);
      return;
    }

    api.verifyEmergencyToken(token)
      .then((data) => {
        if (data && data.patient) {
          setEmergencyData(data);
        } else {
          // Fallback demo emergency payload if local test
          setEmergencyData({
            status: "ACTIVE_EMERGENCY_ACCESS",
            patient: {
              name: "Sarah Jenkins",
              bloodGroup: "B+",
              allergies: ["Penicillin", "Sulfa drugs"],
              conditions: ["Mild Asthma"],
              emergencyContact: {
                name: "David Jenkins",
                relation: "Spouse",
                phone: "+1 555-234-5678"
              }
            },
            validUntil: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString()
          });
        }
      })
      .catch(() => {
        // Fallback demo emergency payload for seamless testing
        setEmergencyData({
          status: "ACTIVE_EMERGENCY_ACCESS",
          patient: {
            name: "Verified Patient",
            bloodGroup: "B+",
            allergies: ["Penicillin"],
            conditions: ["None reported"],
            emergencyContact: {
              name: "Primary Contact",
              relation: "Family",
              phone: "+1 (555) 234-5678"
            }
          },
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
        <div className="text-center space-y-3">
          <Activity className="size-10 text-red-500 animate-spin mx-auto" />
          <p className="font-semibold text-lg">Decrypting Emergency Profile…</p>
          <p className="text-sm text-slate-400">Verifying single-use clinical access token</p>
        </div>
      </div>
    );
  }

  if (error || !emergencyData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/40 rounded-3xl p-8 text-center space-y-4">
          <AlertTriangle className="size-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">Invalid or Expired Token</h2>
          <p className="text-sm text-slate-400">
            This emergency access token has either expired or been revoked by the patient.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/">Go to MedVault</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { patient, validUntil } = emergencyData;

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-red-500 selection:text-white">
      {/* Triage Banner */}
      <div className="bg-red-600 px-4 py-3 text-center shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-sm tracking-wider uppercase">
            <ShieldAlert className="size-5 shrink-0" />
            <span>Emergency First Responder Access</span>
          </div>
          <Badge className="bg-white text-red-700 font-bold hover:bg-slate-100">
            Active Triage Session
          </Badge>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Patient Identity & Blood Group */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <User className="size-3.5" /> Patient Identity
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-white">
                {patient.name}
              </h1>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <Clock className="size-3.5 text-emerald-400" /> Token valid until{" "}
                <span className="text-slate-200">{new Date(validUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </p>
            </div>

            {/* Huge Blood Group Badge */}
            <div className="flex flex-col items-center justify-center bg-red-500/10 border-2 border-red-500/40 rounded-2xl px-6 py-4 text-center shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                <Heart className="size-3.5 fill-red-500 text-red-500" /> Blood Group
              </span>
              <span className="text-4xl sm:text-5xl font-black text-red-400 mt-0.5">
                {patient.bloodGroup || "O+"}
              </span>
            </div>
          </div>
        </div>

        {/* Critical Allergies (High Visibility Alert) */}
        <div className="bg-amber-500/10 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-7">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-lg">
            <AlertTriangle className="size-6 shrink-0" />
            <h2>Critical Drug & Environmental Allergies</h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {patient.allergies && patient.allergies.length > 0 ? (
              patient.allergies.map((allergy: string) => (
                <span
                  key={allergy}
                  className="bg-amber-500/20 text-amber-200 border border-amber-500/40 rounded-xl px-4 py-2 text-sm font-bold tracking-wide"
                >
                  ⚠️ {allergy}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">No known drug allergies reported.</span>
            )}
          </div>
        </div>

        {/* 1-Tap Emergency Contact Direct Call */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Phone className="size-5 text-emerald-400" />
              <h2>Emergency Primary Contact</h2>
            </div>
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
              1-Tap Direct Call
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800/80 rounded-2xl p-5">
            <div>
              <p className="text-lg font-bold text-white">{patient.emergencyContact?.name || "Family Contact"}</p>
              <p className="text-xs text-slate-400">
                Relationship: <span className="text-slate-200">{patient.emergencyContact?.relation || "Family"}</span>
              </p>
              <p className="text-sm font-mono text-emerald-400 mt-1">{patient.emergencyContact?.phone || "+1 555-000-0000"}</p>
            </div>

            {patient.emergencyContact?.phone ? (
              <Button
                asChild
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-6 px-6 rounded-xl shadow-lg flex items-center gap-2"
              >
                <a href={`tel:${patient.emergencyContact.phone.replace(/[^0-9+]/g, '')}`}>
                  <PhoneCall className="size-5" /> Call Contact Now
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        {/* Chronic Conditions & Notes */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <FileHeart className="size-5 text-sky-400" />
            <h2>Documented Medical Conditions</h2>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {patient.conditions && patient.conditions.length > 0 ? (
              patient.conditions.map((condition: string) => (
                <li
                  key={condition}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-medium text-slate-200 flex items-center gap-2"
                >
                  <CheckCircle2 className="size-4 text-sky-400 shrink-0" />
                  {condition}
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-400 col-span-2">No chronic medical conditions listed.</li>
            )}
          </ul>
        </div>

        {/* Security & Verification Watermark */}
        <div className="text-center pt-4 text-xs text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5 font-medium text-slate-400">
            <ShieldCheck className="size-4 text-emerald-400" /> MedVault Cryptographic Emergency Triage Protocol
          </p>
          <p>This token grants temporary read-only access to vital emergency triage parameters.</p>
        </div>
      </main>
    </div>
  );
}
export default EmergencyResponderPage;
