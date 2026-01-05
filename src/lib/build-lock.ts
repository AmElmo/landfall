import fs from "fs";
import path from "path";

const LOG_PREFIX = "[build-lock]";

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

  console.log(`${LOG_PREFIX} Creating lock file at ${lockPath} for PID ${pid}`);

  // Ensure directory exists
  const dir = path.dirname(lockPath);
  if (!fs.existsSync(dir)) {
    console.log(`${LOG_PREFIX} Creating directory ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2), "utf-8");
  console.log(`${LOG_PREFIX} Lock file created successfully`);
}

export function removeLock(projectPath: string): void {
  const lockPath = getLockPath(projectPath);
  console.log(`${LOG_PREFIX} Removing lock file at ${lockPath}`);
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath);
    console.log(`${LOG_PREFIX} Lock file removed`);
  } else {
    console.log(`${LOG_PREFIX} Lock file does not exist, nothing to remove`);
  }
}

export function getLock(projectPath: string): BuildLock | null {
  const lockPath = getLockPath(projectPath);
  console.log(`${LOG_PREFIX} Getting lock from ${lockPath}`);

  if (!fs.existsSync(lockPath)) {
    console.log(`${LOG_PREFIX} No lock file found`);
    return null;
  }

  try {
    const content = fs.readFileSync(lockPath, "utf-8");
    const lock = JSON.parse(content) as BuildLock;
    console.log(`${LOG_PREFIX} Found lock: PID ${lock.pid}, started at ${lock.startedAt}`);
    return lock;
  } catch (err) {
    console.log(`${LOG_PREFIX} Error reading lock file:`, err);
    return null;
  }
}

export function isProcessRunning(pid: number): boolean {
  try {
    // Sending signal 0 doesn't kill the process, just checks if it exists
    process.kill(pid, 0);
    console.log(`${LOG_PREFIX} Process ${pid} is running`);
    return true;
  } catch {
    console.log(`${LOG_PREFIX} Process ${pid} is NOT running`);
    return false;
  }
}

export function isBuildRunning(projectPath: string): boolean {
  console.log(`${LOG_PREFIX} Checking if build is running for ${projectPath}`);
  const lock = getLock(projectPath);
  if (!lock) {
    console.log(`${LOG_PREFIX} No lock found, build is not running`);
    return false;
  }

  const running = isProcessRunning(lock.pid);

  // Clean up stale lock if process is no longer running
  if (!running) {
    console.log(`${LOG_PREFIX} Process not running, cleaning up stale lock`);
    removeLock(projectPath);
    return false;
  }

  console.log(`${LOG_PREFIX} Build IS running (PID ${lock.pid})`);
  return true;
}
