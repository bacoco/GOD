import { EventEmitter } from 'events';
import crypto from 'crypto';

/**
 * Shared state for conversational sessions with version control
 */
export class SharedConversationalState {
  constructor() {
    this.version = 0;
    this.state = {};
    this.history = [];
    this.locks = new Map();
  }

  getVersion() {
    return this.version;
  }

  async applyUpdate(change) {
    // Optimistic locking - check version
    if (change.previousVersion !== this.version) {
      throw new Error(`Version conflict: expected ${this.version}, got ${change.previousVersion}`);
    }

    // Apply the update
    this.state = this.mergeState(this.state, change.updates);
    this.version = change.version;
    this.history.push(change);

    return this.state;
  }

  mergeState(current, updates) {
    // Deep merge with conflict resolution
    const merged = { ...current };
    
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        merged[key] = this.mergeState(merged[key] || {}, value);
      } else {
        merged[key] = value;
      }
    }
    
    return merged;
  }

  getHistory(fromVersion = 0) {
    return this.history.filter(change => change.version > fromVersion);
  }
}

/**
 * Manages a conversational session between gods and users
 */
export class ConversationalSession extends EventEmitter {
  constructor(sessionId = null) {
    super();
    
    this.id = sessionId || `session-${crypto.randomUUID()}`;
    this.state = new SharedConversationalState();
    this.participants = new Map(); // god name -> participation info
    this.timeline = []; // ordered events
    this.createdAt = new Date();
    this.lastActivity = new Date();
    
    // Core context structure
    this.context = {
      user: {
        request: null,
        preferences: {},
        history: []
      },
      project: {
        type: null,
        name: null,
        description: null,
        requirements: {},
        constraints: []
      },
      requirements: {
        functional: [],
        nonFunctional: [],
        userStories: []
      },
      decisions: [],
      artifacts: {
        documents: [],
        code: [],
        diagrams: []
      },
      currentPhase: null,
      nextSteps: []
    };
  }

  /**
   * Add a god as participant in the session
   */
  addParticipant(god, role = 'contributor') {
    const participantInfo = {
      name: god.name,
      role: role,
      joinedAt: new Date(),
      status: 'active',
      contributions: [],
      lastActivity: new Date()
    };
    
    this.participants.set(god.name, participantInfo);
    this.emit('participant:joined', { god: god.name, role });
    
    this.recordEvent({
      type: 'participant:joined',
      god: god.name,
      role: role
    });
  }

  /**
   * Update context with version control and broadcasting
   */
  async updateContext(godName, updates, reason) {
    const version = this.state.getVersion();
    const change = {
      version: version + 1,
      previousVersion: version,
      god: godName,
      timestamp: new Date().toISOString(),
      updates: updates,
      reason: reason
    };
    
    try {
      // Apply updates with conflict resolution
      await this.state.applyUpdate(change);
      
      // Update local context
      this.context = this.state.mergeState(this.context, updates);
      
      // Update participant activity
      const participant = this.participants.get(godName);
      if (participant) {
        participant.lastActivity = new Date();
        participant.contributions.push({
          type: 'context-update',
          reason: reason,
          timestamp: new Date()
        });
      }
      
      // Broadcast to all participating gods
      await this.broadcastStateChange(change);
      
      // Log for debugging
      this.timeline.push(change);
      this.lastActivity = new Date();
      
      this.emit('context:updated', change);
      
    } catch (error) {
      this.emit('context:update-failed', { godName, error, change });
      throw error;
    }
  }

  /**
   * Get contextualized view for specific god
   */
  getContextForGod(godName) {
    const participant = this.participants.get(godName);
    if (!participant) {
      throw new Error(`God ${godName} is not a participant in this session`);
    }
    
    const godRole = participant.role;
    
    return {
      full: this.context,
      relevant: this.filterContextByRole(godRole),
      history: this.getRelevantHistory(godName),
      nextSteps: this.suggestNextSteps(godName),
      participants: this.getParticipantSummary(),
      sessionInfo: {
        id: this.id,
        phase: this.context.currentPhase,
        duration: Date.now() - this.createdAt.getTime()
      }
    };
  }

