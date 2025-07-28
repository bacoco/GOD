import BaseGod from '../base-god.js';
import { DivineCouncilRoom } from '../divine-council-room.js';
import { EventEmitter } from 'events';

/**
 * Concilium - The Divine Council Facilitator
 * Orchestrates meetings between gods and mortals
 */
export default class Concilium extends BaseGod {
  constructor(options) {
    super(options);
    
    this.title = 'Divine Council Facilitator';
    this.emoji = '🏛️';
    this.activeRooms = new Map();
    this.meetingHistory = [];
    this.userProfiles = new Map();
    
    // Meeting configuration
    this.meetingTypes = {
      standup: {
        name: 'Daily Standup',
        duration: 15,
        gods: ['hermes'],
        format: 'round-robin'
      },
      sprint_planning: {
        name: 'Sprint Planning',
        duration: 60,
        gods: ['hermes', 'prometheus', 'hephaestus'],
        format: 'structured-agenda'
      },
      code_review: {
        name: 'Code Review',
        duration: 30,
        gods: ['hephaestus', 'themis'],
        format: 'presentation-discussion'
      },
      architecture: {
        name: 'Architecture Review',
        duration: 45,
        gods: ['daedalus', 'athena'],
        format: 'whiteboard-session'
      },
      design_review: {
        name: 'Design Review',
        duration: 45,
        gods: ['apollo', 'iris', 'calliope'],
        format: 'showcase-feedback'
      },
      emergency: {
        name: 'Emergency Response',
        duration: null, // No time limit
        gods: ['aegis', 'themis', 'hephaestus'],
        format: 'crisis-mode'
      },
      brainstorm: {
        name: 'Brainstorming Session',
        duration: 30,
        gods: [], // Dynamically selected
        format: 'free-form'
      }
    };
    
    // User roles and permissions
    this.userRoles = {
      observer: {
        canSpeak: false,
        canVote: false,
        canModerate: false,
        canSeeAll: true,
        description: 'Watch and learn'
      },
      participant: {
        canSpeak: true,
        canVote: true,
        canModerate: false,
        canSeeAll: true,
        description: 'Active contributor'
      },
      moderator: {
        canSpeak: true,
        canVote: true,
        canModerate: true,
        canSeeAll: true,
        description: 'Meeting facilitator'
      },
      owner: {
        canSpeak: true,
        canVote: true,
        canModerate: true,
        canSeeAll: true,
        canDelete: true,
        canInvite: true,
        description: 'Full control'
      }
    };
  }

  async onInitialize() {
    await super.onInitialize();
    
    this.emit('concilium:ready', {
      meetingTypes: Object.keys(this.meetingTypes),
      activeRooms: this.activeRooms.size
    });
  }

