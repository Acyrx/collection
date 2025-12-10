"use client";
import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  PlayCircle,
  Star,
  Sparkles,
  Share2,
  Map,
  MessageCircle,
  Send,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Zap,
  HelpCircle,
  Image as ImageIcon,
  Lightbulb,
  Maximize2,
} from "lucide-react";
import { Course, Module, Lesson, ChatMessage } from "@/types/course";
import { Button } from "./Button";
import { DIFFICULTY_COLORS } from "@/constants";
import {
  generateLessonContent,
  askAiTutor,
  generateConceptImage,
} from "@/utils/services/geminiService";
import { updateCourseLesson } from "@/utils/services/courseRespitory";

interface CourseViewerProps {
  course: Course;
  onBack: () => void;
  isNewGeneration?: boolean;
}

type Tab = "content" | "mindmap";

interface SelectionState {
  text: string;
  x: number;
  y: number;
  show: boolean;
}

export const CourseViewer: React.FC<CourseViewerProps> = ({
  course,
  onBack,
  isNewGeneration,
}) => {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("content");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Lesson Content State
  const [currentLessonContent, setCurrentLessonContent] = useState<
    string | null
  >(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatThinking, setIsChatThinking] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Selection State for Floating Toolbar
  const [selection, setSelection] = useState<SelectionState>({
    text: "",
    x: 0,
    y: 0,
    show: false,
  });
  const contentRef = useRef<HTMLDivElement>(null);

  // Image Modal State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const activeModule = course.modules[activeModuleIndex];
  const activeLesson = activeModule?.lessons[activeLessonIndex];

  // Load Content Logic
  useEffect(() => {
    if (!activeLesson) return;

    if (activeLesson.content) {
      setCurrentLessonContent(activeLesson.content);
    } else {
      // Generate Content on the fly
      setIsGeneratingContent(true);
      setCurrentLessonContent(null);

      generateLessonContent(
        course.title,
        activeModule.title,
        activeLesson.title,
        course.difficulty
      )
        .then((content) => {
          activeLesson.content = content; // Cache locally
          updateCourseLesson(
            course.id,
            activeModule.id,
            activeLesson.id,
            content
          ); // Update DB
          setCurrentLessonContent(content);
        })
        .finally(() => setIsGeneratingContent(false));
    }

    // Reset Chat for new lesson
    setChatMessages([
      {
        role: "model",
        text: `Hi! I'm your AI tutor for this lesson on "${activeLesson.title}". \n\n**Pro Tip:** Select any text in the lesson to get instant explanations, examples, or visualizations!`,
      },
    ]);
  }, [activeLesson, activeModule, course]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatOpen, isChatThinking]);

  // Handle Text Selection
  useEffect(() => {
    const handleSelection = () => {
      const selectionObj = window.getSelection();
      if (
        !selectionObj ||
        selectionObj.isCollapsed ||
        !contentRef.current?.contains(selectionObj.anchorNode)
      ) {
        setSelection((prev) => (prev.show ? { ...prev, show: false } : prev));
        return;
      }

      const text = selectionObj.toString().trim();
      if (text.length > 0) {
        const range = selectionObj.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Calculate position relative to viewport, but we will render fixed
        // Position above the selection
        setSelection({
          text,
          x: rect.left + rect.width / 2,
          y: rect.top - 10, // 10px above
          show: true,
        });
      }
    };

    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, []);

  const handleSendMessage = async (customMessage?: string) => {
    const userMsg = customMessage || chatInput;
    if (!userMsg.trim()) return;

    setChatInput("");
    setChatMessages((prev) => [
      ...prev,
      { role: "user", text: userMsg, type: "text" },
    ]);
    setIsChatThinking(true);
    if (!chatOpen) setChatOpen(true);

    const history = chatMessages
      .filter((m) => m.type !== "image") // Filter out images for history context for now
      .map((m) => ({ role: m.role, parts: [{ text: m.text || "" }] }));

    const response = await askAiTutor(
      currentLessonContent || "",
      userMsg,
      history
    );

    setChatMessages((prev) => [
      ...prev,
      { role: "model", text: response, type: "text" },
    ]);
    setIsChatThinking(false);
  };

  const handleSelectionAction = async (
    action: "explain" | "example" | "visualize"
  ) => {
    // Hide toolbar immediately
    const textToProcess = selection.text;
    setSelection((prev) => ({ ...prev, show: false }));
    // Clear selection
    window.getSelection()?.removeAllRanges();

    if (!chatOpen) setChatOpen(true);

    if (action === "visualize") {
      setChatMessages((prev) => [
        ...prev,
        { role: "user", text: `Visualize: "${textToProcess}"`, type: "text" },
      ]);
      setIsChatThinking(true);
      const base64Image = await generateConceptImage(textToProcess);
      setIsChatThinking(false);

      if (base64Image) {
        setChatMessages((prev) => [
          ...prev,
          { role: "model", image: base64Image, type: "image" },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: "Sorry, I couldn't generate an image for that specific concept.",
            type: "text",
          },
        ]);
      }
    } else {
      let prompt = "";
      if (action === "explain")
        prompt = `Can you explain this concept simply: "${textToProcess}"?`;
      if (action === "example")
        prompt = `Give me a real-world example of: "${textToProcess}".`;

      handleSendMessage(prompt);
    }
  };

  const handleNextLesson = () => {
    if (activeLessonIndex < activeModule.lessons.length - 1) {
      setActiveLessonIndex((prev) => prev + 1);
    } else if (activeModuleIndex < course.modules.length - 1) {
      setActiveModuleIndex((prev) => prev + 1);
      setActiveLessonIndex(0);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden relative">
      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Magnified View"
            className="max-w-full max-h-full object-contain rounded-md shadow-2xl cursor-zoom-out"
            onClick={(e) => e.stopPropagation()} // Allow clicking image without closing? No, standard lightbox closes on background. Let's keep specific close logic if needed, but simple is better.
          />
          <div className="absolute bottom-6 left-0 right-0 text-center text-white/80 pointer-events-none">
            Click anywhere to close
          </div>
        </div>
      )}

      {/* Floating Toolbar */}
      {selection.show && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full bg-slate-900 text-white rounded-lg shadow-xl flex items-center p-1 gap-1 animate-in fade-in zoom-in-95 duration-200"
          style={{ left: selection.x, top: selection.y }}
        >
          <button
            onClick={() => handleSelectionAction("explain")}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-700 rounded-md text-sm font-medium transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" /> Explain
          </button>
          <div className="w-px h-4 bg-slate-700"></div>
          <button
            onClick={() => handleSelectionAction("example")}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-700 rounded-md text-sm font-medium transition-colors"
          >
            <Lightbulb className="w-4 h-4 text-amber-400" /> Example
          </button>
          <div className="w-px h-4 bg-slate-700"></div>
          <button
            onClick={() => handleSelectionAction("visualize")}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-700 rounded-md text-sm font-medium transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-pink-400" /> Visualize
          </button>

          {/* Pointer Arrow */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900"></div>
        </div>
      )}

      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <h1 className="font-bold text-slate-900 text-lg truncate max-w-md">
              {course.title}
            </h1>
            <p className="text-xs text-slate-500">
              {course.modules.length} Modules • {course.totalDurationHours}{" "}
              Hours
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
            <button
              onClick={() => setActiveTab("content")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === "content"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-1.5" />
              Lesson
            </button>
            <button
              onClick={() => setActiveTab("mindmap")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === "mindmap"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Map className="w-4 h-4 inline mr-1.5" />
              Roadmap
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setChatOpen(!chatOpen)}
            variant={chatOpen ? "primary" : "outline"}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            AI Tutor
          </Button>

          <button
            className="sm:hidden p-2"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden lg:block w-80 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Course Syllabus
            </h3>
          </div>
          <CourseSidebar
            course={course}
            activeIndex={activeModuleIndex}
            activeLessonIndex={activeLessonIndex}
            onSelect={(m, l) => {
              setActiveModuleIndex(m);
              setActiveLessonIndex(l);
              setActiveTab("content");
            }}
          />
        </aside>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="absolute inset-0 bg-white z-50 overflow-y-auto lg:hidden">
            <div className="p-4">
              <CourseSidebar
                course={course}
                activeIndex={activeModuleIndex}
                activeLessonIndex={activeLessonIndex}
                onSelect={(m, l) => {
                  setActiveModuleIndex(m);
                  setActiveLessonIndex(l);
                  setShowMobileMenu(false);
                  setActiveTab("content");
                }}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main
          className="flex-1 overflow-y-auto scroll-smooth"
          id="scroll-container"
        >
          {activeTab === "content" ? (
            <div
              className="max-w-4xl mx-auto px-6 py-8 sm:px-8 lg:px-12"
              ref={contentRef}
            >
              {/* Breadcrumbs */}
              <nav className="flex items-center text-sm text-slate-500 mb-6">
                <span>Module {activeModuleIndex + 1}</span>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="font-medium text-slate-900">
                  {activeLesson?.title}
                </span>
              </nav>

              {isGeneratingContent ? (
                <div className="space-y-8 animate-pulse">
                  <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  </div>
                  <div className="h-64 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-indigo-400 animate-spin" />
                      <p>AI Professor is writing your custom lesson...</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="prose prose-slate prose-lg max-w-none selection:bg-indigo-100 selection:text-indigo-900">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                      {activeLesson?.title}
                    </h1>
                    <div className="flex gap-2 mb-8 not-prose">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        <Clock className="w-3 h-3 mr-1" />{" "}
                        {activeLesson?.estimatedMinutes} min read
                      </span>
                      {activeLesson?.keyTakeaways.slice(0, 2).map((t, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {currentLessonContent || ""}
                    </ReactMarkdown>
                  </div>

                  <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center">
                    <button
                      onClick={() => {
                        if (activeLessonIndex > 0)
                          setActiveLessonIndex((i) => i - 1);
                      }}
                      disabled={
                        activeModuleIndex === 0 && activeLessonIndex === 0
                      }
                      className="flex items-center text-slate-500 hover:text-indigo-600 disabled:opacity-50"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                    </button>
                    <Button onClick={handleNextLesson}>
                      Next Lesson{" "}
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <MindMap
              course={course}
              onNodeClick={(m, l) => {
                setActiveModuleIndex(m);
                setActiveLessonIndex(l);
                setActiveTab("content");
              }}
            />
          )}
        </main>

        {/* AI Tutor Panel (Right Sidebar) */}
        {chatOpen && (
          <div className="w-full sm:w-96 bg-white border-l border-slate-200 flex flex-col shadow-2xl absolute inset-y-0 right-0 z-30 sm:relative transform transition-transform">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                <span className="font-semibold">AI Tutor</span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="hover:bg-indigo-700 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"
              ref={chatScrollRef}
            >
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl overflow-hidden shadow-sm border border-slate-200 ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-none border-transparent"
                        : "bg-white text-slate-700 rounded-bl-none"
                    }`}
                  >
                    {msg.type === "image" && msg.image ? (
                      <div
                        className="p-2 cursor-zoom-in relative group"
                        onClick={() => setSelectedImage(msg.image!)}
                      >
                        <img
                          src={msg.image}
                          alt="AI Generated"
                          className="rounded-lg w-full h-auto transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Maximize2 className="w-8 h-8 text-white drop-shadow-md" />
                        </div>
                        <div className="px-1 py-1 text-xs text-slate-500 flex items-center justify-between mt-1">
                          <span>AI Generated Visualization</span>
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">
                            Click to zoom
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm">
                        <ReactMarkdown
                          children={msg.text || ""}
                          // className="prose prose-sm max-w-none dark:prose-invert"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isChatThinking && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-200 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  "Explain this simply",
                  "Give me a quiz",
                  "Show an example",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setChatInput(suggestion);
                    }}
                    className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-indigo-50 text-indigo-700 text-xs rounded-full border border-slate-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask about this lesson..."
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!chatInput.trim() || isChatThinking}
                  className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CourseSidebar: React.FC<{
  course: Course;
  activeIndex: number;
  activeLessonIndex: number;
  onSelect: (m: number, l: number) => void;
}> = ({ course, activeIndex, activeLessonIndex, onSelect }) => {
  return (
    <div className="divide-y divide-slate-100">
      {course.modules.map((module, mIdx) => (
        <div key={mIdx} className="bg-white">
          <div className="px-4 py-3 bg-slate-50/50 flex items-center justify-between">
            <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wide truncate max-w-[200px]">
              Module {mIdx + 1}
            </h4>
          </div>
          <div>
            {module.lessons.map((lesson, lIdx) => {
              const isActive =
                mIdx === activeIndex && lIdx === activeLessonIndex;
              const isCompleted =
                mIdx < activeIndex ||
                (mIdx === activeIndex && lIdx < activeLessonIndex);

              return (
                <button
                  key={lIdx}
                  onClick={() => onSelect(mIdx, lIdx)}
                  className={`w-full text-left px-4 py-3 text-sm flex items-start gap-3 transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="mt-0.5">
                    {isActive ? (
                      <PlayCircle className="w-4 h-4 text-indigo-600 fill-current opacity-20" />
                    ) : isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`font-medium ${
                        isActive ? "text-indigo-900" : "text-slate-700"
                      }`}
                    >
                      {lesson.title}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {lesson.estimatedMinutes} min
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// Visual Mind Map Component
const MindMap: React.FC<{
  course: Course;
  onNodeClick: (m: number, l: number) => void;
}> = ({ course, onNodeClick }) => {
  return (
    <div className="p-8 sm:p-12 min-h-full bg-slate-50 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Course Roadmap
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Your personalized learning journey for{" "}
            <span className="text-indigo-600 font-semibold">
              {course.title}
            </span>
            . Follow the path from foundation to mastery.
          </p>
        </div>

        <div className="relative">
          {/* Central Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-200 transform -translate-x-1/2 rounded-full hidden md:block"></div>

          <div className="space-y-12">
            {course.modules.map((module, mIdx) => (
              <div
                key={mIdx}
                className={`relative flex flex-col md:flex-row items-center ${
                  mIdx % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-1/2 w-8 h-8 bg-indigo-600 rounded-full border-4 border-slate-50 z-10 transform -translate-x-1/2 flex items-center justify-center text-white text-xs font-bold hidden md:flex">
                  {mIdx + 1}
                </div>

                {/* Content Side */}
                <div className="w-full md:w-1/2 p-4">
                  <div
                    className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative group ${
                      mIdx % 2 === 0 ? "md:text-left" : "md:text-right"
                    }`}
                  >
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {module.title}
                    </h3>
                    <p className="text-slate-500 text-sm mb-4">
                      {module.description}
                    </p>

                    <div
                      className={`flex flex-col gap-2 ${
                        mIdx % 2 === 0 ? "items-start" : "items-end"
                      }`}
                    >
                      {module.lessons.map((lesson, lIdx) => (
                        <button
                          key={lIdx}
                          onClick={() => onNodeClick(mIdx, lIdx)}
                          className="text-sm px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-left"
                        >
                          {lesson.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Empty Side for Balance */}
                <div className="w-full md:w-1/2 hidden md:block"></div>
              </div>
            ))}
          </div>

          {/* Start/End Markers */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-4 hidden md:block">
            <div className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold border border-green-200">
              START
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-4 hidden md:block">
            <div className="px-4 py-1 bg-indigo-900 text-white rounded-full text-sm font-bold flex items-center shadow-lg">
              <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />{" "}
              MASTERY
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
