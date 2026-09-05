import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileHeart,
  FileText,
  Filter,
  HeartPulse,
  Hospital,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Trash2,
  UserCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClinicalDossierModal } from "@/components/clinical-dossier-modal";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface HealthCondition {
  id: string;
  title: string;
  category: "Metabolic" | "Orthopedic" | "Respiratory" | "Cardiovascular" | "Deficiency" | "Infection" | "Gastrointestinal" | "General";
  startDate: string;
  endDate?: string;
  isOngoing: boolean;
  status: "active" | "resolved" | "monitoring" | "remission";
  severity: "mild" | "moderate" | "severe";
  symptoms: string[];
  diagnosis: string;
  treatingDoctor?: string;
  hospital?: string;
  outcome?: string;
  linkedRecordIds?: string[];
  createdAt?: string;
}

const categories = [
  "All",
  "Orthopedic",
  "Metabolic",
  "Deficiency",
  "Respiratory",
  "Cardiovascular",
  "Infection",
  "General",
];

export function TimelinePage() {
  const [conditions, setConditions] = useState<HealthCondition[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [dossierOpen, setDossierOpen] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<HealthCondition["category"]>("General");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newIsOngoing, setNewIsOngoing] = useState(true);
  const [newStatus, setNewStatus] = useState<HealthCondition["status"]>("active");
  const [newSeverity, setNewSeverity] = useState<HealthCondition["severity"]>("moderate");
  const [newSymptoms, setNewSymptoms] = useState("");
  const [newDiagnosis, setNewDiagnosis] = useState("");
  const [newDoctor, setNewDoctor] = useState("");
  const [newHospital, setNewHospital] = useState("");
  const [newOutcome, setNewOutcome] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [condData, recData] = await Promise.all([
        api.getConditions().catch(() => []),
        api.getRecords().catch(() => []),
      ]);
      if (Array.isArray(condData)) setConditions(condData);
      if (Array.isArray(recData)) setRecords(recData);
    } catch (e) {
      console.error("Failed to load timeline data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCondition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newStartDate) {
      toast.error("Please provide both a Title and Start Date");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: newTitle,
        category: newCategory,
        startDate: newStartDate,
        endDate: newIsOngoing ? undefined : newEndDate,
        isOngoing: newIsOngoing,
        status: newStatus,
        severity: newSeverity,
        symptoms: newSymptoms.split(",").map((s) => s.trim()).filter(Boolean),
        diagnosis: newDiagnosis || newTitle,
        treatingDoctor: newDoctor,
        hospital: newHospital,
        outcome: newOutcome,
      };

      const res = await api.createCondition(payload);
      if (res && res.condition) {
        setConditions((prev) => [res.condition, ...prev]);
        toast.success(`"${newTitle}" added to your health journey!`);
        setAddModalOpen(false);
        // Reset
        setNewTitle("");
        setNewStartDate("");
        setNewEndDate("");
        setNewSymptoms("");
        setNewDiagnosis("");
        setNewDoctor("");
        setNewHospital("");
        setNewOutcome("");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to record health condition");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCondition = async (id: string, title: string) => {
    try {
      await api.deleteCondition(id);
      setConditions((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Removed "${title}" from timeline`);
    } catch {
      setConditions((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Removed "${title}" from timeline`);
    }
  };

  const formatDuration = (startDate: string, endDate?: string, isOngoing?: boolean) => {
    const start = new Date(startDate);
    const end = isOngoing || !endDate ? new Date() : new Date(endDate);

    const startYear = start.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const endStr = isOngoing || !endDate ? "Ongoing" : new Date(endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" });

    // calculate difference in months
    const months = Math.max(1, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
    let durationStr = "";
    if (months < 12) {
      durationStr = `${months} mo${months > 1 ? "s" : ""}`;
    } else {
      const yrs = Math.floor(months / 12);
      const remMonths = months % 12;
      durationStr = remMonths > 0 ? `${yrs} yr ${remMonths} mo` : `${yrs} yr${yrs > 1 ? "s" : ""}`;
    }

    return {
      period: `${startYear} – ${endStr}`,
      duration: isOngoing ? `Active (${durationStr})` : durationStr,
    };
  };

  const filteredConditions = useMemo(() => {
    return conditions.filter((c) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? c.isOngoing || c.status === "active" || c.status === "monitoring"
          : !c.isOngoing || c.status === "resolved";

      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        c.title.toLowerCase().includes(q) ||
        c.diagnosis.toLowerCase().includes(q) ||
        c.symptoms.some((s) => s.toLowerCase().includes(q)) ||
        c.treatingDoctor?.toLowerCase().includes(q) ||
        c.hospital?.toLowerCase().includes(q);

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [conditions, statusFilter, selectedCategory, searchQuery]);

  return (
    <AppShell
      title="Patient Health Journey"
      description="Chronological timeline of your historical and active health conditions, illnesses, and diagnoses."
    >
      <div className="space-y-6">
        {/* Top Action & Summary Bar */}
        <div className="surface-card p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search illnesses, symptoms, doctors…"
                  className="pl-9 text-sm"
                />
              </div>

              <div className="flex items-center gap-1 bg-surface rounded-xl p-1 border border-border">
                <Button
                  size="sm"
                  variant={statusFilter === "all" ? "default" : "ghost"}
                  className="text-xs h-8 px-3 rounded-lg"
                  onClick={() => setStatusFilter("all")}
                >
                  All ({conditions.length})
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "active" ? "default" : "ghost"}
                  className="text-xs h-8 px-3 rounded-lg"
                  onClick={() => setStatusFilter("active")}
                >
                  Active ({conditions.filter((c) => c.isOngoing || c.status === "active").length})
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "resolved" ? "default" : "ghost"}
                  className="text-xs h-8 px-3 rounded-lg"
                  onClick={() => setStatusFilter("resolved")}
                >
                  Resolved ({conditions.filter((c) => !c.isOngoing || c.status === "resolved").length})
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDossierOpen(true)}
                className="text-xs h-9"
              >
                <Download className="size-3.5 mr-1.5" /> Doctor Dossier PDF
              </Button>
              <Button
                size="sm"
                onClick={() => setAddModalOpen(true)}
                className="text-xs h-9 bg-primary font-bold"
              >
                <Plus className="size-4 mr-1.5" /> Log Health Condition
              </Button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-2 border-t border-border">
            <Filter className="size-3.5 text-muted-foreground mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                  selectedCategory === cat
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Stream */}
        <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
          {filteredConditions.length > 0 ? (
            filteredConditions.map((condition) => {
              const { period, duration } = formatDuration(
                condition.startDate,
                condition.endDate,
                condition.isOngoing
              );

              const isActive = condition.isOngoing || condition.status === "active";
              const isMonitoring = condition.status === "monitoring";

              return (
                <div key={condition.id} className="relative group">
                  {/* Timeline Dot Icon */}
                  <span
                    className={cn(
                      "absolute -left-6 sm:-left-10 top-1.5 flex size-7 items-center justify-center rounded-full border-2 transition-transform group-hover:scale-110 shadow-sm",
                      isActive
                        ? "bg-rose-500 border-rose-200 text-white"
                        : isMonitoring
                        ? "bg-amber-500 border-amber-200 text-white"
                        : "bg-emerald-600 border-emerald-200 text-white"
                    )}
                  >
                    {isActive ? (
                      <HeartPulse className="size-3.5" />
                    ) : isMonitoring ? (
                      <Clock className="size-3.5" />
                    ) : (
                      <CheckCircle2 className="size-3.5" />
                    )}
                  </span>

                  {/* Main Condition Card */}
                  <div className="surface-card p-5 sm:p-6 transition-all hover:border-primary/40 shadow-sm space-y-4">
                    {/* Header Row: Title, Dates, Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-muted-foreground flex items-center gap-1">
                            <Calendar className="size-3.5 text-primary" /> {period}
                          </span>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {duration}
                          </Badge>
                          <Badge
                            className={cn(
                              "text-[10px] uppercase font-bold",
                              isActive
                                ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
                                : isMonitoring
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                            )}
                          >
                            {condition.status.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {condition.category}
                          </Badge>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground mt-1.5">
                          {condition.title}
                        </h3>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCondition(condition.id, condition.title)}
                        className="size-8 text-muted-foreground hover:text-rose-500 opacity-60 hover:opacity-100 self-end sm:self-start"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    {/* Clinical Details */}
                    <div className="grid gap-3 sm:grid-cols-2 text-xs bg-surface/60 rounded-2xl p-4 border border-border/80">
                      <div>
                        <span className="font-bold text-muted-foreground flex items-center gap-1">
                          <Stethoscope className="size-3.5 text-primary" /> Diagnosis & Findings
                        </span>
                        <p className="mt-1 text-foreground leading-relaxed">
                          {condition.diagnosis}
                        </p>
                      </div>

                      {condition.outcome ? (
                        <div>
                          <span className="font-bold text-muted-foreground flex items-center gap-1">
                            <Sparkles className="size-3.5 text-emerald-400" /> Resolution & Management
                          </span>
                          <p className="mt-1 text-foreground leading-relaxed">
                            {condition.outcome}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <span className="font-bold text-muted-foreground flex items-center gap-1">
                            <Activity className="size-3.5 text-amber-400" /> Current Care Plan
                          </span>
                          <p className="mt-1 text-foreground leading-relaxed">
                            Active clinical monitoring and therapeutic lifestyle management.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Symptoms & Treating Doctor Tags */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                      {condition.symptoms && condition.symptoms.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-muted-foreground text-[11px] font-semibold">Reported Symptoms:</span>
                          {condition.symptoms.map((symp, sIdx) => (
                            <span
                              key={sIdx}
                              className="bg-muted/40 border border-border px-2.5 py-0.5 rounded-lg text-[11px] text-foreground font-medium"
                            >
                              • {symp}
                            </span>
                          ))}
                        </div>
                      )}

                      {(condition.treatingDoctor || condition.hospital) && (
                        <div className="flex items-center gap-2 text-muted-foreground text-[11px] ml-auto">
                          <Hospital className="size-3.5 text-primary" />
                          <span>
                            {condition.treatingDoctor}{condition.treatingDoctor && condition.hospital ? " · " : ""}{condition.hospital}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="surface-card p-12 text-center space-y-4">
              <FileHeart className="size-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-bold">No health conditions found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No medical events match your current filter. Record a past illness or ongoing diagnosis to build your health timeline.
              </p>
              <Button onClick={() => setAddModalOpen(true)}>
                <Plus className="size-4 mr-1.5" /> Log First Health Episode
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Log New Health Condition */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <FileHeart className="size-5 text-primary" />
              Log Health Condition / Medical Episode
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddCondition} className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cond-title">Condition / Illness Title *</Label>
                <Input
                  id="cond-title"
                  required
                  placeholder="e.g. L4-L5 Lumbar Disc Bulge, Acute Bronchitis, Vitamin D Deficiency"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Medical Category</Label>
                <Select
                  value={newCategory}
                  onValueChange={(val: any) => setNewCategory(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter((c) => c !== "All").map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Current Clinical Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={(val: any) => {
                    setNewStatus(val);
                    if (val === "resolved") setNewIsOngoing(false);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">🔴 Active / Ongoing</SelectItem>
                    <SelectItem value="monitoring">🟡 Chronic / Monitoring</SelectItem>
                    <SelectItem value="resolved">🟢 Resolved / Cured</SelectItem>
                    <SelectItem value="remission">🟣 In Remission</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cond-start">Start Date *</Label>
                <Input
                  id="cond-start"
                  type="date"
                  required
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cond-end">
                  End Date {newIsOngoing ? "(Ongoing)" : ""}
                </Label>
                <Input
                  id="cond-end"
                  type="date"
                  disabled={newIsOngoing}
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  placeholder={newIsOngoing ? "Ongoing" : ""}
                />
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="is-ongoing"
                    checked={newIsOngoing}
                    onChange={(e) => {
                      setNewIsOngoing(e.target.checked);
                      if (e.target.checked) setNewEndDate("");
                    }}
                    className="size-3.5 rounded border-border"
                  />
                  <label htmlFor="is-ongoing" className="text-xs text-muted-foreground cursor-pointer">
                    Condition is currently ongoing / active
                  </label>
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cond-symp">Experienced Symptoms (comma-separated)</Label>
                <Input
                  id="cond-symp"
                  placeholder="e.g. Radiating back pain, Morning stiffness, Fatigue"
                  value={newSymptoms}
                  onChange={(e) => setNewSymptoms(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cond-diag">Diagnosis & Formal Findings</Label>
                <Input
                  id="cond-diag"
                  placeholder="e.g. Confirmed via Lumbar Spine MRI showing diffuse disc protrusion"
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cond-doc">Treating Physician</Label>
                <Input
                  id="cond-doc"
                  placeholder="e.g. Dr. Sarah Bennett (Spine Specialist)"
                  value={newDoctor}
                  onChange={(e) => setNewDoctor(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cond-hosp">Hospital / Clinic</Label>
                <Input
                  id="cond-hosp"
                  placeholder="e.g. City Orthopedic Hospital"
                  value={newHospital}
                  onChange={(e) => setNewHospital(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cond-out">Outcome & Resolution Notes</Label>
                <Input
                  id="cond-out"
                  placeholder="e.g. Treated with 12-week physiotherapy and ergonomic lumbar support"
                  value={newOutcome}
                  onChange={(e) => setNewOutcome(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Recording…" : "Save to Timeline"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 1-Click Doctor Dossier Modal */}
      <ClinicalDossierModal
        open={dossierOpen}
        onOpenChange={setDossierOpen}
        conditions={conditions}
        records={records}
      />
    </AppShell>
  );
}

export default TimelinePage;
