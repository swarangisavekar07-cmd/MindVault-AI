import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { AIMessage, AIProvider, AIProviderName, AIRequest, AIResponse, AITool } from "../types/ai";
import { buildSystemPrompt } from "./prompts";

// ─── AIService — The Core Abstraction Layer ───────────────────────────────────
//
// This is the ONLY class the routes interact with.
// The frontend NEVER knows which provider is active.
// To switch providers: change AI_PROVIDER in .env and restart the server.
//
// Active provider: groq
//

const MAX_HISTORY_MESSAGES = 20; // Keep last 20 messages for context

export class AIService {
  private provider: AIProvider | null = null;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.getProvider().catch(() => {});
  }

  public async getProvider(): Promise<AIProvider> {
    if (this.provider) return this.provider;

    const providerName = (process.env.AI_PROVIDER || "groq").toLowerCase() as AIProviderName;

    try {
      switch (providerName) {
        case "groq": {
          const { GroqProvider } = await import("./providers/GroqProvider");
          this.provider = new GroqProvider();
          break;
        }
        case "openai": {
          const { OpenAIProvider } = await import("./providers/OpenAIProvider");
          this.provider = new OpenAIProvider();
          break;
        }
        case "claude": {
          const { ClaudeProvider } = await import("./providers/ClaudeProvider");
          this.provider = new ClaudeProvider();
          break;
        }
        case "gemini": {
          const { GeminiProvider } = await import("./providers/GeminiProvider");
          this.provider = new GeminiProvider();
          break;
        }
        default:
          throw new Error(`Unsupported AI provider: ${providerName}`);
      }

      const pName = this.provider.name.charAt(0).toUpperCase() + this.provider.name.slice(1);
      console.log(`✅ AIService initialized with provider: ${pName}`);
      console.log(`Using AI Provider: ${pName}`);
      console.log(`Current Model: ${this.provider.modelName}`);

      return this.provider;
    } catch (error: any) {
      console.error(`❌ Failed to initialize ${providerName} provider: ${error.message}`);
      console.warn("⚠️  AI features will be disabled until a valid API key is configured.");
      this.provider = this.createFallbackProvider(providerName);
      return this.provider;
    }
  }

  // Graceful fallback when no API key is configured
  private createFallbackProvider(attempted: string): AIProvider {
    return {
      name: attempted as AIProviderName,
      modelName: "none-unconfigured",
      chat: async () => {
        throw new Error("Unable to contact the AI provider. Please check your API key or internet connection.");
      },
    };
  }

  get activeProvider(): string {
    return (process.env.AI_PROVIDER || "groq").toLowerCase();
  }

  // ── Core: Process an AI request with full conversation memory ──────────────

  async processRequest(userId: string, request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const { tool, message, conversationId, context } = request;

    // 1. Get active provider (loads dynamically if not already initialized)
    const provider = await this.getProvider();

    // 2. Get or create conversation
    const convId = await this.getOrCreateConversation(userId, tool, conversationId);

    // 3. Load conversation history from DB
    const history = await this.loadHistory(convId);

    // 4. Add user message to history
    const userMsg: AIMessage = { role: "user", content: message };
    const allMessages = [...history, userMsg];

    // 5. Build system prompt for this tool
    const systemPrompt = buildSystemPrompt(tool, context);

    // 6. Trim to max history window (prevent token bloat)
    const trimmedMessages = this.trimHistory(allMessages);

    // Backend Logging: Prompt, selected provider, model
    console.log(`\n=================== INCOMING AI REQUEST ===================`);
    console.log(`Incoming prompt: "${message.length > 100 ? message.substring(0, 100) + '...' : message}"`);
    
    const pName = provider.name.charAt(0).toUpperCase() + provider.name.slice(1);
    console.log(`Using AI Provider: ${pName}`);
    console.log(`Current Model: ${provider.modelName}`);

    try {
      // 7. Call the active AI provider
      const { content, usage } = await provider.chat(trimmedMessages, systemPrompt);

      console.log(`API response status: SUCCESS`);
      console.log(`===========================================================\n`);

      // 8. Persist both messages to DB
      const messageId = await this.saveExchange(convId, message, content, tool, usage);

      return {
        content,
        conversationId: convId,
        messageId,
        tool,
        provider: provider.name,
        usage,
        durationMs: Date.now() - startTime,
      };
    } catch (error: any) {
      console.log(`API response status: ERROR`);
      console.log(`Errors: ${error.message}`);
      console.log(`===========================================================\n`);
      
      throw new Error("Unable to contact the AI provider. Please check your API key or internet connection.");
    }
  }

  // ── Conversation Management ────────────────────────────────────────────────

  private async getOrCreateConversation(
    userId: string,
    tool: AITool,
    conversationId?: string
  ): Promise<string> {
    if (conversationId) {
      // Verify the conversation belongs to this user
      const existing = await (this.prisma as any).aiConversation.findFirst({
        where: { id: conversationId, userId },
      });
      if (existing) return conversationId;
    }

    // Create new conversation
    const conv = await (this.prisma as any).aiConversation.create({
      data: {
        id: uuidv4(),
        userId,
        tool,
        title: this.toolTitle(tool),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return conv.id;
  }

  private async loadHistory(conversationId: string): Promise<AIMessage[]> {
    const messages = await (this.prisma as any).aiMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: MAX_HISTORY_MESSAGES,
    });

    return messages.map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
  }

  private trimHistory(messages: AIMessage[]): AIMessage[] {
    if (messages.length <= MAX_HISTORY_MESSAGES) return messages;
    // Always keep the last MAX_HISTORY_MESSAGES, starting from a user message
    const trimmed = messages.slice(-MAX_HISTORY_MESSAGES);
    // Ensure first message is from user
    const firstUserIdx = trimmed.findIndex(m => m.role === "user");
    return firstUserIdx > 0 ? trimmed.slice(firstUserIdx) : trimmed;
  }

  private async saveExchange(
    conversationId: string,
    userContent: string,
    assistantContent: string,
    tool: AITool,
    usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
  ): Promise<string> {
    const messageId = uuidv4();

    await (this.prisma as any).aiMessage.createMany({
      data: [
        {
          id: uuidv4(),
          conversationId,
          role: "user",
          content: userContent,
          tool,
          createdAt: new Date(),
        },
        {
          id: messageId,
          conversationId,
          role: "assistant",
          content: assistantContent,
          tool,
          promptTokens:     usage?.promptTokens     ?? 0,
          completionTokens: usage?.completionTokens ?? 0,
          totalTokens:      usage?.totalTokens      ?? 0,
          createdAt: new Date(),
        },
      ],
    });

    // Update conversation timestamp
    await (this.prisma as any).aiConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return messageId;
  }

  // ── Conversation History API ───────────────────────────────────────────────

  async getConversations(userId: string) {
    return (this.prisma as any).aiConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  }

  async getConversationMessages(userId: string, conversationId: string) {
    const conv = await (this.prisma as any).aiConversation.findFirst({
      where: { id: conversationId, userId },
    });
    if (!conv) return null;

    return (this.prisma as any).aiMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  }

  async deleteConversation(userId: string, conversationId: string) {
    const conv = await (this.prisma as any).aiConversation.findFirst({
      where: { id: conversationId, userId },
    });
    if (!conv) return false;

    await (this.prisma as any).aiMessage.deleteMany({ where: { conversationId } });
    await (this.prisma as any).aiConversation.delete({ where: { id: conversationId } });
    return true;
  }

  // ── Token Usage Analytics ─────────────────────────────────────────────────

  async getTokenUsage(userId: string) {
    const conversations = await (this.prisma as any).aiConversation.findMany({
      where: { userId },
      include: { messages: { select: { totalTokens: true } } },
    });

    const totalTokens = conversations.reduce((sum: number, conv: any) =>
      sum + conv.messages.reduce((s: number, m: any) => s + (m.totalTokens || 0), 0), 0
    );

    return { totalTokens, conversationCount: conversations.length };
  }

  private toolTitle(tool: AITool): string {
    const titles: Record<AITool, string> = {
      chat:         "General Chat",
      explain:      "Concept Explanation",
      summarize:    "Notes Summary",
      quiz:         "Practice Quiz",
      flashcards:   "Flashcard Set",
      "study-plan": "Study Plan",
      "code-help":  "Code Help",
    };
    return titles[tool] || "AI Session";
  }
}
