/**
 * MCP Adapter for Pantheon
 * Bridges the Pantheon orchestration system with Claude's Model Context Protocol
 */

import { EventEmitter } from 'events';

export class MCPAdapter extends EventEmitter {
  constructor(pantheon) {
    super();
    this.pantheon = pantheon;
    this.activeSessions = new Map();
  }

  /**
   * Generate MCP server configuration
   */
  createMCPServer() {
    return {
      name: 'pantheon',
      version: '1.0.0',
      description: 'Divine AI orchestration system - Where gods build software',
      
      tools: this.generateTools(),
      resources: this.generateResources(),
      
      // Custom handler for streaming responses
      streamHandler: this.createStreamHandler()
    };
  }

  /**
   * Generate MCP tools from Pantheon capabilities
   */
  generateTools() {
    return {
      // Core conversation tools
      'pantheon_init': {
        description: 'Start a new project with Zeus, the divine orchestrator',
        inputSchema: {
          type: 'object',
          properties: {
            idea: {
              type: 'string',
              description: 'Your project idea or vision'
            },
            context: {
              type: 'object',
              description: 'Optional context about timeline, users, etc.',
              properties: {
                timeline: { type: 'string' },
                targetUsers: { type: 'string' },
                constraints: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          required: ['idea']
        },
        handler: this.handleInit.bind(this)
      },

      'pantheon_respond': {
        description: 'Continue the conversation with the current god',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Active session ID'
            },
            message: {
              type: 'string',
              description: 'Your response to the god\'s question'
            }
          },
          required: ['sessionId', 'message']
        },
        handler: this.handleRespond.bind(this)
      },

      'pantheon_council': {
        description: 'Convene a divine council meeting for collaborative decisions',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Active session ID'
            },
            type: {
              type: 'string',
              enum: ['architecture', 'code-review', 'design-review', 'debug', 'planning', 'custom'],
              description: 'Type of council meeting'
            },
            topic: {
              type: 'string',
              description: 'Specific topic for discussion'
            },
            participants: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional: specific gods to include'
            }
          },
          required: ['type', 'topic']
        },
        handler: this.handleCouncil.bind(this)
      },

      'pantheon_summon': {
        description: 'Summon a specific god for their expertise',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Active session ID'
            },
            god: {
              type: 'string',
              enum: ['zeus', 'apollo', 'hephaestus', 'athena', 'themis', 'prometheus', 
                     'daedalus', 'hermes', 'vulcan', 'concilium', 'aegis', 'plutus', 
                     'hestia', 'iris', 'clio', 'demeter', 'poseidon', 'hades'],
              description: 'The god to summon'
            },
            reason: {
              type: 'string',
              description: 'Why you need this god\'s help'
            }
          },
          required: ['god', 'reason']
        },
        handler: this.handleSummon.bind(this)
      },

      'pantheon_request_tools': {
        description: 'Request tools from Vulcan, the divine tool broker',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Active session ID'
            },
            forGod: {
              type: 'string',
              description: 'Which god needs the tools'
            },
            purpose: {
              type: 'string',
              description: 'What the tools will be used for'
            },
            tools: {
              type: 'array',
              items: { type: 'string' },
              description: 'Specific tools requested (optional)'
            }
          },
          required: ['forGod', 'purpose']
        },
        handler: this.handleToolRequest.bind(this)
      },

      'pantheon_status': {
        description: 'Check the status of your project and active gods',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID to check (optional for current)'
            }
          }
        },
        handler: this.handleStatus.bind(this)
      },

      'pantheon_execute': {
        description: 'Execute a specific task with a god\'s expertise',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Active session ID'
            },
            god: {
              type: 'string',
              description: 'God to execute the task'
            },
            task: {
              type: 'object',
              description: 'Task specification',
              properties: {
                type: { type: 'string' },
                description: { type: 'string' },
                requirements: { type: 'object' },
                artifacts: { type: 'array' }
              }
            }
          },
          required: ['god', 'task']
        },
        handler: this.handleExecute.bind(this)
      },

      // Session management
      'pantheon_save_session': {
        description: 'Save the current conversation session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session to save'
            },
            name: {
              type: 'string',
              description: 'Name for the saved session'
            }
          },
          required: ['sessionId']
        },
        handler: this.handleSaveSession.bind(this)
      },

      'pantheon_restore_session': {
        description: 'Restore a previous conversation session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID to restore'
            },
            name: {
              type: 'string',
              description: 'Name of saved session to restore'
            }
          }
        },
        handler: this.handleRestoreSession.bind(this)
      }
    };
  }

  /**
   * Generate MCP resources
   */
  generateResources() {
    return {
      'pantheon_sessions': {
        description: 'List all active Pantheon sessions',
        handler: async () => {
          const sessions = Array.from(this.activeSessions.entries()).map(([id, session]) => ({
            id,
            projectName: session.projectName,
            currentPhase: session.currentPhase,
            activeGod: session.currentSpeaker,
            startTime: session.startTime,
            participants: session.participants
          }));
          
          return {
            sessions,
            total: sessions.length
          };
        }
      },

      'pantheon_gods': {
        description: 'List available gods and their current status',
        handler: async () => {
          const gods = await this.pantheon.getAvailableGods();
          return {
            gods: gods.map(god => ({
              name: god.name,
              title: god.title,
              domain: god.domain,
              status: god.isActive ? 'active' : 'available',
              activeAgents: god.activeAgents || 0,
              capabilities: god.capabilities
            })),
            total: gods.length
          };
        }
      },

      'pantheon_artifacts': {
        description: 'List generated artifacts for a session',
        handler: async (params) => {
          const sessionId = params.sessionId || this.getCurrentSessionId();
          const session = this.activeSessions.get(sessionId);
          
          if (!session) {
            return { error: 'Session not found' };
          }
          
          return {
            artifacts: session.artifacts || [],
            documents: session.documents || [],
            code: session.generatedCode || []
          };
        }
      }
    };
  }

  /**
   * Create stream handler for natural conversation flow
   */
  createStreamHandler() {
    return async function* (toolName, params) {
      const handler = this.tools[toolName]?.handler;
      if (!handler) {
        throw new Error(`Unknown tool: ${toolName}`);
      }

      const response = await handler(params);
      
      // Stream speaker change
      if (response.speaker) {
        yield {
          type: 'speaker',
          value: response.speaker,
          metadata: {
            avatar: response.speakerAvatar,
            title: response.speakerTitle
          }
        };
      }

      // Stream message in chunks for natural feel
      if (response.message) {
        const chunks = this.chunkMessage(response.message);
        for (const chunk of chunks) {
          yield {
            type: 'message',
            value: chunk
          };
          // Natural typing delay
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }

      // Handle god transitions
      if (response.handoff) {
        yield {
          type: 'handoff',
          value: {
            from: response.handoff.from,
            to: response.handoff.to,
            reason: response.handoff.reason,
            transition: response.handoff.transition
          }
        };
        
        // Pause for effect
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // New god greeting
        yield {
          type: 'speaker',
          value: response.handoff.to,
          metadata: response.handoff.toMetadata
        };
        
        yield {
          type: 'message',
          value: response.handoff.greeting
        };
      }

      // Stream any artifacts
      if (response.artifacts && response.artifacts.length > 0) {
        for (const artifact of response.artifacts) {
          yield {
            type: 'artifact',
            value: artifact
          };
        }
      }

      // Final response data
      yield {
        type: 'complete',
        value: {
          sessionId: response.sessionId,
          expectsResponse: response.expectsResponse,
          currentPhase: response.currentPhase,
          nextSteps: response.nextSteps
        }
      };
    }.bind(this);
  }

  /**
   * Tool Handlers
   */

  async handleInit(params) {
    try {
      // Create new session
      const sessionId = this.generateSessionId();
      
      // Start conversation with Zeus
      const zeus = await this.pantheon.summonGod('zeus');
      
      // Create a simple conversation start
      const greeting = `Greetings, mortal! I am Zeus, King of Olympus and divine orchestrator of the Pantheon.

You speak of "${params.idea}" - a vision worthy of divine attention! 

Let me understand your needs better. Tell me:
1. Who will use this creation?
2. What is your timeline - do you seek swift results or perfection?
3. Are there any constraints I should know about?

With this knowledge, I shall summon the perfect gods to bring your vision to life.`;

      const conversation = {
        session: sessionId,
        greeting: greeting,
        projectName: params.idea.substring(0, 50)
      };

      // Store session
      this.activeSessions.set(sessionId, {
        id: sessionId,
        projectName: conversation.projectName || 'Unnamed Project',
        projectIdea: params.idea,
        currentPhase: 'discovery',
        currentSpeaker: 'zeus',
        conversation: conversation.session,
        conversationHistory: [{
          speaker: 'zeus',
          message: greeting,
          timestamp: new Date()
        }],
        startTime: new Date(),
        participants: ['zeus']
      });

      return {
        sessionId,
        speaker: 'Zeus',
        speakerAvatar: '⚡',
        speakerTitle: 'King of Olympus, Divine Orchestrator',
        message: conversation.greeting || `Greetings! I am Zeus, orchestrator of the divine pantheon. ${params.idea} - what an intriguing vision! Let me understand your needs better so I can summon the right gods to bring your project to life.\n\nFirst, tell me: Who do you envision as the primary users of this creation?`,
        expectsResponse: true,
        currentPhase: 'discovery'
      };
    } catch (error) {
      return {
        error: error.message,
        suggestion: 'Try describing your project idea in more detail'
      };
    }
  }

  async handleRespond(params) {
    const session = this.activeSessions.get(params.sessionId);
    if (!session) {
      return { error: 'Session not found. Start a new conversation with pantheon_init.' };
    }

    try {
      // Get current god
      const currentGod = await this.pantheon.summonGod(session.currentSpeaker);
      
      // Add message to conversation history
      if (!session.conversationHistory) {
        session.conversationHistory = [];
      }
      session.conversationHistory.push({
        speaker: 'user',
        message: params.message,
        timestamp: new Date()
      });
      
      // Generate response based on conversation context
      let response = await this.generateGodResponse(currentGod, params.message, session);

      // Update session
      session.lastMessage = params.message;
      session.lastResponse = response;

      // Check for handoffs
      if (response.handoff) {
        session.currentSpeaker = response.handoff.to;
        session.participants.push(response.handoff.to);
        session.currentPhase = response.handoff.newPhase || session.currentPhase;
      }

      // Update artifacts
      if (response.artifacts) {
        session.artifacts = [...(session.artifacts || []), ...response.artifacts];
      }

      return {
        sessionId: params.sessionId,
        speaker: response.speaker || session.currentSpeaker,
        speakerAvatar: response.avatar,
        speakerTitle: response.title,
        message: response.message,
        handoff: response.handoff,
        artifacts: response.artifacts,
        expectsResponse: response.expectsResponse !== false,
        currentPhase: session.currentPhase
      };
    } catch (error) {
      return {
        error: error.message,
        sessionId: params.sessionId,
        recoverable: true
      };
    }
  }

  async handleCouncil(params) {
    const session = this.activeSessions.get(params.sessionId);
    if (!session) {
      return { error: 'Session not found. Start a new conversation with pantheon_init.' };
    }
    
    try {
      // Summon Concilium to facilitate
      const concilium = await this.pantheon.summonGod('concilium');
      
      // Determine council type and participants
      const councilTypes = {
        architecture: {
          participants: ['daedalus', 'hephaestus', 'athena', 'zeus'],
          focus: 'System design, technology choices, and architectural patterns'
        },
        design: {
          participants: ['apollo', 'iris', 'prometheus'],
          focus: 'UI/UX decisions, user flows, and visual design'
        },
        technical: {
          participants: ['hephaestus', 'themis', 'athena'],
          focus: 'Implementation quality, patterns, and best practices'
        },
        security: {
          participants: ['aegis', 'themis', 'hephaestus'],
          focus: 'Security measures, vulnerabilities, and compliance'
        },
        planning: {
          participants: ['zeus', 'hermes', 'prometheus'],
          focus: 'Development phases and task allocation'
        }
      };
      
      const councilType = params.type || 'architecture';
      const council = councilTypes[councilType] || councilTypes.architecture;
      const meetingId = `council_${Date.now()}`;
      
      // Create opening statement
      const opening = `*The divine council chamber materializes as Concilium strikes the gavel*

🏛️ **Divine Council Convened**

**Topic:** ${params.topic}
**Type:** ${councilType.charAt(0).toUpperCase() + councilType.slice(1)} Review
**Focus:** ${council.focus}

*The following gods take their seats:*
${council.participants.map(god => `• ${god.charAt(0).toUpperCase() + god.slice(1)}`).join('\n')}

Let us begin. ${council.participants[0].charAt(0).toUpperCase() + council.participants[0].slice(1)}, as the primary expert, please share your initial thoughts on "${params.topic}" for ${session.projectIdea}.`;

      // Create meeting object
      const meeting = {
        id: meetingId,
        type: councilType,
        topic: params.topic,
        participants: council.participants,
        facilitator: 'concilium',
        opening: opening,
        startTime: new Date()
      };
      
      // Store meeting in session
      if (!session.meetings) {
        session.meetings = [];
      }
      session.meetings.push(meeting);
      
      // Add to conversation history
      session.conversationHistory.push({
        speaker: 'concilium',
        message: opening,
        timestamp: new Date(),
        type: 'council_opening'
      });

      return {
        sessionId: params.sessionId,
        facilitator: 'Concilium',
        participants: council.participants,
        topic: params.topic,
        type: councilType,
        message: opening,
        expectsResponse: true
      };
    } catch (error) {
      return {
        error: error.message,
        suggestion: 'Specify a valid meeting type (architecture, design, technical, security, planning) and topic'
      };
    }
  }

  async handleSummon(params) {
    const session = this.activeSessions.get(params.sessionId);
    if (!session) {
      return { error: 'Session not found. Start a new conversation with pantheon_init.' };
    }
    
    try {
      const god = await this.pantheon.summonGod(params.god);
      
      // Update session
      session.currentSpeaker = params.god;
      if (!session.participants.includes(params.god)) {
        session.participants.push(params.god);
      }
      
      // Generate introduction based on god and reason
      const introductions = {
        apollo: `*A radiant light fills the room as Apollo arrives*

Greetings! I am Apollo, god of light, music, and beautiful design. ${params.reason ? `I understand ${params.reason}` : 'I hear you seek guidance on design and user experience.'} 

For ${session.projectIdea}, I envision interfaces that not only function flawlessly but inspire joy in every interaction. Tell me, what emotions should your users feel when they first encounter this creation?`,
        
        hephaestus: `*The sound of divine hammers echoes as Hephaestus approaches*

I am Hephaestus, master craftsman of Olympus! ${params.reason ? `Zeus tells me ${params.reason}` : 'I understand you need robust technical implementation.'} 

I shall forge the backend systems and infrastructure for ${session.projectIdea} with divine precision. What are your performance requirements?`,
        
        athena: `*Wisdom and strategy emanate as Athena joins*

I am Athena, goddess of wisdom and strategic warfare. ${params.reason ? params.reason : 'You seek intelligent solutions and strategic planning.'} 

For ${session.projectIdea}, let us think deeply about the architecture and algorithms. What are the most complex problems your users face?`
      };
      
      const defaultIntro = `*${god.name} joins the divine council*

Greetings! I am ${god.name}. ${params.reason || 'I am here to assist with my divine expertise.'} 

How may I contribute to ${session.projectIdea}?`;
      
      const message = introductions[params.god] || defaultIntro;
      
      // Add to conversation history
      session.conversationHistory.push({
        speaker: god.name,
        message: message,
        timestamp: new Date()
      });

      return {
        sessionId: params.sessionId,
        currentGod: god.name,
        greeting: message,
        expectsResponse: true
      };
    } catch (error) {
      const availableGods = ['zeus', 'apollo', 'hephaestus', 'athena', 'daedalus', 
                           'themis', 'hermes', 'prometheus', 'aegis', 'vulcan', 'concilium'];
      return {
        error: `Could not summon ${params.god}: ${error.message}`,
        suggestion: `Available gods: ${availableGods.join(', ')}`
      };
    }
  }

  async handleToolRequest(params) {
    const sessionId = params.sessionId || this.getCurrentSessionId();
    
    try {
      const vulcan = await this.pantheon.summonGod('vulcan');
      
      const allocation = await vulcan.allocateTools({
        forGod: params.forGod,
        purpose: params.purpose,
        requestedTools: params.tools,
        sessionContext: sessionId ? this.activeSessions.get(sessionId) : null
      });

      return {
        sessionId,
        speaker: 'Vulcan',
        speakerAvatar: '🔥',
        speakerTitle: 'Divine Tool Broker',
        message: allocation.explanation,
        approved: allocation.approved,
        denied: allocation.denied,
        alternatives: allocation.alternatives,
        expectsResponse: false
      };
    } catch (error) {
      return {
        error: error.message
      };
    }
  }

  async handleStatus(params) {
    const sessionId = params.sessionId || this.getCurrentSessionId();
    
    if (!sessionId) {
      return {
        message: 'No active sessions. Start a new project with pantheon_init.',
        sessions: []
      };
    }

    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }

    return {
      sessionId,
      projectName: session.projectName,
      currentPhase: session.currentPhase,
      currentSpeaker: session.currentSpeaker,
      participants: session.participants,
      duration: this.getSessionDuration(session),
      artifacts: (session.artifacts || []).length,
      meetings: (session.meetings || []).length,
      nextSteps: session.nextSteps || []
    };
  }

  async handleExecute(params) {
    const sessionId = params.sessionId || this.getCurrentSessionId();
    
    try {
      const god = await this.pantheon.summonGod(params.god);
      
      // Execute task with real agent
      const result = await god.executeTask(params.task, {
        sessionContext: sessionId ? this.activeSessions.get(sessionId) : null
      });

      // Update session
      if (sessionId) {
        const session = this.activeSessions.get(sessionId);
        session.executedTasks = [...(session.executedTasks || []), {
          god: params.god,
          task: params.task,
          result: result.summary,
          timestamp: new Date()
        }];
      }

      return {
        sessionId,
        speaker: god.name,
        speakerAvatar: god.avatar,
        message: result.message,
        artifacts: result.artifacts,
        success: result.success,
        nextSteps: result.nextSteps
      };
    } catch (error) {
      return {
        error: error.message,
        god: params.god,
        task: params.task
      };
    }
  }

  async handleSaveSession(params) {
    const session = this.activeSessions.get(params.sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }

    const savedName = params.name || `${session.projectName}_${new Date().toISOString()}`;
    
    // Save through Pantheon's persistence
    await this.pantheon.saveSession(params.sessionId, savedName, session);

    return {
      success: true,
      savedAs: savedName,
      sessionId: params.sessionId
    };
  }

  async handleRestoreSession(params) {
    try {
      const restoredSession = await this.pantheon.restoreSession(
        params.sessionId || params.name
      );

      // Re-add to active sessions
      this.activeSessions.set(restoredSession.id, restoredSession);

      return {
        sessionId: restoredSession.id,
        projectName: restoredSession.projectName,
        currentPhase: restoredSession.currentPhase,
        message: `Session restored. You were speaking with ${restoredSession.currentSpeaker} about ${restoredSession.projectName}.`,
        expectsResponse: true
      };
    } catch (error) {
      return {
        error: error.message,
        suggestion: 'Check available sessions with pantheon_sessions resource'
      };
    }
  }

  /**
   * Utility methods
   */

  generateSessionId() {
    return `pantheon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getCurrentSessionId() {
    // Return the most recent session
    const sessions = Array.from(this.activeSessions.keys());
    return sessions[sessions.length - 1];
  }

  chunkMessage(message, chunkSize = 50) {
    const words = message.split(' ');
    const chunks = [];
    let chunk = '';

    for (const word of words) {
      if ((chunk + word).length > chunkSize) {
        chunks.push(chunk.trim());
        chunk = word + ' ';
      } else {
        chunk += word + ' ';
      }
    }

    if (chunk.trim()) {
      chunks.push(chunk.trim());
    }

    return chunks;
  }

  getSessionDuration(session) {
    const start = new Date(session.startTime);
    const duration = Date.now() - start.getTime();
    const minutes = Math.floor(duration / 60000);
    return `${minutes} minutes`;
  }

  async generateGodResponse(god, message, session) {
    // Build context from conversation history
    const context = {
      projectIdea: session.projectIdea,
      currentPhase: session.currentPhase,
      participants: session.participants,
      conversationHistory: session.conversationHistory.slice(-10) // Last 10 messages
    };

    // Generate response based on god's personality and expertise
    const godPersonalities = {
      zeus: {
        style: 'Commanding yet wise, orchestrating the divine team',
        expertise: 'Project orchestration, team coordination, strategic planning'
      },
      apollo: {
        style: 'Artistic and elegant, focused on beauty and user experience',
        expertise: 'UI/UX design, aesthetics, user interface'
      },
      hephaestus: {
        style: 'Practical and technical, focused on robust implementation',
        expertise: 'Backend development, APIs, infrastructure'
      },
      athena: {
        style: 'Strategic and analytical, focused on intelligent solutions',
        expertise: 'AI/ML, algorithms, data analysis'
      }
      // Add more gods as needed
    };

    const personality = godPersonalities[god.name] || {
      style: 'Professional and helpful',
      expertise: god.capabilities?.join(', ') || 'General assistance'
    };

    // Check for specific patterns in the message
    let response = {
      message: '',
      handoff: null,
      artifacts: [],
      expectsResponse: true
    };

    // Handle different types of user messages
    if (message.toLowerCase().includes('user') || message.toLowerCase().includes('who will use')) {
      response.message = this.generateUserDiscussionResponse(god.name, message, context);
    } else if (message.toLowerCase().includes('timeline') || message.toLowerCase().includes('when')) {
      response.message = this.generateTimelineResponse(god.name, message, context);
    } else if (message.toLowerCase().includes('tech') || message.toLowerCase().includes('stack')) {
      response.message = this.generateTechStackResponse(god.name, message, context);
      // Consider bringing in technical gods
      if (god.name === 'zeus' && !session.participants.includes('hephaestus')) {
        response.handoff = {
          to: 'hephaestus',
          reason: 'Technical architecture discussion'
        };
      }
    } else {
      // Generic response based on god's expertise
      response.message = this.generateGenericResponse(god.name, message, context, personality);
    }

    // Add god's response to history
    session.conversationHistory.push({
      speaker: god.name,
      message: response.message,
      timestamp: new Date()
    });

    return response;
  }

  generateUserDiscussionResponse(godName, message, context) {
    const responses = {
      zeus: `Ah, the users - the mortals who shall benefit from our divine creation! Based on what you've told me about "${context.projectIdea}", I see potential for various user groups. 

Could you elaborate on:
- Are these individual users or organizations?
- What problems do they currently face that your creation will solve?
- How technically savvy are they?

This knowledge will help me summon the right gods with the perfect expertise.`,
      apollo: `Users are at the heart of any great design! For this ${context.projectIdea}, we must craft an experience that delights and inspires.

Tell me more about your users:
- What emotions should they feel when using this?
- Are they on mobile, desktop, or both?
- What's their typical workflow?`
    };

    return responses[godName] || `Understanding the users is crucial for ${context.projectIdea}. Could you tell me more about who will benefit from this creation?`;
  }

  generateTimelineResponse(godName, message, context) {
    const responses = {
      zeus: `Timeline is crucial for orchestrating our divine efforts! For "${context.projectIdea}", we can work at different paces:

⚡ **Lightning Strike** (Days): Rapid prototype, core features only
🌊 **Flowing River** (Weeks): Balanced approach, solid foundation
🏔️ **Mountain Building** (Months): Complete solution, fully polished

Which timeline aligns with your vision? This will determine which gods I summon and how we approach the work.`
    };

    return responses[godName] || `Let's discuss the timeline for ${context.projectIdea}. When do you need this completed?`;
  }

  generateTechStackResponse(godName, message, context) {
    const responses = {
      zeus: `Ah, you speak of the divine tools and materials! For "${context.projectIdea}", we have many options. 

Let me summon Hephaestus, our master craftsman, to discuss the technical architecture. He'll help us choose the perfect tools for your vision.

*Thunder rumbles as Zeus prepares to summon another god*`,
      hephaestus: `*The sound of hammering echoes through Olympus*

Greetings! Hephaestus here, master of the divine forge. For ${context.projectIdea}, I can forge solutions with:

🔨 **Modern Web Stack**: React/Next.js + Node.js + PostgreSQL
⚙️ **Enterprise Grade**: Java/Spring + Angular + Oracle
🚀 **Cutting Edge**: Go + HTMX + Redis

What speaks to your needs? Or shall I recommend based on your requirements?`
    };

    return responses[godName] || `Let's discuss the technical approach for ${context.projectIdea}. What technologies are you familiar with?`;
  }

  generateGenericResponse(godName, message, context, personality) {
    // Create a contextual response based on the god's personality
    const intro = `*${personality.style}*\n\n`;
    
    // Analyze the message for intent
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return `${intro}With my expertise in ${personality.expertise}, I can certainly help with that aspect of ${context.projectIdea}. 

Let me understand better - ${message}

Could you provide more specific details about what you envision?`;
    }
    
    // Default response
    return `${intro}Regarding "${message}" - an excellent point to consider for ${context.projectIdea}!

From my perspective in ${personality.expertise}, this touches on important aspects we should explore further.

What specific outcomes are you hoping to achieve with this?`;
  }
}

/**
 * Create MCP server from Pantheon instance
 */
export function createMCPServer(pantheon) {
  const adapter = new MCPAdapter(pantheon);
  return adapter.createMCPServer();
}