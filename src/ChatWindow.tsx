import { useState } from "react";
import type { FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import { sendChatMessage } from "./api";
import type { ChatMessage } from "./api";

interface ChatWindowProps {
  employeeId: string;
}

export default function ChatWindow({ employeeId }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const reply = await sendChatMessage(employeeId, text);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="chat-window">
      <div className="chat-history">
        {messages.length === 0 && (
          <p className="chat-empty">
            Ask a leave question as <strong>{employeeId}</strong> — e.g. "Can I get a 5-day casual leave?"
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble chat-bubble-${m.role}`}>
            <span className="chat-bubble-label">{m.role === "user" ? employeeId : "HR Assistant"}</span>
            <div className="chat-bubble-content">
              <ReactMarkdown>{m.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="chat-bubble chat-bubble-assistant chat-bubble-pending">
            <span className="chat-bubble-label">HR Assistant</span>
            <p>Thinking…</p>
          </div>
        )}
      </div>

      {error && <div className="chat-error">{error}</div>}

      <form className="chat-input-row" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your leave question…"
          disabled={isSending}
        />
        <button type="submit" disabled={isSending || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
