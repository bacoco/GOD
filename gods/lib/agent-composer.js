/**
 * Agent Composer
 * Intelligently merges multiple Claude-Flow agent types to create specialized hybrid agents
 * Leverages the 54 existing agents to create project-specific compositions
 */

import { EventEmitter } from 'events';
import { AgentMDLoader } from './agent-md-loader.js';
import { AgentMDGenerator } from './agent-md-generator.js';

export class AgentComposer extends EventEmitter {
  constructor(claudeFlowPath) {
    super();
    
    this.mdLoader = new AgentMDLoader(claudeFlowPath);
    this.mdGenerator = new AgentMDGenerator();
    
    // Agent composition strategies
    this.compositionStrategies = {
      'merge': this.mergeStrategy.bind(this),
      'overlay': this.overlayStrategy.bind(this),
      'hybrid': this.hybridStrategy.bind(this),
      'extend': this.extendStrategy.bind(this)
    };
    
    // Compatibility matrix for agent merging
    this.compatibilityMatrix = {
      // Core agents can merge with almost anything
      'coder': ['tester', 'reviewer', 'architect', 'api-docs', 'backend-dev'],
      'planner': ['orchestrator-task', 'sparc-coordinator', 'migration-plan'],
      'researcher': ['analyst', 'performance-analyzer', 'specification'],
      'reviewer': ['tester', 'security-manager', 'production-validator'],
      'tester': ['tdd-london-swarm', 'production-validator', 'performance-benchmarker'],
      
      // Architecture agents
      'architect': ['system-architect', 'repo-architect', 'architecture'],
      'system-architect': ['mesh-coordinator', 'hierarchical-coordinator'],
      
      // Development agents
      'backend-dev': ['api-docs', 'dev-backend-api', 'coder'],
      'mobile-dev': ['spec-mobile-react-native', 'apollo'],
      
      // Coordination agents
      'orchestrator-task': ['sparc-coordinator', 'swarm-init', 'hierarchical-coordinator'],
      'hierarchical-coordinator': ['mesh-coordinator', 'adaptive-coordinator'],
      'mesh-coordinator': ['swarm-memory-manager', 'consensus-builder'],
      
      // Specialized agents
      'security-manager': ['production-validator', 'aegis'],
      'performance-analyzer': ['performance-benchmarker', 'performance-monitor'],
      'ml-developer': ['data-ml-model', 'neural-processor']
    };
    
    // Trait inheritance rules
    this.traitInheritance = {
      'tools': 'union',           // Combine all tools
      'capabilities': 'union',     // Combine all capabilities
      'responsibilities': 'merge', // Merge with deduplication
      'patterns': 'overlay',       // Overlay patterns
      'guidelines': 'append',      // Append guidelines
      'hooks': 'merge'            // Merge hooks intelligently
    };
  }

  /**
   * Initialize the composer
   */
  async initialize() {
    await this.mdLoader.initialize();
    this.emit('composer:initialized');
  }

  /**
   * Compose multiple agents into a hybrid agent
   * @param {Object} spec - Agent specification with baseAgents
   * @returns {Object} Composed agent configuration
   */
  async compose(spec) {
    this.emit('composition:starting', { spec });
    
    try {
      // Load base agents
      const baseAgents = await this.loadBaseAgents(spec.baseAgents || []);
      
      // Apply composition strategy
      const strategy = spec.compositionStrategy || 'hybrid';
      const composedAgent = await this.compositionStrategies[strategy](baseAgents, spec);
      
      // Apply project-specific customizations
      const customizedAgent = this.applyCustomizations(composedAgent, spec);
      
      // Validate composition
      this.validateComposition(customizedAgent);
      
      this.emit('composition:completed', { agent: customizedAgent.name });
      
      return customizedAgent;
      
    } catch (error) {
      this.emit('composition:error', { error });
      throw error;
    }
  }

