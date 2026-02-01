type OpenAIChatResponse = {
  choices?: { message?: { content?: unknown } }[];
  usage?: { total_tokens?: number };
  model?: string;
};

export type OpenAIChatResult = {
  content: string;
  usage?: { total_tokens?: number };
  model?: string;
};

export class OpenAIRequestError extends Error {
  status: number;
  details?: string;
  constructor(status: number, message: string, details?: string) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS) || 30000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

const extractContent = (message: unknown): string => {
  if (!message || typeof message !== "object") return "";
  const content = (message as { content?: unknown }).content;
  if (Array.isArray(content)) {
    const textBlock = content.find(
      (item) => item && typeof item === "object" && (item as { type?: string }).type === "text"
    ) as { text?: string } | undefined;
    return textBlock?.text ?? "";
  }
  if (typeof content === "string") return content;
  return "";
};

export const ensureOpenAIKey = () => {
  if (!OPENAI_API_KEY) {
    throw new OpenAIRequestError(500, "Missing OPENAI_API_KEY");
  }
};

type ChatCompletionOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

const safeParseErrorDetails = (rawText: string): string => {
  if (!rawText) return "";
  try {
    const parsed = JSON.parse(rawText) as { error?: { message?: string } };
    return parsed?.error?.message ?? rawText;
  } catch {
    return rawText;
  }
};

export const createChatCompletion = async (
  prompt: string,
  { model = "gpt-4o-mini", temperature, maxTokens }: ChatCompletionOptions = {}
) => {
  ensureOpenAIKey();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: prompt }],
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new OpenAIRequestError(
        response.status,
        "AI service error.",
        safeParseErrorDetails(errText)
      );
    }

    const data = (await response.json()) as OpenAIChatResponse;
    const content = extractContent(data?.choices?.[0]?.message ?? {}).trim();
    if (!content) {
      throw new OpenAIRequestError(502, "AI service returned an empty response.");
    }
    return {
      content,
      usage: data?.usage,
      model: data?.model,
    } satisfies OpenAIChatResult;
  } catch (error) {
    if ((error as { name?: string }).name === "AbortError") {
      throw new OpenAIRequestError(504, "OpenAI request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
