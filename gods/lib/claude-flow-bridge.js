/**
 * Claude-Flow Bridge
 * Connects Pantheon's conversational interface with Claude-Flow's agent orchestration
 * Uses CLI commands to spawn and control Claude-Flow agents
 */

import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ClaudeFlowBridge extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.claudeFlowPath = options.claudeFlowPath || path.join(__dirname, '../../claude-flow');
    this.claudeFlowBin = path.join(this.claudeFlowPath, 'bin', 'claude-flow');
    
    // Track active agents created by gods
    this.godAgents = new Map(); // godName -> Set of agent IDs
    this.agentToGod = new Map(); // agentId -> godName
    this.activeProcesses = new Map(); // agentId -> ChildProcess
    
    // Configuration
    this.config = {
      enableRealAgents: options.enableRealAgents !== false,
      streamProgress: options.streamProgress !== false,
      parallelExecution: options.parallelExecution !== false,
      ...options.config
    };
    
    this.initialized = false;
  }

  /**
   * Initialize the bridge with Claude-Flow
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      this.emit('bridge:initializing');
      
      // Check if Claude-Flow exists
      if (!existsSync(this.claudeFlowBin)) {
        throw new Error(`Claude-Flow not found at ${this.claudeFlowBin}. Please run: cd ${this.claudeFlowPath} && npm install`);
      }
      
      // Test Claude-Flow with version command
      await this.executeCommand(['--version']);
      
      this.initialized = true;
      this.emit('bridge:initialized');
      
    } catch (error) {
      this.emit('bridge:error', { error });
      throw new Error(`Failed to initialize Claude-Flow Bridge: ${error.message}`);
    }
  }

  /**
   * Execute a Claude-Flow command
   * @param {Array} args - Command arguments
   * @returns {Promise<string>} Command output
   */
  executeCommand(args) {
    return new Promise((resolve, reject) => {
      const childProc = spawn(this.claudeFlowBin, args, {
        cwd: this.claudeFlowPath,
        env: { ...process.env, NODE_ENV: 'production' }
      });
      
      let output = '';
      let error = '';
      
      childProc.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      childProc.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      childProc.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed: ${error || output}`));
        }
      });
      
      childProc.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Create a Claude-Flow agent for a god
   * @param {string} godName - Name of the god creating the agent
   * @param {Object} config - Agent configuration
   * @returns {Object} The created agent
   */
  async createAgentForGod(godName, config = {}) {
    if (!this.initialized) {
      throw new Error('Bridge not initialized. Call initialize() first.');
    }
    
    // Generate unique agent ID
    const agentId = `${godName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Map god type to Claude-Flow agent type
    const agentType = this.mapGodToAgentType(godName, config.type);
    
    try {
      // Create agent using swarm command for real execution
      const args = [
        'swarm',
        config.instructions || `Agent created by ${godName}`,
        '--strategy', 'development',
        '--mode', 'hierarchical',
        '--max-agents', '1',
        '--output', 'json'
      ];
      
      // Spawn the process but don't wait for it to complete
      const agentProcess = spawn(this.claudeFlowBin, args, {
        cwd: this.claudeFlowPath,
        env: { ...process.env, NODE_ENV: 'production' },
        detached: false
      });
      
      // Track the agent
      if (!this.godAgents.has(godName)) {
        this.godAgents.set(godName, new Set());
      }
      this.godAgents.get(godName).add(agentId);
      this.agentToGod.set(agentId, godName);
      this.activeProcesses.set(agentId, agentProcess);
      
      // Set up event streaming
      this.setupProcessStreaming(agentId, agentProcess);
      
      this.emit('bridge:agent-created', {
        godName,
        agentId,
        agentType
      });
      
      // Return agent interface
      return {
        id: agentId,
        type: agentType,
        godName,
        execute: async (task) => this.executeAgentTask(agentId, task),
        terminate: async () => this.terminateAgent(agentId)
      };
      
    } catch (error) {
      this.emit('bridge:agent-error', { godName, error });
      throw error;
    }
  }

  /**
   * Map god names to Claude-Flow agent types
   * @param {string} godName - God name
   * @param {string} configType - Configured type
   * @returns {string} Claude-Flow agent type
   */
  mapGodToAgentType(godName, configType) {
    if (configType) return configType;
    
    const mapping = {
      zeus: 'orchestrator',
      daedalus: 'architect',
      hephaestus: 'coder',
      apollo: 'designer',
      themis: 'tester',
      prometheus: 'planner',
      athena: 'researcher',
      hermes: 'coordinator',
      aegis: 'security-manager'
    };
    
    return mapping[godName.toLowerCase()] || 'coder';
  }

  /**
   * Spawn an agent from a custom MD file
   * @param {string} mdPath - Path to the custom MD file
   * @param {Object} context - Context for the agent
   * @returns {Object} The spawned agent
   */
  async spawnAgentFromMD(mdPath, context = {}) {
    if (!this.initialized) {
      throw new Error('Bridge not initialized. Call initialize() first.');
    }
    
    if (!existsSync(mdPath)) {
      throw new Error(`MD file not found: ${mdPath}`);
    }
    
    // Extract agent name from MD path
    const mdFileName = path.basename(mdPath, '.md');
    const agentName = mdFileName.replace(/^(custom-|project-[^-]+-|template-)/, '');
    
    try {
      // Use sparc command to spawn from MD file
      const args = [
        'sparc',
        'run',
        agentName,
        `"Load and execute from custom MD: ${mdPath}"`,
        '--md-file', mdPath,
        '--parallel',
        '--output', 'json'
      ];
      
      // Add context as environment variables
      const env = {
        ...process.env,
        NODE_ENV: 'production',
        PANTHEON_SESSION_ID: context.sessionId || '',
        PANTHEON_PROJECT_DATA: JSON.stringify(context.projectData || {})
      };
      
      // Spawn the agent process
      const agentProcess = spawn(this.claudeFlowBin, args, {
        cwd: this.claudeFlowPath,
        env: env,
        detached: false
      });
      
      const agentId = `${agentName}-md-${Date.now()}`;
      
      // Track the agent
      const godName = this.extractGodFromAgentName(agentName);
      if (!this.godAgents.has(godName)) {
        this.godAgents.set(godName, new Set());
      }
      this.godAgents.get(godName).add(agentId);
      this.agentToGod.set(agentId, godName);
      this.activeProcesses.set(agentId, agentProcess);
      
      // Set up event streaming
      this.setupProcessStreaming(agentId, agentProcess);
      
      this.emit('bridge:agent-spawned-from-md', {
        agentId,
        mdPath,
        agentName,
        godName
      });
      
      // Return agent interface
      return {
        id: agentId,
        name: agentName,
        godName,
        mdPath,
        execute: async (task) => this.executeAgentTask(agentId, task),
        terminate: async () => this.terminateAgent(agentId)
      };
      
    } catch (error) {
      this.emit('bridge:spawn-error', { mdPath, error });
      throw error;
    }
  }

  /**
   * Extract god name from agent name
   * @param {string} agentName - Agent name
   * @returns {string} God name
   */
  extractGodFromAgentName(agentName) {
    const godPatterns = {
      zeus: /zeus|orchestrat/i,
      daedalus: /daedalus|architect/i,
      hephaestus: /hephaestus|backend|developer/i,
      apollo: /apollo|ui|designer/i,
      themis: /themis|quality|test/i,
      hermes: /hermes|realtime|coordinat/i,
      aegis: /aegis|security/i,
      athena: /athena|ai|ml/i,
      prometheus: /prometheus|plan/i
    };
    
    for (const [god, pattern] of Object.entries(godPatterns)) {
      if (pattern.test(agentName)) {
        return god;
      }
    }
    
    return 'unknown';
  }

  /**
   * Execute a task using an agent
   * @param {string} agentId - Agent ID
   * @param {Object} task - Task configuration
   * @returns {Object} Task result
   */
  async executeAgentTask(agentId, task) {
    const childProc = this.activeProcesses.get(agentId);
    if (!childProc) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    return new Promise((resolve, reject) => {
      const taskResult = {
        success: false,
        result: null,
        filesCreated: []
      };
      
      // Collect output from the running process
      let output = '';
      let filesCreated = [];
      
      const outputHandler = (data) => {
        const text = data.toString();
        output += text;
        
        // Parse for file creation messages
        const fileMatches = text.match(/(?:Created|Generated|Wrote)\s+file:\s+(.+)/g);
        if (fileMatches) {
          fileMatches.forEach(match => {
            const file = match.replace(/(?:Created|Generated|Wrote)\s+file:\s+/, '').trim();
            filesCreated.push(file);
          });
        }
      };
      
      childProc.stdout.on('data', outputHandler);
      childProc.stderr.on('data', outputHandler);
      
      // Wait for process to complete or timeout
      const timeout = setTimeout(() => {
        taskResult.success = true;
        taskResult.result = output;
        taskResult.filesCreated = filesCreated;
        resolve(taskResult);
      }, 30000); // 30 second timeout
      
      childProc.on('close', (code) => {
        clearTimeout(timeout);
        taskResult.success = code === 0;
        taskResult.result = output;
        taskResult.filesCreated = filesCreated;
        resolve(taskResult);
      });
      
      childProc.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  /**
   * Set up real-time streaming from agent process
   * @param {string} agentId - Agent ID
   * @param {ChildProcess} childProc - Agent process
   */
  setupProcessStreaming(agentId, childProc) {
    const godName = this.agentToGod.get(agentId);
    
    // Stream stdout
    childProc.stdout.on('data', (data) => {
      this.emit('agent:progress', {
        agentId,
        godName,
        type: 'progress',
        message: data.toString()
      });
    });
    
    // Stream stderr (for errors/warnings)
    childProc.stderr.on('data', (data) => {
      this.emit('agent:progress', {
        agentId,
        godName,
        type: 'error',
        error: data.toString()
      });
    });
    
    // Handle process completion
    childProc.on('close', (code) => {
      this.emit('agent:progress', {
        agentId,
        godName,
        type: 'complete',
        exitCode: code
      });
      
      // Clean up
      this.activeProcesses.delete(agentId);
    });
  }

  /**
   * Access Claude-Flow's memory bank
   * @param {string} key - Memory key
   * @param {*} value - Value to store (if setting)
   * @returns {*} Stored value (if getting)
   */
  async accessMemory(key, value = undefined) {
    if (!this.initialized) {
      throw new Error('Bridge not initialized');
    }
    
    if (value !== undefined) {
      // Store in memory
      const args = ['memory', 'store', key, JSON.stringify(value)];
      await this.executeCommand(args);
      return value;
    } else {
      // Retrieve from memory
      const args = ['memory', 'get', key];
      const output = await this.executeCommand(args);
      try {
        return JSON.parse(output);
      } catch (e) {
        return output;
      }
    }
  }

  /**
   * Create a swarm of agents for complex tasks
   * @param {string} godName - God creating the swarm
   * @param {Array} agentConfigs - Array of agent configurations
   * @returns {Array} Created agents
   */
  async createSwarm(godName, agentConfigs) {
    if (!this.initialized) {
      throw new Error('Bridge not initialized');
    }
    
    const agents = [];
    
    try {
      // Create agents in parallel if enabled
      if (this.config.parallelExecution) {
        const promises = agentConfigs.map(config => 
          this.createAgentForGod(godName, config)
        );
        const createdAgents = await Promise.all(promises);
        agents.push(...createdAgents);
      } else {
        // Create sequentially
        for (const config of agentConfigs) {
          const agent = await this.createAgentForGod(godName, config);
          agents.push(agent);
        }
      }
      
      this.emit('bridge:swarm-created', {
        godName,
        agentCount: agents.length,
        agentIds: agents.map(a => a.id)
      });
      
      return agents;
      
    } catch (error) {
      this.emit('bridge:swarm-error', { godName, error });
      throw error;
    }
  }

  /**
   * Stream real-time progress from agents
   * @param {string} agentId - Agent to monitor
   * @param {Function} callback - Progress callback
   */
  subscribeToAgentProgress(agentId, callback) {
    if (!this.initialized) {
      throw new Error('Bridge not initialized');
    }
    
    const godName = this.agentToGod.get(agentId);
    if (!godName) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    // Subscribe to agent events
    const progressHandler = (data) => {
      if (data.agentId === agentId) {
        callback(data);
      }
    };
    
    this.on('agent:progress', progressHandler);
    
    // Return unsubscribe function
    return () => {
      this.off('agent:progress', progressHandler);
    };
  }

  /**
   * Get all agents created by a specific god
   * @param {string} godName - Name of the god
   * @returns {Array} Agent IDs
   */
  getGodAgents(godName) {
    const agentSet = this.godAgents.get(godName);
    return agentSet ? Array.from(agentSet) : [];
  }

  /**
   * Terminate an agent
   * @param {string} agentId - Agent to terminate
   */
  async terminateAgent(agentId) {
    if (!this.initialized) {
      throw new Error('Bridge not initialized');
    }
    
    const godName = this.agentToGod.get(agentId);
    if (!godName) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    try {
      // Kill the process if it's still running
      const childProc = this.activeProcesses.get(agentId);
      if (childProc) {
        childProc.kill('SIGTERM');
        this.activeProcesses.delete(agentId);
      }
      
      // Update tracking
      const godAgentSet = this.godAgents.get(godName);
      if (godAgentSet) {
        godAgentSet.delete(agentId);
      }
      this.agentToGod.delete(agentId);
      
      this.emit('bridge:agent-terminated', { godName, agentId });
      
    } catch (error) {
      this.emit('bridge:terminate-error', { agentId, error });
      throw error;
    }
  }

  /**
   * Execute a task using Claude-Flow task engine
   * @param {string} godName - God requesting the task
   * @param {Object} task - Task configuration
   * @returns {Object} Task result
   */
  async executeTask(godName, task) {
    if (!this.initialized) {
      throw new Error('Bridge not initialized');
    }
    
    try {
      // Use task command to execute
      const args = [
        'task',
        'create',
        task.type || 'development',
        task.description || `Task requested by ${godName}`
      ];
      
      const output = await this.executeCommand(args);
      
      this.emit('bridge:task-completed', {
        godName,
        task,
        output
      });
      
      return {
        success: true,
        output
      };
      
    } catch (error) {
      this.emit('bridge:task-error', { godName, task, error });
      throw error;
    }
  }

  /**
   * Shutdown the bridge
   */
  async shutdown() {
    if (!this.initialized) return;
    
    try {
      // Terminate all running processes
      for (const [agentId, childProc] of this.activeProcesses) {
        childProc.kill('SIGTERM');
      }
      
      // Clear references
      this.godAgents.clear();
      this.agentToGod.clear();
      this.activeProcesses.clear();
      
      this.initialized = false;
      this.emit('bridge:shutdown');
      
    } catch (error) {
      this.emit('bridge:shutdown-error', { error });
      throw error;
    }
  }
}

// Singleton instance
let bridgeInstance = null;

/**
 * Get or create the Claude-Flow bridge instance
 * @param {Object} options - Bridge options
 * @returns {ClaudeFlowBridge} Bridge instance
 */
export function getClaudeFlowBridge(options = {}) {
  if (!bridgeInstance) {
    bridgeInstance = new ClaudeFlowBridge(options);
  }
  return bridgeInstance;
}

export default ClaudeFlowBridge;