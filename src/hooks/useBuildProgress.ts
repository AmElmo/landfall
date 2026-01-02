"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ProgressResponse } from "@/app/api/progress/route";

interface UseBuildProgressOptions {
  // Polling interval in milliseconds (default: 2000ms during active build)
  pollInterval?: number;
  // Whether to enable polling (default: true)
  enabled?: boolean;
}

interface UseBuildProgressResult {
  progress: ProgressResponse | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const DEFAULT_POLL_INTERVAL = 2000; // 2 seconds

export function useBuildProgress(
  options: UseBuildProgressOptions = {}
): UseBuildProgressResult {
  const { pollInterval = DEFAULT_POLL_INTERVAL, enabled = true } = options;

  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch("/api/progress");

      if (!response.ok) {
        throw new Error(`Failed to fetch progress: ${response.statusText}`);
      }

      const data: ProgressResponse = await response.json();

      if (mountedRef.current) {
        setProgress(data);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;

    if (enabled) {
      fetchProgress();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [enabled, fetchProgress]);

  // Set up polling
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Only poll if:
    // 1. We have prompts
    // 2. Build is not complete
    // 3. Build has started (has progress)
    const shouldPoll =
      progress?.hasPrompts && !progress?.isComplete && progress?.hasProgress;

    if (shouldPoll) {
      intervalRef.current = setInterval(fetchProgress, pollInterval);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    enabled,
    pollInterval,
    fetchProgress,
    progress?.hasPrompts,
    progress?.isComplete,
    progress?.hasProgress,
  ]);

  return {
    progress,
    isLoading,
    error,
    refetch: fetchProgress,
  };
}
