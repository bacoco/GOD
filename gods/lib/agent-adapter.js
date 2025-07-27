import { EventEmitter } from 'events';

/**
 * AgentAdapter - Adapts and customizes Claude-Flow agents
 * Enables dynamic modification and combination of agent capabilities
 */
export class AgentAdapter extends EventEmitter {
  constructor() {
    super();
    
    // Merge strategies for combining agents
    this.mergeStrategies = {
      'union': this.unionMerge.bind(this),
      'intersection': this.intersectionMerge.bind(this),
      'weighted': this.weightedMerge.bind(this),
      'best-features': this.bestFeaturesMerge.bind(this),
      'capabilities-union': this.capabilitiesUnionMerge.bind(this)
    };
    
    // Adaptation patterns
    this.adaptationPatterns = new Map();
    this.initializePatterns();
  }

  /**
   * Initialize common adaptation patterns
   */
  initializePatterns() {
    // Domain specialization pattern
    this.adaptationPatterns.set('domain-specialization', {
      template: (domain, expertise) => `
## Domain Specialization
You are specialized in ${domain} with expertise in:
${expertise.map(e => `- ${e}`).join('\n')}

Apply domain-specific best practices and patterns in all your work.
`
    });

    // Tool proficiency pattern
    this.adaptationPatterns.set('tool-proficiency', {
      template: (tools) => `
## Tool Proficiency
You are proficient with the following tools and frameworks:
${tools.map(t => `- ${t}`).join('\n')}

Leverage these tools effectively in your implementations.
`
    });

    // Methodology pattern
    this.adaptationPatterns.set('methodology', {
      template: (methodology) => `
## Methodology
Follow the ${methodology} methodology in your approach:
- Plan before implementation
- Iterate based on feedback
- Document your decisions
- Test thoroughly
`
    });
  }

  /**
   * Adapt a single agent with customizations
   */
  async adaptAgent(baseAgent, customizations = {}) {
    const startTime = Date.now();
    
    try {
      // Create adapted agent structure
      const adaptedAgent = {
        // Metadata
        name: customizations.name || `${baseAgent.name}-adapted`,
        type: customizations.type || baseAgent.metadata.type || 'custom',
        baseAgent: baseAgent.name,
        
        // Merge instructions
        instructions: await this.synthesizeInstructions(baseAgent, customizations),
        
        // Merge tools
        tools: this.mergeTools(baseAgent.tools, customizations.tools, customizations.excludeTools),
        
        // Enhance capabilities
        capabilities: this.mergeCapabilities(baseAgent.capabilities, customizations.capabilities),
        
        // Add specialization
        specialization: {
          baseAgent: baseAgent.name,
          focus: customizations.focus,
          expertise: customizations.expertise || [],
          constraints: customizations.constraints || {},
          personality: customizations.personality || baseAgent.metadata.personality || {}
        },
        
        // Preserve execution through Claude-Flow
        executionEngine: 'claude-flow',
        contextIsolation: true,
        
        // Metadata
        metadata: {
          ...baseAgent.metadata,
          adapted: true,
          adaptedAt: new Date(),
          adaptationDuration: Date.now() - startTime,
          customizations
        }
      };
      
      this.emit('agent:adapted', {
        baseAgent: baseAgent.name,
        adaptedAgent: adaptedAgent.name,
        duration: Date.now() - startTime
      });
      
      return adaptedAgent;
      
    } catch (error) {
      this.emit('agent:adaptation-failed', { baseAgent: baseAgent.name, error });
      throw error;
    }
  }

