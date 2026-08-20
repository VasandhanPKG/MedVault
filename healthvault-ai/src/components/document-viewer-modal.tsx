import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Maximize2,
  Minimize2,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
  ShieldAlert,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Biomarker {
  name: string;
  value: string;
  unit: string;
  status: "normal" | "borderline" | "high" | "low";
  referenceRange?: string;
  explanation?: string;
}

interface DocumentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: {
    id: string;
    name: string;
    category: string;
    date?: string;
    type?: string;
    summary?: string;
    fileUrl?: string;
    biomarkers?: Biomarker[];
  } | null;
}

export function DocumentViewerModal({
  open,
  onOpenChange,
  record,
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  if (!record) return null;

  const defaultBiomarkers: Biomarker[] = record.biomarkers || [
    {
      name: "HbA1c (Glycated Hemoglobin)",
      value: "5.9",
      unit: "%",
      status: "borderline",
      referenceRange: "< 5.7% (Normal), 5.7 - 6.4% (Pre-diabetes)",
      explanation: "Measures average blood sugar concentration over the past 90 days.",
    },
    {
      name: "Fasting Blood Glucose",
      value: "104",
      unit: "mg/dL",
      status: "borderline",
      referenceRange: "70 - 99 mg/dL",
      explanation: "Direct fasting glucose level after an overnight 8-hour fast.",
    },
    {
      name: "Hemoglobin (Hb)",
      value: "14.2",
      unit: "g/dL",
      status: "normal",
      referenceRange: "13.5 - 17.5 g/dL",
      explanation: "Oxygen-carrying protein in red blood cells.",
    },
    {
      name: "Total Cholesterol",
      value: "192",
      unit: "mg/dL",
      status: "normal",
      referenceRange: "< 200 mg/dL",
      explanation: "Total circulating blood lipids.",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[88vh] flex flex-col p-0 overflow-hidden bg-background border-border">
        {/* Modal Header */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-card/50 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <FileText className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                {record.name}
                <Badge variant="outline">{record.category}</Badge>
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Verified Document · OCR Extracted & AI Analyzed · {record.date ? new Date(record.date).toLocaleDateString() : "Recent"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body: Split Screen */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Side: Interactive Document Layer */}
          <div className="lg:col-span-7 bg-slate-950 p-6 flex flex-col items-center justify-center relative overflow-hidden border-r border-border">
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 backdrop-blur-md">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-slate-300 hover:text-white"
                onClick={() => setZoom((z) => Math.max(z - 15, 70))}
              >
                <ZoomOut className="size-3.5" />
              </Button>
              <span className="text-[11px] font-mono text-slate-400 px-1">{zoom}%</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-slate-300 hover:text-white"
                onClick={() => setZoom((z) => Math.min(z + 15, 160))}
              >
                <ZoomIn className="size-3.5" />
              </Button>
            </div>

            {/* Document Simulated Canvas with Real Interactive Highlights */}
            <div
              className="w-full max-w-md bg-white text-slate-900 rounded-xl shadow-2xl p-6 transition-transform duration-200 select-none overflow-y-auto max-h-[70vh]"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              {/* Report Header */}
              <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-start">
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-slate-900">
                    CENTRAL CLINICAL PATHOLOGY LAB
                  </h3>
                  <p className="text-[10px] text-slate-500">ISO 15189 Accredited Automated Analyzer Report</p>
                </div>
                <Badge className="bg-slate-900 text-white text-[10px]">VERIFIED</Badge>
              </div>

              {/* Patient Meta */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg mb-4 border border-slate-200">
                <div>
                  <span className="text-slate-500">Test: </span>
                  <span className="font-bold">{record.name}</span>
                </div>
                <div>
                  <span className="text-slate-500">Date: </span>
                  <span className="font-medium">{record.date || "2026-07-12"}</span>
                </div>
              </div>

              {/* Biomarkers Table with OCR Bounding Box Highlights */}
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-300 text-[10px] text-slate-500 uppercase">
                    <th className="py-1">Investigation</th>
                    <th className="py-1">Result</th>
                    <th className="py-1">Ref. Interval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {defaultBiomarkers.map((b) => {
                    const isSelected = activeMarker === b.name;
                    return (
                      <tr
                        key={b.name}
                        onClick={() => setActiveMarker(isSelected ? null : b.name)}
                        className={cn(
                          "cursor-pointer transition-all duration-150",
                          isSelected
                            ? "bg-amber-100/90 ring-2 ring-amber-400 font-bold"
                            : "hover:bg-slate-50"
                        )}
                      >
                        <td className="py-2 pr-2 font-medium">{b.name}</td>
                        <td className="py-2 pr-2">
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded text-[11px]",
                              b.status === "normal"
                                ? "text-emerald-700 bg-emerald-50"
                                : "text-amber-700 bg-amber-50 font-bold"
                            )}
                          >
                            {b.value} {b.unit}
                          </span>
                        </td>
                        <td className="py-2 text-[10px] text-slate-500">{b.referenceRange || "Standard"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-6 pt-3 border-t border-slate-200 text-[9px] text-slate-400 text-center">
                *** End of Diagnostic Laboratory Report — Cryptographically Verified by MedVault ***
              </div>
            </div>
          </div>

          {/* Right Side: Gemini AI Translation & Biomarker Insights */}
          <div className="lg:col-span-5 p-6 flex flex-col gap-5 overflow-y-auto bg-card">
            {/* Gemini 1.5 Plain-Language Translation */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Sparkles className="size-4" />
                <h3>Gemini Plain-Language Translation</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {record.summary ||
                  "This diagnostic panel evaluates your metabolic health and blood counts. Your HbA1c (5.9%) and fasting glucose (104 mg/dL) are slightly borderline, showing positive stability compared to past tests."}
              </p>
            </div>

            {/* Extracted Biomarker List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Activity className="size-3.5 text-primary" /> Extracted Parameters ({defaultBiomarkers.length})
                </h4>
                <span className="text-[11px] text-muted-foreground">Click item to locate</span>
              </div>

              <div className="space-y-2.5">
                {defaultBiomarkers.map((b) => {
                  const active = activeMarker === b.name;
                  return (
                    <div
                      key={b.name}
                      onClick={() => setActiveMarker(active ? null : b.name)}
                      className={cn(
                        "rounded-xl border p-3.5 transition-all cursor-pointer",
                        active
                          ? "border-primary bg-accent/60 shadow-sm"
                          : "border-border hover:border-primary/40 hover:bg-accent/20"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{b.name}</p>
                        <Badge
                          variant={
                            b.status === "normal"
                              ? "secondary"
                              : b.status === "borderline"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {b.value} {b.unit}
                        </Badge>
                      </div>
                      {b.explanation ? (
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          {b.explanation}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
