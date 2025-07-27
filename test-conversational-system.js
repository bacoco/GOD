#!/usr/bin/env node

/**
 * Test script for conversational system
 * Verifies all components work correctly
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';

// Import Pantheon components
import { PantheonCore } from './gods/lib/pantheon-core.js';
import { ConversationalSession } from './gods/lib/conversational/conversational-session.js';
import { SessionStore } from './gods/lib/conversational/session-store.js';
import { ConversationalAgentFactory } from './gods/lib/conversational/conversational-agent-factory.js';
import { ConversationalUX } from './gods/lib/conversational/conversational-ux.js';
import { ConversationRecovery } from './gods/lib/conversational/conversation-recovery.js';
import { EnhancedDivineMessenger } from './gods/lib/enhanced-divine-messenger.js';
import { ConversationalBaseGod } from './gods/lib/conversational/conversational-base-god.js';
import { applyConversationalMixin } from './gods/lib/conversational/conversational-god-mixin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

function logTest(name, success, error = null) {
  if (success) {
    console.log(chalk.green(`✅ ${name}`));
    testResults.passed++;
  } else {
    console.log(chalk.red(`❌ ${name}`));
    if (error) console.log(chalk.red(`   Error: ${error.message}`));
    testResults.failed++;
    if (error) testResults.errors.push({ test: name, error: error.message });
  }
}

async function testConversationalSession() {
  console.log(chalk.blue('\n📝 Testing ConversationalSession...\n'));
  
  try {
    // Test 1: Create session
    const session = new ConversationalSession();
    logTest('Create conversational session', true);
    
    // Test 2: Add participant
    const mockGod = { name: 'zeus' };
    session.addParticipant(mockGod, 'orchestrator');
    logTest('Add participant to session', session.participants.has('zeus'));
    
    // Test 3: Update context
    await session.updateContext('zeus', {
      project: { name: 'Test Project' }
    }, 'Initial update');
    
    logTest('Update session context', session.context.project.name === 'Test Project');
    
    // Test 4: Get context for god
    const context = session.getContextForGod('zeus');
    logTest('Get context for god', context.full.project.name === 'Test Project');
    
    // Test 5: Record handoff
    const mockGod2 = { name: 'prometheus' };
    session.addParticipant(mockGod2, 'requirements');
    await session.recordHandoff(mockGod, mockGod2, { phase: 'requirements' });
    
    const lastEvent = session.timeline[session.timeline.length - 1];
    logTest('Record handoff between gods', lastEvent.type === 'handoff');
    
    // Test 6: Generate artifacts
    const artifacts = await session.generateArtifacts({
      includeConversationSummary: true
    });
    
    logTest('Generate session artifacts', !!artifacts.summary);
    
    return session;
    
  } catch (error) {
    logTest('Conversational session system', false, error);
    throw error;
  }
}

async function testSessionStore() {
  console.log(chalk.blue('\n💾 Testing SessionStore...\n'));
  
  try {
    // Test 1: Create store
    const store = new SessionStore({
      storePath: join(__dirname, '.test-sessions')
    });
    logTest('Create session store', true);
    
    // Test 2: Initialize store
    await store.initialize();
    logTest('Initialize session store', store.initialized);
    
    // Test 3: Create and save session
    const session = await store.createSession({
      user: { request: 'Test request' }
    });
    
    logTest('Create persistent session', !!session.id);
    
    // Test 4: Load session
    const loaded = await store.loadSession(session.id);
    logTest('Load session from store', loaded?.id === session.id);
    
    // Test 5: List sessions
    const list = await store.listSessions();
    logTest('List active sessions', list.length > 0);
    
    // Test 6: Get statistics
    const stats = await store.getStatistics();
    logTest('Get store statistics', stats.activeSessions > 0);
    
    // Cleanup
    await store.archiveSession(session.id);
    
    return store;
    
  } catch (error) {
    logTest('Session store system', false, error);
    throw error;
  }
}

async function testConversationalAgentFactory() {
  console.log(chalk.blue('\n🏭 Testing ConversationalAgentFactory...\n'));
  
  try {
    // Test 1: Create factory
    const factory = new ConversationalAgentFactory();
    logTest('Create agent factory', true);
    
    // Test 2: Create mock god
    const mockGod = {
      name: 'test-zeus',
      status: 'active',
      createSubAgent: async (id, config) => ({
        id,
        type: config.baseAgent || 'test',
        execute: async (task) => ({ success: true, task })
      })
    };
    
    // Test 3: Create conversational agent
    const agent = await factory.createConversationalAgent(
      mockGod,
      'test-conversation',
      {
        baseAgent: 'analyst',
        adaptations: { focus: 'Testing' }
      }
    );
    
    logTest('Create conversational agent', !!agent);
    logTest('Agent has debug info', !!agent.getDebugInfo);
    
    // Test 4: Execute with agent
    const result = await agent.execute({ action: 'test' });
    logTest('Execute agent task', result.success === true);
    
    // Test 5: Get agent by ID
    const retrieved = factory.getAgent(agent.spec.id);
    logTest('Retrieve agent by ID', retrieved === agent);
    
    // Test 6: Get factory statistics
    const stats = factory.getStatistics();
    logTest('Get factory statistics', stats.totalCreated > 0);
    
    return factory;
    
  } catch (error) {
    logTest('Agent factory system', false, error);
    throw error;
  }
}

async function testConversationalUX() {
  console.log(chalk.blue('\n🎨 Testing ConversationalUX...\n'));
  
  try {
    // Test 1: Create UX system
    const ux = new ConversationalUX();
    logTest('Create UX system', true);
    
    // Test 2: Initialize UX
    await ux.initialize();
    logTest('Initialize UX system', ux.initialized);
    
    // Test 3: Get persona
    const zeusPersona = ux.getPersona('zeus');
    logTest('Get god persona', !!zeusPersona && zeusPersona.name === 'Zeus');
    
    // Test 4: Generate handoff
    const handoff = ux.generateHandoff('zeus', 'prometheus', {
      reason: 'requirements gathering',
      previousWork: { phase: 'understanding' }
    });
    
    logTest('Generate handoff message', !!handoff.farewell && !!handoff.greeting);
    
    // Test 5: Show conversation plan
    const plan = await ux.showConversationPlan(null, {
      phases: ['Understanding', 'Requirements', 'Design'],
      estimatedTime: '15 minutes'
    });
    
    logTest('Show conversation plan', plan.phases.length === 3);
    
    // Test 6: Render progress
    const mockSession = {
      getCurrentSpeaker: () => 'zeus',
      getProgressPercentage: () => 50,
      getParticipantSummary: () => [
        { name: 'zeus', status: 'active', contributionCount: 5 }
      ],
      getUpcomingGods: () => ['prometheus'],
      createdAt: new Date()
    };
    
    const progress = ux.renderConversationProgress(mockSession);
    logTest('Render conversation progress', progress.progress.percentage === 50);
    
    return ux;
    
  } catch (error) {
    logTest('UX system', false, error);
    throw error;
  }
}

async function testConversationRecovery() {
  console.log(chalk.blue('\n🔧 Testing ConversationRecovery...\n'));
  
  try {
    // Test 1: Create recovery system
    const recovery = new ConversationRecovery();
    logTest('Create recovery system', true);
    
    // Test 2: Handle agent creation failure
    const mockSession = { id: 'test-session', getDebugReport: async () => ({}) };
    const mockAgent = { id: 'test-agent' };
    const error = new Error('agent creation failed');
    
    const result = await recovery.handleAgentFailure(
      mockSession,
      mockAgent,
      error
    );
    
    logTest('Handle agent failure', !!result && !!result.message);
    
    // Test 3: Classify error types
    const errorType = recovery.classifyError(new Error('timeout'));
    logTest('Classify error types', errorType === 'timeout');
    
    // Test 4: Get recovery statistics
    const stats = recovery.getStatistics();
    logTest('Get recovery statistics', typeof stats.totalFailures === 'number');
    
    return recovery;
    
  } catch (error) {
    logTest('Recovery system', false, error);
    throw error;
  }
}

async function testEnhancedMessenger() {
  console.log(chalk.blue('\n📨 Testing EnhancedDivineMessenger...\n'));
  
  try {
    // Test 1: Create enhanced messenger
    const mockPantheon = {
      config: {},
      gods: new Map()
    };
    
    const messenger = new EnhancedDivineMessenger(mockPantheon);
    logTest('Create enhanced messenger', true);
    
    // Test 2: Initialize messenger
    await messenger.initialize();
    logTest('Initialize enhanced messenger', true);
    
    // Test 3: Start conversational session
    const mockGod = { name: 'zeus' };
    const session = await messenger.startConversationalSession(
      mockGod,
      'Test topic'
    );
    
    logTest('Start conversational session', !!session.id);
    
    // Test 4: Get session
    const retrieved = messenger.getSession(session.id);
    logTest('Retrieve active session', retrieved === session);
    
    // Test 5: Generate handoff introduction
    const intro = messenger.generateHandoffIntroduction(
      { name: 'zeus' },
      { name: 'prometheus' },
      { reason: 'requirements' }
    );
    
    logTest('Generate handoff introduction', !!intro.farewell);
    
    return messenger;
    
  } catch (error) {
    logTest('Enhanced messenger', false, error);
    throw error;
  }
}

async function testConversationalGod() {
  console.log(chalk.blue('\n🏛️ Testing ConversationalGod...\n'));
  
  try {
    // Test 1: Create conversational god
    const god = new ConversationalBaseGod({
      name: 'test-god',
      config: {},
      ux: new ConversationalUX()
    });
    
    logTest('Create conversational god', true);
    
    // Test 2: Get conversational style
    const style = god.getDefaultConversationalStyle();
    logTest('Get conversational style', !!style.personality);
    
    // Test 3: Get conversational tools
    const tools = god.getConversationalTools();
    logTest('Get conversational tools', tools.includes('interactive-flow'));
    
    // Test 4: Test mixin application
    class TestGod {
      constructor() {
        this.name = 'mixin-test';
        this.config = {};
      }
    }
    
    applyConversationalMixin(TestGod);
    const mixinGod = new TestGod();
    
    logTest('Apply conversational mixin', typeof mixinGod.startConversation === 'function');
    
    return god;
    
  } catch (error) {
    logTest('Conversational god', false, error);
    throw error;
  }
}

async function testIntegration() {
  console.log(chalk.blue('\n🔗 Testing System Integration...\n'));
  
  try {
    // Create integrated system
    const pantheon = {
      config: { conversationalMode: true },
      gods: new Map(),
      conversationalUX: new ConversationalUX(),
      conversationalFactory: new ConversationalAgentFactory(),
      messenger: null
    };
    
    pantheon.messenger = new EnhancedDivineMessenger(pantheon);
    await pantheon.messenger.initialize();
    await pantheon.conversationalUX.initialize();
    
    logTest('Create integrated system', true);
    
    // Create a conversational god
    const zeus = new ConversationalBaseGod({
      name: 'zeus',
      config: {
        conversationalStyle: {
          personality: { traits: ['authoritative', 'wise'] }
        }
      },
      messenger: pantheon.messenger,
      ux: pantheon.conversationalUX,
      pantheon: pantheon
    });
    
    // Mock createSubAgent
    zeus.createSubAgent = async (id, config) => ({
      id,
      execute: async (task) => ({ 
        success: true, 
        content: 'Test response',
        task 
      })
    });
    
    await zeus.initialize();
    pantheon.gods.set('zeus', zeus);
    
    logTest('Initialize conversational Zeus', true);
    
    // Start a conversation
    const { session, agent } = await zeus.startConversation('Test project', {
      baseAgent: 'orchestrator'
    });
    
    logTest('Start Zeus conversation', !!session && !!agent);
    
    // Handle a conversational message
    const response = await zeus.handleConversation({
      content: 'What should we build?',
      from: 'user'
    }, session);
    
    logTest('Handle conversational message', !!response);
    
    // Test handoff capability
    const prometheus = new ConversationalBaseGod({
      name: 'prometheus',
      config: {},
      messenger: pantheon.messenger,
      ux: pantheon.conversationalUX,
      pantheon: pantheon
    });
    
    prometheus.createSubAgent = zeus.createSubAgent;
    await prometheus.initialize();
    pantheon.gods.set('prometheus', prometheus);
    
    // Perform handoff
    await zeus.handoffConversation(prometheus, session, 'requirements gathering');
    
    logTest('Handoff conversation between gods', session.participants.has('prometheus'));
    
    // End session
    await pantheon.messenger.endSession(session.id);
    logTest('End conversational session', !pantheon.messenger.sessions.has(session.id));
    
  } catch (error) {
    logTest('System integration', false, error);
    throw error;
  }
}

async function runAllTests() {
  console.log(chalk.bold.blue(`
╔═══════════════════════════════════════════════════════╗
║     Conversational System Test Suite                  ║
╚═══════════════════════════════════════════════════════╝
  `));
  
  try {
    // Run all test suites
    await testConversationalSession();
    await testSessionStore();
    await testConversationalAgentFactory();
    await testConversationalUX();
    await testConversationRecovery();
    await testEnhancedMessenger();
    await testConversationalGod();
    await testIntegration();
    
    // Summary
    console.log(chalk.bold.blue('\n📊 Test Summary:\n'));
    console.log(chalk.green(`✅ Passed: ${testResults.passed}`));
    console.log(chalk.red(`❌ Failed: ${testResults.failed}`));
    
    if (testResults.errors.length > 0) {
      console.log(chalk.red('\n❗ Errors:'));
      testResults.errors.forEach(({ test, error }) => {
        console.log(chalk.red(`   ${test}: ${error}`));
      });
    }
    
    // Overall result
    if (testResults.failed === 0) {
      console.log(chalk.bold.green('\n🎉 All tests passed! The conversational system is working correctly.'));
      console.log(chalk.cyan('\nNext steps:'));
      console.log('1. Run the demo: node examples/conversational-demo.js');
      console.log('2. Integrate with existing Pantheon gods');
      console.log('3. Create more conversational workflows');
    } else {
      console.log(chalk.bold.red('\n⚠️  Some tests failed. Please check the errors above.'));
    }
    
    // Cleanup test artifacts
    const fs = await import('fs/promises');
    try {
      await fs.rm(join(__dirname, '.test-sessions'), { recursive: true, force: true });
      await fs.rm(join(__dirname, '.pantheon'), { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }
    
  } catch (error) {
    console.error(chalk.red('\n💥 Test suite failed with error:'), error);
  }
}

// Run tests
runAllTests().catch(console.error);