  /**
   * Filter context based on god's role
   */
  filterContextByRole(role) {
    const roleFilters = {
      orchestrator: () => this.context, // Full access
      requirements: () => ({
        user: this.context.user,
        project: this.context.project,
        requirements: this.context.requirements
      }),
      design: () => ({
        requirements: this.context.requirements,
        userStories: this.context.requirements.userStories,
        artifacts: this.context.artifacts.diagrams
      }),
      development: () => ({
        requirements: this.context.requirements,
        project: this.context.project,
        artifacts: this.context.artifacts.code
      }),
      testing: () => ({
        requirements: this.context.requirements,
        artifacts: this.context.artifacts,
        constraints: this.context.project.constraints
      })
    };
    
    const filter = roleFilters[role] || roleFilters.orchestrator;
    return filter();
  }

  /**
   * Get relevant history for a god
   */
  getRelevantHistory(godName) {
    return this.timeline.filter(event => {
      // Include events from this god
      if (event.god === godName) return true;
      
      // Include events that affect this god
      if (event.type === 'handoff' && event.to === godName) return true;
      
      // Include major milestones
      if (event.type === 'phase:completed') return true;
      
      return false;
    });
  }

  /**
   * Suggest next steps for a god
   */
  suggestNextSteps(godName) {
    const participant = this.participants.get(godName);
    const role = participant?.role;
    
    // Role-based suggestions
    const suggestions = {
      orchestrator: [
        'Review gathered requirements',
        'Assign next specialist',
        'Validate current progress'
      ],
      requirements: [
        'Clarify user needs',
        'Document acceptance criteria',
        'Create user stories'
      ],
      design: [
        'Create UI mockups',
        'Define user flows',
        'Document design decisions'
      ],
      development: [
        'Implement core features',
        'Write unit tests',
        'Document API'
      ]
    };
    
    return suggestions[role] || ['Continue with assigned tasks'];
  }

  /**
   * Record a handoff between gods
   */
  async recordHandoff(fromGod, toGod, context) {
    const handoffEvent = {
      type: 'handoff',
      from: fromGod.name,
      to: toGod.name,
      context: context,
      timestamp: new Date(),
      sessionState: this.getSessionSummary()
    };
    
    this.timeline.push(handoffEvent);
    
    // Update participant statuses
    const fromParticipant = this.participants.get(fromGod.name);
    const toParticipant = this.participants.get(toGod.name);
    
    if (fromParticipant) {
      fromParticipant.status = 'completed';
      fromParticipant.contributions.push({
        type: 'handoff:initiated',
        to: toGod.name,
        timestamp: new Date()
      });
    }
    
    if (!toParticipant) {
      this.addParticipant(toGod, context.role || 'contributor');
    } else {
      toParticipant.status = 'active';
    }
    
    this.emit('handoff:recorded', handoffEvent);
  }

  /**
   * Broadcast state changes to all participants
   */
  async broadcastStateChange(change) {
    const activeParticipants = Array.from(this.participants.entries())
      .filter(([_, info]) => info.status === 'active')
      .map(([name, _]) => name);
    
    this.emit('state:broadcast', {
      change,
      recipients: activeParticipants
    });
  }

  /**
   * Get summary of participants
   */
  getParticipantSummary() {
    const summary = [];
    
    for (const [name, info] of this.participants.entries()) {
      summary.push({
        name: name,
        role: info.role,
        status: info.status,
        contributionCount: info.contributions.length,
        duration: info.lastActivity - info.joinedAt
      });
    }
    
    return summary;
  }

  /**
   * Get session summary
   */
  getSessionSummary() {
    return {
      id: this.id,
      duration: Date.now() - this.createdAt.getTime(),
      participantCount: this.participants.size,
      eventCount: this.timeline.length,
      currentPhase: this.context.currentPhase,
      completedPhases: this.getCompletedPhases(),
      artifactCount: this.countArtifacts()
    };
  }

  /**
   * Get completed phases
   */
  getCompletedPhases() {
    return this.timeline
      .filter(event => event.type === 'phase:completed')
      .map(event => event.phase);
  }

  /**
   * Count artifacts
   */
  countArtifacts() {
    return Object.values(this.context.artifacts)
      .reduce((total, artifacts) => total + artifacts.length, 0);
  }

