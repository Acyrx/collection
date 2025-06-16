'use client';

import { useEffect, useRef, useState } from 'react';
import { cn, configureTutorAssistant, getSubjectColor } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from '@/constants/soundwaves.json';
import { addToSessionHistory } from "@/lib/actions/companion.actions";
import { toast } from 'sonner';
import { FaUser, FaRobot, FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaVolumeMute, FaBars, FaTimes, FaRedo } from 'react-icons/fa';
import { IoMdCopy, IoMdCheckmark } from 'react-icons/io';
import { BsChatDots } from 'react-icons/bs';
import { summarizeChat } from '@/ai/flows/summarize';
import { MdSummarize } from "react-icons/md";
import { jsPDF } from "jspdf";

enum CallStatus {
  INACTIVE = 'INACTIVE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED', // Added new status for failed connections
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
}

interface SummarizeChatOutput {
  summary: string;
  keyPoints?: string[];
}

interface CompanionComponentProps {
  companionId: string;
  subject: string;
  topic: string;
  title: string;
  userName: string;
  userImage?: string;
  style: string;
  voice: string;
  audience?: "child" | "adult";
  country: string;
}

const CompanionComponent = ({ 
  companionId, 
  subject, 
  topic, 
  title, 
  userName, 
  userImage, 
  style, 
  voice,
  audience = "adult",
  country 
}: CompanionComponentProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [combinedMessages, setCombinedMessages] = useState<{role: string, content: string}[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  // Close mobile sidebar when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [combinedMessages]);
  useEffect(() => isSpeaking ? lottieRef.current?.play() : lottieRef.current?.stop(), [isSpeaking]);

  useEffect(() => {
    const groupedMessages: {role: string, content: string}[] = [];
    let lastRole: string | null = null;
    let currentContent = '';

    [...messages].reverse().forEach((message) => {
      if (lastRole === message.role) {
        currentContent += '\n\n' + message.content;
      } else {
        if (lastRole !== null) groupedMessages.push({ role: lastRole, content: currentContent });
        lastRole = message.role;
        currentContent = message.content;
      }
    });

    if (lastRole !== null) groupedMessages.push({ role: lastRole, content: currentContent });
    setCombinedMessages(groupedMessages);
  }, [messages]);

  useEffect(() => {
    const handlers = {
      'call-start': () => {
        setCallStatus(CallStatus.ACTIVE);
        setConnectionError(null);
        startTimer();
      },
      'call-end': () => {
        setCallStatus(CallStatus.FINISHED);
        stopTimer();
        addToSessionHistory(companionId);
      },
      'message': (message: Message) => {
        if (message.type === 'transcript' && message.transcriptType === 'final') {
          setMessages(prev => [{ role: message.role, content: message.transcript || '' }, ...prev]);
        }
      },
      'speech-start': () => setIsSpeaking(true),
      'speech-end': () => setIsSpeaking(false),
      'error': (error: Error) => {
        console.error('VAPI Error:', error);
        setCallStatus(CallStatus.FAILED);
        stopTimer();
        setConnectionError(error.message || 'Connection failed. Please try again.');
        toast.error('Connection error: ' + error.message);
      }
    };

    Object.entries(handlers).forEach(([event, handler]) => vapi.on(event, handler as any));
    return () => Object.entries(handlers).forEach(([event, handler]) => vapi.off(event, handler as any));
  }, [companionId]);

  const startTimer = () => {
    setCallDuration(0);
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMicrophone = () => {
    const muted = vapi.isMuted();
    vapi.setMuted(!muted);
    setIsMuted(!muted);
  };

  const toggleSpeaker = () => {
    if (callStatus === CallStatus.ACTIVE) {
      const newMutedState = !isSpeakerMuted;
      vapi.setSpeakerEnabled(!newMutedState);
      setIsSpeakerMuted(newMutedState);
    }
  };

  const handleCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);
      setConnectionError(null);
      const assistantOverrides = {
        variableValues: { subject, topic, style },
        clientMessages: ["transcript"],
        serverMessages: [],
      };
      await vapi.start(configureTutorAssistant(voice, style, topic, subject, audience, country), assistantOverrides);
    } catch (error) {
      console.error('Failed to start call:', error);
      setCallStatus(CallStatus.FAILED);
      setConnectionError('Failed to connect. Please try again.');
      toast.error('Failed to start call. Please try again.');
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const copyConversation = () => {
    const text = combinedMessages
      .map(msg => `${msg.role === 'assistant' ? title : userName}: ${msg.content}`)
      .join('\n\n');
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Copied to clipboard');
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      })
      .catch(() => toast.error('Copy failed'));
  };

  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        toast.success('Message copied');
        setCopiedMessageId(id);
        setTimeout(() => setCopiedMessageId(null), 2000);
      })
      .catch(() => toast.error('Copy failed'));
  };

  const generatePdf = (summaryData: SummaryData) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Conversation Summary with ${title}`, 15, 20);
    
    // Add metadata
    doc.setFontSize(12);
    doc.text(`Subject: ${subject}`, 15, 35);
    doc.text(`Topic: ${topic}`, 15, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 55);
    doc.text(`Duration: ${formatTime(callDuration)}`, 15, 65);
    
    // Add key points if available
    let yPosition = 90;
    if (summaryData.keyPoints && summaryData.keyPoints.length > 0) {
      doc.setFontSize(14);
      doc.text('Key Points:', 15, 80);
      doc.setFontSize(12);
      
      summaryData.keyPoints.forEach((point, index) => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`• ${point}`, 20, yPosition);
        yPosition += 10;
      });
    }
    
    // Add summary
    if (summaryData.summary) {
      const splitSummary = doc.splitTextToSize(summaryData.summary, 180);
      
      doc.setFontSize(14);
      doc.text('Summary:', 15, yPosition + 10);
      doc.setFontSize(12);
      doc.text(splitSummary, 15, yPosition + 20);
    }
    
    // Save the PDF
    doc.save(`Conversation-Summary-${title}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleSummarizeChat = async () => {
    if (messages.length === 0) {
      toast.error("Chat history is empty. Send some messages first.");
      return;
    }

    setIsLoadingSummary(true);
    setSummaryData(null);

    const chatHistory = messages.map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`).join('\n\n');

    try {
      const summaryResponse = await summarizeChat({ chatHistory });
      const newSummaryData = {
        summary: summaryResponse.summary,
        keyPoints: summaryResponse.keyPoints
      };
      setSummaryData(newSummaryData);
      
      // Generate and download PDF
      generatePdf(newSummaryData);
      
      toast.success("Summary PDF generated and downloaded");
    } catch (error) {
      console.error("Error summarizing chat:", error);
      toast.error("Failed to summarize chat. Please try again.");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 z-100">
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
        >
          {isMobileSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <div className="w-8"></div> {/* Spacer for alignment */}
      </div>

      {/* AI Profile Sidebar */}
      <div className={cn(
        "w-full md:w-80 border-r border-gray-200 bg-gray-50 flex flex-col absolute md:relative z-10 transition-transform duration-300 ease-in-out",
        isMobileSidebarOpen ? "translate-x-0 mt-16" : "-translate-x-full md:translate-x-0",
        "h-[calc(100vh-64px)] md:h-full" // Adjust height for mobile
      )}>
        <div className="p-4 md:p-6 flex flex-col items-center">
          
          <div className="relative mb-4">
            <div 
              className={cn(
                "w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all",
                callStatus === CallStatus.ACTIVE && "ring-4",
                isSpeaking ? "ring-blue-400" : "ring-transparent"
              )}
              style={{ backgroundColor: getSubjectColor(subject) }}
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
                <Image 
                  src={`/icons/${subject}.svg`} 
                  alt={subject} 
                  width={48} 
                  height={48} 
                  className="filter brightness-0 invert"
                />
              )}
            </div>
            {callStatus === CallStatus.ACTIVE && (
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
                {isSpeaking ? (
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full animate-pulse"></div>
                ) : (
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-400 rounded-full"></div>
                )}
              </div>
            )}
          </div>

          <h2 className="text-lg md:text-xl font-bold text-gray-800">{title}</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">{topic}</p>
          
          {callStatus === CallStatus.ACTIVE && (
            <div className="mt-2 text-base md:text-lg font-medium text-gray-700">
              {formatTime(callDuration)}
            </div>
          )}
          
          {connectionError && (
            <div className="mt-3 p-2 bg-red-100 text-red-700 rounded text-xs md:text-sm text-center">
              {connectionError}
            </div>
          )}
          
          <div className="flex items-center justify-center gap-2 mt-4 md:mt-6 w-full">      
            <button
              onClick={callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall}
              className={cn(
                "flex-1 py-2 md:py-3 rounded-lg font-medium text-white transition-colors text-sm md:text-base",
                callStatus === CallStatus.ACTIVE 
                  ? "bg-red-500 hover:bg-red-600" 
                  : callStatus === CallStatus.CONNECTING 
                    ? "bg-blue-400 animate-pulse" 
                    : callStatus === CallStatus.FAILED
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-blue-500 hover:bg-blue-600"
              )}
            >
              {callStatus === CallStatus.ACTIVE
                ? "End"
                : callStatus === CallStatus.CONNECTING
                  ? 'Connecting...'
                  : callStatus === CallStatus.FAILED
                    ? <div className="flex items-center justify-center gap-2">
                        <FaRedo size={14} />
                        Try Again
                      </div>
                    : 'Start'
              }
            </button>
            
            <button 
              onClick={toggleMicrophone}
              className={cn(
                "p-2 md:p-3 rounded-full transition-colors",
                isMuted ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600",
                callStatus !== CallStatus.ACTIVE && "opacity-50 cursor-not-allowed"
              )}
              disabled={callStatus !== CallStatus.ACTIVE}
              title={isMuted ? "Unmute microphone" : "Mute microphone"}
            >
              {isMuted ? <FaMicrophoneSlash size={16} /> : <FaMicrophone size={16} />}
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 mt-auto">
          <div className="text-center text-xs md:text-sm text-gray-500">
            {callStatus === CallStatus.ACTIVE && (
              <div className="flex items-center justify-center gap-2">
                <span className={cn(
                  "inline-block w-2 h-2 rounded-full",
                  isSpeaking ? "bg-green-500 animate-pulse" : "bg-gray-400"
                )}></span>
                {isSpeaking ? `${title} is speaking...` : "Ready for your message"}
              </div>
            )}
            {callStatus === CallStatus.INACTIVE && "Session not started"}
            {callStatus === CallStatus.CONNECTING && "Connecting..."}
            {callStatus === CallStatus.FINISHED && `Session ended after ${formatTime(callDuration)}`}
            {callStatus === CallStatus.FAILED && "Connection failed. Please try again."}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-full">
        <div className="p-3 md:p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 text-sm md:text-base">Conversation with {title}</h3>
          <div className="flex items-center gap-2 md:gap-4">
            {callStatus === CallStatus.ACTIVE && (
              <div className="text-xs md:text-sm text-gray-500">
                {formatTime(callDuration)}
              </div>
            )}
            <div className="flex gap-1 md:gap-2">
              {combinedMessages.length > 0 && (
                <>
                  <button 
                    onClick={handleSummarizeChat}
                    disabled={isLoadingSummary}
                    className={cn(
                      "flex items-center gap-1 text-xs md:text-sm p-1 md:p-2 rounded-md transition-colors",
                      isLoadingSummary ? "bg-gray-100 text-gray-500" : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                    )}
                  >
                    <MdSummarize size={14} className="md:size-4" />
                    <span className="hidden md:inline">{isLoadingSummary ? 'Summarizing...' : 'Summarize'}</span>
                  </button>
                  <button 
                    onClick={copyConversation}
                    className={cn(
                      "flex items-center gap-1 text-xs md:text-sm p-1 md:p-2 rounded-md transition-colors",
                      copiedAll ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    )}
                  >
                    {copiedAll ? <IoMdCheckmark size={14} className="md:size-4" /> : <IoMdCopy size={14} className="md:size-4" />}
                    <span className="hidden md:inline">{copiedAll ? 'Copied!' : 'Copy All'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 md:p-4 bg-white">
          {summaryData ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
              <div className="flex justify-between items-center mb-1 md:mb-2">
                <h4 className="font-medium text-yellow-800 text-sm md:text-base">Summary Generated</h4>
                <div className="flex gap-1 md:gap-2">
                  <button
                    onClick={() => generatePdf(summaryData)}
                    className="text-xs md:text-sm bg-yellow-100 text-yellow-700 px-2 py-1 md:px-3 md:py-1 rounded hover:bg-yellow-200"
                  >
                    Download Again
                  </button>
                  <button 
                    onClick={() => setSummaryData(null)}
                    className="text-xs md:text-sm bg-yellow-100 text-yellow-700 px-2 py-1 md:px-3 md:py-1 rounded hover:bg-yellow-200"
                  >
                    Close
                  </button>
                </div>
              </div>
              <p className="text-xs md:text-sm text-yellow-800">The summary PDF has been downloaded automatically.</p>
            </div>
          ) : null}

          {combinedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <BsChatDots size={32} className="md:size-12 opacity-50 mb-3 md:mb-4" />
              <p className="text-sm md:text-lg">Start chatting with {title}</p>
              <p className="text-xs md:text-sm mt-1">Your messages will appear here</p>
              {callStatus === CallStatus.FAILED && (
                <button 
                  onClick={handleCall}
                  className="mt-4 flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                >
                  <FaRedo size={14} />
                  Try Connecting Again
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2 md:space-y-4">
              {combinedMessages.map((message, index) => {
                const messageId = `${index}-${message.content.substring(0, 10)}`;
                return (
                  <div 
                    key={messageId} 
                    className={cn(
                      "flex",
                      message.role === 'assistant' ? "justify-start" : "justify-end"
                    )}
                  >
                    <div 
                      className={cn(
                        "max-w-[90%] md:max-w-[80%] rounded-xl md:rounded-2xl p-3 md:p-4 relative group",
                        message.role === 'assistant'
                          ? "bg-gray-100 text-gray-800 rounded-tl-none"
                          : "bg-blue-500 text-white rounded-tr-none"
                      )}
                    >
                      <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                        {message.role === 'assistant' ? (
                          <FaRobot className="text-blue-500 size-3 md:size-4" />
                        ) : (
                          userImage ? (
                            <div className="w-4 h-4 md:w-6 md:h-6 rounded-full overflow-hidden">
                              <Image 
                                src={userImage} 
                                alt={userName} 
                                width={24} 
                                height={24} 
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <FaUser className="text-blue-200 size-3 md:size-4" />
                          )
                        )}
                        <span className="text-xs md:text-sm font-medium">
                          {message.role === 'assistant' ? title : userName}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm md:text-base">{message.content}</p>
                      <button 
                        onClick={() => copyMessage(message.content, messageId)}
                        className={cn(
                          "absolute top-1 right-1 md:top-2 md:right-2 p-1 rounded transition-all",
                          copiedMessageId === messageId 
                            ? "bg-green-100 text-green-600 opacity-100"
                            : "opacity-0 group-hover:opacity-100 bg-gray-200 text-gray-600 hover:bg-gray-300"
                        )}
                        title={copiedMessageId === messageId ? "Copied!" : "Copy message"}
                      >
                        {copiedMessageId === messageId ? <IoMdCheckmark size={12} className="md:size-4" /> : <IoMdCopy size={12} className="md:size-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanionComponent;