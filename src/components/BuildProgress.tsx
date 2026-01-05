"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Check,
  Circle,
  Clock,
  Copy,
  AlertTriangle,
  PartyPopper,
  ChevronDown,
  ChevronRight,
  Terminal,
  MessageSquare,
  X,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  Loader2,
  Square,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBuildProgress } from "@/hooks/useBuildProgress";
import { useBuildStream } from "@/hooks/useBuildStream";
import { BuildOutput } from "@/components/BuildOutput";
import { cn } from "@/lib/utils";

const MCP_CONFIG = {
  mcpServers: {
    landfall: {
      command: "npx",
      args: ["landfall-mcp"],
    },
  },
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(startedAt: string, endedAt?: string): string {
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  const duration = end - start;

  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function StepIcon({
  status,
}: {
  status: "pending" | "current" | "complete" | "failed";
}) {
  switch (status) {
    case "complete":
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
          <Check className="h-3.5 w-3.5" />
        </div>
      );
    case "failed":
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
          <X className="h-3.5 w-3.5" />
        </div>
      );
    case "current":
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground animate-pulse">
          <Circle className="h-3 w-3 fill-current" />
        </div>
      );
    default:
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground/30">
          <Circle className="h-3 w-3 text-muted-foreground/30" />
        </div>
      );
  }
}

function MCPSetupInstructions({ onCopy }: { onCopy: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(MCP_CONFIG, null, 2));
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 text-muted-foreground">
        <Terminal className="h-5 w-5 mt-0.5 shrink-0" />
        <div className="space-y-2">
          <p className="text-sm">
            Connect your AI coding tool (Claude Code, Cursor, or Windsurf) to
            automate the build process.
          </p>
          <p className="text-sm">
            Add this to your MCP configuration:
          </p>
        </div>
      </div>

      <div className="relative">
        <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto">
          <code>{JSON.stringify(MCP_CONFIG, null, 2)}</code>
        </pre>
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-2 right-2"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copy
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Then ask your AI: &quot;Build my Landfall project&quot;
      </p>
    </div>
  );
}

async function updateBuildConfig(updates: {
  mode?: "auto" | "review";
}): Promise<void> {
  const response = await fetch("/api/build-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error("Failed to update build config");
  }
}

function ModeToggle({
  mode,
  onModeChange,
}: {
  mode: "auto" | "review";
  onModeChange: (mode: "auto" | "review") => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Settings2 className="h-4 w-4 text-muted-foreground" />
      <div className="flex rounded-md bg-muted p-0.5">
        <button
          onClick={() => onModeChange("auto")}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded transition-colors",
            mode === "auto"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Auto
        </button>
        <button
          onClick={() => onModeChange("review")}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded transition-colors",
            mode === "review"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Review
        </button>
      </div>
    </div>
  );
}

