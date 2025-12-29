"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useLandfall } from "@/lib/context";
import {
  Style,
  Tone,
  Sitemap,
  Navigation,
  PageSections,
} from "@/lib/types";

// Tool result types returned from the API
type ToolResultType = "style" | "tone" | "sitemap" | "navigation" | "page";

interface ToolResult {
  toolName: string;
  resultType: ToolResultType;
  changes: Partial<Style | Tone | Sitemap | Navigation | PageSections>;
  pageSlug?: string;
  message: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolResults?: ToolResult[];
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep?: number;
  currentPageSlug?: string;
}

export function ChatPanel({
  isOpen,
  onClose,
  currentStep = 1,
  currentPageSlug = "/",
}: ChatPanelProps) {
  const {
    style,
    tone,
    sitemap,
    navigation,
    pages,
    updateStyle,
    updateTone,
    updateSitemap,
    updateNavigation,
    updatePage,
    refreshData,
  } = useLandfall();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Apply tool result based on its type
  const applyToolResult = async (result: ToolResult) => {
    try {
      switch (result.resultType) {
        case "style":
          await updateStyle(result.changes as Partial<Style>);
          break;
        case "tone":
          await updateTone(result.changes as Partial<Tone>);
          break;
        case "sitemap":
          await updateSitemap(result.changes as Partial<Sitemap>);
          break;
        case "navigation":
          await updateNavigation(result.changes as Partial<Navigation>);
          break;
        case "page":
          if (result.pageSlug) {
            await updatePage(
              result.pageSlug,
              result.changes as Partial<PageSections>
            );
          }
          break;
      }
    } catch (error) {
      console.error("Failed to apply tool result:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !style) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          style,
          tone,
          sitemap,
          navigation,
          pages,
          currentStep,
          currentPageSlug,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let assistantContent = "";
      const toolResults: ToolResult[] = [];
      const assistantMessageId = (Date.now() + 1).toString();

      // Add empty assistant message to start streaming into
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: "assistant", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "text") {
                assistantContent += parsed.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: assistantContent }
                      : m
                  )
                );
              } else if (parsed.type === "tool_result") {
                // Apply changes based on result type
                if (parsed.changes && Object.keys(parsed.changes).length > 0) {
                  const toolResult: ToolResult = {
                    toolName: parsed.toolName,
                    resultType: parsed.resultType,
                    changes: parsed.changes,
                    pageSlug: parsed.pageSlug,
                    message: parsed.message,
                  };
                  await applyToolResult(toolResult);
                  toolResults.push(toolResult);
                }
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Update final message with tool results
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: assistantContent, toolResults }
            : m
        )
      );

      // Refresh all data to ensure UI is in sync
      await refreshData();
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Get suggestions based on current step
  const getSuggestions = () => {
    switch (currentStep) {
      case 1: // Style
        return [
          "Make the primary color navy blue",
          "I want a warmer color palette",
          "Use Playfair Display for headings",
          "Make it more minimal and modern",
        ];
      case 2: // Tone
        return [
          "We're a B2B SaaS targeting enterprise customers",
          "The tone should be professional but friendly",
          "Add some example phrases that fit our brand",
          "What do's and don'ts should we follow?",
        ];
      case 3: // Sitemap
        return [
          "Add a pricing page",
          "I need an about page and a contact page",
          "What pages do you recommend for a SaaS?",
          "Remove the blog page",
        ];
      case 4: // Sections
        return [
          "Add a testimonials section",
          "I need a hero, features, and pricing section",
          "Move the CTA section above the FAQ",
          "Remove the team section",
        ];
      case 5: // Copy & Visuals
        return [
          "For the hero, emphasize speed and simplicity",
          "The features section should highlight security",
          "Add visual instructions for a dark, modern look",
          "What copy angle would work best for the CTA?",
        ];
      case 6: // Navigation
        return [
          "Add a link to our documentation",
          "Add a Resources column to the footer",
          "Change the CTA button to say 'Start Free Trial'",
          "Add our Twitter and LinkedIn links",
        ];
      default:
        return [
          "Help me improve the design",
          "What would you suggest?",
          "Make it look more professional",
          "I want a bold, modern style",
        ];
    }
  };

  // Get step-specific placeholder
  const getPlaceholder = () => {
    switch (currentStep) {
      case 1:
        return "Describe the style you want...";
      case 2:
        return "Tell me about your brand voice...";
      case 3:
        return "What pages do you need?";
      case 4:
        return "What sections should this page have?";
      case 5:
        return "Describe the content and visuals...";
      case 6:
        return "How should the navigation look?";
      default:
        return "Ask me anything about your landing page...";
    }
  };

  // Format tool result for display
  const formatToolResult = (result: ToolResult) => {
    const toolName = result.toolName
      .replace("update_", "")
      .replace("add_", "added ")
      .replace("remove_", "removed ")
      .replace(/_/g, " ");
    return result.message || `Applied: ${toolName}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-background border-l shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Design Assistant</h2>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                Hi! I can help you design your landing page.
              </p>
              <p className="text-sm mt-2">Try saying things like:</p>
              <div className="mt-3 space-y-2">
                {getSuggestions().map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="block w-full text-left text-xs bg-muted hover:bg-muted/80 rounded-lg px-3 py-2 transition-colors"
                  >
                    &ldquo;{suggestion}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted rounded-bl-md"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.toolResults && message.toolResults.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-current/10 text-xs opacity-75 space-y-1">
                    {message.toolResults.map((result, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="text-green-500">✓</span>
                        {formatToolResult(result)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            className="flex-1 resize-none rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px] max-h-[120px]"
            rows={1}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="rounded-xl h-[44px] w-[44px]"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
