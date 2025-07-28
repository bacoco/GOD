import { EventEmitter } from 'events';
import crypto from 'crypto';

/**
 * DivineCouncilRoom - Manages a meeting room where gods and users collaborate
 */
export class DivineCouncilRoom extends EventEmitter {
  constructor(options) {
    super();
    
    this.id = options.id;
    this.title = options.title;
    this.type = options.type;
    this.facilitator = options.facilitator;
    this.messenger = options.messenger;
    this.config = options.config;
    this.agenda = options.agenda || [];
    this.startTime = new Date();
    
    // User configuration
    this.userId = options.userId;
    this.userRole = options.userRole;
    
    // Room state
    this.participants = new Map();
    this.messages = [];
    this.actionItems = [];
    this.decisions = [];
    this.votes = new Map();
    this.speakingQueue = [];
    this.currentTopic = null;
    this.isActive = true;
    
    // Room features
    this.features = {
      recording: true,
      transcription: true,
      summaries: true,
      voting: true,
      actionTracking: true
    };
  }

  /**
   * Initialize the room
   */
  async initialize() {
    // Add facilitator as first participant
    await this.addParticipant(this.facilitator, 'facilitator');
    
    // Add user as participant
    if (this.userId) {
      await this.addParticipant({
        id: this.userId,
        name: `User-${this.userId}`,
        type: 'user'
      }, 'user');
    }
    
    this.emit('room:initialized', {
      roomId: this.id,
      title: this.title,
      type: this.type
    });
  }

  /**
   * Add a participant to the room
   */
  async addParticipant(participant, type = 'god') {
    const participantInfo = {
      id: participant.id || participant.name,
      name: participant.name,
      type,
      joinedAt: new Date(),
      isActive: true,
      messageCount: 0
    };
    
    this.participants.set(participantInfo.id, participantInfo);
    
    await this.broadcast({
      from: 'system',
      content: `${participantInfo.name} has joined the meeting.`,
      type: 'system'
    });
    
    this.emit('participant:joined', participantInfo);
  }

  /**
   * Remove a participant from the room
   */
  async removeParticipant(participantId) {
    const participant = this.participants.get(participantId);
    if (!participant) return;
    
    participant.isActive = false;
    participant.leftAt = new Date();
    
    await this.broadcast({
      from: 'system',
      content: `${participant.name} has left the meeting.`,
      type: 'system'
    });
    
    this.emit('participant:left', participant);
  }

  /**
   * Add a message to the room
   */
  async addMessage(message) {
    const messageObj = {
      id: crypto.randomUUID(),
      from: message.from,
      content: message.content,
      type: message.type || 'text',
      timestamp: new Date(),
      metadata: message.metadata || {}
    };
    
    this.messages.push(messageObj);
    
    // Update participant message count
    const participant = this.participants.get(message.from);
    if (participant) {
      participant.messageCount++;
    }
    
    // Check for action items or decisions
    this.extractActionItems(messageObj);
    this.extractDecisions(messageObj);
    
    // Emit for real-time updates
    this.emit('message:added', messageObj);
    
    return messageObj;
  }

  /**
   * Broadcast a message to all participants
   */
  async broadcast(message) {
    const messageObj = await this.addMessage(message);
    
    // Send to all active god participants via messenger
    for (const [id, participant] of this.participants) {
      if (participant.type === 'god' && participant.isActive) {
        await this.messenger.send('concilium', participant.name, {
          type: 'room-message',
          roomId: this.id,
          message: messageObj
        });
      }
    }
    
    return messageObj;
  }

  /**
   * Get recent messages
   */
  getRecentMessages(count = 10) {
    return this.messages.slice(-count);
  }

  /**
   * Get full transcript
   */
  getTranscript() {
    return this.messages.map(msg => ({
      time: msg.timestamp.toISOString(),
      speaker: msg.from,
      content: msg.content,
      type: msg.type
    }));
  }

  /**
   * Extract action items from messages
   */
  extractActionItems(message) {
    const actionPatterns = [
      /action:\s*(.+)/i,
      /todo:\s*(.+)/i,
      /will\s+(.+)/i,
      /going to\s+(.+)/i,
      /\[\s*action\s*\]\s*(.+)/i
    ];
    
    for (const pattern of actionPatterns) {
      const match = message.content.match(pattern);
      if (match) {
        this.actionItems.push({
          id: crypto.randomUUID(),
          action: match[1].trim(),
          assignedTo: message.from,
          createdAt: message.timestamp,
          fromMessage: message.id,
          status: 'pending'
        });
        
        this.emit('action:created', {
          action: match[1].trim(),
          assignedTo: message.from
        });
      }
    }
  }

