import { Style, Tone, Sitemap, Navigation, PageSections } from "./types";

// ============================================================================
// TYPES
// ============================================================================

export type ChangeType = "style" | "tone" | "sitemap" | "navigation" | "page";

export interface ConfigSnapshot {
  style?: Style;
  tone?: Tone;
  sitemap?: Sitemap;
  navigation?: Navigation;
  pages?: Record<string, PageSections>;
}

export interface ChangeEntry {
  id: string;
  timestamp: number;
  type: ChangeType;
  pageSlug?: string; // For page-specific changes
  description: string;
  toolName: string;
  before: ConfigSnapshot;
  after: ConfigSnapshot;
  chatMessageId?: string; // Link to the chat message that caused this change
}

export interface ChangeStack {
  entries: ChangeEntry[];
  currentIndex: number; // Points to the last applied change (-1 if none)
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CHANGE_STACK_KEY = "landfall-change-stack";
const MAX_CHANGES = 50; // Limit history to prevent memory issues

// ============================================================================
// CHANGE STACK FUNCTIONS
// ============================================================================

/**
 * Create an empty change stack
 */
export function createChangeStack(): ChangeStack {
  return {
    entries: [],
    currentIndex: -1,
  };
}

/**
 * Save change stack to localStorage
 */
export function saveChangeStack(stack: ChangeStack): void {
  if (typeof window === "undefined") return;

  try {
    // Keep only the most recent MAX_CHANGES entries
    const trimmedStack: ChangeStack = {
      entries: stack.entries.slice(-MAX_CHANGES),
      currentIndex: Math.min(stack.currentIndex, MAX_CHANGES - 1),
    };
    localStorage.setItem(CHANGE_STACK_KEY, JSON.stringify(trimmedStack));
  } catch (error) {
    console.error("Failed to save change stack:", error);
    // If localStorage is full, try to clear old data
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      clearChangeStack();
    }
  }
}

/**
 * Load change stack from localStorage
 */
export function loadChangeStack(): ChangeStack {
  if (typeof window === "undefined") return createChangeStack();

  try {
    const stored = localStorage.getItem(CHANGE_STACK_KEY);
    if (!stored) return createChangeStack();

    const stack = JSON.parse(stored) as ChangeStack;
    // Validate structure
    if (!Array.isArray(stack.entries) || typeof stack.currentIndex !== "number") {
      return createChangeStack();
    }

    return stack;
  } catch (error) {
    console.error("Failed to load change stack:", error);
    return createChangeStack();
  }
}

/**
 * Clear change stack from localStorage
 */
export function clearChangeStack(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CHANGE_STACK_KEY);
  } catch (error) {
    console.error("Failed to clear change stack:", error);
  }
}

/**
 * Push a new change onto the stack
 * This clears any redo history (entries after currentIndex)
 */
