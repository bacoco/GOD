/**
 * /gods init command implementation
 * Starts a new project through conversational interface
 */

import chalk from 'chalk';
import { ConversationState } from '../conversation-state.js';
import { ConversationalInterface } from '../conversational-interface.js';
import { AgentSpecGenerator } from '../agent-spec-generator.js';
import { ToolAllocator } from '../tool-allocator.js';
import { AgentComposer } from '../agent-composer.js';
import { MDPersistenceManager } from '../md-persistence-manager.js';
// Project generation now handled exclusively by Claude-Flow agents with custom MD generation

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
    
    // Initialize MD generation pipeline components
    this.specGenerator = new AgentSpecGenerator();
    this.toolAllocator = new ToolAllocator();
    this.agentComposer = new AgentComposer(pantheon.claudeFlowBridge.claudeFlowPath);
    this.mdPersistence = new MDPersistenceManager({
      basePath: pantheon.claudeFlowBridge.claudeFlowPath + '/.claude/agents'
    });
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

      // Summon Concilium for project planning council
      console.log(chalk.blue('\n[Zeus]: ') + 'Let me convene the divine council to discuss the best approach...\n');
      
      // Create Concilium instance
      const concilium = await this.pantheon.createClaudeFlowAgent('concilium', {
        name: 'concilium-facilitator',
        type: 'coordinator',
        instructions: 'Facilitate a planning meeting for the project'
      });
      
      // Host initial planning council
      const councilDecisions = await this.hostPlanningCouncil(session, projectData, concilium);
      
      // Update project data with council decisions
      projectData.councilDecisions = councilDecisions;
      await this.state.updateContext({ councilDecisions });

      // Ask about implementation
      const proceed = await this.conversation.rl.question(
        chalk.cyan('\nWould you like me to start building this with the agreed approach? (yes/no): ')
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
   * Build project using Claude-Flow agents with custom MD generation
   * @param {Object} session - Current session
   * @param {Object} projectData - Project data from conversation
   */
  async buildWithClaudeFlow(session, projectData) {
    console.log(chalk.blue('\n🏛️ Summoning the divine council to build your project...\n'));
    console.log(chalk.gray('Generating custom agent configurations based on your requirements...\n'));
    
    try {
      // Initialize MD generation pipeline
      await this.agentComposer.initialize();
      await this.mdPersistence.initialize();
      
      // Set project context for MD persistence
      const projectId = session.id || 'pantheon-' + Date.now();
      this.mdPersistence.setProject(projectId, projectData.discovery.projectIdea);
      
      // Step 1: Generate agent specifications based on PRD and council decisions
      console.log(chalk.gray('[1/5] Analyzing requirements and generating agent specifications...'));
      // Pass council decisions to influence agent generation
      const enhancedProjectData = {
        ...projectData,
        architecture: projectData.councilDecisions?.architecture,
        toolStrategy: projectData.councilDecisions?.toolAllocationStrategy
      };
      const agentSpecs = await this.specGenerator.generateSpecs(enhancedProjectData);
      
      // Filter specs based on council-assigned responsibilities
      const assignedGods = Object.keys(projectData.councilDecisions?.responsibilities || {});
      const filteredSpecs = agentSpecs.filter(spec => {
        const godName = spec.specialization?.parentGod;
        return !godName || assignedGods.includes(godName.toLowerCase()) || godName === 'zeus';
      });
      
      console.log(chalk.green(`✓ Generated ${filteredSpecs.length} specialized agent specifications`));
      
      // Step 2: Process each agent spec through the MD pipeline
      const customAgents = [];
      
      // Check if we need to summon Vulcan for dynamic tool allocation
      let vulcan = null;
      if (projectData.councilDecisions?.toolAllocationStrategy === 'dynamic') {
        console.log(chalk.gray('\n[Summoning Vulcan for dynamic tool allocation...]'));
        vulcan = await this.pantheon.createClaudeFlowAgent('vulcan', {
          name: 'vulcan-tool-broker',
          type: 'coordinator',
          instructions: 'Manage dynamic tool allocation for gods'
        });
      }
      
      for (const spec of filteredSpecs) {
        console.log(chalk.gray(`\n[2/5] Processing ${spec.displayName}...`));
        
        // Tool allocation based on strategy
        if (projectData.councilDecisions?.toolAllocationStrategy === 'dynamic' && vulcan) {
          // Dynamic allocation through Vulcan
          console.log(chalk.orange(`  • [Vulcan]: Analyzing tool needs for ${spec.displayName}...`));
          
          // Simulate Vulcan's analysis
          const godPurpose = spec.specialization?.focus || spec.description;
          console.log(chalk.orange(`  • [Vulcan]: Based on "${godPurpose}", I recommend:`));
          
          // Get initial minimal tools
          const minimalTools = await this.getMinimalToolsForGod(spec);
          spec.tools = minimalTools;
          
          console.log(chalk.gray(`  • Starting with ${minimalTools.length} essential tools`));
          console.log(chalk.orange(`  • [Vulcan]: Additional tools can be requested during development`));
          
          // Store Vulcan's recommendations for later
          spec.vulcanRecommendations = {
            essential: minimalTools,
            onDemand: await this.toolAllocator.allocateTools(spec) // Full list for reference
          };
        } else {
          // Static allocation (original behavior)
          console.log(chalk.gray(`  • Allocating tools from 87 MCP tools...`));
          const allocatedTools = await this.toolAllocator.allocateTools(spec);
          spec.tools = allocatedTools;
          console.log(chalk.gray(`  • Allocated ${allocatedTools.length} specialized tools`));
        }
        
        // Compose hybrid agent from base agents
        console.log(chalk.gray(`  • Composing from ${spec.baseAgents.length} base agents...`));
        const composedAgent = await this.agentComposer.compose(spec);
        console.log(chalk.gray(`  • Created hybrid agent with ${composedAgent.capabilities.length} capabilities`));
        
        // Save custom MD file
        console.log(chalk.gray(`  • Generating custom MD configuration...`));
        const mdPath = await this.mdPersistence.saveAgentMD(composedAgent, {
          projectSpecific: true,
          createSymlink: true
        });
        console.log(chalk.green(`  ✓ Saved custom agent: ${mdPath}`));
        
        customAgents.push({
          spec: composedAgent,
          mdPath: mdPath,
          godName: spec.specialization?.parentGod || spec.name
        });
      }
      
      // Step 3: Spawn agents using custom MD files
      console.log(chalk.gray('\n[3/5] Spawning divine agents with custom configurations...\n'));
      
      // Start with Zeus orchestrator
      const zeusAgent = customAgents.find(a => a.godName === 'zeus');
      if (!zeusAgent) {
        throw new Error('Zeus orchestrator specification not found');
      }
      
      // Spawn Zeus using custom MD
      const zeusInstance = await this.pantheon.claudeFlowBridge.spawnAgentFromMD(zeusAgent.mdPath, {
        sessionId: session.id,
        projectData: projectData
      });
      
      this.activeAgents.set('zeus', zeusInstance);
      this.subscribeToProgress(zeusInstance.id, 'Zeus');
      
      console.log(chalk.blue('[Zeus]: ') + 'I have been configured specifically for your project!\n');
      console.log(chalk.blue('[Zeus]: ') + 'My divine capabilities include:\n');
      zeusAgent.spec.capabilities.slice(0, 5).forEach(cap => {
        console.log(chalk.gray(`  • ${cap}`));
      });
      
      // Show orchestration plan
      console.log(chalk.blue('\n[Zeus]: ') + 'I will coordinate the following gods:\n');
      customAgents.forEach(agent => {
        if (agent.godName !== 'zeus') {
          const god = agent.spec;
          console.log(chalk.gray(`  • ${god.displayName}: ${god.specialization?.focus || god.description}`));
        }
      });
      
      // Step 4: Execute orchestration with custom agents
      console.log(chalk.gray('\n[4/5] Initiating divine orchestration...\n'));
      
      // Create orchestration task with references to custom MD files and council decisions
      const orchestrationTask = {
        type: 'project-creation',
        projectData: projectData,
        sessionId: session.id,
        councilDecisions: projectData.councilDecisions,
        customAgents: customAgents.map(a => ({
          name: a.spec.name,
          mdPath: a.mdPath,
          godName: a.godName,
          capabilities: a.spec.capabilities,
          tools: a.spec.tools,
          vulcanRecommendations: a.spec.vulcanRecommendations
        })),
        requirements: {
          architecture: projectData.councilDecisions?.architecture || 'modular-monolith',
          implementation: true,
          ui: projectData.design || projectData.plan?.mvp_features?.includes('UI'),
          testing: true,
          documentation: true,
          toolStrategy: projectData.councilDecisions?.toolAllocationStrategy || 'static'
        }
      };
      
      // Execute Zeus's orchestration
      const result = await zeusInstance.execute(orchestrationTask);
      
      // Zeus will spawn other gods using the custom MD files
      
      // Step 5: Track and monitor progress
      console.log(chalk.gray('\n[5/5] Monitoring divine creation...\n'));
      
      // Store execution info
      await this.state.updateContext({
        claudeFlowExecution: {
          orchestrator: zeusInstance.id,
          customAgents: customAgents.map(a => ({
            name: a.spec.name,
            mdPath: a.mdPath,
            capabilities: a.spec.capabilities.length,
            tools: a.spec.tools.length
          })),
          mdGenerationPipeline: true,
          result: result,
          timestamp: Date.now()
        }
      });
      
      // List created MD files
      console.log(chalk.green('\n✅ Custom agent configurations created:'));
      customAgents.forEach(agent => {
        console.log(chalk.gray(`  • ${agent.spec.displayName}: ${agent.mdPath}`));
      });
      
      // Generate project files based on agent results
      await this.generateProjectFromAgentWork(session, projectData, result);
      
    } catch (error) {
      console.error(chalk.red('\n❌ Error during MD generation pipeline:'), error.message);
      if (process.env.DEBUG) {
        console.error(error);
      }
      throw new Error(`MD generation pipeline failed: ${error.message}`);
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
   * Host a planning council with the gods
   * @param {Object} session - Current session
   * @param {Object} projectData - Project data from conversation
   * @param {Object} concilium - Concilium facilitator
   * @returns {Object} Council decisions
   */
  async hostPlanningCouncil(session, projectData, concilium) {
    console.log(chalk.magenta('🏛️ [Concilium]: ') + 'Welcome to the Divine Planning Council!\n');
    console.log(chalk.gray('The gods are gathering to discuss your project...\n'));
    
    const decisions = {
      architecture: null,
      primaryTechnologies: {},
      toolAllocationStrategy: 'dynamic', // Will use Vulcan
      responsibilities: {},
      approachVotes: {}
    };
    
    // Simulate gods joining the council
    console.log(chalk.yellow('[Concilium]: ') + 'Daedalus, Hephaestus, and Apollo have joined the council.\n');
    
    // Architecture discussion
    console.log(chalk.cyan('[Daedalus]: ') + 'Based on the requirements, I see several architectural approaches:');
    
    const hasRealtime = projectData.plan?.mvp_features?.toLowerCase().includes('real-time') || 
                       projectData.plan?.mvp_features?.toLowerCase().includes('chat');
    const hasAuth = projectData.plan?.mvp_features?.toLowerCase().includes('auth') ||
                   projectData.plan?.mvp_features?.toLowerCase().includes('user');
    
    if (hasRealtime) {
      console.log('  1. Microservices with separate real-time service');
      console.log('  2. Monolithic with integrated WebSocket handling');
      console.log('  3. Event-driven architecture with message queuing\n');
    } else {
      console.log('  1. Traditional monolithic architecture');
      console.log('  2. Modular monolith with clear boundaries');
      console.log('  3. Microservices for future scalability\n');
    }
    
    console.log(chalk.green('[Hephaestus]: ') + 'Each approach has trade-offs in complexity and development speed.');
    console.log(chalk.blue('[Apollo]: ') + 'The UI requirements would work well with any of these.\n');
    
    // Get user input on architecture
    const archChoice = await this.conversation.rl.question(
      chalk.cyan('[Concilium]: Which architectural approach do you prefer? (1-3): ')
    );
    
    decisions.architecture = this.mapArchitectureChoice(archChoice, hasRealtime);
    
    console.log(chalk.magenta('\n[Concilium]: ') + `The council agrees on ${decisions.architecture} architecture.\n`);
    
    // Technology stack discussion
    if (projectData.discovery?.platform === 'web' || !projectData.discovery?.platform) {
      console.log(chalk.cyan('[Hephaestus]: ') + 'For the technology stack, I recommend:');
      console.log('  • Backend: Node.js with Express or Fastify');
      console.log('  • Database: ' + (hasRealtime ? 'MongoDB for flexibility' : 'PostgreSQL for reliability'));
      console.log('  • Frontend: ' + (projectData.design ? 'React with styled-components' : 'Your choice of framework'));
      
      if (hasAuth) {
        console.log(chalk.yellow('\n[Themis]: ') + 'For authentication, we should use JWT with secure session management.');
      }
      
      const techApproval = await this.conversation.rl.question(
        chalk.cyan('\n[Concilium]: Do you approve these technology choices? (yes/no/modify): ')
      );
      
      if (techApproval.toLowerCase() === 'modify') {
        // Allow custom tech choices
        console.log(chalk.magenta('[Concilium]: ') + 'Please share your technology preferences:');
        const customTech = await this.conversation.rl.question('Your preferences: ');
        decisions.primaryTechnologies.custom = customTech;
      } else {
        decisions.primaryTechnologies = {
          backend: 'Node.js',
          database: hasRealtime ? 'MongoDB' : 'PostgreSQL',
          frontend: projectData.design ? 'React' : 'TBD'
        };
      }
    }
    
    // Summon Vulcan for tool discussion
    console.log(chalk.red('\n[Concilium]: ') + 'Let me summon Vulcan to discuss tool allocation...\n');
    console.log(chalk.orange('[Vulcan]: ') + 'Greetings! I manage access to the 87 divine tools.');
    console.log(chalk.orange('[Vulcan]: ') + 'Based on this project, I recommend dynamic tool allocation:');
    console.log('  • Gods will request tools as needed during development');
    console.log('  • You\'ll approve tool grants for transparency');
    console.log('  • This ensures gods only get tools they actually need\n');
    
    const vulcanApproach = await this.conversation.rl.question(
      chalk.cyan('[Concilium]: Do you prefer dynamic tool allocation or pre-assign all tools? (dynamic/static): ')
    );
    
    decisions.toolAllocationStrategy = vulcanApproach.toLowerCase() === 'static' ? 'static' : 'dynamic';
    
    // Assign primary responsibilities
    console.log(chalk.magenta('\n[Concilium]: ') + 'The council will now assign primary responsibilities:\n');
    
    decisions.responsibilities = {
      'Daedalus': `Architecture design and ${decisions.architecture} structure`,
      'Hephaestus': 'Core implementation and backend development',
      'Apollo': projectData.design ? 'User interface and experience' : null,
      'Themis': 'Testing and quality assurance',
      'Hermes': hasRealtime ? 'Real-time features and messaging' : null,
      'Aegis': hasAuth ? 'Security and authentication' : null
    };
    
    // Remove null responsibilities
    Object.keys(decisions.responsibilities).forEach(god => {
      if (!decisions.responsibilities[god]) {
        delete decisions.responsibilities[god];
      }
    });
    
    // Show summary
    console.log(chalk.green('📋 Council Decisions Summary:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(`  Architecture: ${chalk.white(decisions.architecture)}`);
    console.log(`  Tool Strategy: ${chalk.white(decisions.toolAllocationStrategy)}`);
    console.log('  God Assignments:');
    Object.entries(decisions.responsibilities).forEach(([god, resp]) => {
      console.log(`    • ${chalk.yellow(god)}: ${resp}`);
    });
    console.log(chalk.gray('─'.repeat(50)));
    
    return decisions;
  }

  /**
   * Get minimal essential tools for a god
   * @param {Object} spec - Agent specification
   * @returns {Array} Essential tools only
   */
  getMinimalToolsForGod(spec) {
    const godName = spec.specialization?.parentGod || spec.name;
    
    // Define minimal tool sets for each god type
    const minimalToolSets = {
      'zeus': ['task_orchestrate', 'agent_spawn', 'memory_store'],
      'daedalus': ['architecture_design', 'pattern_matcher'],
      'hephaestus': ['code_generate', 'code_analyze'],
      'apollo': ['ui_generate', 'component_create'],
      'themis': ['test_generate', 'test_execute'],
      'hermes': ['websocket_manager', 'event_stream'],
      'aegis': ['auth_manager', 'security_scan'],
      'athena': ['ml_train', 'pattern_extract'],
      'prometheus': ['task_orchestrate', 'memory_store']
    };
    
    return minimalToolSets[godName.toLowerCase()] || ['task_orchestrate'];
  }

  /**
   * Map architecture choice to named architecture
   */
  mapArchitectureChoice(choice, hasRealtime) {
    const realtimeArchitectures = {
      '1': 'microservices',
      '2': 'monolithic-websocket',
      '3': 'event-driven'
    };
    
    const standardArchitectures = {
      '1': 'monolithic',
      '2': 'modular-monolith',
      '3': 'microservices'
    };
    
    const architectures = hasRealtime ? realtimeArchitectures : standardArchitectures;
    return architectures[choice] || 'modular-monolith';
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