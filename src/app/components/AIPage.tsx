import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, Bot, User, Sparkles, Trash2, Copy, Check, Upload,
  BookOpen, HelpCircle, Code, Brain, CalendarDays, FileText,
  RefreshCw, ChevronRight, ChevronLeft, X, Maximize2, Minimize2,
  Lightbulb, PenLine, ClipboardList, RotateCw, MessageSquarePlus,
  Wifi, WifiOff
} from "lucide-react";
import { dispatchAI, AIServiceError } from "../services/aiApiService";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  tool?: string;
}

interface Flashcard {
  q: string;
  a: string;
}

type ToolId =
  | "explain"
  | "summarize"
  | "quiz"
  | "flashcard"
  | "planner"
  | "assignment"
  | "coding"
  | "document"
  | "chat";

// ─── AI SERVICE DISPATCHER ────────────────────────────────────────────────────
// Calls the real backend (POST /api/ai/*) via aiApiService.
// NO fallback — if the backend fails, an error is returned to the user.

async function callAIService(
  prompt: string,
  tool: ToolId,
  conversationId?: string
): Promise<{ content: string; conversationId: string }> {
  const toolMap: Record<ToolId, import("../services/aiApiService").AITool> = {
    explain:    "explain",
    summarize:  "summarize",
    quiz:       "quiz",
    flashcard:  "flashcards",
    planner:    "study-plan",
    assignment: "chat",
    coding:     "code-help",
    document:   "chat",
    chat:       "chat",
  };

  try {
    const response = await dispatchAI(toolMap[tool], {
      message: prompt,
      conversationId,
    });
    return { content: response.content, conversationId: response.conversationId };
  } catch (err: any) {
    if (err instanceof AIServiceError && err.isRateLimited) {
      throw err;
    }
    if (err instanceof AIServiceError && err.isUnauthorized) {
      return {
        content: `Session expired. Please login again.`,
        conversationId: conversationId || `error-${Date.now()}`,
      };
    }
    console.error("[AIPage] Backend request failed:", err);
    return {
      content: `Unable to contact AI service.`,
      conversationId: conversationId || `error-${Date.now()}`,
    };
  }
}

// ─── FLASHCARD VIEWER COMPONENT ───────────────────────────────────────────────

