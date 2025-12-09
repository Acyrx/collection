"use client";

import { useEffect, useRef, useState } from "react";
import { vapi } from "@/lib/vapi.sdk";
import { saveAIMessages } from "@/lib/actions/ai-messages.actions";
import { toast } from "sonner";
import { Mic, MicOff, Phone, PhoneOff, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: string;
  transcriptType?: string;
  transcript?: string;
}

interface AIAssistantSessionProps {
  aiTutorId: string;
  assistantConfig: any;
  assistantOverrides?: any;
  title?: string;
}

export default function AIAssistantSession({
  aiTutorId,
  assistantConfig,
  assistantOverrides,
  title = "AI Assistant",
}: AIAssistantSessionProps) {
  const [callStatus, setCallStatus] = useState<
    "idle" | "connecting" | "active" | "finished" | "failed"
  >("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [combinedMessages, setCombinedMessages] = useState<
    { role: string; content: string }[]
  >([]);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const combinedMessagesRef = useRef<{ role: string; content: string }[]>([]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [combinedMessages]);

  // Group consecutive messages from same role
  useEffect(() => {
    const groupedMessages: { role: string; content: string }[] = [];
    let lastRole: string | null = null;
    let currentContent = "";

    [...messages].reverse().forEach((message) => {
      if (lastRole === message.role) {
        currentContent += "\n\n" + message.content;
      } else {
        if (lastRole !== null) {
          groupedMessages.push({ role: lastRole, content: currentContent });
        }
        lastRole = message.role;
        currentContent = message.content;
      }
    });

    if (lastRole !== null) {
      groupedMessages.push({ role: lastRole, content: currentContent });
    }
    setCombinedMessages(groupedMessages);
  }, [messages]);

  // Keep ref of latest combined messages
  useEffect(() => {
    combinedMessagesRef.current = combinedMessages;
  }, [combinedMessages]);

  // VAPI event handlers
  useEffect(() => {
    const onCallStart = () => {
      setCallStatus("active");
      setError(null);
      startTimer();
    };

    const onCallEnd = async () => {
      setCallStatus("finished");
      stopTimer();

      // Save messages to database
      if (combinedMessagesRef.current.length > 0) {
        try {
          await saveAIMessages(
            aiTutorId,
            sessionIdRef.current,
            combinedMessagesRef.current.map((msg) => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
            }))
          );
          toast.success("Session saved to history");
        } catch (err) {
          console.error("Failed to save session:", err);
          toast.error("Failed to save session");
        }
      }
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setMessages((prev) => [
          {
            role: message.role as "user" | "assistant",
            content: message.transcript || "",
          },
          ...prev,
        ]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = (error: Error) => {
      console.error("VAPI Error:", error);
      setCallStatus("failed");
      stopTimer();
      const errorMessage =
        error.message || "Connection failed. Please try again.";
      setError(errorMessage);
      toast.error("Error: " + errorMessage);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage as Parameters<typeof vapi.on>[1]);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage as Parameters<typeof vapi.off>[1]);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [aiTutorId]);

  const startTimer = () => {
    setCallDuration(0);
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleMicrophone = () => {
    const muted = vapi.isMuted();
    vapi.setMuted(!muted);
    setIsMuted(!muted);
  };

  const formatErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === "string" && error.trim()) return error;
    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown error";
    }
  };

  const handleStart = async () => {
    if (!process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN) {
      setError("VAPI token not configured");
      toast.error("VAPI token not configured");
      return;
    }

    setCallStatus("connecting");
    setError(null);
    setMessages([]);
    setCombinedMessages([]);
    sessionIdRef.current = crypto.randomUUID();

    try {
      await vapi.start(assistantConfig, {
        ...assistantOverrides,
        clientMessages: "transcript",
      });
    } catch (err) {
      console.error("Failed to start VAPI session:", err);
      setCallStatus("failed");
      setError(formatErrorMessage(err));
      toast.error("Unable to start the session. Please retry.");
      stopTimer();
    }
  };

  const handleStop = () => {
    setCallStatus("finished");
    vapi.stop();
  };

  const copyMessage = (content: string, id: string) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        toast.success("Message copied");
        setCopiedMessageId(id);
        setTimeout(() => setCopiedMessageId(null), 2000);
      })
      .catch(() => toast.error("Copy failed"));
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="p-4 border-b border-border bg-card flex items-center justify-between gap-4 shrink-0">
        <h3 className="font-semibold text-foreground truncate">
          {title}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          {callStatus === "active" && (
            <span className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {formatTime(callDuration)}
            </span>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {combinedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-lg font-medium">Start your session</p>
            <p className="text-sm mt-1">
              Click Start Session to begin your conversation
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {combinedMessages.map((message, index) => {
              const messageId = `${index}-${message.content.substring(0, 10)}`;
              const isAssistant = message.role === "assistant";

              return (
                <div
                  key={messageId}
                  className={cn(
                    "flex",
                    isAssistant ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] lg:max-w-[75%] rounded-2xl p-4 relative group shadow-sm",
                      isAssistant
                        ? "bg-muted text-foreground rounded-tl-sm"
                        : "bg-primary text-primary-foreground rounded-tr-sm"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium">
                        {isAssistant ? title : "You"}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap text-sm lg:text-base leading-relaxed">
                      {message.content}
                    </p>

                    <button
                      onClick={() => copyMessage(message.content, messageId)}
                      className={cn(
                        "absolute top-2 right-2 p-1.5 rounded-lg transition-all",
                        copiedMessageId === messageId
                          ? "bg-green-100 text-green-600 opacity-100"
                          : "opacity-0 group-hover:opacity-100",
                        isAssistant
                          ? "hover:bg-background"
                          : "hover:bg-white/20"
                      )}
                      title="Copy message"
                    >
                      {copiedMessageId === messageId ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-border bg-card">
        {error && (
          <div className="mb-3 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={callStatus === "active" ? handleStop : handleStart}
            className={cn(
              "flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200",
              "flex items-center justify-center gap-2 shadow-lg hover:shadow-xl",
              callStatus === "active"
                ? "bg-destructive hover:bg-destructive/90"
                : callStatus === "connecting"
                ? "bg-primary/70 animate-pulse cursor-wait"
                : "bg-primary hover:bg-primary/90"
            )}
            disabled={callStatus === "connecting"}
          >
            {callStatus === "active" ? (
              <>
                <PhoneOff className="size-5" />
                End Session
              </>
            ) : callStatus === "connecting" ? (
              <>
                <Phone className="size-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Phone className="size-5" />
                Start Session
              </>
            )}
          </button>

          <button
            onClick={toggleMicrophone}
            disabled={callStatus !== "active"}
            className={cn(
              "p-3 rounded-xl transition-all duration-200 shadow-md",
              isMuted
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
              callStatus !== "active" && "opacity-50 cursor-not-allowed"
            )}
            title={isMuted ? "Unmute microphone" : "Mute microphone"}
          >
            {isMuted ? (
              <MicOff className="size-5" />
            ) : (
              <Mic className="size-5" />
            )}
          </button>
        </div>

        <div className="mt-3 text-center text-sm text-muted-foreground">
          {callStatus === "active" && (
            <div className="flex items-center justify-center gap-2">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  isSpeaking
                    ? "bg-green-500 animate-pulse"
                    : "bg-muted-foreground"
                )}
              />
              {isSpeaking
                ? `${title} is speaking...`
                : "Ready for your message"}
            </div>
          )}
          {callStatus === "idle" && "Click Start Session to begin"}
          {callStatus === "connecting" && "Establishing connection..."}
          {callStatus === "finished" &&
            `Session ended after ${formatTime(callDuration)}`}
          {callStatus === "failed" &&
            (error || "Connection failed. Please try again.")}
        </div>
      </div>
    </div>
  );
}

