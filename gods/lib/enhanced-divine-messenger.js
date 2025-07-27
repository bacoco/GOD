import { DivineMessenger } from './divine-messenger.js';
import { ConversationalSession } from './conversational/conversational-session.js';
import { SessionStore } from './conversational/session-store.js';
import crypto from 'crypto';

/**
 * Enhanced Divine Messenger with conversational session support
 */
export class EnhancedDivineMessenger extends DivineMessenger {
  constructor(pantheon) {
    super(pantheon);
    
    this.sessions = new Map(); // Active sessions in memory
    this.sessionStore = new SessionStore({
      storePath: pantheon.config?.sessionStorePath
    });
    this.conversationHandlers = new Map(); // God-specific conversation handlers
  }

  /**
   * Initialize with session support
   */
  async initialize() {
    await super.initialize();
    
    // Initialize session store
    await this.sessionStore.initialize();
    
    // Load active sessions
    const activeSessions = await this.sessionStore.listSessions({ sortBy: 'recent' });
    for (const sessionSummary of activeSessions) {
      const session = await this.sessionStore.loadSession(sessionSummary.id);
      if (session) {
        this.sessions.set(session.id, session);
      }
    }
    
    this.emit('messenger:sessions-loaded', { count: this.sessions.size });
  }

  /**
   * Start a new conversational session
   */
  async startConversationalSession(initiatorGod, topic, initialContext = {}) {
    // Create new session
    const session = await this.sessionStore.createSession({
      user: {
        request: topic,
        timestamp: new Date()
      },
      project: {
        initiatedBy: initiatorGod.name
      },
      ...initialContext
    });
    
    // Add initiator as first participant
    session.addParticipant(initiatorGod, 'orchestrator');
    
    // Store in active sessions
    this.sessions.set(session.id, session);
    
    // Set up session event handlers
    this.setupSessionHandlers(session);
    
    // Notify all gods about new session
    await this.broadcast({
      type: 'session:started',
      sessionId: session.id,
      topic: topic,
      initiator: initiatorGod.name,
      timestamp: new Date()
    });
    
    this.emit('session:started', {
      sessionId: session.id,
      initiator: initiatorGod.name,
      topic: topic
    });
    
    return session;
  }

  /**
   * Handle conversational handoff between gods
   */
  async handoffConversation(fromGod, toGod, session, context) {
    if (!session || !this.sessions.has(session.id)) {
      throw new Error(`Invalid session: ${session?.id}`);
    }
    
    // Record handoff in session
    await session.recordHandoff(fromGod, toGod, context);
    
    // Generate handoff introduction
    const introduction = this.generateHandoffIntroduction(fromGod, toGod, context);
    
    // Create structured handoff message
    const handoffMessage = {
      type: 'conversation:handoff',
      sessionId: session.id,
      context: session.getContextForGod(toGod.name),
      handoffContext: context,
      userAware: true,
      introduction: introduction,
      continuity: {
        previousGod: fromGod.name,
        previousPhase: context.phase,
        completedWork: context.completedWork
      }
    };
    
    // Send handoff message with high priority
    await this.send(fromGod.name, toGod.name, handoffMessage, {
      priority: 'high',
      requiresResponse: true,
      metadata: {
        sessionId: session.id,
        handoffType: 'conversational'
      }
    });
    
    // Update session store
    await this.sessionStore.saveSession(session);
    
    this.emit('conversation:handoff', {
      from: fromGod.name,
      to: toGod.name,
      sessionId: session.id,
      context: context.reason
    });
  }

  /**
   * Generate natural handoff introduction
   */
  generateHandoffIntroduction(fromGod, toGod, context) {
    const templates = {
      'zeus->prometheus': {
        farewell: "I've gathered the high-level understanding of your project.",
        introduction: "Prometheus will now help you define the specific features and requirements."
      },
      'prometheus->apollo': {
        farewell: "The product requirements are well defined.",
        introduction: "Apollo will help design the user experience for these features."
      },
      'apollo->daedalus': {
        farewell: "The user experience design is complete.",
        introduction: "Daedalus will architect the technical implementation."
      },
      'daedalus->hephaestus': {
        farewell: "The technical architecture is ready.",
        introduction: "Hephaestus will begin the implementation."
      },
      default: {
        farewell: "I've completed my part of the planning.",
        introduction: `will continue helping with ${context.reason || 'the next phase'}.`
      }
    };
    
    const template = templates[`${fromGod.name}->${toGod.name}`] || templates.default;
    
    return {
      farewell: `[${fromGod.name}]: ${template.farewell} ${template.introduction}`,
      greeting: `[${toGod.name}]: Thank you, ${fromGod.name}. ${this.getGodGreeting(toGod.name, context)}`,
      visual: {
        type: 'god-transition',
        from: fromGod.name,
        to: toGod.name
      }
    };
  }

