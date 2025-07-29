#!/usr/bin/env node

/**
 * Test the technology context understanding capabilities
 */

import { PantheonCore } from './gods/lib/pantheon-core.js';
import { MCPAdapter } from './gods/lib/mcp-adapter.js';

async function testTechnologyUnderstanding() {
  console.log('🛠️ Testing Technology Context Understanding\n');
  
  const pantheon = new PantheonCore();
  await pantheon.initialize();
  const adapter = new MCPAdapter(pantheon);
  
  // Test cases for technology understanding
  const techTests = [
    {
      message: "We prefer Python for the backend",
      expected: {
        preferences: ['python preferred'],
        constraints: [],
        existing: [],
        avoid: []
      }
    },
    {
      message: "Must use AWS for hosting due to company policy",
      expected: {
        preferences: ['AWS cloud'],
        constraints: ['Must use AWS for hosting due to company policy'],
        existing: [],
        avoid: []
      }
    },
    {
      message: "We want a modern stack with React and Node.js",
      expected: {
        preferences: ['Modern tech stack', 'javascript preferred'],
        constraints: [],
        existing: [],
        avoid: []
      }
    },
    {
      message: "Looking for a no-code solution if possible",
      expected: {
        preferences: ['No-code solution preferred'],
        constraints: [],
        existing: [],
        avoid: []
      }
    },
    {
      message: "We have an existing Django system we need to integrate with",
      expected: {
        preferences: [],
        constraints: [],
        existing: ['Django'],
        avoid: []
      }
    },
    {
      message: "Please avoid PHP, we don't have expertise",
      expected: {
        preferences: [],
        constraints: [],
        existing: [],
        avoid: ['PHP']
      }
    },
    {
      message: "Need to migrate from our legacy Java system",
      expected: {
        preferences: [],
        constraints: ['Legacy system migration'],
        existing: [],
        avoid: []
      }
    },
    {
      message: "High performance is critical, we need real-time updates",
      expected: {
        preferences: [],
        constraints: ['High performance required', 'Real-time capabilities needed'],
        existing: [],
        avoid: []
      }
    },
    {
      message: "We're thinking serverless architecture on AWS",
      expected: {
        preferences: ['Serverless architecture', 'AWS cloud'],
        constraints: [],
        existing: [],
        avoid: []
      }
    }
  ];
  
  console.log('Testing direct extraction:');
  let passCount = 0;
  for (const test of techTests) {
    const result = adapter.extractTechnologyContext(test.message);
    const passed = JSON.stringify(result) === JSON.stringify(test.expected);
    if (passed) passCount++;
    
    console.log(`${passed ? '✅' : '❌'} "${test.message}"`);
    if (!passed) {
      console.log(`   Expected: ${JSON.stringify(test.expected)}`);
      console.log(`   Got:      ${JSON.stringify(result)}`);
    }
    console.log('');
  }
  
  console.log(`Passed ${passCount}/${techTests.length} tests\n`);
  
  // Test in conversation context
  console.log('📝 Testing in conversation context:\n');
  
  const init = await adapter.handleInit({
    idea: "Project management tool for our team"
  });
  
  // Test technology extraction in conversation
  await adapter.handleRespond({
    sessionId: init.sessionId,
    message: "We're a Python shop, prefer Django for backend"
  });
  
  await adapter.handleRespond({
    sessionId: init.sessionId,
    message: "Must use AWS, and we want to avoid any PHP frameworks"
  });
  
  await adapter.handleRespond({
    sessionId: init.sessionId,
    message: "We have an existing PostgreSQL database we need to work with"
  });
  
  const session = adapter.activeSessions.get(init.sessionId);
  console.log('Technology context extracted:');
  console.log('Preferences:', session.requirements.technology.preferences);
  console.log('Constraints:', session.requirements.technology.constraints);
  console.log('Existing:', session.requirements.technology.existing);
  console.log('Avoid:', session.requirements.technology.avoid);
  
  console.log('\n✅ Technology understanding test completed!');
  process.exit();
}

testTechnologyUnderstanding();