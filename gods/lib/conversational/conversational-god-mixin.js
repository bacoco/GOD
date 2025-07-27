/**
 * Mixin to add conversational capabilities to existing god classes
 * Can be applied to any god to enable conversations
 */
export const ConversationalGodMixin = {
  /**
   * Initialize conversational capabilities
   */
  async initializeConversational(ux, factory) {
    this.conversationalUX = ux;
    this.conversationalFactory = factory;
    this.activeConversations = new Map();
    this.conversationalStyle = this.config.conversationalStyle || this.getDefaultConversationalStyle();
    this.persona = this.conversationalUX.getPersona(this.name);
  },

  /**
   * Core conversational methods
   */
  async startConversation(topic, config = {}) {
    return ConversationalGodMixin._startConversation.call(this, topic, config);
  },

  async continueConversation(session) {
    return ConversationalGodMixin._continueConversation.call(this, session);
  },

  async handleConversation(message, session) {
    return ConversationalGodMixin._handleConversation.call(this, message, session);
  },

  async generateDocumentation(type, context) {
    return ConversationalGodMixin._generateDocumentation.call(this, type, context);
  },

  async converseAbout(topic, options = {}) {
    return ConversationalGodMixin._converseAbout.call(this, topic, options);
  },

  /**
   * Implementation methods (prefixed with _ to avoid conflicts)
   */
  async _startConversation(topic, config = {}) {
    const session = config.session || await this.messenger.startConversationalSession(this, topic);
    
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
        ...config.adaptations
      }
    };
    
    const agent = await this.conversationalFactory.createConversationalAgent(
      this,
      `conversation-${topic}`,
      conversationSpec
    );
    
    this.activeConversations.set(session.id, {
      agent,
      session,
      startTime: new Date()
    });
    
    const result = await agent.startConversation(topic, session);
    
    await session.updateContext(this.name, {
      conversationStarted: true,
      initialTopic: topic,
      agent: agent.spec.id
    }, 'Conversation initialized');
    
    return {
      session,
      agent,
      initialResponse: result
    };
  },

  async _continueConversation(session) {
    let conversation = this.activeConversations.get(session.id);
    if (!conversation) {
      const agent = await this._createConversationalAgentForSession(session);
      conversation = {
        agent,
        session,
        startTime: new Date()
      };
      this.activeConversations.set(session.id, conversation);
    }
    
    return await conversation.agent.continueConversation(session);
  },

  async _handleConversation(message, session) {
    const { content, from } = message;
    
    let conversation = this.activeConversations.get(session.id);
    if (!conversation) {
      const agent = await this._createConversationalAgentForSession(session);
      conversation = {
        agent,
        session,
        startTime: new Date()
      };
      this.activeConversations.set(session.id, conversation);
    }
    
    const response = await conversation.agent.execute({
      action: 'respond',
      message: content,
      from: from,
      context: session.getContextForGod(this.name)
    });
    
    if (response.contextUpdates) {
      await session.updateContext(this.name, response.contextUpdates, 'Conversation progress');
    }
    
    return response;
  },

  async _generateDocumentation(type, context) {
    const template = await this._loadDocumentationTemplate(type);
    
    const docAgent = await this.createSubAgent(`${type}-generator`, {
      baseAgent: 'docs-writer',
      adaptations: {
        templates: template,
        focus: `Generate ${type} documentation`,
        format: context.format || 'markdown',
        style: this.getDocumentationStyle(type)
      }
    });
    
    return await docAgent.execute({ 
      task: 'generate', 
      type,
      context 
    });
  },

  async _converseAbout(topic, options = {}) {
    const conversation = await this.startConversation(topic, options);
    
    // Return a conversational interface
    return {
      session: conversation.session,
      ask: async (question) => {
        return await this.handleConversation({
          content: question,
          from: 'user'
        }, conversation.session);
      },
      conclude: async () => {
        const summary = await this.conversationalUX.generateConversationSummary(conversation.session);
        await this.endConversation(conversation.session.id, summary);
        return summary;
      }
    };
  },

  /**
   * Helper methods
   */
  async _createConversationalAgentForSession(session) {
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
  },

  async _loadDocumentationTemplate(type) {
    const templatePath = `gods/resources/conversational/templates/${type}-template.md`;
    
    return {
      path: templatePath,
      type: type,
      sections: this.getDefaultDocumentSections(type)
    };
  },

  /**
   * Default implementations that can be overridden
   */
  getDefaultConversationalStyle() {
    return {
      personality: {
        traits: ['helpful', 'professional', 'knowledgeable'],
        tone: 'friendly and supportive',
        approach: 'collaborative problem-solving'
      },
      patterns: {
        greeting: 'warm',
        questions: 'clarifying',
        transitions: 'smooth'
      }
    };
  },

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
  },

  getConversationalTools() {
    const baseTools = ['interactive-flow', 'session-state'];
    
    const godTools = {
      prometheus: ['generate-prp', 'requirement-parser'],
      apollo: ['ui-design', 'journey-mapper'],
      daedalus: ['architecture-diagram', 'tech-spec'],
      hephaestus: ['code-generator', 'test-generator']
    };
    
    return [...baseTools, ...(godTools[this.name] || [])];
  },

  getDefaultDocumentSections(type) {
    const sections = {
      'PRD': ['Overview', 'Requirements', 'User Stories', 'Success Metrics'],
      'tech-spec': ['Architecture', 'Components', 'APIs', 'Security'],
      'user-journey': ['Personas', 'Scenarios', 'Flow', 'Touchpoints'],
      'test-plan': ['Scope', 'Test Cases', 'Automation', 'Metrics']
    };
    
    return sections[type] || ['Introduction', 'Content', 'Conclusion'];
  },

  getDocumentationStyle(type) {
    const styles = {
      'PRD': 'clear and comprehensive',
      'tech-spec': 'detailed and technical',
      'user-journey': 'narrative and visual',
      'test-plan': 'systematic and thorough'
    };
    
    return styles[type] || 'professional and complete';
  },

  /**
   * Conversation management
   */
  async handoffConversation(toGod, session, reason) {
    const conversation = this.activeConversations.get(session.id);
    if (!conversation) {
      throw new Error('No active conversation to hand off');
    }
    
    const handoffContext = {
      phase: session.context.currentPhase,
      completedWork: this._summarizeWork(session),
      reason: reason,
      continuity: this._getContinuityMessage(toGod, session)
    };
    
    await this.messenger.handoffConversation(this, toGod, session, handoffContext);
    
    this.activeConversations.delete(session.id);
    
    if (this.emit) {
      this.emit('conversation:handed-off', {
        from: this.name,
        to: toGod.name,
        sessionId: session.id,
        reason
      });
    }
  },

  _summarizeWork(session) {
    const myContributions = session.timeline
      .filter(event => event.god === this.name)
      .map(event => event.reason || event.type);
    
    return {
      contributionCount: myContributions.length,
      mainContributions: myContributions.slice(0, 3),
      artifacts: this._getMyArtifacts(session)
    };
  },

  _getMyArtifacts(session) {
    const artifacts = [];
    
    for (const [type, items] of Object.entries(session.context.artifacts)) {
      const myItems = items.filter(item => item.createdBy === this.name);
      if (myItems.length > 0) {
        artifacts.push({ type, count: myItems.length });
      }
    }
    
    return artifacts;
  },

  _getContinuityMessage(toGod, session) {
    const messages = {
      'zeus->prometheus': "the project vision we've outlined",
      'prometheus->apollo': "the requirements and user stories we've defined",
      'apollo->daedalus': "the user experience we've designed",
      'daedalus->hephaestus': "the architecture we've planned",
      'hephaestus->themis': "the code I've implemented"
    };
    
    const key = `${this.name}->${toGod.name}`;
    return messages[key] || "what we've accomplished so far";
  },

  async endConversation(sessionId, summary = {}) {
    const conversation = this.activeConversations.get(sessionId);
    if (!conversation) return;
    
    if (conversation.agent.cleanup) {
      await conversation.agent.cleanup();
    }
    
    this.activeConversations.delete(sessionId);
    
    if (this.emit) {
      this.emit('conversation:ended', {
        god: this.name,
        sessionId,
        duration: Date.now() - conversation.startTime.getTime(),
        summary
      });
    }
  },

  getConversationStats() {
    return {
      activeConversations: this.activeConversations.size,
      totalConversations: this.metrics?.conversationsStarted || 0,
      averageDuration: this.metrics?.averageConversationDuration || 0
    };
  }
};

/**
 * Apply the mixin to a god class
 */
export function applyConversationalMixin(GodClass) {
  Object.assign(GodClass.prototype, ConversationalGodMixin);
  
  // Override initialize to set up conversational features
  const originalInitialize = GodClass.prototype.initialize;
  GodClass.prototype.initialize = async function() {
    if (originalInitialize) {
      await originalInitialize.call(this);
    }
    
    // Initialize conversational features if UX is available
    if (this.pantheon?.conversationalUX) {
      await this.initializeConversational(
        this.pantheon.conversationalUX,
        this.pantheon.conversationalFactory
      );
    }
  };
  
  return GodClass;
}