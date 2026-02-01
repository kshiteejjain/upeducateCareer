import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { ReactElement } from "react";
import Layout from "@/components/Layout/Layout";
import styles from "./AskAnu.module.css";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatResponse = {
  content: string;
  totalTokens: number;
};

const renderInline = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
      );
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
};

const renderMarkdown = (content: string) => {
  const lines = content.split(/\r?\n/);
  const blocks: ReactElement[] = [];
  let index = 0;

  const pushParagraph = (text: string) => {
    if (!text.trim()) return;
    blocks.push(
      <p key={`p-${index++}`}>{renderInline(text)}</p>
    );
  };

  while (lines.length) {
    const line = lines.shift() ?? "";
    if (!line.trim()) {
      continue;
    }

    if (/^#{1,3}\s+/.test(line)) {
      const level = Math.min(3, (line.match(/^#+/)?.[0].length ?? 1));
      const text = line.replace(/^#{1,3}\s+/, "");
      const Tag = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
      blocks.push(
        <Tag key={`h-${index++}`}>{renderInline(text)}</Tag>
      );
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [line];
      while (lines[0] && /^\s*\d+\.\s+/.test(lines[0])) {
        items.push(lines.shift() as string);
      }
      blocks.push(
        <ol key={`ol-${index++}`}>
          {items.map((item, itemIndex) => (
            <li key={`ol-${index}-${itemIndex}`}>
              {renderInline(item.replace(/^\s*\d+\.\s+/, ""))}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [line];
      while (lines[0] && /^\s*[-*]\s+/.test(lines[0])) {
        items.push(lines.shift() as string);
      }
      blocks.push(
        <ul key={`ul-${index++}`}>
          {items.map((item, itemIndex) => (
            <li key={`ul-${index}-${itemIndex}`}>
              {renderInline(item.replace(/^\s*[-*]\s+/, ""))}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    const paragraphLines = [line];
    while (lines[0] && lines[0].trim() && !/^\s*[-*]\s+/.test(lines[0]) && !/^\s*\d+\.\s+/.test(lines[0]) && !/^#{1,3}\s+/.test(lines[0])) {
      paragraphLines.push(lines.shift() as string);
    }
    pushParagraph(paragraphLines.join(" "));
  }

  return blocks;
};

export default function AskAnu() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI coach. Share your goal or question, and I’ll help with a clear, actionable response.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    setError("");
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const response = await fetch("/api/aksAnu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage.content }),
        signal: controller.signal,
      });
      const data = (await response.json()) as ChatResponse & { message?: string };
      if (!response.ok) {
        throw new Error(data?.message || "Failed to get response.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content || "No response returned." },
      ]);
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setError("Request cancelled.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to send message.");
      }
    } finally {
      setIsLoading(false);
      controllerRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage();
  };

  const handleStop = () => {
    controllerRef.current?.abort();
  };

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hi! I'm your AI coach. Share your goal or question, and I’ll help with a clear, actionable response.",
      },
    ]);
    setError("");
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <div className={styles.titleRow}>
              <Image src="/shiksha.png" alt="Anu" width={36} height={36} />
              <h1>Ask Anu - Your AI Coach</h1>
            </div>
            <p>Ask about resumes, interviews, learning paths, or career clarity.</p>
          </div>
          <div className={styles.headerActions}>
            <button type="button" className={styles.secondaryBtn} onClick={handleClear}>
              Clear chat
            </button>
          </div>
        </div>

        <div className={styles.chatShell}>
          <div className={styles.messages}>
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`${styles.messageRow} ${message.role === "user" ? styles.user : styles.assistant}`}
              >
                <div
                  className={`${styles.messageBubble} ${
                    message.role === "user" ? styles.userBubble : styles.coachBubble
                  }`}
                >
                  <span
                    className={`${styles.roleTag} ${
                      message.role === "user" ? styles.roleUser : styles.roleCoach
                    }`}
                  >
                    {message.role === "user" ? "You" : "Coach 🤖"}
                  </span>
                  <div
                    className={`${styles.messageContent} ${
                      message.role === "user" ? styles.messageUser : styles.messageCoach
                    }`}
                  >
                    {renderMarkdown(message.content)}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.messageRow} ${styles.assistant}`}>
                <div className={`${styles.messageBubble} ${styles.coachBubble}`}>
                  <span className={`${styles.roleTag} ${styles.roleCoach}`}>
                    Coach 🤖
                  </span>
                  <p className={styles.thinking}>Thinking...</p>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className={styles.composer}>
            <div className={styles.inputWrapper}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Type your question or share your goal..."
                className={styles.textarea}
                rows={1}
                disabled={isLoading}
              />
            </div>
            <div className={styles.actions}>
              {isLoading ? (
                <button type="button" className={styles.stopBtn} onClick={handleStop}>
                  Stop
                </button>
              ) : (
                <button type="submit" className="btn-primary">
                  Send
                </button>
              )}
            </div>
          </form>
        </div>

        {error && <div className={styles.error}>{error}</div>}
      </div>
    </Layout>
  );
}
