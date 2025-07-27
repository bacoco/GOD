import { readFile } from 'fs/promises';
import { BaseGod } from './base-god.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class GodFactory {
  constructor(pantheon) {
    this.pantheon = pantheon;
    this.godClasses = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    // Load all god implementations
    await this.loadGodImplementations();
    
    this.initialized = true;
  }

  async loadGodImplementations() {
    const godsDir = join(__dirname, 'gods');
    const godNames = [
      'zeus', 'janus', 'daedalus', 'hephaestus', 'apollo',
      'athena', 'prometheus', 'hermes', 'themis', 'aegis',
      'oracle', 'harmonia', 'calliope', 'iris', 'argus',
      'code-reviewer'
    ];
    
    for (const godName of godNames) {
      try {
        const godPath = join(godsDir, `${godName}.js`);
        const GodClass = await this.loadGodClass(godPath, godName);
        this.godClasses.set(godName, GodClass);
      } catch (error) {
        // If specific implementation doesn't exist, use BaseGod
        this.godClasses.set(godName, BaseGod);
      }
    }
  }

  async loadGodClass(godPath, godName) {
    try {
      const module = await import(godPath);
      return module.default || module[this.capitalize(godName)];
    } catch (error) {
      // Return BaseGod as fallback
      return BaseGod;
    }
  }

  async createGod(godName, options = {}) {
    const GodClass = this.godClasses.get(godName) || BaseGod;
    
    // Load config from provided path or default location
    const configPath = options.config?.configPath || join(this.configDir || join(__dirname, '..', '.claude'), 'agents', `${godName}.md`);
    const config = await this.loadGodConfig(configPath);
    
    // Ensure Task tool is included for AI-driven orchestration
    if (config.orchestrationMode !== 'js-only' && !config.tools.includes('Task')) {
      config.tools.push('Task');
    }
    
    // Special handling for certain gods
    if (godName === 'janus' && config.orchestrationMode === undefined) {
      config.orchestrationMode = 'ai-driven'; // Janus is always AI-driven
    }
    
    const god = new GodClass({
      name: godName,
      config,
      ...options,
      pantheon: this.pantheon,
      factory: this,
      // Pass through any safety limits
      maxAgents: options.maxAgents,
      maxDepth: options.maxDepth,
      timeout: options.timeout
    });
    
    return god;
  }

  async loadGodConfig(configPath) {
    try {
      const content = await readFile(configPath, 'utf-8');
      return this.parseGodConfig(content);
    } catch (error) {
      console.error(`Failed to load god config from ${configPath}:`, error);
      return {};
    }
  }

  parseGodConfig(mdContent) {
    const config = {
      raw: mdContent,
      name: '',
      role: '',
      responsibilities: [],
      capabilities: [],
      tools: [],
      prompts: {},
      metadata: {},
      orchestrationMode: 'hybrid', // Default
      allowedGods: []
    };
    
    // Extract frontmatter if present
    const frontmatterMatch = mdContent.match(/^---\s*\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      
      // Parse tools from frontmatter
      const toolsLine = frontmatter.match(/tools:\s*(.+)/i);
      if (toolsLine) {
        config.tools = toolsLine[1].split(',').map(t => t.trim());
      }
      
      // Parse orchestration mode
      const orchestrationLine = frontmatter.match(/orchestrationMode:\s*(.+)/i);
      if (orchestrationLine) {
        config.orchestrationMode = orchestrationLine[1].trim();
      }
      
      // Parse allowed gods
      const allowedGodsLine = frontmatter.match(/allowedGods:\s*(.+)/i);
      if (allowedGodsLine) {
        const gods = allowedGodsLine[1].trim();
        config.allowedGods = gods === 'all' ? ['all'] : gods.split(',').map(g => g.trim());
      }
      
      // Parse name from frontmatter
      const nameLine = frontmatter.match(/name:\s*(.+)/i);
      if (nameLine) {
        config.name = nameLine[1].trim();
      }
      
      // Parse description
      const descLine = frontmatter.match(/description:\s*(.+)/i);
      if (descLine) {
        config.metadata.description = descLine[1].trim();
      }
    }
    
    // Extract name from markdown if not in frontmatter
    if (!config.name) {
      const nameMatch = mdContent.match(/^#\s+(.+)/m);
      if (nameMatch) {
        config.name = nameMatch[1].trim();
      }
    }
    
    // Extract role
    const roleMatch = mdContent.match(/##\s*Role[:\s]*(.+)/i);
    if (roleMatch) {
      config.role = roleMatch[1].trim();
    }
    
    // Extract responsibilities
    const respMatch = mdContent.match(/##\s*Responsibilities[:\s]*([\s\S]+?)(?=##|$)/i);
    if (respMatch) {
      config.responsibilities = respMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[\s\-\*]+/, '').trim())
        .filter(Boolean);
    }
    
    // Extract capabilities
    const capMatch = mdContent.match(/##\s*Capabilities[:\s]*([\s\S]+?)(?=##|$)/i);
    if (capMatch) {
      config.capabilities = capMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[\s\-\*]+/, '').trim())
        .filter(Boolean);
    }
    
    // Extract tools from content if not in frontmatter
    if (config.tools.length === 0) {
      const toolsMatch = mdContent.match(/##\s*Tools[:\s]*([\s\S]+?)(?=##|$)/i);
      if (toolsMatch) {
        config.tools = toolsMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
          .map(line => line.replace(/^[\s\-\*]+/, '').trim())
          .filter(Boolean);
      }
    }
    
    // Extract prompt sections
    const promptMatches = mdContent.matchAll(/###\s*(.+?)\s*Prompt[:\s]*([\s\S]+?)(?=###|##|$)/gi);
    for (const match of promptMatches) {
      const promptType = match[1].toLowerCase().replace(/\s+/g, '_');
      config.prompts[promptType] = match[2].trim();
    }
    
    return config;
  }

  async createSubAgent(parentGod, type, specialization = {}) {
    const subAgentId = `${parentGod.name}-${type}-${Date.now()}`;
    
    const subAgent = {
      id: subAgentId,
      type,
      parentGod: parentGod.name,
      specialization,
      status: 'active',
      createdAt: new Date(),
      
      // Agent methods
      async execute(task) {
        return await parentGod.executeSubAgentTask(subAgentId, task);
      },
      
      async communicate(message) {
        return await parentGod.handleSubAgentMessage(subAgentId, message);
      },
      
      async terminate() {
        parentGod.terminateSubAgent(subAgentId);
      }
    };
    
    return subAgent;
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async shutdown() {
    this.godClasses.clear();
    this.initialized = false;
  }
}

export default GodFactory;