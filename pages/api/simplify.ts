import type { NextApiRequest, NextApiResponse } from "next";

// In-memory GPT-4 usage tracker (resets hourly)
const gpt4Usage: Record<string, { count: number; lastReset: number }> = {};
const GPT4_LIMIT = 5;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { input, level, targetLanguage, model } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OpenAI API key" });
  }

  if (!input || !level || !targetLanguage || !model) {
    return res.status(400).json({ error: "Missing input, level, targetLanguage, or model" });
  }

  // ✅ Rate-limit GPT-4 by IP address
  if (model === "gpt-4-0613") {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown";

    const now = Date.now();
    const usage = gpt4Usage[ip];

    if (!usage || now - usage.lastReset > 60 * 60 * 1000) {
      gpt4Usage[ip] = { count: 1, lastReset: now };
    } else if (usage.count >= GPT4_LIMIT) {
      return res.status(429).json({ error: "⚠️ GPT-4 usage limit reached for this hour." });
    } else {
      gpt4Usage[ip].count += 1;
    }
  }

  const allowedModels = ["gpt-3.5-turbo", "gpt-4-0613"];
  const selectedModel = allowedModels.includes(model) ? model : "gpt-3.5-turbo";

  // 🔧 Map explanation level to custom prompt behavior
  const levelInstructions: Record<string, string> = {
    "Explain like I’m 5": "Use simple, playful language with very basic words, as if explaining to a 5-year-old.",
    "Explain like I’m 10": "Use simple but informative language suitable for a 10-year-old.",
    "Plain English": "Use clear and concise language for an adult or ESL learner with no jargon.",
    "Executive summary": "Summarize the content in 3–5 concise, high-level bullet points as if for a busy executive.",
    "Legal summary": "Translate legal or formal language into plain English without changing the meaning.",
    "Medical explanation": "Translate clinical or medical language into clear, everyday words for patients.",
   "ADHD-friendly": "Format this for someone with ADHD. Use 4–6 short bullet points. Start each line with an emoji. Bold key terms in each bullet. Avoid long paragraphs. Make it visual, concise, and easy to scan quickly.",
    "Study guide (student)": "Summarize this like structured flashcard notes for a student. Use sections in this order: Symptoms, Diagnosis, Condition (with definition), Treatment, and Key Term. Use bullet points. Bold the key terms in each bullet. Add emojis to help visually separate sections. Keep it concise and easy to scan.",
  };

  const formatStyle = levelInstructions[level] || "Use clear and simple language appropriate to the reader.";

  const systemMessage = `
You are a helpful assistant that simplifies and optionally translates text.

1. Detect the input language.
2. If it's not in "${targetLanguage}", translate it to "${targetLanguage}".
3. Then rewrite the content based on this instruction: ${formatStyle}
4. Respond only in ${targetLanguage}.
`.trim();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: input.trim() },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data?.choices?.[0]?.message?.content) {
      console.error("OpenAI error:", data);
      return res.status(500).json({ error: "OpenAI did not return a valid response." });
    }

    return res.status(200).json({
      output: data.choices[0].message.content.trim(),
      model: selectedModel,
    });
  } catch (err) {
    console.error("OpenAI API fetch failed:", err);
    return res.status(500).json({ error: "Something went wrong while calling OpenAI." });
  }
}
