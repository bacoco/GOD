/**
 * Tool Allocator
 * Maps the 87 MCP tools to project requirements
 * Intelligently allocates tools based on features and agent capabilities
 */

import { EventEmitter } from 'events';

export class ToolAllocator extends EventEmitter {
  constructor() {
    super();
    
    // Complete catalog of 87 MCP tools organized by category
    this.toolCatalog = {
      // Swarm Coordination Tools (12 tools)
      swarmCoordination: {
        'swarm_init': { description: 'Initialize swarm topology', category: 'coordination' },
        'swarm_status': { description: 'Monitor swarm health', category: 'monitoring' },
        'swarm_destroy': { description: 'Graceful swarm shutdown', category: 'lifecycle' },
        'swarm_monitor': { description: 'Real-time swarm monitoring', category: 'monitoring' },
        'swarm_scale': { description: 'Auto-scale agent count', category: 'scaling' },
        'agent_spawn': { description: 'Create specialized agents', category: 'lifecycle' },
        'agent_list': { description: 'List active agents', category: 'monitoring' },
        'agent_metrics': { description: 'Agent performance metrics', category: 'monitoring' },
        'task_orchestrate': { description: 'Orchestrate complex workflows', category: 'orchestration' },
        'task_status': { description: 'Check task execution status', category: 'monitoring' },
        'task_results': { description: 'Get task completion results', category: 'data' },
        'consensus_build': { description: 'Build consensus among agents', category: 'coordination' }
      },
      
      // Neural Network & AI Tools (10 tools)
      neuralAI: {
        'neural_status': { description: 'Check neural network status', category: 'monitoring' },
        'neural_train': { description: 'Train neural patterns', category: 'ml' },
        'neural_predict': { description: 'Make AI predictions', category: 'ml' },
        'neural_patterns': { description: 'Analyze cognitive patterns', category: 'analysis' },
        'neural_compress': { description: 'Compress neural models', category: 'optimization' },
        'ml_model_load': { description: 'Load ML models', category: 'ml' },
        'ml_train': { description: 'Train machine learning models', category: 'ml' },
        'ml_predict': { description: 'Make ML predictions', category: 'ml' },
        'pattern_extract': { description: 'Extract patterns from data', category: 'analysis' },
        'model_optimize': { description: 'Optimize ML models', category: 'optimization' }
      },
      
      // Memory & Persistence Tools (8 tools)
      memoryPersistence: {
        'memory_store': { description: 'Store data in memory', category: 'storage' },
        'memory_retrieve': { description: 'Retrieve data from memory', category: 'retrieval' },
        'memory_search': { description: 'Search memory contents', category: 'search' },
        'memory_update': { description: 'Update memory entries', category: 'storage' },
        'memory_delete': { description: 'Delete memory entries', category: 'management' },
        'memory_analyze': { description: 'Analyze memory patterns', category: 'analysis' },
        'cache_set': { description: 'Set cache values', category: 'caching' },
        'cache_get': { description: 'Get cache values', category: 'caching' }
      },
      
      // Code Generation & Analysis Tools (12 tools)
      codeGeneration: {
        'code_generate': { description: 'Generate code from specs', category: 'generation' },
        'code_analyze': { description: 'Analyze code quality', category: 'analysis' },
        'code_review': { description: 'Automated code review', category: 'quality' },
        'code_refactor': { description: 'Refactor code patterns', category: 'optimization' },
        'api_generate': { description: 'Generate API endpoints', category: 'generation' },
        'api_document': { description: 'Generate API documentation', category: 'documentation' },
        'test_generate': { description: 'Generate test suites', category: 'testing' },
        'test_execute': { description: 'Execute test suites', category: 'testing' },
        'debug_code': { description: 'Debug code issues', category: 'debugging' },
        'performance_profile': { description: 'Profile code performance', category: 'optimization' },
        'security_scan': { description: 'Scan for security issues', category: 'security' },
        'coverage_analyze': { description: 'Analyze test coverage', category: 'testing' }
      },
      
      // UI/UX Generation Tools (8 tools)
      uiGeneration: {
        'ui_generate': { description: 'Generate UI components', category: 'generation' },
        'component_create': { description: 'Create reusable components', category: 'generation' },
        'style_system': { description: 'Generate style systems', category: 'styling' },
        'layout_designer': { description: 'Design responsive layouts', category: 'design' },
        'theme_generator': { description: 'Generate UI themes', category: 'styling' },
        'color_palette': { description: 'Generate color palettes', category: 'design' },
        'interaction_handler': { description: 'Handle user interactions', category: 'interaction' },
        'accessibility_check': { description: 'Check accessibility', category: 'quality' }
      },
      
      // Database & Schema Tools (8 tools)
      databaseTools: {
        'schema_designer': { description: 'Design database schemas', category: 'design' },
        'database_query': { description: 'Execute database queries', category: 'operations' },
        'migration_generate': { description: 'Generate DB migrations', category: 'management' },
        'index_optimizer': { description: 'Optimize DB indexes', category: 'optimization' },
        'query_optimizer': { description: 'Optimize SQL queries', category: 'optimization' },
        'data_seeder': { description: 'Seed test data', category: 'testing' },
        'backup_manager': { description: 'Manage DB backups', category: 'management' },
        'connection_pool': { description: 'Manage DB connections', category: 'performance' }
      },
      
      // Real-time & Communication Tools (9 tools)
      realtimeTools: {
        'websocket_manager': { description: 'Manage WebSocket connections', category: 'realtime' },
        'event_stream': { description: 'Handle event streams', category: 'events' },
        'message_router': { description: 'Route messages', category: 'messaging' },
        'pubsub_coordinator': { description: 'Coordinate pub/sub', category: 'messaging' },
        'presence_tracker': { description: 'Track user presence', category: 'realtime' },
        'notification_sender': { description: 'Send notifications', category: 'messaging' },
        'queue_manager': { description: 'Manage message queues', category: 'messaging' },
        'rate_limiter': { description: 'Rate limit operations', category: 'control' },
        'circuit_breaker': { description: 'Implement circuit breakers', category: 'resilience' }
      },
      
      // Security & Authentication Tools (10 tools)
      securityTools: {
        'auth_manager': { description: 'Manage authentication', category: 'auth' },
        'token_validator': { description: 'Validate auth tokens', category: 'auth' },
        'session_handler': { description: 'Handle user sessions', category: 'auth' },
        'encryption_handler': { description: 'Handle encryption/decryption', category: 'crypto' },
        'access_controller': { description: 'Control resource access', category: 'authorization' },
        'permission_manager': { description: 'Manage permissions', category: 'authorization' },
        'security_scanner': { description: 'Scan for vulnerabilities', category: 'scanning' },
        'compliance_checker': { description: 'Check compliance rules', category: 'compliance' },
        'audit_logger': { description: 'Log security events', category: 'logging' },
        'threat_detector': { description: 'Detect security threats', category: 'monitoring' }
      },
      
      // Architecture & Design Tools (6 tools)
      architectureTools: {
        'architecture_design': { description: 'Design system architecture', category: 'design' },
        'dependency_analyzer': { description: 'Analyze dependencies', category: 'analysis' },
        'pattern_matcher': { description: 'Match design patterns', category: 'patterns' },
        'service_mesh': { description: 'Configure service mesh', category: 'microservices' },
        'api_gateway': { description: 'Configure API gateway', category: 'api' },
        'load_balancer': { description: 'Configure load balancing', category: 'scaling' }
      },
      
      // Monitoring & Analytics Tools (8 tools)
      monitoringTools: {
        'metrics_collector': { description: 'Collect system metrics', category: 'monitoring' },
        'log_aggregator': { description: 'Aggregate logs', category: 'logging' },
        'trace_analyzer': { description: 'Analyze execution traces', category: 'tracing' },
        'alert_manager': { description: 'Manage system alerts', category: 'alerting' },
        'dashboard_generator': { description: 'Generate monitoring dashboards', category: 'visualization' },
        'report_builder': { description: 'Build analytics reports', category: 'reporting' },
        'anomaly_detector': { description: 'Detect anomalies', category: 'analysis' },
        'performance_monitor': { description: 'Monitor performance', category: 'monitoring' }
      }
    };
    
    // Feature to tool mappings
    this.featureToolMap = {
      'authentication': [
        'auth_manager', 'token_validator', 'session_handler', 
        'access_controller', 'permission_manager'
      ],
      'real-time': [
        'websocket_manager', 'event_stream', 'message_router',
        'pubsub_coordinator', 'presence_tracker'
      ],
      'database': [
        'schema_designer', 'database_query', 'migration_generate',
        'query_optimizer', 'connection_pool'
      ],
      'api': [
        'api_generate', 'api_document', 'api_gateway',
        'rate_limiter', 'circuit_breaker'
      ],
      'ui': [
        'ui_generate', 'component_create', 'style_system',
        'layout_designer', 'theme_generator'
      ],
      'testing': [
        'test_generate', 'test_execute', 'coverage_analyze',
        'data_seeder', 'performance_profile'
      ],
      'security': [
        'security_scan', 'encryption_handler', 'security_scanner',
        'compliance_checker', 'threat_detector'
      ],
      'monitoring': [
        'metrics_collector', 'log_aggregator', 'performance_monitor',
        'alert_manager', 'dashboard_generator'
      ],
      'ml': [
        'neural_train', 'neural_predict', 'ml_train',
        'ml_predict', 'pattern_extract'
      ],
      'search': [
        'memory_search', 'index_optimizer', 'query_optimizer'
      ]
    };
  }