function ProgressBar({
  percent,
  isComplete,
}: {
  percent: number;
  isComplete: boolean;
}) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">
          {isComplete ? "Build Complete!" : `${percent}% Complete`}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            isComplete ? "bg-green-500" : "bg-primary"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function BuildProgress() {
  const { progress, isLoading, error, refetch } = useBuildProgress();
  const {
    output,
    isRunning: isBuildRunning,
    isStarting,
    isStopping,
    error: buildError,
    currentStep: buildingStep,
    startBuild,
    stopBuild,
    clearOutput,
  } = useBuildStream();
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set());
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [isUpdatingMode, setIsUpdatingMode] = useState(false);
  const [isCliAvailable, setIsCliAvailable] = useState<boolean | null>(null);

  // Check if Claude CLI is available on mount
  useEffect(() => {
    fetch("/api/cli-check")
      .then((res) => res.json())
      .then((data) => setIsCliAvailable(data.available))
      .catch(() => setIsCliAvailable(false));
  }, []);

  const handleModeChange = useCallback(
    async (newMode: "auto" | "review") => {
      if (isUpdatingMode) return;
      setIsUpdatingMode(true);
      try {
        await updateBuildConfig({ mode: newMode });
        await refetch();
      } catch (err) {
        console.error("Failed to update mode:", err);
      } finally {
        setIsUpdatingMode(false);
      }
    },
    [isUpdatingMode, refetch]
  );

  const toggleStep = (step: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(step)) {
      newExpanded.delete(step);
    } else {
      newExpanded.add(step);
    }
    setExpandedSteps(newExpanded);
  };

  const toggleError = (step: number) => {
    const newExpanded = new Set(expandedErrors);
    if (newExpanded.has(step)) {
      newExpanded.delete(step);
    } else {
      newExpanded.add(step);
    }
    setExpandedErrors(newExpanded);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Build Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Build Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Failed to load progress</span>
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={refetch}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return null;
  }

  // No prompts generated yet
  if (!progress.hasPrompts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Build Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Generate your build prompts first to start tracking progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Build complete state
  if (progress.isComplete) {
    const lastStep = progress.steps[progress.steps.length - 1];
    const endTime = lastStep?.completedAt || progress.lastUpdatedAt;

    return (
      <Card className="border-green-500/50 bg-green-500/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-green-500" />
            Build Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProgressBar percent={100} isComplete={true} />

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-500" />
              <span>
                {progress.totalSteps} of {progress.totalSteps} steps
              </span>
            </div>
            {progress.startedAt && endTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>Total time: {formatDuration(progress.startedAt, endTime)}</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllSteps(!showAllSteps)}
              className="text-muted-foreground"
            >
              {showAllSteps ? (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Hide Steps
                </>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4 mr-1" />
                  View All Steps
                </>
              )}
            </Button>
          </div>

          {showAllSteps && (
            <div className="space-y-2 pt-2">
              {progress.steps.map((step) => (
                <div
                  key={step.step}
                  className="flex items-start gap-3 text-sm"
                >
                  <StepIcon status={step.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{step.name}</span>
                      {step.completedAt && (
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(step.completedAt)}
                        </span>
                      )}
                    </div>
                    {step.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {step.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Not started state
  if (!progress.hasProgress && !isBuildRunning && !isStarting) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Build Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-muted mb-3">
              <Terminal className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">Ready to Build</h3>
            <p className="text-sm text-muted-foreground">
              {progress.totalSteps} prompts ready.
            </p>
          </div>

          {/* Build Error Display */}
          {buildError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="text-sm">{buildError}</span>
            </div>
          )}

          {/* Build Button - Primary Action when CLI is available */}
          {isCliAvailable && (
            <div className="space-y-3">
              <Button
                onClick={() => startBuild()}
                disabled={isStarting}
                className="w-full"
                size="lg"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting Build...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Build
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Claude CLI will execute the build steps automatically
              </p>
            </div>
          )}

          {/* Fallback: Manual MCP Setup when CLI unavailable */}
          {isCliAvailable === false && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="text-sm">Claude CLI not found. Use manual setup instead.</span>
              </div>
              <MCPSetupInstructions onCopy={refetch} />
            </div>
          )}

          {/* Loading state while checking CLI */}
          {isCliAvailable === null && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Steps list - show all steps with per-step build buttons */}
          {isCliAvailable && (
            <div className="space-y-1 border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Or build individual steps:
                </h4>
              </div>
              {progress.steps.map((step) => (
                <div
                  key={step.step}
                  className="flex items-start gap-3 py-2 px-2 rounded-lg transition-colors hover:bg-muted/50"
                >
                  <StepIcon status={step.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm truncate">{step.name}</span>
                      {/* Build this step button */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs shrink-0 ml-auto"
                              onClick={() => startBuild(step.step)}
                              disabled={isStarting}
                            >
                              {isStarting && buildingStep === step.step ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Build step {step.step} with Claude</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // In progress state (or build is running)
  const visibleSteps = showAllSteps ? progress.steps : progress.steps.slice(0, 10);
  const hasMoreSteps = progress.steps.length > 10;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Build Progress</span>
            {isBuildRunning && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Running
              </span>
            )}
            {progress.isPaused && !isBuildRunning && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium">
                <Pause className="h-3 w-3" />
                Paused
              </span>
            )}
            {progress.isStale && !progress.isPaused && !isBuildRunning && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-amber-500 text-sm font-normal">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Stalled</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>No updates in 5+ minutes. Check your AI tool.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isBuildRunning && (
              <Button
                variant="outline"
                size="sm"
                onClick={stopBuild}
                disabled={isStopping}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {isStopping ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Stopping...
                  </>
                ) : (
                  <>
                    <Square className="h-3.5 w-3.5 mr-1.5" />
                    Stop Build
                  </>
                )}
              </Button>
            )}
            <ModeToggle mode={progress.mode} onModeChange={handleModeChange} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProgressBar percent={progress.percentComplete} isComplete={false} />

        {/* Build Error Display */}
        {buildError && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="text-sm">{buildError}</span>
          </div>
        )}

        {/* Streaming Output */}
        {(isBuildRunning || output.length > 0) && (
          <BuildOutput
            output={output}
            isRunning={isBuildRunning}
            onClear={clearOutput}
          />
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-green-500" />
            <span>
              {progress.completedSteps} of {progress.totalSteps} steps
            </span>
          </div>
          {progress.failedSteps > 0 && (
            <div className="flex items-center gap-1.5 text-red-500">
              <X className="h-4 w-4" />
              <span>
                {progress.failedSteps} failed
              </span>
            </div>
          )}
          {progress.startedAt && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Elapsed: {formatDuration(progress.startedAt)}</span>
            </div>
          )}
        </div>

        {/* Steps list */}
        <div className="space-y-1">
          {visibleSteps.map((step) => (
            <div
              key={step.step}
              className={cn(
                "flex items-start gap-3 py-2 px-2 rounded-lg transition-colors",
                step.status === "current" && "bg-primary/5",
                step.status === "failed" && "bg-red-500/5"
              )}
            >
              <StepIcon status={step.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-sm truncate",
                      step.status === "complete" && "text-muted-foreground",
                      step.status === "current" && "font-medium",
                      step.status === "failed" && "text-red-600 font-medium"
                    )}
                  >
                    {step.name}
                  </span>
                  {step.completedAt && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatTimestamp(step.completedAt)}
                    </span>
                  )}
                  {step.retryCount > 0 && (
                    <span className="text-xs text-amber-600 shrink-0">
                      (retried {step.retryCount}x)
                    </span>
                  )}
                  {step.notes && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => toggleStep(step.step)}
                            className="shrink-0"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{step.notes}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {step.errors && step.errors.length > 0 && (
                    <button
                      onClick={() => toggleError(step.step)}
                      className="shrink-0 flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>{step.errors.length} error{step.errors.length > 1 ? "s" : ""}</span>
                      {expandedErrors.has(step.step) ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </button>
                  )}
                  {/* Build this step button - show for pending/current/failed steps when CLI available */}
                  {isCliAvailable && step.status !== "complete" && !isBuildRunning && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              startBuild(step.step);
                            }}
                            disabled={isStarting}
                          >
                            {isStarting && buildingStep === step.step ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Build this step with Claude</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {/* Show which step is being built */}
                  {isBuildRunning && buildingStep === step.step && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-green-500/10 text-green-600 shrink-0">
                      <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                      Building
                    </span>
                  )}
                </div>
                {step.status === "current" && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                )}
                {expandedSteps.has(step.step) && step.notes && (
                  <p className="text-xs text-muted-foreground mt-1 bg-muted p-2 rounded">
                    {step.notes}
                  </p>
                )}
                {/* Error details */}
                {expandedErrors.has(step.step) && step.errors && (
                  <div className="mt-2 space-y-2">
                    {step.errors.map((err, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-red-500/10 border border-red-500/20 rounded p-2"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-red-600 font-medium">
                            Error {idx + 1}
                          </span>
                          <span className="text-muted-foreground">
                            {formatTimestamp(err.timestamp)}
                          </span>
                        </div>
                        <p className="text-red-700">{err.message}</p>
                        {err.details && (
                          <pre className="mt-1 text-[10px] text-muted-foreground overflow-x-auto">
                            {JSON.stringify(err.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {hasMoreSteps && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllSteps(!showAllSteps)}
              className="w-full text-muted-foreground"
            >
              {showAllSteps ? (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Show All {progress.steps.length} Steps
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
