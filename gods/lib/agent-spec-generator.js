/**
 * Agent Specification Generator
 * Converts PRD data from conversations into agent specifications
 * Intelligently maps project requirements to Claude-Flow's 54 agents
 */

import { EventEmitter } from 'events';

export class AgentSpecGenerator extends EventEmitter {
  constructor() {
    super();
    
    // Map project features to agent capabilities
    this.featureToCapabilityMap = {
      // Authentication & Security
      'authentication': ['security', 'auth-management', 'session-handling'],
      'user-auth': ['security', 'auth-management', 'session-handling'],
      'login': ['security', 'auth-management', 'session-handling'],
      'security': ['security', 'encryption', 'compliance'],
      'privacy': ['security', 'data-protection', 'compliance'],
      
      // Data & Storage
      'database': ['data-modeling', 'schema-design', 'query-optimization'],
      'storage': ['data-persistence', 'file-management', 'caching'],
      'search': ['search-indexing', 'query-processing', 'relevance-ranking'],
      
      // Real-time Features
      'real-time': ['websocket', 'event-streaming', 'pubsub'],
      'chat': ['real-time-messaging', 'websocket', 'presence'],
      'notifications': ['push-notifications', 'event-handling', 'messaging'],
      
      // UI/UX
      'ui': ['frontend', 'component-design', 'responsive-layout'],
      'mobile': ['mobile-development', 'responsive-design', 'native-features'],
      'design': ['ui-design', 'ux-patterns', 'accessibility'],
      
      // API & Backend
      'api': ['api-design', 'rest-architecture', 'graphql'],
      'backend': ['server-development', 'business-logic', 'data-processing'],
      'microservices': ['distributed-systems', 'service-mesh', 'api-gateway'],
      
      // AI & ML
      'ai': ['machine-learning', 'neural-networks', 'ai-integration'],
      'recommendation': ['ml-algorithms', 'personalization', 'collaborative-filtering'],
      'image': ['image-processing', 'computer-vision', 'media-handling'],
      
      // Performance & Scale
      'performance': ['optimization', 'caching', 'load-balancing'],
      'scale': ['horizontal-scaling', 'distributed-computing', 'load-balancing'],
      'optimization': ['performance-tuning', 'resource-optimization', 'caching']
    };
    
    // Map capabilities to Claude-Flow agent types
    this.capabilityToAgentMap = {
      // Security & Auth
      'security': ['security-manager', 'aegis'],
      'auth-management': ['security-manager'],
      'compliance': ['security-manager', 'production-validator'],
      
      // Architecture & Design
      'system-design': ['system-architect', 'daedalus', 'architecture'],
      'distributed-systems': ['system-architect', 'mesh-coordinator'],
      'api-design': ['api-docs', 'backend-dev'],
      
      // Development
      'backend-development': ['backend-dev', 'hephaestus', 'coder'],
      'frontend-development': ['apollo', 'mobile-dev'],
      'mobile-development': ['mobile-dev', 'spec-mobile-react-native'],
      
      // Data & ML
      'machine-learning': ['ml-developer', 'data-ml-model'],
      'data-processing': ['backend-dev', 'performance-analyzer'],
      
      // Coordination & Orchestration
      'orchestration': ['orchestrator-task', 'zeus', 'sparc-coordinator'],
      'swarm-coordination': ['swarm-init', 'hierarchical-coordinator', 'mesh-coordinator'],
      
      // Testing & Quality
      'testing': ['tester', 'themis', 'tdd-london-swarm'],
      'validation': ['production-validator', 'reviewer'],
      
      // Performance
      'optimization': ['performance-analyzer', 'performance-benchmarker'],
      'monitoring': ['performance-monitor', 'prometheus']
    };
  }

  /**
   * Generate agent specifications from PRD data
   * @param {Object} projectData - Project data from conversation
   * @returns {Array} Agent specifications
   */
  async generateSpecs(projectData) {
    this.emit('generation:starting', { projectData });
    
    const specs = [];
    
    // Extract requirements
    const requirements = this.extractRequirements(projectData);
    
    // Generate specs for each god based on requirements
    specs.push(await this.generateZeusSpec(requirements));
    specs.push(await this.generateDaedalusSpec(requirements));
    specs.push(await this.generateHephaestusSpec(requirements));
    
    if (requirements.needsUI) {
      specs.push(await this.generateApolloSpec(requirements));
    }
    
    specs.push(await this.generateThemisSpec(requirements));
    
    // Add specialized agents based on features
    if (requirements.features.includes('real-time')) {
      specs.push(await this.generateHermesSpec(requirements));
    }
    
    if (requirements.features.includes('security') || requirements.features.includes('authentication')) {
      specs.push(await this.generateAegisSpec(requirements));
    }
    
    if (requirements.features.includes('ai') || requirements.features.includes('ml')) {
      specs.push(await this.generateAthenaSpec(requirements));
    }
    
    this.emit('generation:completed', { specs });
    
    return specs;
  }