  /**
   * Load base agents from Claude-Flow
   */
  async loadBaseAgents(agentNames) {
    const agents = [];
    
    for (const name of agentNames) {
      try {
        const agent = await this.mdLoader.loadAgent(name);
        if (agent) {
          agents.push(agent);
        } else {
          // Try to find by category
          const foundAgent = await this.findAgentByName(name);
          if (foundAgent) {
            agents.push(foundAgent);
          }
        }
      } catch (error) {
        console.warn(`Could not load agent ${name}:`, error.message);
      }
    }
    
    return agents;
  }

  /**
   * Find agent by name across all categories
   */
  async findAgentByName(name) {
    const categories = [
      'core', 'development', 'architecture', 'swarm', 
      'github', 'testing', 'optimization', 'consensus'
    ];
    
    for (const category of categories) {
      const agent = await this.mdLoader.loadAgent(name, category);
      if (agent) return agent;
    }
    
    return null;
  }

  /**
   * Merge strategy - combines all aspects of agents
   */
  async mergeStrategy(baseAgents, spec) {
    const merged = {
      name: spec.name,
      displayName: spec.displayName,
      type: spec.type,
      description: spec.description,
      tools: new Set(),
      capabilities: new Set(),
      responsibilities: [],
      patterns: {},
      guidelines: [],
      hooks: {},
      metadata: {
        baseAgents: baseAgents.map(a => a.name),
        compositionStrategy: 'merge',
        ...spec.metadata
      }
    };
    
    // Merge each agent
    for (const agent of baseAgents) {
      // Merge tools
      if (agent.tools) {
        agent.tools.forEach(tool => merged.tools.add(tool));
      }
      
      // Merge capabilities
      if (agent.capabilities) {
        agent.capabilities.forEach(cap => merged.capabilities.add(cap));
      }
      
      // Merge responsibilities with deduplication
      if (agent.responsibilities) {
        agent.responsibilities.forEach(resp => {
          if (!merged.responsibilities.find(r => r === resp || r.title === resp.title)) {
            merged.responsibilities.push(resp);
          }
        });
      }
      
      // Merge patterns
      if (agent.patterns) {
        Object.entries(agent.patterns).forEach(([key, value]) => {
          if (!merged.patterns[key]) {
            merged.patterns[key] = [];
          }
          merged.patterns[key].push(...(Array.isArray(value) ? value : [value]));
        });
      }
      
      // Append guidelines
      if (agent.guidelines) {
        merged.guidelines.push(...agent.guidelines);
      }
      
      // Merge hooks
      if (agent.hooks) {
        Object.entries(agent.hooks).forEach(([event, handlers]) => {
          if (!merged.hooks[event]) {
            merged.hooks[event] = [];
          }
          merged.hooks[event].push(...(Array.isArray(handlers) ? handlers : [handlers]));
        });
      }
    }
    
    // Convert sets to arrays
    merged.tools = Array.from(merged.tools);
    merged.capabilities = Array.from(merged.capabilities);
    
    return merged;
  }

  /**
   * Overlay strategy - base agent with overlays
   */
  async overlayStrategy(baseAgents, spec) {
    if (baseAgents.length === 0) {
      throw new Error('Overlay strategy requires at least one base agent');
    }
    
    // Use first agent as base
    const base = { ...baseAgents[0] };
    base.name = spec.name;
    base.displayName = spec.displayName;
    base.description = spec.description;
    
    // Overlay additional agents
    for (let i = 1; i < baseAgents.length; i++) {
      const overlay = baseAgents[i];
      
      // Overlay tools (additive)
      if (overlay.tools) {
        base.tools = Array.from(new Set([...base.tools, ...overlay.tools]));
      }
      
      // Overlay capabilities (additive)
      if (overlay.capabilities) {
        base.capabilities = Array.from(new Set([...base.capabilities, ...overlay.capabilities]));
      }
      
      // Overlay patterns (replace if exists)
      if (overlay.patterns) {
        base.patterns = { ...base.patterns, ...overlay.patterns };
      }
    }
    
    base.metadata = {
      baseAgent: baseAgents[0].name,
      overlays: baseAgents.slice(1).map(a => a.name),
      compositionStrategy: 'overlay',
      ...spec.metadata
    };
    
    return base;
  }

