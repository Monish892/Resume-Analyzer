import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dropzone } from "./Dropzone";
import { Results } from "./Results";
import { extractPdfText } from "@/lib/pdf";
import { analyzeResume, type Analysis } from "@/lib/analyze";

type Stage = "idle" | "extracting" | "analyzing";

export function Analyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [resumeText, setResumeText] = useState("");

  const reset = () => {
    setAnalysis(null);
    setFile(null);
    setJobDescription("");
  };

  const onAnalyze = async () => {
    if (!file) return;
    try {
      setStage("extracting");
      const text = await extractPdfText(file);
      setResumeText(text);
      if (text.length < 50) {
        toast.error("Could not extract enough text from this PDF.");
        setStage("idle");
        return;
      }
      setStage("analyzing");
      const result = await analyzeResume({ resumeText: text, jobDescription });
      if (!result.ok) {
        toast.error(result.error);
        setStage("idle");
        return;
      }
      setAnalysis(result.analysis);
      setStage("idle");
    } catch (e) {
      console.error(e);
      toast.error("Failed to process resume. Try a different file.");
      setStage("idle");
    }
  };

  const loading = stage !== "idle";

  if (analysis) return <Results analysis={analysis} resumeText={resumeText} jobDescription={jobDescription} onReset={reset} />;

  return (
    <Card className="overflow-hidden p-6 shadow-elegant md:p-8">
      <div className="space-y-6">
        <Dropzone file={file} onFile={setFile} />

        <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-accent/40 to-primary/5 p-5">
          <div className="mb-3 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-hero shadow-glow">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-semibold">Compare with Job Description</h3>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a job description to unlock a tailored match score and pinpoint missing skills.
              </p>
            </div>
            {jobDescription && (
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                {jobDescription.length} chars
              </span>
            )}
          </div>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer — React, TypeScript, design systems, performance optimization…"
            rows={6}
            className="resize-none border-primary/20 bg-background/70 focus-visible:ring-primary"
          />
        </div>

        <Button
          onClick={onAnalyze}
          disabled={!file || loading}
          size="lg"
          className="w-full bg-gradient-hero text-primary-foreground shadow-glow transition-transform hover:scale-[1.01] hover:opacity-95"
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {stage === "extracting" ? "Reading your resume…" : "AI is analyzing…"}
              </motion.span>
            ) : (
              <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5" />
                Analyze resume
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </Card>
  );
}
