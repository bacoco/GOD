import { EventEmitter } from 'events';

/**
 * AgentMDGenerator - Generates MD content for dynamic agents
 * Creates well-structured markdown files that work with Claude-Flow
 */
export class AgentMDGenerator extends EventEmitter {
  constructor() {
    super();
    
    // Template sections for different agent types
    this.sectionTemplates = {
      header: this.generateHeader.bind(this),
      introduction: this.generateIntroduction.bind(this),
      heritage: this.generateHeritage.bind(this),
      responsibilities: this.generateResponsibilities.bind(this),
      guidelines: this.generateGuidelines.bind(this),
      tools: this.generateTools.bind(this),
      patterns: this.generatePatterns.bind(this),
      examples: this.generateExamples.bind(this),
      hooks: this.generateHooks.bind(this),
      metadata: this.generateMetadata.bind(this)
    };
    
    // Agent type specific templates
    this.typeTemplates = new Map();
    this.initializeTypeTemplates();
  }

  /**
   * Initialize templates for common agent types
   */
  initializeTypeTemplates() {
    // Developer template
    this.typeTemplates.set('developer', {
      sections: ['header', 'introduction', 'heritage', 'responsibilities', 'guidelines', 'patterns', 'examples'],
      emphasis: 'implementation',
      tone: 'technical'
    });
    
    // Coordinator template
    this.typeTemplates.set('coordinator', {
      sections: ['header', 'introduction', 'heritage', 'responsibilities', 'guidelines', 'tools', 'hooks'],
      emphasis: 'orchestration',
      tone: 'strategic'
    });
    
    // Analyst template
    this.typeTemplates.set('analyst', {
      sections: ['header', 'introduction', 'heritage', 'responsibilities', 'guidelines', 'patterns'],
      emphasis: 'analysis',
      tone: 'analytical'
    });
    
    // Hybrid template
    this.typeTemplates.set('hybrid', {
      sections: ['header', 'introduction', 'heritage', 'responsibilities', 'guidelines', 'tools', 'patterns', 'examples'],
      emphasis: 'versatility',
      tone: 'adaptive'
    });
  }

  /**
   * Generate complete agent MD
   */
  async generateAgentMD(spec) {
    const startTime = Date.now();
    
    try {
      // Determine template type
      const templateType = spec.type || 'hybrid';
      const template = this.typeTemplates.get(templateType) || this.typeTemplates.get('hybrid');
      
      // Generate sections
      const sections = [];
      
      for (const sectionName of template.sections) {
        const sectionGenerator = this.sectionTemplates[sectionName];
        if (sectionGenerator) {
          const content = await sectionGenerator(spec, template);
          if (content) {
            sections.push(content);
          }
        }
      }
      
      // Join sections with proper spacing
      const markdown = sections.join('\n\n');
      
      this.emit('md:generated', {
        agent: spec.name,
        type: templateType,
        length: markdown.length,
        duration: Date.now() - startTime
      });
      
      return markdown;
      
    } catch (error) {
      this.emit('md:generation-failed', { agent: spec.name, error });
      throw error;
    }
  }