  /**
   * Hybrid strategy - intelligent merging based on compatibility
   */
  async hybridStrategy(baseAgents, spec) {
    const hybrid = await this.mergeStrategy(baseAgents, spec);
    
    // Apply intelligence based on agent types
    hybrid.capabilities = this.optimizeCapabilities(hybrid.capabilities, spec.type);
    hybrid.tools = this.optimizeTools(hybrid.tools, spec.type);
    hybrid.responsibilities = this.consolidateResponsibilities(hybrid.responsibilities);
    
    // Add hybrid-specific enhancements
    hybrid.metadata.compositionStrategy = 'hybrid';
    hybrid.metadata.optimizations = ['capability-dedup', 'tool-optimization', 'responsibility-consolidation'];
    
    // Add coordination protocols for hybrid agents
    if (baseAgents.length > 2) {
      hybrid.coordinationProtocol = this.generateCoordinationProtocol(baseAgents);
    }
    
    return hybrid;
  }

  /**
   * Extend strategy - extends a base agent with new capabilities
   */
  async extendStrategy(baseAgents, spec) {
    if (baseAgents.length !== 1) {
      throw new Error('Extend strategy requires exactly one base agent');
    }
    
    const extended = { ...baseAgents[0] };
    extended.name = spec.name;
    extended.displayName = spec.displayName;
    
    // Extend with new capabilities
    if (spec.capabilities) {
      extended.capabilities = [...extended.capabilities, ...spec.capabilities];
    }
    
    if (spec.tools) {
      extended.tools = [...extended.tools, ...spec.tools];
    }
    
    if (spec.responsibilities) {
      extended.responsibilities = [...extended.responsibilities, ...spec.responsibilities];
    }
    
    extended.metadata = {
      extendsAgent: baseAgents[0].name,
      compositionStrategy: 'extend',
      extensions: {
        capabilities: spec.capabilities?.length || 0,
        tools: spec.tools?.length || 0,
        responsibilities: spec.responsibilities?.length || 0
      },
      ...spec.metadata
    };
    
    return extended;
  }

  /**
   * Apply project-specific customizations
   */
  applyCustomizations(agent, spec) {
    const customized = { ...agent };
    
    // Apply specialization
    if (spec.specialization) {
      customized.specialization = spec.specialization;
      
      // Add focus-specific enhancements
      if (spec.specialization.focus) {
        customized.guidelines = customized.guidelines || [];
        customized.guidelines.unshift(
          `Primary Focus: ${spec.specialization.focus}`,
          `Optimization Target: ${spec.specialization.optimizationTarget || 'efficiency'}`
        );
      }
    }
    
    // Apply personality traits
    if (spec.specialization?.personality) {
      customized.personality = spec.specialization.personality;
    }
    
    // Apply project context
    if (spec.specialization?.projectContext) {
      customized.projectContext = spec.specialization.projectContext;
    }
    
    return customized;
  }

  /**
   * Optimize capabilities based on agent type
   */
  optimizeCapabilities(capabilities, agentType) {
    // Remove redundant capabilities
    const optimized = new Set(capabilities);
    
    // Remove generic if specific exists
    const genericToSpecific = {
      'development': ['backend-development', 'frontend-development', 'api-development'],
      'testing': ['unit-testing', 'integration-testing', 'performance-testing'],
      'design': ['system-design', 'api-design', 'ui-design']
    };
    
    Object.entries(genericToSpecific).forEach(([generic, specifics]) => {
      if (optimized.has(generic) && specifics.some(s => optimized.has(s))) {
        optimized.delete(generic);
      }
    });
    
    return Array.from(optimized);
  }

