#!/usr/bin/env node
import { Command } from 'commander';
import { init } from '../src/cli/init';
import { dev } from '../src/cli/dev';
import { build } from '../src/cli/build';

const program = new Command();

program
  .name('landfall')
  .description('CLI tool for creating structured landing page specifications')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize LandFall in the current directory')
  .action(init);

program
  .command('dev')
  .description('Start the web app for editing your landing page spec')
  .option('-p, --port <port>', 'Port to run the server on', '3333')
  .action(dev);

program
  .command('build')
  .description('Generate prompts without opening the web UI')
  .action(build);

program.parse();
