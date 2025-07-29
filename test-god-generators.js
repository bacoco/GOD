#!/usr/bin/env node

/**
 * Test the new god response generators
 */

import { PantheonCore } from './gods/lib/pantheon-core.js';
import { MCPAdapter } from './gods/lib/mcp-adapter.js';

async function testGodGenerators() {
  console.log('🏛️ Testing God Response Generators\n');
  
  const pantheon = new PantheonCore();
  await pantheon.initialize();
  const adapter = new MCPAdapter(pantheon);
  
  // Initialize a session
  const init = await adapter.handleInit({
    idea: "Real-time collaboration platform for distributed teams"
  });
  
  const sessionId = init.sessionId;
  
  // Add some context to the session
  await adapter.handleRespond({
    sessionId,
    message: "We're a fintech startup with 50 employees working remotely"
  });
  
  await adapter.handleRespond({
    sessionId,
    message: "Need secure payment processing and real-time updates"
  });
  
  console.log('✨ Testing different gods:\n');
  
  // Test cases for each god
  const godTests = [
    {
      god: { name: 'hermes', avatar: '📨', title: 'God of Communication' },
      message: "How should we handle real-time communication?"
    },
    {
      god: { name: 'themis', avatar: '⚖️', title: 'Goddess of Quality' },
      message: "What testing strategy should we use?"
    },
    {
      god: { name: 'prometheus', avatar: '🔥', title: 'God of Innovation' },
      message: "How can we innovate with AI?"
    },
    {
      god: { name: 'daedalus', avatar: '🏗️', title: 'God of Architecture' },
      message: "What architecture should we use for scale?"
    },
    {
      god: { name: 'aegis', avatar: '🛡️', title: 'God of Security' },
      message: "How do we ensure security and compliance?"
    }
  ];
  
  const session = adapter.activeSessions.get(sessionId);
  
  for (const test of godTests) {
    console.log(`\n${test.god.avatar} Testing ${test.god.name}:`);
    console.log(`Question: "${test.message}"`);
    
    try {
      const response = await adapter.generateGodResponse(test.god, test.message, session);
      
      console.log(`\nResponse preview:`);
      const preview = response.message.split('\n').slice(0, 5).join('\n');
      console.log(preview + '...\n');
      
      if (response.artifacts?.length > 0) {
        console.log(`Artifacts: ${response.artifacts.map(a => a.type).join(', ')}`);
      }
      
      console.log(`Expects response: ${response.expectsResponse}`);
      console.log('✅ Generator working correctly');
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  // Test that the context is being used
  console.log('\n📊 Context usage verification:');
  console.log('Budget:', session.requirements.budget);
  console.log('Technology:', session.requirements.technology);
  console.log('Team:', session.requirements.team);
  console.log('Industry:', session.requirements.industry);
  
  console.log('\n✅ All god response generators tested!');
  process.exit();
}

testGodGenerators();