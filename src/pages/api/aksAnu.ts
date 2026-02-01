import type { NextApiRequest, NextApiResponse } from "next";
import { createChatCompletion, OpenAIRequestError } from "@/utils/openai";

type ChatResponse = {
  content: string;
  totalTokens: number;
};

type ErrorResponse = { message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt : "";
  if (!prompt.trim()) {
    return res.status(400).json({ message: "Prompt is required." });
  }

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
