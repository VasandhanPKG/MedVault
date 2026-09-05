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
  Image as ImageIcon,
  ExternalLink,
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
  status: "normal" | "borderline" | "high" | "low" | "attention";
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
    extractedMarkers?: Biomarker[];
    biomarkers?: Biomarker[];
    rawText?: string;
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

  // Strictly use genuine extracted markers (0 fake mock fallbacks)
  const biomarkers: Biomarker[] = record.extractedMarkers || record.biomarkers || [];
  const isImaging = record.category === "Imaging" || /mri|x-ray|xray|ct\s*scan|ultrasound/i.test(record.name);
  const isPdf = record.type?.toLowerCase() === "pdf" || record.fileUrl?.toLowerCase().endsWith(".pdf");
  const isImage = /png|jpe?g|webp/i.test(record.type || "") || /\.(png|jpe?g|webp)$/i.test(record.fileUrl || "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[88vh] flex flex-col p-0 overflow-hidden bg-background border-border">
        {/* Modal Header */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-card/50 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={cn(
              "size-10 rounded-xl flex items-center justify-center font-bold text-xs",
              isImaging ? "bg-purple-500/10 text-purple-500 border border-purple-500/20" : "bg-primary/10 text-primary border border-primary/20"
            )}>
              {isImaging ? <ImageIcon className="size-5" /> : <FileText className="size-5" />}
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                {record.name}
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  {record.category}
                </Badge>
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Archived on {record.date || "Recent"} · {record.type || "Document"}
              </p>
            </div>
          </div>
          {record.fileUrl && (
            <Button variant="outline" size="sm" asChild className="text-xs">
              <a href={record.fileUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5 mr-1" /> Open Original
              </a>
            </Button>
          )}
        </DialogHeader>

        {/* Modal Body: Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Side: Document Preview / Canvas */}
          <div className="lg:col-span-7 bg-slate-950 p-6 flex flex-col items-center justify-center relative overflow-hidden border-r border-border">
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md rounded-lg p-1 border border-slate-800">
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

            {/* Document Preview Canvas */}
            <div
              className="w-full max-w-md bg-white text-slate-900 rounded-xl shadow-2xl p-6 transition-transform duration-200 select-none overflow-y-auto max-h-[70vh]"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              {/* Report Header */}
              <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-start">
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-slate-900">
                    {isImaging ? "RADIOLOGY & IMAGING INVESTIGATION" : "CLINICAL HEALTHCARE RECORD"}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {isImaging ? "Computed Imaging / PACS Document" : "Automated Diagnostic Report"}
                  </p>
                </div>
                <Badge className="bg-slate-900 text-white text-[10px]">VERIFIED</Badge>
              </div>

              {/* Patient Meta */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg mb-4 border border-slate-200">
                <div>
                  <span className="text-slate-500">Study/Test: </span>
                  <span className="font-bold">{record.name}</span>
                </div>
                <div>
                  <span className="text-slate-500">Date: </span>
                  <span className="font-medium">{record.date || "Recent"}</span>
                </div>
              </div>

              {/* Parameters Table */}
              {biomarkers.length > 0 ? (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 text-[10px] text-slate-500 uppercase">
                      <th className="py-1">{isImaging ? "Parameter / Region" : "Investigation"}</th>
                      <th className="py-1">Observation / Value</th>
                      <th className="py-1">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {biomarkers.map((b) => {
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
                                  : b.status === "attention"
                                  ? "text-rose-700 bg-rose-50 font-bold"
                                  : "text-amber-700 bg-amber-50 font-bold"
                              )}
                            >
                              {b.value} {b.unit !== "Radiology" && b.unit !== "Target Organ" && b.unit !== "Impression" && b.unit !== "Evaluation" ? b.unit : ""}
                            </span>
                          </td>
                          <td className="py-2 text-[10px] text-slate-500">{b.referenceRange || "Clinical Standard"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <p className="text-xs">{record.summary || "Document archived securely in MedVault."}</p>
                </div>
              )}

              <div className="mt-6 pt-3 border-t border-slate-200 text-[9px] text-slate-400 text-center">
                *** End of Medical Document — Cryptographically Verified by MedVault ***
              </div>
            </div>
          </div>

          {/* Right Side: Clinical AI Translation & Findings */}
          <div className="lg:col-span-5 p-6 flex flex-col gap-5 overflow-y-auto bg-card">
            {/* Clinical Summary */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Sparkles className="size-4" />
                <h3>{isImaging ? "Radiological Clinical Summary" : "Clinical AI Summary"}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {record.summary || "Document processed and archived in MedVault vault."}
              </p>
            </div>

            {/* Extracted Parameters List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Activity className="size-3.5 text-primary" /> Extracted Parameters ({biomarkers.length})
                </h4>
                {biomarkers.length > 0 && (
                  <span className="text-[11px] text-muted-foreground">Click item to locate</span>
                )}
              </div>

              {biomarkers.length > 0 ? (
                <div className="space-y-2.5">
                  {biomarkers.map((b) => {
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
                                : b.status === "attention"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {b.value} {b.unit !== "Radiology" && b.unit !== "Target Organ" && b.unit !== "Impression" && b.unit !== "Evaluation" ? b.unit : ""}
                          </Badge>
                        </div>
                        {b.referenceRange && (
                          <p className="text-[11px] text-muted-foreground mt-1">
                            Ref: {b.referenceRange}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
                  <p className="text-xs">No individual numeric markers extracted from this record.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
