"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface OutputLine {
  type: "stdout" | "stderr";
  text: string;
  timestamp: Date;
}

export interface UseBuildStreamReturn {
  output: OutputLine[];
  isRunning: boolean;
  isStarting: boolean;
  isStopping: boolean;
  error: string | null;
  currentStep: number | null;
  startBuild: (step?: number) => void;
  stopBuild: () => Promise<void>;
  clearOutput: () => void;
}

export function useBuildStream(): UseBuildStreamReturn {
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startBuild = useCallback((step?: number) => {
    if (isRunning || isStarting) return;

    setIsStarting(true);
    setError(null);
    setOutput([]);
    setCurrentStep(step ?? null);

    const url = step ? `/api/build-stream?step=${step}` : "/api/build-stream";
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("started", (event) => {
      setIsStarting(false);
      setIsRunning(true);
    });

    eventSource.addEventListener("output", (event) => {
      const data = JSON.parse(event.data) as { type: "stdout" | "stderr"; text: string };
      setOutput((prev) => [
        ...prev,
        {
          type: data.type,
          text: data.text,
          timestamp: new Date(),
        },
      ]);
    });

    eventSource.addEventListener("error", (event) => {
      // Check if it's an EventSource error or our custom error event
      if (event instanceof MessageEvent) {
        const data = JSON.parse(event.data) as { message: string };
        setError(data.message);
      }
      setIsRunning(false);
      setIsStarting(false);
      cleanup();
    });

    eventSource.addEventListener("complete", (event) => {
      const data = JSON.parse(event.data) as { exitCode: number };
      setIsRunning(false);
      setCurrentStep(null);
      if (data.exitCode !== 0) {
        setError(`Build process exited with code ${data.exitCode}`);
      }
      cleanup();
    });

    eventSource.addEventListener("stopped", () => {
      setIsRunning(false);
      setIsStopping(false);
      setCurrentStep(null);
      cleanup();
    });

    // Handle connection errors
    eventSource.onerror = () => {
      if (eventSource.readyState === EventSource.CLOSED) {
        setIsRunning(false);
        setIsStarting(false);
        cleanup();
      }
    };
  }, [isRunning, isStarting, cleanup]);

  const stopBuild = useCallback(async () => {
    if (!isRunning || isStopping) return;

    setIsStopping(true);
    setError(null);

    try {
      const response = await fetch("/api/build-stop", { method: "POST" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to stop build");
      }
      // The SSE stream will send "stopped" event which triggers cleanup
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stop build");
      setIsStopping(false);
    }
  }, [isRunning, isStopping]);

  const clearOutput = useCallback(() => {
    setOutput([]);
    setError(null);
  }, []);

  return {
    output,
    isRunning,
    isStarting,
    isStopping,
    error,
    currentStep,
    startBuild,
    stopBuild,
    clearOutput,
  };
}
