"use client";

import type React from "react";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn, configureAssistant, getSubjectColor } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import soundwaves from "@/constants/soundwaves.json";
import {
  addToSessionHistory,
  saveChatMessage,
  getChatMessages,
} from "@/lib/actions/companion.actions";
import { toast } from "sonner";
import { summarizeChat } from "@/ai/flows/summarize";
import { jsPDF } from "jspdf";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Copy,
  Check,
  FileText,
  MessageSquare,
  User,
  Bot,
  Menu,
  X,
  Clock,
  Beaker,
  Calculator,
  BookOpen,
  Palette,
  Scroll,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import type { Companion } from "@/lib/actions/companion.actions";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
  FAILED = "FAILED",
}

interface SummaryData {
  keyPoints?: string[];
  summary?: string;
}

interface Message {
  role: string;
  content: string;
  type?: string;
  transcriptType?: string;
  transcript?: string;
  id: string;
  timestamp: Date;
}

interface CompanionComponentProps {
  companion: Companion;
  userName: string;
  userImage?: string;
}

const subjectIcons: Record<string, React.ReactNode> = {
  science: <Beaker className="size-6" />,
  maths: <Calculator className="size-6" />,
  language: <BookOpen className="size-6" />,
  arts: <Palette className="size-6" />,
  history: <Scroll className="size-6" />,
};

const subjectEmojis: Record<string, string[]> = {
  science: ["🧪", "🔬", "⚗️", "🧬", "🔭"],
  maths: ["📐", "📊", "🔢", "➕", "📈"],
  language: ["📚", "✍️", "📖", "🗣️", "💬"],
  arts: ["🎨", "🖼️", "🎭", "🎵", "✨"],
  history: ["📜", "🏛️", "⏳", "🗿", "🏺"],
};

