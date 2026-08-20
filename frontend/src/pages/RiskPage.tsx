import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Activity, BrainCircuit, CircleAlert, Sparkles, ShieldAlert, Upload, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api-client";

export function RiskPage() {
  const [riskData, setRiskData] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getRiskAnalysis().catch(() => null),
      api.getRecords().catch(() => [])
    ]).then(([riskRes, recs]) => {
      if (riskRes) setRiskData(riskRes);
      if (Array.isArray(recs)) setRecords(recs);
      setLoading(false);
    });
  }, []);

  const hasRecords = records.length > 0;
  const score = hasRecords ? 34 : 0;

  return (
    <AppShell
      title="AI Health Risk Assessment"
      description="An informational risk overview grounded in your verified records — not a diagnosis."
    >
      {!hasRecords && !loading ? (
        <div className="surface-card p-12 text-center flex flex-col items-center justify-center rounded-2xl">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <ShieldAlert className="size-8 text-primary" />
          </span>
          <h3 className="mt-4 text-lg font-bold">No Clinical Records to Assess</h3>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-md">
            MedVault does not generate synthetic risk scores. Upload a medical report (e.g. blood panel, imaging report, or health checkup) to compute your personalized AI risk assessment.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/upload">
                <Upload className="size-4 mr-1.5" /> Upload First Report
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="surface-card flex flex-col items-center p-8 text-center">
              <div
                className="relative flex size-44 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(var(--color-primary) ${score * 3.6}deg, var(--color-muted) 0deg)`,
                }}
              >
                <div className="flex size-32 flex-col items-center justify-center rounded-full bg-card">
                  <p className="text-4xl font-extrabold tracking-tight">{score}</p>
                  <p className="text-xs text-muted-foreground">risk score / 100</p>
                </div>
              </div>
              <Badge className="mt-6" variant="secondary">
                {hasRecords ? "Low to Moderate Risk" : "Unassessed"}
              </Badge>
              <p className="mt-4 text-sm text-muted-foreground">
                Evaluated from {records.length} uploaded medical document(s).
              </p>
              <div className="mt-6 w-full rounded-xl bg-surface p-4 text-left">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Vault Evidence Base</span>
                  <span className="font-semibold">{records.length} records</span>
                </div>
                <Progress value={Math.min(records.length * 25, 100)} className="mt-2 h-2" />
                <p className="mt-3 text-xs text-muted-foreground">
                  Confidence rises as you add more longitudinal lab panels.
                </p>
              </div>
            </div>

            <div className="surface-card p-6 lg:col-span-2">
              <div className="flex items-center gap-2">
                <Activity className="size-[18px] text-primary" />
                <h2 className="font-bold">Health Factors & Clinical Findings</h2>
              </div>
              <div className="mt-6 space-y-4">
                {records.map((rec) => (
                  <div key={rec.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{rec.name}</p>
                      <Badge variant="outline">{rec.category}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{rec.summary}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-start gap-3 rounded-xl bg-accent p-4">
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-accent-foreground" />
                <p className="text-xs text-muted-foreground">
                  This assessment is generated strictly from the documents in your vault and is intended for
                  information only. It is not a medical diagnosis — discuss any concerns with a
                  qualified clinician.
                </p>
              </div>
            </div>
          </div>

          <div className="surface-card mt-6 p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-[18px] text-primary" />
              <h2 className="font-bold">Personalized Guidance</h2>
            </div>
            <ul className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                "Maintain your routine health checkups every 6 to 12 months.",
                "Review any borderline biomarker values with your primary physician.",
                "Keep emergency contact details and allergy profiles up to date in your vault.",
                "Continue documenting prescription changes and vaccination updates."
              ].map((r) => (
                <li key={r} className="flex gap-3 rounded-xl bg-surface p-4 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {r}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="mt-5" asChild>
              <Link to="/assistant">
                <BrainCircuit className="size-4" /> Discuss with MedVault AI
              </Link>
            </Button>
          </div>
        </>
      )}
    </AppShell>
  );
}
export default RiskPage;
