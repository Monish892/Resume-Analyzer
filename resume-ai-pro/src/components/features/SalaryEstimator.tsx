import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Banknote, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { estimateSalary } from "@/lib/advanced-tools";

export function SalaryEstimator({ resumeText, jobDescription }: { resumeText: string, jobDescription: string }) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const onEstimate = async () => {
    setLoading(true);
    try {
      const result = await estimateSalary({ data: { resumeText, jobDescription } });
      if (result.ok) {
        setData(result.data);
        toast.success("Salary estimate ready!");
      } else {
        toast.error(result.error || "Estimation failed");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-3 opacity-10">
        <Banknote className="h-20 w-20 rotate-12" />
      </div>
      
      <div className="mb-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <Banknote className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-semibold">Salary Insight</h3>
        </div>
        {!data && (
          <Button onClick={onEstimate} disabled={loading} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Analyze Market
          </Button>
        )}
      </div>

      {data ? (
        <div className="space-y-4 relative z-10">
          <div className="flex flex-col items-center justify-center py-2 bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600/70">Estimated Annual Range</p>
            <h2 className="text-3xl font-display font-bold text-emerald-950 mt-1">{data.range}</h2>
            <p className="text-sm font-medium text-emerald-700 mt-1">Median: {data.median}</p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Higher-Paying Skills to Learn</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.skillsToLearn.map((s: string, i: number) => (
                <Badge key={i} variant="secondary" className="bg-emerald-100/50 text-emerald-800 hover:bg-emerald-100">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground italic leading-relaxed pt-2 border-t border-emerald-100/50">
            “{data.insight}”
          </p>
        </div>
      ) : (
        <div className="py-4 text-center relative z-10">
          <p className="text-sm text-muted-foreground">
            Get an estimated market salary range based on your current skills and experience.
          </p>
        </div>
      )}
    </Card>
  );
}