  /**
   * Synthesize instructions from base and customizations
   */
  async synthesizeInstructions(baseAgent, customizations) {
    const sections = [];
    
    // Start with base instructions
    sections.push(baseAgent.instructions);
    
    // Add focus if specified
    if (customizations.focus) {
      sections.push(`\n## Specialized Focus\n${customizations.focus}`);
    }
    
    // Add expertise
    if (customizations.expertise && customizations.expertise.length > 0) {
      sections.push(`\n## Areas of Expertise\n${customizations.expertise.map(e => `- ${e}`).join('\n')}`);
    }
    
    // Add additional instructions
    if (customizations.additionalInstructions) {
      sections.push(`\n## Additional Instructions\n${customizations.additionalInstructions}`);
    }
    
    // Apply adaptation patterns
    if (customizations.patterns) {
      for (const pattern of customizations.patterns) {
        const patternDef = this.adaptationPatterns.get(pattern.name);
        if (patternDef) {
          sections.push(patternDef.template(...pattern.params));
        }
      }
    }
    
    // Add constraints
    if (customizations.constraints && Object.keys(customizations.constraints).length > 0) {
      sections.push(`\n## Constraints and Limitations\n${this.formatConstraints(customizations.constraints)}`);
    }
    
    // Add personality traits
    if (customizations.personality) {
      sections.push(`\n## Personality and Approach\n${this.formatPersonality(customizations.personality)}`);
    }
    
    return sections.join('\n');
  }

  /**
   * Merge tools from base and customizations
   */
  mergeTools(baseTools = [], additionalTools = [], excludeTools = []) {
    const toolSet = new Set(baseTools);
    
    // Add additional tools
    if (additionalTools) {
      additionalTools.forEach(tool => toolSet.add(tool));
    }
    
    // Remove excluded tools
    if (excludeTools) {
      excludeTools.forEach(tool => toolSet.delete(tool));
    }
    
    return Array.from(toolSet);
  }

  /**
   * Merge capabilities
   */
  mergeCapabilities(baseCapabilities = [], additionalCapabilities = []) {
    const capabilitySet = new Set(baseCapabilities);
    
    if (additionalCapabilities) {
      additionalCapabilities.forEach(cap => capabilitySet.add(cap));
    }
    
    return Array.from(capabilitySet);
  }

  /**
   * Combine multiple agents into a hybrid
   */
  async combineAgents(agents, config = {}) {
    if (!agents || agents.length === 0) {
      throw new Error('No agents provided for combination');
    }
    
    const strategy = config.mergeStrategy || 'union';
    const mergeFn = this.mergeStrategies[strategy];
    
    if (!mergeFn) {
      throw new Error(`Unknown merge strategy: ${strategy}`);
    }
    
    const startTime = Date.now();
    
    try {
      // Use the selected merge strategy
      const combinedAgent = await mergeFn(agents, config);
      
      // Add combination metadata
      combinedAgent.metadata = {
        ...combinedAgent.metadata,
        combined: true,
        combinedFrom: agents.map(a => a.name),
        mergeStrategy: strategy,
        combinedAt: new Date(),
        combinationDuration: Date.now() - startTime
      };
      
      this.emit('agents:combined', {
        agents: agents.map(a => a.name),
        strategy,
        resultAgent: combinedAgent.name,
        duration: Date.now() - startTime
      });
      
      return combinedAgent;
      
    } catch (error) {
      this.emit('agents:combination-failed', { agents: agents.map(a => a.name), error });
      throw error;
    }
  }

  /**
   * Union merge strategy - combines all features
   */
  async unionMerge(agents, config) {
    const name = config.name || agents.map(a => a.name).join('-');
    
    // Combine all instructions
    const instructions = agents.map(a => 
      `## Inherited from ${a.name}\n${a.instructions}`
    ).join('\n\n---\n\n');
    
    // Union of tools
    const tools = Array.from(new Set(agents.flatMap(a => a.tools)));
    
    // Union of capabilities
    const capabilities = Array.from(new Set(agents.flatMap(a => a.capabilities)));
    
    return {
      name,
      type: 'hybrid',
      baseAgents: agents.map(a => a.name),
      instructions: `# Hybrid Agent: ${name}\n\nThis agent combines capabilities from multiple agents.\n\n${instructions}`,
      tools,
      capabilities,
      specialization: {
        mergeStrategy: 'union',
        inheritedFrom: agents.map(a => a.name)
      }
    };
  }

