import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Try to get Claude CLI version
    const { stdout } = await execAsync("claude --version", {
      timeout: 5000,
    });

    // Parse version from output (e.g., "claude 1.0.0")
    const versionMatch = stdout.trim().match(/[\d.]+/);
    const version = versionMatch ? versionMatch[0] : undefined;

    return NextResponse.json({
      available: true,
      version,
    });
  } catch (error) {
    // CLI not found or errored
    return NextResponse.json({
      available: false,
      version: undefined,
    });
  }
}
