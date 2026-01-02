import { readFileSync, existsSync } from "fs";
import { join, basename } from "path";
import {
  loadProgress,
  markStepComplete,
  getCompletedSteps,
  getFailedSteps,
  reportStepError,
  retryStep as retryStepProgress,
  pauseBuild as pauseBuildProgress,
  resumeBuild as resumeBuildProgress,
  type BuildProgress,
  type StepProgress,
} from "./progress.js";
import {
  loadConfig as loadBuildConfig,
  setMode as setBuildMode,
  type BuildConfig,
  type BuildMode,
} from "./config.js";

export interface Prompt {
  step: number;
  name: string;
  description: string;
  prompt: string;
}

export interface BuildSequence {
  generatedAt: string;
  totalPrompts: number;
  prompts: Prompt[];
}

export interface ProjectConfig {
  name?: string;
  description?: string;
}

export interface SitemapPage {
  id: string;
  slug: string;
  title: string;
  isHome?: boolean;
}

export interface Sitemap {
  pages: SitemapPage[];
}

// Error types
export class LandfallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LandfallError";
  }
}

export class NotInProjectError extends LandfallError {
  constructor() {
    super(
      "Not in a Landfall project. Run 'npx landfall init' first, or navigate to a directory containing a 'landfall/' folder."
    );
  }
}

export class NoPromptsError extends LandfallError {
  constructor() {
    super(
      "No build prompts found. Generate them in the Landfall app first (complete the design wizard and click Build)."
    );
  }
}

// Helpers
function findProjectRoot(startPath: string = process.cwd()): string | null {
  let currentPath = startPath;

  // Check up to 10 parent directories
  for (let i = 0; i < 10; i++) {
    const landfallPath = join(currentPath, "landfall");
    if (existsSync(landfallPath)) {
      return currentPath;
    }

    const parentPath = join(currentPath, "..");
    if (parentPath === currentPath) {
      // Reached root
      break;
    }
    currentPath = parentPath;
  }

  return null;
}

function loadBuildSequence(projectPath: string): BuildSequence {
  const buildSequencePath = join(
    projectPath,
    "landfall",
    "prompts",
    "build-sequence.json"
  );

  if (!existsSync(buildSequencePath)) {
    throw new NoPromptsError();
  }

  try {
    const content = readFileSync(buildSequencePath, "utf-8");
    return JSON.parse(content) as BuildSequence;
  } catch {
    throw new NoPromptsError();
  }
}

function loadConfig(projectPath: string): ProjectConfig {
  const configPath = join(projectPath, "landfall", "config.json");

  if (!existsSync(configPath)) {
    return { name: basename(projectPath) };
  }

  try {
    const content = readFileSync(configPath, "utf-8");
    return JSON.parse(content) as ProjectConfig;
  } catch {
    return { name: basename(projectPath) };
  }
}

function loadSitemap(projectPath: string): Sitemap | null {
  const sitemapPath = join(projectPath, "landfall", "sitemap.json");

  if (!existsSync(sitemapPath)) {
    return null;
  }

  try {
    const content = readFileSync(sitemapPath, "utf-8");
    return JSON.parse(content) as Sitemap;
  } catch {
    return null;
  }
}

// Tool implementations

export interface ProjectInfo {
  projectName: string;
  projectPath: string;
  pages: number;
  totalSteps: number;
  completedSteps: number;
  generatedAt: string;
}

export function getProjectInfo(): ProjectInfo {
  const projectPath = findProjectRoot();

  if (!projectPath) {
    throw new NotInProjectError();
  }

  const buildSequence = loadBuildSequence(projectPath);
  const config = loadConfig(projectPath);
  const sitemap = loadSitemap(projectPath);
  const completedSteps = getCompletedSteps(projectPath);

  return {
    projectName: config.name || basename(projectPath),
    projectPath,
    pages: sitemap?.pages?.length || 0,
    totalSteps: buildSequence.totalPrompts,
    completedSteps: completedSteps.length,
    generatedAt: buildSequence.generatedAt,
  };
}

export interface NextPromptResult {
  step: number;
  name: string;
  description: string;
  prompt: string;
  isLastStep: boolean;
  totalSteps: number;
  completedSteps: number;
}

