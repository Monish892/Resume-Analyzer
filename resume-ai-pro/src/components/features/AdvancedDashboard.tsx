import { motion } from "framer-motion";
import { Sparkles, Zap, Send, MessageSquare, TrendingUp, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkillsRadar } from "./SkillsRadar";
import { CoverLetterGenerator } from "./CoverLetterGenerator";
import { InterviewPrep } from "./InterviewPrep";
import { BulletPointOptimizer } from "./BulletPointOptimizer";
import { SalaryEstimator } from "./SalaryEstimator";
import { OutreachGenerator } from "./OutreachGenerator";
import { ProjectIdeas } from "./ProjectIdeas";
import { ATSFormatting } from "./ATSFormatting";
import { ResumeRefiner } from "./ResumeRefiner";
import type { Analysis } from "@/lib/analyze";

export function AdvancedDashboard({ 
  analysis, 
  resumeText, 
  jobDescription 
}: { 
  analysis: Analysis;
  resumeText: string;
  jobDescription: string;
}) {
  return (
    <div className="mt-16 space-y-10">
      <div className="flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 border border-primary/20">
          <Zap className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">AI Power Tools</span>
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <Tabs defaultValue="refine" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl bg-muted/50 p-1">
            <TabsTrigger value="refine" className="flex items-center gap-2 text-primary font-bold">
              <Sparkles className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Refine</span>
            </TabsTrigger>
            <TabsTrigger value="outreach" className="flex items-center gap-2">
              <Send className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Apply</span>
            </TabsTrigger>
            <TabsTrigger value="prep" className="flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Prepare</span>
            </TabsTrigger>
            <TabsTrigger value="growth" className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Growth</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
          </TabsList>
        </div>
 
        <TabsContent value="refine" className="space-y-6">
          <ResumeRefiner resumeText={resumeText} jobDescription={jobDescription} />
        </TabsContent>

        <TabsContent value="outreach" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 items-stretch">
            <CoverLetterGenerator resumeText={resumeText} jobDescription={jobDescription} />
            <OutreachGenerator resumeText={resumeText} jobDescription={jobDescription} />
          </div>
        </TabsContent>

        <TabsContent value="prep" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 items-stretch">
            <InterviewPrep resumeText={resumeText} jobDescription={jobDescription} />
            <BulletPointOptimizer />
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 items-stretch">
            <ProjectIdeas analysis={analysis} resumeText={resumeText} jobDescription={jobDescription} />
            <SalaryEstimator resumeText={resumeText} jobDescription={jobDescription} />
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 items-stretch">
            <SkillsRadar analysis={analysis} />
            <ATSFormatting resumeText={resumeText} jobDescription={jobDescription} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 p-8 text-center border border-primary/10">
        <Sparkles className="mx-auto h-8 w-8 text-primary mb-4 opacity-50" />
        <h3 className="font-display text-xl font-bold">Your Career, Accelerated</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Every tool is tailored specifically to your background and target role. Good luck with your applications!
        </p>
      </div>
    </div>
  );
}