  /**
   * Get god-specific greeting
   */
  getGodGreeting(godName, context) {
    const greetings = {
      zeus: "Let me understand the big picture of what you're building.",
      prometheus: "I'll help you define clear product requirements and user stories.",
      apollo: "Let's create an exceptional user experience together.",
      daedalus: "I'll design a robust architecture for your system.",
      hephaestus: "Time to bring your vision to life with code.",
      themis: "I'll ensure everything works perfectly with comprehensive testing.",
      athena: "Let me help you validate and refine these requirements.",
      hermes: "I'll coordinate the team's efforts efficiently.",
      aegis: "Security is paramount. Let me review the security aspects."
    };
    
    const greeting = greetings[godName] || "I'm here to help with the next phase.";
    
    // Add context-specific continuation
    if (context.continuity) {
      return `${greeting} ${context.continuity}`;
    }
    
    return greeting;
  }

  /**
   * Broadcast to session participants
   */
  async broadcastToSession(sessionId, message, excludeGod = null) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    const participants = Array.from(session.participants.keys())
      .filter(name => name !== excludeGod);
    
    for (const godName of participants) {
      const god = this.gods.get(godName);
      if (god) {
        await this.send('system', godName, {
          ...message,
          sessionId: sessionId
        });
      }
    }
  }

  /**
   * Get session by ID
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  /**
   * End a conversational session
   */
  async endSession(sessionId, summary = {}) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    // Notify all participants
    await this.broadcastToSession(sessionId, {
      type: 'session:ending',
      summary: summary
    });
    
    // Archive session
    await this.sessionStore.archiveSession(sessionId);
    
    // Remove from active sessions
    this.sessions.delete(sessionId);
    
    // Emit event
    session.emit('session:ended');
    
    this.emit('session:ended', {
      sessionId: sessionId,
      duration: Date.now() - session.createdAt.getTime(),
      summary: summary
    });
  }

  /**
   * Set up session event handlers
   */
  setupSessionHandlers(session) {
    // Broadcast state changes to participants
    session.on('context:updated', async (change) => {
      await this.broadcastToSession(session.id, {
        type: 'context:updated',
        change: change
      }, change.god);
    });
    
    // Handle participant changes
    session.on('participant:joined', async (data) => {
      await this.broadcastToSession(session.id, {
        type: 'participant:joined',
        god: data.god,
        role: data.role
      }, data.god);
    });
    
    // Auto-save on important events
    session.on('handoff:recorded', async () => {
      await this.sessionStore.saveSession(session);
    });
  }

  /**
   * Register god-specific conversation handler
   */
  registerConversationHandler(godName, handler) {
    this.conversationHandlers.set(godName, handler);
  }

  /**
   * Process incoming conversational message
   */
  async processConversationalMessage(message) {
    const { sessionId, from, to, content } = message;
    
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    // Get target god
    const targetGod = this.gods.get(to);
    if (!targetGod) {
      throw new Error(`God ${to} not found`);
    }
    
    // Check if god has custom handler
    const handler = this.conversationHandlers.get(to);
    if (handler) {
      return await handler(message, session, targetGod);
    }
    
    // Default handling - create conversational response
    if (targetGod.handleConversation) {
      return await targetGod.handleConversation(message, session);
    }
    
    // Fallback to standard message handling
    return await this.send(from, to, content, message.options);
  }

  /**
   * Get active sessions summary
   */
  getActiveSessionsSummary() {
    const summary = [];
    
    for (const [id, session] of this.sessions.entries()) {
      summary.push({
        id: id,
        topic: session.context.user.request,
        phase: session.context.currentPhase,
        participants: session.getParticipantSummary(),
        progress: session.getProgressPercentage(),
        duration: Date.now() - session.createdAt.getTime()
      });
    }
    
    return summary;
  }

  /**
   * Find sessions by criteria
   */
  async findSessions(criteria) {
    // Check active sessions first
    const results = [];
    
    for (const session of this.sessions.values()) {
      if (this.sessionMatchesCriteria(session, criteria)) {
        results.push(session);
      }
    }
    
    // Also check persistent store
    const storedSessions = await this.sessionStore.findSessions(criteria);
    
    return [...results, ...storedSessions];
  }

  /**
   * Check if session matches criteria
   */
  sessionMatchesCriteria(session, criteria) {
    if (criteria.god && !session.participants.has(criteria.god)) {
      return false;
    }
    
    if (criteria.phase && session.context.currentPhase !== criteria.phase) {
      return false;
    }
    
    if (criteria.topic) {
      const topic = session.context.user.request?.toLowerCase() || '';
      if (!topic.includes(criteria.topic.toLowerCase())) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return `session-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Clean up old sessions
   */
  async cleanup() {
    // Clean up inactive sessions
    const now = Date.now();
    const maxInactiveTime = 3600000; // 1 hour
    
    for (const [id, session] of this.sessions.entries()) {
      const inactiveTime = now - session.lastActivity.getTime();
      if (inactiveTime > maxInactiveTime) {
        await this.endSession(id, { reason: 'inactivity' });
      }
    }
    
    // Run store cleanup
    await this.sessionStore.cleanup();
    
    this.emit('cleanup:completed', {
      activeSessions: this.sessions.size
    });
  }
}