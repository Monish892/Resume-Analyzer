import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const RefineInputSchema = z.object({
  resumeText: z.string(),
  jobDescription: z.string().optional().default(""),
});

async function callAI(prompt: string, systemPrompt: string = "You are a helpful career assistant.") {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const githubToken = process.env.GITHUB_TOKEN;

  // PROVIDER 1: Groq (Testing new key)
  if (groqKey) {
    try {
      console.log("AI Attempt: Groq (Primary)");
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
        console.log("AI Success: Groq");
        return json.choices?.[0]?.message?.content || "";
      }
      console.warn(`Groq failed (${res.status}). Trying GitHub...`);
    } catch (e) {
      console.error("Groq Error:", e);
    }
  }

  // PROVIDER 2: GitHub
  if (githubToken) {
    try {
      console.log("AI Attempt: GitHub");
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
        console.log("AI Success: GitHub");
        return json.choices?.[0]?.message?.content || "";
      }
      console.warn(`GitHub failed (${res.status}). Trying Gemini...`);
    } catch (e) {
      console.error("GitHub Error:", e);
    }
  }

  // PROVIDER 3: Gemini
  if (geminiKey) {
    try {
      console.log("AI Attempt: Gemini");
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }] })
      });
      if (res.ok) {
        const json = await res.json();
        console.log("AI Success: Gemini");
        return json.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    } catch (e) {
      console.error("Gemini Error:", e);
    }
  }

  throw new Error("All AI providers (Groq, GitHub, Gemini) failed. Please check your keys.");
}

export const refineResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RefineInputSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const prompt = `You are an expert Resume Writer. Rewrite the provided resume text into a structured, high-impact version optimized for the target job description.

      RESUME TEXT:
      """
      ${data.resumeText}
      """

      TARGET JOB DESCRIPTION:
      """
      ${data.jobDescription || "Professional role-readiness"}
      """

      Submit your refined version using the submit_refined_resume tool.`;

      const geminiKey = process.env.GEMINI_API_KEY;
      const groqKey = process.env.GROQ_API_KEY;
      const githubToken = process.env.GITHUB_TOKEN;
      let apiKey = groqKey || githubToken || geminiKey;
      if (!apiKey) throw new Error("AI service not configured.");

      let endpoint = "https://api.groq.com/openai/v1/chat/completions";
      let model = "llama-3.3-70b-versatile";

      if (groqKey) {
        endpoint = "https://api.groq.com/openai/v1/chat/completions";
        model = "llama-3.3-70b-versatile";
        apiKey = groqKey;
      } else if (githubToken) {
        endpoint = "https://models.inference.ai.azure.com/chat/completions";
        model = "gpt-4o";
        apiKey = githubToken;
      } else if (geminiKey) {
        endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
        model = "gemini-2.0-flash";
        apiKey = geminiKey;
      }

      let attempts = 0;
      let currentModel = model;
      let currentEndpoint = endpoint;
      let currentApiKey = apiKey;

      while (attempts < 3) {
        let res;
        if (currentEndpoint.includes("googleapis.com") && !currentEndpoint.includes("/openai/")) {
          // NATIVE GEMINI CALL
          res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${currentApiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${prompt}\n\nIMPORTANT: Return ONLY raw JSON. No markdown blocks.` }] }]
            })
          });
        } else {
          // STANDARD OPENAI/GROQ CALL
          res = await fetch(currentEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${currentApiKey}`
            },
            body: JSON.stringify({
              model: currentModel,
              messages: [
                { role: "system", content: "You are a professional resume rebuilder. Return ONLY valid tool calls." },
                { role: "user", content: prompt },
              ],
              tools: [
                {
                  type: "function",
                  function: {
                    name: "submit_refined_resume",
                    description: "Submit the structured refined resume",
                    parameters: {
                      type: "object",
                      properties: {
                        personal: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            email: { type: "string" },
                            phone: { type: "string" },
                            location: { type: "string" },
                            links: { type: "array", items: { type: "string" } }
                          },
                          required: ["name", "email", "phone", "location", "links"]
                        },
                        summary: { type: "string" },
                        experience: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              role: { type: "string" },
                              company: { type: "string" },
                              date: { type: "string" },
                              bullets: { type: "array", items: { type: "string" } }
                            },
                            required: ["role", "company", "date", "bullets"]
                          }
                        },
                        skills: { type: "array", items: { type: "string" } },
                        education: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              degree: { type: "string" },
                              school: { type: "string" },
                              date: { type: "string" }
                            },
                            required: ["degree", "school", "date"]
                          }
                        }
                      },
                      required: ["personal", "summary", "experience", "skills", "education"]
                    }
                  }
                }
              ],
              tool_choice: { type: "function", function: { name: "submit_refined_resume" } }
            }),
          });
        }

        // UNIVERSAL CASCADING FALLBACK
        if ((res.status === 429 || res.status === 400 || res.status === 401) && attempts < 3) {
          attempts++;
          console.log(`Refine Fallback ${attempts}/3: ${currentModel} failed (${res.status})...`);
          
          if (currentModel === "gpt-4o") {
            if (groqKey) {
              currentEndpoint = "https://api.groq.com/openai/v1/chat/completions";
              currentModel = "llama-3.3-70b-versatile";
              currentApiKey = groqKey;
            } else {
              currentEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
              currentModel = "gemini-2.0-flash";
              currentApiKey = geminiKey || "";
            }
          } else if (currentModel === "llama-3.3-70b-versatile") {
            currentEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
            currentModel = "gemini-2.0-flash";
            currentApiKey = geminiKey || "";
          } else {
            currentEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
            currentModel = "gemini-2.0-flash";
            currentApiKey = geminiKey || "";
          }
          continue;
        }

        if (!res.ok) {
          const error = await res.text();
          throw new Error(`AI Request Failed: ${res.status} - ${error}`);
        }

        const json = await res.json();
        let args;
        
        try {
          if (currentEndpoint.includes("googleapis.com") && !currentEndpoint.includes("/openai/")) {
            // Parse native Gemini response
            let text = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error("Gemini failed to generate content.");
            text = text.replace(/```json|```/g, "").trim();
            args = text;
          } else {
            // Parse OpenAI/Groq tool call
            const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
            const content = json.choices?.[0]?.message?.content;
            
            args = toolCall?.function?.arguments;
            
            // Fallback to content parsing if tool call is missing
            if (!args && content) {
              const cleanedContent = content.replace(/```json|```/g, "").trim();
              if (cleanedContent.startsWith("{")) {
                args = cleanedContent;
              }
            }
          }
        } catch (parseError) {
          console.error("Refine Parse Error:", parseError);
          throw new Error("AI returned invalid resume data format.");
        }

        if (!args) throw new Error("AI failed to generate a structured resume.");
        
        return { ok: true as const, data: JSON.parse(args) };
      }
      throw new Error("Failed after multiple attempts.");
    } catch (e: any) {
      return { ok: false as const, error: e.message };
    }
  });
