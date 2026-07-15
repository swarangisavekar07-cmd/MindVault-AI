import OpenAI from "openai";
import { AIMessage, AIProvider, AIProviderName, TokenUsage } from "../../types/ai";

// ─── OpenAI GPT Provider ──────────────────────────────────────────────────────
// Uses official openai SDK
// Supported models: gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo

export class OpenAIProvider implements AIProvider {
  readonly name: AIProviderName = "openai";
  private client: OpenAI;
  public modelName: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set in environment variables.");
    this.client = new OpenAI({ apiKey });
    this.modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
  }

  async chat(
    messages: AIMessage[],
    systemPrompt: string
  ): Promise<{ content: string; usage?: TokenUsage }> {
    // Map AIMessage[] → OpenAI ChatCompletionMessageParam[]
    const openAIMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages
        .filter(m => m.role !== "system")
        .map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
    ];

    const completion = await this.client.chat.completions.create({
      model: this.modelName,
      messages: openAIMessages,
      max_tokens: 4096,
      temperature: 0.7,
    });

    const choice = completion.choices[0];
    const content = choice.message.content || "";

    const usage: TokenUsage | undefined = completion.usage
      ? {
          promptTokens:     completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens:      completion.usage.total_tokens,
        }
      : undefined;

    return { content, usage };
  }
}
