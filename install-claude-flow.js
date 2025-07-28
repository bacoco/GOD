#!/usr/bin/env node

/**
 * Claude-Flow Installation Script for Pantheon
 * Ensures Claude-Flow is properly installed and configured
 */

import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CLAUDE_FLOW_DIR = join(__dirname, 'claude-flow');

console.log(chalk.blue('\n🏛️ Pantheon Claude-Flow Installation\n'));

// Check if Claude-Flow directory exists
if (!existsSync(CLAUDE_FLOW_DIR)) {
  console.error(chalk.red('❌ Claude-Flow directory not found!'));
  console.error(chalk.yellow(`Expected location: ${CLAUDE_FLOW_DIR}`));
  console.error(chalk.yellow('\nPlease ensure you have the complete Pantheon repository.'));
  process.exit(1);
}

// Check if package.json exists
const packagePath = join(CLAUDE_FLOW_DIR, 'package.json');
if (!existsSync(packagePath)) {
  console.error(chalk.red('❌ Claude-Flow package.json not found!'));
  console.error(chalk.yellow('The claude-flow directory appears to be incomplete.'));
  process.exit(1);
}

// Check if node_modules exists
const nodeModulesPath = join(CLAUDE_FLOW_DIR, 'node_modules');
const needsInstall = !existsSync(nodeModulesPath);

if (needsInstall) {
  console.log(chalk.yellow('📦 Installing Claude-Flow dependencies...\n'));
  
  try {
    // Change to claude-flow directory and run npm install
    process.chdir(CLAUDE_FLOW_DIR);
    execSync('npm install', { stdio: 'inherit' });
    console.log(chalk.green('\n✅ Claude-Flow dependencies installed successfully!'));
  } catch (error) {
    console.error(chalk.red('\n❌ Failed to install Claude-Flow dependencies:'));
    console.error(error.message);
    process.exit(1);
  }
} else {
  console.log(chalk.green('✅ Claude-Flow dependencies already installed.'));
}

// Check if the claude-flow binary is executable
const claudeFlowBin = join(CLAUDE_FLOW_DIR, 'bin', 'claude-flow');
if (!existsSync(claudeFlowBin)) {
  console.error(chalk.red('\n❌ Claude-Flow binary not found!'));
  console.error(chalk.yellow(`Expected at: ${claudeFlowBin}`));
  process.exit(1);
}

// Test Claude-Flow
console.log(chalk.blue('\n🔍 Testing Claude-Flow installation...\n'));

try {
  process.chdir(CLAUDE_FLOW_DIR);
  const version = execSync('./bin/claude-flow --version', { encoding: 'utf8' });
  console.log(chalk.green('✅ Claude-Flow is working!'));
  console.log(chalk.gray(`Version: ${version.trim()}`));
} catch (error) {
  console.error(chalk.red('\n❌ Claude-Flow test failed:'));
  console.error(error.message);
  console.error(chalk.yellow('\nTroubleshooting:'));
  console.error('1. Ensure Node.js version is 18 or higher');
  console.error('2. Try running: cd claude-flow && npm rebuild');
  process.exit(1);
}

// Success message
console.log(chalk.green('\n✨ Claude-Flow installation complete!\n'));
console.log(chalk.blue('You can now use Pantheon with full AI agent capabilities:'));
console.log(chalk.cyan('  node claude-pantheon.js "/gods init \'your project idea\'"'));
console.log(chalk.cyan('  npm run gods:init'));
console.log(chalk.cyan('  ./gods/bin/pantheon-claude init "your project idea"'));
console.log();
console.log(chalk.gray('Note: Pantheon now requires Claude-Flow for all operations.'));
console.log(chalk.gray('Template-based fallbacks have been removed.'));
console.log();