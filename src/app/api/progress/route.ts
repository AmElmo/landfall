import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

interface StepProgress {
  completedAt: string;
  notes?: string;
}

interface ProgressFile {
  startedAt: string;
  lastUpdatedAt: string;
  completedSteps: Record<string, StepProgress>;
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

export interface ProgressResponse {
  hasPrompts: boolean;
  hasProgress: boolean;
  totalSteps: number;
  completedSteps: number;
  currentStep: number | null;
  percentComplete: number;
  isComplete: boolean;
  isStale: boolean;
  startedAt: string | null;
  lastUpdatedAt: string | null;
  steps: Array<{
    step: number;
    name: string;
    description: string;
    status: "pending" | "current" | "complete";
    completedAt: string | null;
    notes: string | null;
  }>;
}

function getLandfallDir(): string {
  return path.join(
    process.env.LANDFALL_PROJECT_PATH || process.cwd(),
    "landfall"
  );
}

export async function GET() {
  try {
    const landfallDir = getLandfallDir();
    const promptsDir = path.join(landfallDir, "prompts");
    const buildSequencePath = path.join(promptsDir, "build-sequence.json");
    const progressPath = path.join(promptsDir, ".progress.json");

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
        currentStep: null,
        percentComplete: 0,
        isComplete: false,
        isStale: false,
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

    // Build the response
    const completedStepNumbers = progress
      ? Object.keys(progress.completedSteps).map(Number)
      : [];

    const completedCount = completedStepNumbers.length;
    const totalSteps = buildSequence.totalPrompts;

    // Find current step (first uncompleted)
    let currentStep: number | null = null;
    for (const prompt of buildSequence.prompts) {
      if (!completedStepNumbers.includes(prompt.step)) {
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
    const steps = buildSequence.prompts.map((prompt) => {
      const stepProgress = progress?.completedSteps[prompt.step.toString()];
      let status: "pending" | "current" | "complete" = "pending";

      if (stepProgress) {
        status = "complete";
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
      };
    });

    const response: ProgressResponse = {
      hasPrompts: true,
      hasProgress: progress !== null,
      totalSteps,
      completedSteps: completedCount,
      currentStep,
      percentComplete: Math.round((completedCount / totalSteps) * 100),
      isComplete: completedCount === totalSteps,
      isStale,
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
