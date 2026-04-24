import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BaseInputSchema = z.object({
  resumeText: z.string(),
  jobDescription: z.string().optional().default(""),
});

async function callAI(prompt: string, systemPrompt: string = "You are a helpful career assistant.") {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const githubToken = process.env.GITHUB_TOKEN;

  // PROVIDER 1: Groq
  if (groqKey) {
    try {
      console.log("advanced-tools: Trying Groq");
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
        console.log("advanced-tools: Groq success");
        return json.choices?.[0]?.message?.content || "";
      }
      console.warn(`advanced-tools: Groq failed (${res.status})`);
    } catch (e) {
      console.error("advanced-tools: Groq error:", e);
    }
  }

  // PROVIDER 2: GitHub
  if (githubToken) {
    try {
      console.log("advanced-tools: Trying GitHub");
      const res = await fetch("https://models.inference.ai.azure.com/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${githubToken}` },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }],
          temperature: 0.7
        })
      });
      if (res.ok) {
        const json = await res.json();
        console.log("advanced-tools: GitHub success");
        return json.choices?.[0]?.message?.content || "";
      }
      console.warn(`advanced-tools: GitHub failed (${res.status})`);
    } catch (e) {
      console.error("advanced-tools: GitHub error:", e);
    }
  }

  // PROVIDER 3: Gemini Native
  if (geminiKey) {
    try {
      console.log("advanced-tools: Trying Gemini");
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }] })
      });
      if (res.ok) {
        const json = await res.json();
        console.log("advanced-tools: Gemini success");
        return json.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    } catch (e) {
      console.error("advanced-tools: Gemini error:", e);
    }
  }

  throw new Error("All AI providers failed. Please check your API keys in .env");
}

export const optimizeBulletPoint = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ bullet: z.string(), context: z.string() }).parse(input))
  .handler(async ({ data }) => {
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
  });

export const generateCoverLetter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => BaseInputSchema.parse(input))
  .handler(async ({ data }) => {
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
  });

export const generateInterviewQuestions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => BaseInputSchema.parse(input))
  .handler(async ({ data }) => {
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
  });

export const estimateSalary = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => BaseInputSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const prompt = `Based on the skills and experience in this resume, estimate the REALISTIC market salary range (Annual USD) for a matching role in the current 2024-2025 market.
      
      CRITICAL:
      1. Identify the candidate's seniority level (Intern, Junior, Mid, Senior, Lead) from the resume.
      2. Provide a salary range that reflects that specific seniority level.
      3. Do NOT use placeholder values like $100k-$130k unless they truly apply.
      
      RESUME:
      """
      ${data.resumeText}
      """
      
      Return as JSON:
      {
        "range": "string (e.g. $60,000 - $85,000)",
        "median": "string (e.g. $72,500)",
        "skillsToLearn": ["string", "string", "string"],
        "insight": "1-sentence explanation of why this specific range was chosen based on their experience level"
      }`;

      const result = await callAI(prompt, "You are a recruitment compensation specialist. Return ONLY valid JSON.");
      const cleaned = result.replace(/```json|```/g, "").trim();
      return { ok: true as const, data: JSON.parse(cleaned) };
    } catch (e: any) {
      return { ok: false as const, error: e.message };
    }
  });

export const generateOutreach = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => BaseInputSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const prompt = `Based on this resume and job description, generate two high-impact pieces of content:
      
      1. A "Professional Summary" (2-3 sentences) for the top of the resume, perfectly optimized for the JD.
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
  });

export const generateProjectIdeas = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => BaseInputSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const prompt = `Based on the missing skills and gaps in this resume, suggest 3 specific, impressive project ideas that would help the candidate prove they have those missing skills.
      
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

      const result = await callAI(prompt, `You are a senior developer and mentor. 
      When suggesting projects, aim for high-impact, professional-grade portfolio pieces. 
      Examples of excellent projects to draw inspiration from (if they fit the skills gaps):
      1. Real-Time Collaboration Platform: Real-time text editing, auth, and permissions (Google Docs clone). Skills: Real-time Systems, Scalable Architecture, Secure Auth.
      2. Machine Learning-based E-commerce Recommendation System: Product suggestions based on history, REST API. Skills: ML, Data Analysis, API Development.
      3. Cloud-based Image Processing & Storage: Using AWS (S3, Lambda, API Gateway), image processing. Skills: Cloud Computing, Image Processing, API Development.
      
      Return ONLY valid JSON.`);
      const cleaned = result.replace(/```json|```/g, "").trim();
      return { ok: true as const, data: JSON.parse(cleaned) };
    } catch (e: any) {
      return { ok: false as const, error: e.message };
    }
  });

export const checkATSFlags = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => BaseInputSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const prompt = `Analyze the provided resume text for technical "Red Flags" that would cause issues with ATS (Applicant Tracking Systems). 
      Look for: lack of standard headers, poor contact info placement, non-standard section titles, or content that looks like it came from a complex layout.
      
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
  });
