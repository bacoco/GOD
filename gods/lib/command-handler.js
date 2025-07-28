/**
 * Command Handler for /gods commands
 * Routes and executes all /gods subcommands
 */

import chalk from 'chalk';
import { InitCommand } from './commands/init-command.js';
import { StatusCommand } from './commands/status-command.js';
import { HelpCommand } from './commands/help-command.js';
import { ProjectsCommand } from './commands/projects-command.js';
import { ResumeCommand } from './commands/resume-command.js';

export class GodsCommandHandler {
  constructor(pantheon) {
    this.pantheon = pantheon;
    
    // Initialize command handlers
    this.commands = {
      init: new InitCommand(pantheon),
      status: new StatusCommand(pantheon),
      help: new HelpCommand(pantheon),
      projects: new ProjectsCommand(pantheon),
      resume: new ResumeCommand(pantheon)
    };
  }

  /**
   * Parse and execute /gods commands
   * @param {string} input - The full command input
   * @returns {Promise<void>}
   */
  async execute(input) {
    // Parse the command
    const parts = input.trim().split(/\s+/);
    
    // Check if it's a /gods command
    if (parts[0] !== '/gods') {
      return null;
    }

    // Get subcommand (or default to help)
    const subcommand = parts[1] || 'help';
    
    // Get the rest as arguments
    const args = parts.slice(2).join(' ');

    // Execute the appropriate command
    switch (subcommand.toLowerCase()) {
      case 'init':
        return await this.commands.init.execute(args);
        
      case 'status':
        return await this.commands.status.execute(args);
        
      case 'help':
        return await this.commands.help.execute(args);
        
      case 'projects':
        return await this.commands.projects.execute(args);
        
      case 'resume':
        return await this.commands.resume.execute(args);
        
      default:
        console.log(chalk.yellow(`Unknown command: ${subcommand}`));
        return await this.commands.help.execute();
    }
  }

  /**
   * Check if input is a /gods command
   * @param {string} input - The input to check
   * @returns {boolean}
   */
  static isGodsCommand(input) {
    return input.trim().startsWith('/gods');
  }
}