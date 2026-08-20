import type { ReactNode } from "react";
import { HeartPulse, ShieldCheck, Sparkles } from "lucide-react";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-12 md:px-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
      <div className="mesh-bg hidden flex-col justify-center border-l border-border bg-surface px-14 lg:flex">
        <h2 className="max-w-sm text-4xl font-extrabold tracking-tight text-balance">{title}</h2>
        <p className="mt-4 max-w-sm text-muted-foreground">{subtitle}</p>
        <ul className="mt-10 space-y-4">
          {[
            { icon: ShieldCheck, t: "Encrypted, patient-owned storage" },
            { icon: Sparkles, t: "AI explanations for every report" },
            { icon: HeartPulse, t: "Trends across months, not visits" },
          ].map((i) => (
            <li key={i.t} className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-card text-primary shadow-soft">
                <i.icon className="size-5" />
              </span>
              <span className="text-sm font-medium">{i.t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