  /**
   * Extract structured requirements from project data
   */
  extractRequirements(projectData) {
    const { discovery, plan, design } = projectData;
    
    // Extract features from plan
    const features = [];
    if (plan?.mvp_features) {
      const mvpFeatures = plan.mvp_features.toLowerCase();
      Object.keys(this.featureToCapabilityMap).forEach(feature => {
        if (mvpFeatures.includes(feature)) {
          features.push(feature);
        }
      });
    }
    
    // Determine if UI is needed
    const needsUI = discovery?.core_feature?.toLowerCase().includes('interface') ||
                   discovery?.experience?.toLowerCase().includes('ui') ||
                   plan?.mvp_features?.toLowerCase().includes('ui') ||
                   design?.visual_style;
    
    // Extract tech preferences
    const techStack = {
      platform: discovery?.platform || 'web',
      database: this.inferDatabase(projectData),
      realtime: features.includes('real-time') || features.includes('chat'),
      authentication: features.includes('authentication') || features.includes('login')
    };
    
    return {
      projectIdea: discovery?.projectIdea || '',
      users: discovery?.users || '',
      coreFeature: discovery?.core_feature || '',
      experience: discovery?.experience || '',
      features,
      needsUI,
      techStack,
      design: design || {},
      plan: plan || {}
    };
  }

  /**
   * Generate Zeus orchestrator specification
   */
  async generateZeusSpec(requirements) {
    const baseAgents = ['orchestrator-task', 'sparc-coordinator'];
    
    // Add coordination type based on project complexity
    if (requirements.features.length > 5) {
      baseAgents.push('hierarchical-coordinator');
    } else {
      baseAgents.push('mesh-coordinator');
    }
    
    const capabilities = [
      'orchestration',
      'task-delegation',
      'progress-monitoring',
      'resource-allocation',
      'swarm-coordination'
    ];
    
    const tools = [
      'swarm_init',
      'task_orchestrate',
      'agent_spawn',
      'task_status',
      'swarm_monitor',
      'memory_store',
      'memory_retrieve'
    ];
    
    return {
      name: 'zeus-project-orchestrator',
      displayName: 'Zeus - Project Orchestrator',
      type: 'orchestrator',
      baseAgents,
      capabilities,
      tools,
      description: `Supreme orchestrator for ${requirements.projectIdea}. Coordinates all project activities and ensures harmonious collaboration.`,
      specialization: {
        focus: 'Project-wide orchestration and coordination',
        orchestrationMode: 'adaptive',
        parentGod: 'zeus',
        projectContext: requirements
      },
      responsibilities: [
        {
          title: 'Project Orchestration',
          description: 'Coordinate all development activities across the project lifecycle'
        },
        {
          title: 'Resource Management',
          description: 'Allocate agents and tools efficiently based on project needs'
        },
        {
          title: 'Progress Tracking',
          description: 'Monitor project progress and ensure timely delivery'
        }
      ]
    };
  }

  /**
   * Generate Daedalus architect specification
   */
  async generateDaedalusSpec(requirements) {
    const baseAgents = ['system-architect', 'architecture'];
    
    // Add specialized architecture agents based on needs
    if (requirements.techStack.realtime) {
      baseAgents.push('mesh-coordinator');
    }
    
    if (requirements.features.includes('microservices')) {
      baseAgents.push('distributed-systems-architect');
    }
    
    const capabilities = [
      'system-design',
      'architecture-patterns',
      'scalability-planning',
      'technology-selection',
      'integration-design'
    ];
    
    const tools = [
      'architecture_design',
      'schema_designer',
      'api_designer',
      'dependency_analyzer',
      'pattern_matcher'
    ];
    
    // Add specific tools based on requirements
    if (requirements.techStack.database) {
      tools.push('database_modeler');
    }
    
    return {
      name: 'daedalus-system-architect',
      displayName: 'Daedalus - System Architect',
      type: 'architect',
      baseAgents,
      capabilities,
      tools,
      description: `Master architect designing the foundation for ${requirements.coreFeature}`,
      specialization: {
        focus: 'System architecture and technical design',
        architectureStyle: this.determineArchitectureStyle(requirements),
        parentGod: 'daedalus',
        projectContext: requirements
      },
      responsibilities: [
        {
          title: 'System Architecture',
          description: 'Design scalable and maintainable system architecture'
        },
        {
          title: 'Technology Selection',
          description: 'Choose appropriate technologies and frameworks'
        },
        {
          title: 'Integration Planning',
          description: 'Design seamless integration between components'
        }
      ]
    };
  }

