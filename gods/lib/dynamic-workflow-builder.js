import { EventEmitter } from 'events';
import { AgentMDLoader } from './agent-md-loader.js';

/**
 * DynamicWorkflowBuilder - Constructs workflows dynamically based on requirements
 * Enables true emergent behavior by analyzing tasks and creating execution graphs
 */
export class DynamicWorkflowBuilder extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.pantheon = options.pantheon;
    this.mdLoader = options.mdLoader || new AgentMDLoader();
    
    // Workflow patterns library
    this.patterns = new Map();
    this.initializePatterns();
    
    // Task decomposition strategies
    this.decompositionStrategies = new Map();
    this.initializeDecompositionStrategies();
    
    // Execution optimization
    this.optimizationRules = new Map();
    this.initializeOptimizationRules();
  }

  /**
   * Initialize common workflow patterns
   */
  initializePatterns() {
    // Sequential pattern
    this.patterns.set('sequential', {
      name: 'Sequential Execution',
      applicable: (tasks) => tasks.every(t => t.dependencies?.length <= 1),
      build: (tasks) => this.buildSequentialWorkflow(tasks)
    });
    
    // Parallel pattern
    this.patterns.set('parallel', {
      name: 'Parallel Execution',
      applicable: (tasks) => tasks.every(t => !t.dependencies || t.dependencies.length === 0),
      build: (tasks) => this.buildParallelWorkflow(tasks)
    });
    
    // Pipeline pattern
    this.patterns.set('pipeline', {
      name: 'Pipeline Processing',
      applicable: (tasks) => this.isPipelinePattern(tasks),
      build: (tasks) => this.buildPipelineWorkflow(tasks)
    });
    
    // Fork-join pattern
    this.patterns.set('fork-join', {
      name: 'Fork-Join Parallelism',
      applicable: (tasks) => this.isForkJoinPattern(tasks),
      build: (tasks) => this.buildForkJoinWorkflow(tasks)
    });
    
    // Hierarchical pattern
    this.patterns.set('hierarchical', {
      name: 'Hierarchical Coordination',
      applicable: (tasks) => this.isHierarchicalPattern(tasks),
      build: (tasks) => this.buildHierarchicalWorkflow(tasks)
    });
  }

  /**
   * Initialize task decomposition strategies
   */
  initializeDecompositionStrategies() {
    // Domain-based decomposition
    this.decompositionStrategies.set('domain', {
      name: 'Domain-based Decomposition',
      decompose: async (requirement) => this.decomposeDomainBased(requirement)
    });
    
    // Phase-based decomposition
    this.decompositionStrategies.set('phase', {
      name: 'Phase-based Decomposition',
      decompose: async (requirement) => this.decomposePhasesBased(requirement)
    });
    
    // Capability-based decomposition
    this.decompositionStrategies.set('capability', {
      name: 'Capability-based Decomposition',
      decompose: async (requirement) => this.decomposeCapabilityBased(requirement)
    });
    
    // Goal-oriented decomposition
    this.decompositionStrategies.set('goal', {
      name: 'Goal-oriented Decomposition',
      decompose: async (requirement) => this.decomposeGoalOriented(requirement)
    });
  }

  /**
   * Initialize optimization rules
   */
  initializeOptimizationRules() {
    // Minimize handoffs
    this.optimizationRules.set('minimize-handoffs', {
      name: 'Minimize Agent Handoffs',
      optimize: (graph) => this.minimizeHandoffs(graph)
    });
    
    // Maximize parallelism
    this.optimizationRules.set('maximize-parallel', {
      name: 'Maximize Parallel Execution',
      optimize: (graph) => this.maximizeParallelism(graph)
    });
    
    // Balance workload
    this.optimizationRules.set('balance-workload', {
      name: 'Balance Agent Workload',
      optimize: (graph) => this.balanceWorkload(graph)
    });
    
    // Optimize for speed
    this.optimizationRules.set('optimize-speed', {
      name: 'Optimize for Execution Speed',
      optimize: (graph) => this.optimizeForSpeed(graph)
    });
  }

  /**
   * Build a dynamic workflow from requirements
   */
  async buildWorkflow(requirements, context = {}) {
    const startTime = Date.now();
    
    try {
      this.emit('workflow:building', { requirements, context });
      
      // Step 1: Decompose requirements into tasks
      const tasks = await this.decomposeTasks(requirements, context);
      
      // Step 2: Analyze task dependencies
      const dependencies = this.analyzeDependencies(tasks);
      
      // Step 3: Select optimal agents for each task
      const agents = await this.selectOptimalAgents(tasks, context);
      
      // Step 4: Build execution graph
      const graph = this.buildExecutionGraph(tasks, dependencies, agents);
      
      // Step 5: Optimize the graph
      const optimizedGraph = await this.optimizeGraph(graph, context);
      
      // Step 6: Identify parallelizable sections
      const parallelizable = this.identifyParallelTasks(optimizedGraph);
      
      // Step 7: Generate workflow metadata
      const workflow = {
        id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: requirements.name || 'Dynamic Workflow',
        description: requirements.description,
        graph: optimizedGraph,
        agents: agents,
        parallelizable: parallelizable,
        estimatedDuration: this.estimateDuration(optimizedGraph),
        confidence: this.calculateConfidence(tasks, agents),
        metadata: {
          created: new Date(),
          buildTime: Date.now() - startTime,
          taskCount: tasks.length,
          agentCount: new Set(Object.values(agents)).size,
          maxParallelism: Math.max(...Object.values(parallelizable).map(p => p.length))
        }
      };
      
      this.emit('workflow:built', workflow);
      return workflow;
      
    } catch (error) {
      this.emit('workflow:build-failed', { requirements, error });
      throw error;
    }
  }

  /**
   * Decompose requirements into executable tasks
   */
  async decomposeTasks(requirements, context) {
    // Determine best decomposition strategy
    const strategy = this.selectDecompositionStrategy(requirements, context);
    
    // Apply the strategy
    const tasks = await strategy.decompose(requirements);
    
    // Enhance tasks with metadata
    return tasks.map((task, index) => ({
      id: `task-${index}`,
      ...task,
      complexity: this.assessTaskComplexity(task),
      requiredCapabilities: this.identifyRequiredCapabilities(task),
      estimatedDuration: this.estimateTaskDuration(task)
    }));
  }

  /**
   * Select decomposition strategy based on requirements
   */
  selectDecompositionStrategy(requirements, context) {
    // Analyze requirement characteristics
    if (requirements.domains && requirements.domains.length > 1) {
      return this.decompositionStrategies.get('domain');
    }
    
    if (requirements.phases || requirements.workflow === 'phased') {
      return this.decompositionStrategies.get('phase');
    }
    
    if (requirements.goals && requirements.goals.length > 0) {
      return this.decompositionStrategies.get('goal');
    }
    
    // Default to capability-based
    return this.decompositionStrategies.get('capability');
  }

  /**
   * Domain-based task decomposition
   */
  async decomposeDomainBased(requirements) {
    const tasks = [];
    const domains = requirements.domains || this.identifyDomains(requirements);
    
    for (const domain of domains) {
      const domainTasks = this.createDomainTasks(domain, requirements);
      tasks.push(...domainTasks);
    }
    
    return tasks;
  }

  /**
   * Phase-based task decomposition
   */
  async decomposePhasesBased(requirements) {
    const phases = requirements.phases || [
      'analysis',
      'design',
      'implementation',
      'testing',
      'deployment'
    ];
    
    const tasks = [];
    
    phases.forEach((phase, index) => {
      const phaseTasks = this.createPhaseTasks(phase, requirements);
      
      // Add dependencies between phases
      if (index > 0) {
        phaseTasks.forEach(task => {
          task.dependencies = tasks
            .filter(t => t.phase === phases[index - 1])
            .map(t => t.id);
        });
      }
      
      tasks.push(...phaseTasks);
    });
    
    return tasks;
  }

  /**
   * Capability-based task decomposition
   */
  async decomposeCapabilityBased(requirements) {
    // Analyze required capabilities
    const capabilities = await this.analyzeRequiredCapabilities(requirements);
    
    const tasks = [];
    
    for (const capability of capabilities) {
      const capabilityTasks = this.createCapabilityTasks(capability, requirements);
      tasks.push(...capabilityTasks);
    }
    
    // Add coordination tasks if multiple capabilities
    if (capabilities.length > 2) {
      tasks.push(this.createCoordinationTask(capabilities));
    }
    
    return tasks;
  }

  /**
   * Goal-oriented task decomposition
   */
  async decomposeGoalOriented(requirements) {
    const goals = requirements.goals || [requirements.description];
    const tasks = [];
    
    for (const goal of goals) {
      // Break down goal into sub-goals
      const subgoals = await this.decomposeGoal(goal);
      
      // Create tasks for each subgoal
      for (const subgoal of subgoals) {
        tasks.push({
          type: 'achieve-goal',
          goal: subgoal,
          description: `Achieve: ${subgoal}`,
          dependencies: this.identifyGoalDependencies(subgoal, subgoals)
        });
      }
    }
    
    return tasks;
  }

  /**
   * Analyze dependencies between tasks
   */
  analyzeDependencies(tasks) {
    const dependencies = new Map();
    
    tasks.forEach(task => {
      dependencies.set(task.id, {
        explicit: task.dependencies || [],
        implicit: this.inferImplicitDependencies(task, tasks),
        optional: task.optionalDependencies || []
      });
    });
    
    // Detect and resolve circular dependencies
    this.resolveCircularDependencies(dependencies);
    
    return dependencies;
  }

  /**
   * Select optimal agents for tasks
   */
  async selectOptimalAgents(tasks, context) {
    const agentAssignments = {};
    
    // Initialize MD loader if needed
    if (!this.mdLoader.initialized) {
      await this.mdLoader.initialize();
    }
    
    for (const task of tasks) {
      // Find capable agents
      const candidates = await this.findCapableAgents(task);
      
      // Select optimal agent considering context
      const optimal = this.selectOptimalAgent(candidates, task, context, agentAssignments);
      
      agentAssignments[task.id] = optimal;
    }
    
    return agentAssignments;
  }

  /**
   * Find agents capable of handling a task
   */
  async findCapableAgents(task) {
    const candidates = [];
    
    // Check gods first
    const gods = ['zeus', 'hephaestus', 'apollo', 'themis', 'daedalus', 'prometheus', 'athena'];
    
    for (const god of gods) {
      const score = this.scoreGodForTask(god, task);
      if (score > 0) {
        candidates.push({ type: 'god', name: god, score });
      }
    }
    
    // Check Claude-Flow agents
    const recommendations = await this.mdLoader.recommendAgentsForTask(task.description);
    
    recommendations.forEach(rec => {
      candidates.push({
        type: 'claude-flow',
        name: rec.agent.name,
        score: rec.score * 0.8, // Slight preference for gods
        agent: rec.agent
      });
    });
    
    return candidates.sort((a, b) => b.score - a.score);
  }

  /**
   * Score a god's suitability for a task
   */
  scoreGodForTask(god, task) {
    const godCapabilities = {
      zeus: ['orchestrate', 'coordinate', 'analyze', 'delegate'],
      hephaestus: ['implement', 'code', 'build', 'develop'],
      apollo: ['design', 'ui', 'ux', 'interface'],
      themis: ['test', 'validate', 'verify', 'qa'],
      daedalus: ['architect', 'design', 'structure', 'pattern'],
      prometheus: ['plan', 'strategize', 'requirements', 'product'],
      athena: ['analyze', 'decide', 'prioritize', 'manage']
    };
    
    const capabilities = godCapabilities[god] || [];
    let score = 0;
    
    // Check capability match
    capabilities.forEach(cap => {
      if (task.description.toLowerCase().includes(cap) ||
          task.requiredCapabilities?.includes(cap)) {
        score += 3;
      }
    });
    
    // Check type match
    if (task.type && capabilities.includes(task.type)) {
      score += 5;
    }
    
    return score;
  }

  /**
   * Select optimal agent considering workload balance
   */
  selectOptimalAgent(candidates, task, context, currentAssignments) {
    if (candidates.length === 0) {
      // Fallback to Zeus for orchestration
      return { type: 'god', name: 'zeus' };
    }
    
    // Calculate current workload for each agent
    const workload = {};
    Object.values(currentAssignments).forEach(assignment => {
      const key = `${assignment.type}:${assignment.name}`;
      workload[key] = (workload[key] || 0) + 1;
    });
    
    // Select best candidate considering score and workload
    let bestCandidate = candidates[0];
    let bestScore = candidates[0].score;
    
    candidates.forEach(candidate => {
      const key = `${candidate.type}:${candidate.name}`;
      const currentWorkload = workload[key] || 0;
      
      // Penalize based on workload
      const adjustedScore = candidate.score * (1 - currentWorkload * 0.1);
      
      if (adjustedScore > bestScore) {
        bestScore = adjustedScore;
        bestCandidate = candidate;
      }
    });
    
    return bestCandidate;
  }

  /**
   * Build execution graph from tasks and dependencies
   */
  buildExecutionGraph(tasks, dependencies, agents) {
    const nodes = new Map();
    const edges = [];
    
    // Create nodes
    tasks.forEach(task => {
      nodes.set(task.id, {
        id: task.id,
        task: task,
        agent: agents[task.id],
        status: 'pending',
        metadata: {
          complexity: task.complexity,
          estimatedDuration: task.estimatedDuration,
          requiredCapabilities: task.requiredCapabilities
        }
      });
    });
    
    // Create edges from dependencies
    dependencies.forEach((deps, taskId) => {
      deps.explicit.forEach(depId => {
        edges.push({
          from: depId,
          to: taskId,
          type: 'dependency',
          required: true
        });
      });
      
      deps.implicit.forEach(depId => {
        edges.push({
          from: depId,
          to: taskId,
          type: 'implicit',
          required: false
        });
      });
    });
    
    return {
      nodes,
      edges,
      entryPoints: this.findEntryPoints(nodes, edges),
      exitPoints: this.findExitPoints(nodes, edges)
    };
  }

  /**
   * Optimize the execution graph
   */
  async optimizeGraph(graph, context) {
    let optimizedGraph = { ...graph };
    
    // Apply optimization rules based on context
    const rules = context.optimizationGoals || ['minimize-handoffs', 'maximize-parallel'];
    
    for (const ruleName of rules) {
      const rule = this.optimizationRules.get(ruleName);
      if (rule) {
        optimizedGraph = rule.optimize(optimizedGraph);
      }
    }
    
    // Validate optimized graph
    this.validateGraph(optimizedGraph);
    
    return optimizedGraph;
  }

  /**
   * Minimize handoffs between agents
   */
  minimizeHandoffs(graph) {
    // Group consecutive tasks by agent
    const optimized = { ...graph };
    const { nodes, edges } = optimized;
    
    // Find task chains
    const chains = this.findTaskChains(nodes, edges);
    
    chains.forEach(chain => {
      // Check if tasks can be reassigned to minimize handoffs
      const agentCounts = {};
      chain.forEach(nodeId => {
        const agent = nodes.get(nodeId).agent;
        const key = `${agent.type}:${agent.name}`;
        agentCounts[key] = (agentCounts[key] || 0) + 1;
      });
      
      // If one agent can handle most tasks, reassign all to that agent
      const dominantAgent = Object.entries(agentCounts)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (dominantAgent && dominantAgent[1] > chain.length * 0.6) {
        const [type, name] = dominantAgent[0].split(':');
        chain.forEach(nodeId => {
          const node = nodes.get(nodeId);
          if (this.canAgentHandleTask(
            { type, name }, 
            node.task
          )) {
            node.agent = { type, name };
          }
        });
      }
    });
    
    return optimized;
  }

  /**
   * Maximize parallel execution opportunities
   */
  maximizeParallelism(graph) {
    const optimized = { ...graph };
    const { nodes, edges } = optimized;
    
    // Remove unnecessary dependencies that limit parallelism
    const edgesToRemove = [];
    
    edges.forEach((edge, index) => {
      if (edge.type === 'implicit' && !edge.required) {
        // Check if removing this edge would increase parallelism
        const parallelismBefore = this.calculateParallelism(nodes, edges);
        const edgesWithout = edges.filter((e, i) => i !== index);
        const parallelismAfter = this.calculateParallelism(nodes, edgesWithout);
        
        if (parallelismAfter > parallelismBefore) {
          edgesToRemove.push(index);
        }
      }
    });
    
    // Remove edges that increase parallelism
    optimized.edges = edges.filter((e, i) => !edgesToRemove.includes(i));
    
    return optimized;
  }

  /**
   * Identify tasks that can be executed in parallel
   */
  identifyParallelTasks(graph) {
    const { nodes, edges } = graph;
    const levels = this.topologicalSort(nodes, edges);
    const parallelizable = {};
    
    levels.forEach((level, index) => {
      parallelizable[`level-${index}`] = level.map(nodeId => ({
        taskId: nodeId,
        task: nodes.get(nodeId).task,
        agent: nodes.get(nodeId).agent
      }));
    });
    
    return parallelizable;
  }

  /**
   * Estimate workflow duration
   */
  estimateDuration(graph) {
    const { nodes, edges } = graph;
    const criticalPath = this.findCriticalPath(nodes, edges);
    
    return criticalPath.reduce((total, nodeId) => {
      const node = nodes.get(nodeId);
      return total + (node.task.estimatedDuration || 30000); // Default 30s
    }, 0);
  }

  /**
   * Calculate confidence in the workflow
   */
  calculateConfidence(tasks, agents) {
    let totalScore = 0;
    let maxScore = tasks.length * 10;
    
    tasks.forEach(task => {
      const agent = agents[task.id];
      if (agent.score) {
        totalScore += Math.min(agent.score, 10);
      } else {
        totalScore += 5; // Default medium confidence
      }
    });
    
    return totalScore / maxScore;
  }

  /**
   * Helper methods
   */
  
  assessTaskComplexity(task) {
    let complexity = 1;
    
    if (task.subtasks) complexity += task.subtasks.length;
    if (task.requiredCapabilities) complexity += task.requiredCapabilities.length * 0.5;
    if (task.dependencies) complexity += task.dependencies.length * 0.3;
    if (task.coordination) complexity += 2;
    
    return Math.min(Math.round(complexity), 10);
  }
  
  identifyRequiredCapabilities(task) {
    const capabilities = [];
    const keywords = {
      implement: ['code', 'build', 'develop', 'create'],
      design: ['design', 'architect', 'plan', 'structure'],
      test: ['test', 'validate', 'verify', 'check'],
      analyze: ['analyze', 'research', 'investigate', 'assess'],
      coordinate: ['coordinate', 'manage', 'orchestrate', 'organize']
    };
    
    const taskText = (task.description + ' ' + task.type).toLowerCase();
    
    Object.entries(keywords).forEach(([capability, words]) => {
      if (words.some(word => taskText.includes(word))) {
        capabilities.push(capability);
      }
    });
    
    return capabilities;
  }
  
  estimateTaskDuration(task) {
    const baseDuration = 30000; // 30 seconds base
    const complexityMultiplier = task.complexity || 1;
    
    return baseDuration * complexityMultiplier;
  }
  
  inferImplicitDependencies(task, allTasks) {
    const implicit = [];
    
    // Tasks of the same type might have implicit ordering
    allTasks.forEach(otherTask => {
      if (otherTask.id !== task.id && 
          otherTask.phase && task.phase &&
          otherTask.phase < task.phase) {
        implicit.push(otherTask.id);
      }
    });
    
    return implicit;
  }
  
  resolveCircularDependencies(dependencies) {
    // Simple cycle detection and breaking
    const visited = new Set();
    const recursionStack = new Set();
    
    const hasCycle = (node, adj) => {
      visited.add(node);
      recursionStack.add(node);
      
      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor, adj)) return true;
        } else if (recursionStack.has(neighbor)) {
          // Found cycle - remove this edge
          const deps = dependencies.get(node);
          deps.explicit = deps.explicit.filter(d => d !== neighbor);
          return true;
        }
      }
      
      recursionStack.delete(node);
      return false;
    };
    
    // Build adjacency list
    const adj = new Map();
    dependencies.forEach((deps, node) => {
      adj.set(node, [...deps.explicit, ...deps.implicit]);
    });
    
    // Check all nodes
    for (const node of dependencies.keys()) {
      if (!visited.has(node)) {
        hasCycle(node, adj);
      }
    }
  }
  
  findEntryPoints(nodes, edges) {
    const hasIncoming = new Set();
    edges.forEach(edge => hasIncoming.add(edge.to));
    
    return Array.from(nodes.keys()).filter(id => !hasIncoming.has(id));
  }
  
  findExitPoints(nodes, edges) {
    const hasOutgoing = new Set();
    edges.forEach(edge => hasOutgoing.add(edge.from));
    
    return Array.from(nodes.keys()).filter(id => !hasOutgoing.has(id));
  }
  
  findTaskChains(nodes, edges) {
    // Find linear chains of tasks
    const chains = [];
    const visited = new Set();
    
    const followChain = (startId) => {
      const chain = [startId];
      let current = startId;
      
      while (true) {
        const outgoing = edges.filter(e => e.from === current);
        if (outgoing.length === 1) {
          const next = outgoing[0].to;
          const incoming = edges.filter(e => e.to === next);
          
          if (incoming.length === 1 && !visited.has(next)) {
            chain.push(next);
            visited.add(next);
            current = next;
          } else {
            break;
          }
        } else {
          break;
        }
      }
      
      return chain;
    };
    
    nodes.forEach((node, id) => {
      if (!visited.has(id)) {
        visited.add(id);
        const chain = followChain(id);
        if (chain.length > 1) {
          chains.push(chain);
        }
      }
    });
    
    return chains;
  }
  
  canAgentHandleTask(agent, task) {
    // Simplified check - would be more sophisticated in practice
    if (agent.type === 'god' && agent.name === 'zeus') {
      return true; // Zeus can orchestrate anything
    }
    
    const taskCapabilities = task.requiredCapabilities || [];
    // Would check against agent's actual capabilities
    return taskCapabilities.length === 0 || Math.random() > 0.3;
  }
  
  calculateParallelism(nodes, edges) {
    const levels = this.topologicalSort(nodes, edges);
    return Math.max(...levels.map(level => level.length));
  }
  
  topologicalSort(nodes, edges) {
    const inDegree = new Map();
    const adjList = new Map();
    
    // Initialize
    nodes.forEach((node, id) => {
      inDegree.set(id, 0);
      adjList.set(id, []);
    });
    
    // Build graph
    edges.forEach(edge => {
      inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
      adjList.get(edge.from).push(edge.to);
    });
    
    // Process levels
    const levels = [];
    const queue = [];
    
    // Find all nodes with no dependencies
    inDegree.forEach((degree, id) => {
      if (degree === 0) queue.push(id);
    });
    
    while (queue.length > 0) {
      const level = [...queue];
      levels.push(level);
      queue.length = 0;
      
      level.forEach(node => {
        adjList.get(node).forEach(neighbor => {
          inDegree.set(neighbor, inDegree.get(neighbor) - 1);
          if (inDegree.get(neighbor) === 0) {
            queue.push(neighbor);
          }
        });
      });
    }
    
    return levels;
  }
  
  findCriticalPath(nodes, edges) {
    // Simplified critical path - would use proper algorithm
    const paths = [];
    const entryPoints = this.findEntryPoints(nodes, edges);
    
    const findPaths = (nodeId, path = []) => {
      path.push(nodeId);
      
      const outgoing = edges.filter(e => e.from === nodeId);
      if (outgoing.length === 0) {
        paths.push([...path]);
      } else {
        outgoing.forEach(edge => {
          findPaths(edge.to, path);
        });
      }
      
      path.pop();
    };
    
    entryPoints.forEach(entry => findPaths(entry));
    
    // Find longest path by duration
    let criticalPath = [];
    let maxDuration = 0;
    
    paths.forEach(path => {
      const duration = path.reduce((sum, nodeId) => {
        const node = nodes.get(nodeId);
        return sum + (node.task.estimatedDuration || 30000);
      }, 0);
      
      if (duration > maxDuration) {
        maxDuration = duration;
        criticalPath = path;
      }
    });
    
    return criticalPath;
  }
  
  validateGraph(graph) {
    const { nodes, edges } = graph;
    
    // Check for orphaned nodes
    const connected = new Set();
    edges.forEach(edge => {
      connected.add(edge.from);
      connected.add(edge.to);
    });
    
    nodes.forEach((node, id) => {
      if (!connected.has(id) && nodes.size > 1) {
        console.warn(`Warning: Node ${id} is not connected to the graph`);
      }
    });
    
    // Check for missing nodes in edges
    edges.forEach(edge => {
      if (!nodes.has(edge.from)) {
        throw new Error(`Edge references non-existent node: ${edge.from}`);
      }
      if (!nodes.has(edge.to)) {
        throw new Error(`Edge references non-existent node: ${edge.to}`);
      }
    });
  }
  
  identifyDomains(requirements) {
    // Extract domains from requirements
    const domains = [];
    const domainKeywords = {
      frontend: ['ui', 'interface', 'design', 'user experience'],
      backend: ['api', 'server', 'database', 'service'],
      infrastructure: ['deploy', 'cloud', 'devops', 'infrastructure'],
      data: ['data', 'analytics', 'ml', 'ai'],
      security: ['security', 'auth', 'encryption', 'compliance']
    };
    
    const text = JSON.stringify(requirements).toLowerCase();
    
    Object.entries(domainKeywords).forEach(([domain, keywords]) => {
      if (keywords.some(kw => text.includes(kw))) {
        domains.push(domain);
      }
    });
    
    return domains.length > 0 ? domains : ['general'];
  }
  
  createDomainTasks(domain, requirements) {
    const tasks = [];
    
    switch (domain) {
      case 'frontend':
        tasks.push(
          { type: 'design', description: 'Design user interface', domain },
          { type: 'implement', description: 'Implement UI components', domain }
        );
        break;
      case 'backend':
        tasks.push(
          { type: 'design', description: 'Design API architecture', domain },
          { type: 'implement', description: 'Implement API endpoints', domain }
        );
        break;
      default:
        tasks.push(
          { type: 'analyze', description: `Analyze ${domain} requirements`, domain },
          { type: 'implement', description: `Implement ${domain} solution`, domain }
        );
    }
    
    return tasks;
  }
  
  createPhaseTasks(phase, requirements) {
    const tasks = [];
    
    switch (phase) {
      case 'analysis':
        tasks.push({
          type: 'analyze',
          phase,
          description: 'Analyze requirements and constraints',
          requiredCapabilities: ['analyze', 'research']
        });
        break;
      case 'design':
        tasks.push({
          type: 'design',
          phase,
          description: 'Create system design and architecture',
          requiredCapabilities: ['design', 'architect']
        });
        break;
      case 'implementation':
        tasks.push({
          type: 'implement',
          phase,
          description: 'Implement system components',
          requiredCapabilities: ['code', 'build']
        });
        break;
      case 'testing':
        tasks.push({
          type: 'test',
          phase,
          description: 'Test and validate implementation',
          requiredCapabilities: ['test', 'validate']
        });
        break;
      case 'deployment':
        tasks.push({
          type: 'deploy',
          phase,
          description: 'Deploy system to production',
          requiredCapabilities: ['deploy', 'configure']
        });
        break;
    }
    
    return tasks;
  }
  
  createCapabilityTasks(capability, requirements) {
    return [{
      type: capability,
      description: `Execute ${capability} tasks for: ${requirements.description}`,
      requiredCapabilities: [capability]
    }];
  }
  
  createCoordinationTask(capabilities) {
    return {
      type: 'coordinate',
      description: 'Coordinate between different capability domains',
      requiredCapabilities: ['coordinate', 'orchestrate'],
      complexity: capabilities.length
    };
  }
  
  async analyzeRequiredCapabilities(requirements) {
    const text = JSON.stringify(requirements).toLowerCase();
    const capabilities = new Set();
    
    const capabilityKeywords = {
      implement: ['build', 'create', 'develop', 'code'],
      design: ['design', 'architect', 'plan'],
      test: ['test', 'validate', 'verify'],
      analyze: ['analyze', 'research', 'investigate'],
      deploy: ['deploy', 'release', 'launch']
    };
    
    Object.entries(capabilityKeywords).forEach(([cap, keywords]) => {
      if (keywords.some(kw => text.includes(kw))) {
        capabilities.add(cap);
      }
    });
    
    return Array.from(capabilities);
  }
  
  async decomposeGoal(goal) {
    // Simple goal decomposition - would use AI in practice
    const subgoals = [];
    
    if (goal.includes('build') || goal.includes('create')) {
      subgoals.push(
        `Understand requirements for: ${goal}`,
        `Design solution for: ${goal}`,
        `Implement: ${goal}`,
        `Test: ${goal}`
      );
    } else {
      subgoals.push(goal); // Can't decompose further
    }
    
    return subgoals;
  }
  
  identifyGoalDependencies(subgoal, allSubgoals) {
    // Simple dependency inference
    const dependencies = [];
    const index = allSubgoals.indexOf(subgoal);
    
    if (index > 0) {
      // Depend on previous subgoal
      dependencies.push(`task-${index - 1}`);
    }
    
    return dependencies;
  }
  
  isPipelinePattern(tasks) {
    // Check if tasks form a linear pipeline
    let hasSingleDependency = true;
    
    tasks.forEach(task => {
      if (task.dependencies && task.dependencies.length > 1) {
        hasSingleDependency = false;
      }
    });
    
    return hasSingleDependency && tasks.length > 2;
  }
  
  isForkJoinPattern(tasks) {
    // Check for fork-join pattern
    const dependencyCounts = {};
    
    tasks.forEach(task => {
      if (task.dependencies) {
        task.dependencies.forEach(dep => {
          dependencyCounts[dep] = (dependencyCounts[dep] || 0) + 1;
        });
      }
    });
    
    // Fork-join has some tasks depended on by multiple others
    return Object.values(dependencyCounts).some(count => count > 2);
  }
  
  isHierarchicalPattern(tasks) {
    // Check for hierarchical coordination needs
    const hasCoordinationTasks = tasks.some(t => 
      t.type === 'coordinate' || 
      t.requiredCapabilities?.includes('orchestrate')
    );
    
    return hasCoordinationTasks || tasks.length > 10;
  }
  
  buildSequentialWorkflow(tasks) {
    // Linear execution
    return {
      pattern: 'sequential',
      execution: tasks.map(t => t.id)
    };
  }
  
  buildParallelWorkflow(tasks) {
    // All tasks in parallel
    return {
      pattern: 'parallel',
      execution: [tasks.map(t => t.id)]
    };
  }
  
  buildPipelineWorkflow(tasks) {
    // Streaming pipeline
    return {
      pattern: 'pipeline',
      stages: tasks.map(t => ({ id: t.id, buffer: 'auto' }))
    };
  }
  
  buildForkJoinWorkflow(tasks) {
    // Fork-join parallelism
    const forks = {};
    const joins = {};
    
    tasks.forEach(task => {
      if (!task.dependencies || task.dependencies.length === 0) {
        forks[task.id] = true;
      }
      
      const dependents = tasks.filter(t => 
        t.dependencies?.includes(task.id)
      );
      
      if (dependents.length > 1) {
        joins[task.id] = dependents.map(d => d.id);
      }
    });
    
    return {
      pattern: 'fork-join',
      forks,
      joins
    };
  }
  
  buildHierarchicalWorkflow(tasks) {
    // Hierarchical coordination
    const coordinators = tasks.filter(t => 
      t.type === 'coordinate' || 
      t.requiredCapabilities?.includes('orchestrate')
    );
    
    const workers = tasks.filter(t => !coordinators.includes(t));
    
    return {
      pattern: 'hierarchical',
      coordinators: coordinators.map(c => c.id),
      workers: workers.map(w => w.id)
    };
  }
  
  balanceWorkload(graph) {
    // Balance tasks across agents
    const { nodes } = graph;
    const agentWorkload = new Map();
    
    // Calculate current workload
    nodes.forEach(node => {
      const key = `${node.agent.type}:${node.agent.name}`;
      const workload = agentWorkload.get(key) || { count: 0, duration: 0 };
      workload.count++;
      workload.duration += node.task.estimatedDuration || 30000;
      agentWorkload.set(key, workload);
    });
    
    // Find overloaded agents
    const avgDuration = Array.from(agentWorkload.values())
      .reduce((sum, w) => sum + w.duration, 0) / agentWorkload.size;
    
    const overloaded = Array.from(agentWorkload.entries())
      .filter(([key, workload]) => workload.duration > avgDuration * 1.5);
    
    // Reassign some tasks from overloaded agents
    // (Implementation would be more sophisticated)
    
    return graph;
  }
  
  optimizeForSpeed(graph) {
    // Optimize for fastest execution
    const optimized = { ...graph };
    
    // Prefer faster agents for critical path
    const criticalPath = this.findCriticalPath(optimized.nodes, optimized.edges);
    
    criticalPath.forEach(nodeId => {
      const node = optimized.nodes.get(nodeId);
      // Would select fastest capable agent here
    });
    
    return optimized;
  }
}

export default DynamicWorkflowBuilder;