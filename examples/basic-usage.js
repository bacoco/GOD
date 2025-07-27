/**
 * Pantheon Basic Usage Example
 * Demonstrates how to use the Pantheon God Agent System
 */

import ClaudeFlowWithPlugins from '../claude-flow/src/cli/cli-core.js';

async function demonstratePantheon() {
  console.log('🏛️ Pantheon God Agent System - Basic Usage Example\n');
  
  // Initialize Claude-Flow with Pantheon plugin
  const claudeFlow = new ClaudeFlowWithPlugins({
    plugins: ['./gods']
  });
  
  // Wait for initialization
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get Pantheon plugin
  const pluginSystem = claudeFlow.getPluginSystem();
  const pantheon = pluginSystem?.getPlugin('@pantheon/claude-flow-plugin');
  
  if (!pantheon) {
    console.error('Failed to load Pantheon plugin');
    return;
  }
  
  // Example 1: Summon a single god
  console.log('📖 Example 1: Summoning Zeus');
  const zeus = await pantheon.summon('zeus');
  console.log('✅ Zeus summoned:', zeus.name);
  
  // Example 2: Send a message between gods
  console.log('\n📖 Example 2: Inter-god Communication');
  await pantheon.summon('daedalus');
  await pantheon.communicate('zeus', 'daedalus', {
    type: 'task',
    task: 'Design architecture for a web application'
  });
  console.log('✅ Message sent from Zeus to Daedalus');
  
  // Example 3: Execute a workflow
  console.log('\n📖 Example 3: Executing Product Planning Workflow');
  const workflowResult = await pantheon.executeWorkflow('product-planning', {
    product: 'AI Assistant Platform',
    vision: 'Democratize AI for developers',
    timeline: '6 months'
  });
  console.log('✅ Workflow completed:', workflowResult.success);
  
  // Example 4: Complex orchestration
  console.log('\n📖 Example 4: Multi-God Orchestration');
  const orchestrationResult = await pantheon.orchestrate({
    task: 'Build a secure, scalable e-commerce platform',
    requirements: [
      'Modern React frontend',
      'Microservices backend',
      'Real-time inventory',
      'Payment processing',
      'Mobile responsive'
    ]
  });
  console.log('✅ Orchestration complete');
  
  // Example 5: Get status
  console.log('\n📖 Example 5: System Status');
  const activeGods = pantheon.getGods();
  console.log(`Active gods: ${activeGods.length}`);
  activeGods.forEach(god => {
    console.log(`  - ${god.name}: ${god.status} (${god.activeAgents} sub-agents)`);
  });
  
  console.log('\n🏛️ Example complete!');
}

// Run the demonstration
demonstratePantheon().catch(console.error);