/**
 * /gods init command implementation
 * Starts a new project through conversational interface
 */

import chalk from 'chalk';
import { ConversationState } from '../conversation-state.js';
import { ConversationalInterface } from '../conversational-interface.js';
// Project generation now handled exclusively by Claude-Flow agents

export class InitCommand {
  constructor(pantheon) {
    this.pantheon = pantheon;
    this.state = new ConversationState();
    this.conversation = new ConversationalInterface();
    
    // Claude-Flow is now required - no fallbacks
    if (!pantheon || !pantheon.claudeFlowBridge) {
      throw new Error('Claude-Flow is required. Please ensure Claude-Flow is installed in ./claude-flow directory.');
    }
    
    this.activeAgents = new Map();
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
        
        // Always use Claude-Flow agents - no fallbacks
        await this.buildWithClaudeFlow(session, projectData);
        
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
   * Build project using Claude-Flow agents
   * @param {Object} session - Current session
   * @param {Object} projectData - Project data from conversation
   */
  async buildWithClaudeFlow(session, projectData) {
    console.log(chalk.blue('\n🏛️ Summoning the divine council to build your project...\n'));
    
    try {
      // Create Zeus orchestrator agent
      const zeusConfig = {
        name: 'zeus-project-orchestrator',
        type: 'orchestrator',
        tools: ['Task', 'TodoWrite', 'Memory', 'Read', 'Write', 'Edit'],
        instructions: this.createZeusInstructions(projectData),
        purpose: 'Orchestrate the creation of the project'
      };
      
      const zeusAgent = await this.pantheon.createClaudeFlowAgent('zeus', zeusConfig);
      this.activeAgents.set('zeus', zeusAgent);
      
      // Subscribe to progress updates
      this.subscribeToProgress(zeusAgent.id, 'Zeus');
      
      // Show initial orchestration
      console.log(chalk.blue('[Zeus]: ') + 'I will now coordinate the gods to build your vision:\n');
      console.log(chalk.gray('  • Daedalus will design the architecture'));
      console.log(chalk.gray('  • Hephaestus will implement the code'));
      console.log(chalk.gray('  • Apollo will create the user interface'));
      console.log(chalk.gray('  • Themis will ensure quality with tests\n'));
      
      // Execute the orchestration
      const orchestrationTask = {
        type: 'project-creation',
        projectData: projectData,
        sessionId: session.id,
        requirements: {
          architecture: true,
          implementation: true,
          ui: projectData.design || projectData.plan?.includes('UI'),
          testing: true,
          documentation: true
        }
      };
      
      console.log(chalk.gray('\n[Starting divine orchestration...]\n'));
      
      // Execute Zeus's orchestration
      const result = await zeusAgent.execute(orchestrationTask);
      
      // Zeus will spawn other gods as needed through the Task tool
      // The progress will be shown via subscriptions
      
      // Store the generated project info
      await this.state.updateContext({
        claudeFlowExecution: {
          orchestrator: zeusAgent.id,
          result: result,
          timestamp: Date.now()
        }
      });
      
      // Generate project files based on agent results
      await this.generateProjectFromAgentWork(session, projectData, result);
      
    } catch (error) {
      console.error(chalk.red('\n❌ Error during Claude-Flow execution:'), error.message);
      throw new Error(`Claude-Flow agent execution failed: ${error.message}. Please check Claude-Flow installation.`);
    }
  }

  /**
   * Create instructions for Zeus orchestrator
   * @param {Object} projectData - Project data
   * @returns {string} Instructions
   */
  createZeusInstructions(projectData) {
    const { discovery, plan, design } = projectData;
    
    return `You are Zeus, the supreme orchestrator of the Pantheon. Your task is to coordinate the creation of a new project.

Project Vision: ${discovery.projectIdea}

Requirements gathered from conversation:
- Target Users: ${discovery.users}
- Core Feature: ${discovery.core_feature}
- User Experience: ${discovery.experience}
${plan ? `- MVP Features: ${plan.mvp_features}` : ''}
${plan ? `- Success Metrics: ${plan.success_metrics || 'User satisfaction'}` : ''}
${design ? `- Design Style: ${design.visual_style}` : ''}

Your orchestration approach:
1. Create a comprehensive todo list for the project
2. Spawn Daedalus to design the system architecture
3. Spawn Hephaestus to implement the backend and core logic
4. Spawn Apollo to create the user interface (if needed)
5. Spawn Themis to write tests
6. Coordinate their work and ensure quality

Use the Task tool to spawn each god with specific instructions.
Use TodoWrite to track progress.
Use Memory to store important decisions and context.
Use Read/Write/Edit to manage project files.

Remember: You are orchestrating real work, not just planning. Each god should produce actual code and documentation.`;
  }

  /**
   * Subscribe to agent progress updates
   * @param {string} agentId - Agent ID
   * @param {string} godName - God name for display
   */
  subscribeToProgress(agentId, godName) {
    this.pantheon.subscribeToAgentProgress(agentId, (progress) => {
      if (progress.type === 'progress') {
        console.log(chalk.gray(`[${godName}]: ${progress.message || 'Working...'}`));
      } else if (progress.type === 'complete') {
        console.log(chalk.green(`✓ ${godName} has completed their task`));
      } else if (progress.type === 'error') {
        console.log(chalk.red(`✗ ${godName} encountered an error: ${progress.error}`));
      }
    });
  }

  /**
   * Generate project files from agent work
   * @param {Object} session - Session data
   * @param {Object} projectData - Project data
   * @param {Object} agentResult - Result from agent execution
   */
  async generateProjectFromAgentWork(session, projectData, agentResult) {
    // Claude-Flow agents must create files directly
    if (!agentResult || !agentResult.filesCreated || agentResult.filesCreated.length === 0) {
      throw new Error('Claude-Flow agents did not create any project files. Agent execution may have failed.');
    }
    
    console.log(chalk.green(`\n✅ Project files created by the gods:`));
    agentResult.filesCreated.forEach(file => {
      console.log(chalk.gray(`  • ${file}`));
    });
    
    // Store project metadata for future reference
    await this.state.updateContext({
      projectGenerated: true,
      filesCreated: agentResult.filesCreated,
      generatedBy: 'claude-flow-agents',
      timestamp: Date.now()
    });
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