import { useState } from "react";
import {
  Smile,
  HeartPulse,
  Bone,
  Eye,
  Sparkles,
  Ear,
  Wind,
  Soup,
  Stethoscope,
  Leaf,
  Globe2,
  Search,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  Smile,
  HeartPulse,
  Bone,
  Eye,
  Sparkles,
  Ear,
  Wind,
  Soup,
  Stethoscope,
  Leaf,
};

interface DepartmentSelectorProps {
  departments: any[];
  selectedDeptId: string | null;
  selectedLanguage: string;
  onSelectDepartment: (deptId: string) => void;
  onSelectLanguage: (lang: string) => void;
  onStartInterview: () => void;
  loading?: boolean;
}

const languages = [
  { code: "en", label: "English", sub: "Standard English", flag: "🇬🇧" },
  { code: "ta", label: "தமிழ்", sub: "Tamil", flag: "🇮🇳" },
  { code: "hi", label: "हिंदी", sub: "Hindi", flag: "🇮🇳" },
];

export function DepartmentSelector({
  departments,
  selectedDeptId,
  selectedLanguage,
  onSelectDepartment,
  onSelectLanguage,
  onStartInterview,
  loading = false,
}: DepartmentSelectorProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(departments.map((d) => d.category)))];

  const filteredDepts = departments.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase()) ||
      (d.commonSymptoms &&
        d.commonSymptoms.some((s: string) => s.toLowerCase().includes(search.toLowerCase())));
    const matchesCat = selectedCategory === "All" || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const activeDept = departments.find((d) => d.id === selectedDeptId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/20 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3.5" /> Department-Aware AI Clinical Intake
            </div>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl text-foreground">
              Select Medical Department
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
              MedVault's AI co-pilot will conduct an adaptive pre-consultation interview in your preferred
              language, organizing clinical history for your doctor before your appointment begins.
            </p>
          </div>

          {/* Language Picker */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <Globe2 className="size-3.5 text-primary" /> Interview Language / மொழி
            </label>
            <div className="flex rounded-2xl border border-border bg-card p-1 shadow-xs">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onSelectLanguage(lang.code)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all",
                    selectedLanguage === lang.code
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clinical specialty or symptoms (e.g., Toothache, Knee Pain, Cough)…"
              className="pl-9 h-11 bg-background/80"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="rounded-xl text-xs font-medium shrink-0 h-11"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepts.map((dept) => {
          const IconComp = iconMap[dept.icon] || Stethoscope;
          const isSelected = selectedDeptId === dept.id;

          return (
            <div
              key={dept.id}
              onClick={() => onSelectDepartment(dept.id)}
              className={cn(
                "group relative flex flex-col justify-between rounded-2xl border p-5 cursor-pointer transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-md"
                  : "border-border bg-card hover:border-primary/40 hover:bg-accent/30 hover:shadow-sm"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "flex size-11 items-center justify-center rounded-2xl transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                    )}
                  >
                    <IconComp className="size-5" />
                  </div>
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {dept.category}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {dept.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {dept.description}
                  </p>
                </div>

                {dept.commonSymptoms && dept.commonSymptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {dept.commonSymptoms.slice(0, 3).map((sym: string, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-accent/60 px-2 py-0.5 text-[11px] font-medium text-foreground"
                      >
                        {sym}
                      </span>
                    ))}
                    {dept.commonSymptoms.length > 3 && (
                      <span className="rounded-lg bg-accent/30 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        +{dept.commonSymptoms.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                <span className="text-muted-foreground font-medium">
                  ~{dept.totalQuestions || 8} Adaptive Questions
                </span>
                <span
                  className={cn(
                    "font-bold inline-flex items-center gap-1 transition-colors",
                    isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  )}
                >
                  {isSelected ? "Selected ✓" : "Select"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDepts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <Stethoscope className="size-8 mx-auto mb-2 text-muted-foreground/60" />
          <p className="font-semibold">No medical departments match "{search}"</p>
          <p className="text-xs mt-1">Try searching for generic symptoms or clear the filter.</p>
        </div>
      )}

      {/* Floating Bottom Action Bar when Selected */}
      {activeDept && (
        <div className="sticky bottom-4 z-20 rounded-2xl border border-primary/30 bg-card/95 p-4 backdrop-blur-md shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
              {iconMap[activeDept.icon] ? (
                (() => {
                  const Icon = iconMap[activeDept.icon];
                  return <Icon className="size-5" />;
                })()
              ) : (
                <Smile className="size-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Ready for {activeDept.name} Pre-Consultation
              </p>
              <p className="text-xs text-muted-foreground">
                Interview will be conducted in{" "}
                <span className="font-semibold text-primary">
                  {languages.find((l) => l.code === selectedLanguage)?.label}
                </span>{" "}
                using Voice, Text, or Quick Touch.
              </p>
            </div>
          </div>

          <Button
            onClick={onStartInterview}
            disabled={loading}
            size="lg"
            className="gap-2 font-bold px-6 shadow-md"
          >
            {loading ? "Starting AI Engine…" : "Begin AI Intake"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
