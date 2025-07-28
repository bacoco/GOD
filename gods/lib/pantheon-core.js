import { EventEmitter } from 'events';
import { GodFactory } from './god-factory.js';
import { DivineMessenger } from './divine-messenger.js';
import { getClaudeFlowBridge } from './claude-flow-bridge.js';
import { AgentSpawner } from './agent-spawner.js';
import { ContextManager } from './context-manager.js';
import { ensureClaudeFlow, getClaudeFlowPath } from './ensure-claude-flow.js';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class PantheonCore extends EventEmitter {
  constructor(claudeFlow, options = {}) {
    super();
    this.claudeFlow = claudeFlow;
    this.hooks = options.hooks;
    this.emit = options.emit || this.emit.bind(this);
    this.meta = options.meta || {};
    
    // Claude-Flow Bridge is required
    this.claudeFlowBridge = null;
    
    // Core components
    this.godFactory = new GodFactory(this);
    this.divineMessenger = new DivineMessenger(this);
    this.agentSpawner = null; // Initialize after bridge is ready
    this.contextManager = null; // Initialize after bridge is ready
    
    // State management
    this.gods = new Map();
    this.activeWorkflows = new Map();
    this.godConfigs = new Map();
    this.activeAgents = new Map(); // Track active Claude-Flow agents
    
    // Tool assignments
    this.toolAssignments = {
      zeus: ['ALL'],
      janus: ['ALL'],
      vulcan: ['ALL'], // Divine Tool Broker - needs all tools to grant access
      concilium: ['ALL'], // Divine Council Facilitator - needs all tools for coordination
      daedalus: ['github', 'context7', 'browsermcp'],
      hephaestus: ['github', 'desktop-commander', 'context7', 'claude-task-master'],
      apollo: ['desktop-commander', 'browsermcp', 'github'],
      themis: ['desktop-commander', 'github', 'browsermcp', 'claude-task-master'],
      aegis: ['desktop-commander', 'github', 'browsermcp', 'context7'],
      prometheus: ['github', 'browsermcp', 'claude-task-master', 'desktop-commander'],
      athena: ['github', 'browsermcp', 'claude-task-master'],
      hermes: ['github', 'claude-task-master', 'desktop-commander'],
      oracle: ['playwright', 'browsermcp', 'context7'],
      harmonia: ['browsermcp', 'context7', 'playwright'],
      calliope: ['i18next-parser', 'browsermcp', 'grammarly-mcp'],
      iris: ['playwright', 'browsermcp', 'framer-motion-mcp'],
      argus: ['playwright', 'browsermcp', 'context7'],
      'code-reviewer': ['desktop-commander', 'github']
    };
  }

  async initialize() {
    this.emit('pantheon:initializing');
    
    // Ensure Claude-Flow is installed
    ensureClaudeFlow();
    
    // Initialize Claude-Flow Bridge (required)
    try {
      this.claudeFlowBridge = getClaudeFlowBridge({
        claudeFlowPath: getClaudeFlowPath(),
        enableRealAgents: true,
        streamProgress: true,
        parallelExecution: true
      });
      await this.claudeFlowBridge.initialize();
      
      // Initialize agent spawner and context manager
      this.agentSpawner = new AgentSpawner(this);
      this.contextManager = new ContextManager(this);
      
      this.emit('pantheon:claude-flow-connected');
    } catch (error) {
      throw new Error(`Failed to initialize Claude-Flow: ${error.message}. Please ensure Claude-Flow is installed in ./claude-flow directory.`);
    }
    
    // Load god configurations
    await this.loadGodConfigurations();
    
    // Initialize Divine Messenger
    await this.divineMessenger.initialize();
    
    // Initialize God Factory
    await this.godFactory.initialize();
    
    this.emit('pantheon:initialized', {
      totalGods: this.godConfigs.size,
      availableGods: Array.from(this.godConfigs.keys()),
      claudeFlowEnabled: true
    });
  }

  async loadGodConfigurations() {
    // Load god configurations from the JavaScript implementations
    const godNames = [
      'zeus', 'janus', 'daedalus', 'hephaestus', 'apollo',
      'athena', 'prometheus', 'hermes', 'themis', 'aegis',
      'oracle', 'harmonia', 'calliope', 'iris', 'argus',
      'code-reviewer', 'concilium', 'vulcan'
    ];
    
    try {
      for (const godName of godNames) {
        // Store config for each god
        this.godConfigs.set(godName, {
          name: godName,
          configPath: join(__dirname, 'gods', `${godName}.js`),
          tools: this.toolAssignments[godName] || [],
          loaded: false
        });
      }
      
      this.emit('pantheon:configs-loaded', { count: this.godConfigs.size });
    } catch (error) {
      this.emit('pantheon:error', { 
        message: 'Failed to load god configurations',
        error 
      });
      throw error;
    }
  }

  async summonGod(godName, options = {}) {
    // Check if god exists
    if (!this.godConfigs.has(godName)) {
      throw new Error(`Unknown god: ${godName}`);
    }
    
    // Check if already summoned
    if (this.gods.has(godName)) {
      return this.gods.get(godName);
    }
    
    this.emit('pantheon:summoning-god', { godName, options });
    
    try {
      // Create god instance
      const god = await this.godFactory.createGod(godName, {
        ...options,
        config: this.godConfigs.get(godName),
        tools: this.toolAssignments[godName],
        messenger: this.divineMessenger,
        claudeFlow: this.claudeFlow
      });
      
      // Register with divine messenger
      this.divineMessenger.registerGod(god);
      
      // Store god instance
      this.gods.set(godName, god);
      
      // Initialize the god
      await god.initialize();
      
      this.emit('pantheon:god-summoned', { 
        godName, 
        godId: god.id,
        capabilities: god.getCapabilities() 
      });
      
      return god;
    } catch (error) {
      this.emit('pantheon:summon-failed', { godName, error });
      throw error;
    }
  }

  async orchestrate(workflow) {
    const workflowId = crypto.randomUUID();
    
    this.emit('pantheon:orchestration-starting', { workflowId, workflow });
    
    // Always summon Zeus for orchestration
    const zeus = await this.summonGod('zeus');
    
    // Zeus analyzes and delegates
    const orchestrationPlan = await zeus.analyzeAndDelegate(workflow);
    
    this.activeWorkflows.set(workflowId, {
      id: workflowId,
      workflow,
      plan: orchestrationPlan,
      status: 'executing',
      startTime: Date.now()
    });
    
    try {
      // Execute the orchestration plan
      const result = await zeus.executeOrchestration(orchestrationPlan);
      
      this.activeWorkflows.get(workflowId).status = 'completed';
      this.activeWorkflows.get(workflowId).endTime = Date.now();
      
      this.emit('pantheon:orchestration-completed', { 
        workflowId, 
        result,
        duration: Date.now() - this.activeWorkflows.get(workflowId).startTime 
      });
      
      return result;
    } catch (error) {
      this.activeWorkflows.get(workflowId).status = 'failed';
      this.activeWorkflows.get(workflowId).error = error;
      
      this.emit('pantheon:orchestration-failed', { workflowId, error });
      throw error;
    }
  }

  getDivineMessenger() {
    return this.divineMessenger;
  }

  getActiveGods() {
    return Array.from(this.gods.values()).map(god => ({
      name: god.name,
      id: god.id,
      status: god.getStatus(),
      activeAgents: god.getActiveAgents().length
    }));
  }

  getAvailableGods() {
    return Array.from(this.godConfigs.keys());
  }

  getGodStatus(godName) {
    const god = this.gods.get(godName);
    if (!god) {
      return { summoned: false, available: this.godConfigs.has(godName) };
    }
    
    return {
      summoned: true,
      ...god.getStatus()
    };
  }

  isGodAgent(type) {
    return this.godConfigs.has(type) || type.startsWith('pantheon:');
  }

  async executeWorkflow(workflowName, params) {
    const workflowPath = join(__dirname, '..', 'workflows', `${workflowName}.js`);
    
    try {
      const workflowModule = await import(workflowPath);
      const workflow = workflowModule.default || workflowModule[workflowName];
      
      if (typeof workflow !== 'function') {
        throw new Error(`Invalid workflow: ${workflowName}`);
      }
      
      return await workflow(this, params);
    } catch (error) {
      this.emit('pantheon:workflow-error', { workflowName, error });
      throw error;
    }
  }

  /**
   * Get the Claude-Flow path
   * @returns {string} Path to Claude-Flow
   */
  getClaudeFlowPath() {
    // Try to find Claude-Flow path
    if (this.claudeFlow && this.claudeFlow.__dirname) {
      return this.claudeFlow.__dirname;
    }
    return join(__dirname, '../../claude-flow');
  }

  /**
   * Create a Claude-Flow agent for a god
   * @param {string} godName - Name of the god
   * @param {Object} config - Agent configuration
   * @returns {Object} Created agent or fallback object
   */
  async createClaudeFlowAgent(godName, config) {
    if (!this.claudeFlowBridge) {
      throw new Error('Claude-Flow is required but not initialized. Please ensure Claude-Flow is installed.');
    }

    const agent = await this.claudeFlowBridge.createAgentForGod(godName, config);
    
    // Track the agent
    if (!this.activeAgents.has(godName)) {
      this.activeAgents.set(godName, new Set());
    }
    this.activeAgents.get(godName).add(agent.id);
    
    return agent;
  }


  /**
   * Execute a task using Claude-Flow if available
   * @param {string} godName - God requesting the task
   * @param {Object} task - Task configuration
   * @returns {Object} Task result
   */
  async executeClaudeFlowTask(godName, task) {
    if (!this.claudeFlowBridge) {
      throw new Error('Claude-Flow is required but not initialized. Please ensure Claude-Flow is installed.');
    }

    return await this.claudeFlowBridge.executeTask(godName, task);
  }

  /**
   * Subscribe to agent progress updates
   * @param {string} agentId - Agent to monitor
   * @param {Function} callback - Progress callback
   */
  subscribeToAgentProgress(agentId, callback) {
    if (!this.claudeFlowBridge) {
      throw new Error('Claude-Flow is required but not initialized.');
    }

    this.claudeFlowBridge.subscribeToAgentProgress(agentId, callback);
  }

  /**
   * Get all agents created by a god
   * @param {string} godName - Name of the god
   * @returns {Array} Agent IDs
   */
  getGodAgents(godName) {
    if (!this.claudeFlowBridge) {
      throw new Error('Claude-Flow is required but not initialized.');
    }
    
    return this.claudeFlowBridge.getGodAgents(godName);
  }

  /**
   * Access Claude-Flow memory
   * @param {string} key - Memory key
   * @param {*} value - Value to store (optional)
   * @returns {*} Memory value
   */
  async accessMemory(key, value = undefined) {
    if (!this.claudeFlowBridge) {
      throw new Error('Claude-Flow is required but not initialized.');
    }

    return await this.claudeFlowBridge.accessMemory(key, value);
  }

  async shutdown() {
    this.emit('pantheon:shutting-down');
    
    // Shutdown Claude-Flow Bridge
    if (this.claudeFlowBridge) {
      try {
        await this.claudeFlowBridge.shutdown();
      } catch (error) {
        console.warn('Error shutting down Claude-Flow Bridge:', error.message);
      }
    }
    
    // Dismiss all gods
    for (const [godName, god] of this.gods) {
      await god.dismiss();
      this.divineMessenger.unregisterGod(god);
    }
    
    // Clear state
    this.gods.clear();
    this.activeWorkflows.clear();
    this.activeAgents.clear();
    
    // Shutdown components
    await this.divineMessenger.shutdown();
    await this.godFactory.shutdown();
    
    this.emit('pantheon:shutdown-complete');
  }
}

export default PantheonCore;