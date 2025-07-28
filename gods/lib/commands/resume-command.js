/**
 * /gods resume command implementation
 * Resume work on an existing project
 */

import chalk from 'chalk';
import { ConversationState } from '../conversation-state.js';
import { ConversationalInterface } from '../conversational-interface.js';
import { ProjectGenerator } from '../project-generator.js';

export class ResumeCommand {
  constructor(pantheon) {
    this.pantheon = pantheon;
    this.state = new ConversationState();
    this.conversation = new ConversationalInterface();
    this.generator = new ProjectGenerator();
  }

  /**
   * Execute the resume command
   * @param {string} args - Project name to resume
   */
  async execute(args) {
    try {
      await this.state.initialize();
      
      let session;
      
      if (args?.trim()) {
        // Find project by name
        const projects = await this.state.listProjects();
        const projectName = args.trim();
        const project = projects.find(p => 
          p.projectName.toLowerCase() === projectName.toLowerCase()
        );
        
        if (!project) {
          console.log(chalk.yellow(`\nProject "${projectName}" not found.`));
          await this.showAvailableProjects();
          return;
        }
        
        session = await this.state.loadSession(project.id);
      } else {
        // Load most recent session
        session = await this.state.loadCurrentSession();
        
        if (!session) {
          console.log(chalk.yellow('\nNo recent project to resume.'));
          await this.showAvailableProjects();
          return;
        }
      }

      // Resume the session
      console.log(chalk.blue(`\n🏛️ Resuming: ${session.projectName}\n`));
      
      // Show brief status
      console.log(chalk.gray('Project Status:'));
      console.log(`  Phase: ${chalk.white(this.getPhaseName(session.phase))}`);
      console.log(`  Last Active: ${chalk.white(new Date(session.startedAt).toLocaleString())}`);
      console.log(`  Current God: ${chalk.blue(session.currentGod)}\n`);

      // Resume based on phase
      await this.resumeFromPhase(session);

    } catch (error) {
      console.error(chalk.red('\n❌ Error resuming project:'), error.message);
      if (process.env.DEBUG) {
        console.error(error);
      }
    } finally {
      this.conversation.close();
    }
  }

  /**
   * Resume from current phase
   * @param {Object} session - Project session
   */
  async resumeFromPhase(session) {
    const godName = session.currentGod || 'Zeus';
    
    switch (session.phase) {
      case 'discovery':
        await this.resumeDiscovery(session, godName);
        break;
        
      case 'planning':
        await this.resumePlanning(session, godName);
        break;
        
      case 'planning_complete':
        await this.resumeImplementation(session);
        break;
        
      case 'implementation':
      case 'building':
        await this.showImplementationStatus(session);
        break;
        
      default:
        await this.resumeGeneral(session, godName);
    }
  }

  /**
   * Resume discovery phase
   * @param {Object} session - Project session
   * @param {string} godName - Current god
   */
  async resumeDiscovery(session, godName) {
    this.conversation.godSpeak(godName, 
      "Welcome back! We were discussing your project vision. Let me recap what we've covered so far.");
    
    // Show what we know
    if (session.context.discovery) {
      const disc = session.context.discovery;
      console.log(chalk.gray('\nWhat we know:'));
      if (disc.users) console.log(`  • Target users: ${disc.users}`);
      if (disc.core_feature) console.log(`  • Core feature: ${disc.core_feature}`);
      if (disc.experience) console.log(`  • Desired experience: ${disc.experience}`);
    }

    // Continue conversation
    const continueAnswer = await this.conversation.godAsk(godName,
      "Shall we continue exploring your vision, or are you ready to move to planning?");
    
    if (continueAnswer.toLowerCase().includes('plan') || 
        continueAnswer.toLowerCase().includes('ready')) {
      // Transition to planning
      await this.transitionToPlanning(session);
    } else {
      // Continue discovery
      console.log(chalk.gray('\n[Continuing discovery conversation...]'));
      // Would implement more discovery questions here
    }
  }

