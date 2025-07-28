import { BaseGod } from './base-god.js';
import { enableMetacognition } from './metacognition.js';

/**
 * MetacognitiveGod - Enhanced BaseGod with self-improvement capabilities
 * Extends BaseGod with performance analysis and learning mechanisms
 */
export class MetacognitiveGod extends BaseGod {
  constructor(options = {}) {
    super(options);
    
    // Enable metacognition for this god
    this.metacognitionEnabled = options.metacognitionEnabled !== false;
    
    if (this.metacognitionEnabled) {
      enableMetacognition(this, {
        learningRate: options.learningRate || 0.1,
        memoryPath: options.memoryPath || './memory/metacognition',
        maxHistorySize: options.maxHistorySize || 1000
      });
    }
    
    // Track session performance
    this.sessionMetrics = new Map();
    
    // Learning-based optimizations
    this.optimizations = {
      taskCaching: new Map(),
      frequentPatterns: new Map(),
      successfulStrategies: new Map()
    };
  }

  /**
   * Enhanced task execution with learning
   */
  async executeTask(task) {
    const taskId = this.generateTaskId(task);
    const startTime = Date.now();
    
    try {
      // Check if we have a cached successful strategy for similar tasks
      const cachedStrategy = this.findCachedStrategy(task);
      if (cachedStrategy) {
        this.emit('god:using-cached-strategy', { task, strategy: cachedStrategy });
        return await this.executeCachedStrategy(task, cachedStrategy);
      }
      
      // Execute task normally
      const result = await super.executeTask(task);
      
      // Record success
      this.recordTaskSuccess(task, result, Date.now() - startTime);
      
      return result;
    } catch (error) {
      // Record failure for learning
      this.recordTaskFailure(task, error, Date.now() - startTime);
      
      // Try alternative strategy if available
      const alternativeStrategy = await this.findAlternativeStrategy(task, error);
      if (alternativeStrategy) {
        this.emit('god:trying-alternative-strategy', { task, error, strategy: alternativeStrategy });
        return await this.executeAlternativeStrategy(task, alternativeStrategy);
      }
      
      throw error;
    }
  }

  /**
   * Enhanced message processing with pattern recognition
   */
  async processMessage(message) {
    // Track message patterns
    this.trackMessagePattern(message);
    
    // Check if this is a known pattern we can optimize
    const optimizedHandler = this.getOptimizedHandler(message);
    if (optimizedHandler) {
      return await optimizedHandler(message);
    }
    
    return await super.processMessage(message);
  }

  /**
   * Perform self-analysis after workflow completion
   */
  async performSelfAnalysis(session) {
    if (!this.metacognitionEnabled || !this.metacognition) {
      return null;
    }
    
    // Gather session metrics
    const metrics = this.gatherSessionMetrics(session);
    
    // Perform metacognitive analysis
    const analysis = await this.analyzePerformance(session, metrics);
    
    // Apply high-priority improvements immediately
    const highPriorityImprovements = analysis.improvements.filter(i => i.priority === 'high');
    if (highPriorityImprovements.length > 0) {
      await this.applyImprovements(highPriorityImprovements);
    }
    
    // Store session metrics for future learning
    this.sessionMetrics.set(session.id, {
      metrics,
      analysis,
      timestamp: Date.now()
    });
    
    // Clean old session metrics
    this.cleanOldSessionMetrics();
    
    return analysis;
  }

  /**
   * Apply learned improvements
   */
  async applyImprovements(improvements) {
    for (const improvement of improvements) {
      try {
        switch (improvement.strategy) {
          case 'enhance-error-handling':
            this.enhanceErrorHandling(improvement);
            break;
          case 'task-decomposition':
            this.enableTaskDecomposition(improvement);
            break;
          case 'performance-optimization':
            this.optimizePerformance(improvement);
            break;
          case 'communication-refactoring':
            this.refactorCommunication(improvement);
            break;
          default:
            // Store for manual implementation
            this.storeImprovementForReview(improvement);
        }
        
        this.emit('god:improvement-applied', improvement);
      } catch (error) {
        this.emit('god:improvement-failed', { improvement, error });
      }
    }
  }

  /**
   * Enhance error handling based on learned patterns
   */
  enhanceErrorHandling(improvement) {
    const originalExecuteTask = this.executeTask.bind(this);
    
    this.executeTask = async function(task) {
      const maxRetries = 3;
      let lastError;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          return await originalExecuteTask(task);
        } catch (error) {
          lastError = error;
          
          // Check if this is a recoverable error based on learning
          if (this.isRecoverableError(error) && attempt < maxRetries - 1) {
            const backoffTime = Math.pow(2, attempt) * 1000;
            this.emit('god:retrying-task', { task, attempt, backoffTime });
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            continue;
          }
          
          throw error;
        }
      }
      
