/**
 * Conversation State Manager
 * Manages state for /gods conversations
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ConversationState {
  constructor() {
    this.statePath = path.join(__dirname, '../../.pantheon-state');
    this.currentSession = null;
  }

  /**
   * Initialize state directory
   */
  async initialize() {
    try {
      await fs.mkdir(this.statePath, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  /**
   * Start a new conversation session
   * @param {string} projectName - Name of the project
   * @returns {Object} The new session
   */
  async startSession(projectName) {
    const session = {
      id: Date.now().toString(),
      projectName,
      startedAt: new Date().toISOString(),
      currentGod: 'Zeus',
      phase: 'discovery',
      context: {
        projectType: null,
        features: [],
        requirements: [],
        technologies: [],
        responses: []
      },
      status: 'active'
    };

    this.currentSession = session;
    await this.saveSession(session);
    return session;
  }

  /**
   * Get current active session
   * @returns {Object|null} Current session or null
   */
  getCurrentSession() {
    return this.currentSession;
  }

  /**
   * Update session context
   * @param {string} key - Context key to update
   * @param {any} value - Value to set
   */
  async updateContext(key, value) {
    if (!this.currentSession) return;

    if (typeof key === 'object') {
      // Allow passing an object to update multiple keys
      Object.assign(this.currentSession.context, key);
    } else {
      this.currentSession.context[key] = value;
    }

    await this.saveSession(this.currentSession);
  }

  /**
   * Add a user response to the conversation
   * @param {string} question - The question asked
   * @param {string} answer - The user's answer
   */
  async addResponse(question, answer) {
    if (!this.currentSession) return;

    this.currentSession.context.responses.push({
      timestamp: new Date().toISOString(),
      god: this.currentSession.currentGod,
      question,
      answer
    });

    await this.saveSession(this.currentSession);
  }

  /**
   * Transition to a different god
   * @param {string} godName - Name of the god to transition to
   * @param {string} reason - Reason for transition
   */
  async transitionToGod(godName, reason) {
    if (!this.currentSession) return;

    this.currentSession.previousGod = this.currentSession.currentGod;
    this.currentSession.currentGod = godName;
    this.currentSession.lastTransition = {
      from: this.currentSession.previousGod,
      to: godName,
      reason,
      timestamp: new Date().toISOString()
    };

    await this.saveSession(this.currentSession);
  }

  /**
   * Update session phase
   * @param {string} phase - New phase (discovery, planning, implementation, etc.)
   */
  async updatePhase(phase) {
    if (!this.currentSession) return;

    this.currentSession.phase = phase;
    await this.saveSession(this.currentSession);
  }

  /**
   * Save session to disk
   * @param {Object} session - Session to save
   */
  async saveSession(session) {
    const sessionPath = path.join(this.statePath, `session-${session.id}.json`);
    await fs.writeFile(sessionPath, JSON.stringify(session, null, 2));
    
    // Also save as "current" for easy access
    const currentPath = path.join(this.statePath, 'current-session.json');
    await fs.writeFile(currentPath, JSON.stringify(session, null, 2));
  }

  /**
   * Load a session by ID
   * @param {string} sessionId - Session ID to load
   * @returns {Object|null} Session or null if not found
   */
  async loadSession(sessionId) {
    try {
      const sessionPath = path.join(this.statePath, `session-${sessionId}.json`);
      const data = await fs.readFile(sessionPath, 'utf8');
      const session = JSON.parse(data);
      this.currentSession = session;
      return session;
    } catch (error) {
      return null;
    }
  }

  /**
   * Load the most recent session
   * @returns {Object|null} Session or null if not found
   */
  async loadCurrentSession() {
    try {
      const currentPath = path.join(this.statePath, 'current-session.json');
      const data = await fs.readFile(currentPath, 'utf8');
      const session = JSON.parse(data);
      this.currentSession = session;
      return session;
    } catch (error) {
      return null;
    }
  }

  /**
   * List all saved projects
   * @returns {Array} List of project summaries
   */
  async listProjects() {
    try {
      const files = await fs.readdir(this.statePath);
      const projects = [];

      for (const file of files) {
        if (file.startsWith('session-') && file.endsWith('.json')) {
          const data = await fs.readFile(path.join(this.statePath, file), 'utf8');
          const session = JSON.parse(data);
          projects.push({
            id: session.id,
            projectName: session.projectName,
            startedAt: session.startedAt,
            status: session.status,
            phase: session.phase
          });
        }
      }

      return projects.sort((a, b) => b.id - a.id);
    } catch (error) {
      return [];
    }
  }

  /**
   * Mark session as completed
   */
  async completeSession() {
    if (!this.currentSession) return;

    this.currentSession.status = 'completed';
    this.currentSession.completedAt = new Date().toISOString();
    await this.saveSession(this.currentSession);
  }
}