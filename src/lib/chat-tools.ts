import type OpenAI from "openai";
import { Style } from "./types";

// Tool definitions for OpenAI-compatible function calling (works with OpenRouter)
export const styleTools: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "update_colors",
      description:
        "Update one or more colors in the style. Use this to change the color palette. Colors should be valid hex color codes (e.g., #3b82f6). You can update: primary (main brand color), primaryLight, primaryDark, secondary (secondary accent), accent (tertiary accent), background (page background), backgroundAlt, text (main text color), textMuted (secondary text), border, success, error.",
      parameters: {
        type: "object",
        properties: {
          primary: {
            type: "string",
            description: "Main brand/accent color (hex)",
          },
          primaryLight: {
            type: "string",
            description: "Light variant of primary (hex)",
          },
          primaryDark: {
            type: "string",
            description: "Dark variant of primary (hex)",
          },
          secondary: {
            type: "string",
            description: "Secondary accent color (hex)",
          },
          accent: {
            type: "string",
            description: "Tertiary accent color (hex)",
          },
          background: {
            type: "string",
            description: "Page background color (hex)",
          },
          backgroundAlt: {
            type: "string",
            description: "Alternative background color (hex)",
          },
          text: {
            type: "string",
            description: "Main text color (hex)",
          },
          textMuted: {
            type: "string",
            description: "Secondary/muted text color (hex)",
          },
          border: {
            type: "string",
            description: "Border color (hex)",
          },
          success: {
            type: "string",
            description: "Success state color (hex)",
          },
          error: {
            type: "string",
            description: "Error state color (hex)",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_typography",
      description:
        "Update typography settings including fonts and scale. Available fonts include: Inter, Plus Jakarta Sans, Sora, Poppins, DM Sans, Outfit, Manrope, Space Grotesk, Work Sans, Nunito Sans, Lato, Roboto, Playfair Display, Merriweather, Lora, Libre Baskerville, Source Serif Pro.",
      parameters: {
        type: "object",
        properties: {
          headingFont: {
            type: "string",
            description: "Font family for headings",
          },
          bodyFont: {
            type: "string",
            description: "Font family for body text",
          },
          scale: {
            type: "string",
            enum: ["compact", "default", "spacious"],
            description: "Typography scale - affects spacing and size relationships",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_style_keywords",
      description:
        "Update the style keywords that describe the design aesthetic. Choose up to 3 keywords from: Modern, Minimal, Clean, Bold, Playful, Professional, Elegant, Corporate, Friendly, Creative, Tech, Luxury.",
      parameters: {
        type: "object",
        properties: {
          keywords: {
            type: "array",
            items: { type: "string" },
            description: "Array of 1-3 style keywords",
          },
        },
        required: ["keywords"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_border_radius",
      description:
        "Update the border radius style for UI elements like buttons, cards, and inputs.",
      parameters: {
        type: "object",
        properties: {
          borderRadius: {
            type: "string",
            enum: ["sharp", "slightly-rounded", "rounded", "pill"],
            description:
              "Border radius style: sharp (0), slightly-rounded (4px), rounded (8px), pill (full)",
          },
        },
        required: ["borderRadius"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_shadows",
      description:
        "Update the shadow intensity used across the design for depth and elevation.",
      parameters: {
        type: "object",
        properties: {
          shadows: {
            type: "string",
            enum: ["none", "subtle", "medium", "dramatic"],
            description: "Shadow intensity level",
          },
        },
        required: ["shadows"],
      },
    },
  },
];

// Process tool calls and return style updates
export function processToolCall(
  toolName: string,
  toolInput: Record<string, unknown>,
  currentStyle: Style
): Partial<Style> {
  switch (toolName) {
    case "update_colors": {
      const colorUpdates: Record<string, string> = {};
      const colorKeys = [
        "primary",
        "primaryLight",
        "primaryDark",
        "secondary",
        "accent",
        "background",
        "backgroundAlt",
        "text",
        "textMuted",
        "border",
        "success",
        "error",
      ];
      for (const key of colorKeys) {
        if (toolInput[key] && typeof toolInput[key] === "string") {
          colorUpdates[key] = toolInput[key] as string;
        }
      }
      return {
        colors: { ...currentStyle.colors, ...colorUpdates },
      };
    }

    case "update_typography": {
      const typographyUpdates: Partial<Style["typography"]> = {};
      if (toolInput.headingFont && typeof toolInput.headingFont === "string") {
        typographyUpdates.headingFont = toolInput.headingFont;
      }
      if (toolInput.bodyFont && typeof toolInput.bodyFont === "string") {
        typographyUpdates.bodyFont = toolInput.bodyFont;
      }
      if (
        toolInput.scale &&
        ["compact", "default", "spacious"].includes(toolInput.scale as string)
      ) {
        typographyUpdates.scale = toolInput.scale as Style["typography"]["scale"];
      }
      return {
        typography: { ...currentStyle.typography, ...typographyUpdates },
      };
    }

    case "update_style_keywords": {
      if (Array.isArray(toolInput.keywords)) {
        return {
          styleKeywords: toolInput.keywords.slice(0, 3) as string[],
        };
      }
      return {};
    }

    case "update_border_radius": {
      if (
        toolInput.borderRadius &&
        ["sharp", "slightly-rounded", "rounded", "pill"].includes(
          toolInput.borderRadius as string
        )
      ) {
        return {
          borderRadius: toolInput.borderRadius as Style["borderRadius"],
        };
      }
      return {};
    }

    case "update_shadows": {
      if (
        toolInput.shadows &&
        ["none", "subtle", "medium", "dramatic"].includes(
          toolInput.shadows as string
        )
      ) {
        return {
          shadows: toolInput.shadows as Style["shadows"],
        };
      }
      return {};
    }

    default:
      return {};
  }
}

// Generate system prompt with current style context
export function generateSystemPrompt(style: Style): string {
  return `You are a helpful design assistant for Landfall, a landing page builder. You help users refine the visual style of their landing page through natural conversation.

## Your Capabilities
You can modify the following style properties using the provided tools:
- **Colors**: primary, secondary, accent, background, text, and more
- **Typography**: heading font, body font, and scale
- **Style Keywords**: descriptive words like Modern, Minimal, Bold, etc.
- **Border Radius**: sharp, slightly-rounded, rounded, or pill
- **Shadows**: none, subtle, medium, or dramatic

## Current Style Configuration
\`\`\`json
${JSON.stringify(style, null, 2)}
\`\`\`

## Guidelines
1. When users make requests, use the appropriate tools to make changes
2. After making changes, confirm what you changed with specific values (e.g., "I've updated the primary color to navy blue (#1e3a5f)")
3. If a request is vague or unclear, ask clarifying questions before making changes
4. Consider color harmony when suggesting palettes
5. For complex requests (like "make it look like Linear"), make multiple coordinated changes
6. Be conversational and helpful, explaining your design choices briefly

## Important
- Always use hex color codes (e.g., #3b82f6)
- Style keywords should be capitalized (e.g., "Modern" not "modern")
- You can make multiple tool calls in one response for coordinated changes`;
}