  /**
   * Allocate tools based on agent specification
   * @param {Object} agentSpec - Agent specification
   * @returns {Array} Allocated tools
   */
  async allocateTools(agentSpec) {
    this.emit('allocation:starting', { agent: agentSpec.name });
    
    const allocatedTools = new Set();
    
    // Add tools from agent spec
    if (agentSpec.tools) {
      agentSpec.tools.forEach(tool => allocatedTools.add(tool));
    }
    
    // Add tools based on capabilities
    if (agentSpec.capabilities) {
      agentSpec.capabilities.forEach(capability => {
        const tools = this.getToolsForCapability(capability);
        tools.forEach(tool => allocatedTools.add(tool));
      });
    }
    
    // Add tools based on project context
    if (agentSpec.specialization?.projectContext) {
      const contextTools = this.getToolsForContext(agentSpec.specialization.projectContext);
      contextTools.forEach(tool => allocatedTools.add(tool));
    }
    
    // Ensure we don't exceed reasonable limits per agent
    const toolsArray = Array.from(allocatedTools);
    const finalTools = this.optimizeToolSelection(toolsArray, agentSpec);
    
    this.emit('allocation:completed', { 
      agent: agentSpec.name, 
      toolCount: finalTools.length 
    });
    
    return finalTools;
  }

