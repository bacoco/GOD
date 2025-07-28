import BaseGod from '../base-god.js';
import { ToolAccessManager } from '../tool-access-manager.js';

/**
 * Vulcan - The Divine Tool Broker
 * Helps gods discover and access MCP tools through conversation
 */
export default class Vulcan extends BaseGod {
  constructor(options) {
    super(options);
    
    this.title = 'Divine Tool Broker';
    this.toolKnowledge = new Map();
    this.accessManager = new ToolAccessManager(this);
    this.recommendations = new Map();
    
    // Vulcan-specific settings
    this.conversationalStyle = {
      personality: {
        traits: ['helpful', 'knowledgeable', 'practical', 'educational'],
        approach: 'consultative',
        tone: 'professional yet friendly'
      },
      teaching: {
        style: 'example-driven',
        depth: 'contextual'
      }
    };
  }

  async onInitialize() {
    await super.onInitialize();
    
    // Initialize tool knowledge base
    await this.loadToolKnowledge();
    
    // Set up conversational patterns
    this.setupConversationalPatterns();
    
    this.emit('vulcan:ready', {
      totalTools: this.toolKnowledge.size,
      accessManager: 'initialized'
    });
  }

  /**
   * Load knowledge about all MCP tools
   */
  async loadToolKnowledge() {
    // Categories of MCP tools from Claude Flow
    const toolCategories = {
      swarm: {
        tools: ['swarm_init', 'swarm_status', 'swarm_destroy', 'swarm_monitor', 'swarm_scale'],
        description: 'Agent swarm coordination and management',
        useCases: ['distributed systems', 'parallel processing', 'agent orchestration']
      },
      neural: {
        tools: ['neural_train', 'neural_predict', 'neural_status', 'neural_patterns', 'neural_compress'],
        description: 'AI and neural network operations',
        useCases: ['machine learning', 'pattern recognition', 'AI optimization']
      },
      performance: {
        tools: ['performance_report', 'bottleneck_analyze', 'token_usage', 'benchmark_run', 'metrics_collect'],
        description: 'Performance monitoring and optimization',
        useCases: ['optimization', 'debugging', 'monitoring']
      },
      github: {
        tools: ['github_repo_analyze', 'github_pr_manage', 'github_code_review', 'github_metrics'],
        description: 'GitHub integration and automation',
        useCases: ['code review', 'repository management', 'CI/CD']
      },
      memory: {
        tools: ['memory_usage', 'memory_search', 'memory_persist', 'memory_backup'],
        description: 'Persistent memory and state management',
        useCases: ['data persistence', 'context preservation', 'knowledge management']
      },
      workflow: {
        tools: ['workflow_create', 'workflow_execute', 'task_orchestrate', 'parallel_execute'],
        description: 'Workflow automation and task management',
        useCases: ['automation', 'pipeline creation', 'task coordination']
      }
    };
    
    // Store tool knowledge
    for (const [category, info] of Object.entries(toolCategories)) {
      for (const tool of info.tools) {
        this.toolKnowledge.set(tool, {
          category,
          description: info.description,
          useCases: info.useCases
        });
      }
    }
  }

  /**
   * Set up conversational patterns for tool requests
   */
  setupConversationalPatterns() {
    this.conversationPatterns = {
      toolRequest: [
        /need.*(tool|help|assist)/i,
        /looking for.*(tool|capability|function)/i,
        /how (can|do) I/i,
        /want to.*(analyze|test|build|optimize)/i
      ],
      toolEducation: [
        /what (is|does|can)/i,
        /explain.*(tool|function)/i,
        /difference between/i,
        /how does.*(work|function)/i
      ],
      accessRequest: [
        /grant.*(access|permission)/i,
        /need access to/i,
        /can I (use|have)/i,
        /give me.*(tool|access)/i
      ]
    };
  }

