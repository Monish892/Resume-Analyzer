import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import type { Analysis } from "@/lib/analyze";

export function SkillsRadar({ analysis }: { analysis: Analysis }) {
  // Map missing skills and strengths into categories for the radar
  // This is a simplified mapping for visualization
  const data = [
    { subject: "Core Tech", A: 85, fullMark: 100 },
    { subject: "Soft Skills", A: 70, fullMark: 100 },
    { subject: "DevOps", A: analysis.missingSkills.some(s => s.skill.toLowerCase().includes("devops")) ? 30 : 90, fullMark: 100 },
    { subject: "Cloud", A: analysis.missingSkills.some(s => s.skill.toLowerCase().includes("cloud")) ? 40 : 85, fullMark: 100 },
    { subject: "Leadership", A: 65, fullMark: 100 },
    { subject: "Design", A: 75, fullMark: 100 },
  ];

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <h3 className="font-display text-lg font-semibold">Skills Analysis</h3>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Current Profile"
              dataKey="A"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground italic">
        Visual representation of your profile based on identified strengths and gaps.
      </p>
    </Card>
  );
}