  /**
   * Record generic event
   */
  recordEvent(event) {
    const timestampedEvent = {
      ...event,
      timestamp: new Date(),
      sessionId: this.id
    };
    
    this.timeline.push(timestampedEvent);
    this.lastActivity = new Date();
    
    this.emit('event:recorded', timestampedEvent);
  }

  /**
   * Get current speaker
   */
  getCurrentSpeaker() {
    const activeParticipants = Array.from(this.participants.entries())
      .filter(([_, info]) => info.status === 'active')
      .sort((a, b) => b[1].lastActivity - a[1].lastActivity);
    
    return activeParticipants[0]?.[0] || null;
  }

  /**
   * Get progress percentage
   */
  getProgressPercentage() {
    const phases = ['understanding', 'requirements', 'design', 'planning', 'implementation'];
    const currentIndex = phases.indexOf(this.context.currentPhase) + 1;
    return Math.round((currentIndex / phases.length) * 100);
  }

  /**
   * Get upcoming gods based on phase
   */
  getUpcomingGods() {
    const phaseGods = {
      understanding: ['zeus'],
      requirements: ['prometheus', 'athena'],
      design: ['apollo', 'daedalus'],
      planning: ['daedalus', 'hermes'],
      implementation: ['hephaestus', 'themis']
    };
    
    return phaseGods[this.context.currentPhase] || [];
  }

  /**
   * Generate artifacts summary
   */
  async generateArtifacts(options = {}) {
    const artifacts = {
      conversationLog: this.timeline,
      decisions: this.context.decisions,
      requirements: this.context.requirements,
      artifacts: this.context.artifacts
    };
    
    if (options.includeDecisionLog) {
      artifacts.decisionLog = this.timeline
        .filter(event => event.type === 'decision:made')
        .map(event => ({
          decision: event.decision,
          rationale: event.rationale,
          madeBy: event.god,
          timestamp: event.timestamp
        }));
    }
    
    if (options.includeConversationSummary) {
      artifacts.summary = this.generateConversationSummary();
    }
    
    if (options.linkToSource) {
      artifacts.sourceLinks = this.generateSourceLinks();
    }
    
    return artifacts;
  }

  /**
   * Generate conversation summary
   */
  generateConversationSummary() {
    return {
      duration: Date.now() - this.createdAt.getTime(),
      participants: this.getParticipantSummary(),
      phasesCompleted: this.getCompletedPhases(),
      keyDecisions: this.context.decisions.slice(0, 5),
      mainArtifacts: this.getMainArtifacts()
    };
  }

  /**
   * Get main artifacts
   */
  getMainArtifacts() {
    const main = [];
    
    if (this.context.artifacts.documents.length > 0) {
      main.push({
        type: 'documents',
        count: this.context.artifacts.documents.length,
        items: this.context.artifacts.documents.slice(0, 3)
      });
    }
    
    if (this.context.artifacts.code.length > 0) {
      main.push({
        type: 'code',
        count: this.context.artifacts.code.length,
        items: this.context.artifacts.code.slice(0, 3)
      });
    }
    
    return main;
  }

  /**
   * Generate source links for requirements
   */
  generateSourceLinks() {
    const links = new Map();
    
    // Link each requirement to its source in the timeline
    for (const req of this.context.requirements.functional) {
      const source = this.timeline.find(event => 
        event.updates?.requirements?.functional?.includes(req)
      );
      
      if (source) {
        links.set(req.id || req, {
          god: source.god,
          timestamp: source.timestamp,
          reason: source.reason
        });
      }
    }
    
    return Object.fromEntries(links);
  }

  /**
   * Get debug report for session
   */
  async getDebugReport() {
    return {
      sessionId: this.id,
      stateVersion: this.state.getVersion(),
      participantCount: this.participants.size,
      eventCount: this.timeline.length,
      duration: Date.now() - this.createdAt.getTime(),
      memoryUsage: process.memoryUsage(),
      recentEvents: this.timeline.slice(-10),
      stateSize: JSON.stringify(this.context).length,
      errors: this.timeline.filter(e => e.type === 'error')
    };
  }
}