  /**
   * Generate YAML header
   */
  generateHeader(spec) {
    const header = {
      name: spec.name,
      type: spec.type || 'custom',
      description: spec.description || `Custom ${spec.type || 'agent'} with specialized capabilities`,
      tools: spec.tools || [],
      createdBy: spec.createdBy || spec.specialization?.parentGod || 'system',
      createdAt: spec.createdAt || new Date().toISOString()
    };
    
    // Add optional fields
    if (spec.baseAgent) {
      header.baseAgent = spec.baseAgent;
    }
    
    if (spec.baseAgents) {
      header.baseAgents = spec.baseAgents;
    }
    
    if (spec.capabilities && spec.capabilities.length > 0) {
      header.capabilities = spec.capabilities;
    }
    
    if (spec.specialization?.orchestrationMode) {
      header.orchestrationMode = spec.specialization.orchestrationMode;
    }
    
    if (spec.specialization?.allowedGods) {
      header.allowedGods = spec.specialization.allowedGods;
    }
    
    // Format as YAML
    const yamlLines = ['---'];
    Object.entries(header).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        yamlLines.push(`${key}: ${value.join(', ')}`);
      } else {
        yamlLines.push(`${key}: ${value}`);
      }
    });
    yamlLines.push('---');
    
    return yamlLines.join('\n');
  }

  /**
   * Generate introduction section
   */
  generateIntroduction(spec, template) {
    const name = spec.displayName || spec.name;
    const emphasis = spec.emphasis || template.emphasis;
    
    let intro = `# ${name}\n\n`;
    
    if (spec.description) {
      intro += `${spec.description}\n\n`;
    } else {
      intro += `I am ${name}, a specialized agent focused on ${emphasis}.\n\n`;
    }
    
    // Add specialization note
    if (spec.specialization?.focus) {
      intro += `## Specialization\n${spec.specialization.focus}\n`;
    }
    
    // Add personality if defined
    if (spec.specialization?.personality) {
      intro += `\n## Approach\n`;
      const personality = spec.specialization.personality;
      
      if (personality.traits) {
        intro += `My core traits: ${personality.traits.join(', ')}\n`;
      }
      
      if (personality.approach) {
        intro += `I approach tasks with a ${personality.approach} mindset.\n`;
      }
    }
    
    return intro;
  }

  /**
   * Generate heritage section
   */
  generateHeritage(spec) {
    if (!spec.baseAgent && !spec.baseAgents) {
      return null;
    }
    
    let heritage = '## Heritage\n\n';
    
    if (spec.baseAgent) {
      heritage += `This agent inherits core capabilities from **${spec.baseAgent}**.\n\n`;
    } else if (spec.baseAgents && spec.baseAgents.length > 0) {
      heritage += 'This agent combines capabilities from multiple sources:\n';
      spec.baseAgents.forEach(agent => {
        heritage += `- **${agent}**\n`;
      });
      heritage += '\n';
    }
    
    if (spec.specialization?.mergeStrategy) {
      heritage += `Merge strategy: ${spec.specialization.mergeStrategy}\n`;
    }
    
    if (spec.specialization?.inheritedFrom) {
      heritage += `\n### Inherited Strengths\n`;
      spec.specialization.inheritedFrom.forEach(agent => {
        heritage += `- From ${agent}: Core competencies and patterns\n`;
      });
    }
    
    return heritage;
  }

  /**
   * Generate responsibilities section
   */
  generateResponsibilities(spec) {
    let responsibilities = '## Core Responsibilities\n\n';
    
    // Use provided responsibilities or generate from capabilities
    if (spec.responsibilities && spec.responsibilities.length > 0) {
      spec.responsibilities.forEach((resp, index) => {
        responsibilities += `${index + 1}. **${resp.title || resp}**`;
        if (resp.description) {
          responsibilities += `: ${resp.description}`;
        }
        responsibilities += '\n';
      });
    } else if (spec.capabilities && spec.capabilities.length > 0) {
      // Generate from capabilities
      const capabilityMap = {
        'code': 'Write clean, efficient, and maintainable code',
        'implement': 'Implement features according to specifications',
        'test': 'Create comprehensive test suites',
        'analyze': 'Perform thorough analysis and provide insights',
        'design': 'Design scalable and maintainable architectures',
        'review': 'Review code and provide constructive feedback',
        'coordinate': 'Coordinate multiple agents and tasks',
        'optimize': 'Optimize performance and resource usage'
      };
      
      spec.capabilities.forEach((cap, index) => {
        const description = capabilityMap[cap] || `Excel at ${cap}`;
        responsibilities += `${index + 1}. **${this.capitalize(cap)}**: ${description}\n`;
      });
    } else {
      // Default responsibilities
      responsibilities += '1. **Execute Tasks**: Complete assigned tasks efficiently\n';
      responsibilities += '2. **Collaborate**: Work effectively with other agents\n';
      responsibilities += '3. **Adapt**: Adjust approach based on requirements\n';
    }
    
    // Add specialization-specific responsibilities
    if (spec.specialization?.expertise) {
      responsibilities += '\n### Specialized Expertise\n';
      spec.specialization.expertise.forEach(exp => {
        responsibilities += `- ${exp}\n`;
      });
    }
    
    return responsibilities;
  }

  /**
   * Generate implementation guidelines
   */
  generateGuidelines(spec) {
    let guidelines = '## Implementation Guidelines\n\n';
    
    // Add custom guidelines if provided
    if (spec.guidelines) {
      if (Array.isArray(spec.guidelines)) {
        spec.guidelines.forEach(guideline => {
          guidelines += `- ${guideline}\n`;
        });
      } else {
        guidelines += spec.guidelines + '\n';
      }
      guidelines += '\n';
    }
    
    // Add type-specific guidelines
    const typeGuidelines = {
      'developer': [
        'Follow established coding standards and best practices',
        'Write self-documenting code with clear naming',
        'Include appropriate error handling and logging',
        'Consider performance implications of implementations'
      ],
      'coordinator': [
        'Break complex tasks into manageable subtasks',
        'Assign tasks based on agent capabilities',
        'Monitor progress and adjust plans as needed',
        'Ensure clear communication between agents'
      ],
      'analyst': [
        'Gather comprehensive data before drawing conclusions',
        'Consider multiple perspectives and edge cases',
        'Present findings in a clear and actionable format',
        'Validate assumptions with evidence'
      ]
    };
    
    const applicableGuidelines = typeGuidelines[spec.type] || typeGuidelines['developer'];
    
    guidelines += '### General Principles\n';
    applicableGuidelines.forEach(guideline => {
      guidelines += `- ${guideline}\n`;
    });
    
    // Add constraints if any
    if (spec.specialization?.constraints) {
      guidelines += '\n### Constraints\n';
      Object.entries(spec.specialization.constraints).forEach(([key, value]) => {
        guidelines += `- **${this.capitalize(key)}**: ${value}\n`;
      });
    }
    
    return guidelines;
  }

  /**
   * Generate tools section
   */
  generateTools(spec) {
    if (!spec.tools || spec.tools.length === 0) {
      return null;
    }
    
    let tools = '## Available Tools\n\n';
    
    // Group tools by category
    const toolCategories = {
      'Task': 'Orchestration',
      'TodoWrite': 'Task Management',
      'Memory': 'State Management',
      'github': 'Version Control',
      'desktop-commander': 'System Operations',
      'browsermcp': 'Web Interaction'
    };
    
    const categorized = new Map();
    
    spec.tools.forEach(tool => {
      const category = toolCategories[tool] || 'Specialized';
      if (!categorized.has(category)) {
        categorized.set(category, []);
      }
      categorized.get(category).push(tool);
    });
    
    categorized.forEach((toolList, category) => {
      tools += `### ${category}\n`;
      toolList.forEach(tool => {
        tools += `- \`${tool}\``;
        if (tool === 'Task' && spec.specialization?.allowedGods) {
          tools += ` (can create: ${spec.specialization.allowedGods.join(', ')})`;
        }
        tools += '\n';
      });
      tools += '\n';
    });
    
    return tools.trim();
  }

  /**
   * Generate patterns section
   */
  generatePatterns(spec) {
    if (!spec.patterns && !spec.specialization?.patterns) {
      return null;
    }
    
    let patterns = '## Common Patterns\n\n';
    
    // Add custom patterns
    if (spec.patterns) {
      spec.patterns.forEach(pattern => {
        patterns += `### ${pattern.name}\n`;
        patterns += '```' + (pattern.language || '') + '\n';
        patterns += pattern.code + '\n';
        patterns += '```\n\n';
        if (pattern.description) {
          patterns += pattern.description + '\n\n';
        }
      });
    }
    
    // Add domain-specific patterns
    if (spec.specialization?.focus) {
      patterns += `### Domain-Specific Patterns\n`;
      patterns += `Apply established patterns and best practices for ${spec.specialization.focus}.\n`;
    }
    
    return patterns;
  }

  /**
   * Generate examples section
   */
  generateExamples(spec) {
    if (!spec.examples && !spec.capabilities) {
      return null;
    }
    
    let examples = '## Example Usage\n\n';
    
    if (spec.examples) {
      spec.examples.forEach((example, index) => {
        examples += `### Example ${index + 1}: ${example.title || 'Usage'}\n`;
        if (example.scenario) {
          examples += `**Scenario**: ${example.scenario}\n\n`;
        }
        if (example.approach) {
          examples += `**Approach**:\n${example.approach}\n\n`;
        }
        if (example.code) {
          examples += '```' + (example.language || '') + '\n';
          examples += example.code + '\n';
          examples += '```\n\n';
        }
      });
    } else {
      // Generate basic example based on capabilities
      examples += `### Task Execution\n`;
      examples += `When given a task related to my capabilities (${spec.capabilities.slice(0, 3).join(', ')}), `;
      examples += `I will apply my specialized knowledge and tools to deliver optimal results.\n`;
    }
    
    return examples;
  }

  /**
   * Generate hooks section
   */
  generateHooks(spec) {
    if (!spec.hooks) {
      return null;
    }
    
    let hooks = '## Execution Hooks\n\n';
    
    if (spec.hooks.pre) {
      hooks += '### Pre-execution\n';
      hooks += '```bash\n';
      hooks += spec.hooks.pre + '\n';
      hooks += '```\n\n';
    }
    
    if (spec.hooks.post) {
      hooks += '### Post-execution\n';
      hooks += '```bash\n';
      hooks += spec.hooks.post + '\n';
      hooks += '```\n\n';
    }
    
    return hooks;
  }

  /**
   * Generate metadata section
   */
  generateMetadata(spec) {
    let metadata = '## Metadata\n\n';
    
    metadata += '```yaml\n';
    metadata += `created: ${spec.createdAt || new Date().toISOString()}\n`;
    metadata += `version: ${spec.version || '1.0.0'}\n`;
    
    if (spec.createdBy) {
      metadata += `creator: ${spec.createdBy}\n`;
    }
    
    if (spec.executionEngine) {
      metadata += `engine: ${spec.executionEngine}\n`;
    }
    
    if (spec.contextIsolation !== undefined) {
      metadata += `isolated: ${spec.contextIsolation}\n`;
    }
    
    metadata += '```\n';
    
    return metadata;
  }

  /**
   * Capitalize string
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Generate minimal MD for simple agents
   */
  async generateMinimalMD(name, instructions, tools = []) {
    return `---
name: ${name}
type: minimal
tools: ${tools.join(', ')}
---

# ${name}

${instructions}

## Execution
This agent runs through Claude-Flow with standard context isolation.
`;
  }

  /**
   * Validate generated MD
   */
  validateMD(markdown) {
    const issues = [];
    
    // Check for required sections
    if (!markdown.includes('---')) {
      issues.push('Missing YAML frontmatter');
    }
    
    if (!markdown.includes('#')) {
      issues.push('Missing headers');
    }
    
    // Check length
    if (markdown.length < 100) {
      issues.push('Content too short');
    }
    
    if (markdown.length > 50000) {
      issues.push('Content too long');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}

export default AgentMDGenerator;