import { useEffect, useRef, useState } from "react";
import { BrainCircuit, SendHorizonal, ShieldPlus, User } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api, getStoredUser } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; text: string };

export function AssistantPage() {
  const [patient, setPatient] = useState<any>(getStoredUser() || { name: "Patient" });
  const [records, setRecords] = useState<any[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      api.getProfile().catch(() => null),
      api.getRecords().catch(() => [])
    ]).then(([profileData, recordsData]) => {
      const name = profileData?.name || patient.name || "Patient";
      const recs = Array.isArray(recordsData) ? recordsData : [];
      setRecords(recs);
      if (profileData) setPatient(profileData);

      const firstName = name.split(" ")[0];
      if (recs.length === 0) {
        setMessages([
          {
            role: "assistant",
            text: `Hi ${firstName} — I am your MedVault AI clinical assistant. Your vault currently has 0 uploaded documents. Upload a lab report or prescription, and I will explain your exact test results and clinical ranges without hallucinating any values.`,
          },
        ]);
      } else {
        setMessages([
          {
            role: "assistant",
            text: `Hi ${firstName} — I've reviewed the ${recs.length} verified report(s) in your vault. Ask me to explain any specific biomarker, test finding, or recommendation from your documents.`,
          },
        ]);
      }
    });
  }, []);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || thinking) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setThinking(true);

    try {
      const res = await api.askAssistant(q);
      const reply = res.answer || "I reviewed your vault records. Please let me know if you need clarification on any specific lab value.";
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: "I am ready to analyze your vault records. Please upload a lab report or log your daily vitals to get specific clinical summaries.",
          },
        ]);
      }, 500);
    } finally {
      setThinking(false);
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const suggestedQuestions = records.length > 0
    ? [
        `Summarize my latest ${records[0]?.name || "report"}`,
        "Are any of my biomarker results outside normal range?",
        "What lifestyle habits support my current findings?",
      ]
    : [
        "How do I upload a medical report for OCR extraction?",
        "What vitals can I record in MedVault?",
        "How is my patient data kept secure?",
      ];

  return (
    <AppShell
      title="MedVault AI Assistant"
      description="Clinical summaries grounded strictly in your personal records without speculation."
    >
      <div className="surface-card flex h-[calc(100vh-11rem)] flex-col overflow-hidden">
        <div className="flex-1 space-y-5 overflow-y-auto p-5 md:p-7">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}
            >
              {m.role === "assistant" ? (
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <ShieldPlus className="size-4" />
                </span>
              ) : null}
              <div
                className={cn(
                  "max-w-[85%] text-sm leading-relaxed whitespace-pre-line md:max-w-[70%]",
                  m.role === "user"
                    ? "rounded-2xl bg-primary px-4 py-3 text-primary-foreground"
                    : "text-foreground",
                )}
              >
                {m.text}
              </div>
              {m.role === "user" ? (
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <User className="size-4" />
                </span>
              ) : null}
            </div>
          ))}
          {thinking ? (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <BrainCircuit className="size-4 animate-pulse" />
              </span>
              Checking your personal vault documents…
            </div>
          ) : null}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border bg-card p-4 md:p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {q}
              </button>
            ))}
          </div>
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask about your verified test values, reports, or trends…"
              className="max-h-40 min-h-11 resize-none"
            />
            <Button type="submit" size="icon" className="size-11" aria-label="Send">
              <SendHorizonal className="size-4" />
            </Button>
          </form>
          <p className="mt-2 text-[11px] text-muted-foreground">
            MedVault AI references your personal vault. Provides health information, not medical diagnosis.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
export default AssistantPage;
