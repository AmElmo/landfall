import fs from "fs";
import path from "path";

export interface BuildLock {
  pid: number;
  startedAt: string;
}

function getLockPath(projectPath: string): string {
  return path.join(projectPath, "landfall", "prompts", ".build-lock");
}

export function createLock(pid: number, projectPath: string): void {
  const lockPath = getLockPath(projectPath);
  const lock: BuildLock = {
    pid,
    startedAt: new Date().toISOString(),
  };

  // Ensure directory exists
  const dir = path.dirname(lockPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2), "utf-8");
}

export function removeLock(projectPath: string): void {
  const lockPath = getLockPath(projectPath);
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath);
  }
}

export function getLock(projectPath: string): BuildLock | null {
  const lockPath = getLockPath(projectPath);

  if (!fs.existsSync(lockPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(lockPath, "utf-8");
    return JSON.parse(content) as BuildLock;
  } catch {
    return null;
  }
}

export function isProcessRunning(pid: number): boolean {
  try {
    // Sending signal 0 doesn't kill the process, just checks if it exists
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function isBuildRunning(projectPath: string): boolean {
  const lock = getLock(projectPath);
  if (!lock) {
    return false;
  }

  const running = isProcessRunning(lock.pid);

  // Clean up stale lock if process is no longer running
  if (!running) {
    removeLock(projectPath);
    return false;
  }

  return true;
}
