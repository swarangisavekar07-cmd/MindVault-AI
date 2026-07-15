// ─── Shared AI Type Definitions ───────────────────────────────────────────────
// These types are the contract between the frontend, routes, and AIService.
// The frontend never needs to know which LLM provider is active.

export type AIProviderName = "groq" | "gemini" | "openai" | "claude";

export type AITool =
  | "chat"
  | "explain"
  | "summarize"
  | "quiz"
  | "flashcards"
  | "study-plan"
  | "code-help";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIRequest {
  tool: AITool;
  message: string;               // The user's primary input
  conversationId?: string;       // For multi-turn memory
  context?: {                    // Optional structured context
    subject?: string;
    level?: "beginner" | "intermediate" | "advanced";
    questionType?: "mcq" | "short" | "truefalse";
    count?: number;
    examDate?: string;
    codeLanguage?: string;
    additionalNotes?: string;
  };
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIResponse {
  content: string;
  conversationId: string;
  messageId: string;
  tool: AITool;
  provider: AIProviderName;
  usage?: TokenUsage;
  durationMs: number;
}

// Interface every provider adapter must implement
export interface AIProvider {
  name: AIProviderName;
  modelName: string;
  chat(
    messages: AIMessage[],
    systemPrompt: string
  ): Promise<{ content: string; usage?: TokenUsage }>;
}