function FlashcardViewer({ content }: { content: string }) {
  const regex = /Q(\d+): (.+?)\nA\1: (.+?)(?=\nQ\d+:|$)/gs;
  const cards: Flashcard[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    cards.push({ q: match[2].trim(), a: match[3].trim() });
  }

  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
        Interactive Flashcards — Card {current + 1} of {cards.length}
      </div>

      {/* Card */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="relative w-full min-h-[120px] cursor-pointer select-none rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 hover:from-indigo-600/10 hover:to-purple-600/10 transition-all p-5 flex flex-col justify-between"
        title="Click to flip"
      >
        <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          {flipped ? "Answer" : "Question"}
        </div>
        <p className="text-sm font-semibold text-foreground mt-2 leading-relaxed">
          {flipped ? cards[current].a : cards[current].q}
        </p>
        <div className="text-[9px] text-muted-foreground mt-2 flex items-center gap-1">
          <RotateCw size={9} /> Click to flip
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { setCurrent(Math.max(0, current - 1)); setFlipped(false); }}
          disabled={current === 0}
          className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors border border-border rounded-lg px-3 py-1"
        >
          <ChevronLeft size={12} /> Prev
        </button>
        <div className="flex gap-1">
          {cards.map((_, i) => (
            <div
              key={i}
              onClick={() => { setCurrent(i); setFlipped(false); }}
              className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-colors ${i === current ? "bg-indigo-500" : "bg-border"}`}
            />
          ))}
        </div>
        <button
          onClick={() => { setCurrent(Math.min(cards.length - 1, current + 1)); setFlipped(false); }}
          disabled={current === cards.length - 1}
          className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors border border-border rounded-lg px-3 py-1"
        >
          Next <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── MARKDOWN RENDERER ────────────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  // Bold + italic + code inline
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`(.+?)`|\*(.+?)\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2]) parts.push(<strong key={m.index} className="font-bold text-foreground">{m[2]}</strong>);
    else if (m[3]) parts.push(<code key={m.index} className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono text-indigo-400">{m[3]}</code>);
    else if (m[4]) parts.push(<em key={m.index} className="italic text-muted-foreground">{m[4]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function MarkdownBlock({ text, isUser }: { text: string; isUser: boolean }) {
  const baseText = isUser ? "text-white" : "text-foreground";
  const mutedText = isUser ? "text-indigo-100" : "text-muted-foreground";

  // Split out code blocks first
  const codeRegex = /```(\w*)\n?([\s\S]*?)```/g;
  const flashRegex = /```flashcards\n([\s\S]*?)```/g;

  // Extract flashcard blocks
  const fcMatch = flashRegex.exec(text);
  const flashcardContent = fcMatch ? fcMatch[1] : null;
  if (flashcardContent) {
    const before = text.slice(0, (fcMatch as RegExpExecArray).index);
    const after = text.slice((fcMatch as RegExpExecArray).index + (fcMatch as RegExpExecArray)[0].length);
    return (
      <div>
        <MarkdownBlock text={before} isUser={isUser} />
        <FlashcardViewer content={flashcardContent} />
        <MarkdownBlock text={after} isUser={isUser} />
      </div>
    );
  }

  const segments: React.ReactNode[] = [];
  let lastIdx = 0;
  codeRegex.lastIndex = 0;
  let cm: RegExpExecArray | null;

  while ((cm = codeRegex.exec(text)) !== null) {
    if (cm.index > lastIdx) {
      segments.push(<TextLines key={lastIdx} text={text.slice(lastIdx, cm.index)} isUser={isUser} baseText={baseText} mutedText={mutedText} />);
    }
    const lang = cm[1] || "code";
    const code = cm[2];
    segments.push(
      <div key={cm.index} className="my-3 rounded-xl overflow-hidden border border-border text-[11px]">
        <div className="bg-slate-800 px-4 py-1.5 flex justify-between items-center select-none">
          <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">{lang}</span>
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="text-slate-400 hover:text-white text-[9px] font-bold transition-colors"
          >
            Copy
          </button>
        </div>
        <pre className="bg-slate-950 p-4 overflow-x-auto text-slate-300 font-mono text-[11px] leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    );
    lastIdx = codeRegex.lastIndex;
  }
  if (lastIdx < text.length) {
    segments.push(<TextLines key={lastIdx} text={text.slice(lastIdx)} isUser={isUser} baseText={baseText} mutedText={mutedText} />);
  }
  return <div>{segments}</div>;
}

function TextLines({ text, isUser, baseText, mutedText }: { text: string; isUser: boolean; baseText: string; mutedText: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inTable = false;
  const tableRows: string[][] = [];

  const flushTable = (key: string) => {
    if (tableRows.length < 2) return;
    const headers = tableRows[0];
    const rows = tableRows.slice(2);
    elements.push(
      <div key={key} className="my-3 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-[11px]">
          <thead className="bg-muted">
            <tr>{headers.map((h, i) => <th key={i} className="px-3 py-2 text-left font-bold text-foreground">{h.trim()}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-t border-border hover:bg-muted/40">
                {row.map((cell, ci) => <td key={ci} className="px-3 py-1.5 text-muted-foreground">{renderInline(cell.trim())}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows.length = 0;
  };

  lines.forEach((line, idx) => {
    // Table detection
    if (line.trim().startsWith("|")) {
      if (!inTable) inTable = true;
      tableRows.push(line.split("|").filter((_, i, arr) => i > 0 && i < arr.length - 1));
      return;
    } else if (inTable) {
      flushTable(`table-${idx}`);
      inTable = false;
    }

    // Headings
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={idx} className={`text-sm font-bold mt-4 mb-2 ${isUser ? "text-white" : "text-foreground"} font-[Outfit] border-l-[3px] border-indigo-500 pl-3 py-0.5`}>
          {renderInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={idx} className={`text-xs font-bold mt-3 mb-1 ${isUser ? "text-indigo-100" : "text-muted-foreground"} uppercase tracking-wide`}>
          {renderInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith("---")) {
      elements.push(<hr key={idx} className="my-3 border-border" />);
    } else if (/^[•\-\*] /.test(line.trim())) {
      elements.push(
        <li key={idx} className={`ml-4 text-xs leading-relaxed mt-1 list-disc ${mutedText}`}>
          {renderInline(line.replace(/^[•\-\*]\s*/, ""))}
        </li>
      );
    } else if (/^\d+\. /.test(line.trim())) {
      elements.push(
        <li key={idx} className={`ml-4 text-xs leading-relaxed mt-1 list-decimal ${mutedText}`}>
          {renderInline(line.replace(/^\d+\.\s*/, ""))}
        </li>
      );
    } else if (line.trim().startsWith("[ ]") || line.trim().startsWith("[x]")) {
      const checked = line.trim().startsWith("[x]");
      elements.push(
        <div key={idx} className="flex items-start gap-2 mt-1.5">
          <input type="checkbox" checked={checked} readOnly className="mt-0.5 w-3 h-3 accent-indigo-600 flex-shrink-0" />
          <span className={`text-xs ${mutedText} leading-relaxed`}>{renderInline(line.replace(/^\[[ x]\]\s*/, ""))}</span>
        </div>
      );
    } else if (line.trim().startsWith("> ")) {
      elements.push(
        <div key={idx} className="my-2 pl-3 border-l-2 border-indigo-500/50">
          <p className={`text-xs italic ${mutedText}`}>{renderInline(line.replace(/^>\s*/, ""))}</p>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={idx} className="h-1.5" />);
    } else {
      elements.push(
        <p key={idx} className={`text-xs leading-relaxed ${mutedText}`}>
          {renderInline(line)}
        </p>
      );
    }
  });

  if (inTable) flushTable("table-end");
  return <>{elements}</>;
}

// ─── TOOL DEFINITIONS ─────────────────────────────────────────────────────────

const TOOLS: { id: ToolId; label: string; emoji: string; color: string; desc: string }[] = [
  { id: "explain",    label: "Explain Topic",     emoji: "📚", color: "text-indigo-500",  desc: "Deep concept breakdowns" },
  { id: "summarize",  label: "Summarize Notes",   emoji: "📝", color: "text-blue-500",    desc: "Concise revision notes" },
  { id: "quiz",       label: "Quiz Generator",    emoji: "🎯", color: "text-emerald-500", desc: "MCQs, T/F, short Qs" },
  { id: "flashcard",  label: "Flashcards",        emoji: "🧠", color: "text-purple-500",  desc: "Interactive flip cards" },
  { id: "planner",    label: "Study Planner",     emoji: "📅", color: "text-amber-500",   desc: "Personalized schedules" },
  { id: "assignment", label: "Assignment Helper", emoji: "📖", color: "text-rose-500",    desc: "Step-by-step guidance" },
  { id: "coding",     label: "Coding Helper",     emoji: "💡", color: "text-cyan-500",    desc: "Debug & explain code" },
  { id: "document",   label: "Doc Explainer",     emoji: "📄", color: "text-orange-500",  desc: "Upload & summarize" },
];

const QUICK_PROMPTS: { label: string; prompt: string; tool: ToolId }[] = [
  { label: "⚡ Explain recursion",       prompt: "Explain recursion in programming with examples",                tool: "explain" },
  { label: "📝 Summarize DS notes",      prompt: "Summarize my Data Structures lecture notes",                   tool: "summarize" },
  { label: "🎯 CS301 practice quiz",     prompt: "Generate a practice quiz on Data Structures CS301",            tool: "quiz" },
  { label: "🧠 Create flashcards",       prompt: "Create flashcards on core CS concepts",                        tool: "flashcard" },
  { label: "📅 Plan my study schedule",  prompt: "Plan my study schedule for final exams",                       tool: "planner" },
  { label: "📖 Break down assignment",   prompt: "Help me plan and break down my programming assignment",        tool: "assignment" },
  { label: "💡 Explain binary search",   prompt: "Explain and show me binary search code with trace",           tool: "coding" },
  { label: "🎤 Prepare for viva",        prompt: "Prepare me for a technical viva on Data Structures",          tool: "chat" },
  { label: "💬 Interview questions",     prompt: "Generate technical interview questions for a CS student",     tool: "chat" },
  { label: "📚 Linked list explanation", prompt: "Explain linked lists with analogies and code examples",       tool: "explain" },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: 1,
    role: "assistant",
    content: `## Welcome to MindVault Study Copilot 🎓

I'm your **AI-powered study companion**, built specifically for college students. I can help you:

• 📚 **Explain** any concept at your level (beginner → advanced)
• 📝 **Summarize** your notes into concise revision guides
• 🎯 **Generate quizzes** to test your understanding
• 🧠 **Create flashcards** for active recall practice
• 📅 **Plan study schedules** around your exam timetable
• 💡 **Debug code** and explain programming concepts
• 📖 **Help with assignments** (ethically — no plagiarism!)

**Select a Study Tool on the left**, click a quick prompt below, or just ask me anything. Let's get studying! 🚀`,
    timestamp: now(),
    tool: "chat"
  }]);

  const [input, setInput]               = useState("");
  const [isLoading, setIsLoading]       = useState(false);
  const [activeTool, setActiveTool]     = useState<ToolId>("chat");
  const [copiedId, setCopiedId]         = useState<number | null>(null);
  const [regenId, setRegenId]           = useState<number | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [backendStatus, setBackendStatus]   = useState<"online" | "offline" | "unknown">("unknown");
  const [errorMsg, setErrorMsg]         = useState<string | null>(null);

  // Tool-specific form state
  const [explainTopic, setExplainTopic]   = useState("");
  const [explainLevel, setExplainLevel]   = useState("beginner");
  const [quizSubject, setQuizSubject]     = useState("");
  const [quizType, setQuizType]           = useState<"mcq" | "short" | "truefalse">("mcq");
  const [quizCount, setQuizCount]         = useState(5);
  const [notesText, setNotesText]         = useState("");
  const [codeSnippet, setCodeSnippet]     = useState("");
  const [plannerExam, setPlannerExam]     = useState("");
  const [assignmentDesc, setAssignmentDesc] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function now() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const sendMessage = useCallback(async (text: string, tool: ToolId = activeTool) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now(), role: "user", content: text, timestamp: now(), tool };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { content, conversationId: newConvId } = await callAIService(text, tool, conversationId);
      setConversationId(newConvId);
      setBackendStatus(newConvId.startsWith("mock-") ? "offline" : "online");
      const aiMsg: Message = { id: Date.now() + 1, role: "assistant", content, timestamp: now(), tool };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setBackendStatus("offline");
      if (err instanceof AIServiceError && err.isRateLimited) {
        setErrorMsg(err.message);
        const errMsg: Message = {
          id: Date.now() + 1,
          role: "assistant",
          content: `## ⏱ Rate Limit Reached\n\n${err.message}\n\nPlease wait a moment before sending another message.`,
          timestamp: now(),
          tool,
        };
        setMessages(prev => [...prev, errMsg]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeTool, isLoading, conversationId]);

  const regenerate = useCallback(async (msgId: number) => {
    let userContent = "";
    let userTool: ToolId = activeTool;

    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === msgId);
      if (idx <= 0) return prev;
      const userMsg = prev[idx - 1];
      if (userMsg.role !== "user") return prev;
      userContent = userMsg.content;
      userTool = (userMsg.tool as ToolId) || activeTool;
      return prev.filter(m => m.id !== msgId);
    });

    if (!userContent) return;
    setIsLoading(true);
    try {
      const { content } = await callAIService(userContent, userTool, conversationId);
      const aiMsg: Message = { id: Date.now(), role: "assistant", content, timestamp: now(), tool: userTool };
      setMessages(p => [...p, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTool, conversationId]);

  const copyMsg = (content: string, id: number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      role: "assistant",
      content: "Chat cleared! Ready for a new study session. What would you like to work on? 🎓",
      timestamp: now(),
      tool: "chat"
    }]);
  };

  // ── Build prompt from tool form ──
  const fireToolPrompt = () => {
    let prompt = "";
    switch (activeTool) {
      case "explain":
        prompt = `Explain the concept of "${explainTopic || "recursion"}" at the ${explainLevel} level. Include analogies, examples, and code where appropriate.`;
        break;
      case "summarize":
        prompt = notesText.trim()
          ? `Summarize these notes into concise revision notes with key points highlighted:\n\n${notesText}`
          : "Summarize my Data Structures and Algorithms lecture notes into concise revision notes.";
        break;
      case "quiz":
        prompt = `Generate ${quizCount} ${quizType === "mcq" ? "multiple choice" : quizType === "truefalse" ? "true/false" : "short answer"} questions on the subject: ${quizSubject || "Data Structures"}.`;
        break;
      case "flashcard":
        prompt = `Create ${quizCount} revision flashcards on: ${quizSubject || "core CS concepts"}.`;
        break;
      case "planner":
        prompt = `Create a personalized study plan for: ${plannerExam || "final exams"}. Include daily goals and study blocks.`;
        break;
      case "assignment":
        prompt = `Help me plan and break down this assignment: "${assignmentDesc || "programming assignment on data structures"}". Give step-by-step guidance.`;
        break;
      case "coding":
        prompt = codeSnippet.trim()
          ? `Review, explain and suggest improvements for this code:\n\`\`\`\n${codeSnippet}\n\`\`\``
          : "Explain binary search algorithm with code and a step-by-step trace.";
        break;
      case "document":
        prompt = "Analyze uploaded lecture notes note_draft.pdf";
        break;
      default:
        prompt = input;
    }
    sendMessage(prompt, activeTool);
  };

  const currentTool = TOOLS.find(t => t.id === activeTool);

  return (
    <div className="flex-1 flex overflow-hidden bg-background h-full font-[DM_Sans]" style={{ minHeight: 0 }}>

      {/* ── Left Panel: Tools ── */}
      <div className="w-72 flex-shrink-0 bg-card border-r border-border flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={13} className="text-white" />
            </div>
            <h2 className="text-xs font-bold text-foreground font-[Outfit]">Study Tools</h2>
          </div>
          <p className="text-[10px] text-muted-foreground">Select a tool to get structured AI help</p>
        </div>

        {/* Tool List */}
        <div className="overflow-y-auto flex-1 px-3 py-3 space-y-1">
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all group ${
                activeTool === tool.id
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <span className="text-base leading-none">{tool.emoji}</span>
              <div className="min-w-0">
                <div className={`text-xs font-semibold truncate ${activeTool === tool.id ? "text-white" : "text-foreground"}`}>
                  {tool.label}
                </div>
                <div className={`text-[10px] truncate ${activeTool === tool.id ? "text-indigo-200" : "text-muted-foreground"}`}>
                  {tool.desc}
                </div>
              </div>
            </button>
          ))}
          <button
            onClick={() => setActiveTool("chat")}
            className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
              activeTool === "chat" ? "bg-indigo-600 text-white" : "hover:bg-muted text-foreground"
            }`}
          >
            <span className="text-base">❓</span>
            <div>
              <div className={`text-xs font-semibold ${activeTool === "chat" ? "text-white" : "text-foreground"}`}>Ask Anything</div>
              <div className={`text-[10px] ${activeTool === "chat" ? "text-indigo-200" : "text-muted-foreground"}`}>Free-form chat</div>
            </div>
          </button>
        </div>

        {/* Tool Form Panel */}
        <div className="border-t border-border p-3 flex-shrink-0 space-y-2.5 overflow-y-auto" style={{ maxHeight: "48%" }}>
          {activeTool === "explain" && (
            <>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Topic to Explain</label>
              <input value={explainTopic} onChange={e => setExplainTopic(e.target.value)}
                placeholder="e.g. Recursion, Binary Trees, SQL JOINs"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-1">
                {["beginner", "intermediate", "advanced"].map(l => (
                  <button key={l} onClick={() => setExplainLevel(l)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg border capitalize transition-all ${
                      explainLevel === l ? "bg-indigo-600 text-white border-indigo-600" : "bg-background text-muted-foreground border-border hover:bg-muted"
                    }`}>{l}</button>
                ))}
              </div>
            </>
          )}

          {activeTool === "summarize" && (
            <>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Paste Your Notes (optional)</label>
              <textarea value={notesText} onChange={e => setNotesText(e.target.value)}
                placeholder="Paste lecture notes here, or leave blank to use a subject name..."
                rows={4} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none" />
            </>
          )}

          {(activeTool === "quiz" || activeTool === "flashcard") && (
            <>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Subject / Topic</label>
              <input value={quizSubject} onChange={e => setQuizSubject(e.target.value)}
                placeholder="e.g. Data Structures, Calculus, SQL"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Count</label>
                <input type="number" value={quizCount} onChange={e => setQuizCount(Number(e.target.value))}
                  min={3} max={20} className="w-16 bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none" />
              </div>
              {activeTool === "quiz" && (
                <>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Question Type</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[["mcq", "MCQ"], ["truefalse", "T/F"], ["short", "Short"]].map(([val, lbl]) => (
                      <button key={val} onClick={() => setQuizType(val as "mcq" | "short" | "truefalse")}
                        className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                          quizType === val ? "bg-indigo-600 text-white border-indigo-600" : "bg-background text-muted-foreground border-border hover:bg-muted"
                        }`}>{lbl}</button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {activeTool === "planner" && (
            <>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Exam / Goal</label>
              <input value={plannerExam} onChange={e => setPlannerExam(e.target.value)}
                placeholder="e.g. CS301 final on Dec 20"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
            </>
          )}

          {activeTool === "assignment" && (
            <>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Assignment Description</label>
              <textarea value={assignmentDesc} onChange={e => setAssignmentDesc(e.target.value)}
                placeholder="Describe your assignment briefly..."
                rows={3} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none" />
            </>
          )}

          {activeTool === "coding" && (
            <>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Code Snippet</label>
              <textarea value={codeSnippet} onChange={e => setCodeSnippet(e.target.value)}
                placeholder="Paste your code here to debug or get an explanation..."
                rows={4} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none" />
            </>
          )}

          {activeTool === "document" && (
            <div className="border border-dashed border-border rounded-xl p-3 text-center">
              <Upload size={18} className="mx-auto text-muted-foreground opacity-50 mb-1.5" />
              <p className="text-[10px] text-muted-foreground">PDF upload (UI placeholder)</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">Backend integration ready</p>
            </div>
          )}

          {activeTool !== "chat" && (
            <button onClick={fireToolPrompt} disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[10px] font-bold rounded-xl py-2.5 flex items-center justify-center gap-1.5 transition-all">
              <Sparkles size={11} />
              {currentTool ? `Generate with ${currentTool.emoji} ${currentTool.label}` : "Generate"}
            </button>
          )}
        </div>
      </div>

      {/* ── Right Panel: Chat ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">

        {/* Chat Header */}
        <div className="border-b border-border bg-card px-5 py-3 flex items-center justify-between flex-shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <Bot size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-[Outfit] text-foreground leading-tight">MindVault Study Copilot</h2>
              <span className="text-[10px] font-semibold inline-flex items-center gap-1.5">
                {backendStatus === "online" ? (
                  <><Wifi size={9} className="text-emerald-500" /><span className="text-emerald-500">Live AI Connected</span></>
                ) : backendStatus === "offline" ? (
                  <><WifiOff size={9} className="text-amber-500" /><span className="text-amber-500">Offline Mode</span></>
                ) : (
                  <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" /><span className="text-emerald-500">{currentTool ? `${currentTool.emoji} ${currentTool.label} mode` : "Ready"}</span></>
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {backendStatus === "online" && (
              <span className="text-[9px] font-bold text-muted-foreground border border-border rounded-lg px-2 py-1 uppercase tracking-wide">
                {(import.meta.env.VITE_AI_PROVIDER || "Groq").toUpperCase()}
              </span>
            )}
            <button onClick={clearChat}
              className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-red-500 border border-border hover:border-red-200 dark:hover:border-red-900 px-3 py-1.5 rounded-xl transition-all">
              <Trash2 size={11} /> Clear Chat
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse ml-auto max-w-[78%]" : "mr-auto max-w-[82%]"}`}>

              {/* Avatar */}
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 select-none border ${
                msg.role === "user"
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/20 text-indigo-500"
              }`}>
                {msg.role === "user" ? <User size={13} /> : <Bot size={13} />}
              </div>

              {/* Bubble */}
              <div className="space-y-1 min-w-0 flex-1">
                <div className={`rounded-2xl px-4 py-3 border text-xs ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white border-indigo-600 rounded-tr-sm"
                    : "bg-card border-border rounded-tl-sm"
                }`}>
                  <div className="font-[DM_Sans]">
                    {msg.role === "user"
                      ? <p className="whitespace-pre-wrap leading-relaxed text-white text-xs">{msg.content}</p>
                      : <MarkdownBlock text={msg.content} isUser={false} />}
                  </div>

                  {/* Action bar — assistant only */}
                  {msg.role === "assistant" && (
                    <div className="mt-3 pt-2 border-t border-border/30 flex items-center gap-3">
                      <button onClick={() => copyMsg(msg.content, msg.id)}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                        {copiedId === msg.id
                          ? <><Check size={10} className="text-emerald-500" /><span className="text-emerald-500 font-bold">Copied!</span></>
                          : <><Copy size={10} /><span>Copy</span></>
                        }
                      </button>
                      {i === messages.length - 1 && (
                        <button onClick={() => regenerate(msg.id)}
                          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-indigo-500 transition-colors">
                          <RefreshCw size={10} /><span>Regenerate</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <p className={`text-[9px] text-muted-foreground px-1 select-none ${msg.role === "user" ? "text-right" : ""}`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3 mr-auto select-none">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 text-indigo-500 flex items-center justify-center flex-shrink-0">
                <Bot size={13} />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "160ms" }} />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "320ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card px-4 py-3 space-y-2.5 flex-shrink-0">
          {/* Quick Prompt Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 select-none" style={{ scrollbarWidth: "none" }}>
            {QUICK_PROMPTS.map(p => (
              <button
                key={p.label}
                onClick={() => sendMessage(p.prompt, p.tool)}
                disabled={isLoading}
                className="flex-shrink-0 flex items-center gap-1 bg-muted/50 hover:bg-muted border border-border/70 text-[10px] font-medium text-foreground rounded-full px-3 py-1 whitespace-nowrap transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Row */}
          <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
              placeholder={isLoading ? "MindVault AI is thinking..." : `Ask anything or use the tools on the left...`}
              className="flex-1 bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all active:scale-95 flex-shrink-0"
            >
              {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </form>

          <p className="text-[9px] text-muted-foreground text-center select-none">
            MindVault AI provides study guidance only. Always verify critical information with your professors.
          </p>
        </div>
      </div>
    </div>
  );
}
