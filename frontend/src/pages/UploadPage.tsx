import { Link } from "react-router-dom";
import { useState } from "react";
import { Check, FileSearch, Loader2, ScanLine, Sparkles, UploadCloud, Activity, CheckCircle2, AlertCircle, ShieldAlert, FileText, Image as ImageIcon, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UploadDropzone } from "@/components/upload-dropzone";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const steps = [
  { title: "Uploading & Encryption", body: "Transferring and securing your document.", icon: UploadCloud },
  { title: "OCR Character Recognition", body: "Scanning image layers and parsing clinical text.", icon: ScanLine },
  { title: "Extracting Medical Biomarkers", body: "Identifying parameters, units, and clinical reference ranges.", icon: FileSearch },
  { title: "Generating AI Knowledge", body: "Categorizing and correlating results with your health vault.", icon: Sparkles },
];

interface ExtractedMarker {
  name: string;
  value: string;
  unit: string;
  status: 'normal' | 'borderline' | 'high' | 'low' | 'attention';
  referenceRange?: string;
}

export function UploadPage() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [detectedCategory, setDetectedCategory] = useState<string>("Lab Report");
  const [extractedMarkers, setExtractedMarkers] = useState<ExtractedMarker[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isRejected, setIsRejected] = useState(false);

  const startOcrPipeline = async (file?: File) => {
    setStarted(true);
    setProgress(15);
    setStep(0);
    setExtractedMarkers([]);
    setAiSummary("");
    setIsRejected(false);

    const fileName = file ? file.name : "Sample_Metabolic_Report.pdf";
    setUploadedFileName(fileName);

    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name.replace(/\.[^/.]+$/, ""));

        // Step 2: OCR
        setTimeout(() => {
          setProgress(45);
          setStep(1);
        }, 400);

        // Step 3: Entity Extraction
        setTimeout(() => {
          setProgress(75);
          setStep(2);
        }, 900);

        const res = await apiFetch('/records', {
          method: 'POST',
          body: formData,
        });

        if (res && res.ocr) {
          setExtractedMarkers(Array.isArray(res.ocr.extractedMarkers) ? res.ocr.extractedMarkers : []);
          setAiSummary(res.ocr.summary || "Document processed and stored in your vault.");
          if (res.record?.category) {
            setDetectedCategory(res.record.category);
          }
        }

        // Step 4: Done
        setTimeout(() => {
          setProgress(100);
          setStep(3);
          toast.success("Medical document analyzed and added to your records!");
        }, 1400);
      } else {
        // Sample report simulation
        setTimeout(() => { setProgress(45); setStep(1); }, 400);
        setTimeout(() => { setProgress(75); setStep(2); }, 900);
        setTimeout(() => {
          setExtractedMarkers([
            { name: "HbA1c", value: "5.9", unit: "%", status: "borderline", referenceRange: "< 5.7% (Normal)" },
            { name: "Fasting Blood Glucose", value: "104", unit: "mg/dL", status: "borderline", referenceRange: "70 - 99 mg/dL" },
            { name: "Hemoglobin", value: "14.2", unit: "g/dL", status: "normal", referenceRange: "13.5 - 17.5 g/dL" },
            { name: "Total Cholesterol", value: "192", unit: "mg/dL", status: "normal", referenceRange: "< 200 mg/dL" }
          ]);
          setAiSummary("Sample diagnostic report processed with standard metabolic biomarkers.");
          setDetectedCategory("Lab Report");
          setProgress(100);
          setStep(3);
          toast.success("Sample report loaded successfully!");
        }, 1400);
      }
    } catch (err: any) {
      console.warn("Upload rejection or validation error:", err);
      setProgress(100);
      setStep(3);
      setExtractedMarkers([]);
      setDetectedCategory("Other");
      setIsRejected(true);
      const errorMsg = err.message || "Document rejected: Not a recognized medical report and NOT added to records.";
      setAiSummary(errorMsg);
      toast.error("Document rejected: Not a recognized medical document. It was NOT added to your medical records.", {
        duration: 6000
      });
    }
  };

  const done = progress === 100;
  const isNonMedical = isRejected || detectedCategory === "Other" || (!extractedMarkers.length && aiSummary.toLowerCase().includes("not appear to be a recognized medical"));

  return (
    <AppShell title="Upload Report" description="Add a new medical report, scan, or prescription to your vault.">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <UploadDropzone
            onFiles={(files) => {
              if (files && files[0]) startOcrPipeline(files[0]);
            }}
          />
          {!started ? (
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => startOcrPipeline()}>
                <Sparkles className="size-4 text-primary mr-1.5" /> Try with a sample lab report
              </Button>
            </div>
          ) : null}

          {done ? (
            <div className="surface-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isNonMedical ? (
                    <ShieldAlert className="size-5 text-rose-500" />
                  ) : detectedCategory === "Imaging" ? (
                    <ImageIcon className="size-5 text-purple-500" />
                  ) : (
                    <Activity className="size-5 text-primary" />
                  )}
                  <h2 className="font-bold text-base">
                    {isNonMedical
                      ? "Document Rejected"
                      : detectedCategory === "Imaging"
                      ? "Radiology & Imaging Findings"
                      : "OCR Extracted Biomarkers"}
                  </h2>
                </div>
                <Badge
                  variant={isNonMedical ? "destructive" : "secondary"}
                  className="text-xs font-bold"
                >
                  {isNonMedical ? "NOT ADDED TO RECORDS" : detectedCategory}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground">
                Document: <span className="font-semibold text-foreground">{uploadedFileName}</span>
              </p>

              {isNonMedical ? (
                <div className="rounded-2xl border-2 border-rose-500/30 bg-rose-500/10 p-6 text-center space-y-3">
                  <ShieldAlert className="size-10 text-rose-500 mx-auto" />
                  <h3 className="font-bold text-rose-400 text-sm">Fake / Non-Medical File Filtered</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    This file does not appear to contain authentic clinical laboratory panels, prescriptions, or radiology imaging scans. 
                    <strong className="text-white block mt-1">To protect your health vault integrity, this file was NOT saved to your Medical Records.</strong>
                  </p>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStarted(false);
                        setProgress(0);
                        setIsRejected(false);
                      }}
                      className="border-rose-500/40 text-rose-200 hover:bg-rose-500/20"
                    >
                      <RotateCcw className="size-3.5 mr-1.5" /> Upload a valid medical document
                    </Button>
                  </div>
                </div>
              ) : extractedMarkers.length > 0 ? (
                <div className="divide-y divide-border pt-2">
                  {extractedMarkers.map((marker) => (
                    <div key={marker.name} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-semibold">{marker.name}</p>
                        {marker.referenceRange ? (
                          <p className="text-xs text-muted-foreground">Ref: {marker.referenceRange}</p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">
                          {marker.value} {marker.unit !== "Radiology" && marker.unit !== "Target Organ" && marker.unit !== "Impression" ? marker.unit : ""}
                        </span>
                        <Badge
                          variant={
                            marker.status === 'normal'
                              ? 'secondary'
                              : marker.status === 'attention'
                              ? 'destructive'
                              : 'outline'
                          }
                        >
                          {marker.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center space-y-2 bg-muted/20">
                  <AlertCircle className="size-8 text-muted-foreground mx-auto" />
                  <p className="text-sm font-medium">Document archived safely</p>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    The medical document was saved into your vault, but no individual numerical markers were present in this specific section.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="surface-card p-6 lg:col-span-2">
          <h2 className="font-bold text-base">Processing workflow</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {started ? (done ? (isNonMedical ? "Validation Finished (Rejected)" : "Analysis Complete") : "Extracting data in progress…") : "Waiting for a document"}
          </p>
          <Progress value={progress} className="mt-4 h-2" />

          <ol className="mt-6 space-y-3">
            {steps.map((s, i) => {
              const active = started && step === i && !done;
              const complete = started && (done || step > i);
              return (
                <li
                  key={s.title}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3.5 transition-colors",
                    complete
                      ? isNonMedical && i === 3
                        ? "border-rose-500/30 bg-rose-500/10"
                        : "border-primary/30 bg-accent"
                      : active
                        ? "border-primary/40 bg-card"
                        : "border-border bg-card opacity-60",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg",
                      complete
                        ? isNonMedical && i === 3
                          ? "bg-rose-600 text-white"
                          : "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {complete ? (
                      <Check className="size-4" />
                    ) : active ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <s.icon className="size-4" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          {done ? (
            <div className="mt-6 space-y-3">
              <div className={cn(
                "rounded-xl p-4 text-sm",
                isNonMedical ? "bg-rose-500/10 border border-rose-500/20 text-rose-200" : "bg-accent text-accent-foreground"
              )}>
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="size-4 text-primary" /> {isNonMedical ? "Document Integrity Check" : "Clinical Summary"}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {aiSummary || "Document verified."}
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" asChild>
                  <Link to="/records">View records vault</Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/assistant">Ask AI</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}

export default UploadPage;
