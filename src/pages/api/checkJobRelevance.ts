import type { NextApiRequest, NextApiResponse } from "next";
import { createChatCompletion, OpenAIRequestError } from "@/utils/openai";

type CheckJobRelevanceRequest = {
  skills?: string;
  summary?: string;
  jobExcerpt?: string;
};

type CheckJobRelevanceResponse = {
  content: string;
  totalTokens: number;
};

type ErrorResponse = { message: string };

const getFirstWords = (text: string, maxWords: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(" ");
};

const buildPrompt = (skills: string, summary: string, jobExcerpt: string) =>
  [
    "You are an expert recruiter and career coach.",
    "Task: evaluate how well the user's existing skills and profile match the job.",
    "Return ONLY valid JSON (no markdown).",
    "Required JSON keys:",
    "relevanceScore (number 0-100), matchSummary (string), strengths (string[]), gaps (string[]), improvements (string[]), suggestions (string[]).",
    "",
    "User Skills:",
    skills || "Not provided",
    "",
    "User Summary:",
    summary || "Not provided",
    "",
    "Job Description (first 100 words):",
    jobExcerpt || "Not provided",
  ].join("\n");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckJobRelevanceResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const body = (req.body ?? {}) as CheckJobRelevanceRequest;
  const skills = typeof body.skills === "string" ? body.skills : "";
  const summary =
    typeof body.summary === "string" ? getFirstWords(body.summary, 100) : "";
  const jobExcerpt =
    typeof body.jobExcerpt === "string" ? getFirstWords(body.jobExcerpt, 100) : "";

  if (!skills && !summary) {
    return res.status(400).json({ message: "Skills or summary is required." });
  }
  if (!jobExcerpt) {
    return res.status(400).json({ message: "Job description excerpt is required." });
  }

  const prompt = buildPrompt(skills, summary, jobExcerpt);
  // eslint-disable-next-line no-console
  console.log("[Job Relevance Prompt]", prompt);

  try {
    const result = await createChatCompletion(prompt);
    return res.status(200).json({
      content: result.content,
      totalTokens: result.usage?.total_tokens || 0,
    });
  } catch (error) {
    if (error instanceof OpenAIRequestError) {
      console.error("AI chat error", {
        status: error.status,
        details: error.details,
      });
      return res.status(error.status).json({ message: error.message });
    }
    console.error("AI chat error", error);
    return res.status(500).json({ message: "Failed to reach AI service." });
  }
}
