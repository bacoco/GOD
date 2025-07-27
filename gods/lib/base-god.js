import { EventEmitter } from 'events';
import { getSafetyManager } from './agent-safety.js';

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
    
    // Performance tracking
    this.metrics = {
      tasksCompleted: 0,
      tasksFailured: 0,
      messagesReceived: 0,
      messagesSent: 0,
      subAgentsCreated: 0,
      aiOrchestrations: 0,
      jsOrchestrations: 0,
      startTime: Date.now()
    };
  }
  
  getDefaultAllowedGods() {
    // Default allowed gods for agent creation
    const defaults = {
      zeus: ['hephaestus', 'apollo', 'themis', 'aegis', 'daedalus', 'prometheus'],
      janus: ['all'], // Janus can create any god
      hephaestus: ['code-reviewer', 'themis'],
      apollo: ['harmonia', 'iris', 'calliope'],
      daedalus: ['hephaestus', 'apollo'],
      prometheus: ['athena', 'hermes']
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

  async createSubAgent(type, specialization = {}) {
    // Check safety limits
    const safetyCheck = this.safetyManager.canCreateAgent(this.id, this.agentCreationLimits);
    if (!safetyCheck.allowed) {
      throw new Error(`Cannot create sub-agent: ${safetyCheck.reason}`);
    }
    
    // Determine if this sub-agent should have agent creation capabilities
    const shouldIncludeTaskTool = this.shouldAllowAgentCreation(type, specialization);
    
    // Prepare tools based on orchestration mode
    const tools = [...(specialization.tools || [])];
    if (shouldIncludeTaskTool && !tools.includes('Task')) {
      tools.push('Task');
    }
    
    // Add safety limits and orchestration config
    const enhancedSpecialization = {
      ...specialization,
      tools,
      limits: this.agentCreationLimits,
      orchestrationMode: specialization.orchestrationMode || this.orchestrationMode,
      parentGod: this.name,
      allowedGods: specialization.allowedGods || this.agentCreationLimits.allowedGods
    };
    
    // Create the sub-agent
    const subAgent = await this.factory.createSubAgent(this, type, enhancedSpecialization);
    
    // Register with safety manager
    this.safetyManager.registerAgent(subAgent.id, this.id, {
      type,
      god: this.name,
      hasTaskTool: tools.includes('Task')
    });
    
    // Track internally
    this.subAgents.set(subAgent.id, subAgent);
    this.metrics.subAgentsCreated++;
    
    this.emit('god:subagent-created', {
      godName: this.name,
      subAgentId: subAgent.id,
      type,
      specialization: enhancedSpecialization,
      hasAgentCreation: shouldIncludeTaskTool
    });
    
    return subAgent;
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
      // Override in subclasses for specific task execution
      const result = await this.onExecuteTask(task);
      
      this.metrics.tasksCompleted++;
      return result;
    } catch (error) {
      this.metrics.tasksFailed++;
      throw error;
    } finally {
      this.activeTaskCount--;
    }
  }

  // Override in subclasses
  async onExecuteTask(task) {
    return {
      success: true,
      result: `Task executed by ${this.name}`,
      task
    };
  }

  async handleQuery(query) {
    // Override in subclasses
    return {
      response: `Query handled by ${this.name}`,
      query
    };
  }

  async executeCommand(command) {
    // Override in subclasses
    return {
      executed: true,
      command,
      result: `Command executed by ${this.name}`
    };
  }

  async sendMessage(to, content, options = {}) {
    this.metrics.messagesSent++;
    return await this.messenger.send(this.name, to, content, options);
  }

  async broadcastMessage(content, options = {}) {
    return await this.messenger.broadcast(this.name, content, options);
  }

  async requestFromZeus(request, options = {}) {
    return await this.messenger.requestFromZeus(this.name, request, options);
  }

  async collaborateWith(godNames, task) {
    const collaborationId = crypto.randomUUID();
    
    // Send collaboration request to specified gods
    const requests = godNames.map(godName => 
      this.sendMessage(godName, {
        type: 'collaboration',
        collaborationId,
        task,
        initiator: this.name
      }, { requiresResponse: true })
    );
    
    const responses = await Promise.allSettled(requests);
    
    return {
      collaborationId,
      participants: godNames,
      responses: responses.map((r, i) => ({
        god: godNames[i],
        status: r.status,
        response: r.status === 'fulfilled' ? r.value : r.reason
      }))
    };
  }

  // Memory management
  async remember(key, value) {
    this.memory.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  async recall(key) {
    const memory = this.memory.get(key);
    return memory ? memory.value : null;
  }

  async forget(key) {
    return this.memory.delete(key);
  }

  // Status and metrics
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      activeTaskCount: this.activeTaskCount,
      subAgentCount: this.subAgents.size,
      metrics: this.metrics,
      uptime: Date.now() - this.metrics.startTime
    };
  }

  getCapabilities() {
    return {
      name: this.name,
      role: this.config.role,
      capabilities: this.capabilities,
      responsibilities: this.responsibilities,
      tools: this.tools,
      canCreateSubAgents: true,
      canCollaborate: true
    };
  }

  getActiveAgents() {
    return Array.from(this.subAgents.values()).filter(a => a.status === 'active');
  }

  // Helper methods for subclasses
  async processSubAgentResult(subAgent, result) {
    // Override in subclasses to handle sub-agent results
    this.emit('god:subagent-result', {
      godName: this.name,
      subAgentId: subAgent.id,
      result
    });
  }

  async handleSubAgentError(subAgent, error) {
    // Override in subclasses to handle sub-agent errors
    this.emit('god:subagent-error', {
      godName: this.name,
      subAgentId: subAgent.id,
      error
    });
  }

  // Cleanup
  async dismiss() {
    this.status = 'dismissing';
    
    // Terminate all sub-agents
    for (const [id] of this.subAgents) {
      this.terminateSubAgent(id);
    }
    
    // Clear memory
    this.memory.clear();
    
    // Custom cleanup
    await this.onDismiss();
    
    this.status = 'dismissed';
    this.emit('god:dismissed', { name: this.name });
  }

  // Override in subclasses for custom cleanup
  async onDismiss() {
    // Default implementation
  }
}

export default BaseGod;