import { EventEmitter } from 'events';
import { AgentMDLoader } from './agent-md-loader.js';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

/**
 * AgentMarketplace ("Agora") - Community repository for agent definitions
 * Enables sharing, discovery, and installation of custom agents
 */
export class AgentMarketplace extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // Marketplace configuration
    this.config = {
      registryUrl: options.registryUrl || 'https://pantheon-agora.io/api/v1',
      localRegistry: options.localRegistry || './marketplace',
      cacheDir: options.cacheDir || './marketplace/cache',
      indexFile: options.indexFile || './marketplace/index.json',
      requireSigning: options.requireSigning !== false,
      autoUpdate: options.autoUpdate !== false
    };
    
    // Local agent loader
    this.mdLoader = options.mdLoader || new AgentMDLoader();
    
    // Marketplace state
    this.index = new Map();        // Agent registry index
    this.installed = new Map();     // Installed agents
    this.cache = new Map();         // Downloaded agent cache
    this.ratings = new Map();       // Agent ratings
    this.downloads = new Map();     // Download statistics
    
    // Categories and tags
    this.categories = new Set([
      'development',
      'testing',
      'analysis',
      'design',
      'coordination',
      'security',
      'data',
      'communication',
      'specialized'
    ]);
    
    this.tags = new Set();
    
    // Initialize marketplace
    this.initialized = false;
  }

  /**
   * Initialize marketplace
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Create directories
      await fs.mkdir(this.config.localRegistry, { recursive: true });
      await fs.mkdir(this.config.cacheDir, { recursive: true });
      
      // Load local index
      await this.loadLocalIndex();
      
      // Load installed agents
      await this.loadInstalledAgents();
      
      // Fetch remote index if online
      if (this.config.autoUpdate) {
        await this.updateRemoteIndex().catch(err => {
          console.warn('Failed to update remote index:', err.message);
        });
      }
      
      this.initialized = true;
      this.emit('marketplace:initialized', {
        agents: this.index.size,
        installed: this.installed.size
      });
      
    } catch (error) {
      this.emit('marketplace:error', { error });
      throw error;
    }
  }

  /**
   * Search marketplace for agents
   */
  async search(query, filters = {}) {
    if (!this.initialized) await this.initialize();
    
    const results = [];
    const searchTerms = query.toLowerCase().split(/\s+/);
    
    // Search through index
    this.index.forEach((agent, id) => {
      let score = 0;
      
      // Name matching
      const name = agent.name.toLowerCase();
      searchTerms.forEach(term => {
        if (name.includes(term)) score += 3;
      });
      
      // Description matching
      const description = (agent.description || '').toLowerCase();
      searchTerms.forEach(term => {
        if (description.includes(term)) score += 2;
      });
      
      // Tag matching
      if (agent.tags) {
        searchTerms.forEach(term => {
          if (agent.tags.some(tag => tag.toLowerCase().includes(term))) {
            score += 2;
          }
        });
      }
      
      // Apply filters
      if (filters.category && agent.category !== filters.category) {
        score = 0;
      }
      
      if (filters.author && agent.author !== filters.author) {
        score = 0;
      }
      
      if (filters.minRating && this.getAverageRating(id) < filters.minRating) {
        score = 0;
      }
      
      if (score > 0) {
        results.push({
          agent,
          score,
          rating: this.getAverageRating(id),
          downloads: this.downloads.get(id) || 0,
          installed: this.installed.has(id)
        });
      }
    });
    
    // Sort by score and rating
    results.sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) return scoreDiff;
      return b.rating - a.rating;
    });
    
    return results.slice(0, filters.limit || 20);
  }

  /**
   * Get agent details
   */
  async getAgentDetails(agentId) {
    if (!this.initialized) await this.initialize();
    
    const agent = this.index.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    // Get additional details
    const details = {
      ...agent,
      rating: this.getAverageRating(agentId),
      ratings: this.ratings.get(agentId) || [],
      downloads: this.downloads.get(agentId) || 0,
      installed: this.installed.has(agentId),
      installedVersion: this.installed.get(agentId)?.version
    };
    
    // Fetch README if available
    if (agent.readme) {
      try {
        details.readmeContent = await this.fetchReadme(agentId);
      } catch (error) {
        // Ignore readme fetch errors
      }
    }
    
    return details;
  }

  /**
   * Install agent from marketplace
   */
  async install(agentId, options = {}) {
    if (!this.initialized) await this.initialize();
    
    const agent = this.index.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    this.emit('agent:installing', { agentId, agent });
    
    try {
      // Download agent package
      const packageData = await this.downloadPackage(agentId, agent.version);
      
      // Verify package if required
      if (this.config.requireSigning && packageData.signature) {
        await this.verifyPackage(packageData);
      }
      
      // Extract and install
      const installPath = await this.installPackage(agentId, packageData, options);
      
      // Update installed registry
      this.installed.set(agentId, {
        id: agentId,
        name: agent.name,
        version: agent.version,
        installedAt: Date.now(),
        path: installPath,
        source: 'marketplace'
      });
      
      // Save installed agents
      await this.saveInstalledAgents();
      
      // Update download count
      this.downloads.set(agentId, (this.downloads.get(agentId) || 0) + 1);
      
      this.emit('agent:installed', { 
        agentId, 
        version: agent.version,
        path: installPath 
      });
      
      return {
        success: true,
        agent,
        installPath
      };
      
    } catch (error) {
      this.emit('agent:install-failed', { agentId, error });
      throw error;
    }
  }

  /**
   * Uninstall agent
   */
  async uninstall(agentId) {
    const installed = this.installed.get(agentId);
    if (!installed) {
      throw new Error(`Agent not installed: ${agentId}`);
    }
    
    try {
      // Remove files
      await fs.rm(installed.path, { recursive: true, force: true });
      
      // Update registry
      this.installed.delete(agentId);
      await this.saveInstalledAgents();
      
      this.emit('agent:uninstalled', { agentId });
      
      return { success: true };
      
    } catch (error) {
      this.emit('agent:uninstall-failed', { agentId, error });
      throw error;
    }
  }

  /**
   * Publish agent to marketplace
   */
  async publish(agentDefinition, metadata = {}) {
    if (!this.initialized) await this.initialize();
    
    // Validate agent definition
    this.validateAgentDefinition(agentDefinition);
    
    // Generate agent ID
    const agentId = metadata.id || this.generateAgentId(agentDefinition.name);
    
    // Prepare package
    const packageData = {
      id: agentId,
      name: agentDefinition.name,
      version: metadata.version || '1.0.0',
      description: metadata.description || agentDefinition.description,
      author: metadata.author || 'anonymous',
      category: metadata.category || 'specialized',
      tags: metadata.tags || [],
      definition: agentDefinition,
      readme: metadata.readme,
      examples: metadata.examples || [],
      dependencies: metadata.dependencies || {},
      publishedAt: Date.now()
    };
    
    // Sign package if required
    if (this.config.requireSigning && metadata.privateKey) {
      packageData.signature = await this.signPackage(packageData, metadata.privateKey);
    }
    
    // Save locally first
    const localPath = await this.saveLocalPackage(agentId, packageData);
    
    // Update local index
    this.index.set(agentId, {
      id: agentId,
      name: packageData.name,
      version: packageData.version,
      description: packageData.description,
      author: packageData.author,
      category: packageData.category,
      tags: packageData.tags,
      publishedAt: packageData.publishedAt,
      local: true
    });
    
    await this.saveLocalIndex();
    
    // Attempt to publish to remote if online
    if (metadata.publishRemote && this.config.registryUrl) {
      try {
        await this.publishToRemote(packageData);
        this.emit('agent:published-remote', { agentId });
      } catch (error) {
        console.warn('Failed to publish to remote:', error.message);
      }
    }
    
    this.emit('agent:published', { agentId, local: localPath });
    
    return {
      success: true,
      agentId,
      localPath
    };
  }

  /**
   * Rate an agent
   */
  async rateAgent(agentId, rating, review = '') {
    if (!this.initialized) await this.initialize();
    
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    
    const agentRatings = this.ratings.get(agentId) || [];
    
    agentRatings.push({
      rating,
      review,
      timestamp: Date.now(),
      user: 'local' // In production, would be actual user
    });
    
    this.ratings.set(agentId, agentRatings);
    
    // Save ratings
    await this.saveRatings();
    
    this.emit('agent:rated', { agentId, rating });
    
    return {
      success: true,
      averageRating: this.getAverageRating(agentId)
    };
  }

  /**
   * Get installed agents
   */
  getInstalledAgents() {
    return Array.from(this.installed.values());
  }

  /**
   * Get featured agents
   */
  async getFeaturedAgents() {
    if (!this.initialized) await this.initialize();
    
    // Return highly rated and popular agents
    const agents = Array.from(this.index.values())
      .map(agent => ({
        agent,
        rating: this.getAverageRating(agent.id),
        downloads: this.downloads.get(agent.id) || 0
      }))
      .filter(item => item.rating >= 4.0 || item.downloads >= 100)
      .sort((a, b) => {
        // Sort by combination of rating and downloads
        const scoreA = a.rating * 0.7 + Math.min(a.downloads / 100, 10) * 0.3;
        const scoreB = b.rating * 0.7 + Math.min(b.downloads / 100, 10) * 0.3;
        return scoreB - scoreA;
      })
      .slice(0, 10);
    
    return agents;
  }

  /**
   * Get agents by category
   */
  async getByCategory(category) {
    if (!this.initialized) await this.initialize();
    
    return Array.from(this.index.values())
      .filter(agent => agent.category === category)
      .map(agent => ({
        agent,
        rating: this.getAverageRating(agent.id),
        downloads: this.downloads.get(agent.id) || 0,
        installed: this.installed.has(agent.id)
      }));
  }

  /**
   * Update agent
   */
  async update(agentId) {
    const installed = this.installed.get(agentId);
    if (!installed) {
      throw new Error(`Agent not installed: ${agentId}`);
    }
    
    const agent = this.index.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found in marketplace: ${agentId}`);
    }
    
    // Check if update available
    if (agent.version === installed.version) {
      return { success: true, message: 'Already up to date' };
    }
    
    // Install new version
    return await this.install(agentId, { update: true });
  }

  /**
   * Import agent from file
   */
  async importAgent(filePath, metadata = {}) {
    const content = await fs.readFile(filePath, 'utf-8');
    
    let agentDefinition;
    
    if (filePath.endsWith('.json')) {
      agentDefinition = JSON.parse(content);
    } else if (filePath.endsWith('.md')) {
      // Parse markdown format
      agentDefinition = this.parseMDAgent(content);
    } else {
      throw new Error('Unsupported file format');
    }
    
    // Use filename as default name
    const defaultName = path.basename(filePath, path.extname(filePath));
    agentDefinition.name = agentDefinition.name || defaultName;
    
    return await this.publish(agentDefinition, metadata);
  }

  /**
   * Export agent
   */
  async exportAgent(agentId, outputPath) {
    const installed = this.installed.get(agentId);
    if (!installed) {
      throw new Error(`Agent not installed: ${agentId}`);
    }
    
    const agent = this.index.get(agentId);
    const packageData = await this.loadPackageData(agentId);
    
    // Create export bundle
    const bundle = {
      agent,
      package: packageData,
      exportedAt: Date.now(),
      version: '1.0'
    };
    
    await fs.writeFile(outputPath, JSON.stringify(bundle, null, 2));
    
    return { success: true, path: outputPath };
  }

  /**
   * Helper methods
   */
  
  async loadLocalIndex() {
    try {
      const indexData = await fs.readFile(this.config.indexFile, 'utf-8');
      const index = JSON.parse(indexData);
      
      index.forEach(agent => {
        this.index.set(agent.id, agent);
        if (agent.tags) {
          agent.tags.forEach(tag => this.tags.add(tag));
        }
      });
    } catch (error) {
      // No index file yet
    }
  }
  
  async saveLocalIndex() {
    const index = Array.from(this.index.values());
    await fs.writeFile(this.config.indexFile, JSON.stringify(index, null, 2));
  }
  
  async loadInstalledAgents() {
    try {
      const installedPath = path.join(this.config.localRegistry, 'installed.json');
      const data = await fs.readFile(installedPath, 'utf-8');
      const installed = JSON.parse(data);
      
      installed.forEach(agent => {
        this.installed.set(agent.id, agent);
      });
    } catch (error) {
      // No installed agents yet
    }
  }
  
  async saveInstalledAgents() {
    const installed = Array.from(this.installed.values());
    const installedPath = path.join(this.config.localRegistry, 'installed.json');
    await fs.writeFile(installedPath, JSON.stringify(installed, null, 2));
  }
  
  async updateRemoteIndex() {
    // In production, would fetch from actual registry
    // For demo, simulate with local data
    this.emit('marketplace:index-updated', { source: 'remote' });
  }
  
  validateAgentDefinition(definition) {
    if (!definition.name) {
      throw new Error('Agent must have a name');
    }
    
    if (!definition.instructions && !definition.description) {
      throw new Error('Agent must have instructions or description');
    }
    
    // Validate capabilities
    if (definition.capabilities && !Array.isArray(definition.capabilities)) {
      throw new Error('Capabilities must be an array');
    }
    
    // Validate tools
    if (definition.tools && !Array.isArray(definition.tools)) {
      throw new Error('Tools must be an array');
    }
  }
  
  generateAgentId(name) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${sanitized}-${timestamp}-${random}`;
  }
  
  async downloadPackage(agentId, version) {
    // Check cache first
    const cacheKey = `${agentId}@${version}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // In production, would download from registry
    // For demo, load from local storage
    const packagePath = path.join(this.config.localRegistry, 'packages', `${agentId}.json`);
    
    try {
      const data = await fs.readFile(packagePath, 'utf-8');
      const packageData = JSON.parse(data);
      
      // Cache for future use
      this.cache.set(cacheKey, packageData);
      
      return packageData;
    } catch (error) {
      throw new Error(`Failed to download package: ${error.message}`);
    }
  }
  
  async verifyPackage(packageData) {
    // In production, would verify cryptographic signature
    if (!packageData.signature) {
      throw new Error('Package is not signed');
    }
    
    // Simulate verification
    return true;
  }
  
  async installPackage(agentId, packageData, options) {
    const installDir = path.join(this.config.localRegistry, 'agents', agentId);
    
    // Create directory
    await fs.mkdir(installDir, { recursive: true });
    
    // Write agent definition
    const definitionPath = path.join(installDir, 'agent.md');
    await fs.writeFile(definitionPath, this.generateAgentMD(packageData.definition));
    
    // Write metadata
    const metadataPath = path.join(installDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify({
      id: packageData.id,
      name: packageData.name,
      version: packageData.version,
      author: packageData.author,
      installedAt: Date.now()
    }, null, 2));
    
    // Write examples if provided
    if (packageData.examples && packageData.examples.length > 0) {
      const examplesDir = path.join(installDir, 'examples');
      await fs.mkdir(examplesDir, { recursive: true });
      
      for (let i = 0; i < packageData.examples.length; i++) {
        const example = packageData.examples[i];
        const examplePath = path.join(examplesDir, `example-${i + 1}.js`);
        await fs.writeFile(examplePath, example.code || example);
      }
    }
    
    return installDir;
  }
  
  generateAgentMD(definition) {
    let md = `# ${definition.name}\n\n`;
    
    if (definition.description) {
      md += `${definition.description}\n\n`;
    }
    
    if (definition.capabilities && definition.capabilities.length > 0) {
      md += `## Capabilities\n\n`;
      definition.capabilities.forEach(cap => {
        md += `- ${cap}\n`;
      });
      md += '\n';
    }
    
    if (definition.tools && definition.tools.length > 0) {
      md += `## Tools\n\n`;
      definition.tools.forEach(tool => {
        md += `- ${tool}\n`;
      });
      md += '\n';
    }
    
    if (definition.instructions) {
      md += `## Instructions\n\n${definition.instructions}\n`;
    }
    
    return md;
  }
  
  async saveLocalPackage(agentId, packageData) {
    const packageDir = path.join(this.config.localRegistry, 'packages');
    await fs.mkdir(packageDir, { recursive: true });
    
    const packagePath = path.join(packageDir, `${agentId}.json`);
    await fs.writeFile(packagePath, JSON.stringify(packageData, null, 2));
    
    return packagePath;
  }
  
  async publishToRemote(packageData) {
    // In production, would POST to registry API
    throw new Error('Remote publishing not implemented in demo');
  }
  
  async signPackage(packageData, privateKey) {
    // In production, would use proper cryptographic signing
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(packageData));
    return hash.digest('hex');
  }
  
  getAverageRating(agentId) {
    const ratings = this.ratings.get(agentId) || [];
    if (ratings.length === 0) return 0;
    
    const sum = ratings.reduce((total, r) => total + r.rating, 0);
    return sum / ratings.length;
  }
  
  async saveRatings() {
    const ratingsPath = path.join(this.config.localRegistry, 'ratings.json');
    const ratingsData = Array.from(this.ratings.entries()).map(([agentId, ratings]) => ({
      agentId,
      ratings
    }));
    await fs.writeFile(ratingsPath, JSON.stringify(ratingsData, null, 2));
  }
  
  async fetchReadme(agentId) {
    const installed = this.installed.get(agentId);
    if (installed) {
      const readmePath = path.join(installed.path, 'README.md');
      try {
        return await fs.readFile(readmePath, 'utf-8');
      } catch (error) {
        // No README
      }
    }
    return null;
  }
  
  parseMDAgent(content) {
    // Simple MD parser for agent definitions
    const definition = {
      name: '',
      description: '',
      capabilities: [],
      tools: [],
      instructions: ''
    };
    
    const lines = content.split('\n');
    let currentSection = '';
    let sectionContent = [];
    
    for (const line of lines) {
      if (line.startsWith('# ')) {
        definition.name = line.substring(2).trim();
      } else if (line.startsWith('## ')) {
        // Save previous section
        if (currentSection && sectionContent.length > 0) {
          this.parseSectionContent(definition, currentSection, sectionContent);
        }
        
        currentSection = line.substring(3).trim().toLowerCase();
        sectionContent = [];
      } else {
        sectionContent.push(line);
      }
    }
    
    // Save last section
    if (currentSection && sectionContent.length > 0) {
      this.parseSectionContent(definition, currentSection, sectionContent);
    }
    
    return definition;
  }
  
  parseSectionContent(definition, section, content) {
    const text = content.join('\n').trim();
    
    switch (section) {
      case 'description':
        definition.description = text;
        break;
      case 'capabilities':
        definition.capabilities = content
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace(/^-\s*/, '').trim());
        break;
      case 'tools':
        definition.tools = content
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace(/^-\s*/, '').trim());
        break;
      case 'instructions':
        definition.instructions = text;
        break;
    }
  }
  
  async loadPackageData(agentId) {
    const packagePath = path.join(this.config.localRegistry, 'packages', `${agentId}.json`);
    const data = await fs.readFile(packagePath, 'utf-8');
    return JSON.parse(data);
  }
}

export default AgentMarketplace;