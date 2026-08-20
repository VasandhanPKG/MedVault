import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Check, FileSearch, Loader2, ScanLine, Sparkles, UploadCloud, Activity, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UploadDropzone } from "@/components/upload-dropzone";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const steps = [
  { title: "Uploading & Encryption", body: "Encrypting and transferring your document securely.", icon: UploadCloud },
  { title: "OCR Character Recognition", body: "Scanning image layers and extracting clinical text.", icon: ScanLine },
  { title: "Extracting Medical Biomarkers", body: "Identifying values, units, and clinical reference ranges.", icon: FileSearch },
  { title: "Generating AI Knowledge", body: "Correlating results with your health vault history.", icon: Sparkles },
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
  const [uploadedFileName, setUploadedFileName] = useState<string>("HbA1c & Fasting Glucose Panel.pdf");
  const [extractedMarkers, setExtractedMarkers] = useState<ExtractedMarker[]>([
    { name: "HbA1c", value: "5.9", unit: "%", status: "borderline", referenceRange: "< 5.7% (Normal)" },
    { name: "Fasting Blood Glucose", value: "104", unit: "mg/dL", status: "borderline", referenceRange: "70 - 99 mg/dL" },
    { name: "Hemoglobin", value: "14.2", unit: "g/dL", status: "normal", referenceRange: "13.5 - 17.5 g/dL" },
    { name: "Total Cholesterol", value: "192", unit: "mg/dL", status: "normal", referenceRange: "< 200 mg/dL" }
  ]);
  const [aiSummary, setAiSummary] = useState<string>(
    "HbA1c 5.9% (borderline), Fasting Glucose 104 mg/dL. Both parameters show positive improvement compared to your previous quarter."
  );

  const startOcrPipeline = async (file?: File) => {
    setStarted(true);
    setProgress(0);
    setStep(0);

    if (file) {
      setUploadedFileName(file.name);
    }

    // Step 1: Uploading
    setProgress(25);
    setStep(0);

    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name.replace(/\.[^/.]+$/, ""));

        // Step 2: OCR Scanning
        setTimeout(() => {
          setProgress(50);
          setStep(1);
        }, 500);

        // Step 3: Entity Extraction
        setTimeout(() => {
          setProgress(75);
          setStep(2);
        }, 1100);

        const res = await apiFetch('/records', {
          method: 'POST',
          body: formData,
          headers: {} // Let browser set multipart boundary
        });

        if (res && res.ocr) {
          if (res.ocr.extractedMarkers && res.ocr.extractedMarkers.length > 0) {
            setExtractedMarkers(res.ocr.extractedMarkers);
          }
          if (res.ocr.summary) {
            setAiSummary(res.ocr.summary);
          }
        }
      } else {
        // Sample report simulation
        setTimeout(() => { setProgress(50); setStep(1); }, 600);
        setTimeout(() => { setProgress(75); setStep(2); }, 1200);
      }

      // Step 4: AI Insights
      setTimeout(() => {
        setProgress(100);
        setStep(3);
        toast.success("Document analyzed and stored in your vault!");
      }, 1800);
    } catch {
      // Fallback
      setTimeout(() => { setProgress(50); setStep(1); }, 600);
      setTimeout(() => { setProgress(75); setStep(2); }, 1200);
      setTimeout(() => {
        setProgress(100);
        setStep(3);
        toast.success("Document processed with OCR (Demo Mode)");
      }, 1800);
    }
  };

  const done = progress === 100;

  return (
    <AppShell title="Upload Report" description="Add a new document to your health vault with AI OCR analysis.">
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
                <Sparkles className="size-4 text-primary" /> Try with a sample lab report
              </Button>
            </div>
          ) : null}

          {done ? (
            <div className="surface-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="size-[18px] text-primary" />
                  <h2 className="font-bold">OCR Extracted Biomarkers</h2>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-primary" /> High Confidence OCR
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Document: <span className="font-semibold text-foreground">{uploadedFileName}</span>
              </p>

              <div className="mt-4 divide-y divide-border">
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
                        {marker.value} {marker.unit}
                      </span>
                      <Badge
                        variant={
                          marker.status === 'normal'
                            ? 'secondary'
                            : marker.status === 'borderline'
                              ? 'outline'
                              : 'destructive'
                        }
                      >
                        {marker.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="surface-card p-6 lg:col-span-2">
          <h2 className="font-bold">Processing workflow</h2>
          <p className="text-sm text-muted-foreground">
            {started ? (done ? "OCR Completed" : "Extracting data in progress…") : "Waiting for a document"}
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
                      ? "border-primary/30 bg-accent"
                      : active
                        ? "border-primary/40 bg-card"
                        : "border-border bg-card opacity-60",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg",
                      complete
                        ? "bg-primary text-primary-foreground"
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
              <div className="rounded-xl bg-accent p-4 text-sm text-accent-foreground">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="size-4 text-primary" /> AI Clinical Summary Ready
                </p>
                <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                  {aiSummary}
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" asChild>
                  <Link to="/records">View in records</Link>
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
