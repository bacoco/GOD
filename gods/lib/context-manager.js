/**
 * Context Manager
 * Bridges conversation context with agent execution context
 */

import { EventEmitter } from 'events';

export class ContextManager extends EventEmitter {
  constructor(pantheon) {
    super();
    this.pantheon = pantheon;
    
    // Context storage
    this.conversationContext = new Map(); // sessionId -> conversation data
    this.agentContext = new Map(); // agentId -> agent context
    this.sharedContext = new Map(); // Global shared context
    
    // Context mappings
    this.sessionToAgents = new Map(); // sessionId -> Set of agentIds
    this.agentToSession = new Map(); // agentId -> sessionId
  }

  /**
   * Create context from conversation data
   * @param {string} sessionId - Conversation session ID
   * @param {Object} conversationData - Data from conversation
   * @returns {Object} Structured context
   */
  createContextFromConversation(sessionId, conversationData) {
    const context = {
      sessionId,
      timestamp: Date.now(),
      project: {
        idea: conversationData.discovery?.projectIdea || '',
        name: conversationData.projectName || 'unnamed-project',
        users: conversationData.discovery?.users || '',
        coreFeature: conversationData.discovery?.core_feature || '',
        experience: conversationData.discovery?.experience || ''
      },
      requirements: {
        features: this.parseFeatures(conversationData.plan),
        design: this.parseDesign(conversationData.design),
        technical: this.parseTechnical(conversationData)
      },
      decisions: [],
      artifacts: []
    };
    
    // Store the context
    this.conversationContext.set(sessionId, context);
    
    this.emit('context:created', { sessionId, context });
    
    return context;
  }

  /**
   * Get context for an agent
   * @param {string} agentId - Agent ID
   * @returns {Object} Agent context
   */
  getAgentContext(agentId) {
    // Get agent's specific context
    const agentCtx = this.agentContext.get(agentId) || {};
    
    // Get session context if linked
    const sessionId = this.agentToSession.get(agentId);
    const sessionCtx = sessionId ? this.conversationContext.get(sessionId) : {};
    
    // Merge contexts
    return {
      ...this.sharedContext.get('global') || {},
      ...sessionCtx,
      ...agentCtx,
      agentId,
      sessionId
    };
  }

  /**
   * Update agent context
   * @param {string} agentId - Agent ID
   * @param {Object} updates - Context updates
   */
  updateAgentContext(agentId, updates) {
    const current = this.agentContext.get(agentId) || {};
    const updated = { ...current, ...updates, lastUpdated: Date.now() };
    
    this.agentContext.set(agentId, updated);
    
    this.emit('context:updated', { agentId, updates });
  }

  /**
   * Link agent to session
   * @param {string} agentId - Agent ID
   * @param {string} sessionId - Session ID
   */
  linkAgentToSession(agentId, sessionId) {
    // Track bidirectional mapping
    this.agentToSession.set(agentId, sessionId);
    
    if (!this.sessionToAgents.has(sessionId)) {
      this.sessionToAgents.set(sessionId, new Set());
    }
    this.sessionToAgents.get(sessionId).add(agentId);
    
    this.emit('context:linked', { agentId, sessionId });
  }

  /**
   * Share context between agents
   * @param {string} fromAgentId - Source agent
   * @param {string} toAgentId - Target agent
   * @param {Object} data - Data to share
   */
  shareContext(fromAgentId, toAgentId, data) {
    const sharedData = {
      from: fromAgentId,
      to: toAgentId,
      data,
      timestamp: Date.now()
    };
    
    // Update target agent's context
    const targetContext = this.agentContext.get(toAgentId) || {};
    targetContext.sharedContext = targetContext.sharedContext || [];
    targetContext.sharedContext.push(sharedData);
    
    this.agentContext.set(toAgentId, targetContext);
    
    this.emit('context:shared', sharedData);
  }

  /**
   * Broadcast context to all agents in a session
   * @param {string} sessionId - Session ID
   * @param {Object} data - Data to broadcast
   */
  broadcastToSession(sessionId, data) {
    const agents = this.sessionToAgents.get(sessionId);
    if (!agents) return;
    
    for (const agentId of agents) {
      this.updateAgentContext(agentId, { broadcast: data });
    }
    
    this.emit('context:broadcast', { sessionId, data, agentCount: agents.size });
  }

  /**
   * Store decision made by an agent
   * @param {string} agentId - Agent ID
   * @param {Object} decision - Decision data
   */
  storeDecision(agentId, decision) {
    const sessionId = this.agentToSession.get(agentId);
    if (!sessionId) return;
    
    const context = this.conversationContext.get(sessionId);
    if (!context) return;
    
    context.decisions.push({
      agentId,
      decision,
      timestamp: Date.now()
    });
    
    this.emit('decision:stored', { sessionId, agentId, decision });
  }

  /**
   * Store artifact created by an agent
   * @param {string} agentId - Agent ID
   * @param {Object} artifact - Artifact data
   */
  storeArtifact(agentId, artifact) {
    const sessionId = this.agentToSession.get(agentId);
    if (!sessionId) return;
    
    const context = this.conversationContext.get(sessionId);
    if (!context) return;
    
    context.artifacts.push({
      agentId,
      artifact,
      timestamp: Date.now()
    });
    
    this.emit('artifact:stored', { sessionId, agentId, artifact });
  }