export function getNextPrompt(): NextPromptResult | null {
  const projectPath = findProjectRoot();

  if (!projectPath) {
    throw new NotInProjectError();
  }

  const buildSequence = loadBuildSequence(projectPath);
  const completedSteps = getCompletedSteps(projectPath);

  // Find the first uncompleted step
  const nextPrompt = buildSequence.prompts.find(
    (p) => !completedSteps.includes(p.step)
  );

  if (!nextPrompt) {
    return null; // All steps complete
  }

  return {
    step: nextPrompt.step,
    name: nextPrompt.name,
    description: nextPrompt.description,
    prompt: nextPrompt.prompt,
    isLastStep: nextPrompt.step === buildSequence.totalPrompts,
    totalSteps: buildSequence.totalPrompts,
    completedSteps: completedSteps.length,
  };
}

export interface PromptResult {
  step: number;
  name: string;
  description: string;
  prompt: string;
  isComplete: boolean;
  totalSteps: number;
}

export function getPrompt(step: number): PromptResult {
  const projectPath = findProjectRoot();

  if (!projectPath) {
    throw new NotInProjectError();
  }

  const buildSequence = loadBuildSequence(projectPath);
  const completedSteps = getCompletedSteps(projectPath);

  const prompt = buildSequence.prompts.find((p) => p.step === step);

  if (!prompt) {
    throw new LandfallError(
      `Step ${step} not found. Valid steps are 1-${buildSequence.totalPrompts}.`
    );
  }

  return {
    step: prompt.step,
    name: prompt.name,
    description: prompt.description,
    prompt: prompt.prompt,
    isComplete: completedSteps.includes(step),
    totalSteps: buildSequence.totalPrompts,
  };
}

export interface MarkCompleteResult {
  step: number;
  markedAt: string;
  notes?: string;
  nextStep: NextPromptResult | null;
  totalSteps: number;
  completedSteps: number;
  percentComplete: number;
}

export function markComplete(step: number, notes?: string): MarkCompleteResult {
  const projectPath = findProjectRoot();

  if (!projectPath) {
    throw new NotInProjectError();
  }

  const buildSequence = loadBuildSequence(projectPath);

  // Validate step exists
  const prompt = buildSequence.prompts.find((p) => p.step === step);
  if (!prompt) {
    throw new LandfallError(
      `Step ${step} not found. Valid steps are 1-${buildSequence.totalPrompts}.`
    );
  }

  // Mark as complete
  const progress = markStepComplete(projectPath, step, notes);
  const completedSteps = getCompletedSteps(projectPath);
  const completedCount = completedSteps.length;

  // Get next step
  const nextStep = getNextPrompt();

  return {
    step,
    markedAt: progress.completedSteps[step].completedAt!,
    notes,
    nextStep,
    totalSteps: buildSequence.totalPrompts,
    completedSteps: completedCount,
    percentComplete: Math.round((completedCount / buildSequence.totalPrompts) * 100),
  };
}

export interface StatusResult {
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  currentStep: number | null;
  percentComplete: number;
  isComplete: boolean;
  isPaused: boolean;
  pausedAt: number | null;
  startedAt: string | null;
  lastUpdatedAt: string | null;
  completedStepNumbers: number[];
  failedStepNumbers: number[];
  mode: BuildMode;
}

export function getStatus(): StatusResult {
  const projectPath = findProjectRoot();

  if (!projectPath) {
    throw new NotInProjectError();
  }

  const buildSequence = loadBuildSequence(projectPath);
  const progress = loadProgress(projectPath);
  const completedSteps = getCompletedSteps(projectPath);
  const failedSteps = getFailedSteps(projectPath);
  const config = loadBuildConfig(projectPath);

  // Find current (next uncompleted and not failed) step
  const nextPrompt = buildSequence.prompts.find(
    (p) => !completedSteps.includes(p.step) && !failedSteps.includes(p.step)
  );

  const completedCount = completedSteps.length;
  const percentComplete = Math.round(
    (completedCount / buildSequence.totalPrompts) * 100
  );

  return {
    totalSteps: buildSequence.totalPrompts,
    completedSteps: completedCount,
    failedSteps: failedSteps.length,
    currentStep: nextPrompt?.step || null,
    percentComplete,
    isComplete: completedCount === buildSequence.totalPrompts,
    isPaused: progress?.isPaused || false,
    pausedAt: progress?.pausedAt || null,
    startedAt: progress?.startedAt || null,
    lastUpdatedAt: progress?.lastUpdatedAt || null,
    completedStepNumbers: completedSteps,
    failedStepNumbers: failedSteps,
    mode: config.mode,
  };
}

// New tools for error handling and orchestration

export interface ReportIssueResult {
  step: number;
  error: string;
  reportedAt: string;
  retryCount: number;
  maxRetries: number;
}