  /**
   * Create a new meeting room
   */
  async createMeeting(options) {
    const {
      title,
      type = 'brainstorm',
      requestedGods = [],
      userRole = 'participant',
      userId,
      agenda = [],
      context = {}
    } = options;
    
    // Generate room ID
    const roomId = `council-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Get meeting configuration
    const meetingConfig = this.meetingTypes[type] || this.meetingTypes.brainstorm;
    
    // Determine which gods to summon
    const godsToSummon = this.selectGodsForMeeting(type, requestedGods, context);
    
    // Create the room
    const room = new DivineCouncilRoom({
      id: roomId,
      title: title || meetingConfig.name,
      type,
      facilitator: this,
      messenger: this.messenger,
      config: meetingConfig,
      userRole,
      userId,
      agenda
    });
    
    // Initialize room
    await room.initialize();
    
    // Store room
    this.activeRooms.set(roomId, room);
    
    // Summon gods to the meeting
    const summonedGods = await this.summonGodsToMeeting(room, godsToSummon);
    
    // Send welcome message
    await room.addMessage({
      from: 'concilium',
      content: this.generateWelcomeMessage(room, summonedGods),
      type: 'system'
    });
    
    // Track in history
    this.meetingHistory.push({
      roomId,
      title: room.title,
      type,
      startTime: new Date(),
      participants: {
        user: { id: userId, role: userRole },
        gods: summonedGods.map(g => g.name)
      }
    });
    
    this.emit('meeting:created', {
      roomId,
      title: room.title,
      type,
      gods: summonedGods.map(g => g.name)
    });
    
    return {
      roomId,
      room,
      joinUrl: `/meeting/${roomId}`,
      gods: summonedGods
    };
  }

  /**
   * Select appropriate gods for the meeting
   */
  selectGodsForMeeting(type, requestedGods, context) {
    // Start with type-specific gods
    let gods = [...(this.meetingTypes[type]?.gods || [])];
    
    // Add requested gods
    gods = [...new Set([...gods, ...requestedGods])];
    
    // Smart selection based on context
    if (context.topic) {
      const topicGods = this.recommendGodsForTopic(context.topic);
      gods = [...new Set([...gods, ...topicGods])];
    }
    
    // Limit to reasonable number
    if (gods.length > 5 && type !== 'emergency') {
      gods = this.prioritizeGods(gods, context).slice(0, 5);
    }
    
    return gods;
  }

  /**
   * Recommend gods based on topic
   */
  recommendGodsForTopic(topic) {
    const topicLower = topic.toLowerCase();
    const recommendations = [];
    
    // Pattern matching for god selection
    const patterns = {
      daedalus: /architect|system|design|structure|pattern/i,
      hephaestus: /implement|build|code|develop|fix|debug/i,
      apollo: /ui|ux|design|interface|user experience/i,
      themis: /test|quality|performance|benchmark/i,
      aegis: /security|protect|vulnerab|auth/i,
      prometheus: /requirement|feature|user story|plan/i,
      athena: /review|validate|complete|document/i,
      hermes: /sprint|agile|scrum|planning/i,
      iris: /animation|motion|interaction|transition/i,
      calliope: /content|copy|message|text/i,
      vulcan: /tool|mcp|integration|capability/i
    };
    
    for (const [god, pattern] of Object.entries(patterns)) {
      if (pattern.test(topicLower)) {
        recommendations.push(god);
      }
    }
    
    return recommendations;
  }

  /**
   * Prioritize gods based on context
   */
  prioritizeGods(gods, context) {
    // Simple prioritization - could be enhanced
    const priority = {
      zeus: 1,      // Orchestrator
      prometheus: 2, // Requirements
      daedalus: 3,  // Architecture
      hephaestus: 4, // Implementation
      apollo: 5,    // Design
      themis: 6,    // Testing
      aegis: 7      // Security
    };
    
    return gods.sort((a, b) => {
      const aPriority = priority[a] || 99;
      const bPriority = priority[b] || 99;
      return aPriority - bPriority;
    });
  }

  /**
   * Summon gods to a meeting
   */
  async summonGodsToMeeting(room, godNames) {
    const summonedGods = [];
    
    for (const godName of godNames) {
      try {
        const god = await this.pantheon.summonGod(godName);
        await room.addParticipant(god, 'god');
        summonedGods.push(god);
        
        // Notify god about the meeting
        await this.messenger.send('concilium', godName, {
          type: 'meeting-invitation',
          roomId: room.id,
          title: room.title,
          agenda: room.agenda
        });
      } catch (error) {
        console.warn(`Could not summon ${godName}:`, error.message);
      }
    }
    
    return summonedGods;
  }

  /**
   * Generate welcome message for meeting
   */
  generateWelcomeMessage(room, gods) {
    const godNames = gods.map(g => g.name).join(', ');
    const userRoleDesc = this.userRoles[room.userRole].description;
    
    let message = `🏛️ Welcome to ${room.title}!\n\n`;
    message += `I'm Concilium, your meeting facilitator. `;
    message += `I've assembled ${godNames} for this discussion.\n\n`;
    message += `You're joining as: **${room.userRole}** (${userRoleDesc})\n\n`;
    
    if (room.agenda.length > 0) {
      message += `📋 Agenda:\n`;
      room.agenda.forEach((item, i) => {
        message += `${i + 1}. ${item}\n`;
      });
      message += '\n';
    }
    
    message += `Let's begin! ${this.getStartingPrompt(room.type)}`;
    
    return message;
  }

  /**
   * Get starting prompt based on meeting type
   */
  getStartingPrompt(type) {
    const prompts = {
      standup: "What did you accomplish yesterday?",
      sprint_planning: "Let's review the backlog items.",
      code_review: "Please present the code for review.",
      architecture: "What system are we designing today?",
      design_review: "Show us what you've created!",
      emergency: "What's the current situation?",
      brainstorm: "What ideas shall we explore?"
    };
    
    return prompts[type] || "What would you like to discuss?";
  }

  /**
   * Handle user message in meeting
   */
  async handleUserMessage(roomId, userId, message) {
    const room = this.activeRooms.get(roomId);
    if (!room) {
      throw new Error('Meeting room not found');
    }
    
    // Check permissions
    const canSpeak = this.userRoles[room.userRole].canSpeak;
    if (!canSpeak && !message.startsWith('/')) {
      return {
        error: 'You are in observer mode. Use /raise-hand to request speaking privileges.'
      };
    }
    
    // Handle commands
    if (message.startsWith('/')) {
      return await this.handleMeetingCommand(room, userId, message);
    }
    
    // Add user message to room
    await room.addMessage({
      from: userId,
      content: message,
      type: 'user'
    });
    
    // Process the message and coordinate god responses
    await this.coordinateResponses(room, message);
    
    return { success: true };
  }