export function pushChange(
  stack: ChangeStack,
  change: Omit<ChangeEntry, "id" | "timestamp">
): ChangeStack {
  const newEntry: ChangeEntry = {
    ...change,
    id: `change_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
  };

  // Remove any entries after currentIndex (clear redo history)
  const entries = stack.entries.slice(0, stack.currentIndex + 1);
  entries.push(newEntry);

  // Keep only the most recent MAX_CHANGES
  const trimmedEntries = entries.slice(-MAX_CHANGES);
  const newIndex = trimmedEntries.length - 1;

  return {
    entries: trimmedEntries,
    currentIndex: newIndex,
  };
}

/**
 * Check if undo is available
 */
export function canUndo(stack: ChangeStack): boolean {
  return stack.currentIndex >= 0;
}

/**
 * Check if redo is available
 */
export function canRedo(stack: ChangeStack): boolean {
  return stack.currentIndex < stack.entries.length - 1;
}

/**
 * Get the number of available undos
 */
export function getUndoCount(stack: ChangeStack): number {
  return stack.currentIndex + 1;
}

/**
 * Get the number of available redos
 */
export function getRedoCount(stack: ChangeStack): number {
  return stack.entries.length - stack.currentIndex - 1;
}

/**
 * Get entries that can be undone
 */
export function getUndoableEntries(stack: ChangeStack, count: number = 1): ChangeEntry[] {
  const start = Math.max(0, stack.currentIndex - count + 1);
  const end = stack.currentIndex + 1;
  return stack.entries.slice(start, end).reverse();
}

/**
 * Get entries that can be redone
 */
export function getRedoableEntries(stack: ChangeStack, count: number = 1): ChangeEntry[] {
  const start = stack.currentIndex + 1;
  const end = Math.min(stack.entries.length, start + count);
  return stack.entries.slice(start, end);
}

/**
 * Perform undo - returns the entry to undo and the new stack state
 */
export function undo(
  stack: ChangeStack,
  count: number = 1
): { entries: ChangeEntry[]; newStack: ChangeStack } | null {
  if (!canUndo(stack)) return null;

  const actualCount = Math.min(count, stack.currentIndex + 1);
  const entries = getUndoableEntries(stack, actualCount);

  return {
    entries,
    newStack: {
      ...stack,
      currentIndex: stack.currentIndex - actualCount,
    },
  };
}

/**
 * Perform redo - returns the entry to redo and the new stack state
 */
export function redo(
  stack: ChangeStack,
  count: number = 1
): { entries: ChangeEntry[]; newStack: ChangeStack } | null {
  if (!canRedo(stack)) return null;

  const actualCount = Math.min(count, stack.entries.length - stack.currentIndex - 1);
  const entries = getRedoableEntries(stack, actualCount);

  return {
    entries,
    newStack: {
      ...stack,
      currentIndex: stack.currentIndex + actualCount,
    },
  };
}

/**
 * Get recent change history for display
 */
export function getRecentChanges(
  stack: ChangeStack,
  limit: number = 10
): ChangeEntry[] {
  const end = stack.currentIndex + 1;
  const start = Math.max(0, end - limit);
  return stack.entries.slice(start, end).reverse();
}

/**
 * Get all changes made in the current session (since page load or last clear)
 */
export function getSessionChanges(stack: ChangeStack): ChangeEntry[] {
  return stack.entries.slice(0, stack.currentIndex + 1);
}

/**
 * Format a change entry for display
 */
export function formatChangeDescription(entry: ChangeEntry): string {
  return entry.description || `${entry.toolName} change`;
}

/**
 * Deep clone a config snapshot for storing before/after states
 */
export function cloneConfigSnapshot(snapshot: ConfigSnapshot): ConfigSnapshot {
  return JSON.parse(JSON.stringify(snapshot));
}

/**
 * Create a snapshot of the current config state for a specific type
 */
export function createSnapshot(
  type: ChangeType,
  currentConfig: {
    style?: Style | null;
    tone?: Tone | null;
    sitemap?: Sitemap | null;
    navigation?: Navigation | null;
    pages?: Record<string, PageSections>;
  },
  pageSlug?: string
): ConfigSnapshot {
  switch (type) {
    case "style":
      return { style: currentConfig.style ? cloneConfigSnapshot({ style: currentConfig.style }).style : undefined };
    case "tone":
      return { tone: currentConfig.tone ? cloneConfigSnapshot({ tone: currentConfig.tone }).tone : undefined };
    case "sitemap":
      return { sitemap: currentConfig.sitemap ? cloneConfigSnapshot({ sitemap: currentConfig.sitemap }).sitemap : undefined };
    case "navigation":
      return { navigation: currentConfig.navigation ? cloneConfigSnapshot({ navigation: currentConfig.navigation }).navigation : undefined };
    case "page":
      if (pageSlug && currentConfig.pages?.[pageSlug]) {
        return { pages: { [pageSlug]: cloneConfigSnapshot({ pages: { [pageSlug]: currentConfig.pages[pageSlug] } }).pages![pageSlug] } };
      }
      return { pages: {} };
    default:
      return {};
  }
}