  /**
   * Intersection merge strategy - only common features
   */
  async intersectionMerge(agents, config) {
    const name = config.name || `${agents[0].name}-focused`;
    
    // Find common tools
    const toolSets = agents.map(a => new Set(a.tools));
    const commonTools = Array.from(toolSets[0]).filter(tool =>
      toolSets.every(set => set.has(tool))
    );
    
    // Find common capabilities
    const capSets = agents.map(a => new Set(a.capabilities));
    const commonCaps = Array.from(capSets[0]).filter(cap =>
      capSets.every(set => set.has(cap))
    );
    
    // Synthesize focused instructions
    const instructions = `# Focused Agent: ${name}

This agent focuses on the core competencies shared by all base agents.

## Core Focus
${commonCaps.map(c => `- ${c}`).join('\n')}

## Approach
Apply the most refined and proven patterns from each base agent.`;
    
    return {
      name,
      type: 'focused',
      baseAgents: agents.map(a => a.name),
      instructions,
      tools: commonTools,
      capabilities: commonCaps,
      specialization: {
        mergeStrategy: 'intersection',
        focusedOn: commonCaps
      }
    };
  }

  /**
   * Weighted merge strategy - prioritize certain agents
   */
  async weightedMerge(agents, config) {
    const weights = config.weights || agents.map(() => 1);
    const name = config.name || 'weighted-hybrid';
    
    // Primary agent (highest weight)
    const primaryIndex = weights.indexOf(Math.max(...weights));
    const primaryAgent = agents[primaryIndex];
    
    // Start with primary agent as base
    let instructions = primaryAgent.instructions;
    const tools = new Set(primaryAgent.tools);
    const capabilities = new Set(primaryAgent.capabilities);
    
    // Add weighted contributions from other agents
    agents.forEach((agent, index) => {
      if (index !== primaryIndex && weights[index] > 0) {
        const weight = weights[index];
        
        // Add instructions based on weight
        if (weight >= 0.5) {
          instructions += `\n\n## Additional capabilities from ${agent.name}\n`;
          instructions += agent.sections?.core_responsibilities || '';
        }
        
        // Add tools if weight is significant
        if (weight >= 0.3) {
          agent.tools.forEach(tool => tools.add(tool));
        }
        
        // Add capabilities
        agent.capabilities.forEach(cap => capabilities.add(cap));
      }
    });
    
    return {
      name,
      type: 'weighted-hybrid',
      baseAgents: agents.map(a => a.name),
      primaryAgent: primaryAgent.name,
      instructions,
      tools: Array.from(tools),
      capabilities: Array.from(capabilities),
      specialization: {
        mergeStrategy: 'weighted',
        weights: agents.map((a, i) => ({ agent: a.name, weight: weights[i] }))
      }
    };
  }

  /**
   * Best features merge - cherry-pick best aspects
   */
  async bestFeaturesMerge(agents, config) {
    const name = config.name || 'best-of-breed';
    const features = config.features || {};
    
    // Analyze each agent's strengths
    const strengths = agents.map(agent => ({
      agent: agent.name,
      strengths: this.analyzeStrengths(agent)
    }));
    
    // Build hybrid taking best from each
    const instructions = [`# Best-of-Breed Agent: ${name}

This agent combines the best features from multiple specialized agents.

## Inherited Strengths`];
    
    const tools = new Set();
    const capabilities = new Set();
    
    strengths.forEach(({ agent, strengths }) => {
      instructions.push(`\n### From ${agent}:`);
      strengths.topCapabilities.forEach(cap => {
        instructions.push(`- ${cap}`);
        capabilities.add(cap);
      });
      
      strengths.uniqueTools.forEach(tool => tools.add(tool));
    });
    
    return {
      name,
      type: 'best-of-breed',
      baseAgents: agents.map(a => a.name),
      instructions: instructions.join('\n'),
      tools: Array.from(tools),
      capabilities: Array.from(capabilities),
      specialization: {
        mergeStrategy: 'best-features',
        inheritedStrengths: strengths
      }
    };
  }

