import { Style, Tone, Sitemap, Navigation, PageSections } from "./types";

// ============================================================================
// TYPES
// ============================================================================

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolResults?: ToolResult[];
  timestamp: number;
}

export interface ToolResult {
  toolName: string;
  resultType: "style" | "tone" | "sitemap" | "navigation" | "page";
  changes: Partial<Style | Tone | Sitemap | Navigation | PageSections>;
  pageSlug?: string;
  message: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CHAT_HISTORY_KEY = "landfall-chat-history";
const MAX_MESSAGES = 100; // Limit to prevent localStorage overflow

// ============================================================================
// CHAT HISTORY FUNCTIONS
// ============================================================================

/**
 * Save chat messages to localStorage
 */
export function saveChatHistory(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;

  try {
    // Keep only the last MAX_MESSAGES
    const trimmedMessages = messages.slice(-MAX_MESSAGES);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(trimmedMessages));
  } catch (error) {
    console.error("Failed to save chat history:", error);
    // If localStorage is full, try to clear old data
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      clearChatHistory();
    }
  }
}

/**
 * Load chat messages from localStorage
 */
export function loadChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!stored) return [];

    const messages = JSON.parse(stored) as ChatMessage[];
    // Validate structure
    if (!Array.isArray(messages)) return [];

    return messages.filter(
      (m) =>
        typeof m.id === "string" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    );
  } catch (error) {
    console.error("Failed to load chat history:", error);
    return [];
  }
}

/**
 * Clear chat history from localStorage
 */
export function clearChatHistory(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CHAT_HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear chat history:", error);
  }
}

/**
 * Add a message to chat history
 */
export function addMessageToHistory(
  messages: ChatMessage[],
  message: Omit<ChatMessage, "timestamp">
): ChatMessage[] {
  const newMessage: ChatMessage = {
    ...message,
    timestamp: Date.now(),
  };
  return [...messages, newMessage];
}

/**
 * Update the last message in history (for streaming)
 */
export function updateLastMessage(
  messages: ChatMessage[],
  updates: Partial<ChatMessage>
): ChatMessage[] {
  if (messages.length === 0) return messages;

  return messages.map((m, i) =>
    i === messages.length - 1 ? { ...m, ...updates } : m
  );
}
