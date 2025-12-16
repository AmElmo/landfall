import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function build() {
  const landfallDir = path.join(process.cwd(), 'landfall');

  // Check if landfall directory exists
  if (!await fs.pathExists(landfallDir)) {
    console.log(chalk.red('❌ No landfall/ directory found.'));
    console.log(chalk.gray('  Run `npx landfall init` first.'));
    process.exit(1);
  }

  console.log(chalk.blue('🔨 Generating prompts...'));

  try {
    // Read all configuration files
    const config = await fs.readJson(path.join(landfallDir, 'config.json'));
    const style = await fs.readJson(path.join(landfallDir, 'style.json'));
    const tone = await fs.readJson(path.join(landfallDir, 'tone.json'));
    const sitemap = await fs.readJson(path.join(landfallDir, 'sitemap.json'));
    const navigation = await fs.readJson(path.join(landfallDir, 'navigation.json'));

    const prompts: Array<{
      step: number;
      name: string;
      description: string;
      prompt: string;
    }> = [];

    let stepNumber = 1;

    // Prompt 1: Setup Style System
    prompts.push({
      step: stepNumber++,
      name: 'Setup Style System',
      description: 'Implement global styles, colors, typography',
      prompt: generateStylePrompt(style)
    });

    // Prompt 2: Create Sitemap & Layout
    prompts.push({
      step: stepNumber++,
      name: 'Create Sitemap & Layout',
      description: 'Setup pages and shared layout components',
      prompt: generateLayoutPrompt(sitemap, navigation)
    });

    // Generate section prompts for each page
    for (const page of sitemap.pages) {
      const pageSlug = page.slug === '/' ? 'home' : page.slug.replace(/^\//, '');
      const pagePath = path.join(landfallDir, 'pages', `${pageSlug}.json`);

      if (await fs.pathExists(pagePath)) {
        const pageData = await fs.readJson(pagePath);

        for (const section of pageData.sections || []) {
          prompts.push({
            step: stepNumber++,
            name: `${page.name} - ${formatSectionType(section.type)}`,
            description: `Build ${section.type} section for ${page.name} page`,
            prompt: generateSectionPrompt(page, section, tone)
          });
        }
      }
    }

    // Save build sequence
    const buildSequence = {
      generatedAt: new Date().toISOString(),
      totalPrompts: prompts.length,
      prompts
    };

    await fs.writeJson(
      path.join(landfallDir, 'prompts', 'build-sequence.json'),
      buildSequence,
      { spaces: 2 }
    );

    console.log(chalk.green(`✅ Generated ${prompts.length} prompts!`));
    console.log('');
    console.log(chalk.gray(`  Saved to: landfall/prompts/build-sequence.json`));
    console.log('');
    console.log(chalk.blue('  Prompts generated:'));
    for (const prompt of prompts) {
      console.log(chalk.gray(`    ${prompt.step}. ${prompt.name}`));
    }

  } catch (err) {
    console.error(chalk.red('Error generating prompts:'), err);
    process.exit(1);
  }
}

function formatSectionType(type: string): string {
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateStylePrompt(style: any): string {
  return `# Task: Setup Style System for Landing Page

Read the style configuration at \`landfall/style.json\` and implement the following:

1. **Tailwind Configuration**: Update \`tailwind.config.js\` with:
   - Custom color palette: ${JSON.stringify(style.colors, null, 2)}
   - Typography settings: heading font "${style.typography.headingFont}", body font "${style.typography.bodyFont}"
   - Border radius scale: "${style.borderRadius}"
   - Box shadow scale: "${style.shadows}"

2. **Global Styles**: Create/update \`app/globals.css\` with:
   - CSS custom properties for all colors
   - Base typography styles
   - Any custom utility classes needed

3. **Font Setup**: Configure the fonts "${style.typography.headingFont}" and "${style.typography.bodyFont}" using next/font

${style.styleKeywords.length > 0 ? `The style keywords are: ${style.styleKeywords.join(', ')}` : ''}

Do not create any pages or components yet - just the style foundation.`;
}

function generateLayoutPrompt(sitemap: any, navigation: any): string {
  const pagesList = sitemap.pages.map((p: any) => `  - ${p.name} (${p.slug})`).join('\n');

  return `# Task: Create Sitemap and Layout Structure

Implement:

1. **App Router Pages**: Create the following pages in \`app/\`:
${pagesList}

   Each page should have proper metadata (title, description) and be a placeholder for now.

2. **Layout Component** (\`app/layout.tsx\`):
   - Wrap all pages with consistent layout
   - Include Navbar and Footer components

3. **Navbar Component** (\`components/Navbar.tsx\`):
   - Logo: ${navigation.navbar.logo.type === 'text' ? `Text "${navigation.navbar.logo.value}"` : 'Image'}
   - Links: ${navigation.navbar.links.map((l: any) => l.label).join(', ') || 'None defined yet'}
   - CTA buttons: ${navigation.navbar.cta.map((c: any) => c.label).join(', ') || 'None defined yet'}
   - Make it responsive with mobile menu

4. **Footer Component** (\`components/Footer.tsx\`):
   - ${navigation.footer.columns.length} columns of links
   - Social links: ${navigation.footer.social.map((s: any) => s.platform).join(', ') || 'None'}
   - Copyright: "${navigation.footer.copyright}"
   ${navigation.footer.newsletter.enabled ? '- Newsletter signup form' : ''}

Use the style system created in the previous step.`;
}

function generateSectionPrompt(page: any, section: any, tone: any): string {
  const toneGuidelines = tone.toneKeywords.length > 0
    ? `\n\n**Tone Guidelines:**\n- Keywords: ${tone.toneKeywords.join(', ')}\n- Target audience: ${tone.targetAudience}`
    : '';

  return `# Task: Build ${formatSectionType(section.type)} Section for ${page.name}

Read the section configuration at \`landfall/pages/${page.slug === '/' ? 'home' : page.slug.replace(/^\//, '')}.json\`, section ID: ${section.id}

**Section Details:**
- Type: ${section.type}
- Layout Variant: ${section.layoutVariant}
- Order: ${section.order}

**Copy Instructions:**
${section.copyInstructions || 'No specific instructions provided.'}

**Visual Instructions:**
${section.visualInstructions || 'No specific instructions provided.'}
${toneGuidelines}

**Implementation:**
1. Create the section component at \`components/sections/${formatSectionType(section.type).replace(/ /g, '')}Section.tsx\`
2. Follow the "${section.layoutVariant}" layout pattern
3. Use placeholder content that matches the copy instructions
4. Apply styles consistent with the style system
5. Make the section responsive

Export the component and add it to the ${page.slug === '/' ? 'home' : page.slug.replace(/^\//, '')} page in order ${section.order}.`;
}
