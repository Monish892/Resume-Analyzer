import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
    return "Intermediate"; // Default fallback
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

export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const githubToken = process.env.GITHUB_TOKEN;

    console.log("Analyzing resume. Text length:", data.resumeText.length, "JD length:", data.jobDescription.length);

    const sys = `You are a Senior Technical Recruiter and ATS expert. Analyze the resume STRICTLY.

CRITICAL RULES FOR OUTPUT QUALITY:
- Each "strength" must be 1-2 sentences explaining WHY it's a strength with specific evidence from the resume. Example: "Demonstrates strong full-stack capability through hands-on experience building production MERN applications with React, Node.js, Express, and MongoDB."
- Each "weakness" must be 1-2 sentences explaining the gap and its impact. Example: "No mention of cloud deployment experience (AWS/Azure/GCP), which is expected in 85% of mid-level full-stack roles and significantly reduces ATS keyword match rates."
- Each "improvement" must be 1-2 actionable sentences. Example: "Add quantified metrics to each bullet point (e.g., 'Reduced API response time by 40%') to demonstrate measurable impact, which ATS systems heavily prioritize."
- "summary" should be 2-3 sentences providing a holistic assessment.
- "missingSkills" reason should be 1 sentence explaining why this skill matters.
- "suggestedProjects" description should be 2-3 sentences explaining what to build, what technologies to use, and what it demonstrates.
- Provide exactly 5 strengths, 5 weaknesses, 5 improvements, 5-8 missing skills, and 3 projects.

Return ONLY raw JSON (no markdown, no code fences) matching this exact schema:
{
  "atsScore": number (0-100),
  "summary": "string (2-3 sentences)",
  "strengths": ["string (1-2 sentences each)"],
  "weaknesses": ["string (1-2 sentences each)"],
  "improvements": ["string (1-2 actionable sentences each)"],
  "missingSkills": [{"skill": "string", "impact": number (1-100), "reason": "string (1 sentence)"}],
  "suggestedProjects": [{"title": "string", "description": "string (2-3 sentences)", "difficulty": "Beginner|Intermediate|Advanced", "skillsAddressed": ["string"]}],
  "jobMatchScore": number | null
}
Use difficulty values: Beginner, Intermediate, or Advanced ONLY.`;

    const user = `RESUME:\n${data.resumeText}\n\nJD: ${data.jobDescription || "N/A"}`;

    // PROVIDER 1: Groq
    if (groqKey) {
      try {
        console.log("analyze: Trying Groq");
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
          if (text) {
            const parsed = parseAndValidate(text);
            if (parsed) {
              console.log("analyze: Groq success");
              return { ok: true as const, analysis: parsed };
            }
          }
        }
        console.warn(`analyze: Groq failed (${res.status})`);
      } catch (e: any) {
        console.error("analyze: Groq error:", e.message);
      }
    }

    // PROVIDER 2: GitHub
    if (githubToken) {
      try {
        console.log("analyze: Trying GitHub");
        const res = await fetch("https://models.inference.ai.azure.com/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${githubToken}` },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "system", content: sys }, { role: "user", content: user }],
            temperature: 0.1
          })
        });
        if (res.ok) {
          const json = await res.json();
          const text = json.choices?.[0]?.message?.content;
          if (text) {
            const parsed = parseAndValidate(text);
            if (parsed) {
              console.log("analyze: GitHub success");
              return { ok: true as const, analysis: parsed };
            }
          }
        }
        console.warn(`analyze: GitHub failed (${res.status})`);
      } catch (e: any) {
        console.error("analyze: GitHub error:", e.message);
      }
    }

    // PROVIDER 3: Gemini Native
    if (geminiKey) {
      try {
        console.log("analyze: Trying Gemini");
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${sys}\n\n${user}` }] }]
          })
        });
        if (res.ok) {
          const json = await res.json();
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = parseAndValidate(text);
            if (parsed) {
              console.log("analyze: Gemini success");
              return { ok: true as const, analysis: parsed };
            }
          }
        } else {
          const err = await res.text();
          console.warn(`analyze: Gemini failed (${res.status}): ${err}`);
        }
      } catch (e: any) {
        console.error("analyze: Gemini error:", e.message);
      }
    }

    return { ok: false as const, error: "All AI providers failed. Please try again in a moment." };
  });

function parseAndValidate(raw: string): Analysis | null {
  try {
    // Clean markdown fences
    let text = raw.replace(/```json|```/g, "").trim();
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first !== -1 && last !== -1) text = text.substring(first, last + 1);

    const rawArgs = JSON.parse(text);

    // Normalize missing fields
    const normalized = {
      ...rawArgs,
      jobMatchScore: rawArgs.jobMatchScore ?? null,
      missingSkills: (rawArgs.missingSkills || []).map((s: any) => ({
        skill: s.skill || "Skill",
        impact: s.impact || 50,
        reason: s.reason || "Recommended"
      })),
      suggestedProjects: (rawArgs.suggestedProjects || []).map((p: any) => ({
        title: p.title || "Project",
        description: p.description || "Description",
        difficulty: p.difficulty || "Intermediate",
        skillsAddressed: p.skillsAddressed || []
      }))
    };

    return AnalysisSchema.parse(normalized);
  } catch (e: any) {
    console.error("parseAndValidate error:", e.message);
    return null;
  }
}
