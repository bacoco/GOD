/**
 * Unified Command Handler
 * Routes commands between conversational interface and Claude-Flow system
 */

import chalk from 'chalk';
import { GodsCommandHandler } from './command-handler.js';
import { PantheonCore } from './pantheon-core.js';

export class UnifiedCommandHandler {
  constructor(options = {}) {
    this.pantheon = null;
    this.godsCommandHandler = null;
    this.claudeFlow = options.claudeFlow;
    this.mode = options.mode || 'auto'; // 'conversational', 'claude-flow', 'auto'
    
    // Configuration
    this.config = {
      enableConversational: options.enableConversational !== false,
      enableClaudeFlow: options.enableClaudeFlow !== false,
      preferConversational: options.preferConversational || false,
      ...options
    };
    
    this.initialized = false;
  }

  /**
   * Initialize the unified handler
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Initialize Pantheon with or without Claude-Flow
      this.pantheon = new PantheonCore(this.claudeFlow, {
        useClaudeFlow: this.config.enableClaudeFlow && !!this.claudeFlow,
        ...this.config
      });
      
      await this.pantheon.initialize();
      
      // Initialize conversational command handler
      if (this.config.enableConversational) {
        this.godsCommandHandler = new GodsCommandHandler(this.pantheon);
      }
      
      this.initialized = true;
      
    } catch (error) {
      console.error('Failed to initialize UnifiedCommandHandler:', error);
      throw error;
    }
  }

  /**
   * Main command execution entry point
   * @param {string} command - The command to execute
   * @returns {*} Command result
   */
  async execute(command) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Parse command to determine routing
    const routing = this.determineRouting(command);
    
