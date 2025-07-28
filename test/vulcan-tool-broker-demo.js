#!/usr/bin/env node

import { PantheonCore } from '../gods/lib/pantheon-core.js';

/**
 * Demonstration of Vulcan - The Divine Tool Broker
 * Shows how gods can conversationally discover and request tools
 */

async function demonstrateVulcanToolBroker() {
  console.log('=== Vulcan Tool Broker Demonstration ===\n');
  
  // Initialize pantheon
  const pantheon = new PantheonCore({});
  await pantheon.initialize();
  
  // Summon Vulcan (the tool broker)
  console.log('Summoning Vulcan - The Divine Tool Broker...');
  const vulcan = await pantheon.summonGod('vulcan');
  
  // Summon Hephaestus (who currently has limited tools)
  console.log('Summoning Hephaestus - The Divine Builder...');
  const hephaestus = await pantheon.summonGod('hephaestus');
  
  console.log('\n--- Current Tool Access ---');
  console.log(`Hephaestus current tools: ${hephaestus.tools.join(', ')}`);
  
  // Scenario 1: Tool Discovery Request
  console.log('\n--- Scenario 1: Tool Discovery ---');
  console.log('Hephaestus: "I need to analyze performance bottlenecks in my builds"');
  
  const discoveryResponse = await vulcan.handleMessage({
    from: 'hephaestus',
    content: 'I need to analyze performance bottlenecks in my builds',
    metadata: {}
  });
  
  console.log('\nVulcan\'s recommendations:');
  console.log(discoveryResponse.message);
  
  // Scenario 2: Tool Education Request
  console.log('\n--- Scenario 2: Tool Education ---');
  console.log('Hephaestus: "What\'s the difference between neural_train and neural_predict?"');
  
  const educationResponse = await vulcan.handleMessage({
    from: 'hephaestus',
    content: "What's the difference between neural_train and neural_predict?",
    metadata: {}
  });
  
  console.log('\nVulcan explains:');
  console.log(educationResponse.message);
  
  // Scenario 3: Access Grant Request
  console.log('\n--- Scenario 3: Tool Access Request ---');
  console.log('Hephaestus: "Grant me access to performance_report and bottleneck_analyze"');
  
  const accessResponse = await vulcan.handleMessage({
    from: 'hephaestus',
    content: 'Grant me access to performance_report and bottleneck_analyze',
    metadata: {}
  });
  
  console.log('\nVulcan\'s response:');
  console.log(accessResponse.message);
  
  // Check updated tool access
  const updatedTools = vulcan.accessManager.getGodTools('hephaestus');
  console.log(`\nHephaestus updated tools: ${updatedTools.join(', ')}`);
  
  // Scenario 4: Complex Request
  console.log('\n--- Scenario 4: Complex Tool Request ---');
  console.log('Hephaestus: "I want to build a distributed system with AI optimization"');
  
  const complexResponse = await vulcan.handleMessage({
    from: 'hephaestus',
    content: 'I want to build a distributed system with AI optimization',
    metadata: {}
  });
  
  console.log('\nVulcan\'s comprehensive recommendations:');
  console.log(complexResponse.message);
  
  // Show access statistics
  console.log('\n--- Access Statistics ---');
  const stats = vulcan.accessManager.getAccessStatistics();
  console.log('Total grants:', stats.totalGrants);
  console.log('Temporary grants:', stats.temporaryGrants);
  console.log('Permanent grants:', stats.permanentGrants);
  
  // Check if Hephaestus has access to a specific tool
  console.log('\n--- Access Verification ---');
  const hasAccess = vulcan.accessManager.hasAccess('hephaestus', 'performance_report');
  console.log(`Hephaestus has access to performance_report: ${hasAccess}`);
  
  // Demonstrate temporary access expiration
  console.log('\n--- Temporary Access Info ---');
  const accessLogs = vulcan.accessManager.getAccessLogs({ god: 'hephaestus' });
  accessLogs.forEach(log => {
    if (log.type === 'grant') {
      console.log(`Granted ${log.tools.length} tools at ${log.timestamp}`);
      log.tools.forEach(tool => {
        console.log(`  - ${tool.tool} (${tool.duration})`);
      });
    }
  });
  
  // Shutdown
  await pantheon.shutdown();
  console.log('\n=== Demonstration Complete ===');
}

// Run demonstration
demonstrateVulcanToolBroker().catch(console.error);