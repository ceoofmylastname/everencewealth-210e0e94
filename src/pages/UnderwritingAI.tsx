import { useState, useEffect, useRef, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ShieldCheck, Send, Upload, Sparkles, Brain, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

/* ─── types ──────────────────────────────────────────── */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

/* ─── quick prompts ──────────────────────────────────── */

const QUICK_PROMPTS = [
  "What are the diabetes guidelines for Mutual of Omaha?",
  "Compare term life underwriting for smokers across carriers",
  "What cardiac conditions are declined by North American?",
  "Summarise IUL underwriting classes for Pacific Life",
];

/* ─── component ──────────────────────────────────────── */

export default function UnderwritingAI() {
  const { toast } = useToast();

  /* chat state */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* upload dialog state */
  const [uploadOpen, setUploadOpen] = useState(false);
  const [carrierName, setCarrierName] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  /* auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /* ─── send message ─────────────────────────────────── */

  async function handleSend(e?: FormEvent) {
    e?.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: question };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const res = await fetch(`${supabaseUrl}/functions/v1/underwriting-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question,
          history: updatedMessages.slice(-20).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Request failed");
      }

      /* streaming support */
      if (res.headers.get("content-type")?.includes("text/event-stream")) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        const sources: string[] = [];

        const assistantIdx = updatedMessages.length;
        setMessages((prev) => [...prev, { role: "assistant", content: "", sources: [] }]);

        if (reader) {
          let done = false;
          while (!done) {
            const { value, done: d } = await reader.read();
            done = d;
            if (value) {
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n");
              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const jsonStr = line.slice(6).trim();
                  if (!jsonStr || jsonStr === "[DONE]") continue;
                  try {
                    const parsed = JSON.parse(jsonStr);
                    const delta = parsed.choices?.[0]?.delta?.content;
                    if (delta) assistantContent += delta;
                    const chunkSources = parsed.choices?.[0]?.sources;
                    if (chunkSources) sources.push(...chunkSources);
                  } catch {
                    // skip malformed JSON
                  }
                }
              }
              setMessages((prev) => {
                const copy = [...prev];
                copy[assistantIdx] = {
                  role: "assistant",
                  content: assistantContent,
                  sources: [...new Set(sources)],
                };
                return copy;
              });
            }
          }
        }
      } else {
        /* non-streaming JSON response */
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: data.answer ?? data.content ?? JSON.stringify(data),
          sources: data.sources ?? [],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      console.error("Underwriting chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Error: ${err.message ?? "Something went wrong."}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  /* ─── quick prompt click ───────────────────────────── */

  function handleQuickPrompt(prompt: string) {
    setInput(prompt);
    // Use timeout to let state update, then submit
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as FormEvent;
      setInput(prompt);
      handleSendDirect(prompt);
    }, 0);
  }

  async function handleSendDirect(question: string) {
    if (!question || isLoading) return;
    const userMsg: ChatMessage = { role: "user", content: question };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const res = await fetch(`${supabaseUrl}/functions/v1/underwriting-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question,
          history: updatedMessages.slice(-20).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      if (res.headers.get("content-type")?.includes("text/event-stream")) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        const sources: string[] = [];
        const assistantIdx = updatedMessages.length;
        setMessages((prev) => [...prev, { role: "assistant", content: "", sources: [] }]);

        if (reader) {
          let done = false;
          while (!done) {
            const { value, done: d } = await reader.read();
            done = d;
            if (value) {
              const chunk = decoder.decode(value, { stream: true });
              for (const line of chunk.split("\n")) {
                if (line.startsWith("data: ")) {
                  const jsonStr = line.slice(6).trim();
                  if (!jsonStr || jsonStr === "[DONE]") continue;
                  try {
                    const parsed = JSON.parse(jsonStr);
                    const delta = parsed.choices?.[0]?.delta?.content;
                    if (delta) assistantContent += delta;
                    const chunkSources = parsed.choices?.[0]?.sources;
                    if (chunkSources) sources.push(...chunkSources);
                  } catch {
                    // skip malformed JSON
                  }
                }
              }
              setMessages((prev) => {
                const copy = [...prev];
                copy[assistantIdx] = {
                  role: "assistant",
                  content: assistantContent,
                  sources: [...new Set(sources)],
                };
                return copy;
              });
            }
          }
        }
      } else {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.answer ?? data.content ?? JSON.stringify(data),
            sources: data.sources ?? [],
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Error: ${err.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  /* ─── upload handler ───────────────────────────────── */

  async function handleUpload() {
    if (!carrierName.trim() || !pdfFile) return;

    setUploading(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((s, b) => s + String.fromCharCode(b), "")
      );

      const { error } = await supabase.functions.invoke("underwriting-process", {
        body: {
          carrier_name: carrierName.trim(),
          file_name: pdfFile.name,
          file_base64: base64,
        },
      });

      if (error) throw error;

      toast({
        title: "Guidelines uploaded",
        description: `${carrierName} guidelines are being processed.`,
      });
      setUploadOpen(false);
      setCarrierName("");
      setPdfFile(null);
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message ?? "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  /* ─── render ───────────────────────────────────────── */

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto p-4 gap-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-[hsl(160,48%,18%)] flex items-center justify-center shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Underwriting AI
            </h1>
            <p className="text-xs text-muted-foreground">
              Carrier guidelines at your fingertips
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setUploadOpen(true)}
          className="gap-2 rounded-xl border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] hover:translate-y-[-2px] transition-all"
        >
          <Upload className="h-4 w-4" />
          Upload Guidelines
        </Button>
      </div>

      {/* ── Chat area ── */}
      <Card className="flex-1 flex flex-col rounded-2xl border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          {isEmpty ? (
            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center h-full py-20 gap-6">
              <div className="h-16 w-16 rounded-2xl bg-[hsl(51,78%,70%)]/20 flex items-center justify-center">
                <Brain className="h-8 w-8 text-[hsl(51,78%,65%)]" />
              </div>
              <div className="text-center max-w-md">
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  Ask anything about underwriting
                </h2>
                <p className="text-sm text-muted-foreground">
                  Query carrier guidelines, compare underwriting classes, or check
                  medical impairment ratings across carriers.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="flex items-start gap-2 text-left rounded-xl border border-gray-200 bg-card p-3 text-sm text-foreground hover:border-[hsl(51,78%,65%)] hover:shadow-md hover:translate-y-[-2px] transition-all"
                  >
                    <Sparkles className="h-4 w-4 mt-0.5 text-[hsl(51,78%,65%)] shrink-0" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Messages ── */
            <div className="space-y-4">
              {messages.map((msg, i) => {
                const isUser = msg.role === "user";
                return (
                  <div key={i} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                    {(() => {
                      const isClarify = !isUser && (msg.content.startsWith("[CLARIFY]") || msg.content.includes("I need a bit more information"));
                      const displayContent = isClarify ? msg.content.replace(/^\[CLARIFY\]\s*/, "") : msg.content;
                      return (
                        <div
                          className={cn(
                            "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3",
                            isUser
                              ? "bg-[hsl(160,48%,18%)] text-white rounded-br-md"
                              : isClarify
                                ? "bg-card border border-gray-200 border-l-4 border-l-teal-500 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] rounded-bl-md"
                                : "bg-card border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] rounded-bl-md"
                          )}
                        >
                          {isUser ? (
                            <p className="text-sm whitespace-pre-wrap">{displayContent}</p>
                          ) : (
                            <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-a:text-[hsl(160,48%,18%)] prose-strong:text-foreground">
                              <ReactMarkdown>{displayContent}</ReactMarkdown>
                            </div>
                          )}

                          {/* source badges */}
                          {!isUser && msg.sources && msg.sources.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-100">
                              <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                              {msg.sources.map((src, j) => (
                                <span
                                  key={j}
                                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-[hsl(51,78%,70%)]/20 text-[hsl(160,48%,18%)] border border-[hsl(51,78%,70%)]/30"
                                >
                                  {src}
                                </span>
                              ))}
                            </div>
                          )}

                          <p
                            className={cn(
                              "text-[10px] mt-1",
                              isUser ? "text-white/60" : "text-muted-foreground"
                            )}
                          >
                            {new Date().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}

              {/* typing indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-card border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]">
                    <div className="flex gap-1.5 items-center h-5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* ── Input bar ── */}
        <div className="border-t border-gray-200 p-3">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={messages.length > 0 && messages[messages.length - 1].role === "assistant" && (messages[messages.length - 1].content.startsWith("[CLARIFY]") || messages[messages.length - 1].content.includes("I need a bit more information")) ? "Answer the question above..." : "Ask about underwriting guidelines..."}
              className="flex-1 h-10 rounded-xl border-gray-200"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="h-10 w-10 rounded-xl bg-[hsl(160,48%,18%)] hover:bg-[hsl(160,48%,14%)] shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Upload Dialog ── */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Upload Carrier Guidelines</DialogTitle>
            <DialogDescription>
              Upload a PDF of carrier underwriting guidelines to make them
              searchable in the AI chat.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Carrier Name
              </label>
              <Input
                value={carrierName}
                onChange={(e) => setCarrierName(e.target.value)}
                placeholder="e.g. Mutual of Omaha"
                className="rounded-xl border-gray-200"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Guidelines PDF
              </label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                className="rounded-xl border-gray-200"
              />
              {pdfFile && (
                <p className="text-xs text-muted-foreground">
                  {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(1)} MB)
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !carrierName.trim() || !pdfFile}
              className="rounded-xl bg-[hsl(160,48%,18%)] hover:bg-[hsl(160,48%,14%)] gap-2"
            >
              {uploading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload & Process
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
