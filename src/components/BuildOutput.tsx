"use client";

import { useEffect, useRef } from "react";
import { Copy, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { OutputLine } from "@/hooks/useBuildStream";

interface BuildOutputProps {
  output: OutputLine[];
  isRunning: boolean;
  onClear: () => void;
}

export function BuildOutput({ output, isRunning, onClear }: BuildOutputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [output, autoScroll]);

  // Detect manual scroll to disable auto-scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  const copyOutput = async () => {
    const text = output.map((line) => line.text).join("");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (output.length === 0 && !isRunning) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-slate-400 ml-2">Claude Output</span>
          {isRunning && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            onClick={copyOutput}
            disabled={output.length === 0}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            onClick={onClear}
            disabled={output.length === 0}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Output area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="p-4 h-64 overflow-y-auto font-mono text-sm leading-relaxed"
      >
        {output.length === 0 ? (
          <div className="text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-600 animate-pulse" />
            Starting build...
          </div>
        ) : (
          output.map((line, index) => (
            <div
              key={index}
              className={cn(
                "whitespace-pre-wrap break-all",
                line.type === "stderr" ? "text-orange-400" : "text-slate-300"
              )}
            >
              {line.text}
            </div>
          ))
        )}
        {isRunning && output.length > 0 && (
          <span className="inline-block w-2 h-4 bg-slate-300 animate-pulse ml-0.5" />
        )}
      </div>
    </div>
  );
}
