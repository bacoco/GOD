#!/usr/bin/env node

/**
 * Pantheon God Agent System - Launch Script
 * Starts Claude-Flow with the Pantheon plugin loaded
 */

import { ClaudeFlowWithPlugins } from './claude-flow/src/cli/cli-core.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function launch() {
  console.log(chalk.blue.bold(`
    🏛️  ╔═══════════════════════════════════════════╗
    🏛️  ║          PANTHEON GOD AGENT SYSTEM        ║
    🏛️  ║              Powered by Claude-Flow       ║
    🏛️  ╚═══════════════════════════════════════════╝
  `));
  
  console.log(chalk.gray('Initializing divine orchestration system...\n'));
  
  try {
    // Create Claude-Flow instance with Pantheon plugin
    const claudeFlow = new ClaudeFlowWithPlugins({
      plugins: ['./gods']
    });
    
    // Wait for plugin system to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get the plugin system
    const pluginSystem = claudeFlow.getPluginSystem();
    const pantheonPlugin = pluginSystem?.getPlugin('@pantheon/claude-flow-plugin');
    
    if (pantheonPlugin) {
      console.log(chalk.green('✅ Pantheon plugin loaded successfully!'));
      
      // Display available gods
      const gods = pantheonPlugin.pantheon.getAvailableGods();
      console.log(chalk.cyan('\n⚡ Available Gods:'));
      
      const godDescriptions = {
        zeus: 'Supreme Orchestrator - Coordinates all agents',
        janus: 'Universal Executor - Meta-orchestration',
        daedalus: 'System Architect - Design patterns & architecture',
        hephaestus: 'Master Developer - Implementation & coding',
        apollo: 'UX Designer - User experience & interfaces',
        athena: 'Product Owner - Story validation & criteria',
        prometheus: 'Product Manager - Strategy & roadmaps',
        hermes: 'Scrum Master - Sprint planning & coordination',
        themis: 'QA Engineer - Testing & quality assurance',
        aegis: 'Security Expert - Security & compliance',
        oracle: 'Style Guide Generator - Design systems',
        harmonia: 'Design Token Optimizer - Visual harmony',
        calliope: 'Microcopy Specialist - Content & messaging',
        iris: 'Interactivity Specialist - Animations & motion',
        argus: 'UI Quality Guardian - Design QA',
        'code-reviewer': 'Code Review Specialist - Quick reviews'
      };
      
      gods.forEach(god => {
        console.log(chalk.yellow(`   • ${god}`) + chalk.gray(` - ${godDescriptions[god] || 'Specialized agent'}`));
      });
      
      console.log(chalk.cyan('\n🌟 Example Commands:'));
      console.log(chalk.gray('   npx claude-flow agent spawn zeus'));
      console.log(chalk.gray('   npx claude-flow task create "Build a web application"'));
      console.log(chalk.gray('   npx claude-flow workflow full-stack-dev'));
      
      console.log(chalk.cyan('\n📚 Available Workflows:'));
      console.log(chalk.gray('   • full-stack-dev - Complete application development'));
      console.log(chalk.gray('   • product-planning - Product strategy and roadmap'));
      console.log(chalk.gray('   • design-system - UI/UX design system creation'));
      
    } else {
      console.log(chalk.yellow('⚠️  Pantheon plugin not found. Running Claude-Flow in standard mode.'));
    }
    
    console.log(chalk.green('\n🏛️  Pantheon is ready!'));
    console.log(chalk.gray('Use "npx claude-flow help" to see all available commands.\n'));
    
    // If running directly, start REPL mode
    if (process.argv.length === 2) {
      console.log(chalk.blue('Starting interactive mode...'));
      console.log(chalk.gray('Type "help" for commands or "exit" to quit.\n'));
      
      // Run Claude-Flow CLI
      await claudeFlow.run(['repl']);
    } else {
      // Pass through command line arguments
      await claudeFlow.run(process.argv.slice(2));
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ Error launching Pantheon:'), error.message);
    if (process.env.DEBUG) {
      console.error(error);
    }
    process.exit(1);
  }
}

// Handle interrupts gracefully
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n🏛️  Dismissing the gods... Farewell!'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n\n🏛️  The gods return to Olympus...'));
  process.exit(0);
});

// Launch the system
launch().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});