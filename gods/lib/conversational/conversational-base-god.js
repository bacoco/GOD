import { BaseGod } from '../base-god.js';
import { ConversationalAgentFactory } from './conversational-agent-factory.js';
import { ConversationalUX } from './conversational-ux.js';

/**
 * Extends BaseGod with conversational capabilities
 */
export class ConversationalBaseGod extends BaseGod {
  constructor(options = {}) {
    super(options);
    
    // Conversational components
    this.conversationalFactory = new ConversationalAgentFactory({
      debugLogger: options.debugLogger
    });
    
    this.conversationalUX = options.ux || new ConversationalUX();
    
    // Conversational style configuration
    this.conversationalStyle = this.config.conversationalStyle || this.getDefaultConversationalStyle();
    
    // Track active conversations
    this.activeConversations = new Map();
  }

  /**
   * Initialize with conversational capabilities
   */
  async initialize() {
    await super.initialize();
    
    // Initialize conversational UX if not already done
    if (!this.conversationalUX.initialized) {
      await this.conversationalUX.initialize();
    }
    
    // Load persona
    this.persona = this.conversationalUX.getPersona(this.name);
    
    this.emit('god:conversational-ready', { name: this.name });
  }

  /**
   * Start a conversation about a topic
   */
  async startConversation(topic, config = {}) {
    const session = config.session || await this.createConversationalSession(topic);
    
    // Create specialized conversational agent
    const conversationSpec = {
      baseAgent: config.baseAgent || this.getDefaultConversationalAgent(),
      adaptations: {
        focus: 'Natural conversation and requirement gathering',
        tools: this.getConversationalTools(),
        context: { 
          topic, 
          godRole: this.name,
          persona: this.persona
        },
        personality: this.conversationalStyle.personality,
        conversationalPatterns: this.conversationalStyle.patterns,
        ...config.adaptations
      }
    };
    
    try {
      // Create conversational agent
      const agent = await this.conversationalFactory.createConversationalAgent(
        this,
        `conversation-${topic}`,
        conversationSpec
      );
      
      // Track active conversation
      this.activeConversations.set(session.id, {
        agent,
        session,
        startTime: new Date()
      });
      
      // Start the conversation
      const result = await agent.startConversation(topic, session);
      
      // Update session with initial context
      await session.updateContext(this.name, {
        conversationStarted: true,
        initialTopic: topic,
        agent: agent.spec.id
      }, 'Conversation initialized');
      
      this.emit('conversation:started', {
        god: this.name,
        sessionId: session.id,
        topic
      });
      
      return {
        session,
        agent,
        initialResponse: result
      };
      
    } catch (error) {
      this.emit('conversation:failed', {
        god: this.name,
        topic,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Continue an existing conversation
   */
  async continueConversation(session) {
    const conversation = this.activeConversations.get(session.id);
    if (!conversation) {
      // Create new agent for existing session
      const agent = await this.createConversationalAgentForSession(session);
      conversation = {
        agent,
        session,
        startTime: new Date()
      };
      this.activeConversations.set(session.id, conversation);
    }
    
    return await conversation.agent.continueConversation(session);
  }

  /**
   * Handle incoming conversational message
   */
  async handleConversation(message, session) {
    const { content, from } = message;
    
    // Get or create conversational agent
    let conversation = this.activeConversations.get(session.id);
    if (!conversation) {
      const agent = await this.createConversationalAgentForSession(session);
      conversation = {
        agent,
        session,
        startTime: new Date()
      };
      this.activeConversations.set(session.id, conversation);
    }
    
    // Process the message
    const response = await conversation.agent.execute({
      action: 'respond',
      message: content,
      from: from,
      context: session.getContextForGod(this.name)
    });
    
    // Update session context if needed
    if (response.contextUpdates) {
      await session.updateContext(this.name, response.contextUpdates, 'Conversation progress');
    }
    
    return response;
  }

  /**
   * Generate documentation from conversation
   */
  async generateDocumentation(type, context) {
    // Load appropriate template
    const template = await this.loadDocumentationTemplate(type);
    
    // Create specialized documentation agent
    const docAgent = await this.createSubAgent(`${type}-generator`, {
      baseAgent: 'docs-writer',
      adaptations: {
        templates: template,
        focus: `Generate ${type} documentation`,
        format: context.format || 'markdown',
        style: this.getDocumentationStyle(type)
      }
    });
    
    // Generate the documentation
    const result = await docAgent.execute({ 
      task: 'generate', 
      type,
      context 
    });
    
    this.emit('documentation:generated', {
      god: this.name,
      type,
      size: result.content?.length
    });
    
    return result;
  }

  /**
   * Create conversational session
   */
  async createConversationalSession(topic) {
    if (!this.messenger || !this.messenger.startConversationalSession) {
      throw new Error('Enhanced messenger required for conversations');
    }
    
    return await this.messenger.startConversationalSession(this, topic);
  }

  /**
   * Create conversational agent for existing session
   */
  async createConversationalAgentForSession(session) {
    const context = session.getContextForGod(this.name);
    
    return await this.conversationalFactory.createConversationalAgent(
      this,
      `session-${session.id}`,
      {
        baseAgent: this.getDefaultConversationalAgent(),
        adaptations: {
          focus: 'Continue existing conversation',
          context: context,
          personality: this.conversationalStyle.personality
        }
      }
    );
  }

  /**
   * Get default conversational style
   */
  getDefaultConversationalStyle() {
    const styles = {
      zeus: {
        personality: {
          traits: ['authoritative', 'strategic', 'supportive'],
          tone: 'confident and guiding',
          approach: 'big-picture understanding'
        },
        patterns: {
          greeting: 'dynamic', // Use persona greeting
          questions: 'exploratory',
          transitions: 'smooth'
        }
      },
      prometheus: {
        personality: {
          traits: ['analytical', 'thorough', 'user-focused'],
          tone: 'thoughtful and probing',
          approach: 'requirements discovery'
        },
        patterns: {
          greeting: 'warm',
          questions: 'specific',
          transitions: 'logical'
        }
      },
      apollo: {
        personality: {
          traits: ['creative', 'empathetic', 'aesthetic'],
          tone: 'inspiring and collaborative',
          approach: 'user experience exploration'
        },
        patterns: {
          greeting: 'enthusiastic',
          questions: 'experiential',
          transitions: 'visual'
        }
      },
      daedalus: {
        personality: {
          traits: ['systematic', 'precise', 'innovative'],
          tone: 'technical but accessible',
          approach: 'architectural thinking'
        },
        patterns: {
          greeting: 'professional',
          questions: 'technical',
          transitions: 'structured'
        }
      },
      hephaestus: {
        personality: {
          traits: ['practical', 'efficient', 'helpful'],
          tone: 'direct and friendly',
          approach: 'pragmatic solutions'
        },
        patterns: {
          greeting: 'casual',
          questions: 'implementation-focused',
          transitions: 'action-oriented'
        }
      }
    };
    
    return styles[this.name] || {
      personality: {
        traits: ['helpful', 'professional'],
        tone: 'friendly and supportive',
        approach: 'general assistance'
      },
      patterns: {
        greeting: 'standard',
        questions: 'clarifying',
        transitions: 'simple'
      }
    };
  }

  /**
   * Get default conversational agent type
   */
  getDefaultConversationalAgent() {
    const defaults = {
      zeus: 'orchestrator',
      prometheus: 'product-manager',
      apollo: 'ux-designer',
      daedalus: 'architect',
      hephaestus: 'coder',
      athena: 'analyst',
      themis: 'tester',
      hermes: 'coordinator',
      aegis: 'security-manager'
    };
    
    return defaults[this.name] || 'analyst';
  }

  /**
   * Get conversational tools
   */
  getConversationalTools() {
    const baseTools = ['interactive-flow', 'session-state'];
    
    // Add god-specific tools
    const godTools = {
      prometheus: ['generate-prp', 'requirement-parser'],
      apollo: ['ui-design', 'journey-mapper'],
      daedalus: ['architecture-diagram', 'tech-spec'],
      hephaestus: ['code-generator', 'test-generator']
    };
    
    return [...baseTools, ...(godTools[this.name] || [])];
  }

  /**
   * Load documentation template
   */
  async loadDocumentationTemplate(type) {
    const templatePath = `gods/resources/conversational/templates/${type}-template.md`;
    
    try {
      // In a real implementation, this would load from file system
      // For now, return a placeholder
      return {
        path: templatePath,
        type: type,
        sections: this.getDefaultDocumentSections(type)
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get default document sections
   */
  getDefaultDocumentSections(type) {
    const sections = {
      'PRD': ['Overview', 'Requirements', 'User Stories', 'Success Metrics'],
      'tech-spec': ['Architecture', 'Components', 'APIs', 'Security'],
      'user-journey': ['Personas', 'Scenarios', 'Flow', 'Touchpoints'],
      'test-plan': ['Scope', 'Test Cases', 'Automation', 'Metrics']
    };
    
    return sections[type] || ['Introduction', 'Content', 'Conclusion'];
  }

  /**
   * Get documentation style
   */
  getDocumentationStyle(type) {
    const styles = {
      'PRD': 'clear and comprehensive',
      'tech-spec': 'detailed and technical',
      'user-journey': 'narrative and visual',
      'test-plan': 'systematic and thorough'
    };
    
    return styles[type] || 'professional and complete';
  }

  /**
   * Handoff conversation to another god
   */
  async handoffConversation(toGod, session, reason) {
    const conversation = this.activeConversations.get(session.id);
    if (!conversation) {
      throw new Error('No active conversation to hand off');
    }
    
    // Prepare handoff context
    const handoffContext = {
      phase: session.context.currentPhase,
      completedWork: this.summarizeWork(session),
      reason: reason,
      continuity: this.getContinuityMessage(toGod, session)
    };
    
    // Use enhanced messenger for handoff
    await this.messenger.handoffConversation(this, toGod, session, handoffContext);
    
    // Clean up local conversation
    this.activeConversations.delete(session.id);
    
    this.emit('conversation:handed-off', {
      from: this.name,
      to: toGod.name,
      sessionId: session.id,
      reason
    });
  }

  /**
   * Summarize work done in session
   */
  summarizeWork(session) {
    const myContributions = session.timeline
      .filter(event => event.god === this.name)
      .map(event => event.reason || event.type);
    
    return {
      contributionCount: myContributions.length,
      mainContributions: myContributions.slice(0, 3),
      artifacts: this.getMyArtifacts(session)
    };
  }

  /**
   * Get artifacts created by this god
   */
  getMyArtifacts(session) {
    // Filter artifacts created by this god
    const artifacts = [];
    
    for (const [type, items] of Object.entries(session.context.artifacts)) {
      const myItems = items.filter(item => item.createdBy === this.name);
      if (myItems.length > 0) {
        artifacts.push({ type, count: myItems.length });
      }
    }
    
    return artifacts;
  }

  /**
   * Get continuity message for handoff
   */
  getContinuityMessage(toGod, session) {
    const messages = {
      'zeus->prometheus': "the project vision we've outlined",
      'prometheus->apollo': "the requirements and user stories we've defined",
      'apollo->daedalus': "the user experience we've designed",
      'daedalus->hephaestus': "the architecture we've planned",
      'hephaestus->themis': "the code I've implemented"
    };
    
    const key = `${this.name}->${toGod.name}`;
    return messages[key] || "what we've accomplished so far";
  }

  /**
   * End conversation
   */
  async endConversation(sessionId, summary = {}) {
    const conversation = this.activeConversations.get(sessionId);
    if (!conversation) return;
    
    // Clean up agent
    if (conversation.agent.cleanup) {
      await conversation.agent.cleanup();
    }
    
    // Remove from active conversations
    this.activeConversations.delete(sessionId);
    
    this.emit('conversation:ended', {
      god: this.name,
      sessionId,
      duration: Date.now() - conversation.startTime.getTime(),
      summary
    });
  }

  /**
   * Get conversation statistics
   */
  getConversationStats() {
    return {
      activeConversations: this.activeConversations.size,
      totalConversations: this.metrics.conversationsStarted || 0,
      averageDuration: this.metrics.averageConversationDuration || 0
    };
  }
}