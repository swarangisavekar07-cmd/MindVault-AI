import { Router, Response } from "express";
import { AIService } from "../ai/AIService";
import { checkRateLimit } from "../ai/rateLimiter";
import { authMiddleware, AuthenticatedRequest } from "../middleware/authMiddleware";
import { AIRequest, AITool } from "../types/ai";
import { PrismaClient } from "@prisma/client";

// ─── AI Routes ────────────────────────────────────────────────────────────────
// All routes are JWT-protected via authMiddleware.
// Rate limiting is applied per-user before the AI call.
// The route handler is the ONLY interface between HTTP and AIService —
// the frontend never calls AI providers directly.

export function createAIRouter(prisma: PrismaClient): Router {
  const router = Router();
  const aiService = new AIService(prisma);

  // ── Shared handler ──────────────────────────────────────────────────────────
  const handleAIRequest = async (
    req: AuthenticatedRequest,
    res: Response,
    tool: AITool
  ) => {
    const userId = req.userId!;

    // 1. Rate limit check
    const limit = checkRateLimit(userId);
    res.setHeader("X-RateLimit-Remaining-Minute", limit.remaining.minute.toString());
    res.setHeader("X-RateLimit-Remaining-Day",    limit.remaining.day.toString());

    if (!limit.allowed) {
      res.status(429).json({
        error: limit.reason,
        retryAfterMs: limit.retryAfterMs,
      });
      return;
    }

    // 2. Validate required field
    const { message, conversationId, context } = req.body;
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      res.status(400).json({ error: "message is required and must be a non-empty string." });
      return;
    }

    if (message.length > 8000) {
      res.status(400).json({ error: "message is too long. Maximum 8000 characters." });
      return;
    }

    // 3. Build request
    const aiRequest: AIRequest = {
      tool,
      message: message.trim(),
      conversationId,
      context,
    };

    try {
      // 4. Process via AIService
      const result = await aiService.processRequest(userId, aiRequest);
      res.json({
        ...result,
        rateLimitRemaining: limit.remaining,
      });
    } catch (error: any) {
      console.error(`[AI Router Error - ${tool}]:`, error.message);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  };

  // Apply auth to all /ai routes
  router.use(authMiddleware);

  // ── POST /api/ai/chat ───────────────────────────────────────────────────────
  router.post("/chat", async (req: AuthenticatedRequest, res) => {
    try {
      await handleAIRequest(req, res, "chat");
    } catch (error: any) {
      console.error("[AI /chat]", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // ── POST /api/ai/explain ────────────────────────────────────────────────────
  router.post("/explain", async (req: AuthenticatedRequest, res) => {
    try {
      await handleAIRequest(req, res, "explain");
    } catch (error: any) {
      console.error("[AI /explain]", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // ── POST /api/ai/summarize ──────────────────────────────────────────────────
  router.post("/summarize", async (req: AuthenticatedRequest, res) => {
    try {
      await handleAIRequest(req, res, "summarize");
    } catch (error: any) {
      console.error("[AI /summarize]", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // ── POST /api/ai/quiz ───────────────────────────────────────────────────────
  router.post("/quiz", async (req: AuthenticatedRequest, res) => {
    try {
      await handleAIRequest(req, res, "quiz");
    } catch (error: any) {
      console.error("[AI /quiz]", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // ── POST /api/ai/flashcards ─────────────────────────────────────────────────
  router.post("/flashcards", async (req: AuthenticatedRequest, res) => {
    try {
      await handleAIRequest(req, res, "flashcards");
    } catch (error: any) {
      console.error("[AI /flashcards]", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // ── POST /api/ai/study-plan ─────────────────────────────────────────────────
  router.post("/study-plan", async (req: AuthenticatedRequest, res) => {
    try {
      await handleAIRequest(req, res, "study-plan");
    } catch (error: any) {
      console.error("[AI /study-plan]", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // ── POST /api/ai/code-help ──────────────────────────────────────────────────
  router.post("/code-help", async (req: AuthenticatedRequest, res) => {
    try {
      await handleAIRequest(req, res, "code-help");
    } catch (error: any) {
      console.error("[AI /code-help]", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // ── GET /api/ai/conversations ───────────────────────────────────────────────
  // Returns list of all AI conversation sessions for the user
  router.get("/conversations", async (req: AuthenticatedRequest, res) => {
    try {
      const conversations = await aiService.getConversations(req.userId!);
      res.json(conversations);
    } catch (error: any) {
      console.error("[AI /conversations]", error);
      res.status(500).json({ error: "Failed to fetch conversation history." });
    }
  });

  // ── GET /api/ai/conversations/:id ──────────────────────────────────────────
  // Returns all messages in a specific conversation
  router.get("/conversations/:id", async (req: AuthenticatedRequest, res) => {
    try {
      const messages = await aiService.getConversationMessages(req.userId!, req.params.id);
      if (!messages) {
        res.status(404).json({ error: "Conversation not found." });
        return;
      }
      res.json(messages);
    } catch (error: any) {
      console.error("[AI /conversations/:id]", error);
      res.status(500).json({ error: "Failed to fetch conversation messages." });
    }
  });

  // ── DELETE /api/ai/conversations/:id ───────────────────────────────────────
  router.delete("/conversations/:id", async (req: AuthenticatedRequest, res) => {
    try {
      const deleted = await aiService.deleteConversation(req.userId!, req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Conversation not found." });
        return;
      }
      res.json({ message: "Conversation deleted successfully." });
    } catch (error: any) {
      console.error("[AI /conversations/:id DELETE]", error);
      res.status(500).json({ error: "Failed to delete conversation." });
    }
  });

  // ── GET /api/ai/usage ───────────────────────────────────────────────────────
  // Returns token usage analytics for the current user
  router.get("/usage", async (req: AuthenticatedRequest, res) => {
    try {
      const usage = await aiService.getTokenUsage(req.userId!);
      res.json({ ...usage, provider: aiService.activeProvider });
    } catch (error: any) {
      console.error("[AI /usage]", error);
      res.status(500).json({ error: "Failed to fetch usage stats." });
    }
  });

  // ── GET /api/ai/status ──────────────────────────────────────────────────────
  // Health check — returns which provider is active
  router.get("/status", async (_req, res) => {
    const provider = await aiService.getProvider();
    res.json({
      status: "online",
      provider: provider.name,
      model: provider.modelName,
    });
  });

  return router;
}
