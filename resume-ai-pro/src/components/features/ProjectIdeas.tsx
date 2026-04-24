import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Loader2, Sparkles, Code2 } from "lucide-react";
import { toast } from "sonner";
import { generateProjectIdeas } from "@/lib/advanced-tools";

export function ProjectIdeas({ analysis, resumeText, jobDescription }: { analysis: Analysis, resumeText: string, jobDescription: string }) {
  const [data, setData] = useState<any | null>({ projects: analysis.suggestedProjects });
  const [loading, setLoading] = useState(false);

  const onGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateProjectIdeas({ data: { resumeText, jobDescription } });
      if (result.ok) {
        setData(result.data);
        toast.success("Project ideas ready!");
      } else {
        toast.error(result.error || "Generation failed");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 flex flex-col h-full w-full">
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
            <Lightbulb className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-semibold">Skill-Gap Projects</h3>
        </div>
        {!data && (
          <Button onClick={onGenerate} disabled={loading} size="sm" className="bg-yellow-600 hover:bg-yellow-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Discover
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center overflow-hidden">
        {data ? (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {data.projects.map((p: any, i: number) => (
              <div key={i} className="p-3 rounded-lg border border-yellow-100 bg-yellow-50/30 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-yellow-900 flex items-center gap-2">
                    <Code2 className="h-3 w-3" /> {p.title}
                  </h4>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 border-yellow-200 text-yellow-700 h-4">
                    {p.difficulty}
                  </Badge>
                </div>
                <p className="text-[10px] text-yellow-800 leading-relaxed">{p.description}</p>
                <div className="flex flex-wrap gap-1">
                  {p.skillsAddressed.map((s: string, j: number) => (
                    <span key={j} className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-medium">
                      +{s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <Button onClick={() => setData(null)} variant="ghost" size="sm" className="w-full text-[10px] h-7 mt-2">
              New Ideas
            </Button>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Get custom project ideas specifically designed to fill the gaps in your technical profile.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
