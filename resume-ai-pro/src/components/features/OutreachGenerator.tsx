import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Copy, Loader2, Sparkles, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { generateOutreach } from "@/lib/advanced-tools";

export function OutreachGenerator({ resumeText, jobDescription }: { resumeText: string, jobDescription: string }) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const onGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateOutreach({ data: { resumeText, jobDescription } });
      if (result.ok) {
        setData(result.data);
        toast.success("Outreach kit generated!");
      } else {
        toast.error(result.error || "Generation failed");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  return (
    <Card className="p-6 overflow-hidden flex flex-col h-full w-full">
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
            <Send className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-semibold">Outreach Kit</h3>
        </div>
        {!data && (
          <Button onClick={onGenerate} disabled={loading} size="sm" className="bg-purple-600 hover:bg-purple-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center overflow-hidden">
        {data ? (
          <Tabs defaultValue="summary" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2 mb-4 shrink-0">
              <TabsTrigger value="summary" className="text-xs">Profile Summary</TabsTrigger>
              <TabsTrigger value="outreach" className="text-xs">Recruiter Msg</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="flex-1 overflow-y-auto pr-1">
              <div className="relative rounded-lg bg-purple-50/50 p-3 border border-purple-100 italic text-[11px] leading-relaxed text-purple-900">
                {data.profileSummary}
                <Button onClick={() => copy(data.profileSummary)} variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">Add this to the very top of your resume for maximum impact.</p>
            </TabsContent>

            <TabsContent value="outreach" className="flex-1 overflow-y-auto pr-1">
              <div className="relative rounded-lg bg-purple-50/50 p-3 border border-purple-100 italic text-[11px] leading-relaxed text-purple-900">
                {data.outreachMessage}
                <Button onClick={() => copy(data.outreachMessage)} variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">Perfect for LinkedIn connections or cold emails to hiring managers.</p>
            </TabsContent>

            <Button onClick={() => setData(null)} variant="ghost" size="sm" className="w-full text-[10px] h-7 mt-4 shrink-0">
              Regenerate Kit
            </Button>
          </Tabs>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Generate a high-impact profile summary and a personalized recruiter outreach message.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