  /**
   * Get tools for a specific capability
   */
  getToolsForCapability(capability) {
    const capabilityToolMap = {
      // Orchestration capabilities
      'orchestration': ['task_orchestrate', 'agent_spawn', 'swarm_monitor'],
      'task-delegation': ['task_orchestrate', 'agent_spawn'],
      'progress-monitoring': ['task_status', 'agent_metrics', 'swarm_monitor'],
      'resource-allocation': ['agent_spawn', 'swarm_scale', 'load_balancer'],
      'swarm-coordination': ['swarm_init', 'swarm_monitor', 'consensus_build'],
      
      // Architecture capabilities
      'system-design': ['architecture_design', 'dependency_analyzer', 'pattern_matcher'],
      'architecture-patterns': ['pattern_matcher', 'architecture_design'],
      'scalability-planning': ['load_balancer', 'service_mesh', 'swarm_scale'],
      'technology-selection': ['dependency_analyzer', 'pattern_matcher'],
      'integration-design': ['api_gateway', 'service_mesh', 'message_router'],
      
      // Development capabilities
      'code-implementation': ['code_generate', 'code_analyze', 'debug_code'],
      'api-development': ['api_generate', 'api_document', 'api_gateway'],
      'database-integration': ['database_query', 'schema_designer', 'migration_generate'],
      'business-logic': ['code_generate', 'code_refactor', 'pattern_matcher'],
      'error-handling': ['debug_code', 'circuit_breaker', 'log_aggregator'],
      
      // UI/UX capabilities
      'ui-design': ['ui_generate', 'layout_designer', 'theme_generator'],
      'ux-patterns': ['pattern_matcher', 'component_create', 'interaction_handler'],
      'responsive-design': ['layout_designer', 'style_system'],
      'component-architecture': ['component_create', 'ui_generate'],
      'user-interaction': ['interaction_handler', 'event_stream'],
      
      // Testing capabilities
      'test-creation': ['test_generate', 'data_seeder'],
      'quality-assurance': ['test_execute', 'coverage_analyze', 'code_review'],
      'code-review': ['code_review', 'code_analyze', 'security_scan'],
      'performance-testing': ['performance_profile', 'performance_monitor'],
      'security-validation': ['security_scan', 'compliance_checker'],
      
      // Real-time capabilities
      'real-time-coordination': ['websocket_manager', 'event_stream', 'pubsub_coordinator'],
      'message-routing': ['message_router', 'queue_manager'],
      'event-handling': ['event_stream', 'pubsub_coordinator'],
      'process-management': ['task_orchestrate', 'circuit_breaker'],
      'communication-flow': ['message_router', 'websocket_manager'],
      
      // Security capabilities
      'security-implementation': ['security_scan', 'encryption_handler', 'access_controller'],
      'authentication': ['auth_manager', 'token_validator', 'session_handler'],
      'authorization': ['access_controller', 'permission_manager'],
      'encryption': ['encryption_handler'],
      'compliance-validation': ['compliance_checker', 'audit_logger'],
      
      // AI/ML capabilities
      'machine-learning': ['ml_train', 'ml_predict', 'neural_train'],
      'data-analysis': ['pattern_extract', 'memory_analyze', 'trace_analyzer'],
      'pattern-recognition': ['pattern_extract', 'neural_patterns'],
      'prediction': ['neural_predict', 'ml_predict'],
      'optimization': ['model_optimize', 'neural_compress', 'query_optimizer']
    };
    
    return capabilityToolMap[capability] || [];
  }

