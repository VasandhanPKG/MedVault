import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Sparkles,
  History,
  CheckCircle2,
  RotateCcw,
  Calendar,
  Eye,
  QrCode,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DepartmentSelector } from "@/components/intake/department-selector";
import { AdaptiveQuestionCard } from "@/components/intake/adaptive-question-card";
import { DoctorIntakeViewer } from "@/components/intake/doctor-intake-viewer";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export function IntakePage() {
  const { sessionId: paramSessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"intake" | "history">("intake");
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>("dental");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  // Interview Session State
  const [sessionId, setSessionId] = useState<string | null>(paramSessionId || null);
  const [session, setSession] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pastInterviews, setPastInterviews] = useState<any[]>([]);

  // Load departments and history on mount
  useEffect(() => {
    api.getIntakeDepartments()
      .then((res) => {
        if (res.departments) {
          setDepartments(res.departments);
        }
      })
      .catch((err) => console.error("Failed to load departments:", err));

    loadHistory();
  }, []);

  const loadHistory = () => {
    api.getPatientIntakes()
      .then((res) => {
        if (res.interviews) {
          setPastInterviews(res.interviews);
        }
      })
      .catch((err) => console.error("Failed to load interview history:", err));
  };

  // If a sessionId parameter was provided in the route, load that session
  useEffect(() => {
    if (paramSessionId) {
      setLoading(true);
      api.getIntakeSummary(paramSessionId)
        .then((res) => {
          if (res.session) {
            setSessionId(paramSessionId);
            setSession(res.session);
            setSummary(res.summary);
            setRedFlags(res.session.redFlags || []);
          }
        })
        .catch(() => toast.error("Could not load requested intake session"))
        .finally(() => setLoading(false));
    }
  }, [paramSessionId]);

  const handleStartInterview = async () => {
    if (!selectedDeptId) {
      toast.error("Please select a medical department");
      return;
    }

    setLoading(true);
    try {
      const res = await api.startIntakeSession({
        departmentId: selectedDeptId,
        language: selectedLanguage,
      });

      setSessionId(res.sessionId);
      setSession({
        id: res.sessionId,
        departmentId: res.department.id,
        departmentName: res.department.name,
        language: res.language,
        status: res.status,
      });
      setCurrentQuestion(res.currentQuestion);
      setSummary(null);
      setRedFlags([]);
      toast.success(`Starting ${res.department.name} adaptive intake`);
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize intake session");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (
    answerText: string,
    inputMode: "voice" | "text" | "touch"
  ) => {
    if (!sessionId) return;
    setLoading(true);

    try {
      const res = await api.submitIntakeAnswer(sessionId, {
        answerText,
        inputMode,
        language: selectedLanguage,
      });

      if (res.redFlags && res.redFlags.length > 0) {
        setRedFlags(res.redFlags);
      }

      if (res.isComplete || res.status === "completed") {
        setSummary(res.summary);
        setSession((prev: any) => ({
          ...prev,
          status: "completed",
          summary: res.summary,
          redFlags: res.redFlags,
        }));
        setCurrentQuestion(null);
        toast.success("Pre-consultation intake completed! Formatted summary & QR code generated.");
        loadHistory();
      } else if (res.nextQuestion) {
        setCurrentQuestion(res.nextQuestion);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process response");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSummary = async (updatedSummary: any) => {
    if (!sessionId) return;
    try {
      const res = await api.updateIntakeSummary(sessionId, {
        summary: updatedSummary,
      });
      setSummary(updatedSummary);
      setSession(res.session);
      toast.success("Summary fields updated");
      loadHistory();
    } catch (err: any) {
      toast.error(err.message || "Failed to update summary");
    }
  };

  const handleReset = () => {
    setSessionId(null);
    setSession(null);
    setCurrentQuestion(null);
    setSummary(null);
    setRedFlags([]);
  };

  const viewPastSession = (s: any) => {
    setSessionId(s.id);
    setSession(s);
    setSummary(s.summary);
    setRedFlags(s.redFlags || []);
    setCurrentQuestion(null);
    setActiveTab("intake");
  };

  return (
    <AppShell
      title="Department-Specific AI Clinical Intake"
      description="Adaptive multimodal pre-consultation intake with instant structured summary & QR handoff."
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-card p-1 border border-border">
              <TabsTrigger value="intake" className="rounded-xl text-xs font-bold gap-1.5">
                <Sparkles className="size-3.5" />
                {summary ? "Pre-Consultation Summary & QR" : currentQuestion ? "Active Interview" : "New Intake"}
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl text-xs font-bold gap-1.5">
                <History className="size-3.5" />
                Intake History ({pastInterviews.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {sessionId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 text-xs font-semibold"
            >
              <RotateCcw className="size-3.5" /> Start New Intake
            </Button>
          )}
        </div>

        {/* Tab 1: Intake Flow */}
        {activeTab === "intake" && (
          <div>
            {!sessionId ? (
              <DepartmentSelector
                departments={departments}
                selectedDeptId={selectedDeptId}
                selectedLanguage={selectedLanguage}
                onSelectDepartment={setSelectedDeptId}
                onSelectLanguage={setSelectedLanguage}
                onStartInterview={handleStartInterview}
                loading={loading}
              />
            ) : currentQuestion ? (
              <AdaptiveQuestionCard
                department={{
                  id: session?.departmentId || selectedDeptId || "dental",
                  name: session?.departmentName || "Clinical Intake",
                }}
                question={currentQuestion}
                language={selectedLanguage}
                redFlags={redFlags}
                onSubmitAnswer={handleSubmitAnswer}
                loading={loading}
              />
            ) : summary ? (
              <DoctorIntakeViewer
                session={session}
                summary={summary}
                onUpdateSummary={handleUpdateSummary}
                onStartNew={handleReset}
              />
            ) : null}
          </div>
        )}

        {/* Tab 2: History */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Past Pre-Consultation Intake Records
                </h3>
                <p className="text-xs text-muted-foreground">
                  Historical structured interviews recorded in your personal vault.
                </p>
              </div>
            </div>

            {pastInterviews.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
                <History className="size-8 mx-auto mb-2 text-muted-foreground/60" />
                <p className="font-semibold">No pre-consultation interviews recorded yet</p>
                <p className="text-xs mt-1">
                  Select a department above to complete your first adaptive clinical intake.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastInterviews.map((past) => (
                  <div
                    key={past.id}
                    className="surface-card flex flex-col justify-between rounded-3xl border border-border bg-card p-5 space-y-4 shadow-sm hover:border-primary/40 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="font-bold text-xs">
                          {past.departmentName}
                        </Badge>
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px]">
                          <QrCode className="size-3" /> Summary & QR Ready
                        </Badge>
                      </div>

                      <h4 className="text-sm font-bold text-foreground">
                        {past.summary?.chiefComplaint || "Pre-Consultation Intake"}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {past.summary?.clinicalNarrative || "Clinical history recorded."}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(past.createdAt).toLocaleDateString()}
                        </span>
                        <span>Language: {past.language?.toUpperCase() || "EN"}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewPastSession(past)}
                      className="w-full gap-1.5 text-xs font-bold"
                    >
                      <Eye className="size-3.5" /> View Summary & Smart QR
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default IntakePage;
