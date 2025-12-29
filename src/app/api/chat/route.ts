import OpenAI from "openai";
import { NextRequest } from "next/server";
import {
  styleTools,
  processToolCall,
  generateSystemPrompt,
} from "@/lib/chat-tools";
import { Style } from "@/lib/types";

// Default model - can be changed to any OpenRouter-supported model
const DEFAULT_MODEL = "openai/gpt-4o-mini";

// Lazy initialization of OpenAI client to avoid build-time errors
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }
  return openaiClient;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  style: Style;
  model?: string; // Optional model override
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, style, model = DEFAULT_MODEL } = body;

    if (!messages || !style) {
      return new Response(
        JSON.stringify({ error: "Missing messages or style" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = generateSystemPrompt(style);

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let currentStyle = { ...style };
          let continueLoop = true;
          let currentMessages: OpenAI.ChatCompletionMessageParam[] = [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
          ];

          while (continueLoop) {
            const openai = getOpenAIClient();
            const response = await openai.chat.completions.create({
              model,
              max_tokens: 1024,
              messages: currentMessages,
              tools: styleTools,
              tool_choice: "auto",
            });

            const choice = response.choices[0];
            const message = choice.message;

            // Stream any text content
            if (message.content) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "text", content: message.content })}\n\n`
                )
              );
            }

            // Process tool calls if any
            if (message.tool_calls && message.tool_calls.length > 0) {
              const toolResults: OpenAI.ChatCompletionToolMessageParam[] = [];

              for (const toolCall of message.tool_calls) {
                // Only process function-type tool calls
                if (toolCall.type !== "function") continue;

                const toolInput = JSON.parse(toolCall.function.arguments);
                const changes = processToolCall(
                  toolCall.function.name,
                  toolInput,
                  currentStyle
                );

                // Merge changes into current style for subsequent tool calls
                currentStyle = { ...currentStyle, ...changes };

                // Stream tool result to client so they can apply changes
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "tool_result",
                      toolName: toolCall.function.name,
                      changes,
                    })}\n\n`
                  )
                );

                toolResults.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: `Successfully applied ${toolCall.function.name}: ${JSON.stringify(changes)}`,
                });
              }

              // If there were tool calls, continue the conversation
              if (choice.finish_reason === "tool_calls") {
                currentMessages = [
                  ...currentMessages,
                  message,
                  ...toolResults,
                ];
                // Continue the loop to get the final response
                continue;
              }
            }

            // Check if we should continue
            if (choice.finish_reason === "stop" || choice.finish_reason !== "tool_calls") {
              continueLoop = false;
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: "An error occurred" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