  /**
   * Optimize tools based on agent type
   */
  optimizeTools(tools, agentType) {
    // Remove redundant tools
    const optimized = new Set(tools);
    
    // Agent-specific tool limits
    const maxTools = {
      'orchestrator': 20,
      'architect': 15,
      'developer': 25,
      'designer': 15,
      'tester': 20,
      'coordinator': 15,
      'security': 20,
      'analyst': 15
    };
    
    const limit = maxTools[agentType] || 20;
    
    if (optimized.size <= limit) {
      return Array.from(optimized);
    }
    
    // Prioritize tools by importance for agent type
    // This would use the ToolAllocator's prioritization logic
    return Array.from(optimized).slice(0, limit);
  }

  /**
   * Consolidate responsibilities to avoid duplication
   */
  consolidateResponsibilities(responsibilities) {
    const consolidated = [];
    const seen = new Set();
    
    responsibilities.forEach(resp => {
      const key = typeof resp === 'string' ? resp : resp.title;
      if (!seen.has(key.toLowerCase())) {
        seen.add(key.toLowerCase());
        consolidated.push(resp);
      }
    });
    
    return consolidated;
  }

  /**
   * Generate coordination protocol for multi-base hybrid agents
   */
  generateCoordinationProtocol(baseAgents) {
    return {
      type: 'hybrid-coordination',
      primaryCoordinator: baseAgents[0].name,
      coordinationStyle: baseAgents.length > 3 ? 'hierarchical' : 'mesh',
      communicationChannels: [
        'shared-memory',
        'event-stream',
        'direct-message'
      ],
      consensusProtocol: baseAgents.length > 2 ? 'majority-vote' : 'unanimous',
      conflictResolution: 'priority-based'
    };
  }

  /**
   * Validate the composed agent
   */
  validateComposition(agent) {
    const errors = [];
    
    if (!agent.name) errors.push('Agent must have a name');
    if (!agent.type) errors.push('Agent must have a type');
    if (!agent.tools || agent.tools.length === 0) errors.push('Agent must have at least one tool');
    if (!agent.capabilities || agent.capabilities.length === 0) errors.push('Agent must have at least one capability');
    
    if (errors.length > 0) {
      throw new Error(`Invalid agent composition: ${errors.join(', ')}`);
    }
    
    // Validate tool/capability alignment
    this.validateToolCapabilityAlignment(agent);
  }

  /**
   * Ensure tools align with capabilities
   */
  validateToolCapabilityAlignment(agent) {
    // This would check that the agent has appropriate tools for its capabilities
    // For now, we'll just emit a warning if there seems to be a mismatch
    const hasCodeCapability = agent.capabilities.some(c => c.includes('code') || c.includes('implement'));
    const hasCodeTools = agent.tools.some(t => t.includes('code_'));
    
    if (hasCodeCapability && !hasCodeTools) {
      console.warn(`Agent ${agent.name} has code capabilities but no code tools`);
    }
  }

  /**
   * Get compatibility score between agents
   */
  getCompatibilityScore(agent1Name, agent2Name) {
    // Direct compatibility
    if (this.compatibilityMatrix[agent1Name]?.includes(agent2Name)) {
      return 1.0;
    }
    
    // Reverse compatibility
    if (this.compatibilityMatrix[agent2Name]?.includes(agent1Name)) {
      return 0.9;
    }
    
    // Category-based compatibility
    const agent1Category = this.getAgentCategory(agent1Name);
    const agent2Category = this.getAgentCategory(agent2Name);
    
    if (agent1Category === agent2Category) {
      return 0.7;
    }
    
    // Default low compatibility
    return 0.3;
  }

  /**
   * Get agent category
   */
  getAgentCategory(agentName) {
    const categories = {
      'core': ['coder', 'planner', 'researcher', 'reviewer', 'tester'],
      'architecture': ['architect', 'system-architect', 'repo-architect'],
      'development': ['backend-dev', 'mobile-dev', 'ml-developer'],
      'coordination': ['orchestrator-task', 'hierarchical-coordinator', 'mesh-coordinator'],
      'specialized': ['security-manager', 'performance-analyzer', 'api-docs']
    };
    
    for (const [category, agents] of Object.entries(categories)) {
      if (agents.includes(agentName)) {
        return category;
      }
    }
    
    return 'unknown';
  }
}

export default AgentComposer;