  /**
   * Handle meeting commands
   */
  async handleMeetingCommand(room, userId, command) {
    const [cmd, ...args] = command.split(' ');
    
    switch (cmd) {
      case '/raise-hand':
        await room.addToSpeakingQueue(userId);
        return { message: 'Hand raised. You will be called upon soon.' };
        
      case '/vote':
        return await room.startVote(args.join(' '));
        
      case '/summary':
        return { summary: await room.generateSummary() };
        
      case '/action-items':
        return { actionItems: room.getActionItems() };
        
      case '/invite':
        const godName = args[0];
        await this.summonGodsToMeeting(room, [godName]);
        return { message: `Inviting ${godName} to the meeting...` };
        
      case '/end':
        if (room.userRole === 'owner' || room.userRole === 'moderator') {
          return await this.endMeeting(room.id);
        }
        return { error: 'Only moderators can end meetings.' };
        
      default:
        return { error: `Unknown command: ${cmd}` };
    }
  }

  /**
   * Coordinate god responses to user input
   */
  async coordinateResponses(room, userMessage) {
    // Determine speaking order based on context
    const speakingOrder = this.determineSpeakingOrder(room, userMessage);
    
    for (const godName of speakingOrder) {
      const god = room.getParticipant(godName);
      if (!god) continue;
      
      // Send the conversation context to the god
      const response = await this.messenger.send('concilium', godName, {
        type: 'meeting-contribution',
        roomId: room.id,
        context: {
          userMessage,
          recentMessages: room.getRecentMessages(5),
          agenda: room.agenda,
          currentTopic: room.currentTopic
        }
      });
      
      // Add god's response to the room
      if (response && response.content) {
        await room.addMessage({
          from: godName,
          content: response.content,
          type: 'god'
        });
      }
    }
  }

  /**
   * Determine speaking order for gods
   */
  determineSpeakingOrder(room, message) {
    const participants = room.getGodParticipants();
    
    // Simple round-robin for now
    // Could be enhanced with relevance scoring
    return participants.map(p => p.name);
  }

  /**
   * End a meeting
   */
  async endMeeting(roomId) {
    const room = this.activeRooms.get(roomId);
    if (!room) {
      return { error: 'Meeting not found' };
    }
    
    // Generate final summary
    const summary = await room.generateSummary();
    const actionItems = room.getActionItems();
    
    // Notify participants
    await room.broadcast({
      from: 'concilium',
      content: 'Meeting is ending. Thank you for your participation!',
      type: 'system'
    });
    
    // Clean up
    await room.close();
    this.activeRooms.delete(roomId);
    
    // Update history
    const historyEntry = this.meetingHistory.find(m => m.roomId === roomId);
    if (historyEntry) {
      historyEntry.endTime = new Date();
      historyEntry.summary = summary;
      historyEntry.actionItems = actionItems;
    }
    
    this.emit('meeting:ended', {
      roomId,
      duration: room.getDuration(),
      summary,
      actionItems
    });
    
    return {
      summary,
      actionItems,
      duration: room.getDuration(),
      recording: room.getTranscript()
    };
  }

  /**
   * Get user's meeting history
   */
  getUserMeetingHistory(userId) {
    return this.meetingHistory.filter(meeting => 
      meeting.participants.user.id === userId
    );
  }

  /**
   * Get meeting recommendations for user
   */
  async recommendMeetings(userId, context) {
    const userProfile = this.userProfiles.get(userId) || {};
    const recommendations = [];
    
    // Based on current task
    if (context.currentTask) {
      const relevantGods = this.recommendGodsForTopic(context.currentTask);
      if (relevantGods.length > 0) {
        recommendations.push({
          type: 'brainstorm',
          title: `${context.currentTask} Discussion`,
          gods: relevantGods.slice(0, 3),
          reason: 'Based on your current task'
        });
      }
    }
    
    // Based on user history
    if (userProfile.frequentTopics) {
      // Recommend meetings based on patterns
    }
    
    // Standard recommendations
    if (context.timeline === 'sprint') {
      recommendations.push({
        type: 'sprint_planning',
        title: 'Sprint Planning Session',
        gods: ['hermes', 'prometheus'],
        reason: 'Start of sprint activity'
      });
    }
    
    return recommendations;
  }

  /**
   * Get available commands
   */
  getCommands() {
    return {
      'create-meeting': 'Start a new meeting room',
      'list-meetings': 'Show active meetings',
      'join-meeting': 'Join an existing meeting',
      'meeting-types': 'Show available meeting formats',
      'recommend-meeting': 'Get meeting suggestions',
      'meeting-history': 'View past meetings',
      'meeting-help': 'Show meeting commands'
    };
  }

  /**
   * Get personality for conversations
   */
  getPersonality() {
    return {
      name: 'Concilium',
      title: 'Divine Council Facilitator',
      greeting: "Greetings! I'm Concilium, facilitator of divine councils. I bring gods and mortals together for productive discussions. How may I organize a meeting for you?",
      expertise: ['meeting facilitation', 'god coordination', 'decision making', 'consensus building'],
      approach: 'I ensure every voice is heard and every meeting produces actionable outcomes.'
    };
  }
}