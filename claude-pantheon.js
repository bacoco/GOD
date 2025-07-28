#!/usr/bin/env node

/**
 * Claude Code CLI Integration for Pantheon
 * Use Pantheon gods directly from Claude Code
 */

import { UnifiedCommandHandler } from './gods/lib/unified-command-handler.js';
import { conversationalProjectPlanning } from './gods/workflows/conversational-planning.js';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command from Claude Code
const args = process.argv.slice(2);
const command = args.join(' ');

async function main() {
  try {
    // Try to detect if Claude-Flow is available
    let claudeFlow = null;
    
    try {
      // Check if we're running within Claude-Flow environment
      const claudeFlowPath = path.join(__dirname, 'claude-flow');
      const { default: ClaudeFlow } = await import(path.join(claudeFlowPath, 'src/index.js'));
      
      // Create a minimal Claude-Flow instance for integration
      claudeFlow = {
        available: true,
        path: claudeFlowPath
      };
    } catch (error) {
      // Claude-Flow not available, will run in standalone mode
      if (process.env.DEBUG) {
        console.log('Claude-Flow not detected, running in standalone mode');
      }
    }
    
    // Initialize unified command handler
    const handler = new UnifiedCommandHandler({
      claudeFlow,
      mode: 'auto',
      enableConversational: true,
      enableClaudeFlow: !!claudeFlow,
      preferConversational: true // Prefer conversational for better UX
    });
    
    await handler.initialize();
    
    // Execute the command
    await handler.execute(command);
    
    // Cleanup
    await handler.shutdown();
    
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error.message);
    if (process.env.DEBUG) {
      console.error(error);
    }
    process.exit(1);
  }
}

// Run the command
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });