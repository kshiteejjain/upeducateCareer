import type { NextApiRequest, NextApiResponse } from "next";

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

  const apiUrl = process.env.NEXT_PUBLIC_GENERATE_CONTENT_API_URL;
  if (!apiUrl) {
    return res.status(500).json({ message: "Missing NEXT_PUBLIC_GENERATE_CONTENT_API_URL" });
  }

  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt : "";
  if (!prompt.trim()) {
    return res.status(400).json({ message: "Prompt is required." });
  }

  try {
    const response = await fetch(`${apiUrl}/generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        message: `Server error: ${response.status} - ${errText}`,
      });
    }

    const data = (await response.json()) as {
      content?: string;
      usage?: { total_tokens?: number };
    };

    return res.status(200).json({
      content: data?.content?.trim() || "",
      totalTokens: data?.usage?.total_tokens || 0,
    });
  } catch (error) {
    console.error("AI chat error", error);
    return res.status(500).json({ message: "Failed to reach AI service." });
  }
}
