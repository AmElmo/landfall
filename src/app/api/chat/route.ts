import OpenAI from "openai";
import { NextRequest } from "next/server";
import {
  completeToolSet,
  processAllToolCalls,
  generateSystemPrompt,
  ChatContext,
  ToolResult,
} from "@/lib/chat-tools";
import {
  Style,
  Tone,
  Sitemap,
  Navigation,
  PageSections,
} from "@/lib/types";

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

// Full context request with all configuration
interface ChatRequest {
  messages: ChatMessage[];
  style: Style;
  tone?: Tone;
  sitemap?: Sitemap;
  navigation?: Navigation;
  pages?: Record<string, PageSections>;
  currentStep?: number;
  currentPageSlug?: string;
  model?: string;
}

// Default empty values for backwards compatibility
const defaultTone: Tone = {
  toneKeywords: [],
  brandPersonality: [],
  targetAudience: "",
  guidelines: { do: [], dont: [] },
  examplePhrases: [],
  inspirations: [],
};

const defaultSitemap: Sitemap = {
  pages: [
    {
      id: "page_home",
      name: "Home",
      slug: "/",
      isHomepage: true,
      metaTitle: "Home",
      metaDescription: "",
    },
  ],
};

const defaultNavigation: Navigation = {
  navbar: {
    layout: "logo-left-links-right",
    logo: { type: "text", value: "Logo", imagePath: null },
    links: [],
    cta: [],
  },
  footer: {
    layout: "columns-simple",
    columns: [],
    social: [],
    copyright: "",
    newsletter: {
      enabled: false,
      heading: "",
      placeholder: "",
      buttonText: "",
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const {
      messages,
      style,
      tone = defaultTone,
      sitemap = defaultSitemap,
      navigation = defaultNavigation,
      pages = {},
      currentStep = 1,
      currentPageSlug = "/",
      model = DEFAULT_MODEL,
    } = body;

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

    // Build the full context
    const context: ChatContext = {
      style,
      tone,
      sitemap,
      navigation,
      pages,
      currentStep,
      currentPageSlug,
    };

    const systemPrompt = generateSystemPrompt(context);

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Mutable context for tracking changes during the conversation
          let currentContext: ChatContext = { ...context };
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
              max_tokens: 2048, // Increased for complex responses
              messages: currentMessages,
              tools: completeToolSet,
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

              // List of tools that are handled client-side
              const clientSideTools = ["undo_last_change", "redo_change", "get_change_history", "clear_conversation"];

              for (const toolCall of message.tool_calls) {
                // Only process function-type tool calls
                if (toolCall.type !== "function") continue;

                const toolInput = JSON.parse(toolCall.function.arguments);
                const toolName = toolCall.function.name;

                // Handle client-side tools (undo/redo/history)
                if (clientSideTools.includes(toolName)) {
                  // Stream the tool call to client for handling
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        type: "tool_result",
                        toolName: toolName,
                        ...toolInput, // Include count, limit, etc.
                      })}\n\n`
                    )
                  );

                  // Provide a response so the model knows it succeeded
                  toolResults.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: `Successfully executed ${toolName}`,
                  });
                  continue;
                }

                const result = processAllToolCalls(
                  toolName,
                  toolInput,
                  currentContext
                );

                if (result) {
                  // Update context based on result type
                  currentContext = applyToolResult(currentContext, result);

                  // Stream tool result to client so they can apply changes
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        type: "tool_result",
                        toolName: toolName,
                        resultType: result.type,
                        changes: result.changes,
                        pageSlug: result.pageSlug,
                        message: result.message,
                      })}\n\n`
                    )
                  );

                  toolResults.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: `Successfully applied ${toolName}: ${result.message}`,
                  });
                } else {
                  // Tool not found or failed
                  toolResults.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: `Tool ${toolName} not recognized or failed to execute`,
                  });
                }
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
            if (choice.finish_reason !== "tool_calls") {
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

// Apply tool result to update context
function applyToolResult(context: ChatContext, result: ToolResult): ChatContext {
  switch (result.type) {
    case "style":
      return {
        ...context,
        style: { ...context.style, ...result.changes } as Style,
      };
    case "tone":
      return {
        ...context,
        tone: { ...context.tone, ...result.changes } as Tone,
      };
    case "sitemap":
      return {
        ...context,
        sitemap: { ...context.sitemap, ...result.changes } as Sitemap,
      };
    case "navigation":
      return {
        ...context,
        navigation: { ...context.navigation, ...result.changes } as Navigation,
      };
    case "page":
      if (result.pageSlug) {
        return {
          ...context,
          pages: {
            ...context.pages,
            [result.pageSlug]: {
              ...context.pages[result.pageSlug],
              ...result.changes,
            } as PageSections,
          },
        };
      }
      return context;
    default:
      return context;
  }
}
