import { NextResponse } from "next/server";
import { getLock, removeLock, isProcessRunning } from "@/lib/build-lock";

function getProjectPath(): string {
  return process.env.LANDFALL_PROJECT_PATH || process.cwd();
}

export async function POST() {
  const projectPath = getProjectPath();
  const lock = getLock(projectPath);

  if (!lock) {
    return NextResponse.json(
      { error: "No build in progress" },
      { status: 404 }
    );
  }

  // Check if process is still running
  if (!isProcessRunning(lock.pid)) {
    // Clean up stale lock
    removeLock(projectPath);
    return NextResponse.json(
      { error: "Build process already terminated" },
      { status: 404 }
    );
  }

  try {
    // Send SIGTERM to gracefully stop the process
    process.kill(lock.pid, "SIGTERM");

    // Give it a moment to terminate gracefully
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if it's still running after SIGTERM
    if (isProcessRunning(lock.pid)) {
      // Force kill if still running
      process.kill(lock.pid, "SIGKILL");
    }

    removeLock(projectPath);

    return NextResponse.json({ success: true });
  } catch (error) {
    // Process may have already terminated
    removeLock(projectPath);

    return NextResponse.json({
      success: true,
      note: "Process may have already terminated",
    });
  }
}
