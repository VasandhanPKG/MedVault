import { useRef, useState } from "react";
import { FileUp, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UploadDropzone({
  compact = false,
  onFiles,
}: {
  compact?: boolean;
  onFiles?: ((files: File[]) => void) | undefined;
}) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setFileName(files[0]?.name ?? null);
    onFiles?.(Array.from(files));
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files);
      }}
      className={cn(
        "surface-card flex flex-col items-center justify-center border-2 border-dashed text-center transition-colors",
        compact ? "p-8" : "p-12",
        dragging ? "border-primary bg-accent" : "border-border",
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <UploadCloud className="size-7" />
      </span>
      <p className="mt-4 font-semibold">Drag & drop your report here</p>
      <p className="mt-1 text-sm text-muted-foreground">
        PDF, JPG or PNG up to 25 MB — lab reports, prescriptions and scans
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />
      <Button className="mt-5" onClick={() => inputRef.current?.click()}>
        <FileUp className="size-4" /> Browse files
      </Button>
      {fileName ? (
        <p className="mt-3 text-xs font-medium text-primary">Selected: {fileName}</p>
      ) : null}
    </div>
  );
}
