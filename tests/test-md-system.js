#!/usr/bin/env node

/**
 * Test script for MD-based dynamic agent system
 * Verifies that gods can create custom agents using Claude-Flow templates
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';
import path from 'path';

// Import Pantheon components directly for testing
import { PantheonCore } from './gods/lib/pantheon-core.js';
import { BaseGod } from './gods/lib/base-god.js';
import { AgentMDLoader } from './gods/lib/agent-md-loader.js';

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

async function testMDLoader() {
  console.log(chalk.blue('\n📚 Testing AgentMDLoader...\n'));
  
  try {
    // Test 1: Create loader
    const loader = new AgentMDLoader(path.join(__dirname, 'claude-flow'));
    logTest('Create AgentMDLoader instance', true);
    
    // Test 2: Initialize loader
    await loader.initialize();
    logTest('Initialize MD loader', loader.initialized);
    
    // Test 3: Get statistics
    const stats = loader.getStatistics();
    console.log(chalk.gray(`   Loaded ${stats.totalAgents} agents from ${stats.categories.length} categories`));
    logTest('Load Claude-Flow agents', stats.totalAgents > 0);
    
    // Test 4: Get specific agent
    const coderAgent = await loader.getAgent('coder');
    logTest('Get specific agent (coder)', !!coderAgent);
    
    // Test 5: Find agents by capability
    const testers = await loader.findAgentsByCapability('test');
    logTest('Find agents by capability', testers.length > 0);
    
    // Test 6: Recommend agents
    const recommendations = await loader.recommendAgentsForTask('Build a REST API');
    console.log(chalk.gray(`   Found ${recommendations.length} recommended agents`));
    logTest('Recommend agents for task', recommendations.length > 0);
    
    return loader;
    
  } catch (error) {
    logTest('MD Loader initialization', false, error);
    throw error;
  }
}

async function testCustomAgentCreation() {
  console.log(chalk.blue('\n🤖 Testing Custom Agent Creation...\n'));
  
  try {
    // Create a mock god for testing
    const mockGod = new BaseGod({
      name: 'test-zeus',
      claudeFlowPath: path.join(__dirname, 'claude-flow'),
      factory: {
        createSubAgent: async (god, type, spec) => ({
          id: `${type}-${Date.now()}`,
          type,
          specialization: spec,
          execute: async (task) => ({ success: true, result: 'Mock execution' })
        })
      }
    });
    
    await mockGod.initialize();
    logTest('Create mock god instance', true);
    
    // Test 1: Create custom agent with base
    try {
      const customCoder = await mockGod.createSubAgent('custom-coder', {
        baseAgent: 'coder',
        adaptations: {
          focus: 'Blockchain development',
          expertise: ['Solidity', 'Web3'],
          additionalInstructions: 'Always prioritize security'
        }
      });
      
      logTest('Create custom agent with baseAgent', !!customCoder);
      logTest('Custom agent has correct type', customCoder.type === 'custom-coder');
      logTest('Custom agent has heritage', customCoder.specialization.heritage.includes('coder'));
      
    } catch (error) {
      logTest('Create custom agent with baseAgent', false, error);
    }
    
    // Test 2: Create hybrid agent
    try {
      const hybrid = await mockGod.createSubAgent('test-hybrid', {
        baseAgents: ['coder', 'tester'],
        mergeStrategy: 'union',
        adaptations: {
          name: 'Test-Driven Developer',
          focus: 'TDD practices'
        }
      });
      
      logTest('Create hybrid agent with multiple bases', !!hybrid);
      logTest('Hybrid agent marked as custom', hybrid.specialization.isCustom === true);
      
    } catch (error) {
      logTest('Create hybrid agent', false, error);
    }
    
    // Test 3: Use predefined specialization
    try {
      const specialist = await mockGod.createSpecializedAgent('blockchain-developer');
      logTest('Create specialized agent', !!specialist);
      
    } catch (error) {
      logTest('Create specialized agent', false, error);
    }
    
    // Test 4: Test discovery functions
    try {
      const agents = await mockGod.discoverAgentsForTask('Build chat application');
      logTest('Discover agents for task', agents.length > 0);
      
      const byCapability = await mockGod.findAgentsByCapability('code');
      logTest('Find agents by capability', byCapability.length > 0);
      
    } catch (error) {
      logTest('Agent discovery functions', false, error);
    }
    
    return mockGod;
    
  } catch (error) {
    logTest('Custom agent creation setup', false, error);
    throw error;
  }
}

async function testMDGeneration() {
  console.log(chalk.blue('\n📝 Testing MD Generation...\n'));
  
  try {
    const { AgentMDGenerator } = await import('./gods/lib/agent-md-generator.js');
    const generator = new AgentMDGenerator();
    logTest('Create MD generator', true);
    
    // Test generating agent MD
    const agentSpec = {
      name: 'test-agent',
      type: 'developer',
      description: 'Test agent for MD generation',
      tools: ['github', 'desktop-commander'],
      baseAgent: 'coder',
      capabilities: ['code', 'test', 'debug'],
      specialization: {
        focus: 'Test-driven development',
        expertise: ['JavaScript', 'Testing']
      }
    };
    
    const md = await generator.generateAgentMD(agentSpec);
    logTest('Generate agent MD', md.length > 0);
    logTest('MD contains YAML frontmatter', md.includes('---'));
    logTest('MD contains agent name', md.includes('test-agent'));
    logTest('MD contains heritage section', md.includes('Heritage'));
    
    // Validate MD
    const validation = generator.validateMD(md);
    logTest('Validate generated MD', validation.valid);
    
  } catch (error) {
    logTest('MD generation', false, error);
  }
}

async function testAgentAdapter() {
  console.log(chalk.blue('\n🔄 Testing Agent Adapter...\n'));
  
  try {
    const { AgentAdapter } = await import('./gods/lib/agent-adapter.js');
    const { AgentMDLoader } = await import('./gods/lib/agent-md-loader.js');
    
    const adapter = new AgentAdapter();
    const loader = new AgentMDLoader(path.join(__dirname, 'claude-flow'));
    await loader.initialize();
    
    logTest('Create adapter and loader', true);
    
    // Test adapting single agent
    const coderAgent = await loader.getAgent('coder');
    if (coderAgent) {
      const adapted = await adapter.adaptAgent(coderAgent, {
        focus: 'Mobile development',
        expertise: ['React Native', 'iOS', 'Android'],
        tools: ['github', 'mobile-tools']
      });
      
      logTest('Adapt single agent', !!adapted);
      logTest('Adapted agent has new focus', adapted.instructions.includes('Mobile development'));
      logTest('Adapted agent has new tools', adapted.tools.includes('mobile-tools'));
    }
    
    // Test combining agents
    const agents = await Promise.all([
      loader.getAgent('coder'),
      loader.getAgent('tester')
    ]);
    
    if (agents.every(a => a)) {
      // Test different merge strategies
      const strategies = ['union', 'intersection', 'best-features'];
      
      for (const strategy of strategies) {
        try {
          const combined = await adapter.combineAgents(agents.filter(Boolean), {
            name: `test-${strategy}`,
            mergeStrategy: strategy
          });
          
          logTest(`Combine agents with ${strategy} strategy`, !!combined);
        } catch (error) {
          logTest(`Combine agents with ${strategy} strategy`, false, error);
        }
      }
    }
    
  } catch (error) {
    logTest('Agent adapter', false, error);
  }
}

async function runAllTests() {
  console.log(chalk.bold.blue(`
╔═══════════════════════════════════════════════════════╗
║     MD-Based Dynamic Agent System Test Suite          ║
╚═══════════════════════════════════════════════════════╝
  `));
  
  try {
    // Run all test suites
    await testMDLoader();
    await testCustomAgentCreation();
    await testMDGeneration();
    await testAgentAdapter();
    
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
      console.log(chalk.bold.green('\n🎉 All tests passed! The MD system is working correctly.'));
    } else {
      console.log(chalk.bold.red('\n⚠️  Some tests failed. Please check the errors above.'));
    }
    
  } catch (error) {
    console.error(chalk.red('\n💥 Test suite failed with error:'), error);
  }
}

// Run tests
runAllTests().catch(console.error);