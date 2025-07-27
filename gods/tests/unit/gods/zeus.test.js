import { test, describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Zeus } from '../../../lib/gods/zeus.js';

describe('Zeus - Supreme Orchestrator', () => {
  let zeus;
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
    
    zeus = new Zeus(mockOptions);
  });

  describe('Initialization', () => {
    it('should initialize with proper properties', () => {
      assert.ok(zeus.orchestrations instanceof Map);
      assert.equal(zeus.complexityThresholds.simple, 3);
      assert.equal(zeus.complexityThresholds.moderate, 6);
      assert.equal(zeus.complexityThresholds.complex, 8);
      assert.equal(zeus.complexityThresholds.extreme, 10);
    });

    it('should have specialist categories', () => {
      assert.ok(Array.isArray(zeus.specialists.development));
      assert.ok(zeus.specialists.development.includes('hephaestus'));
      assert.ok(zeus.specialists.quality.includes('themis'));
      assert.ok(zeus.specialists.special.includes('janus'));
    });

    it('should initialize workflows', () => {
      assert.ok(zeus.workflows instanceof Map);
      assert.ok(zeus.workflows.has('analysis-to-implementation'));
      assert.ok(zeus.workflows.has('security-review'));
      assert.ok(zeus.workflows.has('full-stack-dev'));
    });

    it('should set up command handlers on initialization', async () => {
      await zeus.onInitialize();
      assert.ok(zeus.commands.analyze);
      assert.ok(zeus.commands.orchestrate);
      assert.ok(zeus.commands.workflow);
      assert.equal(zeus.canCreateGods, true);
    });
  });

  describe('Complexity Analysis', () => {
    it('should analyze simple task complexity', async () => {
      const task = 'Create a simple REST endpoint';
      const analysis = await zeus.analyzeComplexity(task);
      
      assert.ok(analysis.score >= 1 && analysis.score <= 10);
      assert.ok(analysis.factors.technical);
      assert.ok(analysis.requiredCapabilities.includes('api'));
      assert.equal(analysis.primaryDomain, 'development');
    });

    it('should identify high complexity for distributed systems', async () => {
      const task = 'Build microservice architecture with real-time streaming';
      const analysis = await zeus.analyzeComplexity(task);
      
      assert.ok(analysis.score >= 7);
      assert.ok(analysis.factors.technical > 5);
    });

    it('should detect security requirements', async () => {
      const task = 'Implement OAuth authentication with encryption';
      const analysis = await zeus.analyzeComplexity(task);
      
      assert.ok(analysis.factors.security > 0);
      assert.ok(analysis.requiredCapabilities.includes('security'));
      assert.ok(analysis.suggestedGods.includes('aegis'));
    });

    it('should assess integration needs', async () => {
      const task = 'Integrate third-party payment API with webhooks';
      const analysis = await zeus.analyzeComplexity(task);
      
      assert.ok(analysis.factors.integration > 0);
      assert.ok(analysis.requiredCapabilities.includes('api'));
    });

    it('should identify urgent timeline constraints', async () => {
      const task = 'URGENT: Create MVP prototype ASAP';
      const analysis = await zeus.analyzeComplexity(task);
      
      assert.ok(analysis.factors.timeline > 5);
    });

    it('should suggest Janus for extreme complexity', async () => {
      const task = 'Build AI-powered blockchain microservice with real-time ML analytics';
      const analysis = await zeus.analyzeComplexity(task);
      
      assert.equal(analysis.score, 10);
      assert.ok(analysis.suggestedGods.includes('janus'));
    });
  });

  describe('Domain Identification', () => {
    const testCases = [
      { task: 'Design system architecture', expected: 'architecture' },
      { task: 'Implement user authentication', expected: 'development' },
      { task: 'Create beautiful UI design', expected: 'ux' },
      { task: 'Write comprehensive tests', expected: 'testing' },
      { task: 'Security audit and vulnerability scan', expected: 'security' },
      { task: 'Define product roadmap', expected: 'product' },
      { task: 'Set up CI/CD pipeline', expected: 'devops' },
      { task: 'Random task without clear domain', expected: 'general' }
    ];

    testCases.forEach(({ task, expected }) => {
      it(`should identify ${expected} domain for: ${task}`, () => {
        const domain = zeus.identifyPrimaryDomain(task);
        assert.equal(domain, expected);
      });
    });
  });

  describe('Delegation and Team Selection', () => {
    it('should select single specialist for simple tasks', async () => {
      const analysis = {
        score: 2,
        primaryDomain: 'development',
        requiredCapabilities: ['coding']
      };
      
      const plan = await zeus.analyzeAndDelegate({ task: 'Simple task', analysis });
      
      assert.equal(plan.assignedGods.length, 1);
      assert.equal(plan.assignedGods[0], 'hephaestus');
      assert.equal(plan.steps.length, 1);
    });

    it('should select 2-3 gods for moderate complexity', async () => {
      const analysis = {
        score: 5,
        primaryDomain: 'development',
        requiredCapabilities: ['coding', 'testing'],
        factors: { security: 3 }
      };
      
      zeus.selectModerateTeam = zeus.selectModerateTeam.bind(zeus);
      const team = zeus.selectModerateTeam(analysis);
      
      assert.ok(team.length >= 2 && team.length <= 3);
      assert.ok(team.includes('hephaestus'));
      assert.ok(team.includes('themis'));
    });

    it('should use workflow template for complex tasks', async () => {
      const analysis = {
        score: 8,
        primaryDomain: 'product',
        factors: { security: 3, timeline: 4 }
      };
      
      const workflow = zeus.selectWorkflowTemplate(analysis);
      
      assert.equal(workflow.name, 'product-planning');
      assert.ok(workflow.gods.includes('prometheus'));
    });

    it('should assemble full team for extreme complexity', async () => {
      const analysis = {
        score: 10,
        primaryDomain: 'development',
        requiredCapabilities: ['ui-design', 'security', 'testing'],
        factors: { security: 8 }
      };
      
      const team = await zeus.assembleFullTeam(analysis);
      
      assert.ok(team.includes('daedalus'));
      assert.ok(team.includes('hephaestus'));
      assert.ok(team.includes('aegis'));
      assert.ok(team.includes('themis'));
      assert.ok(team.includes('janus'));
    });
  });

  describe('Orchestration Execution', () => {
    it('should execute simple orchestration plan', async () => {
      const plan = {
        id: 'test-123',
        workflow: { task: 'Test task' },
        steps: [
          { god: 'hephaestus', task: 'Implement feature', dependencies: [] }
        ],
        assignedGods: ['hephaestus']
      };
      
      const result = await zeus.executeOrchestration(plan);
      
      assert.equal(result.success, true);
      assert.equal(result.orchestrationId, 'test-123');
      assert.equal(result.results.length, 1);
      assert.equal(mockPantheon.summonGod.mock.calls.length, 1);
      assert.equal(mockMessenger.send.mock.calls.length, 1);
    });

    it('should handle multi-step orchestration with dependencies', async () => {
      const plan = {
        id: 'test-456',
        workflow: { task: 'Complex task' },
        steps: [
          { god: 'daedalus', task: 'Design architecture', dependencies: [] },
          { god: 'hephaestus', task: 'Implement', dependencies: [0] },
          { god: 'themis', task: 'Test', dependencies: [1] }
        ],
        assignedGods: ['daedalus', 'hephaestus', 'themis']
      };
      
      const result = await zeus.executeOrchestration(plan);
      
      assert.equal(result.success, true);
      assert.equal(result.results.length, 3);
      assert.equal(mockPantheon.summonGod.mock.calls.length, 3);
    });

    it('should track orchestration status', async () => {
      const plan = {
        id: 'test-789',
        workflow: { task: 'Status test' },
        steps: [{ god: 'apollo', task: 'Design UI', dependencies: [] }],
        assignedGods: ['apollo']
      };
      
      // Start orchestration
      const orchestrationPromise = zeus.executeOrchestration(plan);
      
      // Check status during execution
      const status = zeus.getOrchestrationStatus();
      assert.ok(status.active > 0 || status.completed > 0);
      
      await orchestrationPromise;
    });
  });

  describe('Command Handlers', () => {
    it('should handle analyze command', async () => {
      const result = await zeus.commands.analyze('Build REST API');
      
      assert.ok(result.score);
      assert.ok(result.factors);
      assert.ok(result.suggestedGods);
      assert.ok(result.estimatedEffort);
    });

    it('should list available specialists when no name provided', async () => {
      const result = await zeus.commands.agent();
      
      assert.ok(result.available);
      assert.ok(result.available.includes('hephaestus'));
      assert.ok(result.categories);
    });

    it('should summon specific god', async () => {
      const result = await zeus.commands.agent('apollo');
      
      assert.equal(result.summoned, true);
      assert.equal(result.god, 'apollo');
      assert.ok(result.capabilities);
    });

    it('should list available workflows', async () => {
      const result = await zeus.commands.workflow();
      
      assert.ok(result.available);
      assert.ok(result.available.includes('full-stack-dev'));
      assert.ok(result.descriptions);
    });

    it('should execute named workflow', async () => {
      const result = await zeus.commands.workflow('rapid-prototype');
      
      assert.equal(result.success, true);
      assert.ok(result.orchestrationId);
    });

    it('should provide help information', async () => {
      const help = await zeus.commands.help();
      
      assert.equal(help.name, 'Zeus - Supreme Orchestrator');
      assert.ok(help.commands);
      assert.ok(help.specialists);
      assert.ok(help.workflows);
    });
  });

  describe('Workflow Templates', () => {
    it('should create analysis-to-implementation workflow', () => {
      const workflow = zeus.createAnalysisToImplementationWorkflow();
      
      assert.equal(workflow.name, 'analysis-to-implementation');
      assert.equal(workflow.gods.length, 3);
      assert.equal(workflow.steps[0].god, 'daedalus');
      assert.equal(workflow.steps[1].dependencies[0], 0);
    });

    it('should create security-review workflow', () => {
      const workflow = zeus.createSecurityReviewWorkflow();
      
      assert.ok(workflow.gods.includes('aegis'));
      assert.equal(workflow.steps[0].god, 'aegis');
    });

    it('should create full-stack-dev workflow', () => {
      const workflow = zeus.createFullStackDevWorkflow();
      
      assert.ok(workflow.gods.includes('daedalus'));
      assert.ok(workflow.gods.includes('hephaestus'));
      assert.ok(workflow.gods.includes('apollo'));
      assert.ok(workflow.steps.some(s => s.dependencies.length > 1));
    });

    it('should create design-system workflow', () => {
      const workflow = zeus.createDesignSystemWorkflow();
      
      assert.equal(workflow.gods.length, 5);
      assert.ok(workflow.gods.includes('oracle'));
      assert.ok(workflow.gods.includes('harmonia'));
    });
  });

  describe('Special Abilities', () => {
    it('should allow Zeus to create new gods', async () => {
      zeus.factory = {
        createGod: mock.fn(async (name, config) => ({ name, ...config }))
      };
      
      const newGod = await zeus.createNewGod('custom-god', { 
        capabilities: ['custom'] 
      });
      
      assert.equal(zeus.factory.createGod.mock.calls.length, 1);
      assert.equal(zeus.factory.createGod.mock.calls[0].arguments[1].custom, true);
      assert.equal(zeus.factory.createGod.mock.calls[0].arguments[1].creator, 'zeus');
    });

    it('should orchestrate collaboration between multiple gods', async () => {
      const gods = ['apollo', 'hephaestus', 'themis'];
      const task = 'Collaborative feature development';
      
      const result = await zeus.orchestrateCollaboration(gods, task);
      
      assert.equal(result.success, true);
      assert.ok(result.orchestrationId);
    });
  });

  describe('Duration Estimation', () => {
    it('should estimate duration for sequential steps', () => {
      const plan = {
        steps: [
          { god: 'daedalus', dependencies: [] },
          { god: 'hephaestus', dependencies: [0] },
          { god: 'themis', dependencies: [1] }
        ]
      };
      
      const duration = zeus.estimateDuration(plan);
      assert.ok(duration > 0);
    });

    it('should account for parallel steps', () => {
      const plan = {
        steps: [
          { god: 'daedalus', dependencies: [] },
          { god: 'hephaestus', dependencies: [0] },
          { god: 'apollo', dependencies: [0] },
          { god: 'themis', dependencies: [1, 2] }
        ]
      };
      
      const duration = zeus.estimateDuration(plan);
      // Parallel steps should not add full duration
      assert.ok(duration < 4 * 30 * 1.5);
    });
  });

  describe('Error Handling', () => {
    it('should handle failed orchestration', async () => {
      mockMessenger.send = mock.fn(async () => {
        throw new Error('Communication failed');
      });
      
      const plan = {
        id: 'fail-test',
        steps: [{ god: 'apollo', task: 'Will fail', dependencies: [] }],
        assignedGods: ['apollo']
      };
      
      await assert.rejects(
        zeus.executeOrchestration(plan),
        /Communication failed/
      );
      
      const orchestration = zeus.orchestrations.get('fail-test');
      assert.equal(orchestration.status, 'failed');
    });

    it('should handle unknown workflow', async () => {
      await assert.rejects(
        zeus.commands.workflow('non-existent'),
        /Unknown workflow/
      );
    });
  });
});