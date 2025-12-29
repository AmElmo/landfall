import type OpenAI from "openai";
import {
  Style,
  Tone,
  Sitemap,
  Page,
  Navigation,
  PageSections,
  Section,
  SectionType,
  SECTION_TYPES,
  STEPS,
} from "./types";

// ============================================================================
// TYPES
// ============================================================================

export interface ChatContext {
  style: Style;
  tone: Tone;
  sitemap: Sitemap;
  navigation: Navigation;
  pages: Record<string, PageSections>;
  currentStep: number;
  currentPageSlug?: string; // For section operations
}

export type ToolResultType =
  | "style"
  | "tone"
  | "sitemap"
  | "navigation"
  | "page";

export interface ToolResult {
  type: ToolResultType;
  changes: Partial<Style | Tone | Sitemap | Navigation | PageSections>;
  pageSlug?: string; // For page-specific changes
  message: string;
}

// ============================================================================
// STYLE TOOLS
// ============================================================================

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

// ============================================================================
// SECTION TOOLS
// ============================================================================

export const sectionTools: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "add_section",
      description: `Add a new section to the current page. Available section types: ${Object.keys(SECTION_TYPES).join(", ")}. Each section type has multiple layout variants. If no variant is specified, the first available variant will be used.`,
      parameters: {
        type: "object",
        properties: {
          sectionType: {
            type: "string",
            enum: Object.keys(SECTION_TYPES),
            description: "The type of section to add",
          },
          layoutVariant: {
            type: "string",
            description:
              "The layout variant/template ID (e.g., 'hero-centered', 'features-three-column-cards'). Optional - will use default if not specified.",
          },
          copyInstructions: {
            type: "string",
            description:
              "Instructions for AI copywriting (e.g., 'Focus on speed and simplicity')",
          },
          visualInstructions: {
            type: "string",
            description:
              "Instructions for visual design (e.g., 'Use a gradient background')",
          },
          position: {
            type: "string",
            enum: ["start", "end"],
            description:
              "Where to add the section: 'start' for beginning, 'end' for end of page. Defaults to 'end'.",
          },
        },
        required: ["sectionType"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remove_section",
      description:
        "Remove a section from the current page by its ID or type. If multiple sections of the same type exist, removes the first one unless index is specified.",
      parameters: {
        type: "object",
        properties: {
          sectionId: {
            type: "string",
            description: "The exact ID of the section to remove",
          },
          sectionType: {
            type: "string",
            enum: Object.keys(SECTION_TYPES),
            description:
              "The type of section to remove (used if sectionId is not provided)",
          },
          index: {
            type: "number",
            description:
              "If multiple sections of the same type exist, which one to remove (0-indexed)",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reorder_sections",
      description:
        "Reorder sections on the current page. Can move a specific section to a new position, or swap two sections.",
      parameters: {
        type: "object",
        properties: {
          sectionId: {
            type: "string",
            description: "The ID of the section to move",
          },
          sectionType: {
            type: "string",
            enum: Object.keys(SECTION_TYPES),
            description:
              "The type of section to move (used if sectionId is not provided)",
          },
          targetPosition: {
            type: "number",
            description:
              "The new position (1-indexed, 1 = first section on page)",
          },
          relativeTo: {
            type: "string",
            description:
              "Move relative to another section type (e.g., 'above features' or 'below hero')",
          },
          direction: {
            type: "string",
            enum: ["above", "below"],
            description: "Whether to place above or below the relativeTo section",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_section",
      description:
        "Update an existing section's copy instructions, visual instructions, or layout variant.",
      parameters: {
        type: "object",
        properties: {
          sectionId: {
            type: "string",
            description: "The ID of the section to update",
          },
          sectionType: {
            type: "string",
            enum: Object.keys(SECTION_TYPES),
            description:
              "The type of section to update (used if sectionId is not provided)",
          },
          copyInstructions: {
            type: "string",
            description: "New copy instructions for the section",
          },
          visualInstructions: {
            type: "string",
            description: "New visual instructions for the section",
          },
          layoutVariant: {
            type: "string",
            description: "New layout variant for the section",
          },
        },
        required: [],
      },
    },
  },
];

// ============================================================================
// TONE TOOLS
// ============================================================================

const TONE_KEYWORDS = [
  "Professional",
  "Friendly",
  "Casual",
  "Formal",
  "Playful",
  "Authoritative",
  "Conversational",
  "Technical",
  "Inspirational",
  "Empathetic",
  "Confident",
  "Approachable",
];

const BRAND_PERSONALITY_TRAITS = [
  "Innovative",
  "Trustworthy",
  "Bold",
  "Reliable",
  "Cutting-edge",
  "Human-centered",
  "Sophisticated",
  "Approachable",
  "Expert",
  "Disruptive",
  "Authentic",
  "Premium",
];

export const toneTools: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "update_tone_keywords",
      description: `Update the tone keywords that describe the brand voice. Choose up to 3 keywords from: ${TONE_KEYWORDS.join(", ")}.`,
      parameters: {
        type: "object",
        properties: {
          keywords: {
            type: "array",
            items: { type: "string" },
            description: "Array of 1-3 tone keywords",
          },
        },
        required: ["keywords"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_brand_personality",
      description: `Update the brand personality traits. Choose up to 3 traits from: ${BRAND_PERSONALITY_TRAITS.join(", ")}.`,
      parameters: {
        type: "object",
        properties: {
          traits: {
            type: "array",
            items: { type: "string" },
            description: "Array of 1-3 personality traits",
          },
        },
        required: ["traits"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_target_audience",
      description:
        "Update the target audience description. This describes who the content is written for.",
      parameters: {
        type: "object",
        properties: {
          audience: {
            type: "string",
            description:
              "Description of the target audience (e.g., 'B2B SaaS executives at growing startups')",
          },
        },
        required: ["audience"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_tone_guidelines",
      description:
        "Update the tone guidelines with do's and don'ts for content creation.",
      parameters: {
        type: "object",
        properties: {
          doItems: {
            type: "array",
            items: { type: "string" },
            description:
              "List of things TO do (e.g., 'Use active voice', 'Be concise')",
          },
          dontItems: {
            type: "array",
            items: { type: "string" },
            description:
              "List of things NOT to do (e.g., 'Avoid jargon', 'Don't be pushy')",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_example_phrases",
      description:
        "Add or update example phrases that capture the brand voice.",
      parameters: {
        type: "object",
        properties: {
          phrases: {
            type: "array",
            items: { type: "string" },
            description:
              "Example phrases that demonstrate the brand voice (e.g., 'Built for scale', 'Enterprise-ready from day one')",
          },
          mode: {
            type: "string",
            enum: ["replace", "append"],
            description:
              "Whether to replace existing phrases or append to them. Defaults to 'append'.",
          },
        },
        required: ["phrases"],
      },
    },
  },
];

// ============================================================================
// NAVIGATION TOOLS
// ============================================================================

export const navigationTools: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "update_navbar",
      description:
        "Update navbar settings including layout, logo, and CTAs.",
      parameters: {
        type: "object",
        properties: {
          layout: {
            type: "string",
            enum: ["logo-left-links-right", "logo-left-links-center", "minimal"],
            description: "Navbar layout style",
          },
          logoText: {
            type: "string",
            description: "Text for the logo (if using text logo)",
          },
          ctaLabel: {
            type: "string",
            description: "Label for the primary CTA button",
          },
          ctaTarget: {
            type: "string",
            description:
              "Target URL or anchor for the CTA (e.g., '/signup' or '#contact')",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_nav_link",
      description: "Add a new link to the navbar.",
      parameters: {
        type: "object",
        properties: {
          label: {
            type: "string",
            description: "Display text for the link",
          },
          target: {
            type: "string",
            description:
              "Target URL, page slug, or anchor (e.g., '/about', 'https://docs.example.com', '#features')",
          },
          type: {
            type: "string",
            enum: ["internal", "external", "anchor"],
            description:
              "Link type: internal (same site), external (other site), anchor (same page section)",
          },
        },
        required: ["label", "target", "type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remove_nav_link",
      description: "Remove a link from the navbar.",
      parameters: {
        type: "object",
        properties: {
          label: {
            type: "string",
            description: "Label of the link to remove",
          },
          index: {
            type: "number",
            description:
              "Index of the link to remove (0-indexed, used if label not provided)",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_footer",
      description:
        "Update footer settings including layout, copyright, and newsletter.",
      parameters: {
        type: "object",
        properties: {
          layout: {
            type: "string",
            enum: [
              "columns-simple",
              "columns-with-logo",
              "centered-minimal",
              "stacked",
            ],
            description: "Footer layout style",
          },
          copyright: {
            type: "string",
            description: "Copyright text",
          },
          enableNewsletter: {
            type: "boolean",
            description: "Whether to show newsletter signup",
          },
          newsletterHeading: {
            type: "string",
            description: "Heading for newsletter section",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_footer_column",
      description: "Add a new column to the footer with links.",
      parameters: {
        type: "object",
        properties: {
          heading: {
            type: "string",
            description: "Column heading (e.g., 'Resources', 'Company')",
          },
          links: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                target: { type: "string" },
              },
              required: ["label", "target"],
            },
            description: "Array of links in the column",
          },
        },
        required: ["heading", "links"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_social_link",
      description: "Add a social media link to the footer.",
      parameters: {
        type: "object",
        properties: {
          platform: {
            type: "string",
            enum: ["twitter", "github", "linkedin", "instagram", "facebook", "youtube"],
            description: "Social media platform",
          },
          url: {
            type: "string",
            description: "Full URL to the social profile",
          },
        },
        required: ["platform", "url"],
      },
    },
  },
];

// ============================================================================
// SITEMAP TOOLS
// ============================================================================

export const sitemapTools: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "add_page",
      description:
        "Add a new page to the sitemap. The page will be created with empty sections.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Display name for the page (e.g., 'Pricing')",
          },
          slug: {
            type: "string",
            description:
              "URL slug for the page (e.g., '/pricing'). Must start with '/'.",
          },
          metaTitle: {
            type: "string",
            description: "Page title for SEO (optional, defaults to name)",
          },
          metaDescription: {
            type: "string",
            description: "Meta description for SEO",
          },
        },
        required: ["name", "slug"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remove_page",
      description:
        "Remove a page from the sitemap. Cannot remove the homepage.",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "Slug of the page to remove (e.g., '/about')",
          },
          name: {
            type: "string",
            description:
              "Name of the page to remove (used if slug not provided)",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_page",
      description: "Update page metadata like title, description, or slug.",
      parameters: {
        type: "object",
        properties: {
          pageSlug: {
            type: "string",
            description: "Current slug of the page to update",
          },
          pageName: {
            type: "string",
            description:
              "Current name of the page to update (used if pageSlug not provided)",
          },
          newName: {
            type: "string",
            description: "New display name",
          },
          newSlug: {
            type: "string",
            description: "New URL slug",
          },
          metaTitle: {
            type: "string",
            description: "New meta title",
          },
          metaDescription: {
            type: "string",
            description: "New meta description",
          },
        },
        required: [],
      },
    },
  },
];

// ============================================================================
// COMBINED TOOLS
// ============================================================================

export const allTools: OpenAI.ChatCompletionTool[] = [
  ...styleTools,
  ...sectionTools,
  ...toneTools,
  ...navigationTools,
  ...sitemapTools,
];

// Tools that include undo/redo functionality
export const allToolsWithUndoRedo: OpenAI.ChatCompletionTool[] = [
  ...allTools,
  // Note: undoRedoTools are defined later in the file and added at export
];

// This will be populated after undoRedoTools is defined
export function getAllToolsWithUndoRedo(): OpenAI.ChatCompletionTool[] {
  // Import undoRedoTools dynamically to avoid circular reference
  return [...allTools];
}

// ============================================================================
// TOOL PROCESSING
// ============================================================================

// Legacy function for backward compatibility
export function processToolCall(
  toolName: string,
  toolInput: Record<string, unknown>,
  currentStyle: Style
): Partial<Style> {
  const result = processStyleTool(toolName, toolInput, currentStyle);
  return result?.changes as Partial<Style> || {};
}

// Process style-related tools
function processStyleTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  currentStyle: Style
): ToolResult | null {
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
      const updatedKeys = Object.keys(colorUpdates);
      return {
        type: "style",
        changes: { colors: { ...currentStyle.colors, ...colorUpdates } },
        message: `Updated colors: ${updatedKeys.join(", ")}`,
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
        type: "style",
        changes: { typography: { ...currentStyle.typography, ...typographyUpdates } },
        message: `Updated typography settings`,
      };
    }

    case "update_style_keywords": {
      if (Array.isArray(toolInput.keywords)) {
        const keywords = toolInput.keywords.slice(0, 3) as string[];
        return {
          type: "style",
          changes: { styleKeywords: keywords },
          message: `Updated style keywords to: ${keywords.join(", ")}`,
        };
      }
      return null;
    }

    case "update_border_radius": {
      if (
        toolInput.borderRadius &&
        ["sharp", "slightly-rounded", "rounded", "pill"].includes(
          toolInput.borderRadius as string
        )
      ) {
        return {
          type: "style",
          changes: { borderRadius: toolInput.borderRadius as Style["borderRadius"] },
          message: `Updated border radius to: ${toolInput.borderRadius}`,
        };
      }
      return null;
    }

    case "update_shadows": {
      if (
        toolInput.shadows &&
        ["none", "subtle", "medium", "dramatic"].includes(
          toolInput.shadows as string
        )
      ) {
        return {
          type: "style",
          changes: { shadows: toolInput.shadows as Style["shadows"] },
          message: `Updated shadows to: ${toolInput.shadows}`,
        };
      }
      return null;
    }

    default:
      return null;
  }
}

// Process section-related tools
function processSectionTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  context: ChatContext
): ToolResult | null {
  const pageSlug = context.currentPageSlug || "/";
  const currentPage = context.pages[pageSlug];

  if (!currentPage) {
    return {
      type: "page",
      changes: {},
      pageSlug,
      message: `Error: Page "${pageSlug}" not found`,
    };
  }

  const sections = [...currentPage.sections];

  switch (toolName) {
    case "add_section": {
      const sectionType = toolInput.sectionType as SectionType;
      if (!sectionType || !SECTION_TYPES[sectionType]) {
        return {
          type: "page",
          changes: {},
          pageSlug,
          message: `Error: Invalid section type "${sectionType}"`,
        };
      }

      const variants = SECTION_TYPES[sectionType].variants;
      const layoutVariant =
        (toolInput.layoutVariant as string) || variants[0]?.id || `${sectionType}-default`;

      const newSection: Section = {
        id: `section_${sectionType}_${Date.now()}`,
        type: sectionType,
        layoutVariant,
        layoutTemplateId: layoutVariant,
        order: toolInput.position === "start" ? 0 : sections.length + 1,
        copyInstructions: (toolInput.copyInstructions as string) || "",
        visualInstructions: (toolInput.visualInstructions as string) || "",
        inspirations: [],
      };

      let updatedSections: Section[];
      if (toolInput.position === "start") {
        updatedSections = [newSection, ...sections.map((s, i) => ({ ...s, order: i + 2 }))];
      } else {
        updatedSections = [...sections, newSection];
      }

      // Renumber all sections
      updatedSections = updatedSections.map((s, i) => ({ ...s, order: i + 1 }));

      return {
        type: "page",
        changes: { pageId: currentPage.pageId, sections: updatedSections },
        pageSlug,
        message: `Added ${SECTION_TYPES[sectionType].name} section with layout "${layoutVariant}"`,
      };
    }

    case "remove_section": {
      const sectionId = toolInput.sectionId as string | undefined;
      const sectionType = toolInput.sectionType as SectionType | undefined;
      const index = (toolInput.index as number) ?? 0;

      let sectionToRemove: Section | undefined;

      if (sectionId) {
        sectionToRemove = sections.find((s) => s.id === sectionId);
      } else if (sectionType) {
        const matchingSections = sections.filter((s) => s.type === sectionType);
        sectionToRemove = matchingSections[index];
      }

      if (!sectionToRemove) {
        return {
          type: "page",
          changes: {},
          pageSlug,
          message: `Error: Section not found`,
        };
      }

      const updatedSections = sections
        .filter((s) => s.id !== sectionToRemove!.id)
        .map((s, i) => ({ ...s, order: i + 1 }));

      return {
        type: "page",
        changes: { pageId: currentPage.pageId, sections: updatedSections },
        pageSlug,
        message: `Removed ${sectionToRemove.type} section`,
      };
    }

    case "reorder_sections": {
      const sectionId = toolInput.sectionId as string | undefined;
      const sectionType = toolInput.sectionType as SectionType | undefined;
      const targetPosition = toolInput.targetPosition as number | undefined;
      const relativeTo = toolInput.relativeTo as string | undefined;
      const direction = (toolInput.direction as "above" | "below") || "above";

      // Find the section to move
      let sectionToMove: Section | undefined;
      if (sectionId) {
        sectionToMove = sections.find((s) => s.id === sectionId);
      } else if (sectionType) {
        sectionToMove = sections.find((s) => s.type === sectionType);
      }

      if (!sectionToMove) {
        return {
          type: "page",
          changes: {},
          pageSlug,
          message: `Error: Section to move not found`,
        };
      }

      // Remove the section from its current position
      let updatedSections = sections.filter((s) => s.id !== sectionToMove!.id);

      // Calculate new position
      let newPosition: number;
      if (targetPosition !== undefined) {
        newPosition = Math.max(0, Math.min(targetPosition - 1, updatedSections.length));
      } else if (relativeTo) {
        const relativeSection = sections.find(
          (s) => s.type === relativeTo || s.id === relativeTo
        );
        if (relativeSection) {
          const relativeIndex = updatedSections.findIndex(
            (s) => s.id === relativeSection.id
          );
          newPosition = direction === "above" ? relativeIndex : relativeIndex + 1;
        } else {
          newPosition = updatedSections.length;
        }
      } else {
        return {
          type: "page",
          changes: {},
          pageSlug,
          message: `Error: Must specify targetPosition or relativeTo`,
        };
      }

      // Insert at new position
      updatedSections.splice(newPosition, 0, sectionToMove);

      // Renumber
      updatedSections = updatedSections.map((s, i) => ({ ...s, order: i + 1 }));

      return {
        type: "page",
        changes: { pageId: currentPage.pageId, sections: updatedSections },
        pageSlug,
        message: `Moved ${sectionToMove.type} section to position ${newPosition + 1}`,
      };
    }

    case "update_section": {
      const sectionId = toolInput.sectionId as string | undefined;
      const sectionType = toolInput.sectionType as SectionType | undefined;

      let sectionIndex: number = -1;
      if (sectionId) {
        sectionIndex = sections.findIndex((s) => s.id === sectionId);
      } else if (sectionType) {
        sectionIndex = sections.findIndex((s) => s.type === sectionType);
      }

      if (sectionIndex === -1) {
        return {
          type: "page",
          changes: {},
          pageSlug,
          message: `Error: Section not found`,
        };
      }

      const section = sections[sectionIndex];
      const updatedSection: Section = {
        ...section,
        copyInstructions:
          (toolInput.copyInstructions as string) ?? section.copyInstructions,
        visualInstructions:
          (toolInput.visualInstructions as string) ?? section.visualInstructions,
        layoutVariant: (toolInput.layoutVariant as string) ?? section.layoutVariant,
        layoutTemplateId:
          (toolInput.layoutVariant as string) ?? section.layoutTemplateId,
      };

      const updatedSections = [...sections];
      updatedSections[sectionIndex] = updatedSection;

      const updatedFields: string[] = [];
      if (toolInput.copyInstructions) updatedFields.push("copy instructions");
      if (toolInput.visualInstructions) updatedFields.push("visual instructions");
      if (toolInput.layoutVariant) updatedFields.push("layout");

      return {
        type: "page",
        changes: { pageId: currentPage.pageId, sections: updatedSections },
        pageSlug,
        message: `Updated ${section.type} section: ${updatedFields.join(", ")}`,
      };
    }

    default:
      return null;
  }
}

// Process tone-related tools
function processToneTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  currentTone: Tone
): ToolResult | null {
  switch (toolName) {
    case "update_tone_keywords": {
      if (Array.isArray(toolInput.keywords)) {
        const keywords = toolInput.keywords.slice(0, 3) as string[];
        return {
          type: "tone",
          changes: { toneKeywords: keywords },
          message: `Updated tone keywords to: ${keywords.join(", ")}`,
        };
      }
      return null;
    }

    case "update_brand_personality": {
      if (Array.isArray(toolInput.traits)) {
        const traits = toolInput.traits.slice(0, 3) as string[];
        return {
          type: "tone",
          changes: { brandPersonality: traits },
          message: `Updated brand personality to: ${traits.join(", ")}`,
        };
      }
      return null;
    }

    case "update_target_audience": {
      if (typeof toolInput.audience === "string") {
        return {
          type: "tone",
          changes: { targetAudience: toolInput.audience },
          message: `Updated target audience to: "${toolInput.audience}"`,
        };
      }
      return null;
    }

    case "update_tone_guidelines": {
      const updates: Partial<Tone["guidelines"]> = {};
      const messages: string[] = [];

      if (Array.isArray(toolInput.doItems)) {
        updates.do = [...currentTone.guidelines.do, ...(toolInput.doItems as string[])];
        messages.push(`Added ${toolInput.doItems.length} do's`);
      }
      if (Array.isArray(toolInput.dontItems)) {
        updates.dont = [...currentTone.guidelines.dont, ...(toolInput.dontItems as string[])];
        messages.push(`Added ${toolInput.dontItems.length} don'ts`);
      }

      if (messages.length === 0) return null;

      return {
        type: "tone",
        changes: {
          guidelines: { ...currentTone.guidelines, ...updates },
        },
        message: messages.join(", "),
      };
    }

    case "update_example_phrases": {
      if (Array.isArray(toolInput.phrases)) {
        const mode = (toolInput.mode as string) || "append";
        const phrases =
          mode === "replace"
            ? (toolInput.phrases as string[])
            : [...currentTone.examplePhrases, ...(toolInput.phrases as string[])];

        return {
          type: "tone",
          changes: { examplePhrases: phrases },
          message: `${mode === "replace" ? "Set" : "Added"} example phrases`,
        };
      }
      return null;
    }

    default:
      return null;
  }
}

// Process navigation-related tools
function processNavigationTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  currentNavigation: Navigation
): ToolResult | null {
  switch (toolName) {
    case "update_navbar": {
      const updates: Partial<Navigation["navbar"]> = {};
      const messages: string[] = [];

      if (toolInput.layout) {
        updates.layout = toolInput.layout as Navigation["navbar"]["layout"];
        messages.push(`layout to "${toolInput.layout}"`);
      }
      if (toolInput.logoText) {
        updates.logo = {
          ...currentNavigation.navbar.logo,
          type: "text",
          value: toolInput.logoText as string,
        };
        messages.push(`logo text to "${toolInput.logoText}"`);
      }
      if (toolInput.ctaLabel || toolInput.ctaTarget) {
        const existingCta = currentNavigation.navbar.cta[0] || {
          label: "Get Started",
          target: "#",
          style: "primary" as const,
        };
        updates.cta = [
          {
            ...existingCta,
            label: (toolInput.ctaLabel as string) || existingCta.label,
            target: (toolInput.ctaTarget as string) || existingCta.target,
          },
          ...currentNavigation.navbar.cta.slice(1),
        ];
        messages.push("CTA button");
      }

      if (messages.length === 0) return null;

      return {
        type: "navigation",
        changes: {
          navbar: { ...currentNavigation.navbar, ...updates },
          footer: currentNavigation.footer,
        },
        message: `Updated navbar: ${messages.join(", ")}`,
      };
    }

    case "add_nav_link": {
      const { label, target, type } = toolInput as {
        label: string;
        target: string;
        type: "internal" | "external" | "anchor";
      };

      if (!label || !target || !type) {
        return {
          type: "navigation",
          changes: {},
          message: "Error: Missing required fields for nav link",
        };
      }

      const newLink = { label, target, type };
      const updatedLinks = [...currentNavigation.navbar.links, newLink];

      return {
        type: "navigation",
        changes: {
          navbar: { ...currentNavigation.navbar, links: updatedLinks },
          footer: currentNavigation.footer,
        },
        message: `Added navbar link: "${label}"`,
      };
    }

    case "remove_nav_link": {
      const label = toolInput.label as string | undefined;
      const index = toolInput.index as number | undefined;

      let removeIndex: number = -1;
      if (label) {
        removeIndex = currentNavigation.navbar.links.findIndex(
          (l) => l.label.toLowerCase() === label.toLowerCase()
        );
      } else if (index !== undefined) {
        removeIndex = index;
      }

      if (removeIndex === -1 || removeIndex >= currentNavigation.navbar.links.length) {
        return {
          type: "navigation",
          changes: {},
          message: "Error: Nav link not found",
        };
      }

      const removedLabel = currentNavigation.navbar.links[removeIndex].label;
      const updatedLinks = currentNavigation.navbar.links.filter((_, i) => i !== removeIndex);

      return {
        type: "navigation",
        changes: {
          navbar: { ...currentNavigation.navbar, links: updatedLinks },
          footer: currentNavigation.footer,
        },
        message: `Removed navbar link: "${removedLabel}"`,
      };
    }

    case "update_footer": {
      const updates: Partial<Navigation["footer"]> = {};
      const messages: string[] = [];

      if (toolInput.layout) {
        updates.layout = toolInput.layout as Navigation["footer"]["layout"];
        messages.push(`layout to "${toolInput.layout}"`);
      }
      if (toolInput.copyright) {
        updates.copyright = toolInput.copyright as string;
        messages.push("copyright text");
      }
      if (toolInput.enableNewsletter !== undefined) {
        updates.newsletter = {
          ...currentNavigation.footer.newsletter,
          enabled: toolInput.enableNewsletter as boolean,
        };
        messages.push(
          `newsletter ${toolInput.enableNewsletter ? "enabled" : "disabled"}`
        );
      }
      if (toolInput.newsletterHeading) {
        updates.newsletter = {
          ...currentNavigation.footer.newsletter,
          ...(updates.newsletter || {}),
          heading: toolInput.newsletterHeading as string,
        };
        messages.push("newsletter heading");
      }

      if (messages.length === 0) return null;

      return {
        type: "navigation",
        changes: {
          navbar: currentNavigation.navbar,
          footer: { ...currentNavigation.footer, ...updates },
        },
        message: `Updated footer: ${messages.join(", ")}`,
      };
    }

    case "add_footer_column": {
      const heading = toolInput.heading as string;
      const links = toolInput.links as { label: string; target: string }[];

      if (!heading || !links) {
        return {
          type: "navigation",
          changes: {},
          message: "Error: Missing heading or links for footer column",
        };
      }

      const newColumn = { heading, links };
      const updatedColumns = [...currentNavigation.footer.columns, newColumn];

      return {
        type: "navigation",
        changes: {
          navbar: currentNavigation.navbar,
          footer: { ...currentNavigation.footer, columns: updatedColumns },
        },
        message: `Added footer column: "${heading}" with ${links.length} links`,
      };
    }

    case "add_social_link": {
      const platform = toolInput.platform as string;
      const url = toolInput.url as string;

      if (!platform || !url) {
        return {
          type: "navigation",
          changes: {},
          message: "Error: Missing platform or URL for social link",
        };
      }

      // Check if platform already exists
      const existingIndex = currentNavigation.footer.social.findIndex(
        (s) => s.platform === platform
      );

      let updatedSocial;
      if (existingIndex >= 0) {
        updatedSocial = [...currentNavigation.footer.social];
        updatedSocial[existingIndex] = { platform, url };
      } else {
        updatedSocial = [...currentNavigation.footer.social, { platform, url }];
      }

      return {
        type: "navigation",
        changes: {
          navbar: currentNavigation.navbar,
          footer: { ...currentNavigation.footer, social: updatedSocial },
        },
        message: `${existingIndex >= 0 ? "Updated" : "Added"} ${platform} social link`,
      };
    }

    default:
      return null;
  }
}

// Process sitemap-related tools
function processSitemapTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  currentSitemap: Sitemap
): ToolResult | null {
  switch (toolName) {
    case "add_page": {
      const name = toolInput.name as string;
      let slug = toolInput.slug as string;

      if (!name || !slug) {
        return {
          type: "sitemap",
          changes: {},
          message: "Error: Missing name or slug for new page",
        };
      }

      // Ensure slug starts with /
      if (!slug.startsWith("/")) {
        slug = "/" + slug;
      }

      // Check if page already exists
      if (currentSitemap.pages.some((p) => p.slug === slug)) {
        return {
          type: "sitemap",
          changes: {},
          message: `Error: Page with slug "${slug}" already exists`,
        };
      }

      const newPage: Page = {
        id: `page_${name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`,
        name,
        slug,
        isHomepage: false,
        metaTitle: (toolInput.metaTitle as string) || name,
        metaDescription: (toolInput.metaDescription as string) || "",
      };

      return {
        type: "sitemap",
        changes: { pages: [...currentSitemap.pages, newPage] },
        message: `Added new page: "${name}" at ${slug}`,
      };
    }

    case "remove_page": {
      const slug = toolInput.slug as string | undefined;
      const name = toolInput.name as string | undefined;

      let pageToRemove: Page | undefined;
      if (slug) {
        pageToRemove = currentSitemap.pages.find((p) => p.slug === slug);
      } else if (name) {
        pageToRemove = currentSitemap.pages.find(
          (p) => p.name.toLowerCase() === name.toLowerCase()
        );
      }

      if (!pageToRemove) {
        return {
          type: "sitemap",
          changes: {},
          message: "Error: Page not found",
        };
      }

      if (pageToRemove.isHomepage) {
        return {
          type: "sitemap",
          changes: {},
          message: "Error: Cannot remove the homepage",
        };
      }

      const updatedPages = currentSitemap.pages.filter(
        (p) => p.id !== pageToRemove!.id
      );

      return {
        type: "sitemap",
        changes: { pages: updatedPages },
        message: `Removed page: "${pageToRemove.name}"`,
      };
    }

    case "update_page": {
      const pageSlug = toolInput.pageSlug as string | undefined;
      const pageName = toolInput.pageName as string | undefined;

      let pageIndex: number = -1;
      if (pageSlug) {
        pageIndex = currentSitemap.pages.findIndex((p) => p.slug === pageSlug);
      } else if (pageName) {
        pageIndex = currentSitemap.pages.findIndex(
          (p) => p.name.toLowerCase() === pageName.toLowerCase()
        );
      }

      if (pageIndex === -1) {
        return {
          type: "sitemap",
          changes: {},
          message: "Error: Page not found",
        };
      }

      const page = currentSitemap.pages[pageIndex];
      const updatedPage: Page = {
        ...page,
        name: (toolInput.newName as string) || page.name,
        slug: (toolInput.newSlug as string) || page.slug,
        metaTitle: (toolInput.metaTitle as string) || page.metaTitle,
        metaDescription: (toolInput.metaDescription as string) || page.metaDescription,
      };

      const updatedPages = [...currentSitemap.pages];
      updatedPages[pageIndex] = updatedPage;

      const updatedFields: string[] = [];
      if (toolInput.newName) updatedFields.push("name");
      if (toolInput.newSlug) updatedFields.push("slug");
      if (toolInput.metaTitle) updatedFields.push("title");
      if (toolInput.metaDescription) updatedFields.push("description");

      return {
        type: "sitemap",
        changes: { pages: updatedPages },
        message: `Updated page "${page.name}": ${updatedFields.join(", ")}`,
      };
    }

    default:
      return null;
  }
}

// Main function to process any tool call
export function processAllToolCalls(
  toolName: string,
  toolInput: Record<string, unknown>,
  context: ChatContext
): ToolResult | null {
  // Try style tools
  const styleResult = processStyleTool(toolName, toolInput, context.style);
  if (styleResult) return styleResult;

  // Try section tools
  const sectionResult = processSectionTool(toolName, toolInput, context);
  if (sectionResult) return sectionResult;

  // Try tone tools
  const toneResult = processToneTool(toolName, toolInput, context.tone);
  if (toneResult) return toneResult;

  // Try navigation tools
  const navResult = processNavigationTool(toolName, toolInput, context.navigation);
  if (navResult) return navResult;

  // Try sitemap tools
  const sitemapResult = processSitemapTool(toolName, toolInput, context.sitemap);
  if (sitemapResult) return sitemapResult;

  return null;
}

// ============================================================================
// UNDO/REDO TOOLS
// ============================================================================

export const undoRedoTools: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "undo_last_change",
      description:
        "Undo the last change(s) made to the configuration. Use when the user says 'undo', 'revert', 'go back', or wants to cancel recent changes. You can undo multiple changes at once by specifying a count.",
      parameters: {
        type: "object",
        properties: {
          count: {
            type: "number",
            description:
              "Number of changes to undo (default: 1). Use higher numbers when user says 'undo the last 3 changes' or similar.",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "redo_change",
      description:
        "Redo a previously undone change. Use when the user says 'redo', 'put it back', or wants to restore an undone change.",
      parameters: {
        type: "object",
        properties: {
          count: {
            type: "number",
            description: "Number of changes to redo (default: 1)",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_change_history",
      description:
        "Get a summary of recent changes made in this session. Use when the user asks 'what did you change?', 'show me the history', or wants to see what modifications were made.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of changes to show (default: 10)",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "clear_conversation",
      description:
        "Clear the chat conversation history. Use when the user says 'start fresh', 'clear the chat', or 'new conversation'. Note: This clears the chat messages but preserves the change history for undo/redo.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
];

// ============================================================================
// SYSTEM PROMPT GENERATION
// ============================================================================

// Generate system prompt with full context
export function generateSystemPrompt(
  context: ChatContext,
  styleOnly?: boolean
): string {
  // For backward compatibility, if only style is passed as first argument
  if (styleOnly === undefined && !("tone" in context)) {
    const style = context as unknown as Style;
    return generateStyleOnlyPrompt(style);
  }

  const currentStep = STEPS.find((s) => s.id === context.currentStep);
  const stepName = currentStep?.name || "Unknown";
  const stepDescription = currentStep?.description || "";

  // Get section info for current page if applicable
  const currentPageSlug = context.currentPageSlug || "/";
  const currentPage = context.pages[currentPageSlug];
  const sectionsInfo = currentPage
    ? currentPage.sections.map((s) => `${s.order}. ${s.type} (${s.layoutVariant})`).join("\n")
    : "No sections yet";

  return `You are a helpful design and content assistant for Landfall, a landing page builder. You help users design their entire landing page through natural conversation.

## Current Step
You are currently on the **${stepName}** step: ${stepDescription}

${getStepSpecificGuidance(context.currentStep)}

## Your Capabilities

### Style Tools (Step 1: Style)
- **update_colors**: Change any color in the palette
- **update_typography**: Set heading/body fonts and scale
- **update_style_keywords**: Set up to 3 design keywords (Modern, Minimal, Bold, etc.)
- **update_border_radius**: Set corner style (sharp, slightly-rounded, rounded, pill)
- **update_shadows**: Set shadow intensity (none, subtle, medium, dramatic)

### Tone Tools (Step 2: Tone)
- **update_tone_keywords**: Set voice keywords (Professional, Friendly, Casual, etc.)
- **update_brand_personality**: Set personality traits (Innovative, Trustworthy, etc.)
- **update_target_audience**: Define who the content is for
- **update_tone_guidelines**: Add do's and don'ts for copywriting
- **update_example_phrases**: Add sample phrases that capture the brand voice

### Sitemap Tools (Step 3: Sitemap)
- **add_page**: Create a new page (name, slug, meta info)
- **remove_page**: Delete a page (cannot remove homepage)
- **update_page**: Update page metadata

### Section Tools (Step 4: Sections)
- **add_section**: Add a section to the current page (type, layout, instructions)
- **remove_section**: Remove a section
- **reorder_sections**: Move sections around
- **update_section**: Update copy/visual instructions or layout

Available section types: ${Object.keys(SECTION_TYPES).join(", ")}

### Navigation Tools (Step 6: Navigation)
- **update_navbar**: Change navbar layout, logo, CTAs
- **add_nav_link**: Add a navigation link
- **remove_nav_link**: Remove a navigation link
- **update_footer**: Change footer layout, copyright, newsletter settings
- **add_footer_column**: Add a column with links to the footer
- **add_social_link**: Add a social media link

### Undo/Redo Tools (Available Anytime)
- **undo_last_change**: Undo one or more recent changes
- **redo_change**: Redo previously undone changes
- **get_change_history**: Show what changes were made
- **clear_conversation**: Start a fresh conversation (preserves change history)

## Current Configuration

### Style
\`\`\`json
${JSON.stringify(context.style, null, 2)}
\`\`\`

### Tone
\`\`\`json
${JSON.stringify(context.tone, null, 2)}
\`\`\`

### Pages
${context.sitemap.pages.map((p) => `- ${p.name} (${p.slug})${p.isHomepage ? " [Homepage]" : ""}`).join("\n")}

### Current Page Sections (${currentPageSlug})
${sectionsInfo}

### Navigation
Navbar Links: ${context.navigation.navbar.links.map((l) => l.label).join(", ") || "None"}
Footer Columns: ${context.navigation.footer.columns.map((c) => c.heading).join(", ") || "None"}

## Guidelines
1. When users make requests, use the appropriate tools to make changes
2. After making changes, confirm what you changed with specific details
3. If a request is vague or unclear, ask clarifying questions
4. For complex requests, make multiple coordinated tool calls
5. Be conversational and helpful, explaining your choices briefly
6. Be proactive - if you notice opportunities for improvement, suggest them
7. Consider the current step context when making suggestions

## Important
- Always use hex color codes for colors (e.g., #3b82f6)
- Keywords should be capitalized (e.g., "Modern" not "modern")
- You can make multiple tool calls in one response for coordinated changes
- Section IDs are auto-generated, use sectionType for most operations`;
}

// Generate step-specific guidance
function getStepSpecificGuidance(stepId: number): string {
  switch (stepId) {
    case 1: // Style
      return `**Step Focus**: Help users define their visual identity - colors, typography, and design feel.
Ask about their brand colors, preferred aesthetic (modern, classic, playful), and any design inspirations.`;
    case 2: // Tone
      return `**Step Focus**: Help users define their brand voice and messaging style.
Ask about their target audience, brand personality, and how they want to communicate.`;
    case 3: // Sitemap
      return `**Step Focus**: Help users plan their page structure.
Ask about what pages they need - common ones include About, Pricing, Features, Contact.`;
    case 4: // Sections
      return `**Step Focus**: Help users build their page layouts with sections.
Suggest section types based on their goals. A typical landing page might have: Hero, Features, Testimonials, Pricing, FAQ, CTA.`;
    case 5: // Copy & Visuals
      return `**Step Focus**: Help users refine content instructions for each section.
Suggest copy angles, tone adjustments, and visual concepts for each section.`;
    case 6: // Navigation
      return `**Step Focus**: Help users configure their navbar and footer.
Suggest links based on their sitemap, add CTAs, and organize footer content.`;
    case 7: // Preview
      return `**Step Focus**: Users are reviewing their wireframes.
Help them spot improvements and make last-minute adjustments.`;
    case 8: // Build
      return `**Step Focus**: Users are ready to generate prompts.
Answer questions about the build process and make any final tweaks.`;
    default:
      return "";
  }
}

// Legacy prompt for backward compatibility
function generateStyleOnlyPrompt(style: Style): string {
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

// ============================================================================
// COMBINED TOOLS WITH UNDO/REDO
// ============================================================================

// Complete tool set including undo/redo capabilities
export const completeToolSet: OpenAI.ChatCompletionTool[] = [
  ...styleTools,
  ...sectionTools,
  ...toneTools,
  ...navigationTools,
  ...sitemapTools,
  ...undoRedoTools,
];
