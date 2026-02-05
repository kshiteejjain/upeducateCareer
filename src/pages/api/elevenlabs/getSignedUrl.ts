import type { NextApiRequest, NextApiResponse } from "next";

type SignedUrlResponse = {
  signed_url: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ signedUrl?: string; message?: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY || "";
  const agentId = process.env.ELEVENLABS_AGENT_ID || "";

  if (!apiKey || !agentId) {
    return res.status(500).json({ message: "Missing ElevenLabs configuration." });
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(
        agentId
      )}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        message: text || "Failed to get signed URL from ElevenLabs.",
      });
    }

    const data = (await response.json()) as SignedUrlResponse;
    if (!data?.signed_url) {
      return res.status(502).json({ message: "Invalid signed URL response." });
    }

    return res.status(200).json({ signedUrl: data.signed_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get signed URL.";
    return res.status(500).json({ message });
  }
}