  /**
   * Handle messages from other gods
   */
  async handleMessage(message) {
    const { from, content, metadata } = message;
    
    // Analyze the message intent
    const intent = this.analyzeIntent(content);
    
    switch (intent.type) {
      case 'tool-request':
        return await this.handleToolRequest(from, intent);
        
      case 'tool-education':
        return await this.handleToolEducation(from, intent);
        
      case 'access-request':
        return await this.handleAccessRequest(from, intent);
        
      case 'usage-help':
        return await this.handleUsageHelp(from, intent);
        
      default:
        return await this.handleGeneralInquiry(from, content);
    }
  }

  /**
   * Analyze message intent
   */
  analyzeIntent(content) {
    // Check for tool request patterns
    for (const pattern of this.conversationPatterns.toolRequest) {
      if (pattern.test(content)) {
        return {
          type: 'tool-request',
          content,
          context: this.extractContext(content)
        };
      }
    }
    
    // Check for education patterns
    for (const pattern of this.conversationPatterns.toolEducation) {
      if (pattern.test(content)) {
        return {
          type: 'tool-education',
          content,
          tools: this.extractToolNames(content)
        };
      }
    }
    
    // Check for access patterns
    for (const pattern of this.conversationPatterns.accessRequest) {
      if (pattern.test(content)) {
        return {
          type: 'access-request',
          content,
          tools: this.extractToolNames(content)
        };
      }
    }
    
    return { type: 'general', content };
  }

  /**
   * Handle tool discovery requests
   */
  async handleToolRequest(fromGod, intent) {
    const context = intent.context;
    const recommendations = await this.recommendTools(context);
    
    // Format recommendations
    const response = {
      type: 'tool-recommendation',
      recommendations: recommendations.map(tool => ({
        name: tool.name,
        description: tool.description,
        useCases: tool.useCases,
        examples: this.getToolExamples(tool.name)
      })),
      message: this.formatRecommendationMessage(recommendations, context)
    };
    
    // Store recommendations for follow-up
    this.recommendations.set(fromGod, recommendations);
    
    await this.sendMessage(fromGod, response);
    return response;
  }

  /**
   * Handle tool education requests
   */
  async handleToolEducation(fromGod, intent) {
    const tools = intent.tools;
    const explanations = tools.map(tool => this.explainTool(tool));
    
    const response = {
      type: 'tool-education',
      explanations,
      message: this.formatEducationMessage(explanations)
    };
    
    await this.sendMessage(fromGod, response);
    return response;
  }

  /**
   * Handle access grant requests
   */
  async handleAccessRequest(fromGod, intent) {
    const tools = intent.tools || this.recommendations.get(fromGod);
    
    if (!tools || tools.length === 0) {
      return await this.sendMessage(fromGod, {
        type: 'clarification-needed',
        message: "I need to know which tools you'd like access to. What are you trying to accomplish?"
      });
    }
    
    // Grant access through the access manager
    const grants = await this.accessManager.grantToolAccess(fromGod, tools, {
      duration: '7d', // Default 7-day access
      reason: intent.content
    });
    
    const response = {
      type: 'access-granted',
      grants,
      message: this.formatAccessGrantMessage(grants)
    };
    
    await this.sendMessage(fromGod, response);
    return response;
  }

