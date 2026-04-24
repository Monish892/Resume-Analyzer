import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wand2, Loader2, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { optimizeBulletPoint } from "@/lib/advanced-tools";

export function BulletPointOptimizer() {
  const [original, setOriginal] = useState("");
  const [role, setRole] = useState("");
  const [optimized, setOptimized] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onOptimize = async () => {
    if (!original) return;
    setLoading(true);
    try {
      const result = await optimizeBulletPoint({ data: { bullet: original, context: role } });
      if (result.ok) {
        setOptimized(result.bullet);
        toast.success("Bullet point optimized!");
      } else {
        toast.error(result.error || "Optimization failed");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (optimized) {
      navigator.clipboard.writeText(optimized);
      toast.success("Copied!");
    }
  };

  return (
    <Card className="p-6 flex flex-col h-full w-full">
      <div className="mb-4 flex items-center gap-3 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
          <Wand2 className="h-5 w-5" />
        </div>
        <h3 className="font-display text-lg font-semibold">Bullet Optimizer</h3>
      </div>
      
      <div className="space-y-4 flex-1 flex flex-col justify-center">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">Current Bullet</label>
          <Input 
            value={original} 
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="e.g. Managed a team to build a website"
            className="mt-1 h-8 text-xs"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">Target Context</label>
          <Input 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            className="mt-1 h-8 text-xs"
          />
        </div>

        <div className="flex-1 flex flex-col justify-center min-h-[100px]">
          {optimized ? (
            <div className="relative rounded-lg border border-indigo-200 bg-indigo-50/30 p-3">
               <p className="text-[11px] font-medium text-indigo-900 leading-relaxed pr-6">
                 {optimized}
               </p>
               <Button onClick={copy} variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6">
                 <Copy className="h-3 w-3" />
               </Button>
            </div>
          ) : (
            <div className="h-full border border-dashed rounded-lg flex items-center justify-center p-4">
              <p className="text-[10px] text-muted-foreground text-center">Optimized bullet will appear here...</p>
            </div>
          )}
        </div>

        <Button 
          onClick={onOptimize} 
          disabled={!original || loading} 
          size="sm"
          className="w-full bg-indigo-600 hover:bg-indigo-700 mt-auto"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Optimize (STAR)
        </Button>
      </div>
    </Card>
  );
}
