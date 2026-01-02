import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

export type BuildMode = "auto" | "review";

export interface BuildConfig {
  mode: BuildMode;
  validationEnabled: boolean;
  maxRetries: number;
}

const CONFIG_FILE = ".build-config.json";

const DEFAULT_CONFIG: BuildConfig = {
  mode: "auto",
  validationEnabled: false,
  maxRetries: 3,
};

function getConfigPath(projectPath: string): string {
  return join(projectPath, "landfall", "prompts", CONFIG_FILE);
}

export function loadConfig(projectPath: string): BuildConfig {
  const configPath = getConfigPath(projectPath);

  if (!existsSync(configPath)) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const content = readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(content);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(projectPath: string, config: BuildConfig): void {
  const configPath = getConfigPath(projectPath);
  writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}

export function setMode(projectPath: string, mode: BuildMode): BuildConfig {
  const config = loadConfig(projectPath);
  config.mode = mode;
  saveConfig(projectPath, config);
  return config;
}

export function setValidationEnabled(
  projectPath: string,
  enabled: boolean
): BuildConfig {
  const config = loadConfig(projectPath);
  config.validationEnabled = enabled;
  saveConfig(projectPath, config);
  return config;
}

export function setMaxRetries(
  projectPath: string,
  maxRetries: number
): BuildConfig {
  const config = loadConfig(projectPath);
  config.maxRetries = maxRetries;
  saveConfig(projectPath, config);
  return config;
}
