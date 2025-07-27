import { EventEmitter } from 'events';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

/**
 * Factory for creating conversational agents with full debugging support
 */
export class ConversationalAgentFactory extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.debugLogger = options.debugLogger || new DebugLogger();
    this.agentRegistry = new Map();
    this.creationHistory = [];
    this.maxHistorySize = options.maxHistorySize || 1000;
  }

  /**
   * Create a conversational agent with comprehensive logging
   */
  async createConversationalAgent(god, purpose, config) {
    const traceId = this.generateTraceId();
    const startTime = Date.now();
    
    // Build agent specification
    const agentSpec = {
      id: `conv-${god.name}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      traceId: traceId,
      parentGod: god.name,
      purpose: purpose,
      baseAgent: config.baseAgent,
      baseAgents: config.baseAgents,
      adaptations: config.adaptations,
      createdAt: new Date().toISOString(),
      godState: await this.captureGodState(god),
      stackTrace: new Error().stack
    };
    
    try {
      // Log creation attempt
      await this.logAgentCreation(agentSpec, 'started');
      
      // Create the agent through god's createSubAgent
      const agent = await god.createSubAgent(agentSpec.id, {
        ...config,
        metadata: {
          conversationalContext: true,
          debugInfo: agentSpec,
          traceId: traceId
        }
      });
      
      // Wrap with debugging capabilities
      const debugableAgent = new DebugableConversationalAgent(agent, agentSpec, this.debugLogger);
      
      // Register agent
      this.agentRegistry.set(agentSpec.id, {
        spec: agentSpec,
        agent: debugableAgent,
        createdAt: new Date()
      });
      
      // Add to history
      this.addToHistory(agentSpec);
      
      // Log successful creation
      const duration = Date.now() - startTime;
      await this.logAgentCreation(agentSpec, 'completed', { duration });
      
      this.emit('agent:created', {
        agentId: agentSpec.id,
        purpose: purpose,
        god: god.name,
        duration: duration
      });
      
      return debugableAgent;
      
    } catch (error) {
      // Log failure with full context
      await this.logAgentCreation(agentSpec, 'failed', {
        error: error.message,
        stack: error.stack,
        duration: Date.now() - startTime
      });
      
      this.emit('agent:creation-failed', {
        agentId: agentSpec.id,
        purpose: purpose,
        god: god.name,
        error: error
      });
      
      throw error;
    }
  }

  /**
   * Generate unique trace ID for debugging
   */
  generateTraceId() {
    return `trace-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Capture god's current state for debugging
   */
  async captureGodState(god) {
    return {
      name: god.name,
      status: god.status,
      activeTaskCount: god.activeTaskCount,
      subAgentCount: god.subAgents.size,
      memoryKeys: Array.from(god.memory.keys()),
      capabilities: god.capabilities,
      orchestrationMode: god.orchestrationMode
    };
  }

  /**
   * Log agent creation details
   */
  async logAgentCreation(spec, status, additional = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      traceId: spec.traceId,
      status: status,
      agentSpec: spec,
      additional: additional,
      processInfo: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
    
    await this.debugLogger.log('agent-creation', logEntry);
  }

  /**
   * Add to creation history with size limit
   */
  addToHistory(spec) {
    this.creationHistory.push({
      timestamp: new Date(),
      spec: spec
    });
    
    // Trim history if too large
    if (this.creationHistory.length > this.maxHistorySize) {
      this.creationHistory = this.creationHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId) {
    const entry = this.agentRegistry.get(agentId);
    return entry?.agent;
  }

  /**
   * Get all agents created by a specific god
   */
  getAgentsByGod(godName) {
    const agents = [];
    
    for (const [id, entry] of this.agentRegistry.entries()) {
      if (entry.spec.parentGod === godName) {
        agents.push(entry.agent);
      }
    }
    
    return agents;
  }

  /**
   * Get creation history
   */
  getCreationHistory(options = {}) {
    let history = [...this.creationHistory];
    
    if (options.god) {
      history = history.filter(h => h.spec.parentGod === options.god);
    }
    
    if (options.since) {
      history = history.filter(h => h.timestamp > options.since);
    }
    
    if (options.limit) {
      history = history.slice(-options.limit);
    }
    
    return history;
  }

  /**
   * Get factory statistics
   */
  getStatistics() {
    const stats = {
      totalCreated: this.creationHistory.length,
      activeAgents: this.agentRegistry.size,
      byGod: {},
      byPurpose: {},
      averageCreationTime: 0
    };
    
    // Calculate statistics
    for (const entry of this.creationHistory) {
      const god = entry.spec.parentGod;
      const purpose = entry.spec.purpose;
      
      stats.byGod[god] = (stats.byGod[god] || 0) + 1;
      stats.byPurpose[purpose] = (stats.byPurpose[purpose] || 0) + 1;
    }
    
    return stats;
  }

  /**
   * Clean up inactive agents
   */
  async cleanup(maxAge = 3600000) { // 1 hour default
    const now = Date.now();
    const toRemove = [];
    
    for (const [id, entry] of this.agentRegistry.entries()) {
      const age = now - entry.createdAt.getTime();
      if (age > maxAge) {
        toRemove.push(id);
      }
    }
    
    for (const id of toRemove) {
      this.agentRegistry.delete(id);
    }
    
    this.emit('cleanup:completed', {
      removed: toRemove.length,
      remaining: this.agentRegistry.size
    });
  }
}

/**
 * Wrapper for agents with debugging capabilities
 */
export class DebugableConversationalAgent extends EventEmitter {
  constructor(agent, spec, debugLogger) {
    super();
    
    this.agent = agent;
    this.spec = spec;
    this.debugLogger = debugLogger;
    this.executionHistory = [];
    this.errorCount = 0;
  }

  /**
   * Execute with comprehensive logging
   */
  async execute(task) {
    const executionId = crypto.randomUUID();
    const startTime = Date.now();
    
    const execution = {
      id: executionId,
      agentId: this.spec.id,
      task: task,
      startTime: new Date().toISOString(),
      traceId: this.spec.traceId
    };
    
    try {
      // Log execution start
      await this.debugLogger.log('execution:start', execution);
      
      // Execute the actual task
      const result = await this.agent.execute(task);
      
      // Log successful execution
      const duration = Date.now() - startTime;
      execution.endTime = new Date().toISOString();
      execution.duration = duration;
      execution.status = 'success';
      execution.resultSummary = this.summarizeResult(result);
      
      await this.debugLogger.log('execution:success', execution);
      
      this.executionHistory.push(execution);
      
      this.emit('execution:completed', execution);
      
      return result;
      
    } catch (error) {
      // Log execution failure
      const duration = Date.now() - startTime;
      execution.endTime = new Date().toISOString();
      execution.duration = duration;
      execution.status = 'failed';
      execution.error = {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name
      };
      
      this.errorCount++;
      
      await this.debugLogger.log('execution:failed', execution);
      
      this.executionHistory.push(execution);
      
      this.emit('execution:failed', execution);
      
      throw error;
    }
  }

  /**
   * Start a conversation with logging
   */
  async startConversation(topic, session) {
    return this.execute({
      action: 'converse',
      topic: topic,
      session: session?.id,
      mode: 'conversational'
    });
  }

  /**
   * Continue an existing conversation
   */
  async continueConversation(session) {
    return this.execute({
      action: 'continue',
      session: session.id,
      context: session.getContextForGod(this.spec.parentGod)
    });
  }

  /**
   * Summarize result for logging
   */
  summarizeResult(result) {
    if (!result) return 'null';
    
    const summary = {
      type: typeof result
    };
    
    if (typeof result === 'object') {
      summary.keys = Object.keys(result).slice(0, 10);
      summary.size = JSON.stringify(result).length;
    } else if (typeof result === 'string') {
      summary.length = result.length;
      summary.preview = result.substring(0, 100);
    }
    
    return summary;
  }

  /**
   * Get agent debug info
   */
  getDebugInfo() {
    return {
      spec: this.spec,
      executionCount: this.executionHistory.length,
      errorCount: this.errorCount,
      lastExecution: this.executionHistory[this.executionHistory.length - 1],
      uptime: Date.now() - new Date(this.spec.createdAt).getTime()
    };
  }

  /**
   * Get execution history
   */
  getExecutionHistory(options = {}) {
    let history = [...this.executionHistory];
    
    if (options.status) {
      history = history.filter(h => h.status === options.status);
    }
    
    if (options.limit) {
      history = history.slice(-options.limit);
    }
    
    return history;
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    this.removeAllListeners();
    this.executionHistory = [];
    
    if (this.agent.cleanup) {
      await this.agent.cleanup();
    }
  }
}

/**
 * Debug logger for comprehensive logging
 */
export class DebugLogger extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.logPath = options.logPath || path.join(process.cwd(), '.pantheon', 'debug');
    this.maxLogSize = options.maxLogSize || 100 * 1024 * 1024; // 100MB
    this.initialized = false;
  }

  async initialize() {
    await fs.mkdir(this.logPath, { recursive: true });
    this.initialized = true;
  }

  async log(category, data) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      category,
      data
    };
    
    // Write to category-specific file
    const logFile = path.join(this.logPath, `${category}.log`);
    
    try {
      await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
      
      // Check file size and rotate if needed
      const stat = await fs.stat(logFile);
      if (stat.size > this.maxLogSize) {
        await this.rotateLog(category);
      }
      
      this.emit('log:written', { category, size: JSON.stringify(logEntry).length });
      
    } catch (error) {
      console.error(`Failed to write log for ${category}:`, error);
    }
  }

  async rotateLog(category) {
    const logFile = path.join(this.logPath, `${category}.log`);
    const rotatedFile = path.join(this.logPath, `${category}.${Date.now()}.log`);
    
    try {
      await fs.rename(logFile, rotatedFile);
      this.emit('log:rotated', { category, rotatedFile });
    } catch (error) {
      console.error(`Failed to rotate log for ${category}:`, error);
    }
  }

  async query(category, filter = {}) {
    const logFile = path.join(this.logPath, `${category}.log`);
    const results = [];
    
    try {
      const content = await fs.readFile(logFile, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          
          // Apply filters
          if (filter.since && new Date(entry.timestamp) < filter.since) continue;
          if (filter.until && new Date(entry.timestamp) > filter.until) continue;
          if (filter.traceId && entry.data.traceId !== filter.traceId) continue;
          
          results.push(entry);
          
        } catch (error) {
          // Skip malformed lines
        }
      }
      
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
    
    return results;
  }
}