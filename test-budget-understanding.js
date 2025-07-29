#!/usr/bin/env node

/**
 * Test the budget understanding capabilities
 */

import { PantheonCore } from './gods/lib/pantheon-core.js';
import { MCPAdapter } from './gods/lib/mcp-adapter.js';

async function testBudgetUnderstanding() {
  console.log('💰 Testing Budget Understanding\n');
  
  const pantheon = new PantheonCore();
  await pantheon.initialize();
  const adapter = new MCPAdapter(pantheon);
  
  // Test cases for budget understanding
  const budgetTests = [
    {
      message: "We have a budget of $50k for this project",
      expected: "$50k budget"
    },
    {
      message: "Our budget is between 100k and 150k",
      expected: "$100k-$150k budget"
    },
    {
      message: "We're a Series A startup",
      expected: "Series A funded ($2-15M typical)"
    },
    {
      message: "We're bootstrapped and need to keep costs low",
      expected: "Bootstrapped - Limited budget"
    },
    {
      message: "We're a Fortune 500 company with enterprise budget",
      expected: "Enterprise budget - Premium solutions viable"
    },
    {
      message: "Just raised seed funding of $1.5M",
      expected: "Seed funded ($500k-2M typical)"
    },
    {
      message: "Cost is not a concern for this critical project",
      expected: "Flexible budget - Focus on best solution"
    },
    {
      message: "We're a nonprofit organization",
      expected: "Nonprofit - Budget-conscious"
    },
    {
      message: "Need an MVP within tight budget constraints",
      expected: "MVP budget - Focus on core features"
    }
  ];
  
  console.log('Testing direct extraction:');
  for (const test of budgetTests) {
    const result = adapter.extractBudget(test.message);
    const passed = result === test.expected;
    console.log(`${passed ? '✅' : '❌'} "${test.message}"`);
    console.log(`   Expected: ${test.expected}`);
    console.log(`   Got:      ${result || 'null'}`);
    console.log('');
  }
  
  // Test in conversation context
  console.log('\n📝 Testing in conversation context:\n');
  
  const init = await adapter.handleInit({
    idea: "E-commerce platform for our retail business"
  });
  
  // Test budget extraction in conversation
  const response1 = await adapter.handleRespond({
    sessionId: init.sessionId,
    message: "We're a Series B company with 200 employees"
  });
  
  const response2 = await adapter.handleRespond({
    sessionId: init.sessionId,
    message: "Timeline is 3 months, and we have allocated $200k for this project"
  });
  
  const session = adapter.activeSessions.get(init.sessionId);
  console.log('Budget extracted:', session.requirements.budget);
  console.log('Users extracted:', session.requirements.users);
  console.log('Timeline extracted:', session.requirements.timeline);
  
  console.log('\n✅ Budget understanding test completed!');
  process.exit();
}

testBudgetUnderstanding();