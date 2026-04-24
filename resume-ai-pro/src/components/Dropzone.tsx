import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function Dropzone({
  file,
  onFile,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDrop: (accepted) => accepted[0] && onFile(accepted[0]),
  });

  return (
    <AnimatePresence mode="wait">
      {!file ? (
        <motion.div
          key="dropzone"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          {...(getRootProps() as any)}
          className={cn(
            "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all",
            "border-border bg-card/50 hover:border-primary hover:bg-accent/30",
            isDragActive && "border-primary bg-accent/50 scale-[1.01]"
          )}
        >
          <input {...getInputProps()} />
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero shadow-glow">
            <Upload className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="font-display text-lg font-semibold">
            {isDragActive ? "Drop your resume here" : "Drag & drop your resume"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">PDF only · max 10MB</p>
          <p className="mt-4 text-xs text-muted-foreground">or click to browse</p>
        </motion.div>
      ) : (
        <motion.div
          key="file"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-soft"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-hero">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB · PDF
            </p>
          </div>
          <button
            onClick={() => onFile(null)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
