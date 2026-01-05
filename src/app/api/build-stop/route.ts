import { NextResponse } from "next/server";
import { getLock, removeLock, isProcessRunning } from "@/lib/build-lock";

const LOG_PREFIX = "[build-stop]";

function getProjectPath(): string {
  return process.env.LANDFALL_PROJECT_PATH || process.cwd();
}

export async function POST() {
  console.log(`${LOG_PREFIX} ========== BUILD STOP REQUEST ==========`);
  const projectPath = getProjectPath();
  console.log(`${LOG_PREFIX} Project path: ${projectPath}`);

  const lock = getLock(projectPath);

  if (!lock) {
    console.log(`${LOG_PREFIX} ERROR: No lock file found, no build in progress`);
    return NextResponse.json(
      { error: "No build in progress" },
      { status: 404 }
    );
  }

  console.log(`${LOG_PREFIX} Found lock for PID: ${lock.pid}`);

  // Check if process is still running
  if (!isProcessRunning(lock.pid)) {
    console.log(`${LOG_PREFIX} Process ${lock.pid} already terminated, cleaning up stale lock`);
    // Clean up stale lock
    removeLock(projectPath);
    return NextResponse.json(
      { error: "Build process already terminated" },
      { status: 404 }
    );
  }

  try {
    // Send SIGTERM to gracefully stop the process
    console.log(`${LOG_PREFIX} Sending SIGTERM to PID ${lock.pid}`);
    process.kill(lock.pid, "SIGTERM");

    // Give it a moment to terminate gracefully
    console.log(`${LOG_PREFIX} Waiting 500ms for graceful termination...`);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if it's still running after SIGTERM
    if (isProcessRunning(lock.pid)) {
      // Force kill if still running
      console.log(`${LOG_PREFIX} Process still running, sending SIGKILL to PID ${lock.pid}`);
      process.kill(lock.pid, "SIGKILL");
    } else {
      console.log(`${LOG_PREFIX} Process terminated gracefully`);
    }

    removeLock(projectPath);
    console.log(`${LOG_PREFIX} Build stopped successfully`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(`${LOG_PREFIX} Error stopping process:`, error);
    // Process may have already terminated
    removeLock(projectPath);

    return NextResponse.json({
      success: true,
      note: "Process may have already terminated",
    });
  }
}
