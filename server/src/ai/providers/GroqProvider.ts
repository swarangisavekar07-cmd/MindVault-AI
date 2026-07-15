import Groq from "groq-sdk";
import { AIMessage, AIProvider, AIProviderName, TokenUsage } from "../../types/ai";

// ─── Groq Provider ────────────────────────────────────────────────────────────
// Uses the official groq-sdk package.
// Groq runs open-source models (LLaMA, Mixtral, Gemma) at very high speed
// using custom LPU (Language Processing Unit) inference hardware.
//
// Recommended models for educational conversations:
//   llama-3.3-70b-versatile  — Best quality, handles complex explanations
//   llama3-8b-8192           — Fast, good for quick Q&A
//   mixtral-8x7b-32768       — Great context window (32k tokens) for long notes
//   gemma2-9b-it             — Efficient instruction-following
//
// Get your free API key at: https://console.groq.com

export class GroqProvider implements AIProvider {
  readonly name: AIProviderName = "groq";
  private client: Groq;
  public modelName: string;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set in environment variables.");
    this.client = new Groq({ apiKey });
    this.modelName = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  }

  async chat(
    messages: AIMessage[],
    systemPrompt: string
  ): Promise<{ content: string; usage?: TokenUsage }> {
    // Map AIMessage[] → Groq ChatCompletionMessageParam[]
    // Groq uses the same message format as OpenAI Chat Completions API
    const groqMessages: Groq.Chat.ChatCompletionMessageParam[] = [
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
      messages: groqMessages,
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 0.95,
      stream: false,
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
