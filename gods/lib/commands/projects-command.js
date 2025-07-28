/**
 * /gods projects command implementation
 * Lists all Pantheon projects
 */

import chalk from 'chalk';
import { ConversationState } from '../conversation-state.js';

export class ProjectsCommand {
  constructor(pantheon) {
    this.pantheon = pantheon;
    this.state = new ConversationState();
  }

  /**
   * Execute the projects command
   * @param {string} args - Optional filter
   */
  async execute(args) {
    try {
      await this.state.initialize();
      
      // Get all projects
      const projects = await this.state.listProjects();
      
      if (projects.length === 0) {
        console.log(chalk.yellow('\nNo projects found.'));
        console.log('Start your first project with: ' + chalk.cyan('/gods init "your idea"\n'));
        return;
      }

      // Display projects
      console.log(chalk.blue('\n🏛️ Your Pantheon Projects\n'));
      console.log(chalk.gray('─'.repeat(70)));
      console.log(
        chalk.cyan('Name'.padEnd(25)) +
        chalk.cyan('Status'.padEnd(12)) +
        chalk.cyan('Phase'.padEnd(20)) +
        chalk.cyan('Created')
      );
      console.log(chalk.gray('─'.repeat(70)));

      for (const project of projects) {
        const name = project.projectName.padEnd(25);
        const status = this.getStatusBadge(project.status).padEnd(20);
        const phase = this.getPhaseName(project.phase).padEnd(20);
        const date = new Date(project.startedAt).toLocaleDateString();
        
        console.log(`${chalk.white(name)}${status}${chalk.gray(phase)}${chalk.gray(date)}`);
      }

      console.log(chalk.gray('─'.repeat(70)));
      console.log(chalk.gray(`\nTotal projects: ${projects.length}`));
      
      // Show current project
      const currentSession = await this.state.loadCurrentSession();
      if (currentSession) {
        console.log(chalk.green(`\nCurrent project: ${currentSession.projectName}`));
      }

      console.log(chalk.cyan('\nCommands:'));
      console.log('  Resume a project: ' + chalk.yellow('/gods resume [project-name]'));
      console.log('  Check status: ' + chalk.yellow('/gods status'));
      console.log('  Start new: ' + chalk.yellow('/gods init "your idea"'));
      console.log();

    } catch (error) {
      console.error(chalk.red('\n❌ Error listing projects:'), error.message);
    }
  }

  /**
   * Get status badge
   * @param {string} status - Status value
   * @returns {string} Colored status badge
   */
  getStatusBadge(status) {
    const badges = {
      active: chalk.green('● Active'),
      completed: chalk.blue('✓ Complete'),
      paused: chalk.yellow('⏸ Paused')
    };
    
    return badges[status] || chalk.gray(status);
  }

  /**
   * Get human-readable phase name
   * @param {string} phase - Phase identifier
   * @returns {string} Phase name
   */
  getPhaseName(phase) {
    const phases = {
      discovery: 'Discovery',
      planning: 'Planning',
      design: 'Design',
      implementation: 'Building',
      testing: 'Testing',
      deployment: 'Deployment',
      planning_complete: 'Ready to Build',
      building: 'In Progress'
    };
    
    return phases[phase] || phase;
  }
}