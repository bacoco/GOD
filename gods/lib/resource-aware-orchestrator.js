import { EventEmitter } from 'events';
import { ResourceManager } from './resource-manager.js';

/**
 * ResourceAwareOrchestrator - Orchestrates tasks with budget and resource constraints
 * Makes intelligent decisions based on cost, performance, and available resources
 */
export class ResourceAwareOrchestrator extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.resourceManager = options.resourceManager || new ResourceManager();
    this.pantheon = options.pantheon;
    
    // Orchestration strategies
    this.strategies = {
      'cost-optimized': this.costOptimizedStrategy.bind(this),
      'performance-optimized': this.performanceOptimizedStrategy.bind(this),
      'balanced': this.balancedStrategy.bind(this),
      'budget-strict': this.budgetStrictStrategy.bind(this)
    };
    
    // Decision weights
    this.decisionWeights = {
      cost: options.costWeight || 0.3,
      performance: options.performanceWeight || 0.4,
      quality: options.qualityWeight || 0.3
    };
    
    // Resource allocation policies
    this.policies = new Map();
    this.initializePolicies();
    
    // Execution tracking
    this.activeExecutions = new Map();
    
    // Listen to resource events
    this.setupResourceListeners();
  }

  /**
   * Initialize resource allocation policies
   */
  initializePolicies() {
    // Default policies
    this.policies.set('default', {
      maxConcurrentTasks: 10,
      maxCostPerTask: 1.0,
      preferredModels: ['claude-3-sonnet', 'gpt-3.5-turbo'],
      fallbackOnBudgetExceed: true,
      allowDowngrade: true
    });
    
    this.policies.set('premium', {
      maxConcurrentTasks: 20,
      maxCostPerTask: 5.0,
      preferredModels: ['claude-3-opus', 'gpt-4'],
      fallbackOnBudgetExceed: false,
      allowDowngrade: false
    });
    
    this.policies.set('economy', {
      maxConcurrentTasks: 5,
      maxCostPerTask: 0.1,
      preferredModels: ['claude-3-haiku', 'gpt-3.5-turbo'],
      fallbackOnBudgetExceed: true,
      allowDowngrade: true
    });
  }

  /**
   * Setup resource manager listeners
   */
  setupResourceListeners() {
    this.resourceManager.on('budget:alert', (alert) => {
      this.handleBudgetAlert(alert);
    });
    
    this.resourceManager.on('budget:exceeded', (data) => {
      this.handleBudgetExceeded(data);
    });
    
    this.resourceManager.on('monitoring:anomalies', (data) => {
      this.handleResourceAnomalies(data);
    });
  }

  /**
   * Orchestrate with resource awareness
   */
  async orchestrateWithBudget(workflow, budget, options = {}) {
    const orchestrationId = `orch-${Date.now()}`;
    const strategy = options.strategy || 'balanced';
    const policy = this.policies.get(options.policy || 'default');
    
    // Set budget
    this.resourceManager.setBudget(orchestrationId, {
      total: budget,
      limits: {
        perTask: policy.maxCostPerTask,
        concurrent: policy.maxConcurrentTasks
      }
    });
    
    // Estimate workflow cost
    const estimate = await this.resourceManager.estimateWorkflowCost(workflow);
    
    this.emit('orchestration:estimated', {
      orchestrationId,
      estimate,
      budget,
      withinBudget: estimate.total <= budget
    });
    
    // Optimize workflow if over budget
    let optimizedWorkflow = workflow;
    if (estimate.total > budget) {
      optimizedWorkflow = await this.optimizeWorkflowForBudget(workflow, budget, policy);
      
      // Re-estimate
      const newEstimate = await this.resourceManager.estimateWorkflowCost(optimizedWorkflow);
      
      if (newEstimate.total > budget && !policy.fallbackOnBudgetExceed) {
        throw new Error(`Workflow cost (${newEstimate.total}) exceeds budget (${budget})`);
      }
    }
    
    // Execute with selected strategy
    const strategyFn = this.strategies[strategy];
    const result = await strategyFn(optimizedWorkflow, orchestrationId, policy);
    
    // Get final cost report
    const costReport = this.resourceManager.getUsageReport({ hours: 0.1 }); // Last 6 minutes
    
    this.emit('orchestration:completed', {
      orchestrationId,
      result,
      costReport,
      remainingBudget: this.resourceManager.getRemainingBudget(orchestrationId)
    });
    
    return {
      orchestrationId,
      result,
      cost: costReport.totalCost,
      estimate: estimate.total,
      accuracy: (costReport.totalCost / estimate.total)
    };
  }

  /**
   * Cost-optimized strategy - Minimize cost while meeting requirements
   */
  async costOptimizedStrategy(workflow, orchestrationId, policy) {
    const execution = {
      id: orchestrationId,
      strategy: 'cost-optimized',
      startTime: Date.now(),
      tasks: new Map()
    };
    
    this.activeExecutions.set(orchestrationId, execution);
    
    try {
      // Sort tasks by estimated cost (cheapest first)
      const taskList = await this.sortTasksByCost(workflow);
      
      // Execute tasks with cost monitoring
      const results = [];
      
      for (const task of taskList) {
        // Check remaining budget
        const remaining = this.resourceManager.getRemainingBudget(orchestrationId);
        const taskEstimate = await this.resourceManager.estimateTaskCost(
          task.node.task,
          task.node.agent
        );
        
        if (taskEstimate.total > remaining) {
          // Try to find cheaper alternative
          const alternative = await this.findCheaperAlternative(
            task,
            remaining,
            policy
          );
          
          if (alternative) {
            task.node.agent = alternative;
          } else if (!policy.fallbackOnBudgetExceed) {
            throw new Error(`Insufficient budget for task ${task.id}`);
          } else {
            // Skip non-critical tasks
            if (!task.critical) {
              this.emit('task:skipped', { taskId: task.id, reason: 'budget' });
              continue;
            }
          }
        }
        
        // Execute task
        const result = await this.executeTaskWithTracking(
          task,
          orchestrationId,
          execution
        );
        
        results.push(result);
      }
      
      execution.endTime = Date.now();
      return { success: true, results, execution };
      
    } finally {
      this.activeExecutions.delete(orchestrationId);
    }
  }

  /**
   * Performance-optimized strategy - Maximize speed within budget
   */
  async performanceOptimizedStrategy(workflow, orchestrationId, policy) {
    const execution = {
      id: orchestrationId,
      strategy: 'performance-optimized',
      startTime: Date.now(),
      tasks: new Map()
    };
    
    this.activeExecutions.set(orchestrationId, execution);
    
    try {
      // Identify parallelizable tasks
      const parallel = workflow.parallelizable || {};
      const results = [];
      
      // Execute each level with maximum parallelism within budget
      for (const [level, tasks] of Object.entries(parallel)) {
        const levelResults = await this.executeParallelWithBudget(
          tasks,
          orchestrationId,
          policy,
          execution
        );
        results.push(...levelResults);
      }
      
      execution.endTime = Date.now();
      return { success: true, results, execution };
      
    } finally {
      this.activeExecutions.delete(orchestrationId);
    }
  }

  /**
   * Balanced strategy - Balance cost, performance, and quality
   */
  async balancedStrategy(workflow, orchestrationId, policy) {
    const execution = {
      id: orchestrationId,
      strategy: 'balanced',
      startTime: Date.now(),
      tasks: new Map()
    };
    
    this.activeExecutions.set(orchestrationId, execution);
    
    try {
      const results = [];
      
      // Group tasks by priority and type
      const taskGroups = this.groupTasksForBalancedExecution(workflow);
      
      for (const group of taskGroups) {
        const groupResults = await this.executeTaskGroup(
          group,
          orchestrationId,
          policy,
          execution
        );
        results.push(...groupResults);
      }
      
      execution.endTime = Date.now();
      return { success: true, results, execution };
      
    } finally {
      this.activeExecutions.delete(orchestrationId);
    }
  }

  /**
   * Budget-strict strategy - Never exceed budget, fail if necessary
   */
  async budgetStrictStrategy(workflow, orchestrationId, policy) {
    const execution = {
      id: orchestrationId,
      strategy: 'budget-strict',
      startTime: Date.now(),
      tasks: new Map(),
      budgetChecks: []
    };
    
    this.activeExecutions.set(orchestrationId, execution);
    
    try {
      const results = [];
      const taskList = Array.from(workflow.graph.nodes.values());
      
      // Pre-calculate if budget is sufficient
      const totalEstimate = await this.estimateTotalCost(taskList);
      const budget = this.resourceManager.getRemainingBudget(orchestrationId);
      
      if (totalEstimate > budget) {
        // Prioritize and cut tasks
        const prioritized = await this.prioritizeTasksWithinBudget(
          taskList,
          budget
        );
        
        this.emit('tasks:reduced', {
          original: taskList.length,
          reduced: prioritized.length,
          cut: taskList.length - prioritized.length
        });
        
        taskList.splice(0, taskList.length, ...prioritized);
      }
      
      // Execute with strict budget enforcement
      for (const task of taskList) {
        const remaining = this.resourceManager.getRemainingBudget(orchestrationId);
        
        if (remaining <= 0) {
          throw new Error('Budget exhausted');
        }
        
        const result = await this.executeTaskWithTracking(
          task,
          orchestrationId,
          execution
        );
        
        results.push(result);
      }
      
      execution.endTime = Date.now();
      return { success: true, results, execution };
      
    } finally {
      this.activeExecutions.delete(orchestrationId);
    }
  }

  /**
   * Optimize workflow for budget constraints
   */
  async optimizeWorkflowForBudget(workflow, budget, policy) {
    this.emit('workflow:optimizing', { workflow: workflow.id, budget });
    
    // Use resource manager's optimization
    let optimized = await this.resourceManager.optimizeWorkflowForCost(
      workflow,
      budget
    );
    
    // Additional optimizations based on policy
    if (policy.allowDowngrade) {
      optimized = await this.downgradeAgentsForBudget(optimized, budget);
    }
    
    // Remove non-critical tasks if needed
    const estimate = await this.resourceManager.estimateWorkflowCost(optimized);
    if (estimate.total > budget) {
      optimized = await this.removeNonCriticalTasks(optimized, budget);
    }
    
    return optimized;
  }

  /**
   * Execute task with resource tracking
   */
  async executeTaskWithTracking(task, orchestrationId, execution) {
    const taskExecution = {
      task: task.id || task.node?.id,
      startTime: Date.now(),
      agent: task.node?.agent || task.agent
    };
    
    execution.tasks.set(taskExecution.task, taskExecution);
    
    try {
      // Track start
      const agent = taskExecution.agent;
      const agentId = `${agent.type}:${agent.name}`;
      
      // Execute task
      const result = await this.executeTask(task, agent);
      
      taskExecution.endTime = Date.now();
      taskExecution.success = true;
      taskExecution.result = result;
      
      // Track resource usage
      const usage = this.extractResourceUsage(result, taskExecution);
      
      // Track tokens
      if (usage.tokens) {
        this.resourceManager.trackUsage(agentId, 'tokens', usage.tokens, {
          workflowId: orchestrationId,
          taskId: taskExecution.task,
          model: agent.model || 'claude-3-sonnet'
        });
      }
      
      // Track compute time
      const computeHours = (taskExecution.endTime - taskExecution.startTime) / 3600000;
      this.resourceManager.trackUsage(agentId, 'compute', {
        amount: computeHours
      }, {
        workflowId: orchestrationId,
        taskId: taskExecution.task,
        type: 'cpu-hour'
      });
      
      // Track API calls
      if (usage.apiCalls) {
        this.resourceManager.trackUsage(agentId, 'api', {
          amount: usage.apiCalls
        }, {
          workflowId: orchestrationId,
          taskId: taskExecution.task
        });
      }
      
      return taskExecution;
      
    } catch (error) {
      taskExecution.endTime = Date.now();
      taskExecution.success = false;
      taskExecution.error = error;
      
      throw error;
    }
  }

  /**
   * Execute task
   */
  async executeTask(task, agent) {
    if (agent.type === 'god' && this.pantheon) {
      const god = await this.pantheon.summon(agent.name);
      return await god.executeTask(task.node?.task || task);
    }
    
    // Simulate execution for demo
    return {
      success: true,
      result: `Task executed by ${agent.name}`,
      tokens: { input: Math.random() * 1000, output: Math.random() * 500 },
      apiCalls: Math.ceil(Math.random() * 3)
    };
  }

  /**
   * Execute parallel tasks within budget
   */
  async executeParallelWithBudget(tasks, orchestrationId, policy, execution) {
    const maxConcurrent = policy.maxConcurrentTasks;
    const results = [];
    
    // Batch tasks based on budget and concurrency
    for (let i = 0; i < tasks.length; i += maxConcurrent) {
      const batch = tasks.slice(i, i + maxConcurrent);
      
      // Check if budget allows batch execution
      const batchEstimate = await this.estimateBatchCost(batch);
      const remaining = this.resourceManager.getRemainingBudget(orchestrationId);
      
      if (batchEstimate > remaining) {
        // Reduce batch size or use cheaper alternatives
        const affordableBatch = await this.createAffordableBatch(
          batch,
          remaining,
          policy
        );
        
        if (affordableBatch.length === 0) {
          break; // Can't afford any more tasks
        }
        
        batch.splice(0, batch.length, ...affordableBatch);
      }
      
      // Execute batch
      const batchPromises = batch.map(task => 
        this.executeTaskWithTracking(task, orchestrationId, execution)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            task: batch[index].id,
            success: false,
            error: result.reason
          });
        }
      });
    }
    
    return results;
  }

  /**
   * Handle budget alerts
   */
  handleBudgetAlert(alert) {
    this.emit('budget:warning', alert);
    
    const execution = this.activeExecutions.get(alert.budgetId);
    if (execution) {
      // Adjust strategy based on severity
      if (alert.severity === 'critical') {
        execution.costReductionMode = true;
        this.emit('execution:cost-reduction-enabled', {
          executionId: alert.budgetId
        });
      }
    }
  }

  /**
   * Handle budget exceeded
   */
  handleBudgetExceeded(data) {
    this.emit('budget:critical', data);
    
    const execution = this.activeExecutions.get(data.budgetId);
    if (execution) {
      execution.budgetExceeded = true;
      
      // Cancel non-critical pending tasks
      execution.tasks.forEach((task, taskId) => {
        if (!task.startTime && !task.critical) {
          task.cancelled = true;
          this.emit('task:cancelled', { taskId, reason: 'budget-exceeded' });
        }
      });
    }
  }

  /**
   * Handle resource anomalies
   */
  handleResourceAnomalies(data) {
    data.anomalies.forEach(anomaly => {
      if (anomaly.type === 'usage-spike' && anomaly.severity === 'high') {
        // Throttle execution
        this.activeExecutions.forEach(execution => {
          execution.throttled = true;
        });
        
        this.emit('execution:throttled', {
          reason: 'usage-spike',
          anomaly
        });
      }
    });
  }

  /**
   * Helper methods
   */
  
  async sortTasksByCost(workflow) {
    const taskList = [];
    
    for (const [id, node] of workflow.graph.nodes) {
      const estimate = await this.resourceManager.estimateTaskCost(
        node.task,
        node.agent
      );
      
      taskList.push({
        id,
        node,
        estimate,
        critical: node.task.critical || false
      });
    }
    
    return taskList.sort((a, b) => a.estimate.total - b.estimate.total);
  }
  
  async findCheaperAlternative(task, budget, policy) {
    if (!policy.allowDowngrade) return null;
    
    const alternatives = await this.resourceManager.findCheaperAlternatives(
      task.node.agent,
      budget
    );
    
    return alternatives[0] || null;
  }
  
  groupTasksForBalancedExecution(workflow) {
    const groups = [
      { name: 'critical', tasks: [], priority: 1 },
      { name: 'standard', tasks: [], priority: 2 },
      { name: 'optional', tasks: [], priority: 3 }
    ];
    
    workflow.graph.nodes.forEach((node, id) => {
      const task = { id, node };
      
      if (node.task.critical) {
        groups[0].tasks.push(task);
      } else if (node.task.optional) {
        groups[2].tasks.push(task);
      } else {
        groups[1].tasks.push(task);
      }
    });
    
    return groups.filter(g => g.tasks.length > 0);
  }
  
  async executeTaskGroup(group, orchestrationId, policy, execution) {
    const results = [];
    
    // Execute based on priority
    if (group.priority === 1) {
      // Critical tasks - execute all
      for (const task of group.tasks) {
        const result = await this.executeTaskWithTracking(
          task,
          orchestrationId,
          execution
        );
        results.push(result);
      }
    } else {
      // Non-critical - execute within budget
      const remaining = this.resourceManager.getRemainingBudget(orchestrationId);
      const affordable = await this.selectAffordableTasks(
        group.tasks,
        remaining
      );
      
      for (const task of affordable) {
        const result = await this.executeTaskWithTracking(
          task,
          orchestrationId,
          execution
        );
        results.push(result);
      }
    }
    
    return results;
  }
  
  async estimateTotalCost(tasks) {
    let total = 0;
    
    for (const task of tasks) {
      const estimate = await this.resourceManager.estimateTaskCost(
        task.task,
        task.agent
      );
      total += estimate.total;
    }
    
    return total;
  }
  
  async prioritizeTasksWithinBudget(tasks, budget) {
    // Score tasks by importance/cost ratio
    const scored = [];
    
    for (const task of tasks) {
      const estimate = await this.resourceManager.estimateTaskCost(
        task.task,
        task.agent
      );
      
      const importance = task.task.importance || 
                        (task.task.critical ? 10 : 5);
      
      scored.push({
        task,
        cost: estimate.total,
        score: importance / (estimate.total || 0.001)
      });
    }
    
    // Sort by score (best value first)
    scored.sort((a, b) => b.score - a.score);
    
    // Select tasks within budget
    const selected = [];
    let totalCost = 0;
    
    for (const item of scored) {
      if (totalCost + item.cost <= budget) {
        selected.push(item.task);
        totalCost += item.cost;
      }
    }
    
    return selected;
  }
  
  async downgradeAgentsForBudget(workflow, budget) {
    const optimized = { ...workflow };
    
    // Try to downgrade expensive agents
    for (const [id, node] of optimized.graph.nodes) {
      if (node.agent.model === 'claude-3-opus') {
        node.agent.model = 'claude-3-sonnet';
      } else if (node.agent.model === 'gpt-4') {
        node.agent.model = 'gpt-3.5-turbo';
      }
    }
    
    return optimized;
  }
  
  async removeNonCriticalTasks(workflow, budget) {
    const optimized = { ...workflow };
    const critical = new Map();
    const optional = new Map();
    
    // Separate critical and optional
    optimized.graph.nodes.forEach((node, id) => {
      if (node.task.critical) {
        critical.set(id, node);
      } else {
        optional.set(id, node);
      }
    });
    
    // Keep only critical tasks if over budget
    const criticalEstimate = await this.resourceManager.estimateWorkflowCost({
      graph: { nodes: critical }
    });
    
    if (criticalEstimate.total <= budget) {
      // Try to add some optional tasks
      const remaining = budget - criticalEstimate.total;
      const affordableOptional = await this.selectAffordableTasks(
        Array.from(optional.values()),
        remaining
      );
      
      affordableOptional.forEach(task => {
        critical.set(task.id, task.node);
      });
    }
    
    optimized.graph.nodes = critical;
    return optimized;
  }
  
  extractResourceUsage(result, execution) {
    // Extract resource usage from execution result
    return {
      tokens: result.tokens || {
        input: 100 + Math.random() * 900,
        output: 50 + Math.random() * 450
      },
      apiCalls: result.apiCalls || 1,
      storage: result.storage || 0
    };
  }
  
  async estimateBatchCost(batch) {
    let total = 0;
    
    for (const task of batch) {
      const estimate = await this.resourceManager.estimateTaskCost(
        task.task,
        task.agent
      );
      total += estimate.total;
    }
    
    return total;
  }
  
  async createAffordableBatch(batch, budget, policy) {
    const affordable = [];
    let totalCost = 0;
    
    // Sort by priority/cost
    const sorted = await this.sortTasksByCost({ graph: { nodes: new Map(
      batch.map(t => [t.id, { task: t.task, agent: t.agent }])
    )}});
    
    for (const task of sorted) {
      const estimate = task.estimate.total;
      
      if (totalCost + estimate <= budget) {
        affordable.push(task);
        totalCost += estimate;
      } else if (policy.allowDowngrade) {
        // Try cheaper alternative
        const alternative = await this.findCheaperAlternative(
          task,
          budget - totalCost,
          policy
        );
        
        if (alternative) {
          task.node.agent = alternative;
          affordable.push(task);
          totalCost += budget - totalCost; // Use remaining budget
        }
      }
    }
    
    return affordable;
  }
  
  async selectAffordableTasks(tasks, budget) {
    const affordable = [];
    let totalCost = 0;
    
    for (const task of tasks) {
      const estimate = await this.resourceManager.estimateTaskCost(
        task.node?.task || task.task,
        task.node?.agent || task.agent
      );
      
      if (totalCost + estimate.total <= budget) {
        affordable.push(task);
        totalCost += estimate.total;
      }
    }
    
    return affordable;
  }
  
  /**
   * Get execution report
   */
  getExecutionReport(orchestrationId) {
    const execution = this.activeExecutions.get(orchestrationId) || 
                     this.getHistoricalExecution(orchestrationId);
    
    if (!execution) return null;
    
    const report = {
      id: execution.id,
      strategy: execution.strategy,
      duration: execution.endTime - execution.startTime,
      tasks: {
        total: execution.tasks.size,
        completed: 0,
        failed: 0,
        cancelled: 0,
        skipped: 0
      },
      cost: {
        estimated: 0,
        actual: 0,
        savings: 0
      },
      performance: {
        avgTaskTime: 0,
        parallelism: 0
      }
    };
    
    // Analyze tasks
    let totalTaskTime = 0;
    execution.tasks.forEach(task => {
      if (task.success) report.tasks.completed++;
      else if (task.error) report.tasks.failed++;
      else if (task.cancelled) report.tasks.cancelled++;
      else if (task.skipped) report.tasks.skipped++;
      
      if (task.endTime && task.startTime) {
        totalTaskTime += task.endTime - task.startTime;
      }
    });
    
    report.performance.avgTaskTime = totalTaskTime / report.tasks.completed;
    
    // Get cost data
    const costReport = this.resourceManager.getUsageReport({ hours: 0.1 });
    report.cost.actual = costReport.totalCost;
    
    return report;
  }
  
  getHistoricalExecution(orchestrationId) {
    // Would retrieve from storage
    return null;
  }
}

export default ResourceAwareOrchestrator;