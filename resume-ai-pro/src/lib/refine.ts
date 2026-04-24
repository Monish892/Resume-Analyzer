import { z } from "zod";
import { API_KEYS } from "./api-keys";

const InputSchema = z.object({
  resumeText: z.string(),
  jobDescription: z.string().optional(),
  type: z.enum(["cover-letter", "interview-prep"]),
});

export const refineResume = async (data: z.infer<typeof InputSchema>) => {
    const geminiKey = API_KEYS.GEMINI;
    
    const sys = `You are an expert career coach. Generate a high-quality ${data.type}.`;
    const user = `RESUME:\n${data.resumeText}\n\nJD: ${data.jobDescription || "N/A"}`;

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
          if (text) return { ok: true as const, result: text };
        }
      } catch (e) {}
    }

    return { ok: false as const, error: "Refinement failed." };
};
