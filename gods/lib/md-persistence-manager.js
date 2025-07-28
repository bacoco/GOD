/**
 * MD Persistence Manager
 * Manages saving, loading, and organizing custom agent MD files
 * Creates project-specific agent configurations
 */

import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class MDPersistenceManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // Base paths for MD storage
    this.basePath = options.basePath || path.join(__dirname, '..', '.claude', 'agents');
    this.projectPath = path.join(this.basePath, 'projects');
    this.customPath = path.join(this.basePath, 'custom');
    this.templatesPath = path.join(this.basePath, 'templates');
    
    // Project-specific storage
    this.currentProject = null;
    
    // MD file metadata
    this.metadata = new Map();
    
    // File naming conventions
    this.namingConventions = {
      project: (projectId, agentName) => `${projectId}-${agentName}.md`,
      custom: (agentName) => `custom-${agentName}.md`,
      template: (godName, type) => `template-${godName}-${type}.md`,
      timestamp: () => new Date().toISOString().replace(/[:.]/g, '-')
    };
  }

  /**
   * Initialize the persistence manager
   */
  async initialize() {
    this.emit('persistence:initializing');
    
    try {
      // Ensure directory structure exists
      await this.ensureDirectoryStructure();
      
      // Load existing metadata
      await this.loadMetadata();
      
      this.emit('persistence:initialized');
      
    } catch (error) {
      this.emit('persistence:error', { error });
      throw error;
    }
  }

  /**
   * Ensure all required directories exist
   */
  async ensureDirectoryStructure() {
    const dirs = [
      this.basePath,
      this.projectPath,
      this.customPath,
      this.templatesPath,
      path.join(this.projectPath, 'archive')
    ];
    
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Set current project context
   */
  setProject(projectId, projectName) {
    this.currentProject = {
      id: projectId,
      name: projectName,
      path: path.join(this.projectPath, projectId)
    };
    
    // Ensure project directory exists
    fs.mkdir(this.currentProject.path, { recursive: true });
    
    this.emit('persistence:project-set', { projectId, projectName });
  }

  /**
   * Save agent MD file
   * @param {Object} agentData - Agent configuration data
   * @param {Object} options - Save options
   * @returns {string} Path to saved file
   */
  async saveAgentMD(agentData, options = {}) {
    this.emit('persistence:saving', { agent: agentData.name });
    
    try {
      // Generate MD content
      const mdContent = await this.generateMDContent(agentData);
      
      // Determine save path
      const savePath = this.determineSavePath(agentData, options);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(savePath), { recursive: true });
      
      // Save file
      await fs.writeFile(savePath, mdContent, 'utf8');
      
      // Update metadata
      await this.updateMetadata(savePath, agentData, options);
      
      // Create symlink for easy access if project-specific
      if (options.createSymlink && this.currentProject) {
        await this.createSymlink(savePath, agentData.name);
      }
      
      this.emit('persistence:saved', { 
        agent: agentData.name, 
        path: savePath 
      });
      
      return savePath;
      
    } catch (error) {
      this.emit('persistence:save-error', { error, agent: agentData.name });
      throw error;
    }
  }

  /**
   * Load agent MD file
   * @param {string} agentName - Agent name or path
   * @param {Object} options - Load options
   * @returns {Object} Parsed agent data
   */
  async loadAgentMD(agentName, options = {}) {
    this.emit('persistence:loading', { agent: agentName });
    
    try {
      // Find agent file
      const agentPath = await this.findAgentFile(agentName, options);
      
      if (!agentPath) {
        throw new Error(`Agent MD file not found: ${agentName}`);
      }
      
      // Read file
      const content = await fs.readFile(agentPath, 'utf8');
      
      // Parse content
      const agentData = this.parseMDContent(content);
      
      // Add metadata
      agentData.metadata = {
        ...agentData.metadata,
        loadedFrom: agentPath,
        loadedAt: new Date().toISOString()
      };
      
      this.emit('persistence:loaded', { agent: agentName });
      
      return agentData;
      
    } catch (error) {
      this.emit('persistence:load-error', { error, agent: agentName });
      throw error;
    }
  }

  /**
   * Generate MD content from agent data
   */
  async generateMDContent(agentData) {
    const sections = [];
    
    // YAML frontmatter
    sections.push(this.generateFrontmatter(agentData));
    
    // Main content sections
    sections.push(`# ${agentData.displayName || agentData.name}\n`);
    
    if (agentData.description) {
      sections.push(`${agentData.description}\n`);
    }
    
    // Specialization
    if (agentData.specialization) {
      sections.push(this.generateSpecializationSection(agentData.specialization));
    }
    
    // Heritage (base agents)
    if (agentData.metadata?.baseAgents || agentData.baseAgents) {
      sections.push(this.generateHeritageSection(agentData));
    }
    
    // Capabilities
    if (agentData.capabilities && agentData.capabilities.length > 0) {
      sections.push(this.generateCapabilitiesSection(agentData.capabilities));
    }
    
    // Responsibilities
    if (agentData.responsibilities && agentData.responsibilities.length > 0) {
      sections.push(this.generateResponsibilitiesSection(agentData.responsibilities));
    }
    
    // Tools
    if (agentData.tools && agentData.tools.length > 0) {
      sections.push(this.generateToolsSection(agentData.tools));
    }
    
    // Guidelines
    if (agentData.guidelines && agentData.guidelines.length > 0) {
      sections.push(this.generateGuidelinesSection(agentData.guidelines));
    }
    
    // Patterns
    if (agentData.patterns && Object.keys(agentData.patterns).length > 0) {
      sections.push(this.generatePatternsSection(agentData.patterns));
    }
    
    // Hooks
    if (agentData.hooks && Object.keys(agentData.hooks).length > 0) {
      sections.push(this.generateHooksSection(agentData.hooks));
    }
    
    // Metadata footer
    sections.push(this.generateMetadataFooter(agentData));
    
    return sections.join('\n');
  }

  /**
   * Generate YAML frontmatter
   */
  generateFrontmatter(agentData) {
    const frontmatter = {
      name: agentData.name,
      type: agentData.type || 'custom',
      createdAt: new Date().toISOString(),
      createdBy: agentData.metadata?.createdBy || 'pantheon',
      version: '1.0.0'
    };
    
    if (agentData.baseAgents) {
      frontmatter.baseAgents = agentData.baseAgents.join(', ');
    }
    
    if (agentData.metadata?.compositionStrategy) {
      frontmatter.compositionStrategy = agentData.metadata.compositionStrategy;
    }
    
    if (agentData.specialization?.parentGod) {
      frontmatter.parentGod = agentData.specialization.parentGod;
    }
    
    const yamlLines = ['---'];
    Object.entries(frontmatter).forEach(([key, value]) => {
      yamlLines.push(`${key}: ${value}`);
    });
    yamlLines.push('---');
    
    return yamlLines.join('\n');
  }

  /**
   * Generate specialization section
   */
  generateSpecializationSection(specialization) {
    let section = '## Specialization\n\n';
    
    if (specialization.focus) {
      section += `**Focus**: ${specialization.focus}\n\n`;
    }
    
    if (specialization.architectureStyle) {
      section += `**Architecture Style**: ${specialization.architectureStyle}\n`;
    }
    
    if (specialization.codingStyle) {
      section += `**Coding Style**: ${specialization.codingStyle}\n`;
    }
    
    if (specialization.testingStrategy) {
      section += `**Testing Strategy**: ${specialization.testingStrategy}\n`;
    }
    
    if (specialization.orchestrationMode) {
      section += `**Orchestration Mode**: ${specialization.orchestrationMode}\n`;
    }
    
    return section;
  }

  /**
   * Generate heritage section
   */
  generateHeritageSection(agentData) {
    const baseAgents = agentData.metadata?.baseAgents || agentData.baseAgents || [];
    
    let section = '## Heritage\n\n';
    section += 'This agent inherits and combines capabilities from:\n\n';
    
    baseAgents.forEach(agent => {
      section += `- **${agent}**\n`;
    });
    
    if (agentData.metadata?.compositionStrategy) {
      section += `\nComposition Strategy: ${agentData.metadata.compositionStrategy}\n`;
    }
    
    return section;
  }

  /**
   * Generate other sections
   */
  generateCapabilitiesSection(capabilities) {
    let section = '## Core Capabilities\n\n';
    capabilities.forEach(cap => {
      section += `- ${cap}\n`;
    });
    return section;
  }

  generateResponsibilitiesSection(responsibilities) {
    let section = '## Responsibilities\n\n';
    responsibilities.forEach((resp, index) => {
      if (typeof resp === 'string') {
        section += `${index + 1}. ${resp}\n`;
      } else {
        section += `${index + 1}. **${resp.title}**: ${resp.description || ''}\n`;
      }
    });
    return section;
  }

  generateToolsSection(tools) {
    let section = '## Tools\n\n';
    section += `This agent has access to ${tools.length} specialized tools:\n\n`;
    
    // Group tools by category
    const grouped = this.groupToolsByCategory(tools);
    
    Object.entries(grouped).forEach(([category, categoryTools]) => {
      section += `### ${category}\n`;
      categoryTools.forEach(tool => {
        section += `- \`${tool}\`\n`;
      });
      section += '\n';
    });
    
    return section;
  }

  generateGuidelinesSection(guidelines) {
    let section = '## Guidelines\n\n';
    guidelines.forEach(guideline => {
      section += `- ${guideline}\n`;
    });
    return section;
  }

  generatePatternsSection(patterns) {
    let section = '## Patterns\n\n';
    Object.entries(patterns).forEach(([patternType, patternList]) => {
      section += `### ${patternType}\n`;
      if (Array.isArray(patternList)) {
        patternList.forEach(pattern => {
          section += `- ${pattern}\n`;
        });
      } else {
        section += `${patternList}\n`;
      }
      section += '\n';
    });
    return section;
  }

  generateHooksSection(hooks) {
    let section = '## Hooks\n\n';
    Object.entries(hooks).forEach(([event, handlers]) => {
      section += `### ${event}\n`;
      if (Array.isArray(handlers)) {
        handlers.forEach(handler => {
          section += `- ${handler}\n`;
        });
      } else {
        section += `${handlers}\n`;
      }
      section += '\n';
    });
    return section;
  }

  generateMetadataFooter(agentData) {
    let footer = '\n---\n\n';
    footer += `*Generated by Pantheon MD Persistence Manager*\n`;
    
    if (agentData.specialization?.projectContext?.projectIdea) {
      footer += `*Project: ${agentData.specialization.projectContext.projectIdea}*\n`;
    }
    
    return footer;
  }

  /**
   * Parse MD content back to agent data
   */
  parseMDContent(content) {
    // This is a simplified parser - in production, use a proper MD parser
    const agentData = {
      tools: [],
      capabilities: [],
      responsibilities: [],
      guidelines: [],
      patterns: {},
      hooks: {}
    };
    
    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      frontmatter.split('\n').forEach(line => {
        const [key, value] = line.split(': ');
        if (key && value) {
          agentData[key] = value;
        }
      });
    }
    
    // Extract sections (simplified)
    const sections = content.split(/\n## /);
    sections.forEach(section => {
      const lines = section.split('\n');
      const title = lines[0].toLowerCase();
      
      if (title.includes('capabilities')) {
        agentData.capabilities = lines.slice(1)
          .filter(l => l.startsWith('- '))
          .map(l => l.substring(2));
      } else if (title.includes('tools')) {
        // Extract tools from the section
        lines.forEach(line => {
          const toolMatch = line.match(/- `(.+)`/);
          if (toolMatch) {
            agentData.tools.push(toolMatch[1]);
          }
        });
      }
      // ... parse other sections
    });
    
    return agentData;
  }

  /**
   * Determine save path based on options
   */
  determineSavePath(agentData, options) {
    if (options.path) {
      return options.path;
    }
    
    if (options.projectSpecific && this.currentProject) {
      const filename = this.namingConventions.project(
        this.currentProject.id, 
        agentData.name
      );
      return path.join(this.currentProject.path, filename);
    }
    
    if (options.template && agentData.specialization?.parentGod) {
      const filename = this.namingConventions.template(
        agentData.specialization.parentGod,
        agentData.type
      );
      return path.join(this.templatesPath, filename);
    }
    
    // Default to custom
    const filename = this.namingConventions.custom(agentData.name);
    return path.join(this.customPath, filename);
  }

  /**
   * Find agent file by name
   */
  async findAgentFile(agentName, options = {}) {
    // Check exact path first
    if (path.isAbsolute(agentName)) {
      return agentName;
    }
    
    // Search in order of priority
    const searchPaths = [];
    
    // Current project
    if (this.currentProject && options.includeProject !== false) {
      searchPaths.push(path.join(
        this.currentProject.path, 
        this.namingConventions.project(this.currentProject.id, agentName)
      ));
    }
    
    // Custom agents
    searchPaths.push(path.join(
      this.customPath,
      this.namingConventions.custom(agentName)
    ));
    
    // Base agents
    searchPaths.push(path.join(this.basePath, `${agentName}.md`));
    
    // Search all paths
    for (const searchPath of searchPaths) {
      try {
        await fs.access(searchPath);
        return searchPath;
      } catch (error) {
        // Continue searching
      }
    }
    
    return null;
  }

  /**
   * Update metadata index
   */
  async updateMetadata(filePath, agentData, options) {
    const metadata = {
      name: agentData.name,
      type: agentData.type,
      path: filePath,
      createdAt: new Date().toISOString(),
      project: this.currentProject?.id,
      baseAgents: agentData.baseAgents || [],
      tools: agentData.tools?.length || 0,
      capabilities: agentData.capabilities?.length || 0
    };
    
    this.metadata.set(agentData.name, metadata);
    
    // Persist metadata
    await this.saveMetadata();
  }

  /**
   * Create symlink for easy access
   */
  async createSymlink(targetPath, agentName) {
    const linkPath = path.join(this.basePath, 'current', `${agentName}.md`);
    
    try {
      await fs.mkdir(path.dirname(linkPath), { recursive: true });
      await fs.unlink(linkPath).catch(() => {}); // Remove if exists
      await fs.symlink(targetPath, linkPath);
    } catch (error) {
      console.warn(`Could not create symlink for ${agentName}:`, error.message);
    }
  }

  /**
   * Group tools by category
   */
  groupToolsByCategory(tools) {
    const categories = {
      'Orchestration': ['task_orchestrate', 'agent_spawn', 'swarm_init', 'swarm_monitor'],
      'Code Generation': ['code_generate', 'api_generate', 'test_generate', 'ui_generate'],
      'Analysis': ['code_analyze', 'pattern_extract', 'dependency_analyzer'],
      'Data Management': ['memory_store', 'database_query', 'schema_designer'],
      'Communication': ['websocket_manager', 'message_router', 'event_stream'],
      'Security': ['auth_manager', 'security_scan', 'encryption_handler'],
      'Other': []
    };
    
    const grouped = {};
    
    tools.forEach(tool => {
      let categorized = false;
      for (const [category, categoryTools] of Object.entries(categories)) {
        if (categoryTools.includes(tool)) {
          if (!grouped[category]) grouped[category] = [];
          grouped[category].push(tool);
          categorized = true;
          break;
        }
      }
      if (!categorized) {
        if (!grouped['Other']) grouped['Other'] = [];
        grouped['Other'].push(tool);
      }
    });
    
    return grouped;
  }

  /**
   * Save metadata index
   */
  async saveMetadata() {
    const metadataPath = path.join(this.basePath, '.metadata.json');
    const data = Object.fromEntries(this.metadata);
    await fs.writeFile(metadataPath, JSON.stringify(data, null, 2));
  }

  /**
   * Load metadata index
   */
  async loadMetadata() {
    const metadataPath = path.join(this.basePath, '.metadata.json');
    try {
      const data = await fs.readFile(metadataPath, 'utf8');
      const parsed = JSON.parse(data);
      this.metadata = new Map(Object.entries(parsed));
    } catch (error) {
      // No metadata file yet
      this.metadata = new Map();
    }
  }

  /**
   * List all agents
   */
  async listAgents(options = {}) {
    const agents = [];
    
    if (options.includeProject && this.currentProject) {
      const projectAgents = await this.listProjectAgents();
      agents.push(...projectAgents);
    }
    
    if (options.includeCustom !== false) {
      const customAgents = await this.listCustomAgents();
      agents.push(...customAgents);
    }
    
    return agents;
  }

  /**
   * List project-specific agents
   */
  async listProjectAgents() {
    if (!this.currentProject) return [];
    
    try {
      const files = await fs.readdir(this.currentProject.path);
      return files
        .filter(f => f.endsWith('.md'))
        .map(f => ({
          name: f.replace('.md', '').replace(`${this.currentProject.id}-`, ''),
          path: path.join(this.currentProject.path, f),
          type: 'project'
        }));
    } catch (error) {
      return [];
    }
  }

  /**
   * List custom agents
   */
  async listCustomAgents() {
    try {
      const files = await fs.readdir(this.customPath);
      return files
        .filter(f => f.endsWith('.md'))
        .map(f => ({
          name: f.replace('.md', '').replace('custom-', ''),
          path: path.join(this.customPath, f),
          type: 'custom'
        }));
    } catch (error) {
      return [];
    }
  }
}

export default MDPersistenceManager;