    switch (routing.type) {
      case 'conversational':
        return await this.executeConversational(command);
        
      case 'claude-flow':
        return await this.executeClaudeFlow(routing.parsedCommand);
        
      case 'hybrid':
        return await this.executeHybrid(command, routing);
        
      default:
        throw new Error(`Unknown routing type: ${routing.type}`);
    }
  }

  /**
   * Determine how to route the command
   * @param {string} command - The command to analyze
   * @returns {Object} Routing information
   */
  determineRouting(command) {
    const trimmed = command.trim();
    
    // Check if it's a /gods command
    if (GodsCommandHandler.isGodsCommand(trimmed)) {
      // Special cases for hybrid execution
      if (trimmed.includes('/gods init') && this.pantheon.useClaudeFlow) {
        return {
          type: 'hybrid',
          isGodsCommand: true,
          subcommand: 'init',
          args: this.extractGodsArgs(trimmed)
        };
      }
      
      // Regular conversational command
      return {
        type: 'conversational',
        isGodsCommand: true
      };
    }
    
    // Check if it's a Claude-Flow style command
    if (this.isClaudeFlowCommand(trimmed)) {
      return {
        type: 'claude-flow',
        parsedCommand: this.parseClaudeFlowCommand(trimmed)
      };
    }
    
    // Auto-detection based on content
    if (this.mode === 'auto') {
      return this.autoDetectRouting(trimmed);
    }
    
    // Default to preferred mode
    return {
      type: this.config.preferConversational ? 'conversational' : 'claude-flow',
      command: trimmed
    };
  }

  /**
   * Execute conversational command
   * @param {string} command - The command to execute
   * @returns {*} Command result
   */
  async executeConversational(command) {
    if (!this.godsCommandHandler) {
      throw new Error('Conversational interface not enabled');
    }
    
    return await this.godsCommandHandler.execute(command);
  }

  /**
   * Execute Claude-Flow command
   * @param {Object} parsedCommand - Parsed command object
   * @returns {*} Command result
   */
  async executeClaudeFlow(parsedCommand) {
    if (!this.claudeFlow) {
      throw new Error('Claude-Flow not available');
    }
    
    const { action, target, args } = parsedCommand;
    
    switch (action) {
      case 'agent':
        if (target === 'spawn') {
          const godName = args[0];
          const god = await this.pantheon.summonGod(godName);
          console.log(chalk.green(`✨ ${god.name} summoned via Claude-Flow!`));
          return god;
        }
        break;
        
      case 'task':
        if (target === 'create') {
          const task = args[0];
          return await this.pantheon.orchestrate(task);
        }
        break;
        
      case 'workflow':
        const workflowName = target;
        return await this.pantheon.executeWorkflow(workflowName, args[0]);
        
      default:
        throw new Error(`Unknown Claude-Flow action: ${action}`);
    }
  }

  /**
   * Execute hybrid command (conversational + Claude-Flow)
   * @param {string} command - Original command
   * @param {Object} routing - Routing information
   * @returns {*} Command result
   */
  async executeHybrid(command, routing) {
    if (routing.subcommand === 'init') {
      // Enhanced init that uses real Claude-Flow agents
      return await this.executeEnhancedInit(routing.args);
    }
    
    // Other hybrid commands can be added here
    throw new Error(`Hybrid execution not implemented for: ${routing.subcommand}`);
  }

  /**
   * Execute enhanced init with Claude-Flow integration
   * @param {string} args - Project idea from command
   * @returns {*} Command result
   */
  async executeEnhancedInit(args) {
    // Start conversational interface
    const initCommand = this.godsCommandHandler.commands.init;
    
    // Override the project generation to use real agents
    const originalGenerate = initCommand.generator.generateProject;
    
    initCommand.generator.generateProject = async (session, projectData) => {
      console.log(chalk.blue('\n🏛️ Summoning the gods to build your project...\n'));
      
      // Create Zeus orchestrator agent
      const zeusAgent = await this.pantheon.createClaudeFlowAgent('zeus', {
        name: 'zeus-orchestrator',
        type: 'orchestrator',
        instructions: `You are Zeus, orchestrating the creation of: ${projectData.discovery.projectIdea}
        
Project Requirements:
- Users: ${projectData.discovery.users}
- Core Feature: ${projectData.discovery.core_feature}
- Experience: ${projectData.discovery.experience}
${projectData.plan ? `- Features: ${projectData.plan.mvp_features}` : ''}

Orchestrate the gods to build this project:
1. Have Daedalus design the architecture
2. Have Hephaestus implement the code
3. Have Apollo create the UI
4. Have Themis write tests
5. Coordinate their work and ensure quality`,
        tools: ['Task', 'TodoWrite', 'Memory']
      });
      
      // Subscribe to progress
      this.pantheon.subscribeToAgentProgress(zeusAgent.id, (progress) => {
        if (progress.type === 'progress') {
          console.log(chalk.gray(`[${progress.godName}] ${progress.message || 'Working...'}`));
        }
      });
      
      // Execute the orchestration
      const result = await zeusAgent.execute({
        task: 'orchestrate-project-creation',
        projectData: projectData
      });
      
      // Call original generator as fallback or for structure
      await originalGenerate.call(initCommand.generator, session, projectData);
      
      console.log(chalk.green('\n✨ The gods have completed their work!'));
      
      return result;
    };
    
    // Execute the enhanced init
    return await initCommand.execute(args);
  }

  /**
   * Check if command is Claude-Flow style
   * @param {string} command - Command to check
   * @returns {boolean}
   */
  isClaudeFlowCommand(command) {
    const claudeFlowPatterns = [
      /^agent\s+spawn\s+/i,
      /^task\s+create\s+/i,
      /^workflow\s+/i,
      /^swarm\s+/i,
      /^memory\s+/i
    ];
    
    return claudeFlowPatterns.some(pattern => pattern.test(command));
  }

  /**
   * Parse Claude-Flow command
   * @param {string} command - Command to parse
   * @returns {Object} Parsed command
   */
  parseClaudeFlowCommand(command) {
    const parts = command.split(/\s+/);
    
    return {
      action: parts[0],
      target: parts[1],
      args: parts.slice(2)
    };
  }

  /**
   * Auto-detect routing based on command content
   * @param {string} command - Command to analyze
   * @returns {Object} Routing information
   */
  autoDetectRouting(command) {
    // Keywords that suggest conversational intent
    const conversationalKeywords = [
      'build', 'create', 'make', 'design', 'implement',
      'i want', 'i need', 'help me', 'can you'
    ];
    
    const lowerCommand = command.toLowerCase();
    const isConversational = conversationalKeywords.some(keyword => 
      lowerCommand.includes(keyword)
    );
    
    if (isConversational && this.config.enableConversational) {
      return { type: 'conversational', command };
    }
    
    return { type: 'claude-flow', parsedCommand: this.parseClaudeFlowCommand(command) };
  }

  /**
   * Extract arguments from /gods command
   * @param {string} command - The command
   * @returns {string} Extracted arguments
   */
  extractGodsArgs(command) {
    const match = command.match(/\/gods\s+\w+\s+"([^"]+)"|\/gods\s+\w+\s+'([^']+)'|\/gods\s+\w+\s+(.+)/);
    if (match) {
      return match[1] || match[2] || match[3] || '';
    }
    return '';
  }

  /**
   * Get Pantheon instance
   * @returns {PantheonCore} Pantheon instance
   */
  getPantheon() {
    return this.pantheon;
  }

  /**
   * Shutdown the handler
   */
  async shutdown() {
    if (this.pantheon) {
      await this.pantheon.shutdown();
    }
    this.initialized = false;
  }
}

export default UnifiedCommandHandler;