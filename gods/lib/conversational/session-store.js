import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { ConversationalSession } from './conversational-session.js';

/**
 * Persistent storage for conversational sessions
 */
export class SessionStore extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.storePath = options.storePath || path.join(process.cwd(), '.pantheon', 'sessions');
    this.maxSessions = options.maxSessions || 1000;
    this.archiveAfterDays = options.archiveAfterDays || 30;
    this.sessions = new Map(); // In-memory cache
    this.initialized = false;
  }

  /**
   * Initialize the session store
   */
  async initialize() {
    try {
      // Ensure storage directory exists
      await fs.mkdir(this.storePath, { recursive: true });
      
      // Load active sessions from disk
      await this.loadActiveSessions();
      
      // Set up periodic cleanup
      this.startCleanupTask();
      
      this.initialized = true;
      this.emit('store:initialized', { sessionCount: this.sessions.size });
      
    } catch (error) {
      this.emit('store:initialization-failed', error);
      throw error;
    }
  }

  /**
   * Load active sessions from disk
   */
  async loadActiveSessions() {
    try {
      const files = await fs.readdir(this.storePath);
      const sessionFiles = files.filter(f => f.endsWith('.session.json'));
      
      for (const file of sessionFiles) {
        try {
          const filePath = path.join(this.storePath, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const sessionData = JSON.parse(data);
          
          // Skip archived sessions
          if (sessionData.archived) continue;
          
          // Recreate session
          const session = await this.deserializeSession(sessionData);
          this.sessions.set(session.id, session);
          
        } catch (error) {
          console.error(`Failed to load session ${file}:`, error);
        }
      }
      
      this.emit('sessions:loaded', { count: this.sessions.size });
      
    } catch (error) {
      // Directory might not exist yet
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Save a session
   */
  async saveSession(session) {
    try {
      const sessionData = await this.serializeSession(session);
      const filePath = path.join(this.storePath, `${session.id}.session.json`);
      
      await fs.writeFile(filePath, JSON.stringify(sessionData, null, 2));
      
      // Update memory cache
      this.sessions.set(session.id, session);
      
      this.emit('session:saved', { sessionId: session.id });
      
    } catch (error) {
      this.emit('session:save-failed', { sessionId: session.id, error });
      throw error;
    }
  }

  /**
   * Load a session
   */
  async loadSession(sessionId) {
    // Check memory cache first
    if (this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId);
    }
    
    // Load from disk
    try {
      const filePath = path.join(this.storePath, `${sessionId}.session.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      const sessionData = JSON.parse(data);
      
      const session = await this.deserializeSession(sessionData);
      
      // Update cache
      this.sessions.set(sessionId, session);
      
      return session;
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create a new session
   */
  async createSession(initialContext = {}) {
    const session = new ConversationalSession();
    
    // Set initial context
    if (initialContext.user) {
      session.context.user = { ...session.context.user, ...initialContext.user };
    }
    if (initialContext.project) {
      session.context.project = { ...session.context.project, ...initialContext.project };
    }
    
    // Set up auto-save
    this.setupAutoSave(session);
    
    // Save immediately
    await this.saveSession(session);
    
    this.emit('session:created', { sessionId: session.id });
    
    return session;
  }

  /**
   * Archive a session
   */
  async archiveSession(sessionId) {
    const session = await this.loadSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    // Create archive data
    const archiveData = {
      ...await this.serializeSession(session),
      archived: true,
      archivedAt: new Date().toISOString()
    };
    
    // Save to archive directory
    const archivePath = path.join(this.storePath, 'archive');
    await fs.mkdir(archivePath, { recursive: true });
    
    const archiveFile = path.join(archivePath, `${sessionId}.archive.json`);
    await fs.writeFile(archiveFile, JSON.stringify(archiveData, null, 2));
    
    // Remove from active storage
    const activeFile = path.join(this.storePath, `${sessionId}.session.json`);
    await fs.unlink(activeFile).catch(() => {}); // Ignore if doesn't exist
    
    // Remove from cache
    this.sessions.delete(sessionId);
    
    this.emit('session:archived', { sessionId });
  }

  /**
   * List active sessions
   */
  async listSessions(options = {}) {
    const sessions = [];
    
    for (const session of this.sessions.values()) {
      const summary = {
        id: session.id,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        participantCount: session.participants.size,
        currentPhase: session.context.currentPhase,
        progress: session.getProgressPercentage()
      };
      
      // Apply filters
      if (options.since && session.createdAt < options.since) continue;
      if (options.phase && session.context.currentPhase !== options.phase) continue;
      
      sessions.push(summary);
    }
    
    // Sort
    if (options.sortBy === 'recent') {
      sessions.sort((a, b) => b.lastActivity - a.lastActivity);
    } else if (options.sortBy === 'created') {
      sessions.sort((a, b) => b.createdAt - a.createdAt);
    }
    
    return sessions;
  }

  /**
   * Find sessions by criteria
   */
  async findSessions(criteria) {
    const results = [];
    
    for (const session of this.sessions.values()) {
      let matches = true;
      
      if (criteria.projectType && session.context.project.type !== criteria.projectType) {
        matches = false;
      }
      
      if (criteria.participant && !session.participants.has(criteria.participant)) {
        matches = false;
      }
      
      if (criteria.hasArtifact && session.countArtifacts() === 0) {
        matches = false;
      }
      
      if (matches) {
        results.push(session);
      }
    }
    
    return results;
  }

  /**
   * Set up auto-save for a session
   */
  setupAutoSave(session) {
    const autoSave = async () => {
      try {
        await this.saveSession(session);
      } catch (error) {
        console.error(`Auto-save failed for session ${session.id}:`, error);
      }
    };
    
    // Save on important events
    session.on('context:updated', autoSave);
    session.on('handoff:recorded', autoSave);
    session.on('participant:joined', autoSave);
    
    // Periodic save
    const interval = setInterval(autoSave, 60000); // Every minute
    
    // Clean up on session end
    session.once('session:ended', () => {
      clearInterval(interval);
      session.removeListener('context:updated', autoSave);
      session.removeListener('handoff:recorded', autoSave);
      session.removeListener('participant:joined', autoSave);
    });
  }

  /**
   * Serialize session for storage
   */
  async serializeSession(session) {
    return {
      id: session.id,
      createdAt: session.createdAt.toISOString(),
      lastActivity: session.lastActivity.toISOString(),
      context: session.context,
      participants: Array.from(session.participants.entries()).map(([name, info]) => ({
        name,
        ...info,
        joinedAt: info.joinedAt.toISOString(),
        lastActivity: info.lastActivity.toISOString()
      })),
      timeline: session.timeline.map(event => ({
        ...event,
        timestamp: event.timestamp instanceof Date ? event.timestamp.toISOString() : event.timestamp
      })),
      stateVersion: session.state.getVersion(),
      stateHistory: session.state.history
    };
  }

  /**
   * Deserialize session from storage
   */
  async deserializeSession(data) {
    const session = new ConversationalSession(data.id);
    
    // Restore dates
    session.createdAt = new Date(data.createdAt);
    session.lastActivity = new Date(data.lastActivity);
    
    // Restore context
    session.context = data.context;
    
    // Restore participants
    session.participants.clear();
    for (const participant of data.participants) {
      session.participants.set(participant.name, {
        ...participant,
        joinedAt: new Date(participant.joinedAt),
        lastActivity: new Date(participant.lastActivity)
      });
    }
    
    // Restore timeline
    session.timeline = data.timeline.map(event => ({
      ...event,
      timestamp: new Date(event.timestamp)
    }));
    
    // Restore state
    if (data.stateHistory) {
      for (const change of data.stateHistory) {
        await session.state.applyUpdate(change);
      }
    }
    
    return session;
  }

  /**
   * Start periodic cleanup task
   */
  startCleanupTask() {
    // Run cleanup daily
    setInterval(async () => {
      try {
        await this.cleanup();
      } catch (error) {
        console.error('Session cleanup failed:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    // Run initial cleanup after 1 minute
    setTimeout(() => this.cleanup(), 60000);
  }

  /**
   * Clean up old sessions
   */
  async cleanup() {
    const now = Date.now();
    const archiveThreshold = this.archiveAfterDays * 24 * 60 * 60 * 1000;
    const sessionsToArchive = [];
    
    // Find sessions to archive
    for (const session of this.sessions.values()) {
      const age = now - session.lastActivity.getTime();
      if (age > archiveThreshold) {
        sessionsToArchive.push(session.id);
      }
    }
    
    // Archive old sessions
    for (const sessionId of sessionsToArchive) {
      try {
        await this.archiveSession(sessionId);
      } catch (error) {
        console.error(`Failed to archive session ${sessionId}:`, error);
      }
    }
    
    // Check storage limits
    if (this.sessions.size > this.maxSessions) {
      // Archive oldest sessions
      const sortedSessions = Array.from(this.sessions.values())
        .sort((a, b) => a.lastActivity - b.lastActivity);
      
      const toRemove = sortedSessions.slice(0, this.sessions.size - this.maxSessions);
      
      for (const session of toRemove) {
        await this.archiveSession(session.id);
      }
    }
    
    this.emit('cleanup:completed', {
      archived: sessionsToArchive.length,
      remaining: this.sessions.size
    });
  }

  /**
   * Export session data
   */
  async exportSession(sessionId, format = 'json') {
    const session = await this.loadSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    const data = await this.serializeSession(session);
    
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'markdown') {
      return this.sessionToMarkdown(session, data);
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Convert session to markdown
   */
  sessionToMarkdown(session, data) {
    let md = `# Conversation Session: ${session.id}\n\n`;
    md += `**Created:** ${session.createdAt.toLocaleString()}\n`;
    md += `**Duration:** ${Math.round((session.lastActivity - session.createdAt) / 60000)} minutes\n`;
    md += `**Progress:** ${session.getProgressPercentage()}%\n\n`;
    
    md += `## Participants\n\n`;
    for (const [name, info] of session.participants.entries()) {
      md += `- **${name}** (${info.role}): ${info.contributions.length} contributions\n`;
    }
    
    md += `\n## Context\n\n`;
    md += `### Project\n`;
    md += `- **Type:** ${session.context.project.type || 'Not specified'}\n`;
    md += `- **Name:** ${session.context.project.name || 'Not specified'}\n`;
    
    if (session.context.requirements.functional.length > 0) {
      md += `\n### Requirements\n`;
      for (const req of session.context.requirements.functional) {
        md += `- ${req}\n`;
      }
    }
    
    if (session.context.decisions.length > 0) {
      md += `\n### Key Decisions\n`;
      for (const decision of session.context.decisions) {
        md += `- ${decision}\n`;
      }
    }
    
    return md;
  }

  /**
   * Get storage statistics
   */
  async getStatistics() {
    const stats = {
      activeSessions: this.sessions.size,
      totalSize: 0,
      oldestSession: null,
      newestSession: null,
      averageDuration: 0
    };
    
    let totalDuration = 0;
    
    for (const session of this.sessions.values()) {
      const duration = session.lastActivity - session.createdAt;
      totalDuration += duration;
      
      if (!stats.oldestSession || session.createdAt < stats.oldestSession) {
        stats.oldestSession = session.createdAt;
      }
      
      if (!stats.newestSession || session.createdAt > stats.newestSession) {
        stats.newestSession = session.createdAt;
      }
    }
    
    if (this.sessions.size > 0) {
      stats.averageDuration = Math.round(totalDuration / this.sessions.size / 60000); // minutes
    }
    
    // Calculate storage size
    try {
      const files = await fs.readdir(this.storePath);
      for (const file of files) {
        if (file.endsWith('.session.json')) {
          const filePath = path.join(this.storePath, file);
          const stat = await fs.stat(filePath);
          stats.totalSize += stat.size;
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return stats;
  }
}