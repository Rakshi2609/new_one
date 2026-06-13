import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendChatMessage } from "@/api/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "What are the side effects of my current medications?",
  "When should I take my next dose?",
  "Can I exercise during my recovery?",
  "What symptoms should I watch out for?",
  "How long is my recovery expected to take?",
];

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your CuraPath Recovery Coach. I have access to your medical profile and recovery plan. How can I help you today? You can ask me about your medications, symptoms, follow-up appointments, or anything else about your recovery.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const query = text ?? input.trim();
    if (!query || loading) return;

    const userMessage: Message = {
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await sendChatMessage(history, query);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, timestamp: new Date() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I encountered an issue. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-[#f5f8fe] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-alan-border bg-white/95 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center gap-3">
          <Link
            to="/"
            className="p-2 hover:bg-alan-border/50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-alan-text-primary" />
          </Link>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-alan-text-primary leading-tight">
              AI Recovery Coach
            </p>
            <p className="text-xs text-alan-text-muted flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
              Powered by Gemini 1.5 Flash
            </p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6 flex flex-col gap-4 pb-32">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                msg.role === "user"
                  ? "bg-alan-indigo text-white"
                  : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
              }`}
            >
              {msg.role === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-alan-indigo text-white rounded-tr-sm"
                  : "bg-white border border-alan-border text-alan-text-primary rounded-tl-sm shadow-sm"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
              <p
                className={`text-[10px] mt-1.5 ${
                  msg.role === "user"
                    ? "text-white/60 text-right"
                    : "text-alan-text-muted"
                }`}
              >
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white border border-alan-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-5">
                <span className="h-2 w-2 bg-alan-indigo/40 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 bg-alan-indigo/40 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 bg-alan-indigo/40 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* Suggested Questions (show only initially) */}
      {messages.length <= 1 && (
        <div className="mx-auto w-full max-w-2xl px-4 pb-4">
          <p className="text-xs text-alan-text-muted mb-2 font-medium">
            Suggested questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="text-xs px-3 py-1.5 rounded-full bg-white border border-alan-border text-alan-text-secondary hover:border-alan-indigo hover:text-alan-indigo transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-alan-border px-4 py-4">
        <div className="mx-auto max-w-2xl flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach anything about your recovery..."
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-alan-border bg-alan-surface px-4 py-3 text-sm text-alan-text-primary placeholder:text-alan-text-muted focus:outline-none focus:ring-2 focus:ring-alan-indigo/30 focus:border-alan-indigo transition-all max-h-32 overflow-y-auto"
            style={{ minHeight: "48px" }}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            size="icon"
            className="h-12 w-12 rounded-2xl bg-alan-indigo hover:bg-alan-indigo/90 text-white flex-shrink-0 shadow-lg shadow-alan-indigo/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
