import { Link } from "react-router-dom";
import {
  BrainCircuit,
  FileText,
  LineChart,
  Lock,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/app-shell";

const features = [
  {
    icon: FileText,
    title: "One vault for every record",
    body: "Lab reports, prescriptions, scans and discharge summaries — organised, searchable and always with you.",
  },
  {
    icon: BrainCircuit,
    title: "AI that speaks plain language",
    body: "Ask what a result means and get a clear explanation grounded in your own reports.",
  },
  {
    icon: LineChart,
    title: "Trends that matter",
    body: "HbA1c, cholesterol, blood pressure, BMI and more, tracked automatically over time.",
  },
  {
    icon: ScanLine,
    title: "Automatic data extraction",
    body: "OCR reads your uploads and turns them into structured, comparable health data.",
  },
  {
    icon: QrCode,
    title: "Emergency QR access",
    body: "A token-based QR that lets responders reach your emergency profile — never your full history.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Encrypted storage, granular sharing controls and a full access log you can audit.",
  },
];

const steps = [
  { title: "Upload", body: "Drag in a PDF or photo of any medical report." },
  { title: "Understand", body: "MedVault extracts values and explains them in context." },
  { title: "Track", body: "Watch your key markers trend across months, not visits." },
  { title: "Share safely", body: "Generate a time-limited emergency QR when you need it." },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3.5 md:px-8">
          <Brand />
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mesh-bg">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 text-center md:px-8 md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-accent-foreground shadow-soft">
            <Sparkles className="size-3.5" /> AI-powered personal health record
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl leading-[1.08] font-extrabold tracking-tight text-balance md:text-6xl">
            Your Health History. Powered by AI.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-pretty text-muted-foreground md:text-lg">
            Securely store, understand, and manage your medical records with AI-powered insights.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/register">
                Create your vault <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/dashboard">View live demo</Link>
            </Button>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { k: "OCR", v: "AI document extraction" },
              { k: "AES-256", v: "encrypted storage" },
              { k: "24h", v: "emergency QR tokens" },
              { k: "24/7", v: "AI health assistant" },
            ].map((s) => (
              <div key={s.v} className="surface-card px-4 py-5">
                <p className="text-2xl font-extrabold tracking-tight text-primary">{s.k}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Everything your health file should have been
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          MedVault turns scattered reports into a living, understandable health record.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="surface-card p-6 transition-shadow hover:shadow-lift">
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">How it works</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="surface-card p-6">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Security is the product
            </h2>
            <p className="mt-3 text-muted-foreground">
              Health data deserves more than a folder in cloud storage. MedVault is built so that
              you — and only you — decide what is visible, to whom, and for how long.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                {
                  icon: Lock,
                  t: "Encrypted at rest and in transit",
                  b: "Every document and extracted value is encrypted with per-user keys.",
                },
                {
                  icon: KeyRound,
                  t: "Token-based emergency access",
                  b: "QR codes carry a revocable token, never your medical data.",
                },
                {
                  icon: ShieldCheck,
                  t: "Auditable sharing",
                  b: "See exactly which link was opened, when, and revoke it instantly.",
                },
              ].map((i) => (
                <li key={i.t} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <i.icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{i.t}</p>
                    <p className="text-sm text-muted-foreground">{i.b}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="surface-card p-8">
            <div className="flex items-center gap-3">
              <UploadCloud className="size-5 text-primary" />
              <p className="font-semibold">Processing pipeline</p>
            </div>
            <ol className="mt-6 space-y-4">
              {["Uploading", "OCR processing", "Extracting medical data", "Generating AI knowledge"].map(
                (s, i) => (
                  <li key={s} className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3">
                    <span className="flex size-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{s}</span>
                  </li>
                ),
              )}
            </ol>
            <p className="mt-6 text-xs text-muted-foreground">
              Documents are processed in an isolated environment and never used to train external
              models.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-24 md:px-8">
        <div className="mesh-bg surface-card px-6 py-14 text-center md:px-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-balance md:text-4xl">
            Start your health vault today
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Free to set up. Upload your first report and see what MedVault AI can tell you in under
            a minute.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link to="/register">
              Create free account <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <Brand />
          <p>MedVault provides health information, not medical diagnosis.</p>
        </div>
      </footer>
    </div>
  );
}
export default LandingPage;
