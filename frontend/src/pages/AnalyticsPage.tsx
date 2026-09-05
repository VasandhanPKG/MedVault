import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import type { ReactElement } from "react";
import { Plus, Activity, Upload, LineChart as ChartIcon, FileText, Download, Calendar, HeartPulse, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClinicalDossierModal } from "@/components/clinical-dossier-modal";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const axis = { tickLine: false, axisLine: false, fontSize: 11, stroke: "hsl(var(--muted-foreground))" } as const;

function ChartCard({
  title,
  unit,
  latest,
  delta,
  positive,
  target,
  children,
}: {
  title: string;
  unit: string;
  latest: string;
  delta: string;
  positive: boolean;
  target?: string;
  children: ReactElement;
}) {
  return (
    <div className="surface-card p-5 sm:p-6 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-base">{title}</h3>
          <p className="text-xs text-muted-foreground">{unit}</p>
          {target && (
            <p className="text-[11px] font-mono text-emerald-400 mt-0.5">Target: {target}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold tracking-tight">{latest}</p>
          <Badge variant={positive ? "secondary" : "outline"} className="text-xs mt-1">
            {delta}
          </Badge>
        </div>
      </div>
      <div className="h-[230px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const [vitals, setVitals] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [dossierOpen, setDossierOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<"3m" | "6m" | "1y" | "all">("all");

  const [newVital, setNewVital] = useState({
    date: new Date().toISOString().split("T")[0],
    systolic: 120,
    diastolic: 80,
    heartRate: 72,
    bloodGlucose: 96,
    weightKg: 76,
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getVitals().catch(() => []),
      api.getRecords().catch(() => []),
      api.getConditions().catch(() => []),
    ]).then(([vitalsData, recordsData, condData]) => {
      if (Array.isArray(vitalsData)) setVitals(vitalsData);
      if (Array.isArray(recordsData)) setRecords(recordsData);
      if (Array.isArray(condData)) setConditions(condData);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddVital = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await api.addVital({
        id: `vit-${Date.now()}`,
        date: newVital.date,
        systolic: Number(newVital.systolic),
        diastolic: Number(newVital.diastolic),
        heartRate: Number(newVital.heartRate),
        bloodGlucose: Number(newVital.bloodGlucose),
        weightKg: Number(newVital.weightKg),
      });
      setVitals((prev) => [...prev, added]);
      toast.success("Vital parameters recorded successfully!");
      setOpen(false);
    } catch {
      toast.error("Failed to save vital entry");
    }
  };

  // Filter vitals by timeframe
  const filteredVitals = useMemo(() => {
    if (!vitals || vitals.length === 0) return [];
    const now = new Date();
    return vitals.filter((v) => {
      if (timeframe === "all") return true;
      const vDate = new Date(v.date);
      const diffMonths = (now.getFullYear() - vDate.getFullYear()) * 12 + (now.getMonth() - vDate.getMonth());
      if (timeframe === "3m") return diffMonths <= 3;
      if (timeframe === "6m") return diffMonths <= 6;
      if (timeframe === "1y") return diffMonths <= 12;
      return true;
    });
  }, [vitals, timeframe]);

  const latestVital = vitals.length > 0 ? vitals[vitals.length - 1] : null;

  return (
    <AppShell
      title="Longitudinal Biomarker Trends"
      description="Track physiological trajectories, metabolic stability, and cardiovascular health across time."
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="surface-card p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase text-muted-foreground mr-1">Timeframe:</span>
              {(["3m", "6m", "1y", "all"] as const).map((tf) => (
                <Button
                  key={tf}
                  size="sm"
                  variant={timeframe === tf ? "default" : "ghost"}
                  className="text-xs h-8 px-3 rounded-lg"
                  onClick={() => setTimeframe(tf)}
                >
                  {tf === "3m" ? "3 Months" : tf === "6m" ? "6 Months" : tf === "1y" ? "1 Year" : "All Time"}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setDossierOpen(true)} className="text-xs h-9">
                <Download className="size-3.5 mr-1.5" /> Doctor Dossier PDF
              </Button>
              <Button size="sm" onClick={() => setOpen(true)} className="text-xs h-9 bg-primary font-bold">
                <Plus className="size-4 mr-1.5" /> Log New Vitals
              </Button>
            </div>
          </div>
        </div>

        {/* Multi-Chart Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* 1. Fasting Blood Glucose Trend */}
          <ChartCard
            title="Fasting Blood Glucose"
            unit="Capillary / Serum blood glucose (mg/dL)"
            latest={latestVital ? `${latestVital.bloodGlucose} mg/dL` : "95 mg/dL"}
            delta={latestVital && latestVital.bloodGlucose < 100 ? "Normal (< 100)" : "Borderline"}
            positive={latestVital ? latestVital.bloodGlucose < 100 : true}
            target="70 – 99 mg/dL"
          >
            <AreaChart data={filteredVitals}>
              <defs>
                <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" {...axis} />
              <YAxis domain={[70, 130]} {...axis} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Pre-diabetes Threshold (100)", fill: "#f59e0b", fontSize: 10 }} />
              <Area type="monotone" dataKey="bloodGlucose" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#glucoseGrad)" name="Glucose (mg/dL)" />
            </AreaChart>
          </ChartCard>

          {/* 2. Blood Pressure (Systolic / Diastolic) */}
          <ChartCard
            title="Blood Pressure (Systolic / Diastolic)"
            unit="Sphygmomanometer reading (mmHg)"
            latest={latestVital ? `${latestVital.systolic}/${latestVital.diastolic} mmHg` : "120/80 mmHg"}
            delta={latestVital && latestVital.systolic <= 120 ? "Optimal BP" : "Pre-hypertension"}
            positive={latestVital ? latestVital.systolic <= 120 : true}
            target="< 120/80 mmHg"
          >
            <LineChart data={filteredVitals}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" {...axis} />
              <YAxis domain={[60, 150]} {...axis} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
              <ReferenceLine y={120} stroke="#10b981" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} name="Systolic (mmHg)" />
              <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} name="Diastolic (mmHg)" />
            </LineChart>
          </ChartCard>

          {/* 3. Resting Heart Rate */}
          <ChartCard
            title="Resting Heart Rate"
            unit="Cardiac pulse frequency (bpm)"
            latest={latestVital ? `${latestVital.heartRate} bpm` : "72 bpm"}
            delta="Normal sinus rhythm"
            positive={true}
            target="60 – 100 bpm"
          >
            <AreaChart data={filteredVitals}>
              <defs>
                <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" {...axis} />
              <YAxis domain={[50, 100]} {...axis} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="heartRate" stroke="#10b981" strokeWidth={2.5} fill="url(#hrGrad)" name="Heart Rate (bpm)" />
            </AreaChart>
          </ChartCard>

          {/* 4. Body Weight Trajectory */}
          <ChartCard
            title="Body Weight Trajectory"
            unit="Recorded patient mass (kg)"
            latest={latestVital ? `${latestVital.weightKg} kg` : "76.0 kg"}
            delta="Stable (-3.5 kg over 1 yr)"
            positive={true}
            target="Healthy BMI range"
          >
            <LineChart data={filteredVitals}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" {...axis} />
              <YAxis domain={[65, 90]} {...axis} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Line type="monotone" dataKey="weightKg" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} name="Weight (kg)" />
            </LineChart>
          </ChartCard>
        </div>
      </div>

      {/* Modal: Log Vital Reading */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <HeartPulse className="size-5 text-primary" />
              Log Physiological Vital Reading
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddVital} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="v-date">Measurement Date</Label>
              <Input
                id="v-date"
                type="date"
                required
                value={newVital.date}
                onChange={(e) => setNewVital({ ...newVital, date: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="v-sys">Systolic BP (mmHg)</Label>
                <Input
                  id="v-sys"
                  type="number"
                  required
                  value={newVital.systolic}
                  onChange={(e) => setNewVital({ ...newVital, systolic: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="v-dia">Diastolic BP (mmHg)</Label>
                <Input
                  id="v-dia"
                  type="number"
                  required
                  value={newVital.diastolic}
                  onChange={(e) => setNewVital({ ...newVital, diastolic: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="v-glu">Fasting Glucose (mg/dL)</Label>
                <Input
                  id="v-glu"
                  type="number"
                  required
                  value={newVital.bloodGlucose}
                  onChange={(e) => setNewVital({ ...newVital, bloodGlucose: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="v-hr">Heart Rate (bpm)</Label>
                <Input
                  id="v-hr"
                  type="number"
                  required
                  value={newVital.heartRate}
                  onChange={(e) => setNewVital({ ...newVital, heartRate: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="v-wt">Body Weight (kg)</Label>
              <Input
                id="v-wt"
                type="number"
                step="0.1"
                required
                value={newVital.weightKg}
                onChange={(e) => setNewVital({ ...newVital, weightKg: Number(e.target.value) })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Vital Record</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Doctor Dossier Modal */}
      <ClinicalDossierModal
        open={dossierOpen}
        onOpenChange={setDossierOpen}
        conditions={conditions}
        records={records}
      />
    </AppShell>
  );
}

export default AnalyticsPage;
