import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';
import matter from 'gray-matter';

/**
 * AgentMDLoader - Loads and manages Claude-Flow agent MD files
 * Provides access to 54+ pre-defined agents for adaptation and customization
 */
export class AgentMDLoader extends EventEmitter {
  constructor(claudeFlowPath = '../claude-flow') {
    super();
    
    // Base path to Claude-Flow agents
    this.basePath = path.join(claudeFlowPath, '.claude/agents');
    
    // Cache for loaded agents
    this.agentCache = new Map();
    
    // Category index for quick lookups
    this.categoryIndex = new Map();
    
    // Capability index for searching
    this.capabilityIndex = new Map();
    
    // Loading state
    this.initialized = false;
    this.loadingPromise = null;
  }

  /**
   * Initialize the loader by scanning all agent files
   */
  async initialize() {
    if (this.initialized) return;
    if (this.loadingPromise) return this.loadingPromise;
    
    this.loadingPromise = this._performInitialization();
    await this.loadingPromise;
    this.initialized = true;
    this.loadingPromise = null;
  }

  async _performInitialization() {
    try {
      const startTime = Date.now();
      this.emit('loader:initializing');
      
      // Scan directory structure
      const categories = await this.scanCategories();
      
      // Load all agents
      let totalLoaded = 0;
      for (const category of categories) {
        const agents = await this.loadCategoryAgents(category);
        totalLoaded += agents.length;
      }
      
      const duration = Date.now() - startTime;
      this.emit('loader:initialized', {
        totalAgents: totalLoaded,
        categories: categories.length,
        duration
      });
      
      console.log(`✅ Loaded ${totalLoaded} Claude-Flow agents in ${duration}ms`);
      
    } catch (error) {
      this.emit('loader:error', error);
      throw new Error(`Failed to initialize AgentMDLoader: ${error.message}`);
    }
  }

