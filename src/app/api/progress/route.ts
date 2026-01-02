import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

interface StepError {
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

interface StepProgress {
  completedAt?: string;
  notes?: string;
  errors?: StepError[];
  retryCount?: number;
  status: "pending" | "in_progress" | "complete" | "failed";
}

interface ProgressFile {
  startedAt: string;
  lastUpdatedAt: string;
  completedSteps: Record<string, StepProgress>;
  isPaused?: boolean;
  pausedAt?: number | null;
}

interface BuildConfig {
  mode: "auto" | "review";
  validationEnabled: boolean;
  maxRetries: number;
}

interface BuildSequence {
  generatedAt: string;
  totalPrompts: number;
  prompts: Array<{
    step: number;
    name: string;
    description: string;
    prompt: string;
  }>;
}

export interface StepInfo {
  step: number;
  name: string;
  description: string;
  status: "pending" | "current" | "complete" | "failed";
  completedAt: string | null;
  notes: string | null;
  errors: StepError[] | null;
  retryCount: number;
}

export interface ProgressResponse {
  hasPrompts: boolean;
  hasProgress: boolean;
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  currentStep: number | null;
  percentComplete: number;
  isComplete: boolean;
  isStale: boolean;
  isPaused: boolean;
  pausedAt: number | null;
  mode: "auto" | "review";
  maxRetries: number;
  startedAt: string | null;
  lastUpdatedAt: string | null;
  steps: StepInfo[];
}

function getLandfallDir(): string {
  return path.join(
    process.env.LANDFALL_PROJECT_PATH || process.cwd(),
    "landfall"
  );
}

const DEFAULT_CONFIG: BuildConfig = {
  mode: "auto",
  validationEnabled: false,
  maxRetries: 3,
};

export async function GET() {
  try {
    const landfallDir = getLandfallDir();
    const promptsDir = path.join(landfallDir, "prompts");
    const buildSequencePath = path.join(promptsDir, "build-sequence.json");
    const progressPath = path.join(promptsDir, ".progress.json");
    const configPath = path.join(promptsDir, ".build-config.json");

    // Check if build-sequence.json exists
    let buildSequence: BuildSequence | null = null;
    try {
      const content = await fs.readFile(buildSequencePath, "utf-8");
      buildSequence = JSON.parse(content);
    } catch {
      // No prompts generated yet
    }

    if (!buildSequence) {
      const response: ProgressResponse = {
        hasPrompts: false,
        hasProgress: false,
        totalSteps: 0,
        completedSteps: 0,
        failedSteps: 0,
        currentStep: null,
        percentComplete: 0,
        isComplete: false,
        isStale: false,
        isPaused: false,
        pausedAt: null,
        mode: "auto",
        maxRetries: 3,
        startedAt: null,
        lastUpdatedAt: null,
        steps: [],
      };
      return NextResponse.json(response);
    }

    // Check if .progress.json exists
    let progress: ProgressFile | null = null;
    try {
      const content = await fs.readFile(progressPath, "utf-8");
      progress = JSON.parse(content);
    } catch {
      // No progress yet
    }

    // Check if .build-config.json exists
    let config: BuildConfig = { ...DEFAULT_CONFIG };
    try {
      const content = await fs.readFile(configPath, "utf-8");
      config = { ...DEFAULT_CONFIG, ...JSON.parse(content) };
    } catch {
      // Use defaults
    }

    // Build the response - count completed and failed steps
    const completedStepNumbers: number[] = [];
    const failedStepNumbers: number[] = [];

    if (progress) {
      for (const [key, step] of Object.entries(progress.completedSteps)) {
        if (step.status === "complete") {
          completedStepNumbers.push(Number(key));
        } else if (step.status === "failed") {
          failedStepNumbers.push(Number(key));
        }
      }
    }

    const completedCount = completedStepNumbers.length;
    const failedCount = failedStepNumbers.length;
    const totalSteps = buildSequence.totalPrompts;

    // Find current step (first uncompleted and not failed)
    let currentStep: number | null = null;
    for (const prompt of buildSequence.prompts) {
      if (
        !completedStepNumbers.includes(prompt.step) &&
        !failedStepNumbers.includes(prompt.step)
      ) {
        currentStep = prompt.step;
        break;
      }
    }

    // Check if stale (no update in 5+ minutes)
    let isStale = false;
    if (progress && progress.lastUpdatedAt && completedCount < totalSteps) {
      const lastUpdate = new Date(progress.lastUpdatedAt).getTime();
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      isStale = now - lastUpdate > fiveMinutes;
    }

    // Build steps array with status
    const steps: StepInfo[] = buildSequence.prompts.map((prompt) => {
      const stepProgress = progress?.completedSteps[prompt.step.toString()];
      let status: "pending" | "current" | "complete" | "failed" = "pending";

      if (stepProgress) {
        // Map internal statuses to UI statuses
        if (stepProgress.status === "complete") {
          status = "complete";
        } else if (stepProgress.status === "failed") {
          status = "failed";
        } else if (stepProgress.status === "in_progress") {
          status = "current";
        } else {
          status = "pending";
        }
      } else if (prompt.step === currentStep) {
        status = "current";
      }

      return {
        step: prompt.step,
        name: prompt.name,
        description: prompt.description,
        status,
        completedAt: stepProgress?.completedAt || null,
        notes: stepProgress?.notes || null,
        errors: stepProgress?.errors || null,
        retryCount: stepProgress?.retryCount || 0,
      };
    });

    const response: ProgressResponse = {
      hasPrompts: true,
      hasProgress: progress !== null,
      totalSteps,
      completedSteps: completedCount,
      failedSteps: failedCount,
      currentStep,
      percentComplete: Math.round((completedCount / totalSteps) * 100),
      isComplete: completedCount === totalSteps,
      isStale,
      isPaused: progress?.isPaused || false,
      pausedAt: progress?.pausedAt || null,
      mode: config.mode,
      maxRetries: config.maxRetries,
      startedAt: progress?.startedAt || null,
      lastUpdatedAt: progress?.lastUpdatedAt || null,
      steps,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error reading progress:", error);
    return NextResponse.json(
      { error: "Failed to read progress" },
      { status: 500 }
    );
  }
}
