import Anthropic from "@anthropic-ai/sdk";
import { AIMessage, AIProvider, AIProviderName, TokenUsage } from "../../types/ai";

// ─── Anthropic Claude Provider ────────────────────────────────────────────────
// Uses @anthropic-ai/sdk
// Supported models: claude-3-5-sonnet-20241022, claude-3-haiku-20240307, claude-3-opus-20240229

export class ClaudeProvider implements AIProvider {
  readonly name: AIProviderName = "claude";
  private client: Anthropic;
  public modelName: string;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set in environment variables.");
    this.client = new Anthropic({ apiKey });
    this.modelName = process.env.CLAUDE_MODEL || "claude-3-haiku-20240307";
  }

  async chat(
    messages: AIMessage[],
    systemPrompt: string
  ): Promise<{ content: string; usage?: TokenUsage }> {
    // Claude separates system prompt from messages
    // Map AIMessage[] → Anthropic MessageParam[] (only user/assistant roles)
    const claudeMessages: Anthropic.MessageParam[] = messages
      .filter(m => m.role !== "system")
      .map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    // Claude requires messages to alternate user/assistant and start with user
    // Ensure first message is from user
    const validMessages = claudeMessages.length > 0 && claudeMessages[0].role === "user"
      ? claudeMessages
      : claudeMessages.filter((_, i) => i > 0 || _.role === "user");

    const response = await this.client.messages.create({
      model: this.modelName,
      system: systemPrompt,
      messages: validMessages.length > 0 ? validMessages : [{ role: "user", content: "Hello" }],
      max_tokens: 4096,
    });

    const contentBlock = response.content[0];
    const content = contentBlock.type === "text" ? contentBlock.text : "";

    const usage: TokenUsage = {
      promptTokens:     response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens:      response.usage.input_tokens + response.usage.output_tokens,
    };

    return { content, usage };
  }
}
