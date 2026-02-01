import type { NextApiRequest, NextApiResponse } from "next";

type AnalysisItem = {
  type: "positive" | "negative" | "suggestion";
  text: string;
  scoreImpact?: number;
  suggestion?: string;
};

type AnalysisSection = {
  title: string;
  icon: string;
  color: string;
  items: AnalysisItem[];
};

type ProfileInput = {
  profileUrl?: string;
  headline?: string;
  summary?: string;
  experience?: string;
  skills?: string[];
  education?: string;
  profileText?: string;
  targetKeywords?: string[];
};

type AiAnalysis = {
  aiScore: number;
  scoreRationale: string;
  recommendations: string[];
  modifications: {
    headline?: string;
    about?: string;
    experienceBullets?: string[];
    skills?: string[];
  };
  suggestedKeywords: string[];
};

type AiRequest = {
  profileData: ProfileInput;
  sections: AnalysisSection[];
};

const aiUpstreamUrl =
  process.env.GENERATE_CONTENT_API_URL ||
  process.env.NEXT_PUBLIC_GENERATE_CONTENT_API_URL ||
  process.env.REACT_APP_GENERATE_CONTENT_API_URL ||
  "";

const clip = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max)}...` : value;

const buildAiPrompt = (payload: AiRequest) => {
  const summarySections = payload.sections.map((section) => ({
    title: section.title,
    items: section.items.map((item) => ({
      type: item.type,
      text: item.text,
      suggestion: item.suggestion ?? "",
    })),
  }));

  return [
    "You are an expert LinkedIn profile coach.",
    "Provide AI-based scoring, recommendations, and concrete modifications.",
    "Use the provided data only; do not invent roles, dates, or companies.",
    "Return STRICT JSON only, no extra text, using this schema:",
    `{
  "aiScore": 0-100,
  "scoreRationale": "2-3 sentences",
  "recommendations": ["item1","item2","item3","item4","item5"],
  "modifications": {
    "headline": "improved headline (max 120 chars)",
    "about": "improved about/summary (120-200 words)",
    "experienceBullets": ["bullet1","bullet2","bullet3","bullet4"],
    "skills": ["skill1","skill2","skill3","skill4","skill5","skill6","skill7","skill8","skill9","skill10","skill11","skill12"]
  },
  "suggestedKeywords": ["keyword1","keyword2","keyword3","keyword4","keyword5","keyword6","keyword7","keyword8"]
}`,
    "Profile data:",
    JSON.stringify(
      {
        headline: clip(payload.profileData.headline || "", 400),
        summary: clip(payload.profileData.summary || "", 1200),
        experience: clip(payload.profileData.experience || "", 1800),
        education: clip(payload.profileData.education || "", 600),
        skills: payload.profileData.skills || [],
        profileText: clip(payload.profileData.profileText || "", 2000),
        analysisSections: summarySections,
      },
      null,
      2
    ),
  ].join("\n");
};

const parseAiJson = (text: string): AiAnalysis => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in AI response");
  return JSON.parse(match[0]) as AiAnalysis;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AiAnalysis | { message: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!aiUpstreamUrl) {
    return res.status(500).json({ message: "Missing GENERATE_CONTENT_API_URL" });
  }

  const body = (req.body ?? {}) as AiRequest;
  if (!body.profileData || !Array.isArray(body.sections)) {
    return res.status(400).json({ message: "profileData and sections are required." });
  }

  try {
    const prompt = buildAiPrompt(body);
    const response = await fetch(`${aiUpstreamUrl}/generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        message: `AI upstream error: ${response.status} - ${errText}`,
      });
    }

    const data = (await response.json()) as { content?: string };
    const content = data.content?.trim() || "";
    const parsed = parseAiJson(content);
    return res.status(200).json(parsed);
  } catch (error) {
    console.error("LinkedIn AI analysis failed", error);
    const message =
      error instanceof Error ? error.message : "Failed to analyze profile with AI.";
    return res.status(500).json({ message });
  }
}
