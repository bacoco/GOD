/**
 * Agent Spawner
 * Handles dynamic agent creation with god-specific configurations
 */

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class AgentSpawner {
  constructor(pantheon) {
    this.pantheon = pantheon;
    
    // God-specific agent templates
    this.agentTemplates = {
      zeus: {
        type: 'orchestrator',
        tools: ['Task', 'TodoWrite', 'Memory', 'Read', 'Write', 'Edit', 'Bash'],
        capabilities: ['orchestration', 'delegation', 'planning', 'coordination'],
        baseInstructions: 'You are Zeus, the supreme orchestrator. Coordinate all agents and ensure project success.'
      },
      
      daedalus: {
        type: 'architect',
        tools: ['Read', 'Write', 'Edit', 'TodoWrite', 'Memory'],
        capabilities: ['architecture', 'system-design', 'patterns', 'structure'],
        baseInstructions: 'You are Daedalus, the master architect. Design robust and scalable systems.'
      },
      
      hephaestus: {
        type: 'developer',
        tools: ['Read', 'Write', 'Edit', 'Bash', 'TodoWrite', 'Memory'],
        capabilities: ['coding', 'implementation', 'backend', 'api'],
        baseInstructions: 'You are Hephaestus, the master craftsman. Build robust and efficient code.'
      },
      
      apollo: {
        type: 'designer',
        tools: ['Read', 'Write', 'Edit', 'TodoWrite', 'Memory'],
        capabilities: ['ui', 'ux', 'frontend', 'design'],
        baseInstructions: 'You are Apollo, the god of beauty and light. Create stunning user interfaces.'
      },
      
      themis: {
        type: 'tester',
        tools: ['Read', 'Write', 'Edit', 'Bash', 'TodoWrite'],
        capabilities: ['testing', 'quality', 'validation', 'verification'],
        baseInstructions: 'You are Themis, the guardian of quality. Ensure everything works perfectly.'
      },
      
      prometheus: {
        type: 'strategist',
        tools: ['TodoWrite', 'Memory', 'Read', 'Write'],
        capabilities: ['product', 'strategy', 'planning', 'requirements'],
        baseInstructions: 'You are Prometheus, the visionary. Shape product strategy and features.'
      },
      
      athena: {
        type: 'analyst',
        tools: ['Read', 'TodoWrite', 'Memory', 'Grep'],
        capabilities: ['analysis', 'insights', 'research', 'validation'],
        baseInstructions: 'You are Athena, goddess of wisdom. Provide strategic insights and analysis.'
      },
      
      hermes: {
        type: 'coordinator',
        tools: ['TodoWrite', 'Memory', 'Read'],
        capabilities: ['process', 'communication', 'workflow', 'agile'],
        baseInstructions: 'You are Hermes, the messenger. Facilitate communication and process.'
      },
      
      aegis: {
        type: 'security',
        tools: ['Read', 'Grep', 'TodoWrite', 'Memory'],
        capabilities: ['security', 'compliance', 'protection', 'audit'],
        baseInstructions: 'You are Aegis, the protector. Ensure security and compliance.'
      }
    };
    
    // Track spawned agents
    this.spawnedAgents = new Map();
  }

  /**
   * Spawn an agent for a specific god
   * @param {string} godName - Name of the god
   * @param {Object} taskConfig - Task-specific configuration
   * @returns {Object} Spawned agent
   */
  async spawnAgent(godName, taskConfig = {}) {
    const template = this.agentTemplates[godName.toLowerCase()];
    if (!template) {
      throw new Error(`No agent template found for god: ${godName}`);
    }
    
    // Load god's markdown configuration if available
    const godConfig = await this.loadGodConfig(godName);
    
    // Merge configurations
    const agentConfig = {
      name: taskConfig.name || `${godName}-${Date.now()}`,
      type: taskConfig.type || template.type,
      tools: this.mergeTools(template.tools, taskConfig.tools),
      instructions: this.createInstructions(godName, template, godConfig, taskConfig),
      metadata: {
        god: godName,
        capabilities: template.capabilities,
        task: taskConfig.task,
        context: taskConfig.context,
        ...taskConfig.metadata
      }
    };
    
    // Create the agent through Pantheon
    const agent = await this.pantheon.createClaudeFlowAgent(godName, agentConfig);
    
    // Track the agent
    if (!this.spawnedAgents.has(godName)) {
      this.spawnedAgents.set(godName, new Set());
    }
    this.spawnedAgents.get(godName).add(agent.id);
    
    // Enhance agent with god-specific methods
    this.enhanceAgent(agent, godName, template);
    
    return agent;
  }

  /**
   * Spawn multiple agents in parallel
   * @param {Array} spawnConfigs - Array of {godName, taskConfig} objects
   * @returns {Array} Spawned agents
   */
  async spawnSwarm(spawnConfigs) {
    const spawnPromises = spawnConfigs.map(config => 
      this.spawnAgent(config.godName, config.taskConfig)
    );
    
    return await Promise.all(spawnPromises);
  }

  /**
   * Load god's markdown configuration
   * @param {string} godName - Name of the god
   * @returns {Object} God configuration
   */
  async loadGodConfig(godName) {
    try {
      const configPath = join(__dirname, '..', '.claude', 'agents', `${godName.toLowerCase()}.md`);
      const content = await readFile(configPath, 'utf-8');
      return this.parseGodMarkdown(content);
    } catch (error) {
      // Return empty config if file doesn't exist
      return {};
    }
  }

  /**
   * Parse god markdown configuration
   * @param {string} content - Markdown content
   * @returns {Object} Parsed configuration
   */
  parseGodMarkdown(content) {
    const config = {
      raw: content,
      description: '',
      tools: [],
      responsibilities: []
    };
    
    // Extract description
    const descMatch = content.match(/## Description\s*\n([\s\S]*?)(?=\n##|$)/);
    if (descMatch) {
      config.description = descMatch[1].trim();
    }
    
    // Extract tools
    const toolsMatch = content.match(/## Tools\s*\n([\s\S]*?)(?=\n##|$)/);
    if (toolsMatch) {
      config.tools = toolsMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim());
    }
    
    // Extract responsibilities
    const respMatch = content.match(/## Responsibilities\s*\n([\s\S]*?)(?=\n##|$)/);
    if (respMatch) {
      config.responsibilities = respMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim());
    }
    
    return config;
  }

  /**
   * Merge tool lists
   * @param {Array} baseTools - Base tools from template
   * @param {Array} additionalTools - Additional tools from config
   * @returns {Array} Merged tools
   */
  mergeTools(baseTools, additionalTools = []) {
    const toolSet = new Set([...baseTools, ...additionalTools]);
    return Array.from(toolSet);
  }

  /**
   * Create agent instructions
   * @param {string} godName - Name of the god
   * @param {Object} template - Agent template
   * @param {Object} godConfig - God markdown config
   * @param {Object} taskConfig - Task configuration
   * @returns {string} Complete instructions
   */
  createInstructions(godName, template, godConfig, taskConfig) {
    const sections = [];
    
    // Base identity
    sections.push(template.baseInstructions);
    
    // God description from markdown
    if (godConfig.description) {
      sections.push(`\nGod Description:\n${godConfig.description}`);
    }
    
    // Responsibilities
    if (godConfig.responsibilities && godConfig.responsibilities.length > 0) {
      sections.push(`\nYour Responsibilities:\n${godConfig.responsibilities.map(r => `- ${r}`).join('\n')}`);
    }
    
    // Task-specific instructions
    if (taskConfig.instructions) {
      sections.push(`\nTask Instructions:\n${taskConfig.instructions}`);
    }
    
    // Context
    if (taskConfig.context) {
      sections.push(`\nContext:\n${JSON.stringify(taskConfig.context, null, 2)}`);
    }
    
    // Collaboration instructions
    sections.push(`\nCollaboration:
- Work with other gods through the Divine Messenger
- Report progress regularly
- Ask for help when needed
- Share knowledge and insights
- Follow the orchestration of Zeus`);
    
    return sections.join('\n\n');
  }

  /**
   * Enhance agent with god-specific methods
   * @param {Object} agent - The agent to enhance
   * @param {string} godName - Name of the god
   * @param {Object} template - Agent template
   */
  enhanceAgent(agent, godName, template) {
    // Add god-specific methods
    agent.godName = godName;
    agent.capabilities = template.capabilities;
    
    // Add convenience methods
    agent.reportProgress = async (message) => {
      return await agent.execute({
        type: 'progress-report',
        message: message
      });
    };
    
    agent.collaborateWith = async (otherGod, message) => {
      return await agent.execute({
        type: 'collaboration',
        target: otherGod,
        message: message
      });
    };
    
    agent.completeTask = async (result) => {
      return await agent.execute({
        type: 'task-completion',
        result: result
      });
    };
  }

  /**
   * Get all agents spawned for a god
   * @param {string} godName - Name of the god
   * @returns {Array} Agent IDs
   */
  getGodAgents(godName) {
    const agentSet = this.spawnedAgents.get(godName);
    return agentSet ? Array.from(agentSet) : [];
  }

  /**
   * Get all spawned agents
   * @returns {Object} Map of god names to agent IDs
   */
  getAllAgents() {
    const result = {};
    for (const [godName, agentSet] of this.spawnedAgents) {
      result[godName] = Array.from(agentSet);
    }
    return result;
  }

  /**
   * Terminate an agent
   * @param {string} agentId - Agent to terminate
   */
  async terminateAgent(agentId) {
    // Remove from tracking
    for (const [godName, agentSet] of this.spawnedAgents) {
      if (agentSet.has(agentId)) {
        agentSet.delete(agentId);
        break;
      }
    }
    
    // Terminate through Pantheon
    if (this.pantheon.claudeFlowBridge) {
      await this.pantheon.claudeFlowBridge.terminateAgent(agentId);
    }
  }

  /**
   * Terminate all agents for a god
   * @param {string} godName - Name of the god
   */
  async terminateGodAgents(godName) {
    const agentIds = this.getGodAgents(godName);
    for (const agentId of agentIds) {
      await this.terminateAgent(agentId);
    }
  }

  /**
   * Terminate all spawned agents
   */
  async terminateAll() {
    const allAgents = this.getAllAgents();
    for (const godName in allAgents) {
      await this.terminateGodAgents(godName);
    }
  }
}

export default AgentSpawner;