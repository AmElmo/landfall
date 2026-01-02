import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

export interface StepError {
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface StepProgress {
  completedAt?: string;
  notes?: string;
  errors?: StepError[];
  retryCount?: number;
  status: "pending" | "in_progress" | "complete" | "failed";
}

export interface BuildProgress {
  startedAt: string;
  lastUpdatedAt: string;
  completedSteps: Record<number, StepProgress>;
  isPaused?: boolean;
  pausedAt?: number | null;
}

const PROGRESS_FILE = ".progress.json";

function getProgressPath(projectPath: string): string {
  return join(projectPath, "landfall", "prompts", PROGRESS_FILE);
}

export function loadProgress(projectPath: string): BuildProgress | null {
  const progressPath = getProgressPath(projectPath);

  if (!existsSync(progressPath)) {
    return null;
  }

  try {
    const content = readFileSync(progressPath, "utf-8");
    return JSON.parse(content) as BuildProgress;
  } catch {
    return null;
  }
}

export function saveProgress(projectPath: string, progress: BuildProgress): void {
  const progressPath = getProgressPath(projectPath);
  progress.lastUpdatedAt = new Date().toISOString();
  writeFileSync(progressPath, JSON.stringify(progress, null, 2), "utf-8");
}

export function initProgress(projectPath: string): BuildProgress {
  const progress: BuildProgress = {
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    completedSteps: {},
  };
  saveProgress(projectPath, progress);
  return progress;
}

export function markStepComplete(
  projectPath: string,
  step: number,
  notes?: string
): BuildProgress {
  let progress = loadProgress(projectPath);

  if (!progress) {
    progress = initProgress(projectPath);
  }

  const existingStep = progress.completedSteps[step];
  progress.completedSteps[step] = {
    ...existingStep,
    completedAt: new Date().toISOString(),
    notes,
    status: "complete",
  };

  saveProgress(projectPath, progress);
  return progress;
}

export function markStepInProgress(
  projectPath: string,
  step: number
): BuildProgress {
  let progress = loadProgress(projectPath);

  if (!progress) {
    progress = initProgress(projectPath);
  }

  const existingStep = progress.completedSteps[step];
  progress.completedSteps[step] = {
    ...existingStep,
    status: "in_progress",
  };

  saveProgress(projectPath, progress);
  return progress;
}

export function reportStepError(
  projectPath: string,
  step: number,
  error: string,
  details?: Record<string, unknown>
): BuildProgress {
  let progress = loadProgress(projectPath);

  if (!progress) {
    progress = initProgress(projectPath);
  }

  const existingStep = progress.completedSteps[step] || { status: "pending" };
  const newError: StepError = {
    message: error,
    details,
    timestamp: new Date().toISOString(),
  };

  progress.completedSteps[step] = {
    ...existingStep,
    status: "failed",
    errors: [...(existingStep.errors || []), newError],
  };

  saveProgress(projectPath, progress);
  return progress;
}

export function retryStep(
  projectPath: string,
  step: number
): BuildProgress {
  let progress = loadProgress(projectPath);

  if (!progress) {
    progress = initProgress(projectPath);
  }

  const existingStep = progress.completedSteps[step] || { status: "pending" };

  progress.completedSteps[step] = {
    ...existingStep,
    status: "pending",
    retryCount: (existingStep.retryCount || 0) + 1,
    // Keep error history for debugging
  };

  saveProgress(projectPath, progress);
  return progress;
}

export function pauseBuild(projectPath: string, step?: number): BuildProgress {
  let progress = loadProgress(projectPath);

  if (!progress) {
    progress = initProgress(projectPath);
  }

  progress.isPaused = true;
  progress.pausedAt = step || null;

  saveProgress(projectPath, progress);
  return progress;
}

export function resumeBuild(projectPath: string): BuildProgress {
  let progress = loadProgress(projectPath);

  if (!progress) {
    progress = initProgress(projectPath);
  }

  progress.isPaused = false;
  progress.pausedAt = null;

  saveProgress(projectPath, progress);
  return progress;
}

export function getCompletedSteps(projectPath: string): number[] {
  const progress = loadProgress(projectPath);

  if (!progress) {
    return [];
  }

  return Object.entries(progress.completedSteps)
    .filter(([, step]) => step.status === "complete")
    .map(([key]) => Number(key))
    .sort((a, b) => a - b);
}

export function getFailedSteps(projectPath: string): number[] {
  const progress = loadProgress(projectPath);

  if (!progress) {
    return [];
  }

  return Object.entries(progress.completedSteps)
    .filter(([, step]) => step.status === "failed")
    .map(([key]) => Number(key))
    .sort((a, b) => a - b);
}

export function isStepComplete(projectPath: string, step: number): boolean {
  const progress = loadProgress(projectPath);
  return progress?.completedSteps[step]?.status === "complete";
}

export function getStepStatus(projectPath: string, step: number): StepProgress["status"] {
  const progress = loadProgress(projectPath);
  return progress?.completedSteps[step]?.status || "pending";
}
