import { EventEmitter } from 'events';

/**
 * AgentSafetyManager - Manages agent creation limits and hierarchy tracking
 * Prevents runaway agent creation and enforces safety boundaries
 */
export class AgentSafetyManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // Global limits
    this.globalLimits = {
      maxTotalAgents: options.maxTotalAgents || 50,
      maxDepth: options.maxDepth || 5,
      maxAgentsPerParent: options.maxAgentsPerParent || 10,
      creationTimeout: options.creationTimeout || 300000 // 5 minutes
    };
    
    // Tracking structures
    this.activeAgents = new Map();
    this.agentHierarchy = new Map();
    this.creationTimestamps = new Map();
    this.agentDepths = new Map();
  }

  /**
   * Check if a new agent can be created given current constraints
   */
  canCreateAgent(parentId, limits = {}) {
    const effectiveLimits = { ...this.globalLimits, ...limits };
    
    // Check total agent count
    if (this.activeAgents.size >= effectiveLimits.maxTotalAgents) {
      return {
        allowed: false,
        reason: `Maximum total agents reached (${effectiveLimits.maxTotalAgents})`
      };
    }
    
    // Check depth limit
    const parentDepth = this.getAgentDepth(parentId);
    if (parentDepth >= effectiveLimits.maxDepth - 1) {
      return {
        allowed: false,
        reason: `Maximum depth reached (${effectiveLimits.maxDepth})`
      };
    }
    
    // Check agents per parent limit
    const childCount = this.getChildCount(parentId);
    if (childCount >= effectiveLimits.maxAgentsPerParent) {
      return {
        allowed: false,
        reason: `Maximum agents per parent reached (${effectiveLimits.maxAgentsPerParent})`
      };
    }
    
    // Check creation rate limiting
    if (this.isRateLimited(parentId)) {
      return {
        allowed: false,
        reason: 'Agent creation rate limit exceeded'
      };
    }
    
    return {
      allowed: true,
      reason: 'OK',
      metrics: {
        totalAgents: this.activeAgents.size,
        parentDepth: parentDepth,
        childCount: childCount
      }
    };
  }

  /**
   * Register a new agent in the safety system
   */
  registerAgent(agentId, parentId, metadata = {}) {
    const now = Date.now();
    const parentDepth = this.getAgentDepth(parentId);
    
    // Register agent
    this.activeAgents.set(agentId, {
      id: agentId,
      parent: parentId,
      created: now,
      depth: parentDepth + 1,
      status: 'active',
      metadata
    });
    
    // Update hierarchy
    if (!this.agentHierarchy.has(parentId)) {
      this.agentHierarchy.set(parentId, new Set());
    }
    this.agentHierarchy.get(parentId).add(agentId);
    
    // Track depth
    this.agentDepths.set(agentId, parentDepth + 1);
    
    // Track creation timestamp for rate limiting
    if (!this.creationTimestamps.has(parentId)) {
      this.creationTimestamps.set(parentId, []);
    }
    this.creationTimestamps.get(parentId).push(now);
    
    // Emit event
    this.emit('agent:registered', {
      agentId,
      parentId,
      depth: parentDepth + 1,
      totalAgents: this.activeAgents.size
    });
    
    // Clean old timestamps
    this.cleanOldTimestamps(parentId);
  }

  /**
   * Unregister an agent and its descendants
   */
  unregisterAgent(agentId) {
    const agent = this.activeAgents.get(agentId);
    if (!agent) return;
    
    // Recursively unregister children
    const children = this.agentHierarchy.get(agentId);
    if (children) {
      for (const childId of children) {
        this.unregisterAgent(childId);
      }
    }
    
    // Remove from parent's children
    if (agent.parent && this.agentHierarchy.has(agent.parent)) {
      this.agentHierarchy.get(agent.parent).delete(agentId);
    }
    
    // Clean up tracking
    this.activeAgents.delete(agentId);
    this.agentHierarchy.delete(agentId);
    this.agentDepths.delete(agentId);
    this.creationTimestamps.delete(agentId);
    
    // Emit event
    this.emit('agent:unregistered', {
      agentId,
      totalAgents: this.activeAgents.size
    });
  }

  /**
   * Get the depth of an agent in the hierarchy
   */
  getAgentDepth(agentId) {
    if (!agentId) return 0;
    return this.agentDepths.get(agentId) || 0;
  }

  /**
   * Get the number of direct children for an agent
   */
  getChildCount(agentId) {
    const children = this.agentHierarchy.get(agentId);
    return children ? children.size : 0;
  }

  /**
   * Get all descendants of an agent
   */
  getDescendants(agentId) {
    const descendants = new Set();
    const children = this.agentHierarchy.get(agentId);
    
    if (children) {
      for (const childId of children) {
        descendants.add(childId);
        const childDescendants = this.getDescendants(childId);
        for (const desc of childDescendants) {
          descendants.add(desc);
        }
      }
    }
    
    return Array.from(descendants);
  }

  /**
   * Check if agent creation is rate limited
   */
  isRateLimited(parentId, windowMs = 60000, maxCreations = 10) {
    const timestamps = this.creationTimestamps.get(parentId) || [];
    const now = Date.now();
    const recentCreations = timestamps.filter(ts => now - ts < windowMs);
    return recentCreations.length >= maxCreations;
  }

  /**
   * Clean old timestamps for rate limiting
   */
  cleanOldTimestamps(parentId, windowMs = 300000) {
    const timestamps = this.creationTimestamps.get(parentId);
    if (!timestamps) return;
    
    const now = Date.now();
    const filtered = timestamps.filter(ts => now - ts < windowMs);
    
    if (filtered.length === 0) {
      this.creationTimestamps.delete(parentId);
    } else {
      this.creationTimestamps.set(parentId, filtered);
    }
  }

  /**
   * Get hierarchy visualization
   */
  getHierarchyTree(rootId = null) {
    const buildTree = (agentId, depth = 0) => {
      const agent = this.activeAgents.get(agentId);
      if (!agent && agentId) return null;
      
      const children = this.agentHierarchy.get(agentId) || new Set();
      const childTrees = Array.from(children)
        .map(childId => buildTree(childId, depth + 1))
        .filter(Boolean);
      
      return {
        id: agentId || 'root',
        depth,
        agent: agent || { id: 'root', status: 'root' },
        children: childTrees,
        childCount: children.size,
        descendantCount: this.getDescendants(agentId).length
      };
    };
    
    return buildTree(rootId);
  }

  /**
   * Get safety metrics
   */
  getMetrics() {
    const depthDistribution = {};
    for (const [id, depth] of this.agentDepths) {
      depthDistribution[depth] = (depthDistribution[depth] || 0) + 1;
    }
    
    return {
      totalAgents: this.activeAgents.size,
      maxDepthUsed: Math.max(...this.agentDepths.values(), 0),
      depthDistribution,
      averageChildrenPerParent: this.calculateAverageChildren(),
      oldestAgent: this.getOldestAgent(),
      newestAgent: this.getNewestAgent()
    };
  }

  calculateAverageChildren() {
    let totalChildren = 0;
    let parentsWithChildren = 0;
    
    for (const [parentId, children] of this.agentHierarchy) {
      if (children.size > 0) {
        totalChildren += children.size;
        parentsWithChildren++;
      }
    }
    
    return parentsWithChildren > 0 ? totalChildren / parentsWithChildren : 0;
  }

  getOldestAgent() {
    let oldest = null;
    let oldestTime = Infinity;
    
    for (const [id, agent] of this.activeAgents) {
      if (agent.created < oldestTime) {
        oldestTime = agent.created;
        oldest = agent;
      }
    }
    
    return oldest;
  }

  getNewestAgent() {
    let newest = null;
    let newestTime = 0;
    
    for (const [id, agent] of this.activeAgents) {
      if (agent.created > newestTime) {
        newestTime = agent.created;
        newest = agent;
      }
    }
    
    return newest;
  }

  /**
   * Clean up inactive or timed-out agents
   */
  cleanupInactiveAgents(maxAge = 3600000) { // 1 hour default
    const now = Date.now();
    const toRemove = [];
    
    for (const [id, agent] of this.activeAgents) {
      if (now - agent.created > maxAge && agent.status !== 'active') {
        toRemove.push(id);
      }
    }
    
    for (const id of toRemove) {
      this.unregisterAgent(id);
    }
    
    return toRemove.length;
  }
}

// Singleton instance
let safetyManagerInstance = null;

export function getSafetyManager(options) {
  if (!safetyManagerInstance) {
    safetyManagerInstance = new AgentSafetyManager(options);
  }
  return safetyManagerInstance;
}

export default AgentSafetyManager;