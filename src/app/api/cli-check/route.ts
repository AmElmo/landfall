import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const LOG_PREFIX = "[cli-check]";
const execAsync = promisify(exec);

export async function GET() {
  console.log(`${LOG_PREFIX} ========== CLI CHECK REQUEST ==========`);
  console.log(`${LOG_PREFIX} Checking if Claude CLI is available...`);

  try {
    // Try to get Claude CLI version
    console.log(`${LOG_PREFIX} Running: claude --version`);
    const { stdout, stderr } = await execAsync("claude --version", {
      timeout: 5000,
    });

    console.log(`${LOG_PREFIX} stdout: ${stdout.trim()}`);
    if (stderr) {
      console.log(`${LOG_PREFIX} stderr: ${stderr.trim()}`);
    }

    // Parse version from output (e.g., "claude 1.0.0")
    const versionMatch = stdout.trim().match(/[\d.]+/);
    const version = versionMatch ? versionMatch[0] : undefined;

    console.log(`${LOG_PREFIX} Claude CLI IS available, version: ${version}`);

    return NextResponse.json({
      available: true,
      version,
    });
  } catch (error) {
    console.log(`${LOG_PREFIX} Claude CLI NOT available`);
    console.log(`${LOG_PREFIX} Error:`, error instanceof Error ? error.message : error);
    // CLI not found or errored
    return NextResponse.json({
      available: false,
      version: undefined,
    });
  }
}
