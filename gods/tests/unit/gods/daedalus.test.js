import { test, describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Daedalus } from '../../../lib/gods/daedalus.js';

describe('Daedalus - System Architect', () => {
  let daedalus;
  let mockOptions;

  beforeEach(() => {
    mockOptions = {
      claudeFlow: {},
      tools: new Map(),
      messenger: {},
      pantheon: {}
    };
    
    daedalus = new Daedalus(mockOptions);
    daedalus.remember = mock.fn(async () => {});
  });

  describe('Initialization', () => {
    it('should initialize with architecture patterns', () => {
      assert.ok(daedalus.architecturePatterns.microservices);
      assert.ok(daedalus.architecturePatterns.monolith);
      assert.ok(daedalus.architecturePatterns.eventDriven);
      assert.ok(daedalus.architecturePatterns.serverless);
      assert.ok(daedalus.architecturePatterns.hybrid);
    });

    it('should have design principles', () => {
      assert.ok(daedalus.designPrinciples.includes('SOLID'));
      assert.ok(daedalus.designPrinciples.includes('DRY'));
      assert.ok(daedalus.designPrinciples.includes('KISS'));
    });

    it('should set up architecture commands on initialization', async () => {
      daedalus.initializeTechnologyKnowledge = mock.fn(async () => {});
      await daedalus.onInitialize();
      
      assert.ok(daedalus.commands.analyze);
      assert.ok(daedalus.commands.designSystem);
      assert.ok(daedalus.commands.techSelection);
      assert.ok(daedalus.commands.reviewArch);
    });
  });

  describe('Requirements Analysis', () => {
    it('should analyze string requirements', async () => {
      const requirements = 'User should be able to login securely. System must scale to 1000 concurrent users.';
      const result = await daedalus.analyzeRequirements(requirements);
      
      assert.ok(result.analysis);
      assert.ok(Array.isArray(result.analysis.functionalRequirements));
      assert.ok(Array.isArray(result.analysis.nonFunctionalRequirements));
      assert.ok(result.recommendations);
      assert.ok(result.nextSteps);
    });

    it('should analyze structured requirements', async () => {
      const requirements = {
        functionalRequirements: ['User authentication', 'Data processing'],
        nonFunctionalRequirements: ['High performance', 'Security'],
        constraints: ['Budget limited', 'Timeline 3 months']
      };
      
      const result = await daedalus.analyzeRequirements(requirements);
      
      assert.deepEqual(result.analysis.functionalRequirements, requirements.functionalRequirements);
      assert.deepEqual(result.analysis.nonFunctionalRequirements, requirements.nonFunctionalRequirements);
    });

    it('should extract functional requirements from text', () => {
      const text = 'User should be able to create posts. System must validate input. Application will provide search functionality.';
      const requirements = daedalus.extractFunctionalRequirements(text);
      
      assert.ok(requirements.length > 0);
      assert.ok(requirements.some(r => r.includes('User')));
    });

    it('should extract non-functional requirements', () => {
      const text = 'System needs high performance, must be secure, should scale to handle growth';
      const nfrs = daedalus.extractNonFunctionalRequirements(text);
      
      assert.ok(nfrs.includes('performance'));
      assert.ok(nfrs.includes('security'));
      assert.ok(nfrs.includes('scalability'));
    });
  });

  describe('System Architecture Creation', () => {
    it('should create comprehensive system architecture', async () => {
      const context = {
        name: 'E-commerce Platform',
        requirements: 'scalable, secure, microservices',
        teamSize: 15
      };
      
      daedalus.selectArchitecturalPattern = mock.fn(async () => ({
        pattern: 'microservices',
        score: 8,
        rationale: 'Best for scalability'
      }));
      
      daedalus.identifySystemComponents = mock.fn(async () => [
        { name: 'API Gateway', type: 'infrastructure' },
        { name: 'User Service', type: 'service' }
      ]);
      
      const architecture = await daedalus.createSystemArchitecture(context);
      
      assert.ok(architecture.id);
      assert.equal(architecture.name, 'E-commerce Platform');
      assert.ok(architecture.pattern);
      assert.ok(architecture.layers.length > 0);
      assert.ok(architecture.components.length > 0);
      assert.ok(architecture.diagrams);
    });

    it('should select appropriate architectural pattern', async () => {
      const scalableContext = {
        requirements: 'need to scale for millions of users with independent teams'
      };
      
      const pattern = await daedalus.selectArchitecturalPattern(scalableContext);
      assert.equal(pattern.pattern, 'microservices');
      
      const simpleContext = {
        requirements: 'simple MVP for quick launch',
        teamSize: 3
      };
      
      const simplePattern = await daedalus.selectArchitecturalPattern(simpleContext);
      assert.equal(simplePattern.pattern, 'monolith');
    });

    it('should score pattern fit correctly', () => {
      const scalableReqs = 'Need to scale and handle high load';
      const simpleReqs = 'Simple and quick MVP';
      
      const microservicesScoreForScale = daedalus.scorePatternFit(
        'microservices',
        daedalus.architecturePatterns.microservices,
        { requirements: scalableReqs }
      );
      
      const monolithScoreForSimple = daedalus.scorePatternFit(
        'monolith',
        daedalus.architecturePatterns.monolith,
        { requirements: simpleReqs }
      );
      
      assert.ok(microservicesScoreForScale > 5);
      assert.ok(monolithScoreForSimple > 5);
    });

    it('should design appropriate system layers', () => {
      const microservicePattern = { pattern: 'microservices' };
      const layers = daedalus.designSystemLayers(microservicePattern, {});
      
      assert.ok(layers.some(l => l.name === 'API Gateway'));
      assert.ok(layers.some(l => l.name === 'Service Mesh'));
      
      const monolithPattern = { pattern: 'monolith' };
      const monolithLayers = daedalus.designSystemLayers(monolithPattern, {});
      
      assert.ok(monolithLayers.some(l => l.name === 'Presentation'));
      assert.ok(monolithLayers.some(l => l.name === 'Domain'));
    });
  });

  describe('Technology Stack Recommendations', () => {
    it('should recommend complete technology stack', async () => {
      const requirements = 'Build enterprise application with high performance needs';
      const recommendation = await daedalus.recommendTechnologyStack(requirements);
      
      assert.ok(recommendation.frontend);
      assert.ok(recommendation.backend);
      assert.ok(recommendation.database);
      assert.ok(recommendation.infrastructure);
      assert.ok(recommendation.tools);
      assert.ok(recommendation.rationale);
    });

    it('should recommend frontend stack based on requirements', () => {
      const enterpriseAnalysis = { requirements: ['enterprise'] };
      const frontend = daedalus.recommendFrontendStack(enterpriseAnalysis);
      assert.equal(frontend.framework, 'Angular');
      assert.equal(frontend.stateManagement, 'NgRx');
      
      const interactiveAnalysis = { requirements: ['interactive'] };
      const interactiveFrontend = daedalus.recommendFrontendStack(interactiveAnalysis);
      assert.equal(interactiveFrontend.framework, 'React');
      
      const simpleAnalysis = { requirements: ['simple'] };
      const simpleFrontend = daedalus.recommendFrontendStack(simpleAnalysis);
      assert.equal(simpleFrontend.framework, 'Vue.js');
    });

    it('should recommend backend stack based on requirements', () => {
      const performanceAnalysis = { requirements: ['performance'] };
      const backend = daedalus.recommendBackendStack(performanceAnalysis);
      assert.equal(backend.language, 'Go');
      assert.equal(backend.framework, 'Gin');
      
      const rapidAnalysis = { requirements: ['rapid'] };
      const rapidBackend = daedalus.recommendBackendStack(rapidAnalysis);
      assert.equal(rapidBackend.language, 'Node.js');
      assert.equal(rapidBackend.framework, 'Express');
      
      const typeSafeAnalysis = { requirements: ['type-safe'] };
      const typeSafeBackend = daedalus.recommendBackendStack(typeSafeAnalysis);
      assert.equal(typeSafeBackend.language, 'TypeScript');
      assert.equal(typeSafeBackend.framework, 'NestJS');
    });

    it('should include testing recommendations', () => {
      const analysis = { requirements: ['enterprise'] };
      const frontend = daedalus.recommendFrontendStack(analysis);
      
      assert.equal(frontend.testing.unit, 'Jest');
      assert.equal(frontend.testing.e2e, 'Playwright');
      
      const backend = daedalus.recommendBackendStack(analysis);
      assert.ok(backend.testing.unit);
      assert.ok(backend.testing.integration);
    });
  });

  describe('Design Pattern Suggestions', () => {
    it('should suggest applicable design patterns', async () => {
      daedalus.analyzeScenario = mock.fn(() => ({
        type: 'object-creation',
        complexity: 'moderate'
      }));
      
      daedalus.findApplicablePatterns = mock.fn(() => [
        { name: 'Factory Pattern', applicability: 0.9 },
        { name: 'Builder Pattern', applicability: 0.7 }
      ]);
      
      daedalus.identifyAntiPatterns = mock.fn(() => [
        { name: 'God Object', risk: 'high' }
      ]);
      
      daedalus.getPatternStructure = mock.fn(() => ({}));
      daedalus.getPatternExample = mock.fn(() => '// Example code');
      daedalus.getPatternConsiderations = mock.fn(() => []);
      
      const scenario = 'Need to create complex objects with many parameters';
      const suggestions = await daedalus.suggestDesignPatterns(scenario);
      
      assert.ok(suggestions.patterns.length > 0);
      assert.ok(suggestions.antiPatterns.length > 0);
      assert.ok(suggestions.implementation);
    });
  });

  describe('Scalability Strategy', () => {
    it('should design comprehensive scalability strategy', async () => {
      const system = {
        name: 'Current System',
        architecture: 'monolith',
        currentLoad: 100,
        targetLoad: 10000
      };
      
      daedalus.analyzeSystemScalability = mock.fn(() => ({
        currentCapacity: 100,
        bottlenecks: ['database', 'single-server']
      }));
      
      daedalus.canScaleHorizontally = mock.fn(() => true);
      daedalus.canScaleVertically = mock.fn(() => true);
      daedalus.recommendScalingTechniques = mock.fn(() => [
        'Load balancing',
        'Database sharding',
        'Caching layer'
      ]);
      daedalus.createScalingImplementationPlan = mock.fn(() => ({}));
      daedalus.defineScalabilityMetrics = mock.fn(() => []);
      
      const strategy = await daedalus.designScalabilityStrategy(system);
      
      assert.ok(strategy.currentState);
      assert.ok(strategy.targetState);
      assert.ok(strategy.scalingDimensions.length === 3);
      assert.ok(strategy.techniques.length > 0);
      assert.ok(strategy.implementation);
    });

    it('should identify scaling dimensions', async () => {
      const system = { type: 'web-app' };
      
      daedalus.analyzeSystemScalability = mock.fn(() => ({}));
      daedalus.defineScalabilityTargets = mock.fn(() => ({}));
      daedalus.canScaleHorizontally = mock.fn(() => true);
      daedalus.canScaleVertically = mock.fn(() => false);
      daedalus.recommendScalingTechniques = mock.fn(() => []);
      daedalus.createScalingImplementationPlan = mock.fn(() => ({}));
      daedalus.defineScalabilityMetrics = mock.fn(() => []);
      
      const strategy = await daedalus.designScalabilityStrategy(system);
      
      const horizontal = strategy.scalingDimensions.find(d => d.dimension === 'horizontal');
      const vertical = strategy.scalingDimensions.find(d => d.dimension === 'vertical');
      
      assert.equal(horizontal.applicable, true);
      assert.equal(vertical.applicable, false);
    });
  });

  describe('System Integration Planning', () => {
    it('should create integration plan for multiple systems', async () => {
      const systems = [
        { name: 'System A', apis: ['REST'] },
        { name: 'System B', apis: ['GraphQL'] },
        { name: 'System C', apis: ['SOAP'] }
      ];
      
      daedalus.mapSystemIntegrations = mock.fn(() => [
        { from: 'System A', to: 'System B', type: 'sync' },
        { from: 'System B', to: 'System C', type: 'async' }
      ]);
      
      daedalus.selectIntegrationPatterns = mock.fn(() => [
        'API Gateway',
        'Message Queue'
      ]);
      
      daedalus.defineIntegrationProtocols = mock.fn(() => [
        { protocol: 'REST', systems: ['A', 'B'] },
        { protocol: 'Message Queue', systems: ['B', 'C'] }
      ]);
      
      daedalus.designDataFlow = mock.fn(() => ({}));
      daedalus.planIntegrationSecurity = mock.fn(() => ({}));
      daedalus.createIntegrationTimeline = mock.fn(() => []);
      
      const plan = await daedalus.planSystemIntegrations(systems);
      
      assert.ok(plan.integrations.length > 0);
      assert.ok(plan.patterns.length > 0);
      assert.ok(plan.protocols.length > 0);
      assert.ok(plan.dataFlow);
      assert.ok(plan.security);
      assert.ok(plan.timeline);
    });
  });

  describe('Architecture Review', () => {
    it('should comprehensively review architecture', async () => {
      const architecture = {
        pattern: 'microservices',
        components: ['Service A', 'Service B'],
        security: { authentication: 'OAuth2' }
      };
      
      daedalus.evaluateAgainstPrinciples = mock.fn(() => ({
        score: 8,
        strengths: ['Good separation of concerns'],
        weaknesses: ['Complex deployment']
      }));
      
      daedalus.evaluatePatterns = mock.fn(() => ({ score: 7 }));
      daedalus.assessScalability = mock.fn(() => ({ score: 9 }));
      daedalus.reviewSecurity = mock.fn(() => ({ score: 8 }));
      daedalus.identifyArchitecturalRisks = mock.fn(() => ['Deployment complexity']);
      daedalus.suggestArchitecturalImprovements = mock.fn(() => ['Add service mesh']);
      daedalus.checkArchitecturalCompliance = mock.fn(() => ({ compliant: true }));
      
      const review = await daedalus.reviewArchitecture(architecture);
      
      assert.ok(review.score > 0);
      assert.ok(review.strengths.length > 0);
      assert.ok(review.weaknesses.length > 0);
      assert.ok(review.risks.length > 0);
      assert.ok(review.improvements.length > 0);
      assert.ok(review.compliance);
    });
  });

  describe('Diagrams Creation', () => {
    it('should create C4 context diagram', () => {
      daedalus.identifyExternalElements = mock.fn(() => [
        { id: 'user', type: 'Person', name: 'User' }
      ]);
      
      daedalus.identifyContextRelationships = mock.fn(() => [
        { from: 'user', to: 'system', type: 'uses' }
      ]);
      
      const architecture = { name: 'Test System' };
      const diagram = daedalus.createContextDiagram(architecture);
      
      assert.equal(diagram.type, 'C4-Context');
      assert.ok(diagram.elements.some(e => e.id === 'system'));
      assert.ok(diagram.relationships);
    });
  });

  describe('Message Processing', () => {
    it('should handle architecture commands', async () => {
      const message = {
        content: {
          command: 'analyze',
          args: 'Build scalable e-commerce platform'
        }
      };
      
      daedalus.commands.analyze = mock.fn(async () => ({ analyzed: true }));
      const result = await daedalus.processMessage(message);
      
      assert.equal(daedalus.commands.analyze.mock.calls.length, 1);
    });

    it('should handle architecture requests', async () => {
      const message = {
        content: {
          type: 'architecture-request',
          requestType: 'design',
          context: { name: 'New System' }
        }
      };
      
      daedalus.createSystemArchitecture = mock.fn(async () => ({ created: true }));
      const result = await daedalus.processMessage(message);
      
      assert.equal(daedalus.createSystemArchitecture.mock.calls.length, 1);
    });

    it('should handle unknown architecture request types', async () => {
      const message = {
        content: {
          type: 'architecture-request',
          requestType: 'unknown'
        }
      };
      
      const result = await daedalus.processMessage(message);
      assert.ok(result.error);
    });
  });

  describe('Help Information', () => {
    it('should provide comprehensive help', () => {
      const help = daedalus.getArchitectureHelp();
      
      assert.equal(help.name, 'Daedalus - System Architect');
      assert.ok(help.philosophy);
      assert.ok(help.commands);
      assert.ok(help.patterns.includes('microservices'));
      assert.ok(help.principles.includes('SOLID'));
    });
  });
});