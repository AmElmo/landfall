import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { createLock, removeLock, isBuildRunning } from "@/lib/build-lock";

const LOG_PREFIX = "[build-stream]";

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

const BUILD_ALL_PROMPT = `You are building a Landfall project. Your task is to execute all build steps in sequence.

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

// Parse stream-json message from Claude CLI into human-readable status
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseStreamMessage(json: any): string | null {
  try {
    // Handle system init message
    if (json.type === "system" && json.subtype === "init") {
      return `ℹ️ Claude initialized (model: ${json.model || "unknown"})`;
    }

    // Handle assistant messages with content
    if (json.type === "assistant" && json.message?.content) {
      for (const block of json.message.content) {
        // Extract tool usage
        if (block.type === "tool_use") {
          const toolName = block.name || "unknown";
          const input = block.input || {};

          // Provide friendly descriptions for common tools
          if (toolName === "Read") {
            return `📖 Reading: ${input.file_path || "file"}`;
          } else if (toolName === "Edit") {
            return `✏️ Editing: ${input.file_path || "file"}`;
          } else if (toolName === "Write") {
            return `📝 Writing: ${input.file_path || "file"}`;
          } else if (toolName === "Bash") {
            const cmd = input.command?.substring(0, 50) || "command";
            return `💻 Running: ${cmd}${input.command?.length > 50 ? "..." : ""}`;
          } else if (toolName === "Glob") {
            return `🔍 Searching: ${input.pattern || "files"}`;
          } else if (toolName === "Grep") {
            return `🔎 Grep: ${input.pattern || "pattern"}`;
          } else if (toolName.startsWith("mcp__landfall")) {
            const mcpTool = toolName.replace("mcp__landfall__", "");
            return `🏗️ Landfall: ${mcpTool}`;
          }
          return `🔧 Tool: ${toolName}`;
        }

        // Extract text blocks (Claude's thinking/response)
        if (block.type === "text" && block.text) {
          const text = block.text.trim();
          if (text.length > 80) {
            return `💭 ${text.substring(0, 80)}...`;
          }
          return `💭 ${text}`;
        }
      }
    }

    // Handle result message
    if (json.type === "result") {
      const duration = json.duration_ms ? ` (${Math.round(json.duration_ms / 1000)}s)` : "";
      if (json.subtype === "success") {
        return `✅ Task completed${duration}`;
      }
      return `⚠️ ${json.subtype || "Unknown result"}${duration}`;
    }

    // Handle tool result
    if (json.type === "user" && json.message?.content) {
      for (const block of json.message.content) {
        if (block.type === "tool_result") {
          return null; // Don't show raw tool results, they're verbose
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

function getSingleStepPrompt(stepNumber: number): string {
  return `You are building a Landfall project. Your task is to execute ONLY step ${stepNumber}.

IMPORTANT: Use the Landfall MCP tools:

1. Call \`landfall_get_prompt\` with step number ${stepNumber} to get the prompt for this specific step
2. Execute the prompt - it will tell you what files to create/modify
3. After successfully completing the step, call \`landfall_mark_complete\` with step number ${stepNumber} and any notes

If you encounter an error:
- Call \`landfall_report_issue\` with step number ${stepNumber} and error details
- Try to fix the issue and retry

ONLY execute step ${stepNumber}. Do not proceed to other steps.`;
}

