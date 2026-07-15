import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { AIMessage, AIProvider, AIProviderName, TokenUsage } from "../../types/ai";

// ─── Google Gemini Provider ────────────────────────────────────────────────────
// Uses @google/generative-ai SDK
// Supported model: gemini-1.5-flash (fast + free tier) or gemini-1.5-pro

export class GeminiProvider implements AIProvider {
  readonly name: AIProviderName = "gemini";
  private client: GoogleGenerativeAI;
  public modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set in environment variables.");
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  }

  async chat(
    messages: AIMessage[],
    systemPrompt: string
  ): Promise<{ content: string; usage?: TokenUsage }> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: systemPrompt,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    // Map AIMessage[] → Gemini Content[] format
    // Gemini uses "user" and "model" roles (not "assistant")
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;
    const content = response.text();

    // Token usage (available in usageMetadata)
    const meta = (response as any).usageMetadata;
    const usage: TokenUsage | undefined = meta
      ? {
          promptTokens:     meta.promptTokenCount     || 0,
          completionTokens: meta.candidatesTokenCount || 0,
          totalTokens:      meta.totalTokenCount      || 0,
        }
      : undefined;

    return { content, usage };
  }
}