  /**
   * Capabilities union merge - organize by capability domains
   */
  async capabilitiesUnionMerge(agents, config) {
    const name = config.name || 'multi-domain';
    
    // Group capabilities by domain
    const domains = new Map();
    
    agents.forEach(agent => {
      const domain = this.identifyDomain(agent);
      if (!domains.has(domain)) {
        domains.set(domain, {
          agents: [],
          capabilities: new Set(),
          tools: new Set()
        });
      }
      
      const domainData = domains.get(domain);
      domainData.agents.push(agent.name);
      agent.capabilities.forEach(cap => domainData.capabilities.add(cap));
      agent.tools.forEach(tool => domainData.tools.add(tool));
    });
    
    // Build structured instructions
    const instructions = [`# Multi-Domain Agent: ${name}

This agent operates across multiple domains with specialized capabilities in each.

## Domain Expertise`];
    
    const allTools = new Set();
    const allCapabilities = new Set();
    
    domains.forEach((data, domain) => {
      instructions.push(`\n### ${domain}`);
      instructions.push(`Inherited from: ${data.agents.join(', ')}`);
      instructions.push(`\nCapabilities:`);
      data.capabilities.forEach(cap => {
        instructions.push(`- ${cap}`);
        allCapabilities.add(cap);
      });
      
      data.tools.forEach(tool => allTools.add(tool));
    });
    
    return {
      name,
      type: 'multi-domain',
      baseAgents: agents.map(a => a.name),
      instructions: instructions.join('\n'),
      tools: Array.from(allTools),
      capabilities: Array.from(allCapabilities),
      specialization: {
        mergeStrategy: 'capabilities-union',
        domains: Array.from(domains.keys())
      }
    };
  }

  /**
   * Analyze agent strengths
   */
  analyzeStrengths(agent) {
    // Find unique or standout capabilities
    const capabilityFrequency = {};
    agent.capabilities.forEach(cap => {
      capabilityFrequency[cap] = (capabilityFrequency[cap] || 0) + 1;
    });
    
    const topCapabilities = Object.entries(capabilityFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cap]) => cap);
    
    // Find unique tools
    const uniqueTools = agent.tools.filter(tool => 
      !['github', 'desktop-commander', 'browsermcp'].includes(tool)
    );
    
    return {
      topCapabilities,
      uniqueTools,
      specialization: agent.metadata.type || 'general'
    };
  }

  /**
   * Identify agent domain
   */
  identifyDomain(agent) {
    const domainKeywords = {
      'Development': ['code', 'implement', 'develop', 'build'],
      'Testing': ['test', 'validate', 'verify', 'qa'],
      'Architecture': ['design', 'architect', 'structure', 'pattern'],
      'Analysis': ['analyze', 'research', 'investigate', 'assess'],
      'Coordination': ['coordinate', 'orchestrate', 'manage', 'organize'],
      'Security': ['security', 'secure', 'protect', 'audit'],
      'Operations': ['deploy', 'monitor', 'maintain', 'operate']
    };
    
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      const hasKeyword = keywords.some(keyword => 
        agent.name.toLowerCase().includes(keyword) ||
        agent.capabilities.some(cap => cap.toLowerCase().includes(keyword))
      );
      
      if (hasKeyword) {
        return domain;
      }
    }
    
    return 'General';
  }

  /**
   * Format constraints for instructions
   */
  formatConstraints(constraints) {
    return Object.entries(constraints)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n');
  }

  /**
   * Format personality for instructions
   */
  formatPersonality(personality) {
    const parts = [];
    
    if (personality.traits) {
      parts.push(`Traits: ${personality.traits.join(', ')}`);
    }
    
    if (personality.approach) {
      parts.push(`Approach: ${personality.approach}`);
    }
    
    if (personality.communication) {
      parts.push(`Communication style: ${personality.communication}`);
    }
    
    return parts.join('\n');
  }

  /**
   * Create adaptation pattern
   */
  createAdaptationPattern(name, template) {
    this.adaptationPatterns.set(name, { template });
  }
}

export default AgentAdapter;