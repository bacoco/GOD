#!/usr/bin/env node

/**
 * Claude Code CLI Integration for Pantheon
 * Use Pantheon gods directly from Claude Code
 */

import { PantheonCore } from './gods/lib/pantheon-core.js';
import { conversationalProjectPlanning } from './gods/workflows/conversational-planning.js';
import chalk from 'chalk';

// Parse command from Claude Code
const args = process.argv.slice(2);
const command = args.join(' ');

async function main() {
  try {
    // Initialize Pantheon silently
    const pantheon = new PantheonCore({
      config: {
        conversationalMode: true,
        silent: true  // No banner output
      }
    });
    
    await pantheon.initialize();
    
    // Parse the command to determine what to do
    if (command.toLowerCase().includes('help') || command === '') {
      showHelp();
      process.exit(0);
    }
    
    if (command.toLowerCase().includes('build') || 
        command.toLowerCase().includes('create') || 
        command.toLowerCase().includes('make')) {
      // Use conversational planning for building projects
      console.log(chalk.blue('🏛️ Summoning the gods to help with your project...\n'));
      
      const result = await conversationalProjectPlanning(
        pantheon,
        command,
        { 
          autoImplement: false,  // Ask before implementing
          interactive: false      // Non-interactive mode for Claude
        }
      );
      
      // Output the plan in a Claude-friendly format
      console.log(chalk.green('\n✨ The gods have created a plan:\n'));
      
      if (result.artifacts?.artifacts?.documents) {
        console.log(chalk.cyan('📄 Generated Documents:'));
        result.artifacts.artifacts.documents.forEach(doc => {
          console.log(`  - ${doc.type}: Created by ${doc.createdBy}`);
        });
      }
      
      if (result.plan) {
        console.log(chalk.cyan('\n📋 Implementation Plan:'));
        result.plan.phases?.forEach((phase, i) => {
          console.log(`\nPhase ${i + 1}: ${phase.name}`);
          console.log(`Duration: ${phase.duration}`);
          console.log(`Team: ${phase.team.join(', ')}`);
        });
      }
      
      console.log(chalk.yellow('\n💡 Next Steps:'));
      result.nextSteps?.forEach((step, i) => {
        console.log(`${i + 1}. ${step}`);
      });
      
      return;
    }
    
    // Direct god summoning
    const godMatch = command.match(/summon (\w+)|use (\w+)|ask (\w+)/i);
    if (godMatch) {
      const godName = (godMatch[1] || godMatch[2] || godMatch[3]).toLowerCase();
      const god = await pantheon.summonGod(godName);
      
      console.log(chalk.green(`✨ ${god.name} is ready to help!`));
      console.log(chalk.gray(`Capabilities: ${god.getCapabilities().join(', ')}`));
      
      // Extract the actual request
      const request = command.replace(/summon \w+|use \w+|ask \w+/i, '').trim();
      if (request) {
        const result = await god.executeTask(request);
        console.log(chalk.cyan('\nResult:'), result);
      }
      
      return;
    }
    
    // Default: Use Zeus for orchestration
    console.log(chalk.blue('🏛️ Zeus is analyzing your request...\n'));
    
    const zeus = await pantheon.summonGod('zeus');
    const result = await zeus.analyzeAndDelegate({
      request: command,
      type: 'general'
    });
    
    console.log(chalk.green('✨ Task assigned to:'), result.assignedGods?.join(', ') || 'Zeus');
    console.log(chalk.cyan('\nPlan:'), result.plan || 'Direct execution');
    
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log(chalk.blue(`
🏛️ Pantheon - AI God Agent System for Claude Code

Usage:
  Build/Create something:
    "Build a web app with user authentication"
    "Create a REST API for a blog"
    "Make a React component for data visualization"
    
  Summon specific god:
    "Summon Apollo to design a user interface"
    "Ask Hephaestus to implement a payment system"
    "Use Daedalus for architecture design"
    
  General requests:
    "Analyze this project structure"
    "Review code quality"
    "Plan a microservices migration"

Available Gods:
  • Zeus - Orchestration and planning
  • Hephaestus - Development and coding
  • Apollo - UI/UX design
  • Daedalus - System architecture
  • Prometheus - Product management
  • Themis - Quality assurance
  • And 10 more specialists...

Examples:
  claude-pantheon "Build an e-commerce platform"
  claude-pantheon "Summon Apollo to design a dashboard"
  claude-pantheon "Create REST API with authentication"
  `));
}

// Run the command
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });