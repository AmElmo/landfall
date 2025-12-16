import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

const LANDFALL_DIR = 'landfall';

export async function init() {
  const targetDir = path.join(process.cwd(), LANDFALL_DIR);

  if (await fs.pathExists(targetDir)) {
    console.log(chalk.yellow(`⚠️  ${LANDFALL_DIR}/ directory already exists.`));
    console.log(chalk.gray('  Run `npx landfall dev` to start editing.'));
    return;
  }

  console.log(chalk.blue('🚀 Initializing LandFall...'));

  // Create directory structure
  await fs.ensureDir(path.join(targetDir, 'pages'));
  await fs.ensureDir(path.join(targetDir, 'assets', 'style-inspirations'));
  await fs.ensureDir(path.join(targetDir, 'assets', 'section-inspirations'));
  await fs.ensureDir(path.join(targetDir, 'prompts'));

  // Copy template files
  const templatesDir = path.join(__dirname, '..', 'templates');

  // Config
  await fs.writeJson(path.join(targetDir, 'config.json'), {
    version: '1.0.0',
    projectName: 'My Landing Page',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    targetFramework: 'nextjs',
    currentStep: 1
  }, { spaces: 2 });

  // Style
  await fs.writeJson(path.join(targetDir, 'style.json'), {
    colors: {
      primary: '#2563eb',
      primaryLight: '#3b82f6',
      primaryDark: '#1d4ed8',
      secondary: '#7c3aed',
      accent: '#f59e0b',
      background: '#ffffff',
      backgroundAlt: '#f8fafc',
      text: '#1e293b',
      textMuted: '#64748b',
      border: '#e2e8f0',
      success: '#22c55e',
      error: '#ef4444'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      scale: 'default'
    },
    styleKeywords: [],
    borderRadius: 'rounded',
    shadows: 'subtle',
    inspirations: []
  }, { spaces: 2 });

  // Tone
  await fs.writeJson(path.join(targetDir, 'tone.json'), {
    toneKeywords: [],
    brandPersonality: [],
    targetAudience: '',
    guidelines: {
      do: [],
      dont: []
    },
    examplePhrases: []
  }, { spaces: 2 });

  // Sitemap
  await fs.writeJson(path.join(targetDir, 'sitemap.json'), {
    pages: [
      {
        id: 'page_home',
        name: 'Home',
        slug: '/',
        isHomepage: true,
        metaTitle: '',
        metaDescription: ''
      }
    ]
  }, { spaces: 2 });

  // Navigation
  await fs.writeJson(path.join(targetDir, 'navigation.json'), {
    navbar: {
      logo: {
        type: 'text',
        value: 'Logo',
        imagePath: null
      },
      links: [],
      cta: []
    },
    footer: {
      columns: [],
      social: [],
      copyright: '',
      newsletter: {
        enabled: false,
        heading: '',
        placeholder: '',
        buttonText: ''
      }
    }
  }, { spaces: 2 });

  // Home page
  await fs.writeJson(path.join(targetDir, 'pages', 'home.json'), {
    pageId: 'page_home',
    sections: []
  }, { spaces: 2 });

  console.log(chalk.green('✅ LandFall initialized successfully!'));
  console.log('');
  console.log(chalk.gray('  Created:'));
  console.log(chalk.gray(`    ${LANDFALL_DIR}/config.json`));
  console.log(chalk.gray(`    ${LANDFALL_DIR}/style.json`));
  console.log(chalk.gray(`    ${LANDFALL_DIR}/tone.json`));
  console.log(chalk.gray(`    ${LANDFALL_DIR}/sitemap.json`));
  console.log(chalk.gray(`    ${LANDFALL_DIR}/navigation.json`));
  console.log(chalk.gray(`    ${LANDFALL_DIR}/pages/home.json`));
  console.log('');
  console.log(chalk.blue('  Run `npx landfall dev` to start editing.'));
}
