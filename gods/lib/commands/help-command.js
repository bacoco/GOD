/**
 * /gods help command implementation
 * Shows available commands and usage
 */

import chalk from 'chalk';

export class HelpCommand {
  constructor(pantheon) {
    this.pantheon = pantheon;
  }

  /**
   * Execute the help command
   * @param {string} args - Specific command to get help for
   */
  async execute(args) {
    const command = args?.trim();

    if (command) {
      this.showCommandHelp(command);
    } else {
      this.showGeneralHelp();
    }
  }

  /**
   * Show general help
   */
  showGeneralHelp() {
    console.log(chalk.blue('\n🏛️ Pantheon - Where Gods Build Software\n'));
    
    console.log(chalk.cyan('Available Commands:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    const commands = [
      {
        cmd: '/gods init "your idea"',
        desc: 'Start a new project with divine guidance'
      },
      {
        cmd: '/gods status',
        desc: 'Check the progress of your current project'
      },
      {
        cmd: '/gods projects',
        desc: 'List all your Pantheon projects'
      },
      {
        cmd: '/gods resume [project]',
        desc: 'Continue working on a project'
      },
      {
        cmd: '/gods help [command]',
        desc: 'Show help for a specific command'
      }
    ];

    commands.forEach(({ cmd, desc }) => {
      console.log(`  ${chalk.yellow(cmd.padEnd(25))} ${desc}`);
    });

    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.cyan('\nMeet the Gods:'));
    
    const gods = [
      { name: 'Zeus', role: 'Orchestrator - Guides your entire journey' },
      { name: 'Prometheus', role: 'Product Visionary - Shapes features and strategy' },
      { name: 'Apollo', role: 'Design Maestro - Creates beautiful experiences' },
      { name: 'Hephaestus', role: 'Master Builder - Forges code into reality' },
      { name: 'Athena', role: 'Strategic Analyst - Provides wisdom and insights' },
      { name: 'Daedalus', role: 'System Architect - Designs solid foundations' }
    ];

    gods.forEach(({ name, role }) => {
      console.log(`  ${chalk.blue(name.padEnd(12))} ${chalk.gray(role)}`);
    });

    console.log(chalk.gray('\n─'.repeat(50)));
    console.log(chalk.green('Quick Start:'));
    console.log('  Run ' + chalk.yellow('/gods init "I want to build a task tracker"'));
    console.log('  to begin your journey with the gods.\n');
  }

  /**
   * Show help for specific command
   * @param {string} command - Command name
   */
  showCommandHelp(command) {
    const helpText = {
      init: {
        usage: '/gods init "your project idea"',
        description: 'Start a new project through natural conversation with the gods.',
        examples: [
          '/gods init "I want to build a recipe sharing app"',
          '/gods init "Create a REST API for blog management"',
          '/gods init "Build a CLI tool for file organization"'
        ],
        process: [
          '1. Zeus will greet you and ask about your vision',
          '2. Through conversation, the gods understand your needs',
          '3. Different gods join to help with specific aspects',
          '4. A project plan is created from your discussion',
          '5. Hephaestus generates the initial code structure'
        ]
      },
      status: {
        usage: '/gods status',
        description: 'Check the current status of your active project.',
        shows: [
          '• Current project phase',
          '• Which god is currently helping',
          '• Progress on implementation',
          '• Next recommended steps'
        ]
      },
      projects: {
        usage: '/gods projects',
        description: 'List all projects created with Pantheon.',
        shows: [
          '• Project names and creation dates',
          '• Current status (active/completed)',
          '• Current phase of each project',
          '• Quick summary of each project'
        ]
      },
      resume: {
        usage: '/gods resume [project-name]',
        description: 'Continue working on a previous project.',
        examples: [
          '/gods resume                    # Resume most recent project',
          '/gods resume recipe-sharing-app # Resume specific project'
        ],
        notes: [
          '• Picks up exactly where you left off',
          '• Maintains conversation context',
          '• Remembers all previous decisions'
        ]
      }
    };

    const info = helpText[command.toLowerCase()];
    
    if (!info) {
      console.log(chalk.yellow(`\nNo help available for: ${command}`));
      console.log('Run ' + chalk.cyan('/gods help') + ' to see all commands.\n');
      return;
    }

    console.log(chalk.blue(`\n📖 Help: ${command}\n`));
    console.log(chalk.cyan('Usage:'));
    console.log(`  ${chalk.yellow(info.usage)}\n`);
    console.log(chalk.cyan('Description:'));
    console.log(`  ${info.description}\n`);

    if (info.examples) {
      console.log(chalk.cyan('Examples:'));
      info.examples.forEach(ex => console.log(`  ${chalk.gray(ex)}`));
      console.log();
    }

    if (info.process) {
      console.log(chalk.cyan('Process:'));
      info.process.forEach(step => console.log(`  ${chalk.gray(step)}`));
      console.log();
    }

    if (info.shows) {
      console.log(chalk.cyan('Shows:'));
      info.shows.forEach(item => console.log(`  ${chalk.gray(item)}`));
      console.log();
    }

    if (info.notes) {
      console.log(chalk.cyan('Notes:'));
      info.notes.forEach(note => console.log(`  ${chalk.gray(note)}`));
      console.log();
    }
  }
}