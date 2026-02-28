import { useState, useRef, useEffect, useCallback } from "react";
import { GraduationCap, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { generateUniversities } from "@/data/universities";

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME_MSG =
  "Hi! I'm your Universe AI Counselor 🎓. I can help you find the best universities based on our real-time rankings. What are you looking for today?";

const QUICK_ACTIONS = [
  { label: "🏆 Top 10 Global", message: "Show me the current top 10 globally ranked universities." },
  { label: "🔬 Best for Research", message: "Which universities are best for research?" },
  { label: "📊 How is rank calculated?", message: "How is the overall ranking score calculated?" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/universe-chat`;

// Build a compact data summary to send to the backend
function buildUniversitySummary(): string {
  const unis = generateUniversities();
  return unis
    .map(
      (u, i) =>
        `#${i + 1} ${u.name} (${u.country}) — Overall: ${u.overallScore}, Academic: ${u.pillars.academicReputation}, Citations: ${u.pillars.citationsPerFaculty}, Employer: ${u.pillars.employerReputation}, Research Focus: ${u.researchFocus}`
    )
    .join("\n");
}

let cachedSummary: string | null = null;
function getUniversitySummary() {
  if (!cachedSummary) cachedSummary = buildUniversitySummary();
  return cachedSummary;
}

const AIChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, open]);

  // Focus input when opening
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const streamChat = useCallback(
    async (allMessages: Msg[]) => {
      setIsLoading(true);
      let assistantSoFar = "";

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: allMessages,
            universityData: getUniversitySummary(),
          }),
        });

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error || `Request failed (${resp.status})`);
        }

        if (!resp.body) throw new Error("No response body");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";

        const upsert = (chunk: string) => {
          assistantSoFar += chunk;
          const snap = assistantSoFar;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant")
              return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: snap } : m));
            return [...prev, { role: "assistant", content: snap }];
          });
        };

        let streamDone = false;
        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let nlIdx: number;
          while ((nlIdx = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, nlIdx);
            textBuffer = textBuffer.slice(nlIdx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") {
              streamDone = true;
              break;
            }
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) upsert(content);
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        // Flush remaining
        if (textBuffer.trim()) {
          for (let raw of textBuffer.split("\n")) {
            if (!raw) continue;
            if (raw.endsWith("\r")) raw = raw.slice(0, -1);
            if (!raw.startsWith("data: ")) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const c = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (c) upsert(c);
            } catch {
              /* ignore */
            }
          }
        }
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : "Something went wrong.";
        setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${errMsg}` }]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const send = (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    streamChat(next);
  };

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-105 transition-transform flex items-center justify-center"
          aria-label="Open AI Counselor"
        >
          <GraduationCap className="h-7 w-7" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] flex flex-col rounded-2xl shadow-2xl border border-border bg-card overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shrink-0">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              <span className="font-display font-bold text-sm">Universe AI Counselor</span>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-primary-foreground/20 rounded-md p-1 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea ref={scrollRef} className="flex-1 px-4 py-3">
            {/* Welcome */}
            <div className="mb-3">
              <div className="inline-block max-w-[85%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm bg-muted text-foreground">
                {WELCOME_MSG}
              </div>
            </div>

            {/* Quick actions (show only if no messages yet) */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {QUICK_ACTIONS.map((qa) => (
                  <button
                    key={qa.label}
                    onClick={() => send(qa.message)}
                    className="text-xs px-3 py-1.5 rounded-full border border-secondary/40 text-secondary hover:bg-secondary/10 transition-colors"
                  >
                    {qa.label}
                  </button>
                ))}
              </div>
            )}

            {/* Chat history */}
            {messages.map((m, i) => (
              <div key={i} className={`mb-3 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`inline-block max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none [&_p]:m-0 [&_ul]:mt-1 [&_ol]:mt-1 [&_li]:m-0">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="mb-3 flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm bg-muted text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-border shrink-0 bg-card">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about rankings…"
                disabled={isLoading}
                className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-9 w-9 rounded-full shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
