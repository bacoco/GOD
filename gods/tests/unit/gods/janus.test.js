import { test, describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Janus } from '../../../lib/gods/janus.js';

describe('Janus - Meta-Orchestrator', () => {
  let janus;
  let mockOptions;
  let mockMessenger;
  let mockPantheon;

  beforeEach(() => {
    mockMessenger = {
      send: mock.fn(async () => ({ success: true, data: 'test response' }))
    };
    
    mockPantheon = {
      summonGod: mock.fn(async (name) => ({
        name,
        getCapabilities: () => [`${name}-capability`]
      }))
    };
    
    mockOptions = {
      claudeFlow: {},
      tools: new Map(),
      messenger: mockMessenger,
      pantheon: mockPantheon
    };
    
    janus = new Janus(mockOptions);
  });

  describe('Initialization', () => {
    it('should initialize with execution modes', () => {
      assert.deepEqual(janus.executionModes, ['strict', 'flexible', 'experimental', 'safe']);
      assert.equal(janus.currentMode, 'flexible');
    });

    it('should have workflow patterns', () => {
      assert.ok(janus.patterns.sequential);
      assert.ok(janus.patterns.parallel);
      assert.ok(janus.patterns.pipeline);
      assert.ok(janus.patterns.adaptive);
      assert.equal(janus.patterns.parallel.parallel, true);
    });

    it('should have meta-patterns', () => {
      assert.ok(janus.metaPatterns.exploratory);
      assert.ok(janus.metaPatterns.rapidDelivery);
      assert.ok(janus.metaPatterns.qualityFirst);
      assert.ok(janus.metaPatterns.crossDomain);
      assert.equal(janus.metaPatterns.exploratory.phases.length, 4);
    });

    it('should set up universal commands on initialization', async () => {
      await janus.onInitialize();
      assert.ok(janus.commands.execute);
      assert.ok(janus.commands.merge);
      assert.ok(janus.commands.evolve);
      assert.ok(janus.commands.crossDomain);
      assert.equal(janus.metaOrchestrationEnabled, true);
      assert.equal(janus.canInterpretBACO, true);
    });
  });

  describe('Configuration Analysis', () => {
    it('should detect agent configuration type', () => {
      assert.equal(janus.detectConfigType({ agent: 'test' }), 'agent');
      assert.equal(janus.detectConfigType({ workflow: {} }), 'workflow');
      assert.equal(janus.detectConfigType({ pipeline: [] }), 'pipeline');
      assert.equal(janus.detectConfigType({ swarm: {} }), 'swarm');
      assert.equal(janus.detectConfigType({ commands: [] }), 'command-sequence');
      assert.equal(janus.detectConfigType({}), 'unknown');
    });

    it('should calculate complexity correctly', () => {
      const simpleConfig = { commands: ['cmd1', 'cmd2'] };
      const complexConfig = {
        workflow: true,
        swarm: true,
        dependencies: ['dep1', 'dep2', 'dep3'],
        commands: ['cmd1', 'cmd2', 'cmd3', 'cmd4']
      };
      
      assert.ok(janus.calculateComplexity(simpleConfig) < 3);
      assert.ok(janus.calculateComplexity(complexConfig) >= 7);
    });

    it('should analyze configuration comprehensively', async () => {
      const config = {
        workflow: true,
        commands: ['analyze', 'implement', 'test'],
        dependencies: ['agent1', 'agent2']
      };
      
      const analysis = await janus.analyzeConfiguration(config);
      
      assert.equal(analysis.type, 'workflow');
      assert.ok(analysis.complexity > 0);
      assert.ok(Array.isArray(analysis.resourcesNeeded));
      assert.ok(analysis.estimatedTime >= 0);
      assert.ok(Array.isArray(analysis.dependencies));
    });
  });

  describe('Config Execution', () => {
    it('should execute valid configuration', async () => {
      const config = {
        commands: ['test-command'],
        workflow: 'simple'
      };
      
      janus.validateConfig = mock.fn(async () => ({ valid: true }));
      janus.createExecutionPlan = mock.fn(async () => ({ steps: [] }));
      janus.executeWithMode = mock.fn(async () => ({ success: true }));
      
      const result = await janus.executeConfig(config);
      
      assert.ok(result.executionId);
      assert.equal(result.success, true);
      assert.ok(result.duration >= 0);
    });

    it('should reject invalid configuration', async () => {
      const config = { invalid: true };
      
      janus.validateConfig = mock.fn(async () => ({ 
        valid: false, 
        errors: ['Invalid structure'] 
      }));
      
      await assert.rejects(
        janus.executeConfig(config),
        /Invalid configuration/
      );
    });

    it('should handle execution failure with rollback in safe mode', async () => {
      janus.currentMode = 'safe';
      const config = { test: true };
      
      janus.validateConfig = mock.fn(async () => ({ valid: true }));
      janus.createExecutionPlan = mock.fn(async () => ({ steps: [] }));
      janus.executeWithMode = mock.fn(async () => {
        throw new Error('Execution failed');
      });
      janus.rollbackExecution = mock.fn(async () => {});
      
      await assert.rejects(janus.executeConfig(config));
      assert.equal(janus.rollbackExecution.mock.calls.length, 1);
    });
  });

  describe('Swarm Management', () => {
    it('should spawn swarm with single agent', async () => {
      janus.createSubAgent = mock.fn(async (type, config) => ({
        id: 'agent-1',
        name: 'test-agent',
        capabilities: ['test']
      }));
      
      const result = await janus.spawnSwarm({ name: 'test' }, 'parallel');
      
      assert.ok(result.swarmId);
      assert.equal(result.agents.length, 1);
      assert.equal(result.strategy, 'parallel');
      assert.ok(result.channels.sharedMemory);
    });

    it('should spawn swarm with multiple agents', async () => {
      let agentId = 0;
      janus.createSubAgent = mock.fn(async () => ({
        id: `agent-${++agentId}`,
        name: `test-agent-${agentId}`,
        capabilities: ['test']
      }));
      
      const agents = [{ name: 'agent1' }, { name: 'agent2' }, { name: 'agent3' }];
      const result = await janus.spawnSwarm(agents, 'hierarchical');
      
      assert.equal(result.agents.length, 3);
      assert.equal(result.coordinationModel.topology, 'hierarchical');
      assert.ok(result.coordinationModel.edges.length > 0);
    });

    it('should create correct coordination graphs', () => {
      const agents = [
        { id: '1', name: 'agent1' },
        { id: '2', name: 'agent2' },
        { id: '3', name: 'agent3' }
      ];
      
      // Sequential
      const seqGraph = janus.createCoordinationGraph(agents, 'sequential');
      assert.equal(seqGraph.edges.length, 2);
      assert.equal(seqGraph.edges[0].from, '1');
      assert.equal(seqGraph.edges[0].to, '2');
      
      // Parallel
      const parGraph = janus.createCoordinationGraph(agents, 'parallel');
      assert.equal(parGraph.edges.length, 0);
      
      // Hierarchical
      const hierGraph = janus.createCoordinationGraph(agents, 'hierarchical');
      assert.equal(hierGraph.edges.length, 2);
      assert.ok(hierGraph.edges.every(e => e.from === '1'));
      
      // Mesh
      const meshGraph = janus.createCoordinationGraph(agents, 'mesh');
      assert.equal(meshGraph.edges.length, 3);
      assert.ok(meshGraph.edges.every(e => e.bidirectional));
    });
  });

  describe('Agent Merging', () => {
    it('should merge two agents successfully', async () => {
      janus.loadAgentConfig = mock.fn(async (name) => ({
        capabilities: [`${name}-cap1`, `${name}-cap2`],
        commands: {
          test: () => {},
          analyze: () => {}
        }
      }));
      
      const result = await janus.mergeAgents('agent1', 'agent2');
      
      assert.equal(result.mergedAgent, 'agent1-agent2-hybrid');
      assert.equal(result.capabilities.length, 4);
      assert.ok(result.commandNamespaces.agent1.includes('test'));
      assert.ok(result.commandNamespaces.shared.includes('help'));
      assert.equal(result.conflictResolution, 'prefixed-namespaces');
    });

    it('should return cached merged agent', async () => {
      const mergedAgent = { id: 'cached-hybrid' };
      janus.mergedAgents.set('agent1-agent2-hybrid', mergedAgent);
      
      const result = await janus.mergeAgents('agent1', 'agent2');
      assert.equal(result, mergedAgent);
    });
  });

  describe('Pattern Evolution', () => {
    it('should evolve existing pattern', async () => {
      janus.analyzePatternPerformance = mock.fn(async () => ({
        efficiency: 0.6,
        bottlenecks: ['sequential'],
        resourceUsage: 0.8
      }));
      
      const result = await janus.evolvePattern('sequential', 'performance');
      
      assert.equal(result.basePattern, 'sequential');
      assert.equal(result.evolutionGoal, 'performance');
      assert.ok(result.evolutionOptions);
      assert.ok(result.recommendation);
      assert.ok(result.evolvedPattern);
    });

    it('should generate appropriate evolution options', () => {
      const pattern = { parallel: false };
      const performance = {
        bottlenecks: ['sequential'],
        resourceUsage: 0.8
      };
      
      const options = janus.generateEvolutionOptions(pattern, 'performance', performance);
      
      assert.ok(options.some(o => o.name === 'Parallel Optimization'));
      assert.ok(options.some(o => o.name === 'Resource Optimization'));
      assert.ok(options.some(o => o.name === 'Adaptive Intelligence'));
    });

    it('should reject unknown pattern', async () => {
      await assert.rejects(
        janus.evolvePattern('non-existent', 'performance'),
        /Unknown pattern/
      );
    });
  });

  describe('Deep Task Analysis', () => {
    it('should analyze simple task', async () => {
      const task = 'Create a REST API endpoint';
      const analysis = await janus.deepTaskAnalysis(task);
      
      assert.ok(analysis.complexity.technical > 0);
      assert.equal(analysis.complexity.domainCount, 1);
      assert.ok(analysis.requirements.functional.includes('creation'));
      assert.ok(analysis.workflow.pattern);
      assert.ok(analysis.estimatedEffort);
    });

    it('should identify complex multi-domain task', async () => {
      const task = 'Build secure microservice architecture with ML pipeline and real-time frontend';
      const analysis = await janus.deepTaskAnalysis(task);
      
      assert.ok(analysis.complexity.technical >= 7);
      assert.ok(analysis.complexity.domainCount >= 3);
      assert.ok(analysis.requirements.nonFunctional.includes('security'));
      assert.ok(analysis.requirements.functional.includes('creation'));
    });

    it('should assess uncertainty correctly', () => {
      const vagueTask = 'Explore possible machine learning solutions';
      const clearTask = 'Implement specific REST API with defined endpoints';
      
      assert.ok(janus.assessUncertainty(vagueTask) > 5);
      assert.ok(janus.assessUncertainty(clearTask) < 5);
    });

    it('should extract requirements comprehensively', () => {
      const task = 'Create fast, secure API integration with deadline by Friday';
      const requirements = janus.extractRequirements(task);
      
      assert.ok(requirements.functional.includes('creation'));
      assert.ok(requirements.functional.includes('integration'));
      assert.ok(requirements.nonFunctional.includes('performance'));
      assert.ok(requirements.nonFunctional.includes('security'));
      assert.ok(requirements.constraints.includes('time-constraint'));
    });
  });

  describe('Workflow Generation', () => {
    it('should generate exploratory workflow for uncertain tasks', async () => {
      janus.deepTaskAnalysis = mock.fn(async () => ({
        complexity: { overall: 8, uncertainty: 8 },
        workflow: { pattern: 'exploratory' },
        agents: {
          primary: ['researcher', 'developer'],
          supporting: ['tester'],
          optional: ['reviewer']
        }
      }));
      
      const workflow = await janus.generateOptimalWorkflow('Explore new technology');
      
      assert.ok(workflow.id);
      assert.ok(workflow.phases.length > 0);
      assert.equal(workflow.phases[0].name, 'Research & Discovery');
      assert.ok(workflow.phases[0].parallel);
    });

    it('should select appropriate workflow pattern', () => {
      assert.equal(janus.selectWorkflowPattern({
        complexity: { uncertainty: 8 }
      }), 'exploratory');
      
      assert.equal(janus.selectWorkflowPattern({
        requirements: { constraints: ['time-constraint'] }
      }), 'rapidDelivery');
      
      assert.equal(janus.selectWorkflowPattern({
        requirements: { nonFunctional: ['security'] }
      }), 'qualityFirst');
    });
  });

  describe('Cross-Domain Workflows', () => {
    it('should create cross-domain workflow', async () => {
      janus.analyzeDomain = mock.fn(async (domain) => ({
        name: domain,
        recommendedAgents: [`${domain}-specialist`],
        complexity: 5
      }));
      
      const workflow = await janus.createCrossDomainWorkflow(
        ['frontend', 'backend', 'ml'],
        'Build integrated system'
      );
      
      assert.ok(workflow.id);
      assert.deepEqual(workflow.domains, ['frontend', 'backend', 'ml']);
      assert.ok(workflow.translationStrategies['frontend-backend']);
      assert.ok(workflow.phases.length >= 5);
      assert.ok(workflow.phases.some(p => p.name === 'Domain Analysis'));
    });

    it('should identify cross-domain risks', async () => {
      janus.analyzeDomain = mock.fn(async () => ({ complexity: 7 }));
      janus.identifyCrossDomainRisks = mock.fn(() => [
        'API compatibility',
        'Data format mismatch'
      ]);
      
      const workflow = await janus.createCrossDomainWorkflow(
        ['mobile', 'backend'],
        'Mobile app with API'
      );
      
      assert.ok(workflow.risks.length > 0);
    });
  });

  describe('Workflow Optimization', () => {
    it('should optimize existing workflow', async () => {
      const workflow = {
        id: 'test-workflow',
        steps: [
          { agent: 'agent1', dependencies: [] },
          { agent: 'agent2', dependencies: [0] },
          { agent: 'agent3', dependencies: [1] }
        ]
      };
      
      janus.activeWorkflows.set('test-workflow', workflow);
      janus.analyzeWorkflowPerformance = mock.fn(() => ({ efficiency: 0.6 }));
      janus.findParallelizationOpportunities = mock.fn(() => ({
        count: 2,
        timeSavings: '30%',
        changes: []
      }));
      janus.analyzeAgentUtilization = mock.fn(() => ({
        improvements: [],
        efficiencyGain: '20%'
      }));
      janus.findProcessImprovements = mock.fn(() => []);
      janus.applyOptimizations = mock.fn((wf) => ({ ...wf, optimized: true }));
      
      const result = await janus.optimizeWorkflow('test-workflow');
      
      assert.ok(result.current);
      assert.ok(result.opportunities.length > 0);
      assert.ok(result.optimizedWorkflow);
      assert.ok(result.improvements);
    });

    it('should handle non-existent workflow', async () => {
      janus.loadWorkflow = mock.fn(async () => null);
      
      await assert.rejects(
        janus.optimizeWorkflow('non-existent'),
        /Workflow not found/
      );
    });
  });

  describe('Special Abilities', () => {
    it('should transform into another agent temporarily', async () => {
      janus.loadAgentConfig = mock.fn(async () => ({
        capabilities: ['target-cap1', 'target-cap2']
      }));
      
      const transformation = await janus.transform('zeus', 5000);
      
      assert.equal(transformation.originalType, 'janus');
      assert.equal(transformation.targetType, 'zeus');
      assert.ok(transformation.startTime);
      assert.equal(transformation.duration, 5000);
      assert.ok(janus.capabilities.includes('target-cap1'));
    });

    it('should revert transformation', async () => {
      janus.transformations = { originalType: 'janus' };
      await janus.revertTransformation();
      assert.equal(janus.transformations, null);
    });
  });

  describe('Command Handlers', () => {
    it('should validate configuration', async () => {
      janus.validateConfig = mock.fn(async () => ({ valid: true }));
      const result = await janus.commands.validate({ test: true });
      assert.ok(result.valid);
    });

    it('should suggest execution strategy', async () => {
      janus.suggestExecution = mock.fn(async () => ({
        strategy: 'parallel',
        agents: ['agent1', 'agent2']
      }));
      
      const result = await janus.commands.suggest('Build feature');
      assert.ok(result.strategy);
      assert.ok(result.agents);
    });

    it('should list all capabilities', async () => {
      janus.listCapabilities = mock.fn(async () => ({
        patterns: Object.keys(janus.patterns),
        metaPatterns: Object.keys(janus.metaPatterns),
        modes: janus.executionModes
      }));
      
      const result = await janus.commands.capabilities();
      assert.ok(result.patterns);
      assert.ok(result.metaPatterns);
      assert.ok(result.modes);
    });
  });

  describe('Message Processing', () => {
    it('should process command messages', async () => {
      const message = {
        content: {
          command: 'execute',
          args: [{ test: true }]
        }
      };
      
      janus.commands.execute = mock.fn(async () => ({ success: true }));
      const result = await janus.processMessage(message);
      
      assert.equal(janus.commands.execute.mock.calls.length, 1);
    });

    it('should process config messages', async () => {
      const message = {
        content: {
          config: { workflow: 'test' }
        }
      };
      
      janus.executeConfig = mock.fn(async () => ({ success: true }));
      const result = await janus.processMessage(message);
      
      assert.equal(janus.executeConfig.mock.calls.length, 1);
    });
  });

  describe('Domain Analysis', () => {
    it('should count domains correctly', () => {
      assert.equal(janus.countDomains('Simple backend task'), 1);
      assert.equal(janus.countDomains('Frontend and backend integration'), 2);
      assert.equal(janus.countDomains('Mobile app with ML backend and cloud infrastructure'), 3);
    });

    it('should analyze technical complexity', () => {
      const simple = janus.analyzeTechnicalComplexity('Create simple function');
      const complex = janus.analyzeTechnicalComplexity(
        'Build distributed microservice architecture with real-time ML pipeline'
      );
      
      assert.ok(simple < 5);
      assert.ok(complex > 7);
    });
  });
});