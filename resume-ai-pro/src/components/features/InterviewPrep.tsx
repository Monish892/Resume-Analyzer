import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { generateInterviewQuestions } from "@/lib/advanced-tools";

export function InterviewPrep({ resumeText, jobDescription }: { resumeText: string, jobDescription: string }) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const onGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateInterviewQuestions({ data: { resumeText, jobDescription } });
      if (result.ok) {
        setData(result.data);
        toast.success("Interview prep ready!");
      } else {
        toast.error(result.error || "Failed to generate questions");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 flex flex-col h-full w-full">
      <div className="mb-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600">
            <MessageSquare className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-semibold">Interview Prep</h3>
        </div>
        {!data && (
          <Button onClick={onGenerate} disabled={loading} size="sm" className="bg-green-600 hover:bg-green-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Prepare
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center overflow-hidden">
        {data ? (
          <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-1 space-y-6 max-h-[400px]">
              <div>
                <div className="mb-3 flex items-center gap-2 sticky top-0 bg-card z-10 py-1">
                  <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50">Behavioral</Badge>
                </div>
                <ul className="space-y-2">
                  {data.behavioral.map((q: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-foreground/80 leading-snug">
                      <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-green-500" />
                      {q}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 rounded-lg bg-green-50/50 p-2 text-[10px] text-green-700 border border-green-100 italic">
                  💡 {data.behavioralTip}
                </p>
              </div>

              <div className="border-t pt-4">
                <div className="mb-3 flex items-center gap-2 sticky top-0 bg-card z-10 py-1">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Technical</Badge>
                </div>
                <ul className="space-y-2">
                  {data.technical.map((q: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-foreground/80 leading-snug">
                      <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-blue-500" />
                      {q}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 rounded-lg bg-blue-50/50 p-2 text-[10px] text-blue-700 border border-blue-100 italic">
                  💡 {data.technicalTip}
                </p>
              </div>
            </div>

            <Button onClick={() => setData(null)} variant="ghost" size="sm" className="w-full text-[10px] h-7 mt-auto shrink-0">
              Generate new questions
            </Button>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Get 10 custom behavioral and technical interview questions based on your profile and target role.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
