import { EventEmitter } from 'events';

/**
 * ResourceManager - Tracks and manages computational resources and costs
 * Enables resource-aware orchestration decisions
 */
export class ResourceManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // Cost models for different resources
    this.costModels = {
      tokens: options.tokenCosts || {
        'claude-3-opus': { input: 0.015, output: 0.075 }, // per 1K tokens
        'claude-3-sonnet': { input: 0.003, output: 0.015 },
        'claude-3-haiku': { input: 0.00025, output: 0.00125 },
        'gpt-4': { input: 0.03, output: 0.06 },
        'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
      },
      compute: options.computeCosts || {
        'cpu-hour': 0.10,
        'gpu-hour': 0.50,
        'memory-gb-hour': 0.01
      },
      api: options.apiCosts || {
        'api-call': 0.0001,
        'webhook': 0.0002,
        'storage-gb': 0.023
      }
    };
    
    // Resource tracking
    this.usage = {
      tokens: new Map(),      // Track token usage by agent/model
      compute: new Map(),     // Track compute time
      api: new Map(),         // Track API calls
      storage: new Map()      // Track storage usage
    };
    
    // Budget management
    this.budgets = new Map();
    this.alerts = new Map();
    
    // Historical data for predictions
    this.history = [];
    this.predictions = new Map();
    
    // Real-time monitoring
    this.monitoring = {
      interval: options.monitoringInterval || 60000, // 1 minute
      enabled: options.enableMonitoring !== false
    };
    
    if (this.monitoring.enabled) {
      this.startMonitoring();
    }
  }

  /**
   * Set budget for a workflow or project
   */
  setBudget(id, budget) {
    this.budgets.set(id, {
      id,
      total: budget.total || Infinity,
      remaining: budget.total || Infinity,
      limits: budget.limits || {},
      alerts: budget.alerts || [
        { threshold: 0.8, severity: 'warning' },
        { threshold: 0.95, severity: 'critical' }
      ],
      created: Date.now()
    });
    
    this.emit('budget:set', { id, budget });
  }

  /**
   * Track resource usage
   */
  trackUsage(agentId, resourceType, usage, metadata = {}) {
    const timestamp = Date.now();
    
    // Update usage tracking
    const agentUsage = this.usage[resourceType].get(agentId) || {
      total: 0,
      sessions: new Map(),
      history: []
    };
    
    agentUsage.total += usage.amount;
    
    // Track by session if provided
    if (metadata.sessionId) {
      const sessionUsage = agentUsage.sessions.get(metadata.sessionId) || 0;
      agentUsage.sessions.set(metadata.sessionId, sessionUsage + usage.amount);
    }
    
    // Add to history
    agentUsage.history.push({
      amount: usage.amount,
      timestamp,
      metadata
    });
    
    // Keep history bounded
    if (agentUsage.history.length > 1000) {
      agentUsage.history.shift();
    }
    
    this.usage[resourceType].set(agentId, agentUsage);
    
    // Calculate cost
    const cost = this.calculateCost(resourceType, usage, metadata);
    
    // Update budgets
    if (metadata.workflowId) {
      this.updateBudget(metadata.workflowId, cost);
    }
    
    // Store in history
    this.addToHistory({
      agentId,
      resourceType,
      usage: usage.amount,
      cost,
      timestamp,
      metadata
    });
    
    this.emit('usage:tracked', {
      agentId,
      resourceType,
      usage: usage.amount,
      cost,
      metadata
    });
    
    return cost;
  }

  /**
   * Calculate cost for resource usage
   */
  calculateCost(resourceType, usage, metadata = {}) {
    let cost = 0;
    
    switch (resourceType) {
      case 'tokens':
        const model = metadata.model || 'claude-3-sonnet';
        const tokenCosts = this.costModels.tokens[model];
        if (tokenCosts) {
          const inputCost = (usage.input || 0) / 1000 * tokenCosts.input;
          const outputCost = (usage.output || 0) / 1000 * tokenCosts.output;
          cost = inputCost + outputCost;
        }
        break;
        
      case 'compute':
        const computeType = metadata.type || 'cpu-hour';
        const computeCost = this.costModels.compute[computeType] || 0;
        cost = usage.amount * computeCost;
        break;
        
      case 'api':
        const apiType = metadata.type || 'api-call';
        const apiCost = this.costModels.api[apiType] || 0;
        cost = usage.amount * apiCost;
        break;
        
      case 'storage':
        const storageCost = this.costModels.api['storage-gb'] || 0;
        cost = usage.amount * storageCost;
        break;
    }
    
    return cost;
  }

  /**
   * Update budget with cost
   */
  updateBudget(budgetId, cost) {
    const budget = this.budgets.get(budgetId);
    if (!budget) return;
    
    budget.remaining -= cost;
    
    // Check alerts
    const percentUsed = 1 - (budget.remaining / budget.total);
    
    budget.alerts.forEach(alert => {
      if (percentUsed >= alert.threshold && !this.alerts.has(`${budgetId}-${alert.threshold}`)) {
        this.alerts.set(`${budgetId}-${alert.threshold}`, true);
        
        this.emit('budget:alert', {
          budgetId,
          severity: alert.severity,
          percentUsed,
          remaining: budget.remaining,
          message: `Budget ${budgetId} has used ${(percentUsed * 100).toFixed(1)}% of allocation`
        });
      }
    });
    
    // Check if budget exceeded
    if (budget.remaining <= 0) {
      this.emit('budget:exceeded', {
        budgetId,
        overage: Math.abs(budget.remaining)
      });
    }
  }

  /**
   * Get remaining budget
   */
  getRemainingBudget(budgetId) {
    const budget = this.budgets.get(budgetId);
    return budget ? budget.remaining : Infinity;
  }

  /**
   * Estimate cost for a task
   */
  async estimateTaskCost(task, agent) {
    const estimate = {
      tokens: 0,
      compute: 0,
      api: 0,
      total: 0,
      breakdown: {}
    };
    
    // Estimate based on task complexity and historical data
    const complexity = task.complexity || 5;
    const similar = this.findSimilarTasks(task);
    
    if (similar.length > 0) {
      // Use historical data
      const avgCost = similar.reduce((sum, t) => sum + t.cost, 0) / similar.length;
      estimate.total = avgCost * (complexity / 5); // Adjust for complexity
      
      // Breakdown by resource type
      similar.forEach(t => {
        if (!estimate.breakdown[t.resourceType]) {
          estimate.breakdown[t.resourceType] = 0;
        }
        estimate.breakdown[t.resourceType] += t.cost / similar.length;
      });
    } else {
      // Use heuristics
      const model = agent.model || 'claude-3-sonnet';
      
      // Token estimation
      const estimatedTokens = complexity * 1000; // Rough estimate
      estimate.tokens = this.calculateCost('tokens', {
        input: estimatedTokens * 0.3,
        output: estimatedTokens * 0.7
      }, { model });
      
      // Compute estimation
      const estimatedTime = complexity * 0.01; // Hours
      estimate.compute = this.calculateCost('compute', {
        amount: estimatedTime
      }, { type: 'cpu-hour' });
      
      // API calls
      estimate.api = this.calculateCost('api', {
        amount: complexity * 2 // Rough estimate
      });
      
      estimate.total = estimate.tokens + estimate.compute + estimate.api;
    }
    
    return estimate;
  }

  /**
   * Estimate workflow cost
   */
  async estimateWorkflowCost(workflow) {
    const estimate = {
      tasks: [],
      total: 0,
      byAgent: {},
      byResource: {},
      confidence: 0
    };
    
    // Estimate each task
    for (const [nodeId, node] of workflow.graph.nodes) {
      const taskEstimate = await this.estimateTaskCost(node.task, node.agent);
      
      estimate.tasks.push({
        taskId: nodeId,
        task: node.task,
        agent: node.agent,
        estimate: taskEstimate
      });
      
      estimate.total += taskEstimate.total;
      
      // Group by agent
      const agentKey = `${node.agent.type}:${node.agent.name}`;
      estimate.byAgent[agentKey] = (estimate.byAgent[agentKey] || 0) + taskEstimate.total;
      
      // Group by resource
      Object.entries(taskEstimate.breakdown).forEach(([resource, cost]) => {
        estimate.byResource[resource] = (estimate.byResource[resource] || 0) + cost;
      });
    }
    
    // Calculate confidence based on historical data availability
    const historicalTasks = estimate.tasks.filter(t => 
      this.findSimilarTasks(t.task).length > 0
    );
    estimate.confidence = historicalTasks.length / estimate.tasks.length;
    
    return estimate;
  }

  /**
   * Select optimal agent considering cost
   */
  async selectOptimalAgentWithBudget(task, candidates, budget) {
    const evaluations = [];
    
    for (const candidate of candidates) {
      const costEstimate = await this.estimateTaskCost(task, candidate);
      
      // Skip if over budget
      if (costEstimate.total > budget) {
        continue;
      }
      
      // Calculate value score (capability/cost)
      const valueScore = candidate.score / (costEstimate.total || 0.001);
      
      evaluations.push({
        agent: candidate,
        cost: costEstimate.total,
        valueScore,
        withinBudget: true
      });
    }
    
    // Sort by value score
    evaluations.sort((a, b) => b.valueScore - a.valueScore);
    
    // Return best value within budget
    return evaluations[0]?.agent || null;
  }

  /**
   * Optimize workflow for cost
   */
  async optimizeWorkflowForCost(workflow, targetBudget) {
    const currentEstimate = await this.estimateWorkflowCost(workflow);
    
    if (currentEstimate.total <= targetBudget) {
      return workflow; // Already within budget
    }
    
    const optimized = { ...workflow };
    const costReduction = currentEstimate.total - targetBudget;
    const reductionRatio = targetBudget / currentEstimate.total;
    
    // Strategy 1: Replace expensive agents with cheaper alternatives
    for (const [nodeId, node] of optimized.graph.nodes) {
      const currentCost = currentEstimate.tasks.find(t => t.taskId === nodeId).estimate.total;
      const targetCost = currentCost * reductionRatio;
      
      // Find cheaper alternative
      const alternatives = await this.findCheaperAlternatives(node.agent, targetCost);
      
      if (alternatives.length > 0) {
        node.agent = alternatives[0];
        
        this.emit('optimization:agent-replaced', {
          nodeId,
          original: node.agent,
          replacement: alternatives[0],
          costSaving: currentCost - targetCost
        });
      }
    }
    
    // Strategy 2: Reduce parallelism to save on concurrent resource usage
    if (workflow.parallelizable) {
      Object.entries(workflow.parallelizable).forEach(([level, tasks]) => {
        if (tasks.length > 3) {
          // Limit parallelism
          const sequential = tasks.slice(3);
          optimized.parallelizable[level] = tasks.slice(0, 3);
          optimized.parallelizable[`${level}-sequential`] = sequential;
        }
      });
    }
    
    // Strategy 3: Simplify complex tasks
    for (const [nodeId, node] of optimized.graph.nodes) {
      if (node.task.complexity > 7) {
        node.task.simplified = true;
        node.task.complexity = Math.min(node.task.complexity * 0.7, 7);
      }
    }
    
    return optimized;
  }

  /**
   * Monitor resource usage in real-time
   */
  startMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.performMonitoringCheck();
    }, this.monitoring.interval);
  }

  /**
   * Perform monitoring check
   */
  performMonitoringCheck() {
    const metrics = this.getMetrics();
    
    // Check for anomalies
    const anomalies = this.detectAnomalies(metrics);
    
    if (anomalies.length > 0) {
      this.emit('monitoring:anomalies', { anomalies, metrics });
    }
    
    // Update predictions
    this.updatePredictions(metrics);
    
    this.emit('monitoring:update', metrics);
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    const now = Date.now();
    const windowStart = now - this.monitoring.interval;
    
    const metrics = {
      timestamp: now,
      window: this.monitoring.interval,
      usage: {},
      costs: {},
      trends: {}
    };
    
    // Calculate usage in window
    ['tokens', 'compute', 'api', 'storage'].forEach(resourceType => {
      let windowUsage = 0;
      let windowCost = 0;
      
      this.usage[resourceType].forEach((agentUsage) => {
        const recentUsage = agentUsage.history.filter(h => h.timestamp >= windowStart);
        windowUsage += recentUsage.reduce((sum, h) => sum + h.amount, 0);
        windowCost += recentUsage.reduce((sum, h) => sum + (h.cost || 0), 0);
      });
      
      metrics.usage[resourceType] = windowUsage;
      metrics.costs[resourceType] = windowCost;
      
      // Calculate trend
      const previousWindow = this.getPreviousWindowMetrics(resourceType, windowStart);
      metrics.trends[resourceType] = previousWindow > 0 ? 
        (windowUsage - previousWindow) / previousWindow : 0;
    });
    
    metrics.totalCost = Object.values(metrics.costs).reduce((sum, cost) => sum + cost, 0);
    
    return metrics;
  }

  /**
   * Detect anomalies in resource usage
   */
  detectAnomalies(metrics) {
    const anomalies = [];
    
    // Check for unusual spikes
    Object.entries(metrics.trends).forEach(([resource, trend]) => {
      if (Math.abs(trend) > 0.5) { // 50% change
        anomalies.push({
          type: 'usage-spike',
          resource,
          trend,
          severity: Math.abs(trend) > 1 ? 'high' : 'medium'
        });
      }
    });
    
    // Check for budget overruns
    this.budgets.forEach((budget, budgetId) => {
      if (budget.remaining < budget.total * 0.1) { // Less than 10% remaining
        anomalies.push({
          type: 'budget-critical',
          budgetId,
          remaining: budget.remaining,
          severity: 'high'
        });
      }
    });
    
    return anomalies;
  }

  /**
   * Update predictions based on current trends
   */
  updatePredictions(metrics) {
    // Simple linear prediction
    const hourlyRate = (metrics.totalCost / metrics.window) * 3600000; // Convert to hourly
    
    this.predictions.set('hourly-cost', hourlyRate);
    this.predictions.set('daily-cost', hourlyRate * 24);
    this.predictions.set('monthly-cost', hourlyRate * 24 * 30);
    
    // Predict budget exhaustion
    this.budgets.forEach((budget, budgetId) => {
      if (hourlyRate > 0) {
        const hoursRemaining = budget.remaining / hourlyRate;
        this.predictions.set(`budget-${budgetId}-exhaustion`, {
          hours: hoursRemaining,
          timestamp: Date.now() + (hoursRemaining * 3600000)
        });
      }
    });
  }

  /**
   * Get resource usage report
   */
  getUsageReport(timeRange = { hours: 24 }) {
    const cutoff = Date.now() - (timeRange.hours * 3600000);
    const report = {
      timeRange,
      byAgent: {},
      byResource: {},
      totalCost: 0,
      topConsumers: []
    };
    
    // Aggregate by agent
    this.history
      .filter(h => h.timestamp >= cutoff)
      .forEach(entry => {
        const agentKey = entry.agentId;
        if (!report.byAgent[agentKey]) {
          report.byAgent[agentKey] = {
            usage: {},
            cost: 0
          };
        }
        
        if (!report.byAgent[agentKey].usage[entry.resourceType]) {
          report.byAgent[agentKey].usage[entry.resourceType] = 0;
        }
        
        report.byAgent[agentKey].usage[entry.resourceType] += entry.usage;
        report.byAgent[agentKey].cost += entry.cost;
        
        // Aggregate by resource
        if (!report.byResource[entry.resourceType]) {
          report.byResource[entry.resourceType] = {
            usage: 0,
            cost: 0
          };
        }
        
        report.byResource[entry.resourceType].usage += entry.usage;
        report.byResource[entry.resourceType].cost += entry.cost;
        
        report.totalCost += entry.cost;
      });
    
    // Find top consumers
    report.topConsumers = Object.entries(report.byAgent)
      .map(([agent, data]) => ({ agent, cost: data.cost }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);
    
    return report;
  }

  /**
   * Helper methods
   */
  
  addToHistory(entry) {
    this.history.push(entry);
    
    // Keep history bounded (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.history = this.history.filter(h => h.timestamp >= thirtyDaysAgo);
  }
  
  findSimilarTasks(task) {
    // Find historical tasks with similar characteristics
    return this.history.filter(h => {
      const metadata = h.metadata || {};
      return (
        metadata.taskType === task.type ||
        metadata.taskComplexity === task.complexity ||
        (metadata.taskDescription && 
         metadata.taskDescription.includes(task.type || task.description))
      );
    });
  }
  
  async findCheaperAlternatives(currentAgent, targetCost) {
    // In practice, would query available agents and their cost profiles
    const alternatives = [];
    
    // Example: suggest cheaper models
    if (currentAgent.model === 'claude-3-opus') {
      alternatives.push({
        ...currentAgent,
        model: 'claude-3-sonnet',
        costReduction: 0.8
      });
    }
    
    if (currentAgent.model === 'gpt-4') {
      alternatives.push({
        ...currentAgent,
        model: 'gpt-3.5-turbo',
        costReduction: 0.95
      });
    }
    
    return alternatives;
  }
  
  getPreviousWindowMetrics(resourceType, windowStart) {
    const previousWindowStart = windowStart - this.monitoring.interval;
    let usage = 0;
    
    this.usage[resourceType].forEach((agentUsage) => {
      const previousUsage = agentUsage.history.filter(h => 
        h.timestamp >= previousWindowStart && h.timestamp < windowStart
      );
      usage += previousUsage.reduce((sum, h) => sum + h.amount, 0);
    });
    
    return usage;
  }
  
  /**
   * Export cost data for analysis
   */
  exportCostData() {
    return {
      models: this.costModels,
      usage: Object.fromEntries(
        Object.entries(this.usage).map(([type, data]) => [
          type,
          Array.from(data.entries()).map(([agent, usage]) => ({
            agent,
            total: usage.total,
            sessions: Array.from(usage.sessions.entries())
          }))
        ])
      ),
      budgets: Array.from(this.budgets.values()),
      history: this.history.slice(-1000), // Last 1000 entries
      predictions: Object.fromEntries(this.predictions)
    };
  }
  
  /**
   * Import cost data
   */
  importCostData(data) {
    if (data.models) {
      this.costModels = { ...this.costModels, ...data.models };
    }
    
    if (data.history) {
      this.history.push(...data.history);
    }
    
    this.emit('data:imported', { 
      models: !!data.models,
      history: data.history?.length || 0
    });
  }
  
  /**
   * Cleanup
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
  
  destroy() {
    this.stopMonitoring();
    this.removeAllListeners();
  }
}

export default ResourceManager;