  /**
   * Generate Hephaestus developer specification
   */
  async generateHephaestusSpec(requirements) {
    const baseAgents = ['backend-dev', 'coder', 'implementer-sparc-coder'];
    
    // Add specialized development agents
    if (requirements.features.includes('api')) {
      baseAgents.push('api-docs');
    }
    
    if (requirements.techStack.realtime) {
      baseAgents.push('realtime-developer');
    }
    
    const capabilities = [
      'code-implementation',
      'api-development',
      'database-integration',
      'business-logic',
      'error-handling'
    ];
    
    const tools = [
      'code_generate',
      'code_analyze',
      'api_implement',
      'database_query',
      'test_generate',
      'debug_code'
    ];
    
    // Add feature-specific tools
    requirements.features.forEach(feature => {
      switch(feature) {
        case 'authentication':
          tools.push('auth_implement', 'session_manager');
          break;
        case 'search':
          tools.push('search_indexer', 'query_optimizer');
          break;
        case 'real-time':
          tools.push('websocket_implement', 'event_handler');
          break;
      }
    });
    
    return {
      name: 'hephaestus-backend-developer',
      displayName: 'Hephaestus - Master Builder',
      type: 'developer',
      baseAgents,
      capabilities,
      tools,
      description: `Master craftsman building robust implementation for ${requirements.coreFeature}`,
      specialization: {
        focus: 'Backend development and core functionality',
        codingStyle: 'clean-architecture',
        preferredPatterns: this.determinePatterns(requirements),
        parentGod: 'hephaestus',
        projectContext: requirements
      },
      responsibilities: [
        {
          title: 'Core Implementation',
          description: 'Build robust backend services and APIs'
        },
        {
          title: 'Database Integration',
          description: 'Implement efficient data persistence and retrieval'
        },
        {
          title: 'Business Logic',
          description: 'Implement core business rules and workflows'
        }
      ]
    };
  }

  /**
   * Generate Apollo UI/UX specification
   */
  async generateApolloSpec(requirements) {
    const baseAgents = ['apollo'];
    
    // Add platform-specific agents
    if (requirements.techStack.platform === 'mobile') {
      baseAgents.push('mobile-dev', 'spec-mobile-react-native');
    } else {
      baseAgents.push('frontend-developer');
    }
    
    const capabilities = [
      'ui-design',
      'ux-patterns',
      'responsive-design',
      'component-architecture',
      'user-interaction'
    ];
    
    const tools = [
      'ui_generate',
      'component_create',
      'style_system',
      'layout_designer',
      'interaction_handler'
    ];
    
    // Add design-specific tools
    if (requirements.design.visual_style) {
      tools.push('theme_generator', 'color_palette');
    }
    
    return {
      name: 'apollo-ui-designer',
      displayName: 'Apollo - UI/UX Designer',
      type: 'designer',
      baseAgents,
      capabilities,
      tools,
      description: `Divine designer creating beautiful interfaces for ${requirements.experience}`,
      specialization: {
        focus: 'User interface and experience design',
        designPhilosophy: requirements.design.visual_style || 'modern-clean',
        platform: requirements.techStack.platform,
        parentGod: 'apollo',
        projectContext: requirements
      },
      responsibilities: [
        {
          title: 'UI Design',
          description: 'Create beautiful and intuitive user interfaces'
        },
        {
          title: 'UX Optimization',
          description: 'Ensure excellent user experience and accessibility'
        },
        {
          title: 'Component Development',
          description: 'Build reusable UI components and design systems'
        }
      ]
    };
  }