export async function GET(request: NextRequest) {
  console.log(`${LOG_PREFIX} ========== BUILD STREAM REQUEST ==========`);
  const projectPath = getProjectPath();
  console.log(`${LOG_PREFIX} Project path: ${projectPath}`);

  // Check for step parameter (for single-step builds)
  const { searchParams } = new URL(request.url);
  const stepParam = searchParams.get("step");
  const singleStep = stepParam ? parseInt(stepParam, 10) : null;
  console.log(`${LOG_PREFIX} Step parameter: ${stepParam}, singleStep: ${singleStep}`);

  // Check if prompts exist
  const buildSequencePath = getBuildSequencePath(projectPath);
  console.log(`${LOG_PREFIX} Checking for build sequence at: ${buildSequencePath}`);
  if (!fs.existsSync(buildSequencePath)) {
    console.log(`${LOG_PREFIX} ERROR: Build sequence file not found!`);
    return new Response(
      JSON.stringify({ error: "No build prompts found. Generate them first." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  console.log(`${LOG_PREFIX} Build sequence file exists`);

  // Check if build already running
  console.log(`${LOG_PREFIX} Checking if build is already running...`);
  if (isBuildRunning(projectPath)) {
    console.log(`${LOG_PREFIX} ERROR: Build already in progress!`);
    return new Response(
      JSON.stringify({ error: "Build already in progress" }),
      {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  console.log(`${LOG_PREFIX} No existing build running, proceeding...`);

  // Create SSE stream
  console.log(`${LOG_PREFIX} Creating SSE stream...`);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      console.log(`${LOG_PREFIX} ReadableStream started`);

      // Send initial event
      const sendEvent = (event: string, data: unknown) => {
        console.log(`${LOG_PREFIX} Sending SSE event: ${event}`, typeof data === 'object' && data !== null && 'text' in data ? '(output data)' : data);
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      // Select prompt based on single step or all steps
      const prompt = singleStep
        ? getSingleStepPrompt(singleStep)
        : BUILD_ALL_PROMPT;

      console.log(`${LOG_PREFIX} Using ${singleStep ? `single step (${singleStep})` : 'all steps'} prompt`);
      console.log(`${LOG_PREFIX} Prompt length: ${prompt.length} characters`);

      // Spawn Claude CLI
      // Based on working implementation from specwright/freetown:
      // - Use 'inherit' for stdin - Claude CLI needs a real stdin connection to start
      // - Use --output-format stream-json and --verbose for JSON streaming
      // - Use --allowedTools to auto-approve specific tools
      const allowedTools = ["Read", "Edit", "Write", "Bash", "Glob", "Grep", "mcp__landfall"];
      const cliArgs = [
        "-p",
        prompt,
        "--allowedTools",
        allowedTools.join(","),
        "--output-format",
        "stream-json",
        "--verbose",
        "--mcp-config",
        JSON.stringify(MCP_CONFIG),
      ];
      console.log(`${LOG_PREFIX} Spawning Claude CLI with args:`, ["-p", "(prompt)", "--allowedTools", allowedTools.join(","), "--output-format", "stream-json", "--verbose", "--mcp-config", "(config)"]);
      console.log(`${LOG_PREFIX} Working directory: ${projectPath}`);
      console.log(`${LOG_PREFIX} LANDFALL_PROJECT_PATH env: ${projectPath}`);

      const claudeProcess = spawn(
        "claude",
        cliArgs,
        {
          cwd: projectPath,
          env: {
            ...process.env,
            LANDFALL_PROJECT_PATH: projectPath,
          },
          // Use 'inherit' for stdin - Claude CLI needs a real stdin connection to start
          // Use 'pipe' for stdout/stderr so we can capture the output
          stdio: ["inherit", "pipe", "pipe"],
        }
      );

      console.log(`${LOG_PREFIX} Claude process spawned with PID: ${claudeProcess.pid}`);

      // Create lock file
      createLock(claudeProcess.pid!, projectPath);
      sendEvent("started", { pid: claudeProcess.pid });
      console.log(`${LOG_PREFIX} Sent 'started' event to client`);

      // Buffer for incomplete lines (stream-json outputs one JSON object per line)
      let stdoutBuffer = "";

      // Stream stdout - parse stream-json format
      claudeProcess.stdout?.on("data", (data: Buffer) => {
        const chunk = data.toString();
        stdoutBuffer += chunk;

        // Process complete lines
        const lines = stdoutBuffer.split("\n");
        stdoutBuffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;

          console.log(`${LOG_PREFIX} [stdout] ${line.substring(0, 200)}${line.length > 200 ? '...' : ''}`);

          // Try to parse as JSON and extract meaningful status
          try {
            const json = JSON.parse(line);
            const status = parseStreamMessage(json);
            // Only send if we have a friendly status message
            // Skip verbose tool_result JSON and other noise
            if (status) {
              sendEvent("output", { type: "stdout", text: status });
            }
            // If status is null, we intentionally skip sending this line
            // (it's verbose internal data like tool results)
          } catch {
            // Not valid JSON - only send if it looks useful (not empty/whitespace)
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('{')) {
              sendEvent("output", { type: "stdout", text: trimmed });
            }
          }
        }
      });

      // Stream stderr
      claudeProcess.stderr?.on("data", (data: Buffer) => {
        const text = data.toString();
        console.log(`${LOG_PREFIX} [stderr] ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
        sendEvent("output", { type: "stderr", text });
      });

      // Handle process exit
      claudeProcess.on("close", (code) => {
        console.log(`${LOG_PREFIX} Claude process closed with exit code: ${code}`);
        removeLock(projectPath);
        sendEvent("complete", { exitCode: code });
        controller.close();
        console.log(`${LOG_PREFIX} SSE stream closed`);
      });

      // Handle process error
      claudeProcess.on("error", (err) => {
        console.log(`${LOG_PREFIX} Claude process ERROR:`, err.message);
        removeLock(projectPath);
        sendEvent("error", { message: err.message });
        controller.close();
        console.log(`${LOG_PREFIX} SSE stream closed due to error`);
      });
    },
  });

  console.log(`${LOG_PREFIX} Returning SSE Response`);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
