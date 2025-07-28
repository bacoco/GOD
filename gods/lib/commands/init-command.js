/**
 * /gods init command implementation
 * Starts a new project through conversational interface
 */

import chalk from 'chalk';
import { ConversationState } from '../conversation-state.js';
import { ConversationalInterface } from '../conversational-interface.js';
import { ProjectGenerator } from '../project-generator.js';

export class InitCommand {
  constructor(pantheon) {
    this.pantheon = pantheon;
    this.state = new ConversationState();
    this.conversation = new ConversationalInterface();
    this.generator = new ProjectGenerator();
  }

  /**
   * Execute the init command
   * @param {string} args - Project idea from command
   */
  async execute(args) {
    try {
      // Initialize state management
      await this.state.initialize();

      // Parse project idea from args or ask for it
      let projectIdea = args.trim();
      
      if (!projectIdea) {
        console.log(chalk.blue('\n🏛️ Welcome to Pantheon - Where Gods Build Software\n'));
        projectIdea = await this.conversation.rl.question(
          chalk.cyan('What would you like to build? ')
        );
      }

      // Remove quotes if present
      projectIdea = projectIdea.replace(/^["']|["']$/g, '');

      if (!projectIdea) {
        console.log(chalk.yellow('\nNo project idea provided. Run /gods init "your idea" to start.'));
        this.conversation.close();
        return;
      }

      // Extract project name from idea
      const projectName = this.extractProjectName(projectIdea);
      
      // Start new session
      const session = await this.state.startSession(projectName);
      console.log(chalk.gray(`\n[Starting project: ${projectName}]\n`));

      // Zeus discovery phase
      const discovery = await this.conversation.zeusDiscovery(this.state, projectIdea);
      
      // Update session context
      await this.state.updateContext({
        projectIdea,
        discovery: discovery.discovery
      });

      // Transition to next god
      await this.conversation.showTransition('Zeus', discovery.nextGod, discovery.transitionReason);
      await this.state.transitionToGod(discovery.nextGod, discovery.transitionReason);

      // Continue with next god's questions
      let projectData = { discovery: discovery.discovery };

      switch (discovery.nextGod) {
        case 'Prometheus':
          const plan = await this.conversation.prometheusPlanning(this.state);
          projectData.plan = plan;
          await this.state.updateContext({ plan });
          break;

        case 'Apollo':
          const design = await this.conversation.apolloDesign(this.state);
          projectData.design = design;
          await this.state.updateContext({ design });
          
          // After Apollo, usually go to Prometheus for features
          await this.conversation.showTransition('Apollo', 'Prometheus', 
            "Excellent design vision! Now let me bring in Prometheus to help define the features that will bring this design to life.");
          const featurePlan = await this.conversation.prometheusPlanning(this.state);
          projectData.plan = featurePlan;
          await this.state.updateContext({ plan: featurePlan });
          break;

        case 'Daedalus':
          // Architecture questions would go here
          console.log(chalk.magenta('\n[Daedalus]: Based on your requirements, I recommend a microservices architecture...'));
          await this.state.updateContext({ architecture: 'microservices' });
          break;
      }

      // Summary and next steps
      await this.conversation.showThinking('Zeus', 'preparing your development plan');
      
      console.log(chalk.blue('\n[Zeus]: ') + 'The council has deliberated, and we have a clear path forward!\n');
      
      console.log(chalk.green('📋 Project Summary:'));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(`  Project: ${chalk.white(projectName)}`);
      console.log(`  Vision: ${chalk.white(projectIdea)}`);
      console.log(`  Users: ${chalk.white(projectData.discovery.users)}`);
      console.log(`  Core Feature: ${chalk.white(projectData.discovery.core_feature)}`);
      
      if (projectData.plan) {
        console.log(`\n  MVP Features:`);
        const features = projectData.plan.mvp_features.split(',').map(f => f.trim());
        features.forEach(f => console.log(`    • ${chalk.white(f)}`));
      }

      console.log(chalk.gray('─'.repeat(50)));

      // Ask about implementation
      const proceed = await this.conversation.rl.question(
        chalk.cyan('\nWould you like me to start building this? (yes/no): ')
      );

      if (proceed.toLowerCase() === 'yes' || proceed.toLowerCase() === 'y') {
        console.log(chalk.blue('\n[Zeus]: ') + 'Excellent! The gods will now begin crafting your vision into reality.\n');
        
        // Transition to Hephaestus for building
        await this.conversation.showTransition('Zeus', 'Hephaestus', 
          "I'll hand this over to Hephaestus, our master builder. He'll transform these plans into working code.");
        
        // Generate project structure
        await this.generator.generateProject(session, projectData);
        
        console.log(chalk.green('\n✨ Your project has been created!'));
        console.log(chalk.gray('\nNext steps:'));
        console.log('  1. Navigate to your project directory');
        console.log('  2. Run /gods status to see progress');
        console.log('  3. Run /gods resume to continue development');
        
      } else {
        console.log(chalk.blue('\n[Zeus]: ') + 'Very well. Your project plan has been saved.');
        console.log(chalk.gray('Run /gods resume to continue when you\'re ready.'));
      }

      // Mark phase as planning complete
      await this.state.updatePhase('planning_complete');

    } catch (error) {
      console.error(chalk.red('\n❌ Error during initialization:'), error.message);
      if (process.env.DEBUG) {
        console.error(error);
      }
    } finally {
      this.conversation.close();
    }
  }

  /**
   * Extract a project name from the idea
   * @param {string} idea - The project idea
   * @returns {string} Project name
   */
  extractProjectName(idea) {
    // Simple extraction - take first few words
    const words = idea.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 3);
    
    return words.join('-') || 'pantheon-project';
  }
}