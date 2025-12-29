"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Toaster, toast } from "sonner";
import { Undo2, Check } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export type ChangeType = "style" | "tone" | "sitemap" | "navigation" | "page";

export interface ChangeNotification {
  id: string;
  type: ChangeType;
  message: string;
  timestamp: number;
  canUndo: boolean;
}

interface ChangeIndicatorProps {
  onUndo?: () => Promise<string | void>;
}

// ============================================================================
// CHANGE TOAST COMPONENT
// ============================================================================

export function ChangeIndicator({ onUndo }: ChangeIndicatorProps) {
  return <Toaster position="bottom-right" expand={false} richColors closeButton />;
}

// ============================================================================
// TOAST FUNCTIONS
// ============================================================================

/**
 * Show a toast notification for a change with an optional undo button
 */
export function showChangeToast(
  message: string,
  type: ChangeType,
  onUndo?: () => Promise<string | void>
) {
  const toastId = toast.success(message, {
    duration: 4000,
    icon: <Check className="h-4 w-4" />,
    action: onUndo
      ? {
          label: "Undo",
          onClick: async () => {
            toast.dismiss(toastId);
            if (onUndo) {
              await onUndo();
            }
          },
        }
      : undefined,
    className: "change-toast",
  });

  return toastId;
}

/**
 * Show a toast notification for an undo action
 */
export function showUndoToast(message: string) {
  toast.info(message, {
    duration: 3000,
    icon: <Undo2 className="h-4 w-4" />,
  });
}

/**
 * Show a toast notification for a redo action
 */
export function showRedoToast(message: string) {
  toast.info(message, {
    duration: 3000,
    icon: <Check className="h-4 w-4" />,
  });
}

/**
 * Show an error toast
 */
export function showErrorToast(message: string) {
  toast.error(message, {
    duration: 4000,
  });
}

/**
 * Show an info toast
 */
export function showInfoToast(message: string) {
  toast(message, {
    duration: 3000,
  });
}

// ============================================================================
// HIGHLIGHT ANIMATION HOOK
// ============================================================================

interface UseHighlightReturn {
  isHighlighted: boolean;
  triggerHighlight: () => void;
}

/**
 * Hook to trigger a brief highlight animation on an element
 */
export function useHighlight(duration: number = 1000): UseHighlightReturn {
  const [isHighlighted, setIsHighlighted] = useState(false);

  const triggerHighlight = useCallback(() => {
    setIsHighlighted(true);
    setTimeout(() => setIsHighlighted(false), duration);
  }, [duration]);

  return { isHighlighted, triggerHighlight };
}

// ============================================================================
// CHANGE HIGHLIGHT WRAPPER
// ============================================================================

interface ChangeHighlightProps {
  children: React.ReactNode;
  isHighlighted: boolean;
  className?: string;
}

/**
 * Wrapper component that adds a highlight animation when a change is made
 */
export function ChangeHighlight({
  children,
  isHighlighted,
  className = "",
}: ChangeHighlightProps) {
  return (
    <div
      className={`transition-all duration-300 ${
        isHighlighted
          ? "ring-2 ring-primary ring-offset-2 animate-pulse"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
