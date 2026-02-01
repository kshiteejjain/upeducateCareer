import type { NextApiRequest, NextApiResponse } from "next";
import { createChatCompletion, OpenAIRequestError } from "@/utils/openai";

type AiResumeResult = {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  rewriteSummary: string;
  keywords: string[];
  parsedResume: {
    name: string;
    title: string;
    location: string;
    email: string;
    phone: string;
    photo?: string;
    summary: string;
    skills: { name: string; rating: number }[];
    languages: string[];
    experiences: { role: string; company: string; dates: string; bullets: string[] }[];
    education: { school: string; degree: string; dates: string }[];
    projects: { name: string; dates: string; summary: string; tech: string }[];
  };
};

const buildPrompt = (text: string) => {
  return [
    "You are an expert resume coach.",
    "Analyze the resume text and provide improvement feedback.",
    "Return STRICT JSON only, no extra text, using this schema:",
    `{
  "score": 0-100,
  "summary": "2-3 sentence overview",
  "strengths": ["item1","item2","item3"],
  "improvements": ["item1","item2","item3","item4"],
  "suggestions": ["item1","item2","item3","item4"],
  "rewriteSummary": "Improved professional summary (80-140 words)",
  "keywords": ["keyword1","keyword2","keyword3","keyword4","keyword5","keyword6","keyword7","keyword8"],
  "parsedResume": {
    "name": "",
    "title": "",
    "location": "",
    "email": "",
    "phone": "",
    "photo": "",
    "summary": "",
    "skills": [{"name":"","rating":3}],
    "languages": [],
    "experiences": [{"role":"","company":"","dates":"","bullets":[""]}],
    "education": [{"school":"","degree":"","dates":""}],
    "projects": [{"name":"","dates":"","summary":"","tech":""}]
  }
}`,
    "Resume text:",
    text.slice(0, 6000),
  ].join("\n");
};

const parseJson = (text: string): AiResumeResult => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in AI response");
  return JSON.parse(match[0]) as AiResumeResult;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AiResumeResult | { message: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!text || text.replace(/\s/g, "").length < 50) {
    return res.status(400).json({ message: "Resume text is required." });
  }

  try {
    const prompt = buildPrompt(text);
    const result = await createChatCompletion(prompt);
    const parsed = parseJson(result.content);
    return res.status(200).json(parsed);
  } catch (error) {
    if (error instanceof OpenAIRequestError) {
      console.error("resumeImprove failed", {
        status: error.status,
        details: error.details,
      });
      return res.status(error.status).json({ message: error.message });
    }
    console.error("resumeImprove failed", error);
    const message = error instanceof Error ? error.message : "Failed to improve resume.";
    return res.status(500).json({ message });
  }
}
