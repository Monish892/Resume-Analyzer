import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2, Sparkles, CheckCircle2, Info } from "lucide-react";
import { toast } from "sonner";
import { checkATSFlags } from "@/lib/advanced-tools";

export function ATSFormatting({ resumeText, jobDescription }: { resumeText: string, jobDescription: string }) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const onCheck = async () => {
    setLoading(true);
    try {
      const result = await checkATSFlags({ resumeText, jobDescription: "" });
      if (result.ok) {
        setData(result.data);
        toast.success("ATS check complete!");
      } else {
        toast.error(result.error || "Analysis failed");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "Critical": return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case "Warning": return <AlertTriangle className="h-3 w-3 text-amber-500" />;
      default: return <Info className="h-3 w-3 text-blue-500" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "Critical": return "bg-red-50 text-red-700 border-red-100";
      case "Warning": return "bg-amber-50 text-amber-700 border-amber-100";
      default: return "bg-blue-50 text-blue-700 border-blue-100";
    }
  };

  return (
    <Card className="p-6 flex flex-col h-full w-full relative overflow-hidden">
      <div className="mb-4 flex items-center justify-between shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-semibold">ATS Formatting</h3>
        </div>
        {!data && (
          <Button onClick={onCheck} disabled={loading} size="sm" className="bg-red-600 hover:bg-red-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Check Flags
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center overflow-hidden relative z-10">
        {data ? (
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
             <div className="flex items-center justify-between bg-muted/50 p-2 rounded-lg shrink-0">
               <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Readability Score</span>
               <Badge variant="outline" className={`${data.readabilityScore > 80 ? 'text-green-600 border-green-200 bg-green-50' : 'text-amber-600 border-amber-200 bg-amber-50'} font-bold`}>
                 {data.readabilityScore}%
               </Badge>
             </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {data.flags.length > 0 ? (
                data.flags.map((f: any, i: number) => (
                  <div key={i} className={`p-2.5 rounded-lg border ${getBadgeColor(f.type)} space-y-1`}>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight">
                      {getIcon(f.type)} {f.type} Flag
                    </div>
                    <p className="text-[11px] font-medium leading-snug">{f.message}</p>
                    <div className="text-[10px] opacity-80 flex items-start gap-1">
                      <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" />
                      <span>Fix: {f.fix}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mb-2 opacity-50" />
                  <p className="text-xs font-medium text-green-700">No major formatting flags found!</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Your resume is highly readable for ATS.</p>
                </div>
              )}
            </div>
            
            <Button onClick={() => setData(null)} variant="ghost" size="sm" className="w-full text-[10px] h-7 mt-2 shrink-0">
              Re-scan
            </Button>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Scan for technical "Red Flags" that might cause Applicant Tracking Systems (ATS) to reject your resume.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
