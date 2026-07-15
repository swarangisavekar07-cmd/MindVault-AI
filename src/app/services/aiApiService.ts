// ─── MindVault AI API Service ─────────────────────────────────────────────────
// This is the ONLY place the frontend talks to the AI backend.
// All functions here map directly to POST /api/ai/* endpoints.
//
// To switch AI providers (Gemini → OpenAI → Claude), change AI_PROVIDER in
// server/.env — this file and AIPage.tsx require NO changes.
//
// FUTURE STREAMING: Replace the fetch calls here with EventSource / ReadableStream
// when backend streaming is enabled.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AITool =
  | "chat"
  | "explain"
  | "summarize"
  | "quiz"
  | "flashcards"
  | "study-plan"
  | "code-help";

export interface AIRequestContext {
  subject?: string;
  level?: "beginner" | "intermediate" | "advanced";
  questionType?: "mcq" | "short" | "truefalse";
  count?: number;
  examDate?: string;
  codeLanguage?: string;
  additionalNotes?: string;
}

export interface AIServiceRequest {
  message: string;
  conversationId?: string;
  context?: AIRequestContext;
}

export interface AIServiceResponse {
  content: string;
  conversationId: string;
  messageId: string;
  tool: AITool;
  provider: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  durationMs: number;
  rateLimitRemaining?: { minute: number; day: number };
}

export interface AIConversation {
  id: string;
  tool: AITool;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AIConversationMessage[];
}

export interface AIConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  tool: string;
  createdAt: string;
  totalTokens?: number;
}

// ─── HTTP Helpers ─────────────────────────────────────────────────────────────

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("mindvault_token") || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function handleUnauthorized() {
  localStorage.removeItem("mindvault_token");
  localStorage.removeItem("token");
  localStorage.removeItem("mindvault_user");
  window.dispatchEvent(new CustomEvent("mindvault_unauthorized"));
}

async function post<T>(endpoint: string, body: object): Promise<T> {
  const token = localStorage.getItem("mindvault_token") || localStorage.getItem("token");
  if (!token) {
    handleUnauthorized();
    throw new AIServiceError("Session expired. Please login again.", 401);
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api/ai${endpoint}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new AIServiceError("Unable to contact AI service.", 503);
  }

  if (response.status === 401) {
    handleUnauthorized();
    throw new AIServiceError("Session expired. Please login again.", 401);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unable to contact AI service." }));
    throw new AIServiceError(
      error.error || "Unable to contact AI service.",
      response.status,
      error.retryAfterMs
    );
  }

  return response.json();
}

async function get<T>(endpoint: string): Promise<T> {
  const token = localStorage.getItem("mindvault_token") || localStorage.getItem("token");
  if (!token) {
    handleUnauthorized();
    throw new AIServiceError("Session expired. Please login again.", 401);
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api/ai${endpoint}`, {
      headers: getAuthHeaders(),
    });
  } catch (err) {
    throw new AIServiceError("Unable to contact AI service.", 503);
  }

  if (response.status === 401) {
    handleUnauthorized();
    throw new AIServiceError("Session expired. Please login again.", 401);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unable to contact AI service." }));
    throw new AIServiceError(error.error || "Unable to contact AI service.", response.status);
  }

  return response.json();
}

// ─── Custom Error Class ───────────────────────────────────────────────────────

export class AIServiceError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryAfterMs?: number
  ) {
    super(message);
    this.name = "AIServiceError";
  }

  get isRateLimited() { return this.status === 429; }
  get isUnauthorized() { return this.status === 401; }
  get isServerError()  { return this.status >= 500; }
}

// ─── Core AI Endpoints ────────────────────────────────────────────────────────

/**
 * Free-form chat with full conversation memory.
 * Pass `conversationId` to continue an existing conversation.
 */
export async function chatAI(req: AIServiceRequest): Promise<AIServiceResponse> {
  return post<AIServiceResponse>("/chat", req);
}

/**
 * Explain any concept at beginner / intermediate / advanced level.
 * context.level controls the depth of explanation.
 */
export async function explainTopic(req: AIServiceRequest): Promise<AIServiceResponse> {
  return post<AIServiceResponse>("/explain", req);
}

/**
 * Summarize notes or a topic into concise revision-ready content.
 * Pass the full notes text as `message`, or just a topic name.
 */
export async function summarizeNotes(req: AIServiceRequest): Promise<AIServiceResponse> {
  return post<AIServiceResponse>("/summarize", req);
}

/**
 * Generate MCQ / True-False / Short Answer practice questions.
 * context.questionType and context.count control the output.
 */
export async function generateQuiz(req: AIServiceRequest): Promise<AIServiceResponse> {
  return post<AIServiceResponse>("/quiz", req);
}

/**
 * Generate interactive flip flashcards in structured format.
 * The frontend FlashcardViewer component parses the response automatically.
 */
export async function generateFlashcards(req: AIServiceRequest): Promise<AIServiceResponse> {
  return post<AIServiceResponse>("/flashcards", req);
}

/**
 * Generate a personalized day-by-day study plan.
 * context.examDate and context.subject help the AI personalize.
 */
export async function generateStudyPlan(req: AIServiceRequest): Promise<AIServiceResponse> {
  return post<AIServiceResponse>("/study-plan", req);
}

/**
 * Debug, explain, or review code snippets.
 * context.codeLanguage sets the expected programming language.
 */
export async function getCodeHelp(req: AIServiceRequest): Promise<AIServiceResponse> {
  return post<AIServiceResponse>("/code-help", req);
}

// ─── Tool Dispatcher ──────────────────────────────────────────────────────────
// Single function that routes to the correct endpoint based on tool name.
// This is what AIPage.tsx calls — keeping the UI layer clean.

export async function dispatchAI(
  tool: AITool,
  req: AIServiceRequest
): Promise<AIServiceResponse> {
  switch (tool) {
    case "explain":    return explainTopic(req);
    case "summarize":  return summarizeNotes(req);
    case "quiz":       return generateQuiz(req);
    case "flashcards": return generateFlashcards(req);
    case "study-plan": return generateStudyPlan(req);
    case "code-help":  return getCodeHelp(req);
    case "chat":
    default:           return chatAI(req);
  }
}

// ─── Conversation History ─────────────────────────────────────────────────────

export async function getConversations(): Promise<AIConversation[]> {
  return get<AIConversation[]>("/conversations");
}

export async function getConversationMessages(conversationId: string): Promise<AIConversationMessage[]> {
  return get<AIConversationMessage[]>(`/conversations/${conversationId}`);
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await fetch(`${BASE_URL}/api/ai/conversations/${conversationId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

// ─── Usage & Status ───────────────────────────────────────────────────────────

export async function getAIUsage(): Promise<{
  totalTokens: number;
  conversationCount: number;
  provider: string;
}> {
  return get("/usage");
}

export async function getAIStatus(): Promise<{
  status: string;
  provider: string;
  model: string;
}> {
  return get("/status");
}
