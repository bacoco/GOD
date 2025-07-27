import { EventEmitter } from 'events';
import { getSafetyManager } from './agent-safety.js';
import { AgentMDLoader } from './agent-md-loader.js';
import { AgentAdapter } from './agent-adapter.js';
import { AgentMDGenerator } from './agent-md-generator.js';
import path from 'path';

/**
 * Enhanced BaseGod with MD-based dynamic agent creation
 * Extends the original BaseGod with ability to load and adapt Claude-Flow agents
 */
export class BaseGod extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.name = options.name;
    this.id = `${this.name}-${Date.now()}`;
    this.config = options.config || {};
    this.tools = options.tools || [];
    this.messenger = options.messenger;
    this.pantheon = options.pantheon;
    this.claudeFlow = options.claudeFlow;
    this.factory = options.factory;
    
    // State management
    this.status = 'initializing';
    this.subAgents = new Map();
    this.activeTaskCount = 0;
    this.memory = new Map();
    this.capabilities = this.config.capabilities || [];
    this.responsibilities = this.config.responsibilities || [];
    
    // Hybrid orchestration configuration
    this.orchestrationMode = this.config.orchestrationMode || 'hybrid';
    this.agentCreationLimits = {
      maxAgents: options.maxAgents || 10,
      maxDepth: options.maxDepth || 3,
      timeout: options.timeout || 300000, // 5 minutes
      allowedGods: this.config.allowedGods || this.getDefaultAllowedGods()
    };
    
    // Safety manager
    this.safetyManager = options.safetyManager || getSafetyManager();
    
    // MD-based agent system (NEW)
    const claudeFlowPath = options.claudeFlowPath || path.join(__dirname, '../../../claude-flow');
    this.mdLoader = new AgentMDLoader(claudeFlowPath);
    this.mdAdapter = new AgentAdapter();
    this.mdGenerator = new AgentMDGenerator();
    
    // Initialize MD loader in background
    this.mdLoader.initialize().catch(err => {
      console.warn(`Failed to initialize MD loader for ${this.name}:`, err.message);
    });
    
    // Performance tracking
    this.metrics = {
      tasksCompleted: 0,
      tasksFailured: 0,
      messagesReceived: 0,
      messagesSent: 0,
      subAgentsCreated: 0,
      aiOrchestrations: 0,
      jsOrchestrations: 0,
      mdAgentsCreated: 0, // NEW
      startTime: Date.now()
    };
  }
  
  getDefaultAllowedGods() {
    // Default allowed gods based on this god's role
    const defaults = {
      zeus: ['hephaestus', 'apollo', 'themis', 'aegis', 'daedalus', 'prometheus', 'athena', 'hermes'],
      janus: 'all', // Can create any god
      hephaestus: ['code-reviewer', 'themis'],
      apollo: ['iris', 'argus', 'harmonia'],
      themis: ['aegis'],
      daedalus: ['hephaestus', 'apollo']
    };
    
    return defaults[this.name] || [];
  }

  async initialize() {
    this.emit('god:initializing', { name: this.name });
    
    // Set up tools if available
    if (this.tools.includes('ALL')) {
      this.hasAllTools = true;
    }
    
    // Custom initialization for specific gods
    await this.onInitialize();
    
    this.status = 'active';
    this.emit('god:initialized', { name: this.name, id: this.id });
  }

  // Override in subclasses for custom initialization
  async onInitialize() {
    // Default implementation - override in specific god classes
  }

  /**
   * Enhanced createSubAgent with MD support
   * Now supports baseAgent and baseAgents for Claude-Flow integration
   */
  async createSubAgent(type, config = {}) {
    // Check safety limits
    const safetyCheck = this.safetyManager.canCreateAgent(this.id, this.agentCreationLimits);
    if (!safetyCheck.allowed) {
      throw new Error(`Cannot create sub-agent: ${safetyCheck.reason}`);
    }
    
    let agentSpec = { 
      type, 
      name: config.name || type,
      createdBy: this.name,
      ...config 
    };
    
    // NEW: Load and adapt base agent if specified
    if (config.baseAgent) {
      try {
        const baseAgent = await this.mdLoader.getAgent(config.baseAgent);
        if (baseAgent) {
          agentSpec = await this.mdAdapter.adaptAgent(baseAgent, config);
          agentSpec.type = type; // Preserve the requested type
          this.metrics.mdAgentsCreated++;
        } else {
          console.warn(`Base agent '${config.baseAgent}' not found, creating custom agent`);
        }
      } catch (error) {
        console.warn(`Failed to load base agent '${config.baseAgent}':`, error.message);
      }
    }
    
    // NEW: Combine multiple agents if specified
    if (config.baseAgents && config.baseAgents.length > 0) {
      try {
        const baseAgents = await Promise.all(
          config.baseAgents.map(name => this.mdLoader.getAgent(name))
        );
        const validAgents = baseAgents.filter(Boolean);
        
        if (validAgents.length > 0) {
          agentSpec = await this.mdAdapter.combineAgents(
            validAgents, 
            { 
              name: config.name || type,
              mergeStrategy: config.mergeStrategy || 'union',
              ...config 
            }
          );
          agentSpec.type = type; // Preserve the requested type
          this.metrics.mdAgentsCreated++;
        }
      } catch (error) {
        console.warn(`Failed to combine agents:`, error.message);
      }
    }
    
    // NEW: Generate custom MD if we have adaptations
    if (agentSpec.instructions && (config.baseAgent || config.baseAgents)) {
      const customMD = await this.mdGenerator.generateAgentMD(agentSpec);
      agentSpec.instructions = customMD;
    }
    
    // Determine if this sub-agent should have agent creation capabilities
    const shouldIncludeTaskTool = this.shouldAllowAgentCreation(type, agentSpec);
    
    // Prepare tools based on orchestration mode
    const tools = [...(agentSpec.tools || [])];
    if (shouldIncludeTaskTool && !tools.includes('Task')) {
      tools.push('Task');
    }
    
    // Add safety limits and orchestration config
    const enhancedSpecialization = {
      ...agentSpec,
      tools,
      limits: this.agentCreationLimits,
      orchestrationMode: agentSpec.orchestrationMode || this.orchestrationMode,
      parentGod: this.name,
      allowedGods: agentSpec.allowedGods || this.agentCreationLimits.allowedGods,
      // NEW: Track heritage for debugging
      heritage: agentSpec.heritage || (config.baseAgent ? [config.baseAgent] : []),
      isCustom: !!(config.baseAgent || config.baseAgents)
    };
    
    // Create the sub-agent
    const subAgent = await this.factory.createSubAgent(this, type, enhancedSpecialization);
    
    // Register with safety manager
    this.safetyManager.registerAgent(subAgent.id, this.id, {
      type,
      god: this.name,
      hasTaskTool: tools.includes('Task'),
      isCustom: enhancedSpecialization.isCustom
    });
    
    // Track internally
    this.subAgents.set(subAgent.id, subAgent);
    this.metrics.subAgentsCreated++;
    
    this.emit('god:subagent-created', {
      godName: this.name,
      subAgentId: subAgent.id,
      type,
      specialization: enhancedSpecialization,
      hasAgentCreation: shouldIncludeTaskTool,
      isCustom: enhancedSpecialization.isCustom
    });
    
    return subAgent;
  }
  
  /**
   * NEW: Discover available base agents for a task
   */
  async discoverAgentsForTask(taskDescription) {
    return await this.mdLoader.recommendAgentsForTask(taskDescription);
  }
  
  /**
   * NEW: Get agent by capability
   */
  async findAgentsByCapability(capability) {
    return await this.mdLoader.findAgentsByCapability(capability);
  }
  
  /**
   * NEW: Create specialized agent presets
   */
  async createSpecializedAgent(specialization, config = {}) {
    // Predefined specializations
    const specializations = {
      'blockchain-developer': {
        baseAgent: 'coder',
        adaptations: {
          focus: 'Blockchain and smart contract development',
          expertise: ['Solidity', 'Web3', 'DeFi patterns'],
          tools: ['github', 'foundry'],
          personality: { traits: ['security-focused', 'detail-oriented'] }
        }
      },
      'ml-engineer': {
        baseAgents: ['coder', 'data-ml-model'],
        mergeStrategy: 'capabilities-union',
        adaptations: {
          focus: 'Machine learning and data science',
          expertise: ['Python', 'TensorFlow', 'MLOps'],
          tools: ['github', 'desktop-commander']
        }
      },
      'full-stack-developer': {
        baseAgents: ['backend-dev', 'spec-mobile-react-native'],
        mergeStrategy: 'best-features',
        adaptations: {
          focus: 'Full-stack web development',
          expertise: ['React', 'Node.js', 'Database design']
        }
      },
      'security-auditor': {
        baseAgents: ['security-manager', 'tester'],
        mergeStrategy: 'union',
        adaptations: {
          focus: 'Security auditing and vulnerability assessment',
          tools: ['github', 'security-tools']
        }
      }
    };
    
    const preset = specializations[specialization];
    if (!preset) {
      throw new Error(`Unknown specialization: ${specialization}`);
    }
    
    return await this.createSubAgent(
      specialization,
      { ...preset.adaptations, ...preset, ...config }
    );
  }
  
  shouldAllowAgentCreation(type, specialization) {
    // Determine if this sub-agent should be able to create other agents
    if (this.orchestrationMode === 'js-only') {
      return false;
    }
    
    if (this.orchestrationMode === 'ai-driven') {
      return true;
    }
    
    // Hybrid mode: check specific conditions
    if (specialization.allowAgentCreation === true) {
      return true;
    }
    
    if (specialization.allowAgentCreation === false) {
      return false;
    }
    
    // Default behavior in hybrid mode
    return type === 'orchestrator' || type === 'coordinator' || type === this.name;
  }

  async executeSubAgentTask(subAgentId, task) {
    const subAgent = this.subAgents.get(subAgentId);
    if (!subAgent) {
      throw new Error(`Unknown sub-agent: ${subAgentId}`);
    }
    
    // Use Claude-Flow to execute the task
    if (this.claudeFlow && this.claudeFlow.agents) {
      const result = await this.claudeFlow.agents.execute({
        agentType: subAgent.type,
        task,
        context: {
          parentGod: this.name,
          specialization: subAgent.specialization
        }
      });
      
      return result;
    }
    
    // Fallback implementation
    return {
      success: true,
      result: `Task executed by ${subAgentId}`,
      task
    };
  }

  async handleSubAgentMessage(subAgentId, message) {
    const subAgent = this.subAgents.get(subAgentId);
    if (!subAgent) {
      throw new Error(`Unknown sub-agent: ${subAgentId}`);
    }
    
    // Process message based on type
    if (message.type === 'status') {
      subAgent.status = message.status;
    } else if (message.type === 'result') {
      await this.processSubAgentResult(subAgent, message.result);
    } else if (message.type === 'error') {
      await this.handleSubAgentError(subAgent, message.error);
    }
    
    return { acknowledged: true };
  }

  terminateSubAgent(subAgentId) {
    const subAgent = this.subAgents.get(subAgentId);
    if (subAgent) {
      subAgent.status = 'terminated';
      this.subAgents.delete(subAgentId);
      
      this.emit('god:subagent-terminated', {
        godName: this.name,
        subAgentId
      });
    }
  }

  async receiveMessage(message) {
    this.metrics.messagesReceived++;
    
    this.emit('god:message-received', {
      godName: this.name,
      message
    });
    
    // Process message based on content
    const response = await this.processMessage(message);
    
    return response;
  }

  // Override in subclasses for custom message processing
  async processMessage(message) {
    // Default implementation
    if (message.content.type === 'task') {
      return await this.executeTask(message.content.task);
    } else if (message.content.type === 'query') {
      return await this.handleQuery(message.content.query);
    } else if (message.content.type === 'command') {
      return await this.executeCommand(message.content.command);
    }
    
    return {
      acknowledged: true,
      response: `Message received by ${this.name}`
    };
  }

  async executeTask(task) {
    this.activeTaskCount++;
    
    try {
      // Override in subclasses
      const result = await this.performTask(task);
      
      this.metrics.tasksCompleted++;
      return {
        success: true,
        result
      };
    } catch (error) {
      this.metrics.tasksFailured++;
      return {
        success: false,
        error: error.message
      };
    } finally {
      this.activeTaskCount--;
    }
  }

  // Override in subclasses
  async performTask(task) {
    return `Task completed by ${this.name}`;
  }

  async handleQuery(query) {
    // Override in subclasses
    return {
      response: `Query handled by ${this.name}`,
      data: {}
    };
  }

  async executeCommand(command) {
    // Built-in commands
    switch (command.name) {
      case 'status':
        return this.getStatus();
      case 'metrics':
        return this.getMetrics();
      case 'list-subagents':
        return this.listSubAgents();
      default:
        // Custom commands in subclasses
        return await this.handleCustomCommand(command);
    }
  }

  async handleCustomCommand(command) {
    return {
      error: `Unknown command: ${command.name}`
    };
  }

  async sendMessage(recipient, content, options = {}) {
    if (!this.messenger) {
      throw new Error('No messenger available');
    }
    
    const message = await this.messenger.send(this.name, recipient, content, options);
    this.metrics.messagesSent++;
    
    return message;
  }

  getStatus() {
    return {
      god: this.name,
      id: this.id,
      status: this.status,
      activeTaskCount: this.activeTaskCount,
      subAgentCount: this.subAgents.size,
      metrics: this.getMetrics()
    };
  }

  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.metrics.startTime,
      subAgents: {
        active: this.subAgents.size,
        created: this.metrics.subAgentsCreated,
        mdBased: this.metrics.mdAgentsCreated
      }
    };
  }

  listSubAgents() {
    const agents = [];
    
    for (const [id, agent] of this.subAgents) {
      agents.push({
        id,
        type: agent.type,
        status: agent.status,
        specialization: agent.specialization,
        isCustom: agent.specialization?.isCustom,
        heritage: agent.specialization?.heritage
      });
    }
    
    return agents;
  }

  // Memory management
  remember(key, value) {
    this.memory.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  recall(key) {
    const memory = this.memory.get(key);
    return memory ? memory.value : null;
  }

  forget(key) {
    this.memory.delete(key);
  }

  // Lifecycle
  async shutdown() {
    this.status = 'shutting-down';
    
    // Terminate all sub-agents
    for (const [id] of this.subAgents) {
      this.terminateSubAgent(id);
    }
    
    // Clean up
    this.memory.clear();
    this.removeAllListeners();
    
    this.status = 'terminated';
    this.emit('god:shutdown', { name: this.name });
  }
}

export default BaseGod;