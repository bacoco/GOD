import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';

/**
 * Metacognition module for self-improving gods
 * Analyzes performance, identifies patterns, and suggests improvements
 */
export class Metacognition extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.god = options.god;
    this.learningRate = options.learningRate || 0.1;
    this.memoryPath = options.memoryPath || './memory/metacognition';
    
    // Performance patterns storage
    this.patterns = {
      success: new Map(),
      failure: new Map(),
      timing: new Map(),
      resource: new Map()
    };
    
    // Improvement strategies
    this.strategies = new Map();
    
    // Learning history
    this.history = [];
    this.maxHistorySize = options.maxHistorySize || 1000;
  }

  /**
   * Analyze performance after workflow completion
   */
  async analyzePerformance(session, metrics) {
    const analysis = {
      timestamp: Date.now(),
      sessionId: session.id,
      godName: this.god.name,
      metrics: metrics,
      patterns: await this.identifyPatterns(session, metrics),
      improvements: [],
      confidence: 0
    };
    
    // Identify patterns in the session
    analysis.patterns = await this.identifyPatterns(session, metrics);
    
    // Generate improvement suggestions
    analysis.improvements = await this.generateImprovements(analysis.patterns);
    
    // Calculate confidence based on pattern frequency
    analysis.confidence = this.calculateConfidence(analysis.patterns);
    
    // Store in history
    this.addToHistory(analysis);
    
    // Emit analysis event
    this.emit('metacognition:analysis-complete', analysis);
    
    return analysis;
  }

  /**
   * Identify patterns in performance data
   */
  async identifyPatterns(session, metrics) {
    const patterns = {
      taskPatterns: [],
      failurePatterns: [],
      timingPatterns: [],
      communicationPatterns: [],
      resourcePatterns: []
    };
    
    // Analyze task success/failure patterns
    patterns.taskPatterns = this.analyzeTaskPatterns(session, metrics);
    
    // Analyze failure patterns
    if (metrics.tasksFailured > 0) {
      patterns.failurePatterns = this.analyzeFailurePatterns(session);
    }
    
    // Analyze timing patterns
    patterns.timingPatterns = this.analyzeTimingPatterns(session, metrics);
    
    // Analyze communication patterns
    patterns.communicationPatterns = this.analyzeCommunicationPatterns(session);
    
    // Analyze resource usage patterns
    patterns.resourcePatterns = this.analyzeResourcePatterns(metrics);
    
    return patterns;
  }

  /**
   * Analyze task execution patterns
   */
  analyzeTaskPatterns(session, metrics) {
    const patterns = [];
    
    // Success rate pattern
    const successRate = metrics.tasksCompleted / (metrics.tasksCompleted + metrics.tasksFailured);
    if (successRate < 0.8) {
      patterns.push({
        type: 'low-success-rate',
        value: successRate,
        severity: successRate < 0.5 ? 'high' : 'medium',
        description: `Task success rate is ${(successRate * 100).toFixed(1)}%`
      });
    }
    
    // Task complexity patterns
    const taskComplexity = this.assessTaskComplexity(session);
    if (taskComplexity.averageComplexity > 7) {
      patterns.push({
        type: 'high-complexity-tasks',
        value: taskComplexity.averageComplexity,
        severity: 'medium',
        description: 'Handling complex tasks that might benefit from decomposition'
      });
    }
    
    // Agent creation patterns
    if (metrics.subAgentsCreated > 10) {
      patterns.push({
        type: 'excessive-agent-creation',
        value: metrics.subAgentsCreated,
        severity: 'medium',
        description: `Created ${metrics.subAgentsCreated} sub-agents`
      });
    }
    
    return patterns;
  }

  /**
   * Analyze failure patterns
   */
  analyzeFailurePatterns(session) {
    const patterns = [];
    const failures = session.events?.filter(e => e.type === 'error' || e.type === 'failure') || [];
    
    // Group failures by type
    const failureTypes = {};
    failures.forEach(failure => {
      const type = failure.errorType || 'unknown';
      failureTypes[type] = (failureTypes[type] || 0) + 1;
    });
    
    // Identify recurring failures
    Object.entries(failureTypes).forEach(([type, count]) => {
      if (count > 1) {
        patterns.push({
          type: 'recurring-failure',
          failureType: type,
          count: count,
          severity: count > 3 ? 'high' : 'medium',
          description: `${type} failures occurred ${count} times`
        });
      }
    });
    
    return patterns;
  }

  /**
   * Analyze timing patterns
   */
  analyzeTimingPatterns(session, metrics) {
    const patterns = [];
    
    // Check for slow operations
    const duration = session.endTime - session.startTime;
    const avgTaskTime = duration / metrics.tasksCompleted;
    
    if (avgTaskTime > 30000) { // 30 seconds
      patterns.push({
        type: 'slow-task-execution',
        value: avgTaskTime,
        severity: 'medium',
        description: `Average task time is ${(avgTaskTime / 1000).toFixed(1)} seconds`
      });
    }
    
    // Check for timeout patterns
    const timeouts = session.events?.filter(e => e.type === 'timeout') || [];
    if (timeouts.length > 0) {
      patterns.push({
        type: 'timeout-issues',
        count: timeouts.length,
        severity: 'high',
        description: `${timeouts.length} operations timed out`
      });
    }
    
    return patterns;
  }

  /**
   * Analyze communication patterns
   */
  analyzeCommunicationPatterns(session) {
    const patterns = [];
    const handoffs = session.events?.filter(e => e.type === 'handoff') || [];
    
    // Check for excessive handoffs
    if (handoffs.length > 5) {
      patterns.push({
        type: 'excessive-handoffs',
        count: handoffs.length,
        severity: 'medium',
        description: `${handoffs.length} handoffs between gods`
      });
    }
    
    // Check for communication loops
    const communicationGraph = this.buildCommunicationGraph(session);
    const loops = this.detectCommunicationLoops(communicationGraph);
    
    if (loops.length > 0) {
      patterns.push({
        type: 'communication-loops',
        loops: loops,
        severity: 'high',
        description: 'Detected circular communication patterns'
      });
    }
    
    return patterns;
  }

  /**
   * Analyze resource usage patterns
   */
  analyzeResourcePatterns(metrics) {
    const patterns = [];
    
    // Check orchestration balance
    const totalOrchestrations = metrics.aiOrchestrations + metrics.jsOrchestrations;
    if (totalOrchestrations > 0) {
      const aiRatio = metrics.aiOrchestrations / totalOrchestrations;
      
      if (aiRatio > 0.8) {
        patterns.push({
          type: 'excessive-ai-orchestration',
          value: aiRatio,
          severity: 'medium',
          description: `${(aiRatio * 100).toFixed(1)}% AI orchestration - consider more JS orchestration for simple tasks`
        });
      }
    }
    
    return patterns;
  }

  /**
   * Generate improvement suggestions based on patterns
   */
  async generateImprovements(patterns) {
    const improvements = [];
    
    // Map patterns to improvements
    for (const category of Object.keys(patterns)) {
      for (const pattern of patterns[category]) {
        const improvement = await this.generateImprovementForPattern(pattern);
        if (improvement) {
          improvements.push(improvement);
        }
      }
    }
    
    // Prioritize improvements
    improvements.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    return improvements;
  }

  /**
   * Generate specific improvement for a pattern
   */
  async generateImprovementForPattern(pattern) {
    const improvementStrategies = {
      'low-success-rate': {
        strategy: 'enhance-error-handling',
        actions: [
          'Add retry logic for transient failures',
          'Implement circuit breakers for failing services',
          'Enhance error recovery mechanisms'
        ],
        priority: 'high'
      },
      'high-complexity-tasks': {
        strategy: 'task-decomposition',
        actions: [
          'Break complex tasks into smaller subtasks',
          'Use parallel execution for independent subtasks',
          'Implement progressive task refinement'
        ],
        priority: 'medium'
      },
      'excessive-agent-creation': {
        strategy: 'agent-pooling',
        actions: [
          'Implement agent pooling for reuse',
          'Use more JS orchestration for simple tasks',
          'Optimize agent lifecycle management'
        ],
        priority: 'medium'
      },
      'slow-task-execution': {
        strategy: 'performance-optimization',
        actions: [
          'Cache frequently accessed data',
          'Implement parallel processing where possible',
          'Optimize agent initialization'
        ],
        priority: 'high'
      },
      'excessive-handoffs': {
        strategy: 'workflow-optimization',
        actions: [
          'Consolidate related tasks to single gods',
          'Implement direct communication paths',
          'Review and optimize workflow design'
        ],
        priority: 'medium'
      },
      'communication-loops': {
        strategy: 'communication-refactoring',
        actions: [
          'Implement loop detection and breaking',
          'Redesign communication flow',
          'Add communication state tracking'
        ],
        priority: 'high'
      },
      'excessive-ai-orchestration': {
        strategy: 'orchestration-balance',
        actions: [
          'Identify deterministic tasks for JS orchestration',
          'Implement hybrid orchestration strategies',
          'Create orchestration decision matrix'
        ],
        priority: 'medium'
      }
    };
    
    const strategy = improvementStrategies[pattern.type];
    if (!strategy) return null;
    
    return {
      pattern: pattern.type,
      strategy: strategy.strategy,
      actions: strategy.actions,
      priority: strategy.priority,
      expectedImpact: this.estimateImpact(pattern, strategy),
      implementation: this.generateImplementationCode(pattern, strategy)
    };
  }

  /**
   * Estimate the impact of an improvement
   */
  estimateImpact(pattern, strategy) {
    // Simple impact estimation based on pattern severity and strategy effectiveness
    const severityScore = { high: 3, medium: 2, low: 1 }[pattern.severity] || 1;
    const strategyEffectiveness = 0.7; // Baseline effectiveness
    
    return {
      performance: severityScore * strategyEffectiveness,
      reliability: pattern.type.includes('failure') ? severityScore * 0.8 : 0,
      efficiency: pattern.type.includes('excessive') ? severityScore * 0.6 : 0,
      overall: severityScore * strategyEffectiveness
    };
  }

  /**
   * Generate implementation code for improvements
   */
  generateImplementationCode(pattern, strategy) {
    const codeTemplates = {
      'enhance-error-handling': `
// Add to god's processMessage method
async processMessageWithRetry(message, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await this.processMessage(message);
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await this.wait(Math.pow(2, attempt) * 1000); // Exponential backoff
    }
  }
}`,
      'task-decomposition': `
// Add to god's executeTask method
async executeComplexTask(task) {
  if (this.assessComplexity(task) > 7) {
    const subtasks = await this.decomposeTask(task);
    const results = await Promise.all(
      subtasks.map(st => this.executeSubtask(st))
    );
    return this.combineResults(results);
  }
  return await this.executeTask(task);
}`,
      'agent-pooling': `
// Add to god factory
const agentPool = new AgentPool({
  maxSize: 20,
  idleTimeout: 300000 // 5 minutes
});

async getOrCreateAgent(type, config) {
  return await agentPool.acquire(type, config);
}`,
      'performance-optimization': `
// Add caching layer
const cache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 60 // 1 hour
});

async getCachedOrCompute(key, computeFn) {
  if (cache.has(key)) return cache.get(key);
  const result = await computeFn();
  cache.set(key, result);
  return result;
}`
    };
    
    return codeTemplates[strategy.strategy] || '// Custom implementation required';
  }

  /**
   * Apply learned improvements
   */
  async applyImprovements(improvements) {
    const applied = [];
    
    for (const improvement of improvements) {
      try {
        // Store strategy for future use
        this.strategies.set(improvement.strategy, improvement);
        
        // Update god's configuration
        if (this.god && improvement.priority === 'high') {
          await this.updateGodBehavior(improvement);
          applied.push(improvement);
        }
        
        this.emit('metacognition:improvement-applied', improvement);
      } catch (error) {
        this.emit('metacognition:improvement-failed', { improvement, error });
      }
    }
    
    return applied;
  }

  /**
   * Update god behavior based on improvement
   */
  async updateGodBehavior(improvement) {
    // This would integrate with the god's configuration
    // For now, we store it as a recommendation
    if (!this.god.learnedStrategies) {
      this.god.learnedStrategies = new Map();
    }
    
    this.god.learnedStrategies.set(improvement.strategy, {
      ...improvement,
      appliedAt: Date.now()
    });
  }

  /**
   * Calculate confidence in patterns
   */
  calculateConfidence(patterns) {
    let totalPatterns = 0;
    let weightedConfidence = 0;
    
    for (const category of Object.values(patterns)) {
      for (const pattern of category) {
        totalPatterns++;
        // Higher severity patterns increase confidence
        const weight = { high: 3, medium: 2, low: 1 }[pattern.severity] || 1;
        weightedConfidence += weight;
      }
    }
    
    // Normalize to 0-1 range
    return totalPatterns > 0 ? Math.min(weightedConfidence / (totalPatterns * 3), 1) : 0;
  }

  /**
   * Build communication graph from session
   */
  buildCommunicationGraph(session) {
    const graph = new Map();
    const messages = session.events?.filter(e => e.type === 'message') || [];
    
    messages.forEach(msg => {
      if (!graph.has(msg.from)) {
        graph.set(msg.from, new Set());
      }
      graph.get(msg.from).add(msg.to);
    });
    
    return graph;
  }

  /**
   * Detect communication loops
   */
  detectCommunicationLoops(graph) {
    const loops = [];
    const visited = new Set();
    const recursionStack = new Set();
    
    const dfs = (node, path = []) => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);
      
      const neighbors = graph.get(node) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path]);
        } else if (recursionStack.has(neighbor)) {
          // Found a loop
          const loopStart = path.indexOf(neighbor);
          loops.push(path.slice(loopStart));
        }
      }
      
      recursionStack.delete(node);
    };
    
    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }
    
    return loops;
  }

  /**
   * Assess task complexity
   */
  assessTaskComplexity(session) {
    const tasks = session.events?.filter(e => e.type === 'task') || [];
    
    const complexities = tasks.map(task => {
      let complexity = 1;
      
      // Factors that increase complexity
      if (task.subtasks && task.subtasks.length > 0) {
        complexity += task.subtasks.length;
      }
      if (task.dependencies && task.dependencies.length > 0) {
        complexity += task.dependencies.length * 0.5;
      }
      if (task.requiredGods && task.requiredGods.length > 1) {
        complexity += task.requiredGods.length;
      }
      
      return Math.min(complexity, 10); // Cap at 10
    });
    
    return {
      averageComplexity: complexities.reduce((a, b) => a + b, 0) / complexities.length || 0,
      maxComplexity: Math.max(...complexities, 0),
      distribution: complexities
    };
  }

  /**
   * Add analysis to history
   */
  addToHistory(analysis) {
    this.history.push(analysis);
    
    // Maintain history size limit
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Save learning to persistent storage
   */
  async saveLearning() {
    const learningData = {
      patterns: Array.from(this.patterns.entries()),
      strategies: Array.from(this.strategies.entries()),
      history: this.history.slice(-100), // Save last 100 entries
      savedAt: Date.now()
    };
    
    await fs.mkdir(this.memoryPath, { recursive: true });
    await fs.writeFile(
      path.join(this.memoryPath, `${this.god.name}-learning.json`),
      JSON.stringify(learningData, null, 2)
    );
  }

  /**
   * Load learning from persistent storage
   */
  async loadLearning() {
    try {
      const filePath = path.join(this.memoryPath, `${this.god.name}-learning.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      const learningData = JSON.parse(data);
      
      // Restore patterns and strategies
      this.patterns = new Map(learningData.patterns);
      this.strategies = new Map(learningData.strategies);
      this.history = learningData.history || [];
      
      this.emit('metacognition:learning-loaded', {
        patterns: this.patterns.size,
        strategies: this.strategies.size,
        historySize: this.history.length
      });
    } catch (error) {
      // No previous learning found
      this.emit('metacognition:no-previous-learning');
    }
  }

  /**
   * Get learning summary
   */
  getLearningSummary() {
    return {
      totalAnalyses: this.history.length,
      patternsIdentified: Array.from(this.patterns.values()).flat().length,
      strategiesLearned: this.strategies.size,
      averageConfidence: this.history.reduce((sum, h) => sum + h.confidence, 0) / this.history.length || 0,
      topPatterns: this.getTopPatterns(),
      appliedStrategies: Array.from(this.strategies.values()).filter(s => s.applied)
    };
  }

  /**
   * Get most common patterns
   */
  getTopPatterns() {
    const patternCounts = {};
    
    this.history.forEach(analysis => {
      Object.values(analysis.patterns).flat().forEach(pattern => {
        patternCounts[pattern.type] = (patternCounts[pattern.type] || 0) + 1;
      });
    });
    
    return Object.entries(patternCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }
}

/**
 * Integrate metacognition into a god
 */
export function enableMetacognition(god, options = {}) {
  const metacognition = new Metacognition({ ...options, god });
  
  // Load previous learning
  metacognition.loadLearning().catch(() => {
    // Ignore errors - start fresh if needed
  });
  
  // Hook into god's lifecycle
  const originalShutdown = god.shutdown.bind(god);
  god.shutdown = async function() {
    await metacognition.saveLearning();
    return originalShutdown();
  };
  
  // Add metacognition methods to god
  god.analyzePerformance = metacognition.analyzePerformance.bind(metacognition);
  god.getLearningSummary = metacognition.getLearningSummary.bind(metacognition);
  god.metacognition = metacognition;
  
  return metacognition;
}

export default Metacognition;