export function reportIssue(
  step: number,
  error: string,
  details?: Record<string, unknown>
): ReportIssueResult {
  const projectPath = findProjectRoot();

  if (!projectPath) {
    throw new NotInProjectError();
  }

  const buildSequence = loadBuildSequence(projectPath);
  const config = loadBuildConfig(projectPath);

  // Validate step exists
  const prompt = buildSequence.prompts.find((p) => p.step === step);
  if (!prompt) {
    throw new LandfallError(
      `Step ${step} not found. Valid steps are 1-${buildSequence.totalPrompts}.`
    );
  }

  const progress = reportStepError(projectPath, step, error, details);
  const stepProgress = progress.completedSteps[step];

  return {
    step,
    error,
    reportedAt: stepProgress.errors![stepProgress.errors!.length - 1].timestamp,
    retryCount: stepProgress.retryCount || 0,
    maxRetries: config.maxRetries,
  };
}

export interface RetryStepResult {
  step: number;
  retryCount: number;
  maxRetries: number;
  prompt: PromptResult;
  canRetry: boolean;
}

export function retryStep(step: number): RetryStepResult {
  const projectPath = findProjectRoot();

  if (!projectPath) {
    throw new NotInProjectError();
  }

  const buildSequence = loadBuildSequence(projectPath);
  const config = loadBuildConfig(projectPath);

  // Validate step exists
  const prompt = buildSequence.prompts.find((p) => p.step === step);
  if (!prompt) {
    throw new LandfallError(
      `Step ${step} not found. Valid steps are 1-${buildSequence.totalPrompts}.`
    );
  }

  const progress = retryStepProgress(projectPath, step);
  const stepProgress = progress.completedSteps[step];
  const retryCount = stepProgress.retryCount || 0;

  return {
    step,
    retryCount,
    maxRetries: config.maxRetries,
    prompt: getPrompt(step),
    canRetry: retryCount < config.maxRetries,
  };
}

export interface PauseBuildResult {
  isPaused: boolean;
  pausedAt: number | null;
  message: string;
}

export function pauseBuild(): PauseBuildResult {
  const projectPath = findProjectRoot();

  if (!projectPath) {
    throw new NotInProjectError();
  }

  // Get current step
  const status = getStatus();
  pauseBuildProgress(projectPath, status.currentStep || undefined);

  return {
    isPaused: true,
    pausedAt: status.currentStep,
    message: status.currentStep
      ? `Build paused at step ${status.currentStep}`
      : "Build paused",
  };
}

export interface ResumeBuildResult {
  isPaused: boolean;
  currentStep: number | null;
  nextPrompt: NextPromptResult | null;
  message: string;
}

export function resumeBuild(): ResumeBuildResult {
  const projectPath = findProjectRoot();

  if (!projectPath) {
    throw new NotInProjectError();
  }

  resumeBuildProgress(projectPath);
  const nextPrompt = getNextPrompt();

  return {
    isPaused: false,
    currentStep: nextPrompt?.step || null,
    nextPrompt,
    message: nextPrompt
      ? `Build resumed. Continue with step ${nextPrompt.step}: ${nextPrompt.name}`
      : "Build complete. Nothing to resume.",
  };
}

export interface SetModeResult {
  mode: BuildMode;
  previousMode: BuildMode;
  message: string;
}

export function setMode(mode: BuildMode): SetModeResult {
  const projectPath = findProjectRoot();

  if (!projectPath) {
    throw new NotInProjectError();
  }

  if (mode !== "auto" && mode !== "review") {
    throw new LandfallError(
      `Invalid mode "${mode}". Valid modes are "auto" or "review".`
    );
  }

  const previousConfig = loadBuildConfig(projectPath);
  setBuildMode(projectPath, mode);

  return {
    mode,
    previousMode: previousConfig.mode,
    message:
      mode === "auto"
        ? "Switched to auto mode. Build will proceed automatically on step completion."
        : "Switched to review mode. Build will pause after each step for confirmation.",
  };
}

export interface GetConfigResult {
  mode: BuildMode;
  validationEnabled: boolean;
  maxRetries: number;
  isPaused: boolean;
  pausedAt: number | null;
}

export function getConfig(): GetConfigResult {
  const projectPath = findProjectRoot();

  if (!projectPath) {
    throw new NotInProjectError();
  }

  const config = loadBuildConfig(projectPath);
  const progress = loadProgress(projectPath);

  return {
    mode: config.mode,
    validationEnabled: config.validationEnabled,
    maxRetries: config.maxRetries,
    isPaused: progress?.isPaused || false,
    pausedAt: progress?.pausedAt || null,
  };
}
