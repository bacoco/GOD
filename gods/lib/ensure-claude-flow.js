/**
 * Ensure Claude-Flow is installed and ready
 * This module is imported by PantheonCore during initialization
 */

import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CLAUDE_FLOW_DIR = join(__dirname, '../../claude-flow');
const CLAUDE_FLOW_BIN = join(CLAUDE_FLOW_DIR, 'bin', 'claude-flow');

/**
 * Check if Claude-Flow is installed and ready
 * @returns {boolean} True if Claude-Flow is ready
 */
export function isClaudeFlowReady() {
  // Check if directory exists
  if (!existsSync(CLAUDE_FLOW_DIR)) {
    return false;
  }
  
  // Check if binary exists
  if (!existsSync(CLAUDE_FLOW_BIN)) {
    return false;
  }
  
  // Check if node_modules exists
  const nodeModulesPath = join(CLAUDE_FLOW_DIR, 'node_modules');
  if (!existsSync(nodeModulesPath)) {
    return false;
  }
  
  return true;
}

/**
 * Get installation instructions
 * @returns {string} Instructions for installing Claude-Flow
 */
export function getInstallInstructions() {
  return `
${chalk.red('❌ Claude-Flow is not installed!')}

${chalk.yellow('Pantheon now requires Claude-Flow for all operations.')}
${chalk.yellow('Template-based generation has been removed.')}

${chalk.blue('To install Claude-Flow:')}

  1. Run the installation script:
     ${chalk.cyan('node install-claude-flow.js')}
     
  2. Or manually install:
     ${chalk.cyan('cd claude-flow && npm install')}

${chalk.gray('After installation, try your command again.')}
`;
}

/**
 * Ensure Claude-Flow is installed or throw error
 * @throws {Error} If Claude-Flow is not installed
 */
export function ensureClaudeFlow() {
  if (!isClaudeFlowReady()) {
    console.error(getInstallInstructions());
    throw new Error('Claude-Flow is required but not installed. Please run: node install-claude-flow.js');
  }
  
  // Verify it works by running version command
  try {
    execSync(`${CLAUDE_FLOW_BIN} --version`, { 
      cwd: CLAUDE_FLOW_DIR,
      stdio: 'ignore' 
    });
  } catch (error) {
    throw new Error(`Claude-Flow is installed but not working properly: ${error.message}`);
  }
}

/**
 * Get Claude-Flow path
 * @returns {string} Path to Claude-Flow directory
 */
export function getClaudeFlowPath() {
  return CLAUDE_FLOW_DIR;
}

/**
 * Get Claude-Flow binary path
 * @returns {string} Path to Claude-Flow binary
 */
export function getClaudeFlowBin() {
  return CLAUDE_FLOW_BIN;
}