  /**
   * Extract decisions from messages
   */
  extractDecisions(message) {
    const decisionPatterns = [
      /decision:\s*(.+)/i,
      /decided:\s*(.+)/i,
      /agreed:\s*(.+)/i,
      /conclusion:\s*(.+)/i,
      /\[\s*decision\s*\]\s*(.+)/i
    ];
    
    for (const pattern of decisionPatterns) {
      const match = message.content.match(pattern);
      if (match) {
        this.decisions.push({
          id: crypto.randomUUID(),
          decision: match[1].trim(),
          madeBy: message.from,
          timestamp: message.timestamp,
          fromMessage: message.id
        });
        
        this.emit('decision:made', {
          decision: match[1].trim(),
          madeBy: message.from
        });
      }
    }
  }

  /**
   * Start a vote
   */
  async startVote(question, options = ['yes', 'no']) {
    const voteId = crypto.randomUUID();
    
    const vote = {
      id: voteId,
      question,
      options,
      startedAt: new Date(),
      votes: new Map(),
      status: 'active'
    };
    
    this.votes.set(voteId, vote);
    
    await this.broadcast({
      from: 'system',
      content: `📊 Vote started: "${question}"\nOptions: ${options.join(', ')}\nUse /vote <option> to participate.`,
      type: 'vote',
      metadata: { voteId }
    });
    
    return vote;
  }

  /**
   * Cast a vote
   */
  castVote(voteId, participantId, option) {
    const vote = this.votes.get(voteId);
    if (!vote || vote.status !== 'active') {
      return { error: 'Vote not found or already closed' };
    }
    
    if (!vote.options.includes(option)) {
      return { error: 'Invalid option' };
    }
    
    vote.votes.set(participantId, option);
    
    this.emit('vote:cast', {
      voteId,
      participantId,
      option
    });
    
    return { success: true };
  }

  /**
   * Close a vote and tally results
   */
  closeVote(voteId) {
    const vote = this.votes.get(voteId);
    if (!vote) return null;
    
    vote.status = 'closed';
    vote.closedAt = new Date();
    
    // Tally results
    const tally = {};
    for (const option of vote.options) {
      tally[option] = 0;
    }
    
    for (const [participantId, option] of vote.votes) {
      tally[option]++;
    }
    
    vote.results = tally;
    
    return vote;
  }

  /**
   * Add participant to speaking queue
   */
  async addToSpeakingQueue(participantId) {
    if (!this.speakingQueue.includes(participantId)) {
      this.speakingQueue.push(participantId);
      
      const position = this.speakingQueue.length;
      await this.broadcast({
        from: 'system',
        content: `${participantId} raised their hand. Position in queue: ${position}`,
        type: 'system'
      });
    }
  }

  /**
   * Get next speaker from queue
   */
  getNextSpeaker() {
    return this.speakingQueue.shift();
  }

  /**
   * Generate meeting summary
   */
  async generateSummary() {
    const duration = this.getDuration();
    const participantList = Array.from(this.participants.values())
      .filter(p => p.type === 'god')
      .map(p => p.name);
    
    const summary = {
      title: this.title,
      type: this.type,
      duration: `${Math.round(duration / 60000)} minutes`,
      participants: participantList,
      totalMessages: this.messages.length,
      agenda: this.agenda,
      decisions: this.decisions.map(d => ({
        decision: d.decision,
        madeBy: d.madeBy
      })),
      actionItems: this.actionItems.map(a => ({
        action: a.action,
        assignedTo: a.assignedTo
      })),
      keyTopics: this.extractKeyTopics()
    };
    
    return summary;
  }

  /**
   * Extract key topics discussed
   */
  extractKeyTopics() {
    // Simple topic extraction - could be enhanced with NLP
    const topics = new Map();
    
    const keywords = [
      'architecture', 'design', 'implementation', 'testing',
      'security', 'performance', 'database', 'api', 'frontend',
      'backend', 'deployment', 'requirements', 'user experience'
    ];
    
    for (const message of this.messages) {
      if (message.type !== 'text') continue;
      
      const content = message.content.toLowerCase();
      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          topics.set(keyword, (topics.get(keyword) || 0) + 1);
        }
      }
    }
    
    // Return top 5 topics
    return Array.from(topics.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);
  }

  /**
   * Get participant by ID
   */
  getParticipant(id) {
    return this.participants.get(id);
  }

  /**
   * Get all god participants
   */
  getGodParticipants() {
    return Array.from(this.participants.values())
      .filter(p => p.type === 'god' && p.isActive);
  }

  /**
   * Get action items
   */
  getActionItems() {
    return this.actionItems;
  }

  /**
   * Get meeting duration
   */
  getDuration() {
    return Date.now() - this.startTime.getTime();
  }

  /**
   * Set current topic
   */
  setCurrentTopic(topic) {
    this.currentTopic = topic;
    this.emit('topic:changed', topic);
  }

  /**
   * Close the room
   */
  async close() {
    this.isActive = false;
    this.endTime = new Date();
    
    // Notify all participants
    await this.broadcast({
      from: 'system',
      content: 'Meeting has ended.',
      type: 'system'
    });
    
    // Clean up
    this.removeAllListeners();
    
    this.emit('room:closed', {
      roomId: this.id,
      duration: this.getDuration()
    });
  }
}