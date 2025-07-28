/**
 * /gods status command implementation
 * Shows current project status
 */

import chalk from 'chalk';
import { ConversationState } from '../conversation-state.js';

export class StatusCommand {
  constructor(pantheon) {
    this.pantheon = pantheon;
    this.state = new ConversationState();
  }

  /**
   * Execute the status command
   * @param {string} args - Optional project name
   */
  async execute(args) {
    try {
      await this.state.initialize();
      
      // Load current or specified session
      const session = await this.state.loadCurrentSession();
      
      if (!session) {
        console.log(chalk.yellow('\nNo active project found.'));
        console.log('Start a new project with: ' + chalk.cyan('/gods init "your idea"'));
        console.log('Or see all projects with: ' + chalk.cyan('/gods projects\n'));
        return;
      }

      // Display status
      this.displayStatus(session);

    } catch (error) {
      console.error(chalk.red('\n❌ Error checking status:'), error.message);
    }
  }

  /**
   * Display project status
   * @param {Object} session - Project session
   */
  displayStatus(session) {
    console.log(chalk.blue('\n🏛️ Project Status\n'));
    
    console.log(chalk.cyan('Project Information:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(`  Name: ${chalk.white(session.projectName)}`);
    console.log(`  Started: ${chalk.white(new Date(session.startedAt).toLocaleString())}`);
    console.log(`  Status: ${this.getStatusBadge(session.status)}`);
    console.log(`  Phase: ${chalk.white(this.getPhaseName(session.phase))}`);
    
    if (session.currentGod) {
      console.log(`  Current God: ${chalk.blue(session.currentGod)}`);
    }

    // Show context summary
    if (session.context) {
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.cyan('\nProject Details:'));
      
      if (session.context.projectIdea) {
        console.log(`  Vision: ${chalk.white(session.context.projectIdea)}`);
      }
      
      if (session.context.discovery) {
        const disc = session.context.discovery;
        console.log(`  Users: ${chalk.white(disc.users || 'Not defined')}`);
        console.log(`  Core Feature: ${chalk.white(disc.core_feature || 'Not defined')}`);
      }
      
      if (session.context.plan && session.context.plan.mvp_features) {
        console.log(`\n  MVP Features:`);
        const features = session.context.plan.mvp_features.split(',');
        features.forEach(f => console.log(`    • ${chalk.white(f.trim())}`));
      }
    }

    // Show conversation history summary
    if (session.context.responses && session.context.responses.length > 0) {
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.cyan('\nConversation Summary:'));
      console.log(`  Total Exchanges: ${chalk.white(session.context.responses.length)}`);
      
      const gods = [...new Set(session.context.responses.map(r => r.god))];
      console.log(`  Gods Consulted: ${chalk.white(gods.join(', '))}`);
    }

    // Show next steps
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.cyan('\nNext Steps:'));
    
    const nextSteps = this.getNextSteps(session);
    nextSteps.forEach((step, i) => {
      console.log(`  ${i + 1}. ${step}`);
    });

    console.log();
  }

  /**
   * Get status badge
   * @param {string} status - Status value
   * @returns {string} Colored status badge
   */
  getStatusBadge(status) {
    const badges = {
      active: chalk.green('● Active'),
      completed: chalk.blue('✓ Completed'),
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
      discovery: 'Discovery & Requirements',
      planning: 'Feature Planning',
      design: 'Design & Architecture',
      implementation: 'Implementation',
      testing: 'Testing & Refinement',
      deployment: 'Deployment',
      planning_complete: 'Planning Complete',
      building: 'Building'
    };
    
    return phases[phase] || phase;
  }

  /**
   * Get next steps based on session state
   * @param {Object} session - Project session
   * @returns {Array<string>} Next steps
   */
  getNextSteps(session) {
    const steps = [];
    
    switch (session.phase) {
      case 'discovery':
        steps.push('Continue the conversation with /gods resume');
        steps.push('Complete requirements gathering');
        break;
        
      case 'planning':
        steps.push('Finalize feature list with Prometheus');
        steps.push('Review and approve the plan');
        break;
        
      case 'planning_complete':
        steps.push('Start implementation with /gods resume');
        steps.push('Review generated project structure');
        steps.push('Begin coding core features');
        break;
        
      case 'implementation':
        steps.push('Continue building features');
        steps.push('Run tests regularly');
        steps.push('Commit changes to version control');
        break;
        
      case 'completed':
        steps.push('Project is complete!');
        steps.push('Consider deployment options');
        steps.push('Start a new project with /gods init');
        break;
        
      default:
        steps.push('Resume with /gods resume');
    }
    
    return steps;
  }
}