  /**
   * Get tools based on project context
   */
  getToolsForContext(context) {
    const tools = new Set();
    
    // Add tools based on features
    if (context.features) {
      context.features.forEach(feature => {
        const featureTools = this.featureToolMap[feature] || [];
        featureTools.forEach(tool => tools.add(tool));
      });
    }
    
    // Add tools based on tech stack
    if (context.techStack) {
      if (context.techStack.realtime) {
        this.featureToolMap['real-time'].forEach(tool => tools.add(tool));
      }
      if (context.techStack.authentication) {
        this.featureToolMap['authentication'].forEach(tool => tools.add(tool));
      }
      if (context.techStack.database) {
        this.featureToolMap['database'].forEach(tool => tools.add(tool));
      }
    }
    
    // Add monitoring tools for all projects
    tools.add('metrics_collector');
    tools.add('log_aggregator');
    tools.add('alert_manager');
    
    return Array.from(tools);
  }

  /**
   * Optimize tool selection to avoid redundancy
   */
  optimizeToolSelection(tools, agentSpec) {
    // Remove duplicate functionality
    const optimized = new Set(tools);
    
    // Apply agent-specific limits
    const maxToolsPerAgent = {
      'orchestrator': 15,
      'architect': 12,
      'developer': 20,
      'designer': 10,
      'tester': 15,
      'coordinator': 12,
      'security': 15,
      'analyst': 12
    };
    
    const limit = maxToolsPerAgent[agentSpec.type] || 15;
    
    // If we have too many tools, prioritize based on agent type
    if (optimized.size > limit) {
      const prioritized = this.prioritizeTools(Array.from(optimized), agentSpec);
      return prioritized.slice(0, limit);
    }
    
    return Array.from(optimized);
  }

  /**
   * Prioritize tools based on agent type and capabilities
   */
  prioritizeTools(tools, agentSpec) {
    // Define priority for each agent type
    const priorities = {
      'orchestrator': [
        'task_orchestrate', 'agent_spawn', 'swarm_monitor', 
        'swarm_init', 'task_status', 'memory_store'
      ],
      'architect': [
        'architecture_design', 'pattern_matcher', 'dependency_analyzer',
        'schema_designer', 'api_gateway', 'service_mesh'
      ],
      'developer': [
        'code_generate', 'code_analyze', 'api_generate', 
        'test_generate', 'debug_code', 'database_query'
      ],
      'designer': [
        'ui_generate', 'component_create', 'style_system',
        'layout_designer', 'theme_generator', 'interaction_handler'
      ],
      'tester': [
        'test_generate', 'test_execute', 'coverage_analyze',
        'security_scan', 'performance_profile', 'code_review'
      ]
    };
    
    const agentPriorities = priorities[agentSpec.type] || [];
    
    // Sort tools by priority
    return tools.sort((a, b) => {
      const aPriority = agentPriorities.indexOf(a);
      const bPriority = agentPriorities.indexOf(b);
      
      if (aPriority === -1 && bPriority === -1) return 0;
      if (aPriority === -1) return 1;
      if (bPriority === -1) return -1;
      
      return aPriority - bPriority;
    });
  }

  /**
   * Get tool metadata
   */
  getToolMetadata(toolName) {
    for (const category of Object.values(this.toolCatalog)) {
      if (category[toolName]) {
        return category[toolName];
      }
    }
    return null;
  }

  /**
   * Get all tools in a category
   */
  getToolsByCategory(categoryName) {
    return this.toolCatalog[categoryName] || {};
  }

  /**
   * Get tool usage statistics
   */
  getToolStats() {
    let totalTools = 0;
    const stats = {};
    
    Object.entries(this.toolCatalog).forEach(([category, tools]) => {
      stats[category] = Object.keys(tools).length;
      totalTools += stats[category];
    });
    
    stats.total = totalTools;
    return stats;
  }
}

export default ToolAllocator;