  /**
   * Resume planning phase
   * @param {Object} session - Project session
   * @param {string} godName - Current god
   */
  async resumePlanning(session, godName) {
    this.conversation.godSpeak(godName,
      "Welcome back! We were working on defining your project features and plan.");
    
    if (session.context.plan && session.context.plan.mvp_features) {
      console.log(chalk.gray('\nPlanned features:'));
      const features = session.context.plan.mvp_features.split(',');
      features.forEach(f => console.log(`  • ${f.trim()}`));
    }

    const proceed = await this.conversation.godAsk(godName,
      "Would you like to refine these features or proceed to implementation?");
    
    if (proceed.toLowerCase().includes('implement') || 
        proceed.toLowerCase().includes('proceed')) {
      await this.state.updatePhase('planning_complete');
      await this.resumeImplementation(session);
    } else {
      // Continue planning
      console.log(chalk.gray('\n[Continuing planning...]'));
    }
  }

  /**
   * Resume implementation phase
   * @param {Object} session - Project session
   */
  async resumeImplementation(session) {
    await this.conversation.showTransition(session.currentGod || 'Zeus', 'Hephaestus',
      "Time to bring your vision to life! Let me hand this to Hephaestus, our master builder.");
    
    const ready = await this.conversation.godAsk('Hephaestus',
      "I'm ready to forge your project. Shall I begin creating the code structure?");
    
    if (ready.toLowerCase() === 'yes' || ready.toLowerCase() === 'y') {
      await this.state.updatePhase('building');
      await this.generator.generateProject(session, {
        discovery: session.context.discovery,
        plan: session.context.plan,
        design: session.context.design
      });
      
      console.log(chalk.green('\n✨ Project structure updated!'));
      console.log(chalk.gray('Continue developing your project with your favorite editor.'));
    }
  }

  /**
   * Show implementation status
   * @param {Object} session - Project session
   */
  async showImplementationStatus(session) {
    this.conversation.godSpeak('Hephaestus',
      "Welcome back! Your project structure has been created.");
    
    console.log(chalk.gray('\n' + 'Project location: ' + session.projectName));
    console.log(chalk.cyan('\nNext steps:'));
    console.log('  1. Navigate to your project directory');
    console.log('  2. Install dependencies: npm install');
    console.log('  3. Start development: npm run dev');
    console.log('  4. Implement your features');
    
    console.log(chalk.gray('\nThe gods remain available for guidance whenever needed.'));
  }

  /**
   * Resume general case
   * @param {Object} session - Project session
   * @param {string} godName - Current god
   */
  async resumeGeneral(session, godName) {
    this.conversation.godSpeak(godName,
      `Welcome back to ${session.projectName}! I'm here to help you continue.`);
    
    const help = await this.conversation.godAsk(godName,
      "What would you like to work on today?");
    
    console.log(chalk.gray('\n[Processing request...]'));
    // Would implement request handling here
  }

  /**
   * Transition to planning phase
   * @param {Object} session - Project session
   */
  async transitionToPlanning(session) {
    await this.conversation.showTransition('Zeus', 'Prometheus',
      "Excellent! Now that I understand your vision, let me bring in Prometheus to help shape your features.");
    
    await this.state.transitionToGod('Prometheus', 'Moving to feature planning');
    await this.state.updatePhase('planning');
    
    const plan = await this.conversation.prometheusPlanning(this.state);
    await this.state.updateContext({ plan });
    
    console.log(chalk.green('\n✓ Feature planning complete!'));
  }

  /**
   * Show available projects
   */
  async showAvailableProjects() {
    const projects = await this.state.listProjects();
    
    if (projects.length > 0) {
      console.log(chalk.cyan('\nAvailable projects:'));
      projects.forEach(p => {
        console.log(`  • ${chalk.white(p.projectName)} (${this.getPhaseName(p.phase)})`);
      });
      console.log('\nResume with: ' + chalk.yellow('/gods resume [project-name]'));
    } else {
      console.log('Start a new project with: ' + chalk.cyan('/gods init "your idea"'));
    }
    console.log();
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