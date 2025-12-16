import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';

interface DevOptions {
  port: string;
}

export async function dev(options: DevOptions) {
  const landfallDir = path.join(process.cwd(), 'landfall');

  // Check if landfall directory exists
  if (!await fs.pathExists(landfallDir)) {
    console.log(chalk.red('❌ No landfall/ directory found.'));
    console.log(chalk.gray('  Run `npx landfall init` first.'));
    process.exit(1);
  }

  const port = options.port || '3333';

  console.log(chalk.blue(`🚀 Starting LandFall on http://localhost:${port}`));
  console.log(chalk.gray('  Press Ctrl+C to stop.'));
  console.log('');

  // Set environment variable for the project path
  process.env.LANDFALL_PROJECT_PATH = process.cwd();
  process.env.PORT = port;

  // Start Next.js dev server
  const nextBin = path.join(__dirname, '..', '..', 'node_modules', '.bin', 'next');

  const child = spawn(nextBin, ['dev', '-p', port], {
    cwd: path.join(__dirname, '..', '..'),
    stdio: 'inherit',
    env: {
      ...process.env,
      LANDFALL_PROJECT_PATH: process.cwd(),
    }
  });

  child.on('error', (err) => {
    console.error(chalk.red('Failed to start server:'), err);
    process.exit(1);
  });

  child.on('close', (code) => {
    process.exit(code || 0);
  });
}
