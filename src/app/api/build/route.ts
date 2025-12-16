import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

function getLandfallDir(): string {
  const projectPath = process.env.LANDFALL_PROJECT_PATH || process.cwd();
  return path.join(projectPath, "landfall");
}

interface BuildPrompt {
  step: number;
  name: string;
  description: string;
  prompt: string;
}

export async function POST(request: NextRequest) {
  try {
    const landfallDir = getLandfallDir();

    // Read all configuration files
    const [style, tone, sitemap, navigation] = await Promise.all([
      fs.readFile(path.join(landfallDir, "style.json"), "utf-8").then(JSON.parse),
      fs.readFile(path.join(landfallDir, "tone.json"), "utf-8").then(JSON.parse),
      fs.readFile(path.join(landfallDir, "sitemap.json"), "utf-8").then(JSON.parse),
      fs.readFile(path.join(landfallDir, "navigation.json"), "utf-8").then(JSON.parse),
    ]);

    const prompts: BuildPrompt[] = [];
    let stepNumber = 1;

    // Prompt 1: Setup Style System
    prompts.push({
      step: stepNumber++,
      name: "Setup Style System",
      description: "Implement global styles, colors, typography",
      prompt: generateStylePrompt(style),
    });

    // Prompt 2: Create Sitemap & Layout
    prompts.push({
      step: stepNumber++,
      name: "Create Sitemap & Layout",
      description: "Setup pages and shared layout components",
      prompt: generateLayoutPrompt(sitemap, navigation, tone),
    });

    // Generate section prompts for each page
    for (const page of sitemap.pages) {
      const pageSlug = page.slug === "/" ? "home" : page.slug.replace(/^\//, "");
      const pagePath = path.join(landfallDir, "pages", `${pageSlug}.json`);

      try {
        const pageData = await fs.readFile(pagePath, "utf-8").then(JSON.parse);

        for (const section of pageData.sections || []) {
          prompts.push({
            step: stepNumber++,
            name: `${page.name} - ${formatSectionType(section.type)}`,
            description: `Build ${section.type} section for ${page.name} page`,
            prompt: generateSectionPrompt(page, section, tone, style),
          });
        }
      } catch (e) {
        // Page file doesn't exist, skip
      }
    }

    // Save build sequence
    const buildSequence = {
      generatedAt: new Date().toISOString(),
      totalPrompts: prompts.length,
      prompts,
    };

    await fs.mkdir(path.join(landfallDir, "prompts"), { recursive: true });
    await fs.writeFile(
      path.join(landfallDir, "prompts", "build-sequence.json"),
      JSON.stringify(buildSequence, null, 2),
      "utf-8"
    );

    return NextResponse.json(buildSequence);
  } catch (error) {
    console.error("Error generating prompts:", error);
    return NextResponse.json(
      { error: "Failed to generate prompts" },
      { status: 500 }
    );
  }
}

function formatSectionType(type: string): string {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function generateStylePrompt(style: any): string {
  const colorsList = Object.entries(style.colors)
    .map(([key, value]) => `  - ${key}: ${value}`)
    .join("\n");

  return `# Task: Setup Style System for Landing Page

Read the style configuration at \`landfall/style.json\` and implement the following:

## 1. Tailwind Configuration

Update \`tailwind.config.js\` (or \`tailwind.config.ts\`) with:

### Custom Color Palette
\`\`\`
${colorsList}
\`\`\`

### Typography
- Heading font: "${style.typography.headingFont}"
- Body font: "${style.typography.bodyFont}"
- Scale: "${style.typography.scale}"

### Design Tokens
- Border radius: "${style.borderRadius}" (${getBorderRadiusValue(style.borderRadius)})
- Shadows: "${style.shadows}" (${getShadowDescription(style.shadows)})

## 2. Global Styles

Create/update \`app/globals.css\` with:
- CSS custom properties for all colors
- Base typography styles using the specified fonts
- Utility classes for the border radius and shadow scales

## 3. Font Setup

Configure the fonts using \`next/font\`:
- Import "${style.typography.headingFont}" for headings
- Import "${style.typography.bodyFont}" for body text
- Apply them via CSS variables

${style.styleKeywords?.length > 0 ? `\n## Style Guidelines\nThe overall aesthetic should feel: ${style.styleKeywords.join(", ")}` : ""}

${style.inspirations?.length > 0 ? `\n## Reference\nSee inspiration images in \`landfall/assets/style-inspirations/\` for visual guidance.` : ""}

**Important:** Do not create any pages or components yet - just the style foundation.`;
}

function generateLayoutPrompt(sitemap: any, navigation: any, tone: any): string {
  const pagesList = sitemap.pages
    .map((p: any) => `  - ${p.name} (${p.slug}) - ${p.metaTitle || "No title set"}`)
    .join("\n");

  const navLinks = navigation.navbar.links
    .map((l: any) => `  - "${l.label}" → ${l.target} (${l.type})`)
    .join("\n");

  const ctaButtons = navigation.navbar.cta
    .map((c: any) => `  - "${c.label}" → ${c.target} (${c.style})`)
    .join("\n");

  const footerColumns = navigation.footer.columns
    .map((col: any) => `  - ${col.heading}: ${col.links.map((l: any) => l.label).join(", ")}`)
    .join("\n");

  return `# Task: Create Sitemap and Layout Structure

Read the configuration files:
- \`landfall/sitemap.json\` - Page definitions
- \`landfall/navigation.json\` - Navbar and footer structure

## 1. App Router Pages

Create the following pages in \`app/\`:
${pagesList}

For each page:
- Create the folder structure (e.g., \`app/pricing/page.tsx\`)
- Set up metadata using the \`metadata\` export
- Leave the page content as a placeholder for now

## 2. Root Layout (\`app/layout.tsx\`)

- Import and apply the fonts configured in the previous step
- Include the Navbar and Footer components
- Wrap children in a main container

## 3. Navbar Component (\`components/Navbar.tsx\`)

Build a responsive navbar with:

**Logo:** ${navigation.navbar.logo.type === "text" ? `Text "${navigation.navbar.logo.value}"` : "Image from " + navigation.navbar.logo.imagePath}

**Navigation Links:**
${navLinks || "  (none defined)"}

**CTA Buttons:**
${ctaButtons || "  (none defined)"}

Requirements:
- Sticky positioning
- Mobile hamburger menu
- Smooth transitions

## 4. Footer Component (\`components/Footer.tsx\`)

Build a footer with:

**Columns:**
${footerColumns || "  (none defined)"}

**Social Links:** ${navigation.footer.social.map((s: any) => s.platform).join(", ") || "None"}

**Copyright:** "${navigation.footer.copyright || "© 2024 Company Name"}"

${navigation.footer.newsletter?.enabled ? `**Newsletter:** Include signup form with heading "${navigation.footer.newsletter.heading}"` : ""}

${tone.toneKeywords?.length > 0 ? `\n## Tone Guidelines\nThe copy should feel: ${tone.toneKeywords.join(", ")}` : ""}

Use the style system created in the previous step for all styling.`;
}

function generateSectionPrompt(page: any, section: any, tone: any, style: any): string {
  const pageSlug = page.slug === "/" ? "home" : page.slug.replace(/^\//, "");

  return `# Task: Build ${formatSectionType(section.type)} Section for ${page.name}

Read the section configuration at \`landfall/pages/${pageSlug}.json\`, section ID: \`${section.id}\`

## Section Details
- **Type:** ${section.type}
- **Layout Variant:** ${section.layoutVariant}
- **Order:** ${section.order} (position on page)

## Copy Instructions
${section.copyInstructions || "No specific copy instructions provided. Use placeholder content that matches the section type."}

## Visual Instructions
${section.visualInstructions || "No specific visual instructions provided. Follow the layout variant and use appropriate placeholder images."}

${section.inspirations?.length > 0 ? `\n## Reference Images\nSee inspiration images at:\n${section.inspirations.map((i: any) => `- \`landfall/${i.path}\`${i.notes ? ` - ${i.notes}` : ""}`).join("\n")}` : ""}

## Tone Guidelines
${tone.toneKeywords?.length > 0 ? `The copy should feel: ${tone.toneKeywords.join(", ")}` : "Use professional, clear language."}
${tone.targetAudience ? `Target audience: ${tone.targetAudience}` : ""}
${tone.guidelines?.do?.length > 0 ? `\nDo: ${tone.guidelines.do.join("; ")}` : ""}
${tone.guidelines?.dont?.length > 0 ? `\nDon't: ${tone.guidelines.dont.join("; ")}` : ""}

## Implementation Steps

1. **Create Component**
   Create \`components/sections/${formatSectionType(section.type).replace(/ /g, "")}Section.tsx\`

2. **Follow Layout Pattern**
   Implement the "${section.layoutVariant}" variant layout

3. **Apply Styles**
   Use the color palette from the style system:
   - Primary: ${style.colors.primary}
   - Background: ${style.colors.background}
   - Text: ${style.colors.text}

4. **Add to Page**
   Import and add the section to \`app/${pageSlug === "home" ? "" : pageSlug + "/"}page.tsx\` in position ${section.order}

5. **Make Responsive**
   Ensure the section works on mobile, tablet, and desktop

## Component Structure
\`\`\`tsx
export function ${formatSectionType(section.type).replace(/ /g, "")}Section() {
  return (
    <section className="...">
      {/* Implement ${section.layoutVariant} layout */}
    </section>
  );
}
\`\`\``;
}

function getBorderRadiusValue(radius: string): string {
  const values: Record<string, string> = {
    sharp: "0px",
    "slightly-rounded": "4px",
    rounded: "8px",
    pill: "9999px",
  };
  return values[radius] || "8px";
}

function getShadowDescription(shadow: string): string {
  const descriptions: Record<string, string> = {
    none: "no shadows",
    subtle: "light, barely visible shadows",
    medium: "moderate shadows for depth",
    dramatic: "strong, prominent shadows",
  };
  return descriptions[shadow] || "subtle shadows";
}
