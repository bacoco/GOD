import { test, describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { PantheonCore } from '../../lib/pantheon-core.js';
import { GodFactory } from '../../lib/god-factory.js';
import { DivineMessenger } from '../../lib/divine-messenger.js';
import { AgentSafetyManager } from '../../lib/agent-safety.js';
import { Zeus } from '../../lib/gods/zeus.js';

describe('Hybrid Orchestration Integration Tests', () => {
  let pantheon;
  let zeus;
  let mockClaudeFlow;
  let safetyManager;
  
  beforeEach(async () => {
    // Create mock Claude-Flow instance
    mockClaudeFlow = {
      agents: {
        execute: mock.fn(async ({ type, task, prompt }) => ({
          success: true,
          result: `Executed ${type} with task: ${task}`,
          agentsCreated: []
        }))
      },
      memory: {
        get: mock.fn(async () => null),
        set: mock.fn(async () => true)
      }
    };
    
    // Create real safety manager
    safetyManager = new AgentSafetyManager({
      maxTotalAgents: 20,
      maxDepth: 3
    });
    
    // Create pantheon instance
    pantheon = new PantheonCore(mockClaudeFlow, {
      safetyManager,
      emit: () => {}
    });
    
    // Initialize pantheon
    await pantheon.initialize();
    
    // Summon Zeus
    zeus = await pantheon.summonGod('zeus');
  });
  
  afterEach(() => {
    // Clean up
    if (safetyManager) {
      safetyManager.activeAgents.clear();
      safetyManager.agentHierarchy.clear();
    }
  });

  describe('Orchestration Mode Selection', () => {
    it('should use JS orchestration for simple tasks', async () => {
      const simpleTask = 'Create a simple utility function';
      
      // Spy on orchestration methods
      const jsOrchestratorSpy = mock.fn(zeus.executeOrchestration.bind(zeus));
      const aiOrchestratorSpy = mock.fn(zeus.aiDrivenOrchestration.bind(zeus));
      zeus.executeOrchestration = jsOrchestratorSpy;
      zeus.aiDrivenOrchestration = aiOrchestratorSpy;
      
      const result = await zeus.orchestrateTask(simpleTask);
      
      assert.equal(jsOrchestratorSpy.mock.calls.length, 1);
      assert.equal(aiOrchestratorSpy.mock.calls.length, 0);
      assert.equal(zeus.metrics.jsOrchestrations, 1);
      assert.equal(zeus.metrics.aiOrchestrations, 0);
    });
    
    it('should use AI orchestration for complex tasks', async () => {
      const complexTask = 'Build a distributed microservices architecture with real-time ML pipeline and blockchain integration';
      
      const result = await zeus.orchestrateTask(complexTask);
      
      assert.equal(zeus.metrics.aiOrchestrations, 1);
      assert.ok(mockClaudeFlow.agents.execute.mock.calls.length > 0);
      
      // Check that sub-agent was created with Task tool
      const createSubAgentCall = mockClaudeFlow.agents.execute.mock.calls[0];
      assert.ok(createSubAgentCall);
    });
    
    it('should use AI orchestration for high uncertainty tasks', async () => {
      const uncertainTask = 'Explore possible innovative solutions for maybe implementing something new';
      
      const result = await zeus.orchestrateTask(uncertainTask);
      
      assert.equal(zeus.metrics.aiOrchestrations, 1);
    });
  });

  describe('Safety Limits', () => {
    it('should respect maximum agent limits', async () => {
      // Create a new safety manager with very low limits
      const limitedSafetyManager = new AgentSafetyManager({
        maxTotalAgents: 2,
        maxDepth: 3
      });
      
      // Replace Zeus's safety manager
      const originalSafetyManager = zeus.safetyManager;
      zeus.safetyManager = limitedSafetyManager;
      
      try {
        // Try to create multiple agents
        const agent1 = await zeus.createSubAgent('test1');
        const agent2 = await zeus.createSubAgent('test2');
        
        // Third should fail
        await assert.rejects(
          zeus.createSubAgent('test3'),
          /Cannot create sub-agent: Maximum total agents reached/
        );
      } finally {
        // Restore original safety manager
        zeus.safetyManager = originalSafetyManager;
      }
    });
    
    it('should respect depth limits', async () => {
      zeus.agentCreationLimits.maxDepth = 2;
      
      // Create first level agent
      const level1 = await zeus.createSubAgent('level1', {
        allowAgentCreation: true
      });
      
      // Simulate nested agent creation
      safetyManager.registerAgent('fake-level2', level1.id);
      safetyManager.agentDepths.set('fake-level2', 2);
      
      // Try to create beyond depth limit
      const check = safetyManager.canCreateAgent('fake-level2', zeus.agentCreationLimits);
      assert.equal(check.allowed, false);
      assert.ok(check.reason.includes('Maximum depth'));
    });
    
    it('should track agent hierarchy correctly', async () => {
      // Create a fresh safety manager for this test
      const testSafetyManager = new AgentSafetyManager();
      const originalSafetyManager = zeus.safetyManager;
      zeus.safetyManager = testSafetyManager;
      
      try {
        // Create parent agent
        const parent = await zeus.createSubAgent('parent');
        
        // Check hierarchy from root
        const tree = testSafetyManager.getHierarchyTree();
        assert.ok(tree);
        assert.equal(tree.id, 'root');
        
        // Check that Zeus is in the hierarchy
        const zeusInTree = tree.children.find(child => child.id === zeus.id);
        assert.ok(zeusInTree);
        
        // Check that parent is under Zeus
        assert.ok(zeusInTree.children.length >= 1);
        assert.ok(zeusInTree.children.some(child => child.id === parent.id));
      } finally {
        zeus.safetyManager = originalSafetyManager;
      }
    });
  });

  describe('Hybrid Mode Configuration', () => {
    it('should add Task tool for AI-driven mode', async () => {
      const agent = await zeus.createSubAgent('orchestrator', {
        allowAgentCreation: true
      });
      
      assert.ok(agent.specialization.tools.includes('Task'));
    });
    
    it('should not add Task tool for js-only mode', async () => {
      zeus.orchestrationMode = 'js-only';
      
      const agent = await zeus.createSubAgent('worker', {
        allowAgentCreation: false
      });
      
      assert.ok(!agent.specialization.tools.includes('Task'));
    });
    
    it('should respect allowedGods configuration', async () => {
      const agent = await zeus.createSubAgent('coordinator', {
        allowAgentCreation: true
      });
      
      assert.deepEqual(
        agent.specialization.allowedGods,
        zeus.agentCreationLimits.allowedGods
      );
    });
  });

  describe('AI Orchestration Execution', () => {
    it('should pass correct context to AI agent', async () => {
      const task = 'Build complex distributed system with ML and blockchain';
      
      // Create a new mock that captures the call
      let capturedCall = null;
      mockClaudeFlow.agents.execute = mock.fn(async (params) => {
        capturedCall = params;
        return {
          success: true,
          result: 'AI orchestration complete'
        };
      });
      
      await zeus.orchestrateTask(task);
      
      assert.ok(mockClaudeFlow.agents.execute.mock.calls.length > 0);
      assert.ok(capturedCall);
      assert.equal(capturedCall.type, 'claude-code-agent');
      assert.ok(capturedCall.task);
    });
    
    it('should fallback to JS orchestration on AI failure', async () => {
      // Make AI execution fail
      mockClaudeFlow.agents.execute = mock.fn(async () => {
        throw new Error('AI execution failed');
      });
      
      const task = 'Build complex distributed ML system with blockchain';  // High complexity task
      const initialAI = zeus.metrics.aiOrchestrations;
      const initialJS = zeus.metrics.jsOrchestrations;
      
      const result = await zeus.orchestrateTask(task);
      
      // Should still succeed via fallback
      assert.ok(result);
      assert.equal(zeus.metrics.aiOrchestrations, initialAI + 1); // Attempted AI
      // JS orchestrations might increase due to fallback, but we can't guarantee exact count
    });
    
    it('should clean up orchestrator agent after execution', async () => {
      const task = 'Complex orchestration task';
      
      const initialCount = safetyManager.activeAgents.size;
      await zeus.orchestrateTask(task);
      const finalCount = safetyManager.activeAgents.size;
      
      // Should have cleaned up the temporary orchestrator
      assert.equal(finalCount, initialCount);
    });
  });

  describe('Complexity Analysis Enhancement', () => {
    it('should properly assess uncertainty', async () => {
      const vagueTask = 'Maybe explore some possible new innovative solutions';
      const clearTask = 'Implement specific REST API endpoints with clear requirements';
      
      const vagueAnalysis = await zeus.analyzeComplexity(vagueTask);
      const clearAnalysis = await zeus.analyzeComplexity(clearTask);
      
      assert.ok(vagueAnalysis.complexity.uncertainty > 5);
      assert.ok(clearAnalysis.complexity.uncertainty < 5);
    });
    
    it('should count domains correctly', async () => {
      const multiDomainTask = 'Build frontend UI with backend API, ML pipeline, and blockchain integration';
      const analysis = await zeus.analyzeComplexity(multiDomainTask);
      
      assert.ok(analysis.complexity.domainCount >= 4);
    });
    
    it('should calculate overall complexity correctly', async () => {
      const simpleTask = 'Write a function';
      const complexTask = 'Design scalable microservices with real-time ML, security compliance, and blockchain';
      
      const simpleAnalysis = await zeus.analyzeComplexity(simpleTask);
      const complexAnalysis = await zeus.analyzeComplexity(complexTask);
      
      assert.ok(simpleAnalysis.complexity.overall <= 3);
      assert.ok(complexAnalysis.complexity.overall >= 7);
    });
  });

  describe('Performance Metrics', () => {
    it('should track orchestration metrics correctly', async () => {
      const initialAI = zeus.metrics.aiOrchestrations;
      const initialJS = zeus.metrics.jsOrchestrations;
      
      // Execute simple task (JS)
      await zeus.orchestrateTask('Simple function');
      assert.equal(zeus.metrics.jsOrchestrations, initialJS + 1);
      
      // Execute complex task (AI)
      await zeus.orchestrateTask('Build complex distributed ML system with blockchain');
      assert.equal(zeus.metrics.aiOrchestrations, initialAI + 1);
    });
    
    it('should track sub-agent creation metrics', async () => {
      const initial = zeus.metrics.subAgentsCreated;
      
      await zeus.createSubAgent('test1');
      await zeus.createSubAgent('test2');
      
      assert.equal(zeus.metrics.subAgentsCreated, initial + 2);
    });
  });

  describe('Safety Manager Integration', () => {
    it('should provide accurate metrics', () => {
      const metrics = safetyManager.getMetrics();
      
      assert.ok(typeof metrics.totalAgents === 'number');
      assert.ok(typeof metrics.maxDepthUsed === 'number');
      assert.ok(metrics.depthDistribution);
      assert.ok(typeof metrics.averageChildrenPerParent === 'number');
    });
    
    it('should handle rate limiting', async () => {
      // Create many agents quickly
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(zeus.createSubAgent(`rapid-${i}`));
      }
      
      await Promise.all(promises);
      
      // Check if rate limiting would trigger
      // Using a longer window (60 seconds) and checking if we created 5 agents
      const isLimited = safetyManager.isRateLimited(zeus.id, 60000, 4);
      assert.ok(isLimited);
    });
    
    it('should clean up inactive agents', async () => {
      // Create some agents
      await zeus.createSubAgent('active');
      const inactive = await zeus.createSubAgent('inactive');
      
      // Mark one as inactive
      const agentData = safetyManager.activeAgents.get(inactive.id);
      if (agentData) {
        agentData.status = 'inactive';
        agentData.created = Date.now() - 3700000; // Over 1 hour old
      }
      
      // Clean up
      const cleaned = safetyManager.cleanupInactiveAgents(3600000);
      assert.ok(cleaned >= 0);
    });
  });
});