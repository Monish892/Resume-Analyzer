import { z } from "zod";
import { API_KEYS } from "./api-keys";

export const MissingSkillSchema = z.object({
  skill: z.string(),
  impact: z.number().min(1).max(100),
  reason: z.string(),
});
export type MissingSkill = z.infer<typeof MissingSkillSchema>;

export const ProjectIdeaSchema = z.object({
  title: z.string(),
  description: z.string(),
  difficulty: z.string().transform(val => {
    const low = val.toLowerCase();
    if (low.includes("beg") || low.includes("easy")) return "Beginner";
    if (low.includes("mid") || low.includes("inter") || low.includes("med")) return "Intermediate";
    if (low.includes("adv") || low.includes("hard") || low.includes("exp") || low.includes("high")) return "Advanced";
    return "Intermediate";
  }),
  skillsAddressed: z.array(z.string()),
});

export const AnalysisSchema = z.object({
  atsScore: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  improvements: z.array(z.string()),
  missingSkills: z.array(MissingSkillSchema),
  suggestedProjects: z.array(ProjectIdeaSchema),
  jobMatchScore: z.number().min(0).max(100).nullable(),
});
export type Analysis = z.infer<typeof AnalysisSchema>;

const InputSchema = z.object({
  resumeText: z.string().min(50, "Resume text too short").max(50000),
  jobDescription: z.string().max(10000).optional().default(""),
});

export const analyzeResume = async (data: z.infer<typeof InputSchema>) => {
    const geminiKey = API_KEYS.GEMINI;
    const groqKey = API_KEYS.GROQ;
    
    const sys = `You are a Senior Technical Recruiter and ATS expert. Analyze the resume STRICTLY. Return ONLY raw JSON.`;
    const user = `RESUME:\n${data.resumeText}\n\nJD: ${data.jobDescription || "N/A"}`;

    if (groqKey) {
      try {
        const res = await fetch("/api/groq/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: sys }, { role: "user", content: user }],
            temperature: 0.1
          })
        });
        if (res.ok) {
          const json = await res.json();
          const text = json.choices?.[0]?.message?.content;
          const parsed = parseAndValidate(text);
          if (parsed) return { ok: true as const, analysis: parsed };
        }
      } catch (e) {}
    }

    if (geminiKey) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: `${sys}\n\n${user}` }] }] })
        });
        if (res.ok) {
          const json = await res.json();
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          const parsed = parseAndValidate(text);
          if (parsed) return { ok: true as const, analysis: parsed };
        }
      } catch (e) {}
    }

    return { ok: false as const, error: "AI analysis failed. Please check your API keys." };
};

function parseAndValidate(raw: string): Analysis | null {
  try {
    let text = raw.replace(/```json|```/g, "").trim();
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first !== -1 && last !== -1) text = text.substring(first, last + 1);
    const rawArgs = JSON.parse(text);
    return AnalysisSchema.parse(rawArgs);
  } catch (e) {
    return null;
  }
}
