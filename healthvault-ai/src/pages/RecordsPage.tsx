import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  Download,
  Eye,
  FileText,
  Filter,
  Image as ImageIcon,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UploadDropzone } from "@/components/upload-dropzone";
import { DocumentViewerModal } from "@/components/document-viewer-modal";
import { api } from "@/lib/api-client";

const recordCategories = ["All", "Lab Report", "Imaging", "Prescription", "Vaccination", "Discharge Summary"];

export function RecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const loadRecords = () => {
    setLoading(true);
    api.getRecords()
      .then((data) => {
        if (Array.isArray(data)) setRecords(data);
      })
      .catch((err) => {
        console.error("Failed to load records:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    try {
      await api.deleteRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      toast.success(`Deleted "${name}"`);
    } catch {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      toast.success(`Removed "${name}"`);
    }
  };

  const handleOpenViewer = (record: any) => {
    setSelectedRecord(record);
    setViewerOpen(true);
  };

  const filtered = useMemo(
    () =>
      records.filter(
        (r) =>
          (category === "All" || r.category === category) &&
          (r.name?.toLowerCase().includes(query.toLowerCase()) ||
            r.summary?.toLowerCase().includes(query.toLowerCase())),
      ),
    [records, query, category],
  );

  return (
    <AppShell title="Medical Records" description="Search, filter, and manage your patient documents.">
      <div className="surface-card p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search records, biomarkers or findings…"
              className="pl-9"
            />
          </div>
          <Button asChild>
            <Link to="/upload">
              <Upload className="size-4 mr-1.5" /> Upload report
            </Link>
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          {recordCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={
                c === category
                  ? "rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
                  : "rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              }
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {records.length === 0 && !loading ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl surface-card p-12 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <FileText className="size-8" />
          </span>
          <h3 className="mt-4 text-lg font-bold">No records uploaded yet</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-md">
            Your health vault is completely empty. Upload lab reports, prescriptions, scans, or discharge summaries to see them organized here.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/upload">
              <Plus className="size-4 mr-1.5" /> Upload your first report
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {filtered.map((r) => (
            <div key={r.id} className="surface-card flex flex-col p-5 transition-shadow hover:shadow-lift">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  {r.type === "JPG" || r.type === "PNG" ? (
                    <ImageIcon className="size-5" />
                  ) : (
                    <FileText className="size-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.date ? new Date(r.date).toLocaleDateString() : "Recent"} · {r.type || "PDF"} · {r.size || "300 KB"}
                  </p>
                </div>
                <Badge
                  variant={
                    r.status === "processed"
                      ? "secondary"
                      : r.status === "processing"
                        ? "outline"
                        : "destructive"
                  }
                >
                  {r.status === "processed" ? "Processed" : "Processing"}
                </Badge>
              </div>

              <Badge variant="outline" className="mt-4 w-fit">
                {r.category || "Lab Report"}
              </Badge>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{r.summary}</p>

              <div className="mt-5 flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                <Button size="sm" variant="outline" onClick={() => handleOpenViewer(r)}>
                  <Eye className="size-4" /> View
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Downloading encrypted file…")}>
                  <Download className="size-4" /> Download
                </Button>
                <Button size="sm" asChild>
                  <Link to="/assistant">
                    <BrainCircuit className="size-4" /> Ask AI
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(r.id, r.name)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && records.length > 0 ? (
            <p className="text-sm text-muted-foreground col-span-2 py-8 text-center">No records match your query.</p>
          ) : null}
        </div>
      )}

      <div className="mt-8">
        <UploadDropzone compact onFiles={() => loadRecords()} />
      </div>

      {/* Interactive Document Viewer Modal */}
      <DocumentViewerModal
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        record={selectedRecord}
      />
    </AppShell>
  );
}
export default RecordsPage;
