import { EventEmitter } from 'events';

/**
 * Handles conversation failures and recovery strategies
 */
export class ConversationRecovery extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 2000;
    this.fallbackStrategies = new Map();
    this.recoveryHistory = [];
    
    this.initializeStrategies();
  }

  /**
   * Initialize default recovery strategies
   */
  initializeStrategies() {
    // Agent creation failures
    this.registerStrategy('agent-creation-failed', {
      name: 'Agent Creation Recovery',
      strategies: [
        {
          name: 'retry-with-simpler-config',
          apply: async (context) => {
            // Simplify agent configuration and retry
            const simplifiedConfig = {
              ...context.agent.spec,
              adaptations: {
                focus: context.agent.spec?.adaptations?.focus || 'General assistance'
              }
            };
            
            return {
              action: 'retry',
              config: simplifiedConfig,
              message: "I'm having a technical moment. Let me try a simpler approach..."
            };
          }
        },
        {
          name: 'use-default-agent',
          apply: async (context) => {
            // Fall back to a basic conversational agent
            return {
              action: 'substitute',
              agent: 'default-conversational',
              message: "I'll use my general conversation skills to help you."
            };
          }
        }
      ]
    });

    // Session state failures
    this.registerStrategy('session-state-error', {
      name: 'Session State Recovery',
      strategies: [
        {
          name: 'restore-from-checkpoint',
          apply: async (context) => {
            const lastCheckpoint = context.session.getLastCheckpoint();
            if (lastCheckpoint) {
              return {
                action: 'restore',
                checkpoint: lastCheckpoint,
                message: "Let me restore our conversation from a moment ago..."
              };
            }
            return null;
          }
        },
        {
          name: 'create-new-session',
          apply: async (context) => {
            return {
              action: 'new-session',
              carryOver: {
                topic: context.session.context.user.request,
                participants: Array.from(context.session.participants.keys())
              },
              message: "Let's start fresh while keeping our progress in mind."
            };
          }
        }
      ]
    });

    // Communication failures
    this.registerStrategy('handoff-failed', {
      name: 'Handoff Recovery',
      strategies: [
        {
          name: 'retry-handoff',
          apply: async (context) => {
            return {
              action: 'retry',
              delay: this.retryDelay,
              message: "One moment, let me reconnect with my colleague..."
            };
          }
        },
        {
          name: 'continue-with-current',
          apply: async (context) => {
            return {
              action: 'continue',
              god: context.fromGod,
              message: "I'll continue helping you while we sort out the handoff."
            };
          }
        },
        {
          name: 'escalate-to-orchestrator',
          apply: async (context) => {
            return {
              action: 'escalate',
              target: 'zeus',
              message: "Let me bring in Zeus to help coordinate."
            };
          }
        }
      ]
    });

    // Execution failures
    this.registerStrategy('execution-error', {
      name: 'Execution Recovery',
      strategies: [
        {
          name: 'retry-with-timeout',
          apply: async (context) => {
            return {
              action: 'retry',
              timeout: 30000,
              message: "Let me try that again with a bit more time..."
            };
          }
        },
        {
          name: 'break-down-task',
          apply: async (context) => {
            return {
              action: 'decompose',
              subtasks: this.decomposeTask(context.task),
              message: "Let me break this down into smaller steps."
            };
          }
        }
      ]
    });

    // Network/timeout failures
    this.registerStrategy('timeout', {
      name: 'Timeout Recovery',
      strategies: [
        {
          name: 'extend-timeout',
          apply: async (context) => {
            return {
              action: 'retry',
              timeout: context.timeout * 2,
              message: "This is taking longer than expected. Let me continue working on it..."
            };
          }
        },
        {
          name: 'checkpoint-and-continue',
          apply: async (context) => {
            return {
              action: 'checkpoint',
              resumable: true,
              message: "I'll save our progress and continue. You can check back later."
            };
          }
        }
      ]
    });

    // General failures
    this.registerStrategy('unknown-error', {
      name: 'General Recovery',
      strategies: [
        {
          name: 'graceful-degradation',
          apply: async (context) => {
            return {
              action: 'degrade',
              capabilities: this.getReducedCapabilities(context),
              message: "I'm experiencing some issues, but I can still help with basic questions."
            };
          }
        },
        {
          name: 'human-escalation',
          apply: async (context) => {
            return {
              action: 'escalate-human',
              context: this.prepareEscalationContext(context),
              message: "I'm having trouble with this. Would you like me to save our progress for human review?"
            };
          }
        }
      ]
    });
  }

  /**
   * Register a recovery strategy
   */
  registerStrategy(errorType, strategyConfig) {
    this.fallbackStrategies.set(errorType, strategyConfig);
  }

  /**
   * Handle agent failure
   */
  async handleAgentFailure(session, failedAgent, error) {
    const context = {
      session,
      agent: failedAgent,
      error,
      errorType: this.classifyError(error),
      attempt: this.getAttemptCount(session.id, failedAgent.id)
    };

    // Log comprehensive debug info
    await this.logFailure(context);

    // Select recovery strategy
    const recovery = await this.selectRecoveryStrategy(context);

    if (!recovery) {
      // No recovery possible
      return this.handleUnrecoverableError(context);
    }

    // Apply recovery
    try {
      const result = await this.applyRecovery(recovery, context);
      
      // Record successful recovery
      this.recordRecovery(context, recovery, result);
      
      return result;
      
    } catch (recoveryError) {
      // Recovery itself failed
      return this.handleRecoveryFailure(context, recovery, recoveryError);
    }
  }

  /**
   * Classify error type
   */
  classifyError(error) {
    if (error.message?.includes('agent creation')) {
      return 'agent-creation-failed';
    }
    if (error.message?.includes('session') || error.message?.includes('state')) {
      return 'session-state-error';
    }
    if (error.message?.includes('handoff')) {
      return 'handoff-failed';
    }
    if (error.message?.includes('timeout')) {
      return 'timeout';
    }
    if (error.message?.includes('execution')) {
      return 'execution-error';
    }
    return 'unknown-error';
  }

  /**
   * Select appropriate recovery strategy
   */
  async selectRecoveryStrategy(context) {
    const strategies = this.fallbackStrategies.get(context.errorType);
    if (!strategies) {
      return null;
    }

    // Try strategies in order
    for (const strategy of strategies.strategies) {
      const result = await strategy.apply(context);
      if (result) {
        return {
          ...result,
          strategy: strategy.name,
          type: context.errorType
        };
      }
    }

    return null;
  }

  /**
   * Apply recovery strategy
   */
  async applyRecovery(recovery, context) {
    this.emit('recovery:started', {
      type: recovery.type,
      strategy: recovery.strategy,
      sessionId: context.session.id
    });

    switch (recovery.action) {
      case 'retry':
        return await this.retryWithDelay(recovery, context);
        
      case 'substitute':
        return await this.substituteAgent(recovery, context);
        
      case 'restore':
        return await this.restoreFromCheckpoint(recovery, context);
        
      case 'new-session':
        return await this.createNewSession(recovery, context);
        
      case 'continue':
        return await this.continueWithCurrent(recovery, context);
        
      case 'escalate':
        return await this.escalateToGod(recovery, context);
        
      case 'decompose':
        return await this.decomposeAndRetry(recovery, context);
        
      case 'checkpoint':
        return await this.checkpointAndContinue(recovery, context);
        
      case 'degrade':
        return await this.degradeGracefully(recovery, context);
        
      case 'escalate-human':
        return await this.escalateToHuman(recovery, context);
        
      default:
        throw new Error(`Unknown recovery action: ${recovery.action}`);
    }
  }

  /**
   * Retry with delay
   */
  async retryWithDelay(recovery, context) {
    await new Promise(resolve => setTimeout(resolve, recovery.delay || this.retryDelay));
    
    // Update attempt count
    this.incrementAttempt(context.session.id, context.agent?.id);
    
    return {
      action: 'retry',
      config: recovery.config,
      message: recovery.message
    };
  }

  /**
   * Substitute with fallback agent
   */
  async substituteAgent(recovery, context) {
    return {
      action: 'substitute',
      agentType: recovery.agent,
      message: recovery.message,
      context: context.session.getContextForGod(context.agent?.parentGod)
    };
  }

  /**
   * Create new session with context carry-over
   */
  async createNewSession(recovery, context) {
    const carryOver = {
      ...recovery.carryOver,
      previousSessionId: context.session.id,
      recoveredFrom: context.errorType
    };
    
    return {
      action: 'new-session',
      carryOver,
      message: recovery.message
    };
  }

  /**
   * Log failure comprehensively
   */
  async logFailure(context) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      sessionId: context.session.id,
      agentId: context.agent?.id,
      errorType: context.errorType,
      error: {
        message: context.error.message,
        stack: context.error.stack,
        code: context.error.code
      },
      sessionState: await context.session.getDebugReport(),
      attempt: context.attempt
    };
    
    this.recoveryHistory.push(logEntry);
    
    this.emit('failure:logged', logEntry);
  }

  /**
   * Record successful recovery
   */
  recordRecovery(context, recovery, result) {
    const record = {
      timestamp: new Date().toISOString(),
      sessionId: context.session.id,
      errorType: context.errorType,
      strategy: recovery.strategy,
      action: recovery.action,
      success: true,
      result: result
    };
    
    this.recoveryHistory.push(record);
    
    this.emit('recovery:success', record);
  }

  /**
   * Handle unrecoverable error
   */
  async handleUnrecoverableError(context) {
    const message = this.generateFailureMessage(context);
    
    this.emit('error:unrecoverable', {
      sessionId: context.session.id,
      errorType: context.errorType,
      message
    });
    
    return {
      action: 'fail',
      message,
      canResume: false
    };
  }

  /**
   * Generate user-friendly failure message
   */
  generateFailureMessage(context) {
    const messages = {
      'agent-creation-failed': "I'm having trouble accessing my specialized skills right now. Please try again in a moment.",
      'session-state-error': "There was an issue with our conversation state. Would you like to start fresh?",
      'handoff-failed': "I couldn't connect with my colleague. Let me continue helping you myself.",
      'timeout': "This is taking longer than expected. Would you like to continue or try a different approach?",
      'execution-error': "I encountered an error while working on that. Let me try a different approach.",
      'unknown-error': "I'm experiencing technical difficulties. Please bear with me while I recover."
    };
    
    return messages[context.errorType] || messages['unknown-error'];
  }

  /**
   * Get attempt count for agent
   */
  getAttemptCount(sessionId, agentId) {
    const key = `${sessionId}:${agentId}`;
    return this.attemptCounts?.get(key) || 0;
  }

  /**
   * Increment attempt count
   */
  incrementAttempt(sessionId, agentId) {
    if (!this.attemptCounts) {
      this.attemptCounts = new Map();
    }
    
    const key = `${sessionId}:${agentId}`;
    const current = this.attemptCounts.get(key) || 0;
    this.attemptCounts.set(key, current + 1);
  }

  /**
   * Decompose task into subtasks
   */
  decomposeTask(task) {
    // Simple task decomposition logic
    // In a real implementation, this would be more sophisticated
    return [
      {
        id: 'subtask-1',
        description: 'Understand requirements',
        simplified: true
      },
      {
        id: 'subtask-2',
        description: 'Create basic solution',
        simplified: true
      },
      {
        id: 'subtask-3',
        description: 'Refine and complete',
        simplified: true
      }
    ];
  }

  /**
   * Get reduced capabilities for graceful degradation
   */
  getReducedCapabilities(context) {
    return {
      conversation: true,
      basicQuestions: true,
      complexTasks: false,
      agentCreation: false,
      tools: ['basic']
    };
  }

  /**
   * Prepare context for human escalation
   */
  prepareEscalationContext(context) {
    return {
      sessionId: context.session.id,
      errorSummary: context.error.message,
      conversationHistory: context.session.timeline.slice(-10),
      participantSummary: context.session.getParticipantSummary(),
      lastSuccessfulAction: this.getLastSuccessfulAction(context.session)
    };
  }

  /**
   * Get last successful action from session
   */
  getLastSuccessfulAction(session) {
    const successfulEvents = session.timeline
      .filter(event => !event.error && !event.failed)
      .reverse();
    
    return successfulEvents[0] || null;
  }

  /**
   * Get recovery statistics
   */
  getStatistics() {
    const stats = {
      totalFailures: 0,
      totalRecoveries: 0,
      byErrorType: {},
      byStrategy: {},
      successRate: 0
    };
    
    for (const entry of this.recoveryHistory) {
      if (entry.error) {
        stats.totalFailures++;
        stats.byErrorType[entry.errorType] = (stats.byErrorType[entry.errorType] || 0) + 1;
      }
      
      if (entry.success) {
        stats.totalRecoveries++;
        stats.byStrategy[entry.strategy] = (stats.byStrategy[entry.strategy] || 0) + 1;
      }
    }
    
    if (stats.totalFailures > 0) {
      stats.successRate = (stats.totalRecoveries / stats.totalFailures) * 100;
    }
    
    return stats;
  }

  /**
   * Clear recovery history
   */
  clearHistory() {
    this.recoveryHistory = [];
    this.attemptCounts?.clear();
  }
}