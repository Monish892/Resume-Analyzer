import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Copy, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generateCoverLetter } from "@/lib/advanced-tools";

export function CoverLetterGenerator({ resumeText, jobDescription }: { resumeText: string, jobDescription: string }) {
  const [letter, setLetter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateCoverLetter({ resumeText, jobDescription });
      if (result.ok) {
        setLetter(result.letter);
        toast.success("Cover letter generated!");
      } else {
        toast.error(result.error || "Failed to generate cover letter");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (letter) {
      navigator.clipboard.writeText(letter);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <Card className="p-6 overflow-hidden flex flex-col h-full w-full">
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
            <FileText className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-semibold">Cover Letter</h3>
        </div>
        {!letter && (
          <Button onClick={onGenerate} disabled={loading} size="sm" className="bg-orange-600 hover:bg-orange-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {letter ? (
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="relative flex-1 rounded-lg bg-muted/50 p-4 font-mono text-[10px] leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[350px]">
              {letter}
              <Button
                onClick={copyToClipboard}
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 bg-background/80 shadow-sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setLetter(null)} variant="outline" size="sm" className="w-full mt-auto">
              Regenerate
            </Button>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Generate a tailored cover letter based on your resume and the provided job description.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