  /**
   * Generate Themis quality assurance specification
   */
  async generateThemisSpec(requirements) {
    const baseAgents = ['tester', 'reviewer', 'production-validator'];
    
    // Add specialized testing agents
    if (requirements.features.includes('authentication') || requirements.features.includes('security')) {
      baseAgents.push('security-tester');
    }
    
    const capabilities = [
      'test-creation',
      'quality-assurance',
      'code-review',
      'performance-testing',
      'security-validation'
    ];
    
    const tools = [
      'test_generate',
      'test_execute',
      'code_review',
      'security_scan',
      'performance_test',
      'coverage_analyze'
    ];
    
    return {
      name: 'themis-quality-guardian',
      displayName: 'Themis - Quality Guardian',
      type: 'tester',
      baseAgents,
      capabilities,
      tools,
      description: `Guardian of quality ensuring excellence in ${requirements.projectIdea}`,
      specialization: {
        focus: 'Quality assurance and testing',
        testingStrategy: 'comprehensive',
        coverageTarget: 80,
        parentGod: 'themis',
        projectContext: requirements
      },
      responsibilities: [
        {
          title: 'Test Coverage',
          description: 'Ensure comprehensive test coverage across all features'
        },
        {
          title: 'Quality Standards',
          description: 'Enforce coding standards and best practices'
        },
        {
          title: 'Security Validation',
          description: 'Validate security measures and compliance'
        }
      ]
    };
  }

  /**
   * Generate Hermes real-time coordinator specification
   */
  async generateHermesSpec(requirements) {
    const baseAgents = ['coordinator', 'mesh-coordinator'];
    
    const capabilities = [
      'real-time-coordination',
      'message-routing',
      'event-handling',
      'process-management',
      'communication-flow'
    ];
    
    const tools = [
      'websocket_manager',
      'event_stream',
      'message_router',
      'pubsub_coordinator',
      'presence_tracker'
    ];
    
    return {
      name: 'hermes-realtime-coordinator',
      displayName: 'Hermes - Real-time Coordinator',
      type: 'coordinator',
      baseAgents,
      capabilities,
      tools,
      description: 'Swift messenger coordinating real-time features and communication',
      specialization: {
        focus: 'Real-time communication and event coordination',
        communicationStyle: 'event-driven',
        parentGod: 'hermes',
        projectContext: requirements
      }
    };
  }

  /**
   * Generate Aegis security specification
   */
  async generateAegisSpec(requirements) {
    const baseAgents = ['security-manager', 'production-validator'];
    
    const capabilities = [
      'security-implementation',
      'authentication',
      'authorization',
      'encryption',
      'compliance-validation'
    ];
    
    const tools = [
      'auth_manager',
      'token_validator',
      'encryption_handler',
      'security_scanner',
      'compliance_checker',
      'access_controller'
    ];
    
    return {
      name: 'aegis-security-guardian',
      displayName: 'Aegis - Security Guardian',
      type: 'security',
      baseAgents,
      capabilities,
      tools,
      description: 'Protective guardian ensuring security and data protection',
      specialization: {
        focus: 'Security implementation and compliance',
        securityLevel: 'enterprise',
        parentGod: 'aegis',
        projectContext: requirements
      }
    };
  }

  /**
   * Generate Athena AI/ML specification
   */
  async generateAthenaSpec(requirements) {
    const baseAgents = ['researcher', 'ml-developer', 'data-ml-model'];
    
    const capabilities = [
      'machine-learning',
      'data-analysis',
      'pattern-recognition',
      'prediction',
      'optimization'
    ];
    
    const tools = [
      'ml_train',
      'ml_predict',
      'data_analyze',
      'pattern_extract',
      'model_optimize',
      'neural_process'
    ];
    
    return {
      name: 'athena-ai-strategist',
      displayName: 'Athena - AI Strategist',
      type: 'analyst',
      baseAgents,
      capabilities,
      tools,
      description: 'Wise strategist implementing intelligent features and insights',
      specialization: {
        focus: 'AI/ML implementation and data intelligence',
        mlApproach: 'practical',
        parentGod: 'athena',
        projectContext: requirements
      }
    };
  }

  // Helper methods
  
  inferDatabase(projectData) {
    const features = projectData.plan?.mvp_features?.toLowerCase() || '';
    
    if (features.includes('real-time') || features.includes('chat')) {
      return 'mongodb'; // NoSQL for real-time
    }
    if (features.includes('analytics') || features.includes('reporting')) {
      return 'postgresql'; // SQL for analytics
    }
    return 'postgresql'; // Default to PostgreSQL
  }

  determineArchitectureStyle(requirements) {
    if (requirements.features.includes('microservices')) {
      return 'microservices';
    }
    if (requirements.features.length > 10) {
      return 'modular-monolith';
    }
    return 'clean-architecture';
  }

  determinePatterns(requirements) {
    const patterns = ['repository', 'service-layer'];
    
    if (requirements.features.includes('real-time')) {
      patterns.push('event-driven', 'pubsub');
    }
    if (requirements.features.includes('api')) {
      patterns.push('rest', 'dto');
    }
    
    return patterns;
  }
}

export default AgentSpecGenerator;