  /**
   * Scan for agent categories (directories)
   */
  async scanCategories() {
    const entries = await fs.readdir(this.basePath, { withFileTypes: true });
    const categories = [];
    
    // Add root level as 'general' category
    categories.push({
      name: 'general',
      path: this.basePath
    });
    
    // Add subdirectories as categories
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        categories.push({
          name: entry.name,
          path: path.join(this.basePath, entry.name)
        });
      }
    }
    
    return categories;
  }

  /**
   * Load all agents from a category
   */
  async loadCategoryAgents(category) {
    const agents = [];
    const files = await fs.readdir(category.path);
    
    for (const file of files) {
      if (file.endsWith('.md') && !file.startsWith('.')) {
        const filePath = path.join(category.path, file);
        const agent = await this.loadAgentFile(filePath, category.name);
        if (agent) {
          agents.push(agent);
          this.cacheAgent(agent);
        }
      }
    }
    
    // Update category index
    this.categoryIndex.set(category.name, agents.map(a => a.name));
    
    return agents;
  }

  /**
   * Load and parse a single agent MD file
   */
  async loadAgentFile(filePath, category) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const { data: metadata, content: markdown } = matter(content);
      
      // Extract agent name from metadata or filename
      const fileName = path.basename(filePath, '.md');
      const agentName = metadata.name || fileName;
      
      // Parse the agent structure
      const agent = {
        name: agentName,
        category,
        filePath,
        metadata: {
          ...metadata,
          category
        },
        instructions: markdown,
        sections: this.parseMarkdownSections(markdown),
        capabilities: this.extractCapabilities(metadata, markdown),
        tools: metadata.tools ? this.parseTools(metadata.tools) : []
      };
      
      return agent;
      
    } catch (error) {
      console.warn(`Failed to load agent ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse markdown into sections
   */
  parseMarkdownSections(markdown) {
    const sections = {};
    const lines = markdown.split('\n');
    let currentSection = 'introduction';
    let sectionContent = [];
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        // Save previous section
        if (sectionContent.length > 0) {
          sections[currentSection] = sectionContent.join('\n').trim();
        }
        
        // Start new section
        currentSection = line.substring(3).toLowerCase().replace(/\s+/g, '_');
        sectionContent = [];
      } else {
        sectionContent.push(line);
      }
    }
    
    // Save last section
    if (sectionContent.length > 0) {
      sections[currentSection] = sectionContent.join('\n').trim();
    }
    
    return sections;
  }

  /**
   * Extract capabilities from metadata and content
   */
  extractCapabilities(metadata, markdown) {
    const capabilities = new Set();
    
    // From metadata
    if (metadata.capabilities) {
      if (Array.isArray(metadata.capabilities)) {
        metadata.capabilities.forEach(cap => capabilities.add(cap));
      } else if (typeof metadata.capabilities === 'object') {
        Object.values(metadata.capabilities).flat().forEach(cap => capabilities.add(cap));
      }
    }
    
    // From description
    if (metadata.description) {
      const keywords = ['analyze', 'implement', 'test', 'debug', 'optimize', 'design', 'review'];
      keywords.forEach(keyword => {
        if (metadata.description.toLowerCase().includes(keyword)) {
          capabilities.add(keyword);
        }
      });
    }
    
    // From markdown sections
    const responsibilitiesMatch = markdown.match(/##\s*(?:Core\s*)?Responsibilities[\s\S]*?(?=##|$)/i);
    if (responsibilitiesMatch) {
      const respText = responsibilitiesMatch[0].toLowerCase();
      const capabilityPatterns = [
        /\b(code|implement|develop|build)\b/g,
        /\b(test|validate|verify)\b/g,
        /\b(analyze|assess|evaluate)\b/g,
        /\b(design|architect|plan)\b/g,
        /\b(optimize|improve|enhance)\b/g,
        /\b(debug|troubleshoot|fix)\b/g,
        /\b(review|audit|inspect)\b/g,
        /\b(coordinate|orchestrate|manage)\b/g
      ];
      
      capabilityPatterns.forEach(pattern => {
        const matches = respText.match(pattern);
        if (matches) {
          matches.forEach(match => capabilities.add(match));
        }
      });
    }
    
    return Array.from(capabilities);
  }

  /**
   * Parse tools from metadata
   */
  parseTools(tools) {
    if (typeof tools === 'string') {
      return tools.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (Array.isArray(tools)) {
      return tools;
    }
    return [];
  }

  /**
   * Cache an agent and update indices
   */
  cacheAgent(agent) {
    // Add to main cache
    this.agentCache.set(agent.name, agent);
    
    // Update capability index
    agent.capabilities.forEach(capability => {
      if (!this.capabilityIndex.has(capability)) {
        this.capabilityIndex.set(capability, new Set());
      }
      this.capabilityIndex.get(capability).add(agent.name);
    });
  }

  /**
   * Get a specific agent by name
   */
  async getAgent(name) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    return this.agentCache.get(name);
  }

  /**
   * Find agents by capability
   */
  async findAgentsByCapability(capability) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const agentNames = this.capabilityIndex.get(capability) || new Set();
    const agents = [];
    
    for (const name of agentNames) {
      const agent = this.agentCache.get(name);
      if (agent) {
        agents.push(agent);
      }
    }
    
    return agents;
  }

  /**
   * Find agents by category
   */
  async findAgentsByCategory(category) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const agentNames = this.categoryIndex.get(category) || [];
    return agentNames.map(name => this.agentCache.get(name)).filter(Boolean);
  }

  /**
   * Search agents by multiple criteria
   */
  async searchAgents(criteria) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    let results = Array.from(this.agentCache.values());
    
    // Filter by capabilities
    if (criteria.capabilities && criteria.capabilities.length > 0) {
      results = results.filter(agent => 
        criteria.capabilities.some(cap => agent.capabilities.includes(cap))
      );
    }
    
    // Filter by tools
    if (criteria.tools && criteria.tools.length > 0) {
      results = results.filter(agent =>
        criteria.tools.some(tool => agent.tools.includes(tool))
      );
    }
    
    // Filter by category
    if (criteria.category) {
      results = results.filter(agent => agent.category === criteria.category);
    }
    
    // Filter by keyword in instructions
    if (criteria.keyword) {
      const keyword = criteria.keyword.toLowerCase();
      results = results.filter(agent => 
        agent.instructions.toLowerCase().includes(keyword) ||
        agent.metadata.description?.toLowerCase().includes(keyword)
      );
    }
    
    return results;
  }

  /**
   * Get all available agents
   */
  async getAllAgents() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    return Array.from(this.agentCache.values());
  }

  /**
   * Get agent recommendations for a task
   */
  async recommendAgentsForTask(taskDescription) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const keywords = taskDescription.toLowerCase().split(/\s+/);
    const scores = new Map();
    
    // Score agents based on keyword matches
    for (const [name, agent] of this.agentCache) {
      let score = 0;
      
      // Check description
      if (agent.metadata.description) {
        const desc = agent.metadata.description.toLowerCase();
        keywords.forEach(keyword => {
          if (desc.includes(keyword)) score += 2;
        });
      }
      
      // Check capabilities
      keywords.forEach(keyword => {
        if (agent.capabilities.some(cap => cap.includes(keyword))) {
          score += 3;
        }
      });
      
      // Check instructions
      const instructions = agent.instructions.toLowerCase();
      keywords.forEach(keyword => {
        if (instructions.includes(keyword)) score += 1;
      });
      
      if (score > 0) {
        scores.set(name, score);
      }
    }
    
    // Sort by score and return top recommendations
    const sorted = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return sorted.map(([name, score]) => ({
      agent: this.agentCache.get(name),
      score,
      relevance: score > 10 ? 'high' : score > 5 ? 'medium' : 'low'
    }));
  }

  /**
   * Get agent statistics
   */
  getStatistics() {
    return {
      totalAgents: this.agentCache.size,
      categories: Array.from(this.categoryIndex.keys()),
      capabilities: Array.from(this.capabilityIndex.keys()),
      initialized: this.initialized
    };
  }
}

export default AgentMDLoader;