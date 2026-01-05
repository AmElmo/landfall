import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { createLock, removeLock, isBuildRunning } from "@/lib/build-lock";

function getProjectPath(): string {
  return process.env.LANDFALL_PROJECT_PATH || process.cwd();
}

function getBuildSequencePath(projectPath: string): string {
  return path.join(projectPath, "landfall", "prompts", "build-sequence.json");
}

const MCP_CONFIG = {
  mcpServers: {
    landfall: {
      command: "npx",
      args: ["landfall-mcp"],
    },
  },
};

const BUILD_PROMPT = `You are building a Landfall project. Your task is to execute all build steps in sequence.

IMPORTANT: Use the Landfall MCP tools to orchestrate the build:

1. First call \`landfall_get_status\` to see current progress
2. Call \`landfall_get_next_prompt\` to get the next step to execute
3. Execute the prompt - it will tell you what files to create/modify
4. After successfully completing the step, call \`landfall_mark_complete\` with the step number and any notes
5. Repeat until all steps are complete

If you encounter an error:
- Call \`landfall_report_issue\` with the step number and error details
- Try to fix the issue and retry

Continue until \`landfall_get_next_prompt\` returns null (all steps complete).`;

export async function GET() {
  const projectPath = getProjectPath();

  // Check if prompts exist
  const buildSequencePath = getBuildSequencePath(projectPath);
  if (!fs.existsSync(buildSequencePath)) {
    return new Response(
      JSON.stringify({ error: "No build prompts found. Generate them first." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Check if build already running
  if (isBuildRunning(projectPath)) {
    return new Response(
      JSON.stringify({ error: "Build already in progress" }),
      {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Create SSE stream
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial event
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      // Spawn Claude CLI
      const claudeProcess = spawn(
        "claude",
        [
          "--mcp-config",
          JSON.stringify(MCP_CONFIG),
          "-p",
          BUILD_PROMPT,
        ],
        {
          cwd: projectPath,
          env: {
            ...process.env,
            LANDFALL_PROJECT_PATH: projectPath,
          },
          stdio: ["ignore", "pipe", "pipe"],
        }
      );

      // Create lock file
      createLock(claudeProcess.pid!, projectPath);
      sendEvent("started", { pid: claudeProcess.pid });

      // Stream stdout
      claudeProcess.stdout?.on("data", (data: Buffer) => {
        const text = data.toString();
        sendEvent("output", { type: "stdout", text });
      });

      // Stream stderr
      claudeProcess.stderr?.on("data", (data: Buffer) => {
        const text = data.toString();
        sendEvent("output", { type: "stderr", text });
      });

      // Handle process exit
      claudeProcess.on("close", (code) => {
        removeLock(projectPath);
        sendEvent("complete", { exitCode: code });
        controller.close();
      });

      // Handle process error
      claudeProcess.on("error", (err) => {
        removeLock(projectPath);
        sendEvent("error", { message: err.message });
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
