'use client';

import { useEffect, useRef, useState } from 'react';
import { cn, configureAssistant, getSubjectColor } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from '@/constants/soundwaves.json';
import { addToSessionHistory } from "@/lib/actions/companion.actions";

enum CallStatus {
  INACTIVE = 'INACTIVE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

const CompanionComponent = ({ companionId, subject, topic, title, userName, userImage, style, voice }: CompanionComponentProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Animation control
  useEffect(() => {
    if (lottieRef.current) {
      if (isSpeaking) {
        lottieRef.current.play();
      } else {
        lottieRef.current.stop();
      }
    }
  }, [isSpeaking]);

  // Event listeners
  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      addToSessionHistory(companionId);
    };
    const onMessage = (message: Message) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [newMessage, ...prev]);
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.error('Error', error);

    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('message', onMessage);
    vapi.on('error', onError);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);

    return () => {
      vapi.off('call-start', onCallStart);
      vapi.off('call-end', onCallEnd);
      vapi.off('message', onMessage);
      vapi.off('error', onError);
      vapi.off('speech-start', onSpeechStart);
      vapi.off('speech-end', onSpeechEnd);
    };
  }, [companionId]);

  const toggleMicrophone = () => {
    const muted = vapi.isMuted();
    vapi.setMuted(!muted);
    setIsMuted(!muted);
  };

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    const assistantOverrides = {
      variableValues: { subject, topic, style },
      clientMessages: ["transcript"],
      serverMessages: [],
    };
    // @ts-expect-error
    vapi.start(configureAssistant(voice, style), assistantOverrides);
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <section className="flex flex-col h-[80vh] max-w-6xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <Image 
            src={isExpanded ? "/icons/collapse.svg" : "/icons/expand.svg"} 
            alt={isExpanded ? "Collapse" : "Expand"} 
            width={24} 
            height={24} 
          />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-8 max-lg:flex-col">
        {/* Companion & User Section */}
        <div className="flex flex-col lg:flex-row gap-8 w-full lg:w-auto">
          {/* Companion Card */}
          <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md w-full lg:w-64">
            <div 
              className="relative w-40 h-40 rounded-full flex items-center justify-center mb-4 transition-all duration-300"
              style={{ 
                backgroundColor: getSubjectColor(subject),
                boxShadow: `0 0 20px ${getSubjectColor(subject)}${callStatus === CallStatus.ACTIVE ? '80' : '20'}`
              }}
            >
              <div className={cn(
                'absolute transition-all duration-500',
                callStatus === CallStatus.FINISHED || callStatus === CallStatus.INACTIVE 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-90',
                callStatus === CallStatus.CONNECTING && 'opacity-100 animate-pulse'
              )}>
                <Image 
                  src={`/icons/${subject}.svg`} 
                  alt={subject} 
                  width={100} 
                  height={100} 
                  className="drop-shadow-md"
                />
              </div>

              <div className={cn(
                'absolute transition-all duration-500',
                callStatus === CallStatus.ACTIVE 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-90'
              )}>
                <Lottie
                  lottieRef={lottieRef}
                  animationData={soundwaves}
                  autoplay={false}
                  loop={true}
                  className="w-40 h-40"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">{title}</h2>
            <p className="text-sm text-gray-500 text-center">{topic}</p>
          </div>

          {/* User Card */}
          <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md w-full lg:w-64">
            <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-primary/20">
              <Image 
                src={userImage} 
                alt={userName} 
                fill
                className="object-cover"
              />
            </div>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-4">{userName}</h2>
            
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={toggleMicrophone} 
                disabled={callStatus !== CallStatus.ACTIVE}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-lg transition-all",
                  callStatus !== CallStatus.ACTIVE 
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                    : isMuted 
                      ? "bg-red-100 text-red-600 hover:bg-red-200" 
                      : "bg-green-100 text-green-600 hover:bg-green-200"
                )}
              >
                <Image 
                  src={isMuted ? '/icons/mic-off.svg' : '/icons/mic-on.svg'} 
                  alt="mic" 
                  width={24} 
                  height={24} 
                />
                <span className="font-medium">
                  {isMuted ? 'Mic Off' : 'Mic On'}
                </span>
              </button>

              <button 
                onClick={callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall}
                className={cn(
                  "py-3 px-6 rounded-lg font-medium text-white transition-all",
                  callStatus === CallStatus.ACTIVE 
                    ? "bg-red-600 hover:bg-red-700 shadow-md" 
                    : callStatus === CallStatus.CONNECTING 
                      ? "bg-blue-400 animate-pulse" 
                      : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                )}
              >
                {callStatus === CallStatus.ACTIVE
                  ? "End Session"
                  : callStatus === CallStatus.CONNECTING
                    ? 'Connecting...'
                    : 'Start Session'
                }
              </button>
            </div>
          </div>
        </div>

        {/* Transcript Section */}
        <div className={cn(
          "flex-1 bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 h-[650px]",
          isExpanded ? "lg:col-span-2" : "lg:w-[500px]"
        )}>
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700">Conversation</h2>
          </div>
          
          <div className="h-[calc(100%-56px)] overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Image 
                  src="/icons/chat.svg" 
                  alt="No messages" 
                  width={80} 
                  height={80} 
                  className="opacity-50 mb-4"
                />
                <p className="text-lg">Your conversation will appear here</p>
                <p className="text-sm">Start the session to begin chatting</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "p-4 rounded-lg max-w-[80%]",
                      message.role === 'assistant'
                        ? "bg-blue-50 text-gray-800 mr-auto"
                        : "bg-primary-50 text-gray-800 ml-auto"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        message.role === 'assistant' ? "bg-blue-500" : "bg-primary"
                      )} />
                      <span className="font-semibold">
                        {message.role === 'assistant' 
                          ? title.split(' ')[0].replace(/[.,]/g, '') 
                          : userName}
                      </span>
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanionComponent;