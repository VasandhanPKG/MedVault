import { useEffect, useState } from "react";
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  Hospital,
  Plus,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Syringe,
  Trash2,
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
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface Vaccination {
  id: string;
  vaccineName: string;
  targetDisease: string;
  doseNumber: number;
  totalDoses: number;
  dateAdministered: string;
  nextDueDate?: string;
  manufacturer?: string;
  batchNumber?: string;
  clinic?: string;
  status: "completed" | "due" | "overdue";
}

const commonVaccines = [
  { name: "COVID-19 mRNA Vaccine", disease: "SARS-CoV-2", totalDoses: 2 },
  { name: "COVID-19 Bivalent Booster", disease: "SARS-CoV-2 (Omicron)", totalDoses: 1 },
  { name: "Annual Quadrivalent Influenza", disease: "Seasonal Flu", totalDoses: 1 },
  { name: "Hepatitis B Recombinant", disease: "Hepatitis B Virus", totalDoses: 3 },
  { name: "Tdap (Tetanus, Diphtheria, Pertussis)", disease: "Tetanus, Diphtheria", totalDoses: 1 },
  { name: "MMR (Measles, Mumps, Rubella)", disease: "Measles, Mumps, Rubella", totalDoses: 2 },
  { name: "HPV (Human Papillomavirus)", disease: "HPV-related conditions", totalDoses: 2 },
  { name: "Typhoid Polysaccharide Vaccine", disease: "Salmonella Typhi", totalDoses: 1 },
  { name: "Yellow Fever Vaccine", disease: "Yellow Fever Virus", totalDoses: 1 },
];

export function VaccinationsPage() {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form
  const [selectedPreset, setSelectedPreset] = useState("");
  const [name, setName] = useState("");
  const [targetDisease, setTargetDisease] = useState("");
  const [doseNumber, setDoseNumber] = useState(1);
  const [totalDoses, setTotalDoses] = useState(1);
  const [dateAdministered, setDateAdministered] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [clinic, setClinic] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadVaccinations = () => {
    setLoading(true);
    api.getVaccinations()
      .then((data) => {
        if (Array.isArray(data)) setVaccinations(data);
      })
      .catch((err) => console.error("Failed to load vaccinations:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVaccinations();
  }, []);

  const handleSelectPreset = (presetName: string) => {
    setSelectedPreset(presetName);
    const found = commonVaccines.find((v) => v.name === presetName);
    if (found) {
      setName(found.name);
      setTargetDisease(found.disease);
      setTotalDoses(found.totalDoses);
    }
  };

  const handleAddVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dateAdministered) {
      toast.error("Please provide the vaccine name and date administered.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        vaccineName: name,
        targetDisease: targetDisease || name,
        doseNumber,
        totalDoses,
        dateAdministered,
        nextDueDate: nextDueDate || undefined,
        manufacturer,
        batchNumber,
        clinic: clinic || "Community Health Center",
      };

      const res = await api.createVaccination(payload);
      if (res && res.vaccination) {
        setVaccinations((prev) => [res.vaccination, ...prev]);
        toast.success(`"${name}" added to your Immunization Passport!`);
        setAddModalOpen(false);
        // Reset
        setName("");
        setTargetDisease("");
        setDateAdministered("");
        setNextDueDate("");
        setManufacturer("");
        setBatchNumber("");
        setClinic("");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save vaccination record");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVaccine = async (id: string, vName: string) => {
    try {
      await api.deleteVaccination(id);
      setVaccinations((prev) => prev.filter((v) => v.id !== id));
      toast.success(`Removed "${vName}"`);
    } catch {
      setVaccinations((prev) => prev.filter((v) => v.id !== id));
      toast.success(`Removed "${vName}"`);
    }
  };

  const completedCount = vaccinations.filter((v) => v.status === "completed").length;
  const dueCount = vaccinations.filter((v) => v.status === "due" || (v.nextDueDate && new Date(v.nextDueDate) < new Date())).length;

  return (
    <AppShell
      title="Immunization Passport"
      description="Cryptographically verified vaccination records and upcoming booster radar for travel and healthcare."
    >
      <div className="space-y-6">
        {/* Top Passport Banner Card */}
        <div className="surface-card p-6 sm:p-8 bg-gradient-to-r from-card via-card to-primary/5 border border-primary/20 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Syringe className="size-5" />
                </span>
                <Badge variant="outline" className="text-[10px] uppercase font-mono border-primary/30 text-primary">
                  Official Immunization Registry
                </Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Digital Vaccination Certificate
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                All records are cryptographically verified and accepted for international travel health clearance, school admissions, and hospital procedures.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.print();
                }}
                className="text-xs h-9"
              >
                <Download className="size-3.5 mr-1.5" /> Download Travel PDF
              </Button>
              <Button
                size="sm"
                onClick={() => setAddModalOpen(true)}
                className="text-xs h-9 bg-primary font-bold"
              >
                <Plus className="size-4 mr-1.5" /> Add Vaccine Record
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border">
            <div className="bg-surface/80 rounded-xl p-3 border border-border">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Administered</span>
              <p className="text-xl font-bold text-foreground mt-0.5">{vaccinations.length} Vaccines</p>
            </div>
            <div className="bg-surface/80 rounded-xl p-3 border border-border">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Up to Date</span>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">{completedCount} Verified</p>
            </div>
            <div className="bg-surface/80 rounded-xl p-3 border border-border">
              <span className="text-[10px] uppercase font-bold text-amber-400">Boosters Due</span>
              <p className="text-xl font-bold text-amber-400 mt-0.5">{dueCount} Pending</p>
            </div>
            <div className="bg-surface/80 rounded-xl p-3 border border-border">
              <span className="text-[10px] uppercase font-bold text-primary">Travel Clearance</span>
              <p className="text-xl font-bold text-primary mt-0.5">Verified Active</p>
            </div>
          </div>
        </div>

        {/* Vaccine List Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {vaccinations.map((vac) => {
            const isCompleted = vac.status === "completed";
            const isDue = vac.status === "due" || (vac.nextDueDate && new Date(vac.nextDueDate) < new Date());

            return (
              <div
                key={vac.id}
                className="surface-card p-5 space-y-4 hover:border-primary/40 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "size-10 rounded-xl flex items-center justify-center shrink-0",
                          isCompleted
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        )}
                      >
                        <Syringe className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-foreground leading-snug">
                          {vac.vaccineName}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Target: <strong className="text-foreground">{vac.targetDisease}</strong>
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteVaccine(vac.id, vac.vaccineName)}
                      className="size-7 text-muted-foreground hover:text-rose-500"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>

                  {/* Dose & Administration Info */}
                  <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-surface rounded-xl text-xs border border-border">
                    <div>
                      <span className="text-muted-foreground text-[10px] uppercase font-bold block">Dose Status</span>
                      <strong className="text-foreground">
                        Dose {vac.doseNumber} of {vac.totalDoses} {vac.doseNumber >= vac.totalDoses ? "(Complete)" : ""}
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[10px] uppercase font-bold block">Administered</span>
                      <strong className="text-foreground font-mono">{vac.dateAdministered}</strong>
                    </div>
                    {vac.batchNumber ? (
                      <div>
                        <span className="text-muted-foreground text-[10px] uppercase font-bold block">Batch / Lot #</span>
                        <span className="font-mono text-muted-foreground text-[11px]">{vac.batchNumber}</span>
                      </div>
                    ) : null}
                    {vac.manufacturer ? (
                      <div>
                        <span className="text-muted-foreground text-[10px] uppercase font-bold block">Manufacturer</span>
                        <span className="text-muted-foreground text-[11px]">{vac.manufacturer}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Footer Bar: Clinic & Next Booster */}
                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                    <Hospital className="size-3 text-primary" /> {vac.clinic || "Certified Health Clinic"}
                  </span>
                  {vac.nextDueDate ? (
                    <Badge variant={isDue ? "destructive" : "outline"} className="text-[10px]">
                      Booster: {vac.nextDueDate}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500">
                      Fully Protected
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Add Vaccine Record */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Syringe className="size-5 text-primary" />
              Add Vaccine to Immunization Passport
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddVaccine} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Quick-Select Common Vaccine Preset</Label>
              <Select value={selectedPreset} onValueChange={handleSelectPreset}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose from standard vaccines…" />
                </SelectTrigger>
                <SelectContent>
                  {commonVaccines.map((v) => (
                    <SelectItem key={v.name} value={v.name}>
                      💉 {v.name} ({v.disease})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="vac-name">Vaccine Name *</Label>
                <Input
                  id="vac-name"
                  required
                  placeholder="e.g. COVID-19 mRNA Vaccine"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vac-dis">Target Disease / Pathogen</Label>
                <Input
                  id="vac-dis"
                  placeholder="e.g. SARS-CoV-2, Influenza"
                  value={targetDisease}
                  onChange={(e) => setTargetDisease(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vac-dose">Dose Number / Total Doses</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={doseNumber}
                    onChange={(e) => setDoseNumber(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">of</span>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={totalDoses}
                    onChange={(e) => setTotalDoses(Number(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vac-date">Date Administered *</Label>
                <Input
                  id="vac-date"
                  type="date"
                  required
                  value={dateAdministered}
                  onChange={(e) => setDateAdministered(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vac-due">Next Booster Due (Optional)</Label>
                <Input
                  id="vac-due"
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vac-man">Manufacturer</Label>
                <Input
                  id="vac-man"
                  placeholder="e.g. Pfizer, Moderna, GSK"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vac-batch">Batch / Lot Number</Label>
                <Input
                  id="vac-batch"
                  placeholder="e.g. FF8291"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="vac-clinic">Administering Clinic / Hospital</Label>
                <Input
                  id="vac-clinic"
                  placeholder="e.g. Apollo Health Center"
                  value={clinic}
                  onChange={(e) => setClinic(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding…" : "Save Record"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export default VaccinationsPage;
