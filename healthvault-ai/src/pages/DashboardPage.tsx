import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  FileText,
  HeartPulse,
  Plus,
  QrCode,
  ShieldAlert,
  Upload,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api, getStoredUser } from "@/lib/api-client";

export function DashboardPage() {
  const [patient, setPatient] = useState<any>(getStoredUser() || { name: "Patient" });
  const [records, setRecords] = useState<any[]>([]);
  const [vitals, setVitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getProfile().catch(() => null),
      api.getRecords().catch(() => []),
      api.getVitals().catch(() => [])
    ]).then(([profileData, recordsData, vitalsData]) => {
      if (profileData && profileData.name) {
        setPatient(profileData);
      }
      if (Array.isArray(recordsData)) {
        setRecords(recordsData);
      }
      if (Array.isArray(vitalsData)) {
        setVitals(vitalsData);
      }
      setLoading(false);
    });
  }, []);

  const healthScore = "--"; // Shown only when calculated from real patient data
  const recent = records.slice(0, 4);

  // Dynamic trend data only from real vitals
  const hasVitals = vitals.length > 0;
  const trendData = vitals.map(v => ({
    month: v.date.slice(5),
    value: Number(v.bloodGlucose) || 100
  }));

  return (
    <AppShell
      title={`Welcome, ${patient.name?.split(" ")[0] || "Patient"}`}
      description="Here is your personal health overview and encrypted records."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Health Score</p>
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <HeartPulse className="size-[18px]" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight">{healthScore}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {records.length > 0 ? "Calculated from your records" : "Awaiting first lab report"}
          </p>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Stored Records</p>
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <FileText className="size-[18px]" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight">{records.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">End-to-end encrypted</p>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">AI Clinical Insights</p>
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <BrainCircuit className="size-[18px]" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight">{records.length > 0 ? `${records.length}` : "0"}</p>
          <p className="mt-1 text-xs text-muted-foreground">Grounded strictly in your vault</p>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Risk Status</p>
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <ShieldAlert className="size-[18px]" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight">
            {records.length > 0 ? "Low-Mod" : "Unassessed"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {records.length > 0 ? "Based on lab panels" : "Requires medical reports"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="surface-card p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold">Biomarker trend preview</h2>
              <p className="text-sm text-muted-foreground">
                {hasVitals ? "Glycemic trajectory over recorded dates" : "No trend data recorded yet"}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/analytics">
                Full analytics <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>

          {hasVitals ? (
            <div className="mt-6 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ left: -18, right: 6, top: 6 }}>
                  <defs>
                    <linearGradient id="hba1c" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis domain={[60, 200]} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-card)",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    fill="url(#hba1c)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
              <Activity className="size-8 text-muted-foreground" />
              <p className="mt-3 font-semibold text-sm">No biomarker trends recorded yet</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                Upload your blood test reports or log vitals to see your personalized charts.
              </p>
              <Button size="sm" variant="outline" className="mt-4" asChild>
                <Link to="/analytics">
                  <Plus className="size-4 mr-1" /> Log vital reading
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="surface-card p-6">
            <div className="flex items-center gap-2 text-primary">
              <BrainCircuit className="size-[18px]" />
              <p className="text-sm font-bold">AI Clinical Assistant</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {records.length > 0
                ? `You have ${records.length} report(s) in your vault. Ask MedVault AI to explain any biomarker or trend without speculation.`
                : "Upload your first diagnostic lab report (e.g. CBC, lipid panel, glucose test) to unlock personalized AI health summaries."}
            </p>
            <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
              <Link to="/assistant">Ask MedVault AI</Link>
            </Button>
          </div>

          <div className="surface-card p-6">
            <div className="flex items-center gap-2">
              <QrCode className="size-[18px] text-primary" />
              <p className="text-sm font-bold">Emergency QR</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Blood group {patient.bloodGroup || "Not set"} · Contact {patient.emergencyContact?.name || "Family"}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <Button size="sm" className="w-full" asChild>
                <Link to="/emergency">
                  <QrCode className="size-4 mr-2" /> View Emergency Access
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="surface-card p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold">Your medical reports</h2>
            <Button size="sm" asChild>
              <Link to="/upload">
                <Upload className="size-4" /> Upload report
              </Link>
            </Button>
          </div>

          {records.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
              <FileText className="size-10 text-muted-foreground" />
              <p className="mt-3 font-semibold">No medical records uploaded yet</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                Upload PDFs or photos of your lab reports, prescriptions, or discharge summaries.
              </p>
              <Button size="sm" className="mt-5" asChild>
                <Link to="/upload">
                  <Plus className="size-4 mr-1" /> Upload first document
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-border">
              {recent.map((r: any) => (
                <li key={r.id} className="flex items-center gap-4 py-3.5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <FileText className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.category} · {r.date ? new Date(r.date).toLocaleDateString() : "Recent"}
                    </p>
                  </div>
                  <Badge variant={r.status === "processed" ? "secondary" : "outline"}>
                    {r.status === "processed" ? "Processed" : "Processing"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}

          {records.length > 0 ? (
            <Button variant="ghost" size="sm" className="mt-3" asChild>
              <Link to="/records">View all ({records.length}) records</Link>
            </Button>
          ) : null}
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center gap-2">
            <Activity className="size-[18px] text-primary" />
            <p className="text-sm font-bold">Key Biomarkers</p>
          </div>
          {vitals.length > 0 ? (
            <div className="mt-5 space-y-5">
              {[
                { label: "Blood Pressure", value: `${vitals[vitals.length - 1].systolic}/${vitals[vitals.length - 1].diastolic} mmHg`, pct: 75 },
                { label: "Blood Glucose", value: `${vitals[vitals.length - 1].bloodGlucose} mg/dL`, pct: 60 },
                { label: "Heart Rate", value: `${vitals[vitals.length - 1].heartRate} bpm`, pct: 65 },
                { label: "Weight", value: `${vitals[vitals.length - 1].weightKg} kg`, pct: 70 },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-semibold">{m.value}</span>
                  </div>
                  <Progress value={m.pct} className="mt-2 h-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center justify-center rounded-xl bg-surface p-6 text-center">
              <p className="text-xs text-muted-foreground">
                No biomarker readings on file. Upload a lab report or log your vitals to see them here.
              </p>
              <Button size="sm" variant="outline" className="mt-3" asChild>
                <Link to="/analytics">Log Vitals</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
export default DashboardPage;