      throw lastError;
    }.bind(this);
  }

  /**
   * Enable task decomposition for complex tasks
   */
  enableTaskDecomposition(improvement) {
    const originalPerformTask = this.performTask.bind(this);
    
    this.performTask = async function(task) {
      const complexity = this.assessTaskComplexity(task);
      
      if (complexity > 7) {
        this.emit('god:decomposing-complex-task', { task, complexity });
        
        // Decompose into subtasks
        const subtasks = await this.decomposeTask(task);
        
        // Execute subtasks in parallel where possible
        const results = await this.executeSubtasks(subtasks);
        
        // Combine results
        return this.combineSubtaskResults(results, task);
      }
      
      return await originalPerformTask(task);
    }.bind(this);
  }

  /**
   * Optimize performance based on patterns
   */
  optimizePerformance(improvement) {
    // Enable caching for frequently repeated tasks
    this.enableTaskCaching();
    
    // Optimize agent creation
    if (improvement.actions.includes('Optimize agent initialization')) {
      this.optimizeAgentCreation();
    }
  }

  /**
   * Refactor communication patterns
   */
  refactorCommunication(improvement) {
    // Add communication state tracking
    this.communicationState = new Map();
    
    const originalSendMessage = this.sendMessage.bind(this);
    
    this.sendMessage = async function(recipient, content, options = {}) {
      // Check for communication loops
      if (this.detectPotentialLoop(recipient, content)) {
        this.emit('god:communication-loop-prevented', { recipient, content });
        return { prevented: true, reason: 'communication-loop' };
      }
      
      // Track communication state
      this.updateCommunicationState(recipient, content);
      
      return await originalSendMessage(recipient, content, options);
    }.bind(this);
  }

  /**
   * Find cached strategy for similar tasks
   */
  findCachedStrategy(task) {
    const taskSignature = this.generateTaskSignature(task);
    return this.optimizations.successfulStrategies.get(taskSignature);
  }

  /**
   * Execute a cached successful strategy
   */
  async executeCachedStrategy(task, strategy) {
    this.emit('god:executing-cached-strategy', { task, strategy });
    
    // Apply the strategy
    const result = await strategy.execute(task, this);
    
    // Update strategy success count
    strategy.successCount = (strategy.successCount || 0) + 1;
    
    return result;
  }

  /**
   * Find alternative strategy when primary fails
   */
  async findAlternativeStrategy(task, error) {
    // Look for similar failures in history
    const similarFailures = this.findSimilarFailures(task, error);
    
    // Find strategies that worked for similar failures
    for (const failure of similarFailures) {
      if (failure.recoveryStrategy && failure.recoveryStrategy.successful) {
        return failure.recoveryStrategy;
      }
    }
    
    return null;
  }

  /**
   * Track message patterns for optimization
   */
  trackMessagePattern(message) {
    const pattern = this.extractMessagePattern(message);
    const count = this.optimizations.frequentPatterns.get(pattern) || 0;
    this.optimizations.frequentPatterns.set(pattern, count + 1);
    
    // Create optimized handler for frequent patterns
    if (count > 10 && !this.hasOptimizedHandler(pattern)) {
      this.createOptimizedHandler(pattern);
    }
  }

  /**
   * Get optimized handler for message pattern
   */
  getOptimizedHandler(message) {
    const pattern = this.extractMessagePattern(message);
    return this.optimizations.messageHandlers?.get(pattern);
  }

  /**
   * Assess task complexity
   */
  assessTaskComplexity(task) {
    let complexity = 1;
    
    // Factors that increase complexity
    if (task.subtasks) complexity += task.subtasks.length;
    if (task.dependencies) complexity += task.dependencies.length * 0.5;
    if (task.requiredCapabilities) complexity += task.requiredCapabilities.length * 0.3;
    if (task.estimatedDuration > 60000) complexity += 2; // Long tasks
    if (task.requiresCoordination) complexity += 2;
    
    return Math.min(Math.round(complexity), 10);
  }

  /**
   * Decompose complex task into subtasks
   */
  async decomposeTask(task) {
    const subtasks = [];
    
    // Analyze task structure
    if (task.steps) {
      // Explicit steps provided
      task.steps.forEach((step, index) => {
        subtasks.push({
          id: `${task.id}-step-${index}`,
          type: 'subtask',
          content: step,
          parent: task.id,
          dependencies: index > 0 ? [`${task.id}-step-${index - 1}`] : []
        });
      });
    } else {
      // Intelligent decomposition based on task type
      const decomposition = await this.intelligentDecomposition(task);
      subtasks.push(...decomposition);
    }
    
    return subtasks;
  }

  /**
   * Execute subtasks with parallel optimization
   */
  async executeSubtasks(subtasks) {
    const results = new Map();
    const executing = new Map();
    
    // Group by dependencies
    const independentTasks = subtasks.filter(st => !st.dependencies || st.dependencies.length === 0);
    const dependentTasks = subtasks.filter(st => st.dependencies && st.dependencies.length > 0);
    
    // Execute independent tasks in parallel
    const independentResults = await Promise.all(
      independentTasks.map(st => this.executeSubtask(st))
    );
    
    independentTasks.forEach((task, index) => {
      results.set(task.id, independentResults[index]);
    });
    
    // Execute dependent tasks in order
    for (const task of dependentTasks) {
      await this.waitForDependencies(task.dependencies, results);
      const result = await this.executeSubtask(task);
      results.set(task.id, result);
    }
    
    return Array.from(results.values());
  }

  /**
   * Enable task caching for performance
   */
  enableTaskCaching() {
    if (!this.optimizations.cacheEnabled) {
      const originalPerformTask = this.performTask.bind(this);
      
      this.performTask = async function(task) {
        const cacheKey = this.generateTaskCacheKey(task);
        
        // Check cache
        if (this.optimizations.taskCaching.has(cacheKey)) {
          const cached = this.optimizations.taskCaching.get(cacheKey);
          if (Date.now() - cached.timestamp < 300000) { // 5 minute cache
            this.emit('god:using-cached-result', { task, cacheKey });
            return cached.result;
          }
        }
        
        // Execute and cache
        const result = await originalPerformTask(task);
        this.optimizations.taskCaching.set(cacheKey, {
          result,
          timestamp: Date.now()
        });
        
        // Limit cache size
        if (this.optimizations.taskCaching.size > 100) {
          const oldestKey = this.optimizations.taskCaching.keys().next().value;
          this.optimizations.taskCaching.delete(oldestKey);
        }
        
        return result;
      }.bind(this);
      
      this.optimizations.cacheEnabled = true;
    }
  }

  /**
   * Record successful task execution
   */
  recordTaskSuccess(task, result, duration) {
    const signature = this.generateTaskSignature(task);
    
    this.optimizations.successfulStrategies.set(signature, {
      task: this.sanitizeTask(task),
      execute: async (newTask, god) => {
        // Replay successful approach
        return await god.performTask(newTask);
      },
      duration,
      timestamp: Date.now()
    });
  }

  /**
   * Record task failure for learning
   */
  recordTaskFailure(task, error, duration) {
    if (!this.failureHistory) {
      this.failureHistory = [];
    }
    
    this.failureHistory.push({
      task: this.sanitizeTask(task),
      error: {
        type: error.constructor.name,
        message: error.message,
        code: error.code
      },
      duration,
      timestamp: Date.now()
    });
    
    // Keep history bounded
    if (this.failureHistory.length > 100) {
      this.failureHistory.shift();
    }
  }

  /**
   * Utility methods
   */
  
  generateTaskId(task) {
    return `${task.type || 'task'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  generateTaskSignature(task) {
    // Create a signature that identifies similar tasks
    return `${task.type || 'generic'}:${task.category || 'default'}:${task.complexity || 'normal'}`;
  }
  
  generateTaskCacheKey(task) {
    // Create cache key that includes relevant task parameters
    const key = {
      type: task.type,
      category: task.category,
      params: task.params ? Object.keys(task.params).sort().join(',') : ''
    };
    return JSON.stringify(key);
  }
  
  sanitizeTask(task) {
    // Remove sensitive or large data from task for storage
    const { data, ...sanitized } = task;
    return sanitized;
  }
  
  extractMessagePattern(message) {
    return `${message.content.type || 'unknown'}:${message.from || 'system'}`;
  }
  
  isRecoverableError(error) {
    const recoverableTypes = ['NetworkError', 'TimeoutError', 'RateLimitError'];
    return recoverableTypes.includes(error.constructor.name) || error.recoverable === true;
  }
  
  detectPotentialLoop(recipient, content) {
    const stateKey = `${this.name}->${recipient}`;
    const state = this.communicationState?.get(stateKey);
    
    if (state && state.recentMessages) {
      // Check if we're sending similar messages repeatedly
      const similar = state.recentMessages.filter(msg => 
        this.areSimilarMessages(msg, content)
      );
      
      return similar.length > 3; // More than 3 similar messages indicates a loop
    }
    
    return false;
  }
  
  areSimilarMessages(msg1, msg2) {
    // Simple similarity check - can be enhanced
    return msg1.type === msg2.type && 
           JSON.stringify(msg1.params) === JSON.stringify(msg2.params);
  }
  
  updateCommunicationState(recipient, content) {
    if (!this.communicationState) {
      this.communicationState = new Map();
    }
    
    const stateKey = `${this.name}->${recipient}`;
    const state = this.communicationState.get(stateKey) || {
      recentMessages: [],
      lastContact: null
    };
    
    state.recentMessages.push({
      type: content.type,
      params: content.params,
      timestamp: Date.now()
    });
    
    // Keep only recent messages
    if (state.recentMessages.length > 10) {
      state.recentMessages.shift();
    }
    
    state.lastContact = Date.now();
    this.communicationState.set(stateKey, state);
  }
  
  gatherSessionMetrics(session) {
    return {
      ...this.metrics,
      sessionDuration: session.endTime - session.startTime,
      sessionId: session.id,
      timestamp: Date.now()
    };
  }
  
  cleanOldSessionMetrics() {
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    const now = Date.now();
    
    for (const [sessionId, data] of this.sessionMetrics) {
      if (now - data.timestamp > maxAge) {
        this.sessionMetrics.delete(sessionId);
      }
    }
  }
  
  findSimilarFailures(task, error) {
    if (!this.failureHistory) return [];
    
    return this.failureHistory.filter(failure => 
      failure.task.type === task.type &&
      failure.error.type === error.constructor.name
    );
  }
  
  async intelligentDecomposition(task) {
    // This would use AI to decompose tasks
    // For now, return a simple decomposition
    return [
      {
        id: `${task.id}-analyze`,
        type: 'analyze',
        content: `Analyze requirements for ${task.description}`,
        parent: task.id
      },
      {
        id: `${task.id}-implement`,
        type: 'implement',
        content: `Implement ${task.description}`,
        parent: task.id,
        dependencies: [`${task.id}-analyze`]
      },
      {
        id: `${task.id}-verify`,
        type: 'verify',
        content: `Verify ${task.description}`,
        parent: task.id,
        dependencies: [`${task.id}-implement`]
      }
    ];
  }
  
  async waitForDependencies(dependencies, results) {
    for (const dep of dependencies) {
      while (!results.has(dep)) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  
  async executeSubtask(subtask) {
    return await this.executeTask(subtask);
  }
  
  combineSubtaskResults(results, originalTask) {
    return {
      task: originalTask,
      subtaskResults: results,
      combined: true,
      timestamp: Date.now()
    };
  }
  
  hasOptimizedHandler(pattern) {
    return this.optimizations.messageHandlers?.has(pattern);
  }
  
  createOptimizedHandler(pattern) {
    if (!this.optimizations.messageHandlers) {
      this.optimizations.messageHandlers = new Map();
    }
    
    // Create optimized handler based on pattern
    this.optimizations.messageHandlers.set(pattern, async (message) => {
      // Fast path for common patterns
      this.emit('god:optimized-handler', { pattern, message });
      return await this.handleOptimizedMessage(message);
    });
  }
  
  async handleOptimizedMessage(message) {
    // Simplified handling for common cases
    return {
      acknowledged: true,
      optimized: true,
      response: `Handled via optimized path`
    };
  }
  
  optimizeAgentCreation() {
    // Implement agent pooling
    if (!this.agentPool) {
      this.agentPool = new Map();
    }
    
    const originalCreateSubAgent = this.createSubAgent.bind(this);
    
    this.createSubAgent = async function(type, config = {}) {
      // Check pool first
      const poolKey = `${type}:${JSON.stringify(config.specialization || {})}`;
      
      if (this.agentPool.has(poolKey)) {
        const pooled = this.agentPool.get(poolKey);
        if (pooled.length > 0) {
          const agent = pooled.pop();
          this.emit('god:reusing-pooled-agent', { type, agent: agent.id });
          return agent;
        }
      }
      
      // Create new agent
      const agent = await originalCreateSubAgent(type, config);
      
      // Override terminate to return to pool
      const originalTerminate = agent.terminate.bind(agent);
      agent.terminate = () => {
        if (!this.agentPool.has(poolKey)) {
          this.agentPool.set(poolKey, []);
        }
        this.agentPool.get(poolKey).push(agent);
        this.emit('god:agent-returned-to-pool', { type, agent: agent.id });
      };
      
      return agent;
    }.bind(this);
  }
  
  storeImprovementForReview(improvement) {
    if (!this.pendingImprovements) {
      this.pendingImprovements = [];
    }
    
    this.pendingImprovements.push({
      ...improvement,
      storedAt: Date.now()
    });
    
    this.emit('god:improvement-pending-review', improvement);
  }
}

export default MetacognitiveGod;