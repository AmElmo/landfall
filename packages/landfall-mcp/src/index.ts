#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";

import {
  getProjectInfo,
  getNextPrompt,
  getPrompt,
  markComplete,
  getStatus,
  LandfallError,
} from "./tools.js";

// Define the MCP tools
const TOOLS: Tool[] = [
  {
    name: "landfall_get_project_info",
    description:
      "Get overview of the current Landfall project including project name, number of pages, total build steps, and completed steps. Use this to understand the scope of the project before starting.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "landfall_get_next_prompt",
    description:
      "Get the next unexecuted build prompt. Returns the step number, name, description, and full prompt text. Returns null if all steps are complete. Use this to get the next task to work on.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "landfall_get_prompt",
    description:
      "Get a specific build prompt by step number. Use this to retrieve or re-read a particular step.",
    inputSchema: {
      type: "object" as const,
      properties: {
        step: {
          type: "number",
          description: "The step number to retrieve (1-based)",
        },
      },
      required: ["step"],
    },
  },
  {
    name: "landfall_mark_complete",
    description:
      "Mark a build step as complete. Optionally add notes about the implementation. After marking complete, returns info about the next step.",
    inputSchema: {
      type: "object" as const,
      properties: {
        step: {
          type: "number",
          description: "The step number to mark as complete (1-based)",
        },
        notes: {
          type: "string",
          description:
            "Optional notes about the implementation (e.g., files created, decisions made)",
        },
      },
      required: ["step"],
    },
  },
  {
    name: "landfall_get_status",
    description:
      "Get the current build status including total steps, completed steps, current step, and percent complete. Use this to check progress.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

// Create the MCP server
const server = new Server(
  {
    name: "landfall-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "landfall_get_project_info": {
        const result = getProjectInfo();
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "landfall_get_next_prompt": {
        const result = getNextPrompt();
        if (result === null) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  message: "All steps are complete! The build is finished.",
                  isComplete: true,
                }),
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "landfall_get_prompt": {
        const step = (args as { step: number }).step;
        if (typeof step !== "number") {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: "step must be a number" }),
              },
            ],
            isError: true,
          };
        }
        const result = getPrompt(step);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "landfall_mark_complete": {
        const { step, notes } = args as { step: number; notes?: string };
        if (typeof step !== "number") {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: "step must be a number" }),
              },
            ],
            isError: true,
          };
        }
        const result = markComplete(step, notes);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "landfall_get_status": {
        const result = getStatus();
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: `Unknown tool: ${name}` }),
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    if (error instanceof LandfallError) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: error.message }),
          },
        ],
        isError: true,
      };
    }

    // Unknown error
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ error: errorMessage }),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Landfall MCP server running on stdio");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
