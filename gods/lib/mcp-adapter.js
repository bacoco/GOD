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
    
    // Conversation phases
    this.PHASES = {
      DISCOVERY: 'discovery',
      PLANNING: 'planning',
      PROPOSAL: 'proposal',
      AWAITING_APPROVAL: 'awaiting_approval',
      APPROVED: 'approved',
      EXECUTION: 'execution'
    };
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
      },

      // Agent spawning (after approval)
      'pantheon_spawn_agent': {
        description: 'Spawn a specialized agent after approval (internal use)',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Active session ID'
            },
            godName: {
              type: 'string',
              description: 'God spawning the agent'
            },
            agentType: {
              type: 'string',
              description: 'Type of agent to spawn'
            },
            tools: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tools to allocate to agent'
            },
            mission: {
              type: 'string',
              description: 'Agent mission description'
            }
          },
          required: ['godName', 'agentType', 'mission']
        },
        handler: this.handleSpawnAgent.bind(this)
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
        currentPhase: this.PHASES.DISCOVERY,
        currentSpeaker: 'zeus',
        conversation: conversation.session,
        conversationHistory: [{
          speaker: 'zeus',
          message: greeting,
          timestamp: new Date()
        }],
        startTime: new Date(),
        participants: ['zeus'],
        // Approval flow tracking
        hasEnoughInfo: false,
        proposalData: null,
        awaitingApproval: false,
        requirements: {
          users: null,
          timeline: null,
          features: [],
          constraints: [],
          budget: null,
          technology: {
            preferences: [],
            constraints: [],
            existing: [],
            avoid: []
          },
          industry: null
        }
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
        if (!session.participants.includes(response.handoff.to)) {
          session.participants.push(response.handoff.to);
        }
        session.currentPhase = response.handoff.newPhase || session.currentPhase;
      }

      // Update artifacts
      if (response.artifacts) {
        session.artifacts = [...(session.artifacts || []), ...response.artifacts];
      }

      // Ensure we have a valid response
      if (!response.message) {
        console.error('No message in response:', response);
        response.message = `I understand you're asking about "${params.message}". Let me think about this for ${session.projectIdea}.`;
      }

      return {
        sessionId: params.sessionId,
        speaker: response.speaker || session.currentSpeaker,
        speakerAvatar: response.avatar || this.getGodAvatar(session.currentSpeaker),
        speakerTitle: response.title || this.getGodTitle(session.currentSpeaker),
        message: response.message,
        handoff: response.handoff,
        artifacts: response.artifacts,
        expectsResponse: response.expectsResponse !== false,
        currentPhase: session.currentPhase
      };
    } catch (error) {
      console.error('Error in handleRespond:', error);
      return {
        error: `I encountered an issue processing your message: ${error.message}`,
        sessionId: params.sessionId,
        recoverable: true,
        // Still return a valid response structure
        speaker: session.currentSpeaker || 'zeus',
        message: `My apologies - I had trouble understanding that. Could you rephrase your message about ${session.projectIdea}?`,
        expectsResponse: true,
        currentPhase: session.currentPhase
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

  getGodAvatar(godName) {
    const avatars = {
      zeus: '⚡',
      apollo: '☀️',
      hephaestus: '🔨',
      athena: '🦉',
      hermes: '📨',
      themis: '⚖️',
      prometheus: '🔥',
      daedalus: '📐',
      aegis: '🛡️',
      vulcan: '🔥',
      concilium: '🏛️'
    };
    return avatars[godName] || '🏛️';
  }

  getGodTitle(godName) {
    const titles = {
      zeus: 'King of Olympus, Divine Orchestrator',
      apollo: 'God of Light, Music, and Design',
      hephaestus: 'Divine Craftsman, Master of the Forge',
      athena: 'Goddess of Wisdom and Strategic Warfare',
      hermes: 'Messenger of the Gods, Master of Communication',
      themis: 'Goddess of Justice and Quality',
      prometheus: 'Titan of Forethought and Innovation',
      daedalus: 'Master Architect and Designer',
      aegis: 'Divine Shield, Guardian of Security',
      vulcan: 'Divine Tool Broker',
      concilium: 'Divine Facilitator, Keeper of Order'
    };
    return titles[godName] || 'Divine Assistant';
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
    // Add user message to conversation history
    session.conversationHistory.push({
      speaker: 'user',
      message: message,
      timestamp: new Date()
    });
    
    // Check if we're awaiting approval
    if (session.awaitingApproval) {
      return this.handleApprovalResponse(message, session);
    }
    
    // Build full conversation context for the god
    const context = {
      projectIdea: session.projectIdea,
      currentPhase: session.currentPhase,
      participants: session.participants,
      conversationHistory: session.conversationHistory,
      understanding: session.understanding || {},
      currentSpeaker: god.name
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

    // Analyze the conversation to understand what's needed
    const analysis = this.analyzeConversationContext(context);
    
    // Extract information from the current message and update session
    const messageContext = this.analyzeMessageContext(message);
    const projectUnderstanding = this.buildProjectUnderstanding(context);
    this.updateSessionUnderstanding(session, messageContext, projectUnderstanding);
    
    // Generate intelligent response based on god's role and conversation state
    let response = {
      message: '',
      handoff: null,
      artifacts: [],
      expectsResponse: true
    };

    // Let each god respond based on their understanding of the conversation
    try {
      if (god.name === 'zeus') {
        response = this.generateZeusResponse(context, message, analysis, session);
      } else if (god.name === 'apollo') {
        response = this.generateApolloResponse(context, message, analysis, session);
      } else if (god.name === 'hephaestus') {
        response = this.generateHephaestusResponse(context, message, analysis, session);
      } else if (god.name === 'athena') {
        response = this.generateAthenaResponse(context, message, analysis, session);
      } else if (god.name === 'hermes') {
        response = this.generateHermesResponse(context, message, analysis, session);
      } else if (god.name === 'themis') {
        response = this.generateThemisResponse(context, message, analysis, session);
      } else if (god.name === 'prometheus') {
        response = this.generatePrometheusResponse(context, message, analysis, session);
      } else if (god.name === 'daedalus') {
        response = this.generateDaedalusResponse(context, message, analysis, session);
      } else if (god.name === 'aegis') {
        response = this.generateAegisResponse(context, message, analysis, session);
      } else {
        // Default intelligent response for other gods
        response.message = this.generateIntelligentResponse(god.name, context, message, analysis, personality);
      }
    } catch (error) {
      console.error(`Error generating response for ${god.name}:`, error);
      // Fallback response when god-specific generation fails
      response = {
        message: `*${god.name} appears momentarily distracted*

I understand you're asking about "${message}". Let me gather my thoughts and provide the best guidance for ${context.projectIdea}.

${personality.expertise ? `From my expertise in ${personality.expertise}, ` : ''}I believe this deserves careful consideration. Could you tell me more about your specific needs?`,
        expectsResponse: true
      };
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

  // Analyze conversation context for intelligent responses
  analyzeConversationContext(context) {
    const understanding = {
      hasProjectScope: false,
      hasUserContext: false,
      hasTimeline: false,
      hasKeyFeatures: false,
      hasTechnicalContext: false,
      needsSpecialists: [],
      conversationDepth: context.conversationHistory.length
    };
    
    // Analyze the full conversation to understand what we know
    const fullConversation = context.conversationHistory
      .map(msg => `${msg.speaker}: ${msg.message}`)
      .join('\n');
    
    // Check what we understand from the conversation
    if (context.understanding.projectType) {
      understanding.hasProjectScope = true;
    }
    
    if (context.understanding.userBase || context.understanding.targetAudience) {
      understanding.hasUserContext = true;
    }
    
    if (context.understanding.timeline || context.understanding.deadline) {
      understanding.hasTimeline = true;
    }
    
    if (context.understanding.coreFeatures || context.understanding.functionality) {
      understanding.hasKeyFeatures = true;
    }
    
    // Determine what specialists might be needed based on conversation
    if (fullConversation.toLowerCase().includes('design') || 
        fullConversation.toLowerCase().includes('ui') || 
        fullConversation.toLowerCase().includes('user experience')) {
      understanding.needsSpecialists.push('apollo');
    }
    
    if (fullConversation.toLowerCase().includes('real-time') || 
        fullConversation.toLowerCase().includes('chat') || 
        fullConversation.toLowerCase().includes('messaging')) {
      understanding.needsSpecialists.push('hermes');
    }
    
    if (fullConversation.toLowerCase().includes('security') || 
        fullConversation.toLowerCase().includes('authentication') || 
        fullConversation.toLowerCase().includes('auth')) {
      understanding.needsSpecialists.push('aegis');
    }
    
    return understanding;
  }

  // Check if we have enough information for a proposal
  hasEnoughInfoForProposal(session) {
    const hasUsers = session.requirements.users !== null;
    const hasTimeline = session.requirements.timeline !== null;
    const hasFeatures = session.requirements.features.length > 0 || 
                       session.conversationHistory.length > 6; // Enough context
    
    return hasUsers && hasTimeline && hasFeatures;
  }

  // Generate the project proposal
  generateProjectProposal(session) {
    // Analyze conversation to determine tech stack
    const techStack = this.determineTechStack(session);
    const architecture = this.determineArchitecture(session);
    const godAssignments = this.determineGodAssignments(session);
    const timeline = this.determineDetailedTimeline(session);
    
    // Store proposal data
    session.proposalData = {
      techStack,
      architecture,
      godAssignments,
      timeline,
      features: session.requirements.features
    };
    
    const proposal = `🏛️ **DIVINE DEVELOPMENT PROPOSAL**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**PROJECT**: ${session.projectIdea}
**USERS**: ${session.requirements.users || 'To be determined'}
**TIMELINE**: ${session.requirements.timeline}

**🏗️ TECHNICAL ARCHITECTURE**
${architecture}

**🛠️ TECHNOLOGY STACK**
• **Backend**: ${techStack.backend}
• **Frontend**: ${techStack.frontend}
• **Database**: ${techStack.database}
• **Infrastructure**: ${techStack.infrastructure}

**✨ MVP FEATURES**
${session.requirements.features.length > 0 ? 
  session.requirements.features.map(f => `• ${f}`).join('\n') : 
  '• Core functionality based on your requirements'}

**👥 DIVINE TEAM ASSIGNMENTS**
${godAssignments.map(g => `• **${g.god}**: ${g.responsibility}`).join('\n')}

**📅 DEVELOPMENT PHASES**
${timeline}

**🚀 WHAT HAPPENS NEXT**
Upon your approval, each god will:
1. Spawn specialized AI agents
2. Generate complete, working code
3. Create documentation and tests
4. Report progress back to you

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Do you approve this divine plan?** 

✅ Reply "**Yes**" to begin construction
❌ Reply "**No**" or specify what changes you'd like`;

    return {
      message: proposal,
      expectsResponse: true,
      speaker: 'zeus',
      currentPhase: this.PHASES.AWAITING_APPROVAL
    };
  }

  // Handle approval response
  async handleApprovalResponse(message, session) {
    const lowerMessage = message.toLowerCase();
    
    // Check for approval
    if (lowerMessage.includes('yes') || lowerMessage.includes('approve') || 
        lowerMessage.includes('proceed') || lowerMessage.includes('looks good') ||
        lowerMessage.includes('perfect') || lowerMessage.includes('let\'s go')) {
      
      session.currentPhase = this.PHASES.APPROVED;
      session.awaitingApproval = false;
      
      // Trigger execution
      const executionResult = await this.executeApprovedPlan(session);
      
      return {
        message: `⚡ **DIVINE PLAN APPROVED!** ⚡

Excellent! The gods are pleased with your approval.

${executionResult.message}

*Thunder echoes across Olympus as the gods begin their work...*

🔨 **Construction has begun!** Check your project directory - the divine builders are creating your ${session.projectIdea}!`,
        expectsResponse: false,
        speaker: 'zeus',
        handoff: null,
        currentPhase: this.PHASES.EXECUTION,
        executionStarted: true
      };
    }
    
    // Check for rejection or modification request
    if (lowerMessage.includes('no') || lowerMessage.includes('change') || 
        lowerMessage.includes('different') || lowerMessage.includes('instead')) {
      
      session.awaitingApproval = false;
      session.currentPhase = this.PHASES.PLANNING;
      
      return {
        message: `Of course! I understand you'd like some changes to the plan.

Please tell me what you'd like to modify:
- Different technology choices?
- Additional features?
- Different timeline?
- Other changes?

I'll revise the divine plan according to your wishes.`,
        expectsResponse: true,
        speaker: 'zeus'
      };
    }
    
    // Unclear response
    return {
      message: `I need a clear decision on the proposal.

Please reply with:
- "**Yes**" to approve and begin construction
- "**No**" followed by what changes you'd like

The gods await your command!`,
      expectsResponse: true,
      speaker: 'zeus'
    };
  }

  // Determine tech stack based on requirements
  determineTechStack(session) {
    const requirements = session.requirements;
    const hasRealTime = requirements.features.some(f => f.toLowerCase().includes('real-time'));
    const hasMobile = requirements.features.some(f => f.toLowerCase().includes('mobile'));
    
    // Smart defaults based on timeline and features
    const isRapid = requirements.timeline?.toLowerCase().includes('week') || 
                    requirements.timeline?.toLowerCase().includes('asap');
    
    return {
      backend: hasRealTime ? 'Node.js + Express + Socket.io' : 'Node.js + Express',
      frontend: hasMobile ? 'React Native' : 'React + TypeScript',
      database: isRapid ? 'PostgreSQL' : 'PostgreSQL with Redis cache',
      infrastructure: isRapid ? 'Docker + Railway' : 'Docker + AWS'
    };
  }

  // Determine architecture
  determineArchitecture(session) {
    const isSimple = session.requirements.timeline?.includes('week') || 
                     session.requirements.features.length < 5;
    
    if (isSimple) {
      return `**Monolithic Architecture** (Recommended for rapid development)
• Single deployable unit
• Shared database
• Easy to develop and deploy
• Can be split into microservices later`;
    } else {
      return `**Modular Monolith** (Recommended for scalability)
• Single deployment with clear module boundaries
• Prepared for future microservices split
• Domain-driven design
• Clean architecture principles`;
    }
  }

  // Determine god assignments
  determineGodAssignments(session) {
    const assignments = [
      {
        god: 'Zeus',
        responsibility: 'Overall orchestration and project coordination',
        agentType: 'orchestrator',
        tools: ['Task', 'TodoWrite', 'Memory']
      },
      {
        god: 'Hephaestus',
        responsibility: 'Backend API and database implementation',
        agentType: 'backend-dev',
        tools: ['Read', 'Write', 'Edit', 'Bash', 'github']
      },
      {
        god: 'Apollo',
        responsibility: 'Frontend UI/UX and user interface',
        agentType: 'frontend-dev',
        tools: ['Read', 'Write', 'Edit', 'Bash', 'browsermcp']
      }
    ];
    
    // Add specialists based on features
    if (session.requirements.features.some(f => f.includes('auth'))) {
      assignments.push({
        god: 'Aegis',
        responsibility: 'Security and authentication system',
        agentType: 'security-specialist',
        tools: ['Read', 'Write', 'Edit', 'github']
      });
    }
    
    assignments.push({
      god: 'Themis',
      responsibility: 'Testing, quality assurance, and documentation',
      agentType: 'tester',
      tools: ['Read', 'Write', 'Edit', 'Bash']
    });
    
    return assignments;
  }

  // Determine detailed timeline
  determineDetailedTimeline(session) {
    const timeline = session.requirements.timeline;
    
    if (timeline?.includes('2 week') || timeline?.includes('14 day')) {
      return `**Week 1**: Backend development, database setup, core API
**Week 2**: Frontend development, integration, testing`;
    } else if (timeline?.includes('1 week') || timeline?.includes('7 day')) {
      return `**Days 1-3**: Core backend and database
**Days 4-6**: Frontend and integration
**Day 7**: Testing and deployment`;
    } else if (timeline?.includes('month')) {
      return `**Week 1**: Architecture and backend foundation
**Week 2**: Core features implementation
**Week 3**: Frontend and user experience
**Week 4**: Testing, polish, and deployment`;
    } else {
      return `**Phase 1**: Foundation and core features
**Phase 2**: User interface and integration
**Phase 3**: Testing and deployment`;
    }
  }

  // Execute the approved plan
  async executeApprovedPlan(session) {
    const plan = session.proposalData;
    const spawnedAgents = [];
    
    try {
      // Create agents for each god assignment
      for (const assignment of plan.godAssignments) {
        // Here we would actually spawn claude-flow agents
        // For now, we'll simulate the process
        const agentConfig = {
          name: `${assignment.god.toLowerCase()}-agent-${Date.now()}`,
          type: assignment.agentType,
          tools: assignment.tools,
          mission: assignment.responsibility,
          context: {
            project: session.projectIdea,
            techStack: plan.techStack,
            features: plan.features,
            architecture: plan.architecture
          }
        };
        
        // In real implementation, this would call:
        // await this.pantheon.claudeFlowBridge.spawnAgent(agentConfig);
        
        spawnedAgents.push({
          god: assignment.god,
          agentName: agentConfig.name,
          status: 'spawned'
        });
      }
      
      // Update session with execution info
      session.executionStarted = new Date();
      session.spawnedAgents = spawnedAgents;
      
      return {
        success: true,
        message: `The following divine agents have been spawned:
${spawnedAgents.map(a => `• ${a.god}'s agent: ${a.agentName}`).join('\n')}

They are now actively building your project with the approved specifications.`,
        agents: spawnedAgents
      };
      
    } catch (error) {
      return {
        success: false,
        message: `There was an issue spawning the agents: ${error.message}. Please try again.`,
        error: error.message
      };
    }
  }

  async handleSpawnAgent(params) {
    const session = this.activeSessions.get(params.sessionId);
    
    // Verify session exists and is approved
    if (!session) {
      return { error: 'Session not found' };
    }
    
    if (session.currentPhase !== this.PHASES.APPROVED && session.currentPhase !== this.PHASES.EXECUTION) {
      return { error: 'Cannot spawn agents - plan not yet approved by user' };
    }
    
    try {
      // In real implementation, this would call claude-flow
      // For now, we'll track the spawned agent
      const agent = {
        id: `${params.godName}-agent-${Date.now()}`,
        god: params.godName,
        type: params.agentType,
        tools: params.tools || [],
        mission: params.mission,
        status: 'active',
        spawnedAt: new Date()
      };
      
      // Track in session
      if (!session.spawnedAgents) {
        session.spawnedAgents = [];
      }
      session.spawnedAgents.push(agent);
      
      return {
        success: true,
        agentId: agent.id,
        message: `${params.godName} has spawned a ${params.agentType} agent: ${agent.id}`,
        agent
      };
    } catch (error) {
      return {
        error: error.message,
        god: params.godName
      };
    }
  }

  /**
   * God-specific intelligent response generators
   */
  
  generateZeusResponse(context, message, analysis, session) {
    // Zeus is the orchestrator - he needs to understand project scope and coordinate
    // Note: messageContext and projectUnderstanding are already analyzed in generateGodResponse
    
    // Get necessary context for Zeus's decision making
    const messageContext = this.analyzeMessageContext(message);
    const projectUnderstanding = this.buildProjectUnderstanding(context);
    
    // Zeus's decision tree based on conversation state
    if (context.conversationHistory.length <= 2 && !session.requirements.users) {
      // Early conversation - need user context
      return {
        message: `Ah, "${context.projectIdea}" - a vision worthy of divine attention! 
        
To orchestrate the perfect team of gods, I must understand who will benefit from this creation.

Tell me about your users:
- Who are they? (individuals, teams, businesses?)
- What problems do they face that your creation will solve?
- How many users do you expect?

This knowledge shapes everything we build.`,
        expectsResponse: true
      };
    } else if (!session.requirements.timeline && session.requirements.users) {
      return {
        message: `Excellent! I understand your users: ${session.requirements.users}.

Now, let's discuss the timeline. In the divine realm, we work at different paces:

⚡ **Lightning Strike** (Days): Rapid prototype, essential features only
🌊 **Flowing River** (Weeks): Balanced approach, solid foundation
🏔️ **Mountain Building** (Months): Complete solution, fully polished

What timeline suits your vision for ${context.projectIdea}?`,
        expectsResponse: true
      };
    } else if (!projectUnderstanding.hasKeyFeatures && session.requirements.timeline) {
      return {
        message: `Perfect! With ${session.requirements.timeline} as our timeline, let me understand the core capabilities.

What are the essential features your ${session.requirements.users} need? Think about:
- The main actions they'll perform
- Critical functionality for launch
- Any unique requirements

Share your vision, and I'll summon the right gods to build it.`,
        expectsResponse: true
      };
    }
    
    // Check if we should create a proposal
    if (this.hasEnoughInfoForProposal(session) && !session.proposalShown) {
      session.proposalShown = true;
      session.awaitingApproval = true;
      return this.generateProjectProposal(session);
    }
    
    // Handle specific topics Zeus would address
    if (messageContext.asksAbout.includes('architecture') || messageContext.asksAbout.includes('technical')) {
      return {
        message: `For architectural decisions, let me summon Daedalus, our master architect, and Hephaestus, our divine craftsman. They'll design the perfect technical foundation for ${context.projectIdea}.

*Thunder rumbles as Zeus prepares to summon the technical gods*

Shall I bring them into our discussion?`,
        expectsResponse: true,
        suggestedHandoff: {
          to: 'daedalus',
          reason: 'Technical architecture discussion'
        }
      };
    }
    
    // Default Zeus response based on context
    return {
      message: this.generateContextualResponse('zeus', message, context, projectUnderstanding),
      expectsResponse: true
    };
  }

  generateApolloResponse(context, message, analysis, session) {
    // Apollo focuses on design, UX, and user delight
    const messageContext = this.analyzeMessageContext(message);
    const projectUnderstanding = this.buildProjectUnderstanding(context);
    
    // Apollo's perspective on the project
    const designFocus = this.extractDesignRequirements(context);
    
    if (messageContext.asksAbout.includes('design') || messageContext.asksAbout.includes('ui')) {
      return {
        message: `*Apollo's radiant presence illuminates the design possibilities*

For ${context.projectIdea}, I envision interfaces that inspire and delight!

Based on your ${session.requirements.users || 'users'}, I recommend:

🎨 **Design Philosophy**
${designFocus.style === 'modern' ? '• Clean, minimalist interfaces with bold accents' : '• Rich, interactive experiences'}
${designFocus.responsive ? '• Responsive design for all devices' : '• Optimized for your primary platform'}
${designFocus.accessible ? '• Accessibility-first approach' : '• Intuitive navigation patterns'}

What emotions should users feel when using your application? This guides our entire design approach.`,
        expectsResponse: true,
        artifacts: [{
          type: 'design-guidelines',
          content: this.generateDesignGuidelines(session)
        }]
      };
    }
    
    if (messageContext.mentions.includes('colors') || messageContext.mentions.includes('theme')) {
      return {
        message: `Color speaks to the soul! For ${context.projectIdea}, I suggest:

🎨 **Primary Palette**
${this.suggestColorPalette(context, session)}

These colors will evoke the right emotions in your ${session.requirements.users || 'users'} while maintaining excellent readability and accessibility.

Would you like me to create detailed design mockups with these colors?`,
        expectsResponse: true
      };
    }
    
    // Default Apollo response
    return {
      message: `From a design perspective, ${message.toLowerCase()} is crucial for user experience.

For ${context.projectIdea}, this impacts:
- Visual hierarchy and information flow
- User interaction patterns
- Emotional connection with the interface

Let me understand your specific vision better. What feeling should the design evoke?`,
      expectsResponse: true
    };
  }

  generateHephaestusResponse(context, message, analysis, session) {
    // Hephaestus focuses on robust technical implementation
    const messageContext = this.analyzeMessageContext(message);
    const technicalNeeds = this.analyzeTechnicalRequirements(context, session);
    
    if (messageContext.asksAbout.includes('backend') || messageContext.asksAbout.includes('api')) {
      return {
        message: `*The divine forge burns bright as Hephaestus speaks*

For the backend of ${context.projectIdea}, I shall forge a robust foundation!

Based on your requirements:
${technicalNeeds.hasRealTime ? '• Real-time capabilities with WebSocket integration' : '• RESTful API with efficient caching'}
${technicalNeeds.hasAuth ? '• Secure authentication with JWT tokens and role-based access' : ''}
${technicalNeeds.needsScale ? '• Scalable architecture ready for growth' : '• Optimized for rapid development'}

🔨 **Recommended Stack**
• **Framework**: ${technicalNeeds.recommendedFramework}
• **Database**: ${technicalNeeds.recommendedDatabase}
• **Caching**: ${technicalNeeds.recommendedCache}

Shall I begin forging the backend architecture? I'll create APIs that are both powerful and elegant.`,
        expectsResponse: true,
        artifacts: [{
          type: 'api-spec',
          content: this.generateAPISpecification(session, technicalNeeds)
        }]
      };
    }
    
    if (messageContext.asksAbout.includes('database') || messageContext.asksAbout.includes('data')) {
      return {
        message: `*Sparks fly from the divine anvil*

Data architecture is the foundation of any great system! For ${context.projectIdea}:

📊 **Database Design**
${this.generateDatabaseRecommendation(context, session, technicalNeeds)}

This structure will support your ${session.requirements.users || 'users'} efficiently while maintaining data integrity and performance.

Would you like me to create the complete database schema?`,
        expectsResponse: true
      };
    }
    
    // Default Hephaestus response
    return {
      message: `*Hephaestus examines the technical requirements*

"${message}" - yes, this is important for the technical foundation!

For ${context.projectIdea}, I recommend:
${this.generateTechnicalSuggestion(messageContext, technicalNeeds)}

What specific technical constraints or preferences do you have?`,
      expectsResponse: true
    };
  }

  generateAthenaResponse(context, message, analysis, session) {
    // Athena focuses on intelligent solutions, algorithms, and strategic thinking
    const messageContext = this.analyzeMessageContext(message);
    const intelligenceNeeds = this.analyzeIntelligenceRequirements(context, session);
    
    if (messageContext.asksAbout.includes('smart') || messageContext.asksAbout.includes('ai') || 
        messageContext.asksAbout.includes('algorithm')) {
      return {
        message: `*Athena's eyes gleam with strategic wisdom*

For ${context.projectIdea}, I see opportunities for intelligent enhancement!

🧠 **Intelligent Features**
${intelligenceNeeds.suggestions.map(s => `• ${s}`).join('\n')}

These features would greatly benefit your ${session.requirements.users || 'users'} by:
${intelligenceNeeds.benefits.map(b => `• ${b}`).join('\n')}

Which intelligent capabilities resonate most with your vision?`,
        expectsResponse: true
      };
    }
    
    if (messageContext.asksAbout.includes('security') || messageContext.asksAbout.includes('protect')) {
      return {
        message: `*Athena's strategic mind turns to defense*

Security requires both wisdom and vigilance. For ${context.projectIdea}:

🛡️ **Security Strategy**
${this.generateSecurityStrategy(context, session)}

Shall I summon Aegis, our security specialist, to implement these protections?`,
        expectsResponse: true,
        suggestedHandoff: {
          to: 'aegis',
          reason: 'Detailed security implementation'
        }
      };
    }
    
    // Default Athena response
    return {
      message: `*Athena contemplates the strategic implications*

Your point about "${message}" reveals deeper considerations for ${context.projectIdea}.

From a strategic perspective:
${this.generateStrategicInsight(messageContext, context, session)}

What are your thoughts on this approach?`,
      expectsResponse: true
    };
  }

  generateHermesResponse(context, message, analysis, session) {
    // Hermes focuses on communication, APIs, real-time features
    const messageContext = this.analyzeMessageContext(message);
    const projectUnderstanding = this.buildProjectUnderstanding(context);
    
    if (messageContext.asksAbout.includes('api') || messageContext.asksAbout.includes('integration') ||
        messageContext.asksAbout.includes('communication')) {
      return {
        message: `*Hermes arrives swiftly, ready to connect all systems*

For ${context.projectIdea}, seamless communication is essential!

🔗 **Integration Architecture**
${session.requirements.technology?.existing?.length > 0 ? 
  `• Connect with existing systems: ${session.requirements.technology.existing.join(', ')}` :
  '• RESTful API design with clear documentation'}
• Real-time WebSocket connections for live updates
• Message queuing for reliable async operations
${session.requirements.team?.structure === 'Distributed/Remote' ? 
  '• Event-driven architecture for distributed teams' : 
  '• High-performance local message passing'}

Your ${session.requirements.users || 'users'} will experience instant, reliable communication.

What external systems need to integrate with your platform?`,
        expectsResponse: true,
        artifacts: [{
          type: 'api-design',
          content: this.generateAPIDesign(session)
        }]
      };
    }
    
    if (messageContext.asksAbout.includes('real-time') || messageContext.asksAbout.includes('chat') ||
        messageContext.asksAbout.includes('notification')) {
      return {
        message: `*Hermes' winged sandals flutter with excitement*

Real-time features will make ${context.projectIdea} feel alive!

💬 **Communication Features**
${this.suggestCommunicationFeatures(context, session)}

${session.requirements.industry?.securityNeeds?.includes('Data encryption') ? 
  '\n🔒 All communications will be end-to-end encrypted for security.' : ''}

Which real-time capabilities are most critical for your users?`,
        expectsResponse: true
      };
    }
    
    // Default Hermes response
    return {
      message: `*Hermes considers the communication implications*

"${message}" - This touches on how information flows through ${context.projectIdea}.

From a connectivity perspective:
• API design patterns that scale
• Message protocols for reliability
• Integration points for extensibility

Let me understand your communication needs better. What systems or services need to talk to each other?`,
      expectsResponse: true
    };
  }

  generateThemisResponse(context, message, analysis, session) {
    // Themis focuses on quality, testing, best practices
    const messageContext = this.analyzeMessageContext(message);
    const qualityNeeds = this.analyzeQualityRequirements(context, session);
    
    if (messageContext.asksAbout.includes('test') || messageContext.asksAbout.includes('quality') ||
        messageContext.asksAbout.includes('reliable')) {
      return {
        message: `*Themis holds the scales of quality, perfectly balanced*

For ${context.projectIdea}, excellence requires rigorous standards!

⚖️ **Quality Framework**
${qualityNeeds.testingStrategy}
${session.requirements.industry?.compliance?.length > 0 ? 
  `\n📋 **Compliance Testing**\n${session.requirements.industry.compliance.map(c => `• ${c} validation`).join('\n')}` : ''}

🎯 **Coverage Goals**
• Unit tests: 80%+ coverage
• Integration tests for all APIs
• End-to-end tests for critical user journeys
${session.requirements.team?.size?.includes('Large') || session.requirements.team?.size?.includes('Enterprise') ? 
  '• Performance testing for scale' : ''}

Quality is not an afterthought but woven into every line of code.

What quality standards are non-negotiable for your project?`,
        expectsResponse: true,
        artifacts: [{
          type: 'testing-strategy',
          content: this.generateTestingStrategy(session)
        }]
      };
    }
    
    if (messageContext.asksAbout.includes('best practice') || messageContext.asksAbout.includes('standard')) {
      return {
        message: `*Themis' wisdom illuminates the path of excellence*

Best practices for ${context.projectIdea} should include:

📚 **Development Standards**
${this.generateBestPractices(context, session)}

These practices ensure your ${session.requirements.users || 'users'} receive a reliable, maintainable solution.

Which standards are most important to your team?`,
        expectsResponse: true
      };
    }
    
    // Default Themis response
    return {
      message: `*Themis weighs your words carefully*

"${message}" - Quality implications here are significant for ${context.projectIdea}.

From a standards perspective:
• Code review processes
• Testing methodologies  
• Documentation requirements
• Performance benchmarks

What level of quality assurance does your project require?`,
      expectsResponse: true
    };
  }

  generatePrometheusResponse(context, message, analysis, session) {
    // Prometheus focuses on innovation, cutting-edge tech, future-proofing
    const messageContext = this.analyzeMessageContext(message);
    const innovationOpportunities = this.analyzeInnovationPotential(context, session);
    
    if (messageContext.asksAbout.includes('innovate') || messageContext.asksAbout.includes('future') ||
        messageContext.asksAbout.includes('cutting-edge')) {
      return {
        message: `*Prometheus' eyes burn with the fire of innovation*

For ${context.projectIdea}, I see revolutionary possibilities!

🔥 **Innovation Opportunities**
${innovationOpportunities.suggestions.map(s => `• ${s}`).join('\n')}

🚀 **Future-Proofing Strategy**
${session.requirements.team?.implications?.includes('Need scalable architecture') ? 
  '• Microservices architecture for infinite scalability' : 
  '• Modular design for easy enhancement'}
• AI/ML integration points for future intelligence
• Blockchain-ready for decentralized features
• Edge computing capabilities

Your ${session.requirements.users || 'users'} deserve tomorrow's technology today!

Which innovations excite you most for this project?`,
        expectsResponse: true
      };
    }
    
    if (messageContext.asksAbout.includes('ai') || messageContext.asksAbout.includes('ml') ||
        messageContext.asksAbout.includes('automate')) {
      return {
        message: `*Prometheus shares the divine fire of artificial intelligence*

AI can transform ${context.projectIdea} into something extraordinary!

🤖 **AI Enhancement Opportunities**
${this.suggestAIFeatures(context, session)}

These capabilities would give your platform almost divine foresight.

How do you envision AI enhancing your users' experience?`,
        expectsResponse: true
      };
    }
    
    // Default Prometheus response
    return {
      message: `*Prometheus contemplates the technological horizon*

Your thoughts on "${message}" spark ideas for ${context.projectIdea}!

From an innovation standpoint:
• Emerging technologies that could revolutionize your solution
• Future trends to prepare for
• Breakthrough features that set you apart

What bold vision do you have for pushing boundaries?`,
      expectsResponse: true
    };
  }

  generateDaedalusResponse(context, message, analysis, session) {
    // Daedalus focuses on architecture, infrastructure, system design
    const messageContext = this.analyzeMessageContext(message);
    const architecturalNeeds = this.analyzeArchitecturalRequirements(context, session);
    
    if (messageContext.asksAbout.includes('architect') || messageContext.asksAbout.includes('infrastructure') ||
        messageContext.asksAbout.includes('scale')) {
      return {
        message: `*Daedalus unfurls architectural blueprints with master craftsman precision*

For ${context.projectIdea}, we must build on solid foundations!

🏛️ **System Architecture**
${architecturalNeeds.pattern}
${session.requirements.technology?.constraints?.includes('Must use AWS') ? 
  '\n☁️ **AWS Infrastructure**\n• ECS/EKS for container orchestration\n• RDS for managed databases\n• S3 for object storage\n• CloudFront for global CDN' : 
  '\n☁️ **Cloud-Native Design**\n• Container-based deployment\n• Managed database services\n• Auto-scaling capabilities'}

📐 **Design Principles**
• ${session.requirements.team?.size?.includes('Enterprise') ? 'Enterprise-grade reliability' : 'Simple, maintainable structure'}
• ${session.requirements.team?.structure === 'Distributed/Remote' ? 'Distributed system resilience' : 'Optimized for performance'}
• Clear separation of concerns
• Infrastructure as Code

This architecture will support your ${session.requirements.users || 'users'} at any scale.

What architectural constraints or preferences should I consider?`,
        expectsResponse: true,
        artifacts: [{
          type: 'architecture-diagram',
          content: this.generateArchitectureDiagram(session)
        }]
      };
    }
    
    if (messageContext.asksAbout.includes('database') || messageContext.asksAbout.includes('storage')) {
      return {
        message: `*Daedalus examines the data architecture requirements*

Data architecture for ${context.projectIdea} requires careful planning:

💾 **Storage Strategy**
${this.generateStorageStrategy(context, session)}

This design ensures data integrity while maintaining performance.

What are your data volume and access pattern expectations?`,
        expectsResponse: true
      };
    }
    
    // Default Daedalus response
    return {
      message: `*Daedalus studies the structural implications*

"${message}" - This has important architectural considerations for ${context.projectIdea}.

From an infrastructure perspective:
• System boundaries and interfaces
• Deployment topology
• Scaling strategies
• Reliability patterns

What architectural qualities are most critical for your success?`,
      expectsResponse: true
    };
  }

  generateAegisResponse(context, message, analysis, session) {
    // Aegis focuses on security, protection, compliance
    const messageContext = this.analyzeMessageContext(message);
    const securityRequirements = this.analyzeSecurityRequirements(context, session);
    
    if (messageContext.asksAbout.includes('security') || messageContext.asksAbout.includes('protect') ||
        messageContext.asksAbout.includes('compliance')) {
      return {
        message: `*Aegis raises the divine shield of protection*

For ${context.projectIdea}, security is paramount!

🛡️ **Security Architecture**
${securityRequirements.strategy}
${session.requirements.industry?.compliance?.length > 0 ? 
  `\n🔐 **Compliance Requirements**\n${session.requirements.industry.compliance.map(c => `• ${c} implementation`).join('\n')}` : ''}

🔒 **Protection Layers**
• Authentication: ${session.requirements.team?.size?.includes('Enterprise') ? 'SSO/SAML integration' : 'JWT-based auth'}
• Authorization: Role-based access control
• Encryption: AES-256 at rest, TLS 1.3 in transit
• Audit: Comprehensive activity logging
${session.requirements.industry?.securityNeeds?.length > 0 ? 
  `\n🎯 **Industry-Specific Security**\n${session.requirements.industry.securityNeeds.map(s => `• ${s}`).join('\n')}` : ''}

Your ${session.requirements.users || 'users'} can trust their data is fortress-protected.

What security concerns keep you up at night?`,
        expectsResponse: true,
        artifacts: [{
          type: 'security-checklist',
          content: this.generateSecurityChecklist(session)
        }]
      };
    }
    
    if (messageContext.asksAbout.includes('privacy') || messageContext.asksAbout.includes('gdpr')) {
      return {
        message: `*Aegis focuses on privacy protection*

Privacy is a sacred trust for ${context.projectIdea}!

🔐 **Privacy Framework**
${this.generatePrivacyFramework(context, session)}

These measures ensure complete user privacy compliance.

What privacy regulations apply to your user base?`,
        expectsResponse: true
      };
    }
    
    // Default Aegis response
    return {
      message: `*Aegis analyzes the security implications*

"${message}" - Security considerations here are critical for ${context.projectIdea}.

From a protection standpoint:
• Threat modeling and mitigation
• Vulnerability management
• Security testing protocols
• Incident response planning

What assets need the strongest protection?`,
      expectsResponse: true
    };
  }

  generateIntelligentResponse(godName, context, message, analysis, personality) {
    // Generic intelligent response for other gods
    const messageContext = this.analyzeMessageContext(message);
    const projectUnderstanding = this.buildProjectUnderstanding(context);
    
    // Build response based on god's expertise and conversation context
    const responseElements = [];
    
    // Acknowledge what the user said
    if (messageContext.hasQuestion) {
      responseElements.push(`Your question about "${messageContext.mainTopic}" is insightful.`);
    } else if (messageContext.hasStatement) {
      responseElements.push(`I understand - ${this.summarizeUserIntent(message, messageContext)}.`);
    }
    
    // Add god's perspective
    responseElements.push(`\n\nFrom my domain of ${personality.expertise}, this relates to ${context.projectIdea} in important ways:`);
    
    // Provide relevant insights
    const insights = this.generateGodInsights(godName, messageContext, projectUnderstanding, personality);
    responseElements.push(insights);
    
    // Ask a follow-up question to deepen understanding
    const followUp = this.generateFollowUpQuestion(godName, messageContext, projectUnderstanding);
    responseElements.push(`\n\n${followUp}`);
    
    return responseElements.join('\n');
  }

  /**
   * Helper functions for intelligent conversation
   */
  
  analyzeMessageContext(message) {
    const lower = message.toLowerCase();
    const context = {
      hasQuestion: message.includes('?'),
      hasStatement: !message.includes('?'),
      mentions: [],
      asksAbout: [],
      sentiment: 'neutral',
      mainTopic: '',
      intent: ''
    };
    
    // Identify what the message is about
    const topics = {
      technical: ['backend', 'frontend', 'api', 'database', 'server', 'code', 'framework'],
      design: ['design', 'ui', 'ux', 'interface', 'look', 'feel', 'color', 'layout'],
      features: ['feature', 'functionality', 'capability', 'need', 'want', 'require'],
      timeline: ['when', 'timeline', 'deadline', 'time', 'duration', 'long'],
      users: ['user', 'customer', 'people', 'audience', 'market'],
      architecture: ['architecture', 'structure', 'pattern', 'scalability', 'performance']
    };
    
    // Find mentions and topics
    for (const [category, keywords] of Object.entries(topics)) {
      for (const keyword of keywords) {
        if (lower.includes(keyword)) {
          context.mentions.push(keyword);
          if (!context.asksAbout.includes(category)) {
            context.asksAbout.push(category);
          }
        }
      }
    }
    
    // Determine main topic
    if (context.mentions.length > 0) {
      // Find the most relevant topic based on position and frequency
      context.mainTopic = this.extractMainTopic(message, context.mentions);
    }
    
    // Analyze intent
    if (lower.includes('how') || lower.includes('what') || lower.includes('why')) {
      context.intent = 'seeking_information';
    } else if (lower.includes('want') || lower.includes('need') || lower.includes('should')) {
      context.intent = 'expressing_requirement';
    } else if (lower.includes('think') || lower.includes('believe') || lower.includes('feel')) {
      context.intent = 'sharing_opinion';
    } else {
      context.intent = 'providing_information';
    }
    
    return context;
  }
  
  buildProjectUnderstanding(context) {
    const understanding = {
      projectType: '',
      complexity: 'medium',
      hasUserContext: false,
      hasTimeline: false,
      hasKeyFeatures: false,
      hasTechnicalPreferences: false,
      needsSpecialists: new Set(),
      completenessScore: 0
    };
    
    // Analyze the full conversation
    const fullConversation = context.conversationHistory
      .map(entry => entry.message)
      .join(' ')
      .toLowerCase();
    
    // Determine project type from conversation
    if (fullConversation.includes('app') || fullConversation.includes('application')) {
      understanding.projectType = 'application';
    } else if (fullConversation.includes('website') || fullConversation.includes('site')) {
      understanding.projectType = 'website';
    } else if (fullConversation.includes('api') || fullConversation.includes('service')) {
      understanding.projectType = 'service';
    } else if (fullConversation.includes('platform')) {
      understanding.projectType = 'platform';
    }
    
    // Check what we know from conversation content
    // Look for user context in conversation
    if (fullConversation.includes('team') || fullConversation.includes('user') || 
        fullConversation.includes('people') || fullConversation.includes('organization')) {
      understanding.hasUserContext = true;
      understanding.completenessScore += 25;
    }
    
    // Look for timeline in conversation
    if (fullConversation.includes('week') || fullConversation.includes('month') || 
        fullConversation.includes('timeline') || fullConversation.includes('deadline')) {
      understanding.hasTimeline = true;
      understanding.completenessScore += 25;
    }
    
    // Look for features in conversation
    if (fullConversation.includes('need') || fullConversation.includes('feature') || 
        fullConversation.includes('functionality') || fullConversation.includes('capability')) {
      understanding.hasKeyFeatures = true;
      understanding.completenessScore += 25;
    }
    
    // Identify needed specialists from conversation content
    if (fullConversation.includes('real-time') || fullConversation.includes('chat')) {
      understanding.needsSpecialists.add('hermes');
    }
    if (fullConversation.includes('secure') || fullConversation.includes('auth')) {
      understanding.needsSpecialists.add('aegis');
    }
    if (fullConversation.includes('beautiful') || fullConversation.includes('design')) {
      understanding.needsSpecialists.add('apollo');
    }
    
    return understanding;
  }
  
  updateSessionUnderstanding(session, messageContext, projectUnderstanding) {
    // Update session with extracted understanding
    if (!session.understanding) {
      session.understanding = {};
    }
    
    // Merge new understanding
    Object.assign(session.understanding, {
      projectType: projectUnderstanding.projectType || session.understanding.projectType,
      lastTopic: messageContext.mainTopic,
      conversationDepth: session.conversationHistory.length,
      identifiedNeeds: Array.from(projectUnderstanding.needsSpecialists)
    });
    
    // Extract and update requirements from natural conversation
    const message = session.conversationHistory[session.conversationHistory.length - 1].message;
    
    // Always attempt to extract user information from any message
    const userInfo = this.extractUserInfo(message);
    if (userInfo && !session.requirements.users) {
      session.requirements.users = userInfo;
    }
    
    // Always attempt to extract timeline information
    const timeline = this.extractTimeline(message);
    if (timeline && !session.requirements.timeline) {
      session.requirements.timeline = timeline;
    }
    
    // Always attempt to extract features
    const features = this.extractFeatures(message);
    if (features.length > 0) {
      // Add new features that aren't already in the list
      const existingFeatures = session.requirements.features || [];
      const newFeatures = features.filter(f => !existingFeatures.includes(f));
      if (newFeatures.length > 0) {
        session.requirements.features = [...existingFeatures, ...newFeatures];
      }
    }
    
    // Always attempt to extract budget information
    const budget = this.extractBudget(message);
    if (budget && !session.requirements.budget) {
      session.requirements.budget = budget;
    }
    
    // Always attempt to extract technology context
    const techContext = this.extractTechnologyContext(message);
    if (techContext) {
      // Merge new technology preferences/constraints
      if (techContext.preferences.length > 0) {
        session.requirements.technology.preferences = [
          ...new Set([...session.requirements.technology.preferences, ...techContext.preferences])
        ];
      }
      if (techContext.constraints.length > 0) {
        session.requirements.technology.constraints = [
          ...new Set([...session.requirements.technology.constraints, ...techContext.constraints])
        ];
      }
      if (techContext.existing.length > 0) {
        session.requirements.technology.existing = [
          ...new Set([...session.requirements.technology.existing, ...techContext.existing])
        ];
      }
      if (techContext.avoid.length > 0) {
        session.requirements.technology.avoid = [
          ...new Set([...session.requirements.technology.avoid, ...techContext.avoid])
        ];
      }
    }
    
    // Always attempt to extract industry context
    const industryContext = this.extractIndustryContext(message);
    if (industryContext.industry && !session.requirements.industry) {
      session.requirements.industry = industryContext;
    }
    
    // Always attempt to extract team context
    const teamContext = this.extractTeamContext(message);
    if ((teamContext.size || teamContext.stage || teamContext.structure || teamContext.composition.length > 0) 
        && !session.requirements.team) {
      session.requirements.team = teamContext;
    } else if (session.requirements.team && (teamContext.size || teamContext.stage || teamContext.structure || teamContext.composition.length > 0)) {
      // Merge new team information
      if (teamContext.size) session.requirements.team.size = teamContext.size;
      if (teamContext.stage) session.requirements.team.stage = teamContext.stage;
      if (teamContext.structure) session.requirements.team.structure = teamContext.structure;
      if (teamContext.composition.length > 0) {
        session.requirements.team.composition = [
          ...new Set([...session.requirements.team.composition, ...teamContext.composition])
        ];
      }
      if (teamContext.implications.length > 0) {
        session.requirements.team.implications = [
          ...new Set([...session.requirements.team.implications, ...teamContext.implications])
        ];
      }
    }
  }
  
  extractMainTopic(message, mentions) {
    // Simple heuristic: topic that appears earliest and/or most frequently
    let earliestPosition = message.length;
    let mainTopic = mentions[0] || '';
    
    for (const mention of mentions) {
      const position = message.toLowerCase().indexOf(mention);
      if (position !== -1 && position < earliestPosition) {
        earliestPosition = position;
        mainTopic = mention;
      }
    }
    
    return mainTopic;
  }
  
  extractUserInfo(message) {
    const lower = message.toLowerCase();
    
    // Extract company size from employee count
    const employeeMatch = message.match(/(\d+)\s*employees?/i);
    let companySize = '';
    if (employeeMatch) {
      const count = parseInt(employeeMatch[1]);
      if (count < 10) companySize = 'Small team';
      else if (count < 50) companySize = 'Growing company';
      else if (count < 200) companySize = 'Mid-size company';
      else companySize = 'Large company';
    }
    
    // Company stage patterns
    if (lower.includes('series a') && employeeMatch) {
      return `Series A company (${employeeMatch[1]} employees)`;
    }
    if (lower.includes('series b') && employeeMatch) {
      return `Series B company (${employeeMatch[1]} employees)`;
    }
    if (lower.includes('series c') && employeeMatch) {
      return `Series C company (${employeeMatch[1]} employees)`;
    }
    
    // Look for patterns that indicate user types
    if ((lower.includes('engineering') || lower.includes('developer')) && lower.includes('distributed')) {
      const sizeMatch = message.match(/(\d+)[\s-]*(?:to|-)[\s-]*(\d+)/);
      if (sizeMatch) {
        return `Distributed engineering teams of ${sizeMatch[1]}-${sizeMatch[2]} developers`;
      }
      return 'Distributed engineering teams';
    }
    
    if (lower.includes('team') && (lower.includes('remote') || lower.includes('distributed'))) {
      const sizeMatch = message.match(/(\d+)[\s-]*(?:to|-)[\s-]*(\d+)/);
      if (sizeMatch) {
        return `Remote teams of ${sizeMatch[1]}-${sizeMatch[2]} people`;
      }
      return 'Remote teams';
    }
    
    if (lower.includes('enterprise') || lower.includes('corporate')) {
      return 'Enterprise organizations';
    }
    
    if (lower.includes('startup') || lower.includes('small business')) {
      return 'Startups and small businesses';
    }
    
    if (lower.includes('individual') || lower.includes('personal')) {
      return 'Individual users';
    }
    
    // New pattern for "It's for X" statements
    const itsForPattern = /(?:it'?s?\s+for|this\s+is\s+for)\s+([^,.]+)/i;
    const itsForMatch = message.match(itsForPattern);
    if (itsForMatch) {
      const userDesc = itsForMatch[1].trim();
      // Check if there's a size mentioned
      const sizeMatch = message.match(/(\d+)[\s-]*(?:to|-)[\s-]*(\d+)/);
      if (sizeMatch) {
        return `${userDesc} (${sizeMatch[1]}-${sizeMatch[2]} people)`;
      }
      return userDesc;
    }
    
    // Company with employees fallback
    if (employeeMatch) {
      return `${companySize} (${employeeMatch[1]} employees)`;
    }
    
    // Extract from descriptive text
    const patterns = [
      /for\s+([^,.]+(?:teams|users|people|organizations|companies|groups?))/i,
      /([^,.]+(?:teams|users|people|organizations|companies|groups?))\s+will\s+use/i,
      /help(?:ing)?\s+([^,.]+(?:teams|users|people|organizations|companies|groups?))/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return null;
  }
  
  extractTimeline(message) {
    const lower = message.toLowerCase();
    
    // Look for specific timeline patterns
    const patterns = [
      /(\d+)\s*weeks?/i,
      /(\d+)\s*months?/i,
      /(\d+)\s*days?/i,
      /asap/i,
      /as\s+soon\s+as\s+possible/i,
      /urgent/i,
      /by\s+([^,.]+)/i
    ];
    
    // Handle "end of next month" type patterns
    if (lower.includes('end of next month') || lower.includes('by next month')) {
      return '4-5 weeks - End of next month';
    }
    
    if (lower.includes('end of this month')) {
      return '2-3 weeks - End of this month';
    }
    
    // Handle quarters
    if (lower.includes('q1') || lower.includes('q2') || lower.includes('q3') || lower.includes('q4')) {
      const quarterMatch = message.match(/[Qq](\d)/);
      if (quarterMatch) {
        return `By Q${quarterMatch[1]} - Quarterly planning`;
      }
    }
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        if (pattern.source.includes('asap') || pattern.source.includes('urgent')) {
          return 'ASAP - Urgent delivery';
        }
        if (pattern.source.includes('by\\s')) {
          // Extract the "by" deadline
          return `By ${match[1]}`;
        }
        if (match[1]) {
          return match[0];
        }
      }
    }
    
    // Check for descriptive timelines
    if (lower.includes('quick') || lower.includes('fast')) {
      return '1-2 weeks - Rapid development';
    }
    
    if (lower.includes('take') && lower.includes('time')) {
      return 'Flexible - Quality over speed';
    }
    
    // Handle relative time expressions
    if (lower.includes('soon') || lower.includes('shortly')) {
      return '2-4 weeks - Soon';
    }
    
    return null;
  }
  
  extractBudget(message) {
    const lower = message.toLowerCase();
    
    // Check for specific dollar amounts FIRST - these take priority
    // Enhanced pattern to catch "budget is around $150k" type phrases
    const amountPatterns = [
      /budget\s+(?:is\s+)?(?:around\s+|about\s+|approximately\s+)?\$?([\d,]+)k/i,
      /\$?([\d,]+)k\s+(?:budget|for\s+(?:the\s+)?(?:mvp|project|this))/i,
      /(?:budget|allocat\w+|spend\w*)\D{0,10}\$?([\d,]+)k/i,
      /around\s+\$?([\d,]+)k/i
    ];
    
    for (const pattern of amountPatterns) {
      const match = message.match(pattern);
      if (match) {
        const amount = match[1].replace(/,/g, '');
        return `$${amount}k budget`;
      }
    }
    
    // Check for budget ranges
    const budgetPattern = /(?:budget|cost|spend|allocat)\D{0,20}(?:between\s+)?\$?([\d,]+)k?\s*(?:to|-|and)\s*\$?([\d,]+)k?/i;
    const rangeMatch = message.match(budgetPattern);
    if (rangeMatch) {
      const min = rangeMatch[1].replace(/,/g, '');
      const max = rangeMatch[2].replace(/,/g, '');
      return `$${min}k-$${max}k budget`;
    }
    
    // Check descriptive terms (only if no specific amounts found)
    if (lower.includes('enterprise budget') || lower.includes('fortune 500')) {
      return 'Enterprise budget - Premium solutions viable';
    }
    if (lower.includes('bootstrap') || lower.includes('self-funded') || lower.includes('self funded')) {
      return 'Bootstrapped - Limited budget';
    }
    if (lower.includes('unlimited budget') || lower.includes('cost is no')) {
      return 'Flexible budget - Focus on best solution';
    }
    if (lower.includes('tight budget') || lower.includes('limited budget') || lower.includes('low budget')) {
      return 'Limited budget - Cost-conscious approach needed';
    }
    
    // Series funding indicators (only if no specific budget mentioned)
    if (lower.includes('series a') || lower.includes('series-a')) {
      return 'Series A funded ($2-15M typical)';
    }
    if (lower.includes('series b') || lower.includes('series-b')) {
      return 'Series B funded ($30-80M typical)';
    }
    if (lower.includes('series c') || lower.includes('series-c')) {
      return 'Series C funded ($50M+ typical)';
    }
    if (lower.includes('seed') && (lower.includes('fund') || lower.includes('round'))) {
      return 'Seed funded ($500k-2M typical)';
    }
    
    // Other funding sources
    if (lower.includes('vc fund') || lower.includes('venture capital')) {
      return 'VC funded - Growth-focused budget';
    }
    if (lower.includes('nonprofit') || lower.includes('non-profit')) {
      return 'Nonprofit - Budget-conscious';
    }
    
    // Budget implications from context
    if (lower.includes('mvp') && (lower.includes('budget') || lower.includes('tight') || lower.includes('constraint'))) {
      return 'MVP budget - Focus on core features';
    }
    
    return null;
  }

  extractTechnologyContext(message) {
    const lower = message.toLowerCase();
    const techContext = {
      preferences: [],
      constraints: [],
      existing: [],
      avoid: []
    };
    
    // Language preferences
    const languages = {
      'python': ['python', 'django', 'flask', 'fastapi'],
      'javascript': ['javascript', 'js', 'node', 'nodejs', 'react', 'vue', 'angular'],
      'java': ['java', 'spring', 'springboot'],
      'csharp': ['c#', 'csharp', '.net', 'dotnet'],
      'go': ['golang', ' go ', 'go-lang'],
      'ruby': ['ruby', 'rails'],
      'php': ['php', 'laravel', 'symfony']
    };
    
    // Check for language preferences (including implicit mentions)
    for (const [lang, keywords] of Object.entries(languages)) {
      if (keywords.some(kw => lower.includes(kw))) {
        // Check if it's a preference context (not existing systems or things to avoid)
        if ((lower.includes('prefer') || lower.includes('like') || lower.includes('want') || 
             lower.includes('using') || lower.includes('with') || lower.includes('stack')) &&
            !lower.includes('existing') && !lower.includes('current') && !lower.includes('already') &&
            !lower.includes('avoid') && !lower.includes("don't") && !lower.includes('no ')) {
          techContext.preferences.push(`${lang} preferred`);
        }
      }
    }
    
    // Cloud preferences
    if (lower.includes('aws') || lower.includes('amazon web')) {
      techContext.preferences.push('AWS cloud');
    }
    if (lower.includes('azure') || lower.includes('microsoft cloud')) {
      techContext.preferences.push('Azure cloud');
    }
    if (lower.includes('gcp') || lower.includes('google cloud')) {
      techContext.preferences.push('Google Cloud');
    }
    
    // Stack preferences
    if (lower.includes('modern stack') || lower.includes('cutting edge')) {
      techContext.preferences.push('Modern tech stack');
    }
    if (lower.includes('proven') || lower.includes('battle-tested')) {
      techContext.preferences.push('Mature, proven technologies');
    }
    if (lower.includes('serverless')) {
      techContext.preferences.push('Serverless architecture');
    }
    if (lower.includes('microservice')) {
      techContext.preferences.push('Microservices architecture');
    }
    if (lower.includes('monolith')) {
      techContext.preferences.push('Monolithic architecture');
    }
    
    // No-code/Low-code
    if (lower.includes('no-code') || lower.includes('no code')) {
      techContext.preferences.push('No-code solution preferred');
    }
    if (lower.includes('low-code') || lower.includes('low code')) {
      techContext.preferences.push('Low-code solution acceptable');
    }
    
    // Constraints
    if (lower.includes('must use') || lower.includes('have to use') || lower.includes('required to use')) {
      // Extract what must be used
      const mustUsePattern = /(?:must use|have to use|required to use)\s+([^,.]+)/i;
      const match = message.match(mustUsePattern);
      if (match) {
        techContext.constraints.push(`Must use ${match[1].trim()}`);
      }
    }
    
    // Existing systems
    if (lower.includes('existing') || lower.includes('current') || lower.includes('already have')) {
      const existingPattern = /(?:existing|current|already have)\s+([^,.]+)\s+(?:system|infrastructure|setup)/i;
      const match = message.match(existingPattern);
      if (match) {
        techContext.existing.push(match[1].trim());
      }
    }
    
    // What to avoid
    if (lower.includes('avoid') || lower.includes("don't want") || lower.includes('no ')) {
      const avoidPattern = /(?:avoid|don't want|no)\s+([^,.]+)/i;
      const match = message.match(avoidPattern);
      if (match) {
        techContext.avoid.push(match[1].trim());
      }
    }
    
    // Legacy system indicators
    if (lower.includes('legacy') || lower.includes('migrate from') || lower.includes('replace')) {
      techContext.constraints.push('Legacy system migration');
    }
    
    // Performance requirements
    if (lower.includes('high performance') || lower.includes('low latency')) {
      techContext.constraints.push('High performance required');
    }
    if (lower.includes('real-time') || lower.includes('realtime')) {
      techContext.constraints.push('Real-time capabilities needed');
    }
    
    return techContext;
  }

  extractIndustryContext(message) {
    const lower = message.toLowerCase();
    const industryContext = {
      industry: null,
      compliance: [],
      securityNeeds: [],
      specialRequirements: [],
      dataHandling: []
    };
    
    // Healthcare industry
    if (lower.includes('healthcare') || lower.includes('medical') || lower.includes('hospital') || 
        lower.includes('clinic') || lower.includes('patient') || lower.includes('health')) {
      industryContext.industry = 'Healthcare';
      industryContext.compliance.push('HIPAA compliance required');
      industryContext.securityNeeds.push('Patient data encryption', 'Access control', 'Audit trails');
      industryContext.specialRequirements.push('Medical record handling', 'Appointment scheduling');
      industryContext.dataHandling.push('PHI (Protected Health Information) handling');
    }
    
    // Financial services
    if (lower.includes('fintech') || lower.includes('financial') || lower.includes('banking') || 
        lower.includes('finance') || lower.includes('payment') || lower.includes('trading')) {
      industryContext.industry = 'Financial Services';
      industryContext.compliance.push('PCI DSS', 'SOX compliance', 'Financial regulations');
      industryContext.securityNeeds.push('Transaction security', 'Fraud detection', 'Data encryption');
      industryContext.specialRequirements.push('Transaction processing', 'Audit trails');
      industryContext.dataHandling.push('Financial data protection', 'PII handling');
    }
    
    // E-commerce / Retail
    if (lower.includes('ecommerce') || lower.includes('e-commerce') || lower.includes('retail') || 
        lower.includes('shop') || lower.includes('store') || lower.includes('marketplace')) {
      industryContext.industry = 'E-commerce/Retail';
      industryContext.compliance.push('PCI DSS for payments');
      industryContext.securityNeeds.push('Payment security', 'Customer data protection');
      industryContext.specialRequirements.push('Inventory management', 'Order processing', 'Shopping cart');
      industryContext.dataHandling.push('Customer data', 'Payment information');
    }
    
    // Education
    if (lower.includes('education') || lower.includes('school') || lower.includes('university') || 
        lower.includes('learning') || lower.includes('student') || lower.includes('teacher')) {
      industryContext.industry = 'Education';
      industryContext.compliance.push('FERPA compliance', 'COPPA for minors');
      industryContext.securityNeeds.push('Student data protection', 'Access control by role');
      industryContext.specialRequirements.push('Multi-user support', 'Progress tracking', 'Content management');
      industryContext.dataHandling.push('Student records', 'Grade information');
    }
    
    // Government / Public sector
    if (lower.includes('government') || lower.includes('federal') || lower.includes('municipal') || 
        lower.includes('public sector') || lower.includes('civic')) {
      industryContext.industry = 'Government/Public Sector';
      industryContext.compliance.push('FedRAMP', 'FISMA compliance', 'Section 508 accessibility');
      industryContext.securityNeeds.push('High security standards', 'Data sovereignty', 'Access controls');
      industryContext.specialRequirements.push('Accessibility requirements', 'Transparency features');
      industryContext.dataHandling.push('Citizen data protection', 'Public records management');
    }
    
    // Legal
    if (lower.includes('legal') || lower.includes('law firm') || lower.includes('attorney') || 
        lower.includes('lawyer') || lower.includes('litigation')) {
      industryContext.industry = 'Legal';
      industryContext.compliance.push('Attorney-client privilege', 'Legal hold requirements');
      industryContext.securityNeeds.push('Document security', 'Confidentiality', 'Access logging');
      industryContext.specialRequirements.push('Document management', 'Case tracking', 'Time billing');
      industryContext.dataHandling.push('Privileged information', 'Case documents');
    }
    
    // Real Estate
    if (lower.includes('real estate') || lower.includes('property') || lower.includes('realty') || 
        lower.includes('housing') || lower.includes('rental')) {
      industryContext.industry = 'Real Estate';
      industryContext.compliance.push('Fair Housing Act', 'RESPA compliance');
      industryContext.securityNeeds.push('Transaction security', 'Document protection');
      industryContext.specialRequirements.push('Property listings', 'Virtual tours', 'Document management');
      industryContext.dataHandling.push('Property data', 'Client information');
    }
    
    // Manufacturing
    if (lower.includes('manufacturing') || lower.includes('factory') || lower.includes('production') || 
        lower.includes('industrial') || lower.includes('supply chain')) {
      industryContext.industry = 'Manufacturing';
      industryContext.compliance.push('ISO standards', 'Safety regulations');
      industryContext.securityNeeds.push('IP protection', 'Supply chain security');
      industryContext.specialRequirements.push('Inventory tracking', 'Quality control', 'Supply chain management');
      industryContext.dataHandling.push('Production data', 'Supply chain information');
    }
    
    // Insurance
    if (lower.includes('insurance') || lower.includes('claims') || lower.includes('underwriting') || 
        lower.includes('policy') || lower.includes('coverage')) {
      industryContext.industry = 'Insurance';
      industryContext.compliance.push('State insurance regulations', 'HIPAA (if health insurance)');
      industryContext.securityNeeds.push('Claims data security', 'Customer data protection');
      industryContext.specialRequirements.push('Claims processing', 'Policy management', 'Risk assessment');
      industryContext.dataHandling.push('Policy holder data', 'Claims information');
    }
    
    // Non-profit
    if (lower.includes('nonprofit') || lower.includes('non-profit') || lower.includes('charity') || 
        lower.includes('ngo') || lower.includes('foundation')) {
      industryContext.industry = 'Non-profit';
      industryContext.compliance.push('501(c)(3) compliance', 'Donor privacy');
      industryContext.securityNeeds.push('Donor data protection', 'Financial transparency');
      industryContext.specialRequirements.push('Donation tracking', 'Volunteer management', 'Grant tracking');
      industryContext.dataHandling.push('Donor information', 'Beneficiary data');
    }
    
    return industryContext;
  }

  extractTeamContext(message) {
    const lower = message.toLowerCase();
    const teamContext = {
      size: null,
      stage: null,
      structure: null,
      composition: [],
      implications: []
    };
    
    // Extract team size - improved patterns
    const sizePatterns = [
      /(\d+)\s*(?:people|person|employees?|engineers?|developers?|team members?)/i,
      /team of (\d+)/i,
      /company (?:with|of|has) (\d+)/i,
      /total of (\d+) (?:people|employees)/i,
      /(\d+)[+]?\s*(?:engineers?|developers?)\s+(?:and|&|plus|\+)/i  // "30 developers and" pattern
    ];
    
    let sizeMatch = null;
    for (const pattern of sizePatterns) {
      const match = message.match(pattern);
      if (match) {
        sizeMatch = match;
        break;
      }
    }
    if (sizeMatch) {
      const size = parseInt(sizeMatch[1]);
      if (size <= 5) {
        teamContext.size = `${size} people - Small startup team`;
        teamContext.implications.push('Need simple processes', 'Focus on core features', 'Limited resources');
      } else if (size <= 20) {
        teamContext.size = `${size} people - Growing team`;
        teamContext.implications.push('Need collaboration tools', 'Starting to scale', 'Process standardization');
      } else if (size <= 50) {
        teamContext.size = `${size} people - Mid-size team`;
        teamContext.implications.push('Multiple teams', 'Need coordination', 'Clear ownership');
      } else if (size <= 200) {
        teamContext.size = `${size} people - Large organization`;
        teamContext.implications.push('Enterprise needs', 'Multiple departments', 'Governance required');
      } else {
        teamContext.size = `${size} people - Enterprise scale`;
        teamContext.implications.push('Enterprise architecture', 'Compliance critical', 'Multiple locations likely');
      }
    }
    
    // Detect team structure
    if (lower.includes('distributed') || lower.includes('remote') || lower.includes('across time zones')) {
      teamContext.structure = 'Distributed/Remote';
      teamContext.implications.push('Async communication important', 'Time zone considerations', 'Documentation critical');
    } else if (lower.includes('hybrid')) {
      teamContext.structure = 'Hybrid';
      teamContext.implications.push('Mixed communication needs', 'Flexible infrastructure');
    } else if (lower.includes('co-located') || lower.includes('same office')) {
      teamContext.structure = 'Co-located';
      teamContext.implications.push('Can use on-premise solutions', 'Real-time collaboration feasible');
    }
    
    // Detect growth stage from context
    if (lower.includes('just starting') || lower.includes('early stage') || lower.includes('pre-seed')) {
      teamContext.stage = 'Early stage startup';
      teamContext.implications.push('MVP focus', 'Rapid iteration needed', 'Cost-conscious');
    } else if (lower.includes('scaling') || lower.includes('series a') || lower.includes('growing fast')) {
      teamContext.stage = 'Scaling startup';
      teamContext.implications.push('Need scalable architecture', 'Process automation important', 'Team growth support');
    } else if (lower.includes('series b') || lower.includes('series c') || lower.includes('established')) {
      teamContext.stage = 'Established company';
      teamContext.implications.push('Stability important', 'Integration needs', 'Compliance matters');
    } else if (lower.includes('enterprise') || lower.includes('fortune') || lower.includes('public company')) {
      teamContext.stage = 'Enterprise';
      teamContext.implications.push('Enterprise requirements', 'Security critical', 'Audit trails needed');
    }
    
    // Detect team composition
    if (lower.includes('developers') || lower.includes('engineers') || lower.includes('engineering team')) {
      teamContext.composition.push('Engineering team');
    }
    if (lower.includes('designers') || lower.includes('design team') || lower.includes('ux')) {
      teamContext.composition.push('Design team');
    }
    if (lower.includes('product') || lower.includes('pm') || lower.includes('product managers')) {
      teamContext.composition.push('Product team');
    }
    if (lower.includes('sales') || lower.includes('sales team')) {
      teamContext.composition.push('Sales team');
    }
    if (lower.includes('marketing')) {
      teamContext.composition.push('Marketing team');
    }
    if (lower.includes('data scientists') || lower.includes('analysts') || lower.includes('data team')) {
      teamContext.composition.push('Data team');
    }
    if (lower.includes('operations') || lower.includes('ops team')) {
      teamContext.composition.push('Operations team');
    }
    
    // Specific patterns for team insights (only if no numeric size detected)
    if (!teamContext.size && (lower.includes('small team') || lower.includes('lean team'))) {
      teamContext.size = 'Small team';
      teamContext.implications.push('Need efficient tools', 'Everyone wears multiple hats', 'Simplicity important');
    }
    
    if (lower.includes('fast-growing') || lower.includes('doubling')) {
      teamContext.implications.push('Need scalable processes', 'Onboarding important', 'Knowledge management critical');
    }
    
    if (lower.includes('cross-functional')) {
      teamContext.structure = 'Cross-functional teams';
      teamContext.implications.push('Need collaboration tools', 'Clear communication channels', 'Shared ownership');
    }
    
    return teamContext;
  }

  extractFeatures(message) {
    const features = [];
    const lower = message.toLowerCase();
    
    // Common feature patterns
    const featureIndicators = {
      'authentication': ['login', 'auth', 'sign in', 'users can log'],
      'real-time updates': ['real-time', 'live updates', 'instant', 'websocket'],
      'chat/messaging': ['chat', 'message', 'communicate', 'talk'],
      'task management': ['task', 'todo', 'kanban', 'board'],
      'file uploads': ['upload', 'files', 'documents', 'attachments'],
      'notifications': ['notify', 'alert', 'notification', 'remind'],
      'search': ['search', 'find', 'filter', 'query'],
      'dashboard': ['dashboard', 'overview', 'analytics', 'metrics'],
      'api': ['api', 'integration', 'webhook', 'rest'],
      'mobile': ['mobile', 'ios', 'android', 'responsive']
    };
    
    for (const [feature, keywords] of Object.entries(featureIndicators)) {
      for (const keyword of keywords) {
        if (lower.includes(keyword)) {
          features.push(feature);
          break;
        }
      }
    }
    
    // Extract features from lists
    const listPattern = /(?:need|want|require|include)s?:?\s*([^.]+(?:,\s*and\s*[^.]+)?)/i;
    const match = message.match(listPattern);
    if (match) {
      const items = match[1].split(/,\s*(?:and\s*)?/);
      features.push(...items.map(item => item.trim()).filter(item => item.length > 2));
    }
    
    return [...new Set(features)]; // Remove duplicates
  }
  
  generateContextualResponse(godName, message, context, understanding) {
    // Generate a contextually appropriate response
    const responseTemplates = {
      zeus: {
        needsMoreInfo: `I need to understand more about your project to orchestrate the perfect divine team for ${context.projectIdea}.`,
        readyToSummon: `Based on what you've shared, I believe ${Array.from(understanding.needsSpecialists).join(', ')} would be perfect for this project. Shall I summon them?`,
        clarification: `When you mention "${message}", are you thinking about ${this.generateClarificationOptions(message, context)}?`,
        understanding: `I see - ${message}. This helps me understand your vision better. Let me ask you more about your specific needs.`
      }
    };
    
    // Choose appropriate template based on conversation state
    if (understanding.completenessScore < 50) {
      return responseTemplates[godName]?.needsMoreInfo || 
        `Tell me more about this aspect of ${context.projectIdea}.`;
    }
    
    if (understanding.needsSpecialists.size > 0) {
      return responseTemplates[godName]?.readyToSummon || 
        `Based on our discussion, I think we need some specialist gods for ${context.projectIdea}.`;
    }
    
    return responseTemplates[godName]?.understanding || 
      `Interesting point about "${message}". How does this fit into your overall vision for ${context.projectIdea}?`;
  }
  
  generateClarificationOptions(message, context) {
    // Generate relevant clarification options based on message content
    const options = [];
    const lower = message.toLowerCase();
    
    if (lower.includes('user')) {
      options.push('the end users of the system');
      options.push('internal team members');
      options.push('administrators');
    }
    
    if (lower.includes('fast') || lower.includes('quick')) {
      options.push('performance requirements');
      options.push('development timeline');
      options.push('time to market');
    }
    
    return options.slice(0, 2).join(' or ') || 'the technical requirements';
  }
  
  // Additional helper methods for specific gods
  
  extractDesignRequirements(context) {
    const requirements = {
      style: 'modern',
      responsive: true,
      accessible: false,
      animations: 'subtle'
    };
    
    const conversation = context.conversationHistory.map(h => h.message).join(' ').toLowerCase();
    
    if (conversation.includes('minimal') || conversation.includes('clean')) {
      requirements.style = 'minimalist';
    } else if (conversation.includes('rich') || conversation.includes('interactive')) {
      requirements.style = 'rich';
    }
    
    if (conversation.includes('mobile') || conversation.includes('responsive')) {
      requirements.responsive = true;
    }
    
    if (conversation.includes('accessible') || conversation.includes('accessibility')) {
      requirements.accessible = true;
    }
    
    return requirements;
  }
  
  suggestColorPalette(context, session) {
    // Suggest colors based on project type and user base
    const projectType = context.projectIdea.toLowerCase();
    
    if (projectType.includes('finance') || projectType.includes('business')) {
      return `• Navy Blue (#1e3a8a) - Trust and professionalism
• Emerald (#10b981) - Growth and success  
• Slate (#64748b) - Sophistication
• White (#ffffff) - Clarity`;
    }
    
    if (projectType.includes('health') || projectType.includes('medical')) {
      return `• Teal (#14b8a6) - Health and healing
• Sky Blue (#38bdf8) - Calm and trust
• Coral (#fb7185) - Warmth and care
• White (#ffffff) - Cleanliness`;
    }
    
    // Default modern palette
    return `• Indigo (#6366f1) - Primary brand color
• Purple (#a855f7) - Creative accent
• Gray (#6b7280) - Professional neutral
• White (#ffffff) - Clean background`;
  }
  
  generateDesignGuidelines(session) {
    return {
      typography: {
        headings: 'Inter or system fonts for clarity',
        body: '16px minimum for readability',
        hierarchy: 'Clear visual hierarchy with consistent spacing'
      },
      spacing: {
        unit: '8px grid system',
        sections: 'Generous whitespace between sections',
        mobile: 'Touch-friendly spacing (44px minimum)'
      },
      components: {
        buttons: 'Clear CTAs with hover states',
        forms: 'Inline validation and helpful errors',
        feedback: 'Toast notifications for user actions'
      }
    };
  }
  
  analyzeTechnicalRequirements(context, session) {
    const requirements = {
      hasRealTime: false,
      hasAuth: false,
      needsScale: false,
      recommendedFramework: 'Express.js',
      recommendedDatabase: 'PostgreSQL',
      recommendedCache: 'Redis'
    };
    
    const features = session.requirements.features || [];
    const conversation = context.conversationHistory.map(h => h.message).join(' ').toLowerCase();
    
    requirements.hasRealTime = features.some(f => f.includes('real-time')) || 
                              conversation.includes('real-time');
    
    requirements.hasAuth = features.some(f => f.includes('auth')) || 
                          conversation.includes('login');
    
    requirements.needsScale = conversation.includes('scale') || 
                             conversation.includes('million') ||
                             conversation.includes('enterprise');
    
    // Adjust recommendations based on requirements
    if (requirements.hasRealTime) {
      requirements.recommendedFramework = 'Express.js + Socket.io';
    }
    
    if (requirements.needsScale) {
      requirements.recommendedDatabase = 'PostgreSQL with read replicas';
      requirements.recommendedCache = 'Redis Cluster';
    }
    
    return requirements;
  }
  
  generateAPISpecification(session, technicalNeeds) {
    return {
      version: '1.0.0',
      baseUrl: '/api/v1',
      authentication: technicalNeeds.hasAuth ? 'JWT Bearer tokens' : 'API keys',
      endpoints: this.generateEndpoints(session, technicalNeeds),
      rateLimit: '100 requests per minute',
      format: 'RESTful JSON API'
    };
  }
  
  generateEndpoints(session, technicalNeeds) {
    const endpoints = [];
    
    if (technicalNeeds.hasAuth) {
      endpoints.push(
        { method: 'POST', path: '/auth/register', description: 'User registration' },
        { method: 'POST', path: '/auth/login', description: 'User login' },
        { method: 'POST', path: '/auth/refresh', description: 'Refresh tokens' }
      );
    }
    
    // Add feature-specific endpoints
    const features = session.requirements.features || [];
    features.forEach(feature => {
      if (feature.includes('task')) {
        endpoints.push(
          { method: 'GET', path: '/tasks', description: 'List tasks' },
          { method: 'POST', path: '/tasks', description: 'Create task' },
          { method: 'PUT', path: '/tasks/:id', description: 'Update task' }
        );
      }
    });
    
    return endpoints;
  }
  
  generateDatabaseRecommendation(context, session, technicalNeeds) {
    const users = session.requirements.users || 'users';
    const isComplex = session.requirements.features.length > 5;
    
    if (technicalNeeds.hasRealTime && isComplex) {
      return `I recommend a hybrid approach:
• PostgreSQL for core data (users, permissions, transactions)
• Redis for real-time state and caching
• Optional: TimescaleDB for time-series data

This combination handles both transactional integrity and real-time performance.`;
    }
    
    return `For ${users}, PostgreSQL is ideal:
• ACID compliance for data integrity
• JSON support for flexible schemas
• Full-text search capabilities
• Excellent performance with proper indexing

${technicalNeeds.needsScale ? 'With read replicas for scale.' : 'Single instance is sufficient for MVP.'}`;
  }
  
  generateTechnicalSuggestion(messageContext, technicalNeeds) {
    const suggestions = [];
    
    if (messageContext.mentions.includes('performance')) {
      suggestions.push('• Implement caching at multiple levels');
      suggestions.push('• Use database indexing strategically');
      suggestions.push('• Consider CDN for static assets');
    }
    
    if (messageContext.mentions.includes('security')) {
      suggestions.push('• Implement rate limiting and DDoS protection');
      suggestions.push('• Use parameterized queries to prevent SQL injection');
      suggestions.push('• Enable HTTPS and security headers');
    }
    
    return suggestions.length > 0 ? suggestions.join('\n') : 
      '• Build with scalability in mind\n• Follow security best practices\n• Maintain clean, documented code';
  }
  
  analyzeIntelligenceRequirements(context, session) {
    const features = session.requirements.features || [];
    const conversation = context.conversationHistory.map(h => h.message).join(' ').toLowerCase();
    
    const needs = {
      suggestions: [],
      benefits: []
    };
    
    // Analyze project type and suggest intelligent features
    if (session.projectIdea.includes('task') || session.projectIdea.includes('project')) {
      needs.suggestions.push('Smart task prioritization using ML algorithms');
      needs.suggestions.push('Predictive deadline estimation');
      needs.suggestions.push('Intelligent workload balancing');
      needs.benefits.push('Reducing cognitive load on users');
      needs.benefits.push('Improving project completion rates');
    }
    
    if (conversation.includes('data') || conversation.includes('analytics')) {
      needs.suggestions.push('Automated insight generation');
      needs.suggestions.push('Anomaly detection in patterns');
      needs.suggestions.push('Predictive analytics dashboard');
      needs.benefits.push('Discovering hidden patterns');
      needs.benefits.push('Making data-driven decisions easier');
    }
    
    return needs;
  }
  
  generateSecurityStrategy(context, session) {
    const timeline = session.requirements.timeline || '';
    const isRapid = timeline.includes('week') || timeline.includes('asap');
    
    if (isRapid) {
      return `• **Authentication**: JWT with refresh tokens
• **Authorization**: Role-based access control (RBAC)
• **Data Protection**: Encryption at rest and in transit
• **API Security**: Rate limiting and API keys
• **Monitoring**: Basic security event logging`;
    }
    
    return `• **Identity Management**: OAuth 2.0 + OpenID Connect
• **Zero Trust Architecture**: Verify every request
• **Defense in Depth**: Multiple security layers
• **Compliance**: GDPR/CCPA ready infrastructure
• **Advanced Monitoring**: SIEM integration and alerts`;
  }
  
  generateStrategicInsight(messageContext, context, session) {
    const insights = [];
    
    if (messageContext.mainTopic.includes('scale')) {
      insights.push('• Start with a monolith, prepare for microservices');
      insights.push('• Design APIs to be stateless from day one');
      insights.push('• Implement comprehensive logging early');
    } else if (messageContext.mainTopic.includes('user')) {
      insights.push('• Focus on the core user journey first');
      insights.push('• Build in analytics to understand behavior');
      insights.push('• Design for the 80% use case, accommodate the 20%');
    } else {
      insights.push('• Balance immediate needs with future flexibility');
      insights.push('• Document decisions for future team members');
      insights.push('• Build in observability from the start');
    }
    
    return insights.join('\n');
  }
  
  summarizeUserIntent(message, messageContext) {
    if (messageContext.intent === 'expressing_requirement') {
      return `you need ${messageContext.mainTopic || 'this capability'}`;
    } else if (messageContext.intent === 'seeking_information') {
      return `you're asking about ${messageContext.mainTopic || 'this aspect'}`;
    } else if (messageContext.intent === 'sharing_opinion') {
      return `you believe ${message.substring(0, 50)}...`;
    } else {
      return message.length > 50 ? `${message.substring(0, 50)}...` : message;
    }
  }
  
  generateGodInsights(godName, messageContext, projectUnderstanding, personality) {
    const insights = [];
    
    // Map god names to specific insight generators
    const godInsightMap = {
      'hermes': () => {
        if (messageContext.mentions.includes('communication') || messageContext.mentions.includes('real-time')) {
          insights.push('• Real-time communication requires careful protocol design');
          insights.push('• Consider both WebSocket and fallback transports');
          insights.push('• Message ordering and delivery guarantees are crucial');
        }
      },
      'aegis': () => {
        insights.push('• Security must be built in, not bolted on');
        insights.push('• Consider the principle of least privilege');
        insights.push('• Regular security audits are essential');
      },
      'themis': () => {
        insights.push('• Quality comes from comprehensive testing');
        insights.push('• Consider test-driven development');
        insights.push('• Documentation is as important as code');
      }
    };
    
    // Execute god-specific insights if available
    if (godInsightMap[godName]) {
      godInsightMap[godName]();
    }
    
    // Add generic insights based on expertise
    if (insights.length === 0) {
      insights.push(`• From ${personality.expertise}, this requires careful consideration`);
      insights.push(`• Best practices in ${personality.expertise} suggest a thoughtful approach`);
    }
    
    return insights.join('\n');
  }
  
  generateFollowUpQuestion(godName, messageContext, projectUnderstanding) {
    const questions = {
      'hermes': 'How important is real-time responsiveness for your users?',
      'aegis': 'What security concerns keep you up at night?',
      'themis': 'What quality standards are non-negotiable for this project?',
      'vulcan': 'Which tools and integrations are essential for your workflow?',
      'daedalus': 'How do you envision the system architecture evolving over time?'
    };
    
    return questions[godName] || 'What specific aspects of this would you like me to focus on?';
  }
  
  // Helper methods for god response generators
  generateAPIDesign(session) {
    const design = {
      overview: `RESTful API Design for ${session.projectIdea}`,
      authentication: session.requirements.features?.includes('authentication') ? 'JWT Bearer tokens' : 'API keys',
      endpoints: []
    };
    
    // Basic endpoints based on project type
    design.endpoints.push(
      { method: 'GET', path: '/api/v1/health', description: 'Health check endpoint' },
      { method: 'GET', path: '/api/v1/status', description: 'Service status and version' }
    );
    
    if (session.requirements.features?.includes('authentication')) {
      design.endpoints.push(
        { method: 'POST', path: '/api/v1/auth/login', description: 'User authentication' },
        { method: 'POST', path: '/api/v1/auth/refresh', description: 'Refresh auth token' },
        { method: 'POST', path: '/api/v1/auth/logout', description: 'Invalidate session' }
      );
    }
    
    return JSON.stringify(design, null, 2);
  }
  
  suggestCommunicationFeatures(context, session) {
    const features = [];
    
    if (session.requirements.features?.includes('real-time')) {
      features.push('• WebSocket connections for instant updates');
      features.push('• Server-sent events for one-way streaming');
    }
    
    if (session.requirements.features?.includes('chat')) {
      features.push('• Real-time messaging with presence indicators');
      features.push('• Message history and search');
      features.push('• File and media sharing');
    }
    
    if (session.requirements.features?.includes('notifications')) {
      features.push('• In-app notification system');
      features.push('• Email notification preferences');
      features.push('• Push notifications for mobile');
    }
    
    if (features.length === 0) {
      features.push('• REST API for standard communication');
      features.push('• Webhook support for integrations');
      features.push('• Event-driven architecture ready');
    }
    
    return features.join('\n');
  }
  
  analyzeQualityRequirements(context, session) {
    const requirements = {
      testingStrategy: '',
      coverageTargets: {},
      qualityGates: []
    };
    
    // Determine testing strategy based on project size and team
    if (session.requirements.team?.size?.includes('Enterprise') || 
        session.requirements.team?.size?.includes('Large')) {
      requirements.testingStrategy = `• Test-Driven Development (TDD)
• Automated CI/CD pipeline with quality gates
• Performance and load testing
• Security scanning in build process`;
    } else {
      requirements.testingStrategy = `• Unit tests for core functionality
• Integration tests for APIs
• Manual testing for UI flows
• Automated regression tests`;
    }
    
    return requirements;
  }
  
  generateTestingStrategy(session) {
    const strategy = {
      framework: 'Testing Strategy Document',
      levels: [
        {
          name: 'Unit Tests',
          tools: session.requirements.technology?.preferences?.includes('javascript') ? 
            ['Jest', 'Mocha'] : ['pytest', 'unittest'],
          coverage: '80%'
        },
        {
          name: 'Integration Tests',
          tools: ['Postman', 'REST Client'],
          focus: 'API endpoints and database operations'
        },
        {
          name: 'E2E Tests',
          tools: ['Cypress', 'Playwright'],
          scenarios: 'Critical user journeys'
        }
      ]
    };
    
    if (session.requirements.industry?.compliance?.length > 0) {
      strategy.compliance = {
        requirements: session.requirements.industry.compliance,
        validation: 'Automated compliance checks in CI/CD'
      };
    }
    
    return JSON.stringify(strategy, null, 2);
  }
  
  generateBestPractices(context, session) {
    const practices = [];
    
    // Code standards
    practices.push('**Code Standards**');
    practices.push('• Consistent code formatting (Prettier/ESLint)');
    practices.push('• Meaningful variable and function names');
    practices.push('• Comprehensive code comments');
    
    // Version control
    practices.push('\n**Version Control**');
    practices.push('• Git flow branching strategy');
    practices.push('• Meaningful commit messages');
    practices.push('• Code review requirements');
    
    // Documentation
    practices.push('\n**Documentation**');
    practices.push('• API documentation (OpenAPI/Swagger)');
    practices.push('• README with setup instructions');
    practices.push('• Architecture decision records');
    
    // Security
    if (session.requirements.industry?.securityNeeds?.length > 0) {
      practices.push('\n**Security Practices**');
      practices.push('• Security reviews for all PRs');
      practices.push('• Dependency vulnerability scanning');
      practices.push('• Regular security audits');
    }
    
    return practices.join('\n');
  }
  
  analyzeInnovationPotential(context, session) {
    const opportunities = {
      suggestions: [],
      emergingTech: []
    };
    
    // AI/ML opportunities
    if (!session.requirements.features?.includes('ai')) {
      opportunities.suggestions.push('AI-powered insights and predictions');
      opportunities.suggestions.push('Natural language processing for better UX');
    }
    
    // Based on industry
    if (session.requirements.industry?.industry === 'E-commerce/Retail') {
      opportunities.suggestions.push('AR/VR for virtual product experiences');
      opportunities.suggestions.push('Blockchain for supply chain transparency');
    } else if (session.requirements.industry?.industry === 'Healthcare') {
      opportunities.suggestions.push('IoT integration for patient monitoring');
      opportunities.suggestions.push('ML for predictive health analytics');
    }
    
    // General innovations
    opportunities.suggestions.push('Progressive Web App capabilities');
    opportunities.suggestions.push('Voice interface integration');
    opportunities.suggestions.push('Automated workflow optimization');
    
    return opportunities;
  }
  
  suggestAIFeatures(context, session) {
    const features = [];
    
    // Industry-specific AI features
    if (session.requirements.industry?.industry === 'E-commerce/Retail') {
      features.push('• Personalized product recommendations');
      features.push('• Dynamic pricing optimization');
      features.push('• Customer behavior prediction');
    } else if (session.requirements.industry?.industry === 'Healthcare') {
      features.push('• Symptom analysis and triage');
      features.push('• Treatment outcome prediction');
      features.push('• Medical image analysis');
    } else {
      features.push('• Intelligent search and filtering');
      features.push('• Automated content categorization');
      features.push('• Predictive analytics dashboard');
    }
    
    features.push('• Natural language chat interface');
    features.push('• Automated anomaly detection');
    features.push('• Smart notifications and alerts');
    
    return features.join('\n');
  }
  
  analyzeArchitecturalRequirements(context, session) {
    const requirements = {
      pattern: '',
      scalability: '',
      deployment: ''
    };
    
    // Determine architecture pattern
    if (session.requirements.team?.size?.includes('Enterprise') ||
        session.requirements.team?.implications?.includes('Need scalable architecture')) {
      requirements.pattern = `• Microservices architecture
• API Gateway pattern
• Service mesh for communication
• Event-driven design`;
    } else if (session.requirements.team?.size?.includes('Small')) {
      requirements.pattern = `• Modular monolith
• Clear service boundaries
• Database per service ready
• API-first design`;
    } else {
      requirements.pattern = `• Service-oriented architecture
• Shared database with clear schemas
• RESTful service design
• Message queue for async`;
    }
    
    return requirements;
  }
  
  generateArchitectureDiagram(session) {
    return `Architecture Overview for ${session.projectIdea}
    
    [Client Apps] --> [API Gateway] --> [Services]
                           |
                           v
                    [Load Balancer]
                           |
         +-----------------+-----------------+
         |                 |                 |
    [Service A]      [Service B]      [Service C]
         |                 |                 |
         v                 v                 v
    [Database A]     [Database B]     [Cache Layer]
    
    Infrastructure:
    - Cloud Provider: ${session.requirements.technology?.constraints?.includes('AWS') ? 'AWS' : 'Cloud-agnostic'}
    - Container Orchestration: Kubernetes
    - CI/CD: GitOps workflow
    - Monitoring: Prometheus + Grafana`;
  }
  
  generateStorageStrategy(context, session) {
    const strategy = [];
    
    // Primary database
    if (session.requirements.features?.includes('real-time')) {
      strategy.push('• PostgreSQL for transactional data');
      strategy.push('• Redis for real-time caching');
      strategy.push('• ElasticSearch for full-text search');
    } else {
      strategy.push('• PostgreSQL for primary storage');
      strategy.push('• Redis for session management');
    }
    
    // Scale considerations
    if (session.requirements.team?.implications?.includes('Enterprise needs')) {
      strategy.push('• Read replicas for scale');
      strategy.push('• Partitioning strategy for growth');
      strategy.push('• Multi-region replication');
    }
    
    // Compliance
    if (session.requirements.industry?.dataHandling?.length > 0) {
      strategy.push(`\n**Data Compliance**`);
      session.requirements.industry.dataHandling.forEach(dh => {
        strategy.push(`• ${dh}`);
      });
    }
    
    return strategy.join('\n');
  }
  
  analyzeSecurityRequirements(context, session) {
    const requirements = {
      strategy: '',
      priorities: []
    };
    
    // Base security strategy
    requirements.strategy = `• Defense in depth approach
• Zero trust architecture principles
• Encryption at rest and in transit
• Regular security audits`;
    
    // Industry-specific
    if (session.requirements.industry?.securityNeeds?.length > 0) {
      requirements.strategy += '\n\n**Industry Requirements**\n';
      requirements.strategy += session.requirements.industry.securityNeeds
        .map(need => `• ${need}`).join('\n');
    }
    
    // Team size implications
    if (session.requirements.team?.size?.includes('Enterprise')) {
      requirements.strategy += '\n\n**Enterprise Security**\n';
      requirements.strategy += `• SIEM integration
• SOC 2 compliance readiness
• Penetration testing schedule
• Security operations center`;
    }
    
    return requirements;
  }
  
  generateSecurityChecklist(session) {
    const checklist = {
      authentication: [
        'Multi-factor authentication',
        'Password complexity requirements',
        'Account lockout policies',
        'Session management'
      ],
      authorization: [
        'Role-based access control (RBAC)',
        'Principle of least privilege',
        'API key management',
        'Token expiration policies'
      ],
      dataProtection: [
        'Encryption at rest (AES-256)',
        'TLS 1.3 for data in transit',
        'Secure key management',
        'Data masking for PII'
      ],
      monitoring: [
        'Security event logging',
        'Intrusion detection',
        'Vulnerability scanning',
        'Incident response plan'
      ]
    };
    
    if (session.requirements.industry?.compliance?.length > 0) {
      checklist.compliance = session.requirements.industry.compliance;
    }
    
    return JSON.stringify(checklist, null, 2);
  }
  
  generatePrivacyFramework(context, session) {
    const framework = [];
    
    framework.push('**Data Collection**');
    framework.push('• Minimal data collection principle');
    framework.push('• Clear consent mechanisms');
    framework.push('• Purpose limitation');
    
    framework.push('\n**User Rights**');
    framework.push('• Right to access data');
    framework.push('• Right to deletion (RTBF)');
    framework.push('• Data portability');
    framework.push('• Opt-out mechanisms');
    
    framework.push('\n**Data Handling**');
    framework.push('• Data retention policies');
    framework.push('• Secure data disposal');
    framework.push('• Third-party data sharing controls');
    
    if (session.requirements.industry?.dataHandling?.length > 0) {
      framework.push('\n**Industry-Specific**');
      session.requirements.industry.dataHandling.forEach(dh => {
        framework.push(`• ${dh}`);
      });
    }
    
    return framework.join('\n');
  }
  
  generateDesignGuidelines(session) {
    const guidelines = {
      principles: [
        'User-centered design',
        'Accessibility first (WCAG 2.1 AA)',
        'Mobile-responsive layouts',
        'Consistent visual language'
      ],
      colorScheme: {
        primary: '#2563eb',
        secondary: '#7c3aed',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      typography: {
        headings: 'Inter or system font stack',
        body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
        monospace: 'Monaco, Consolas, "Courier New"'
      }
    };
    
    if (session.requirements.users) {
      guidelines.userConsiderations = `Optimized for ${session.requirements.users}`;
    }
    
    return JSON.stringify(guidelines, null, 2);
  }
}

/**
 * Create MCP server from Pantheon instance
 */
export function createMCPServer(pantheon) {
  const adapter = new MCPAdapter(pantheon);
  return adapter.createMCPServer();
}