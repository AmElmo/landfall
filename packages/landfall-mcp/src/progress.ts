import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

export interface StepProgress {
  completedAt: string;
  notes?: string;
}

export interface BuildProgress {
  startedAt: string;
  lastUpdatedAt: string;
  completedSteps: Record<number, StepProgress>;
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

  progress.completedSteps[step] = {
    completedAt: new Date().toISOString(),
    notes,
  };

  saveProgress(projectPath, progress);
  return progress;
}

export function getCompletedSteps(projectPath: string): number[] {
  const progress = loadProgress(projectPath);

  if (!progress) {
    return [];
  }

  return Object.keys(progress.completedSteps)
    .map(Number)
    .sort((a, b) => a - b);
}

export function isStepComplete(projectPath: string, step: number): boolean {
  const progress = loadProgress(projectPath);
  return progress?.completedSteps[step] !== undefined;
}
