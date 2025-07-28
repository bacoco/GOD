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
      const zeus = await this.pantheon.summon('zeus');
      const conversation = await zeus.startConversation(params.idea, {
        context: params.context,
        conversational: true
      });

      // Store session
      this.activeSessions.set(sessionId, {
        id: sessionId,
        projectName: conversation.projectName || 'Unnamed Project',
        projectIdea: params.idea,
        currentPhase: 'discovery',
        currentSpeaker: 'zeus',
        conversation: conversation.session,
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
      const currentGod = await this.pantheon.getGod(session.currentSpeaker);
      
      // Continue conversation
      const response = await currentGod.continueConversation(
        session.conversation,
        params.message
      );

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
    const sessionId = params.sessionId || this.getCurrentSessionId();
    
    try {
      // Summon Concilium to facilitate
      const concilium = await this.pantheon.summon('concilium');
      
      // Create council meeting
      const meeting = await concilium.conveneCouncil({
        type: params.type,
        topic: params.topic,
        participants: params.participants,
        sessionContext: sessionId ? this.activeSessions.get(sessionId) : null
      });

      // Store meeting in session if exists
      if (sessionId) {
        const session = this.activeSessions.get(sessionId);
        session.meetings = [...(session.meetings || []), meeting];
      }

      return {
        sessionId,
        speaker: 'Concilium',
        speakerAvatar: '🏛️',
        speakerTitle: 'Divine Council Facilitator',
        message: meeting.opening,
        meeting: {
          id: meeting.id,
          type: params.type,
          participants: meeting.participants,
          agenda: meeting.agenda
        },
        expectsResponse: true
      };
    } catch (error) {
      return {
        error: error.message,
        suggestion: 'Specify a valid meeting type and topic'
      };
    }
  }

  async handleSummon(params) {
    const sessionId = params.sessionId || this.getCurrentSessionId();
    
    try {
      const god = await this.pantheon.summon(params.god);
      
      // Update session if exists
      if (sessionId) {
        const session = this.activeSessions.get(sessionId);
        session.currentSpeaker = params.god;
        session.participants.push(params.god);
      }

      const introduction = await god.introduce(params.reason);

      return {
        sessionId,
        speaker: god.name,
        speakerAvatar: god.avatar,
        speakerTitle: god.title,
        message: introduction,
        expectsResponse: true
      };
    } catch (error) {
      return {
        error: error.message,
        availableGods: await this.pantheon.getAvailableGodNames()
      };
    }
  }

  async handleToolRequest(params) {
    const sessionId = params.sessionId || this.getCurrentSessionId();
    
    try {
      const vulcan = await this.pantheon.summon('vulcan');
      
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
      const god = await this.pantheon.getGod(params.god);
      
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
}

/**
 * Create MCP server from Pantheon instance
 */
export function createMCPServer(pantheon) {
  const adapter = new MCPAdapter(pantheon);
  return adapter.createMCPServer();
}