  /**
   * Get all artifacts for a session
   * @param {string} sessionId - Session ID
   * @returns {Array} Artifacts
   */
  getSessionArtifacts(sessionId) {
    const context = this.conversationContext.get(sessionId);
    return context ? context.artifacts : [];
  }

  /**
   * Get all decisions for a session
   * @param {string} sessionId - Session ID
   * @returns {Array} Decisions
   */
  getSessionDecisions(sessionId) {
    const context = this.conversationContext.get(sessionId);
    return context ? context.decisions : [];
  }

  /**
   * Parse features from plan data
   * @param {Object} plan - Plan data
   * @returns {Array} Parsed features
   */
  parseFeatures(plan) {
    if (!plan) return [];
    
    const features = [];
    
    if (plan.mvp_features) {
      const mvpList = plan.mvp_features.split(',').map(f => f.trim());
      features.push(...mvpList.map(f => ({ name: f, priority: 'high', type: 'mvp' })));
    }
    
    if (plan.future_features) {
      const futureList = plan.future_features.split(',').map(f => f.trim());
      features.push(...futureList.map(f => ({ name: f, priority: 'medium', type: 'future' })));
    }
    
    return features;
  }

  /**
   * Parse design from design data
   * @param {Object} design - Design data
   * @returns {Object} Parsed design
   */
  parseDesign(design) {
    if (!design) return {};
    
    return {
      style: design.visual_style || '',
      primaryColor: design.primary_color || '',
      userFlow: design.user_flow || '',
      keyScreens: design.key_screens ? design.key_screens.split(',').map(s => s.trim()) : []
    };
  }

  /**
   * Parse technical requirements
   * @param {Object} data - Conversation data
   * @returns {Object} Technical requirements
   */
  parseTechnical(data) {
    return {
      platform: data.platform || 'web',
      stack: data.tech_stack || 'modern',
      database: data.database || 'auto',
      authentication: data.auth_required || false,
      realtime: data.realtime_features || false,
      scaling: data.scaling_needs || 'standard'
    };
  }

  /**
   * Create agent instructions with context
   * @param {string} agentId - Agent ID
   * @param {string} baseInstructions - Base instructions
   * @returns {string} Enhanced instructions
   */
  createContextualInstructions(agentId, baseInstructions) {
    const context = this.getAgentContext(agentId);
    
    const sections = [baseInstructions];
    
    if (context.project) {
      sections.push(`\nProject Context:
- Idea: ${context.project.idea}
- Target Users: ${context.project.users}
- Core Feature: ${context.project.coreFeature}
- Desired Experience: ${context.project.experience}`);
    }
    
    if (context.requirements?.features?.length > 0) {
      sections.push(`\nFeatures to Implement:
${context.requirements.features.map(f => `- ${f.name} (${f.priority})`).join('\n')}`);
    }
    
    if (context.requirements?.design?.style) {
      sections.push(`\nDesign Requirements:
- Style: ${context.requirements.design.style}
- Primary Color: ${context.requirements.design.primaryColor || 'Not specified'}`);
    }
    
    if (context.decisions?.length > 0) {
      sections.push(`\nPrevious Decisions:
${context.decisions.slice(-5).map(d => `- ${d.decision.type}: ${d.decision.description}`).join('\n')}`);
    }
    
    return sections.join('\n');
  }

  /**
   * Persist context to storage
   * @param {string} sessionId - Session ID
   */
  async persistContext(sessionId) {
    const context = this.conversationContext.get(sessionId);
    if (!context) return;
    
    // Store in Claude-Flow memory if available
    if (this.pantheon.useClaudeFlow) {
      await this.pantheon.accessMemory(`context:${sessionId}`, context);
    }
    
    this.emit('context:persisted', { sessionId });
  }

  /**
   * Load context from storage
   * @param {string} sessionId - Session ID
   * @returns {Object} Loaded context
   */
  async loadContext(sessionId) {
    // Try to load from Claude-Flow memory
    if (this.pantheon.useClaudeFlow) {
      const stored = await this.pantheon.accessMemory(`context:${sessionId}`);
      if (stored) {
        this.conversationContext.set(sessionId, stored);
        this.emit('context:loaded', { sessionId });
        return stored;
      }
    }
    
    return null;
  }

  /**
   * Clear context for a session
   * @param {string} sessionId - Session ID
   */
  clearSessionContext(sessionId) {
    // Remove conversation context
    this.conversationContext.delete(sessionId);
    
    // Remove all linked agent contexts
    const agents = this.sessionToAgents.get(sessionId);
    if (agents) {
      for (const agentId of agents) {
        this.agentContext.delete(agentId);
        this.agentToSession.delete(agentId);
      }
    }
    
    this.sessionToAgents.delete(sessionId);
    
    this.emit('context:cleared', { sessionId });
  }

  /**
   * Get summary of all active contexts
   * @returns {Object} Context summary
   */
  getContextSummary() {
    return {
      sessions: this.conversationContext.size,
      agents: this.agentContext.size,
      mappings: {
        sessionToAgents: this.sessionToAgents.size,
        agentToSession: this.agentToSession.size
      },
      shared: this.sharedContext.size
    };
  }
}

export default ContextManager;