export default function CompanionComponent({
  companion,
  userName,
  userImage,
}: CompanionComponentProps) {
  const { id: companionId, subject, topic, title, style, voice } = companion;

  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs for combining AI messages
  const isCurrentlySpeakingRef = useRef(false);
  const pendingAiMessageRef = useRef<string[]>([]);
  const lastAiMessageIndexRef = useRef<number>(-1);
  const userInterruptedRef = useRef(false);

  // Store messages in ref for event handlers
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Fetch previous messages on component mount
  useEffect(() => {
    const fetchPreviousMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const previousMessages = await getChatMessages(companionId);

        if (previousMessages && previousMessages.length > 0) {
          // Convert database messages to local Message format
          const formattedMessages: Message[] = previousMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            id: msg.id || crypto.randomUUID(),
            timestamp: new Date(msg.createdAt),
          }));

          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Failed to fetch previous messages:", error);
        toast.error("Could not load previous conversation");
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchPreviousMessages();
  }, [companionId]);

  // Close mobile sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!isLoadingMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoadingMessages]);

  // Control lottie animation
  useEffect(() => {
    if (isSpeaking) {
      lottieRef.current?.play();
    } else {
      lottieRef.current?.stop();
    }
  }, [isSpeaking]);

  // Timer management
  useEffect(() => {
    if (callStatus === CallStatus.ACTIVE) {
      startTimer();
    } else {
      stopTimer();
    }

    return () => {
      stopTimer();
    };
  }, [callStatus]);

  // Handle AI speech start/end for combining messages
  useEffect(() => {
    if (isSpeaking) {
      // AI started speaking
      isCurrentlySpeakingRef.current = true;
      userInterruptedRef.current = false;
    } else if (isCurrentlySpeakingRef.current && !userInterruptedRef.current) {
      // AI stopped speaking naturally (not interrupted)
      isCurrentlySpeakingRef.current = false;

      if (pendingAiMessageRef.current.length > 0) {
        const combinedContent = pendingAiMessageRef.current.join(" ");
        const newMessage: Message = {
          role: "assistant",
          content: combinedContent,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };

        setMessages((prev) => {
          const newMessages = [...prev];

          // If we were updating an existing message, replace it
          if (lastAiMessageIndexRef.current >= 0) {
            newMessages[lastAiMessageIndexRef.current] = newMessage;
          } else {
            // Otherwise add as new message
            newMessages.push(newMessage);
            lastAiMessageIndexRef.current = newMessages.length - 1;
          }

          return newMessages;
        });

        // Save the AI message
        saveChatMessage(
          companionId,
          sessionId,
          "assistant",
          combinedContent
        ).catch(console.error);

        pendingAiMessageRef.current = [];
      }
    }
  }, [isSpeaking, companionId, sessionId]);

  // VAPI event handlers
  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      startTimer();
      // Reset message tracking
      pendingAiMessageRef.current = [];
      lastAiMessageIndexRef.current = -1;
      userInterruptedRef.current = false;
      isCurrentlySpeakingRef.current = false;
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      stopTimer();

      // Combine any remaining AI messages
      if (pendingAiMessageRef.current.length > 0) {
        const combinedContent = pendingAiMessageRef.current.join(" ");
        const newMessage: Message = {
          role: "assistant",
          content: combinedContent,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };
        setMessages((prev) => {
          const newMessages = [...prev];
          if (lastAiMessageIndexRef.current >= 0) {
            newMessages[lastAiMessageIndexRef.current] = newMessage;
          } else {
            newMessages.push(newMessage);
          }
          return newMessages;
        });

        // Save the AI message
        saveChatMessage(
          companionId,
          sessionId,
          "assistant",
          combinedContent
        ).catch(console.error);

        pendingAiMessageRef.current = [];
      }

      addToSessionHistory(companionId);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const messageContent = message.transcript || message.content || "";

        if (message.role === "user") {
          // User message - add immediately
          userInterruptedRef.current = true;

          const newMessage: Message = {
            role: "user",
            content: messageContent,
            type: message.type,
            transcriptType: message.transcriptType,
            transcript: message.transcript,
            id: crypto.randomUUID(),
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, newMessage]);

          // Save the user message
          saveChatMessage(companionId, sessionId, "user", messageContent).catch(
            console.error
          );

          // If AI was speaking, combine its messages now
          if (
            isCurrentlySpeakingRef.current &&
            pendingAiMessageRef.current.length > 0
          ) {
            const combinedAiContent = pendingAiMessageRef.current.join(" ");
            const aiMessage: Message = {
              role: "assistant",
              content: combinedAiContent,
              id: crypto.randomUUID(),
              timestamp: new Date(),
            };

            setMessages((prev) => {
              const newMessages = [...prev];
              // Insert AI message before the new user message
              newMessages.splice(newMessages.length - 1, 0, aiMessage);
              lastAiMessageIndexRef.current = newMessages.length - 2;
              return newMessages;
            });

            // Save the AI message
            saveChatMessage(
              companionId,
              sessionId,
              "assistant",
              combinedAiContent
            ).catch(console.error);

            pendingAiMessageRef.current = [];
            isCurrentlySpeakingRef.current = false;
          } else {
            lastAiMessageIndexRef.current = -1;
          }
        } else if (message.role === "assistant") {
          // AI message
          pendingAiMessageRef.current.push(messageContent);

          // If AI isn't currently speaking, add message immediately
          if (!isCurrentlySpeakingRef.current) {
            const newMessage: Message = {
              role: "assistant",
              content: messageContent,
              type: message.type,
              transcriptType: message.transcriptType,
              transcript: message.transcript,
              id: crypto.randomUUID(),
              timestamp: new Date(),
            };

            setMessages((prev) => {
              const newMessages = [...prev];
              newMessages.push(newMessage);
              lastAiMessageIndexRef.current = newMessages.length - 1;
              return newMessages;
            });

            // Save the AI message
            saveChatMessage(
              companionId,
              sessionId,
              "assistant",
              messageContent
            ).catch(console.error);

            pendingAiMessageRef.current = [];
          } else {
            // AI is speaking, update the last message with combined content
            const combinedContent = pendingAiMessageRef.current.join(" ");

            setMessages((prev) => {
              if (
                lastAiMessageIndexRef.current >= 0 &&
                lastAiMessageIndexRef.current < prev.length
              ) {
                const newMessages = [...prev];
                newMessages[lastAiMessageIndexRef.current] = {
                  ...newMessages[lastAiMessageIndexRef.current],
                  content: combinedContent,
                };
                return newMessages;
              }
              return prev;
            });
          }
        }
      }
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.error("VAPI Error:", error);
      setConnectionError(formatErrorMessage(error));
      setCallStatus(CallStatus.FAILED);
      stopTimer();
      toast.error("Connection error. Please try again.");
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("error", onError);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
    };
  }, [companionId, sessionId]);

  const startTimer = () => {
    stopTimer(); // Clear any existing timer
    setCallDuration(0);
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const toggleMicrophone = () => {
    const muted = vapi.isMuted();
    vapi.setMuted(!muted);
    setIsMuted(!muted);
  };

  const formatErrorMessage = (error: unknown): string => {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === "string" && error.trim()) return error;
    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown error";
    }
  };

  const handleCall = async () => {
    setConnectionError(null);
    // Don't clear messages when starting a call - keep previous conversation
    // Reset tracking refs for new session
    pendingAiMessageRef.current = [];
    lastAiMessageIndexRef.current = -1;
    userInterruptedRef.current = false;
    isCurrentlySpeakingRef.current = false;

    setCallStatus(CallStatus.CONNECTING);

    const assistantOverrides = {
      variableValues: { subject, topic, style },
      clientMessages: ["transcript"],
      serverMessages: [],
    };

    try {
      // @ts-expect-error - VAPI SDK typing issue
      vapi.start(configureAssistant(voice, style), assistantOverrides);
    } catch (error) {
      setConnectionError(formatErrorMessage(error));
      setCallStatus(CallStatus.FAILED);
      toast.error("Failed to start call");
    }
  };

  const handleDisconnect = () => {
    // Combine any pending AI messages before stopping
    if (pendingAiMessageRef.current.length > 0) {
      const combinedContent = pendingAiMessageRef.current.join(" ");
      const newMessage: Message = {
        role: "assistant",
        content: combinedContent,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      setMessages((prev) => {
        const newMessages = [...prev];
        if (lastAiMessageIndexRef.current >= 0) {
          newMessages[lastAiMessageIndexRef.current] = newMessage;
        } else {
          newMessages.push(newMessage);
        }
        return newMessages;
      });

      // Save the AI message
      saveChatMessage(
        companionId,
        sessionId,
        "assistant",
        combinedContent
      ).catch(console.error);

      pendingAiMessageRef.current = [];
    }

    vapi.stop();
    setCallStatus(CallStatus.FINISHED);
    stopTimer();
  };

  const copyConversation = () => {
    const text = messages
      .map(
        (msg) =>
          `${msg.role === "assistant" ? title : userName}: ${msg.content}`
      )
      .join("\n\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied to clipboard");
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      })
      .catch(() => toast.error("Copy failed"));
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

  const generatePdf = useCallback(
    (data: SummaryData) => {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text(`Conversation Summary with ${title}`, 15, 20);

      // Metadata
      doc.setFontSize(12);
      doc.text(`Subject: ${subject}`, 15, 35);
      doc.text(`Topic: ${topic}`, 15, 45);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 55);
      doc.text(`Duration: ${formatTime(callDuration)}`, 15, 65);

      let yPosition = 90;

      // Key points
      if (data.keyPoints && data.keyPoints.length > 0) {
        doc.setFontSize(14);
        doc.text("Key Points:", 15, 80);
        doc.setFontSize(12);

        data.keyPoints.forEach((point) => {
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
          const splitPoint = doc.splitTextToSize(`• ${point}`, 180);
          doc.text(splitPoint, 20, yPosition);
          yPosition += splitPoint.length * 7;
        });
      }

      // Summary
      if (data.summary) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(14);
        doc.text("Summary:", 15, yPosition + 10);
        doc.setFontSize(12);
        const splitSummary = doc.splitTextToSize(data.summary, 180);
        doc.text(splitSummary, 15, yPosition + 20);
      }

      doc.save(
        `Conversation-Summary-${title}-${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`
      );
    },
    [title, subject, topic, callDuration]
  );

  const handleSummarizeChat = async () => {
    if (messages.length === 0) {
      toast.error("Chat history is empty. Start a conversation first.");
      return;
    }

    setIsLoadingSummary(true);
    setSummaryData(null);

    const chatHistory = messages
      .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
      .join("\n\n");

    try {
      const summaryResponse = await summarizeChat({ chatHistory });
      const newSummaryData: SummaryData = {
        summary: summaryResponse.summary,
        keyPoints: summaryResponse.keyPoints,
      };
      setSummaryData(newSummaryData);
      generatePdf(newSummaryData);
      toast.success("Summary PDF generated and downloaded");
    } catch (error) {
      console.error("Summarization error:", error);
      toast.error("Failed to summarize chat. Please try again.");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const subjectColor = getSubjectColor(subject);
  const emojis = subjectEmojis[subject.toLowerCase()] || subjectEmojis.science;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card z-50">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
        >
          {isMobileSidebarOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
        <h2 className="text-lg font-bold text-foreground truncate max-w-[200px]">
          {title}
        </h2>
        <Link
          href="/"
          className="p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-5" />
        </Link>
      </div>

      {/* AI Profile Sidebar */}
      <aside
        className={cn(
          "w-full md:w-80 lg:w-96 border-r border-border bg-card flex flex-col",
          "fixed md:relative z-40 transition-transform duration-300 ease-out",
          isMobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
          "h-[calc(100vh-65px)] md:h-full top-[65px] md:top-0"
        )}
      >
        {/* Subject themed header */}
        <div
          className="relative p-6 lg:p-8 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${subjectColor}, ${subjectColor}dd)`,
          }}
        >
          {/* Floating emojis */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {emojis.map((emoji, i) => (
              <span
                key={i}
                className="absolute text-2xl opacity-20 animate-float"
                style={{
                  left: `${15 + i * 18}%`,
                  top: `${10 + (i % 3) * 25}%`,
                  animationDelay: `${i * 0.5}s`,
                }}
              >
                {emoji}
              </span>
            ))}
          </div>

          {/* Back button - desktop */}
          <Link
            href="/"
            className="hidden md:flex absolute top-4 left-4 items-center gap-1 text-white/80 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>

          {/* Avatar */}
          <div className="relative flex flex-col items-center">
            <div
              className={cn(
                "relative w-28 h-28 lg:w-36 lg:h-36 rounded-full flex items-center justify-center",
                "bg-white/20 backdrop-blur-sm transition-all duration-300",
                callStatus === CallStatus.ACTIVE && "ring-4 ring-white/50",
                isSpeaking && "ring-white animate-pulse-ring"
              )}
            >
              {callStatus === CallStatus.ACTIVE ? (
                <Lottie
                  lottieRef={lottieRef}
                  animationData={soundwaves}
                  autoplay={false}
                  loop={true}
                  className="w-full h-full"
                />
              ) : (
                <div className="text-white">
                  {subjectIcons[subject.toLowerCase()] || subjectIcons.science}
                </div>
              )}

              {/* Speaking indicator */}
              {callStatus === CallStatus.ACTIVE && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full transition-colors",
                      isSpeaking
                        ? "bg-green-500 animate-pulse"
                        : "bg-muted-foreground"
                    )}
                  />
                </div>
              )}
            </div>

            <h2 className="mt-4 text-xl lg:text-2xl font-bold text-white text-center">
              {title}
            </h2>
            <p className="mt-1 text-sm text-white/80 text-center max-w-[200px] truncate">
              {topic}
            </p>

            {/* Timer */}
            {callStatus === CallStatus.ACTIVE && (
              <div className="mt-3 flex items-center gap-2 text-white bg-white/20 px-4 py-2 rounded-full">
                <Clock className="size-4" />
                <span className="font-mono text-lg">
                  {formatTime(callDuration)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={
                callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall
              }
              className={cn(
                "flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200",
                "flex items-center justify-center gap-2 shadow-lg hover:shadow-xl",
                callStatus === CallStatus.ACTIVE
                  ? "bg-destructive hover:bg-destructive/90"
                  : callStatus === CallStatus.CONNECTING
                  ? "bg-primary/70 animate-pulse cursor-wait"
                  : "bg-primary hover:bg-primary/90"
              )}
              disabled={callStatus === CallStatus.CONNECTING}
            >
              {callStatus === CallStatus.ACTIVE ? (
                <>
                  <PhoneOff className="size-5" />
                  End Session
                </>
              ) : callStatus === CallStatus.CONNECTING ? (
                <>
                  <Sparkles className="size-5 animate-spin" />
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
              disabled={callStatus !== CallStatus.ACTIVE}
              className={cn(
                "p-3 rounded-xl transition-all duration-200 shadow-md",
                isMuted
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
                callStatus !== CallStatus.ACTIVE &&
                  "opacity-50 cursor-not-allowed"
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
        </div>

        {/* Status */}
        <div className="p-4 mt-auto border-t border-border">
          <div className="text-center text-sm text-muted-foreground">
            {callStatus === CallStatus.ACTIVE && (
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
            {callStatus === CallStatus.INACTIVE &&
              "Click Start Session to begin"}
            {callStatus === CallStatus.CONNECTING &&
              "Establishing connection..."}
            {callStatus === CallStatus.FINISHED &&
              `Session ended after ${formatTime(callDuration)}`}
            {callStatus === CallStatus.FAILED && (
              <div className="text-destructive">
                {connectionError || "Connection failed. Please try again."}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-65px)] md:h-full overflow-hidden">
        {/* Chat Header */}
        <header className="p-4 border-b border-border bg-card flex items-center justify-between gap-4 shrink-0">
          <h3 className="font-semibold text-foreground truncate">
            Conversation with {title}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {callStatus === CallStatus.ACTIVE && (
              <span className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                <Clock className="size-3" />
                {formatTime(callDuration)}
              </span>
            )}
            {messages.length > 0 && (
              <>
                <button
                  onClick={handleSummarizeChat}
                  disabled={isLoadingSummary}
                  className={cn(
                    "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors",
                    isLoadingSummary
                      ? "bg-muted text-muted-foreground cursor-wait"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  <FileText className="size-4" />
                  <span className="hidden sm:inline">
                    {isLoadingSummary ? "Summarizing..." : "Summarize"}
                  </span>
                </button>
                <button
                  onClick={copyConversation}
                  className={cn(
                    "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors",
                    copiedAll
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {copiedAll ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  <span className="hidden sm:inline">
                    {copiedAll ? "Copied!" : "Copy All"}
                  </span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background via-background to-muted/20">
          <div className="min-h-full px-4 py-6 lg:px-6">
            {/* Summary notification */}
            {summaryData && (
              <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-amber-800 dark:text-amber-200">
                    Summary Generated
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => generatePdf(summaryData)}
                      className="text-xs bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-200 px-3 py-1 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors"
                    >
                      Download Again
                    </button>
                    <button
                      onClick={() => setSummaryData(null)}
                      className="text-xs bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-200 px-3 py-1 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  The summary PDF has been downloaded automatically.
                </p>
              </div>
            )}

            {/* Loading state */}
            {isLoadingMessages ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Loading conversation...</p>
              </div>
            ) : messages.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${subjectColor}15` }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${subjectColor}30` }}
                  >
                    <MessageSquare
                      className="size-8"
                      style={{ color: subjectColor }}
                    />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Start your conversation with {title}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Discuss {topic} in {subject}. Click "Start Session" to begin
                  your interactive lesson with voice and text chat.
                </p>
                <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-primary">💡</span>
                    Tip: Speak naturally and {title} will respond with combined
                    messages until you interrupt.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {/* Previous conversation header */}
                {messages.length > 0 && !isLoadingMessages && (
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
                      <MessageSquare className="size-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Previous conversation loaded
                      </span>
                    </div>
                  </div>
                )}

                {messages.map((message) => {
                  const messageId = message.id;
                  const isAssistant = message.role === "assistant";

                  return (
                    <div
                      key={messageId}
                      className={cn(
                        "flex gap-3",
                        isAssistant ? "" : "flex-row-reverse"
                      )}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {isAssistant ? (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                            style={{ backgroundColor: `${subjectColor}20` }}
                          >
                            <Bot
                              className="size-5"
                              style={{ color: subjectColor }}
                            />
                          </div>
                        ) : userImage ? (
                          <div
                            className="w-10 h-10 rounded-full overflow-hidden border-2 shadow-sm"
                            style={{ borderColor: subjectColor }}
                          >
                            <Image
                              src={userImage || "/placeholder.svg"}
                              alt={userName}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm border"
                            style={{ borderColor: subjectColor }}
                          >
                            <User className="size-5 text-primary" />
                          </div>
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={cn(
                          "flex flex-col max-w-[70%] lg:max-w-[60%]",
                          isAssistant ? "items-start" : "items-end"
                        )}
                      >
                        {/* Sender Name */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={cn(
                              "text-xs font-medium",
                              isAssistant
                                ? "text-muted-foreground"
                                : "text-foreground"
                            )}
                          >
                            {isAssistant ? title : userName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatMessageTime(message.timestamp)}
                          </span>
                        </div>

                        {/* Message Content */}
                        <div
                          className={cn(
                            "relative rounded-2xl px-4 py-3 shadow-sm transition-all duration-200",
                            "group hover:shadow-md",
                            isAssistant
                              ? "bg-card border border-border text-foreground rounded-tl-none"
                              : "text-white rounded-tr-none"
                          )}
                          style={
                            !isAssistant
                              ? { backgroundColor: subjectColor }
                              : undefined
                          }
                        >
                          {/* Message Text */}
                          <div className="whitespace-pre-wrap text-sm lg:text-base leading-relaxed">
                            {message.content}
                          </div>

                          {/* Copy Button */}
                          <button
                            onClick={() =>
                              copyMessage(message.content, messageId)
                            }
                            className={cn(
                              "absolute -top-2 -right-2 p-1.5 rounded-lg border transition-all",
                              "shadow-md hover:scale-105 active:scale-95",
                              copiedMessageId === messageId
                                ? "bg-green-100 text-green-600 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800 opacity-100"
                                : "opacity-0 group-hover:opacity-100 bg-background border-border",
                              isAssistant
                                ? "hover:bg-card"
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
                    </div>
                  );
                })}

                {/* Typing indicator for AI when speaking */}
                {isSpeaking && pendingAiMessageRef.current.length === 0 && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${subjectColor}20` }}
                      >
                        <Bot
                          className="size-5"
                          style={{ color: subjectColor }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col max-w-[70%] lg:max-w-[60%]">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-medium text-muted-foreground">
                          {title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(new Date())}
                        </span>
                      </div>
                      <div className="bg-card border border-border rounded-2xl rounded-tl-none px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div
                              className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            />
                            <div
                              className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            />
                            <div
                              className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Listening...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Voice input indicator */}
        {callStatus === CallStatus.ACTIVE && (
          <div className="p-4 border-t border-border bg-card shrink-0">
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <div
                className={cn(
                  "p-3 rounded-full transition-all duration-200",
                  isMuted ? "bg-destructive/10" : "bg-primary/10",
                  isSpeaking && "scale-110"
                )}
              >
                {isMuted ? (
                  <MicOff className="size-5 text-destructive" />
                ) : (
                  <Mic className="size-5 text-primary animate-pulse" />
                )}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium">
                  {isMuted
                    ? "Microphone is muted"
                    : isSpeaking
                    ? `${title} is speaking...`
                    : "Listening for your voice"}
                </span>
                {!isMuted && !isSpeaking && (
                  <span className="text-xs text-muted-foreground mt-1">
                    Speak naturally to interact
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
}