  /**
   * Recommend tools based on context
   */
  async recommendTools(context) {
    const recommendations = [];
    
    // Analyze context for keywords and patterns
    const keywords = this.extractKeywords(context);
    
    // Match tools based on use cases and descriptions
    for (const [tool, info] of this.toolKnowledge.entries()) {
      const relevance = this.calculateRelevance(keywords, info);
      if (relevance > 0.5) {
        recommendations.push({
          name: tool,
          relevance,
          ...info
        });
      }
    }
    
    // Sort by relevance and return top recommendations
    return recommendations
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);
  }

  /**
   * Calculate tool relevance to context
   */
  calculateRelevance(keywords, toolInfo) {
    let score = 0;
    const { description, useCases, category } = toolInfo;
    
    // Check description match
    for (const keyword of keywords) {
      if (description.toLowerCase().includes(keyword)) {
        score += 0.3;
      }
    }
    
    // Check use case match
    for (const useCase of useCases) {
      for (const keyword of keywords) {
        if (useCase.toLowerCase().includes(keyword)) {
          score += 0.4;
        }
      }
    }
    
    // Category bonus
    if (keywords.includes(category)) {
      score += 0.3;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Extract keywords from context
   */
  extractKeywords(context) {
    const stopWords = ['i', 'want', 'need', 'to', 'the', 'a', 'an', 'and', 'or', 'but'];
    return context.toLowerCase()
      .split(/\s+/)
      .filter(word => !stopWords.includes(word) && word.length > 2);
  }

  /**
   * Extract tool names from content
   */
  extractToolNames(content) {
    const tools = [];
    for (const tool of this.toolKnowledge.keys()) {
      if (content.toLowerCase().includes(tool.toLowerCase())) {
        tools.push(tool);
      }
    }
    return tools;
  }

  /**
   * Format recommendation message
   */
  formatRecommendationMessage(recommendations, context) {
    let message = `Based on your need to "${context}", I recommend these tools:\n\n`;
    
    recommendations.forEach((tool, index) => {
      message += `${index + 1}. **${tool.name}** - ${tool.description}\n`;
      message += `   Use for: ${tool.useCases.join(', ')}\n\n`;
    });
    
    message += "\nWould you like me to grant you access to any of these tools? ";
    message += "I can provide temporary (7-day) or permanent access based on your needs.";
    
    return message;
  }

  /**
   * Get examples for a specific tool
   */
  getToolExamples(toolName) {
    const examples = {
      'swarm_init': 'claude-flow mcp swarm-init --topology mesh --max-agents 6',
      'neural_train': 'claude-flow mcp neural-train --pattern-type coordination --epochs 100',
      'performance_report': 'claude-flow mcp performance-report --format detailed --timeframe 7d',
      'github_pr_manage': 'claude-flow mcp github-pr-manage --repo "myorg/project" --action review'
    };
    
    return examples[toolName] || `claude-flow mcp ${toolName} --help`;
  }

  /**
   * Explain a specific tool
   */
  explainTool(toolName) {
    const info = this.toolKnowledge.get(toolName);
    if (!info) {
      return {
        tool: toolName,
        explanation: "I don't have information about this tool. It might be a new addition."
      };
    }
    
    return {
      tool: toolName,
      category: info.category,
      explanation: info.description,
      useCases: info.useCases,
      example: this.getToolExamples(toolName)
    };
  }

  /**
   * Format education message
   */
  formatEducationMessage(explanations) {
    let message = "Here's what you need to know about these tools:\n\n";
    
    explanations.forEach(exp => {
      message += `**${exp.tool}** (${exp.category})\n`;
      message += `${exp.explanation}\n`;
      message += `Best for: ${exp.useCases.join(', ')}\n`;
      message += `Example: \`${exp.example}\`\n\n`;
    });
    
    return message;
  }

  /**
   * Format access grant message
   */
  formatAccessGrantMessage(grants) {
    let message = "✅ Access granted! You now have access to:\n\n";
    
    grants.forEach(grant => {
      message += `- **${grant.tool}** (${grant.duration})\n`;
    });
    
    message += "\nThese tools are now available for your use. ";
    message += "Need help using them? Just ask!";
    
    return message;
  }

  /**
   * Get available commands
   */
  getCommands() {
    return {
      'discover-tools': 'Help find the right tools for a task',
      'explain-tool': 'Explain what a specific tool does',
      'grant-access': 'Grant tool access to requesting god',
      'list-recommendations': 'Show previous tool recommendations',
      'tool-tutorial': 'Provide detailed tutorial for a tool',
      'access-status': 'Check current tool access for a god',
      'revoke-access': 'Revoke tool access when no longer needed'
    };
  }

  /**
   * Get Vulcan's personality for conversations
   */
  getPersonality() {
    return {
      name: 'Vulcan',
      title: 'Divine Tool Broker',
      greeting: "Greetings! I'm Vulcan, your guide to Claude Flow's extensive tool collection. How can I help you find the right tools?",
      expertise: ['MCP tools', 'tool discovery', 'access management', 'tool education'],
      approach: 'I believe in providing the right tool at the right time, with the knowledge to use it effectively.'
    };
  }
}