import { z } from "zod";
import { API_KEYS } from "./api-keys";

const BaseInputSchema = z.object({
  resumeText: z.string(),
  jobDescription: z.string().optional().default(""),
});

async function callAI(prompt: string, systemPrompt: string = "You are a helpful career assistant.") {
  const geminiKey = API_KEYS.GEMINI;
  const groqKey = API_KEYS.GROQ;

  // PROVIDER 1: Groq
  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }],
          temperature: 0.7
        })
      });
      if (res.ok) {
        const json = await res.json();
        return json.choices?.[0]?.message?.content || "";
      }
    } catch (e) {
      console.error("Groq error:", e);
    }
  }

  // PROVIDER 2: Gemini
  if (geminiKey) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }] })
      });
      if (res.ok) {
        const json = await res.json();
        return json.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    } catch (e) {
      console.error("Gemini error:", e);
    }
  }

  throw new Error("All AI providers failed. Please check your API keys in Environment Variables.");
}

export const optimizeBulletPoint = async (data: { bullet: string; context: string }) => {
  try {
    const result = await callAI(
      `Rewrite this resume bullet point using the STAR method (Situation, Task, Action, Result). Make it data-driven and impactful. Use active verbs and quantify results if possible.
      Original: "${data.bullet}"
      Context: "${data.context}"
      
      Return ONLY the rewritten bullet point string.`,
      "You are a professional resume writer specializing in technical roles."
    );
    return { ok: true as const, bullet: result.trim().replace(/^["']|["']$/g, "") };
  } catch (e: any) {
    return { ok: false as const, error: e.message };
  }
};

export const generateCoverLetter = async (data: z.infer<typeof BaseInputSchema>) => {
  try {
    const prompt = `Generate a professional, tailored cover letter based on the following resume and job description.
    
    RESUME:
    """
    ${data.resumeText}
    """
    
    JOB DESCRIPTION:
    """
    ${data.jobDescription || "Standard role-based cover letter"}
    """
    
    Structure:
    1. Salutation
    2. Hook (Interest in role)
    3. Body (Matching skills to JD)
    4. Closing (Call to action)
    
    Keep it under 350 words. Use a professional tone.`;

    const result = await callAI(prompt, "You are a professional career coach.");
    return { ok: true as const, letter: result };
  } catch (e: any) {
    return { ok: false as const, error: e.message };
  }
};

export const generateInterviewQuestions = async (data: z.infer<typeof BaseInputSchema>) => {
  try {
    const prompt = `Based on this resume and job description, generate 5 behavioral interview questions and 5 technical interview questions. Also provide a "Pro Tip" for each category.
    
    RESUME:
    """
    ${data.resumeText}
    """
    
    JOB DESCRIPTION:
    """
    ${data.jobDescription || "General technical role"}
    """
    
    Return the output as a valid JSON object with the following structure:
    {
      "behavioral": ["q1", "q2", "q3", "q4", "q5"],
      "technical": ["q1", "q2", "q3", "q4", "q5"],
      "behavioralTip": "string",
      "technicalTip": "string"
    }`;

    const result = await callAI(prompt, "You are a senior hiring manager. Return ONLY valid JSON.");
    const cleaned = result.replace(/```json|```/g, "").trim();
    return { ok: true as const, data: JSON.parse(cleaned) };
  } catch (e: any) {
    return { ok: false as const, error: e.message };
  }
};

export const estimateSalary = async (data: z.infer<typeof BaseInputSchema>) => {
  try {
    const prompt = `Based on the skills and experience in this resume, estimate the REALISTIC market salary range (Annual USD) for a matching role in the current 2024-2025 market.
    
    RESUME:
    """
    ${data.resumeText}
    """
    
    Return as JSON:
    {
      "range": "string (e.g. $60,000 - $85,000)",
      "median": "string (e.g. $72,500)",
      "skillsToLearn": ["string", "string", "string"],
      "insight": "1-sentence explanation"
    }`;

    const result = await callAI(prompt, "You are a recruitment compensation specialist. Return ONLY valid JSON.");
    const cleaned = result.replace(/```json|```/g, "").trim();
    return { ok: true as const, data: JSON.parse(cleaned) };
  } catch (e: any) {
    return { ok: false as const, error: e.message };
  }
};

export const generateOutreach = async (data: z.infer<typeof BaseInputSchema>) => {
  try {
    const prompt = `Based on this resume and job description, generate two high-impact pieces of content:
    
    1. A "Professional Summary" (2-3 sentences) for the top of the resume.
    2. A "LinkedIn/Email Outreach" message (short and punchy) to a recruiter.
    
    RESUME:
    """
    ${data.resumeText}
    """
    
    JOB DESCRIPTION:
    """
    ${data.jobDescription || "General technical role"}
    """
    
    Return as JSON:
    {
      "profileSummary": "string",
      "outreachMessage": "string"
    }`;

    const result = await callAI(prompt, "You are a professional career coach. Return ONLY valid JSON.");
    const cleaned = result.replace(/```json|```/g, "").trim();
    return { ok: true as const, data: JSON.parse(cleaned) };
  } catch (e: any) {
    return { ok: false as const, error: e.message };
  }
};

export const generateProjectIdeas = async (data: z.infer<typeof BaseInputSchema>) => {
  try {
    const prompt = `Based on the missing skills and gaps in this resume, suggest 3 specific, impressive project ideas.
    
    RESUME:
    """
    ${data.resumeText}
    """
    
    JOB DESCRIPTION:
    """
    ${data.jobDescription || "General technical role"}
    """
    
    Return as JSON:
    {
      "projects": [
        {
          "title": "string",
          "description": "string",
          "skillsAddressed": ["skill1", "skill2"],
          "difficulty": "Beginner | Intermediate | Advanced"
        }
      ]
    }`;

    const result = await callAI(prompt, "You are a senior developer and mentor. Return ONLY valid JSON.");
    const cleaned = result.replace(/```json|```/g, "").trim();
    return { ok: true as const, data: JSON.parse(cleaned) };
  } catch (e: any) {
    return { ok: false as const, error: e.message };
  }
};

export const checkATSFlags = async (data: z.infer<typeof BaseInputSchema>) => {
  try {
    const prompt = `Analyze the provided resume text for "Red Flags" that would cause issues with ATS (Applicant Tracking Systems).
    
    RESUME TEXT:
    """
    ${data.resumeText}
    """
    
    Return as JSON:
    {
      "flags": [
        {
          "type": "Critical | Warning | Info",
          "message": "string",
          "fix": "string"
        }
      ],
      "readabilityScore": 0-100
    }`;

    const result = await callAI(prompt, "You are an ATS technical specialist. Return ONLY valid JSON.");
    const cleaned = result.replace(/```json|```/g, "").trim();
    return { ok: true as const, data: JSON.parse(cleaned) };
  } catch (e: any) {
    return { ok: false as const, error: e.message };
  }
};
