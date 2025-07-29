#!/usr/bin/env node

/**
 * Test the team context understanding capabilities
 */

import { PantheonCore } from './gods/lib/pantheon-core.js';
import { MCPAdapter } from './gods/lib/mcp-adapter.js';

async function testTeamUnderstanding() {
  console.log('👥 Testing Team Context Understanding\n');
  
  const pantheon = new PantheonCore();
  await pantheon.initialize();
  const adapter = new MCPAdapter(pantheon);
  
  // Test cases for team understanding
  const teamTests = [
    {
      message: "We're a team of 5 developers working remotely",
      expectedSize: "5 people - Small startup team",
      expectedStructure: "Distributed/Remote",
      expectedComposition: ["Engineering team"],
      expectedImplications: ["Need simple processes", "Async communication important"]
    },
    {
      message: "Our company has 150 employees across multiple offices",
      expectedSize: "150 people - Large organization",
      expectedStructure: null,
      expectedComposition: [],
      expectedImplications: ["Enterprise needs", "Multiple departments"]
    },
    {
      message: "Small team of 10, mostly engineers and designers",
      expectedSize: "10 people - Growing team",
      expectedStructure: null,
      expectedComposition: ["Engineering team", "Design team"],
      expectedImplications: ["Need collaboration tools"]
    },
    {
      message: "We're a Series A startup with 30 people",
      expectedSize: "30 people - Mid-size team",
      expectedStage: "Scaling startup",
      expectedImplications: ["Multiple teams", "Need scalable architecture"]
    },
    {
      message: "Distributed team across 3 time zones",
      expectedStructure: "Distributed/Remote",
      expectedImplications: ["Async communication important", "Time zone considerations"]
    },
    {
      message: "Early stage startup, just starting with 3 engineers",
      expectedSize: "3 people - Small startup team",
      expectedStage: "Early stage startup",
      expectedComposition: ["Engineering team"],
      expectedImplications: ["Need simple processes", "MVP focus"]
    },
    {
      message: "Enterprise company with cross-functional teams",
      expectedStage: "Enterprise",
      expectedStructure: "Cross-functional teams",
      expectedImplications: ["Enterprise requirements", "Need collaboration tools"]
    },
    {
      message: "Fast-growing team, doubling every 6 months",
      expectedImplications: ["Need scalable processes", "Onboarding important"]
    },
    {
      message: "20 person hybrid team with product managers and data scientists",
      expectedSize: "20 people - Growing team",
      expectedStructure: "Hybrid",
      expectedComposition: ["Product team", "Data team"],
      expectedImplications: ["Process standardization", "Mixed communication needs"]
    }
  ];
  
  console.log('Testing direct extraction:');
  let passCount = 0;
  for (const test of teamTests) {
    const result = adapter.extractTeamContext(test.message);
    let allPassed = true;
    
    // Check size
    if (test.expectedSize) {
      const sizeMatch = result.size === test.expectedSize;
      if (!sizeMatch) allPassed = false;
    }
    
    // Check stage
    if (test.expectedStage) {
      const stageMatch = result.stage === test.expectedStage;
      if (!stageMatch) allPassed = false;
    }
    
    // Check structure
    if (test.expectedStructure) {
      const structureMatch = result.structure === test.expectedStructure;
      if (!structureMatch) allPassed = false;
    }
    
    // Check composition
    if (test.expectedComposition) {
      const compositionMatch = test.expectedComposition.every(c => result.composition.includes(c));
      if (!compositionMatch) allPassed = false;
    }
    
    if (allPassed) passCount++;
    
    console.log(`${allPassed ? '✅' : '❌'} "${test.message}"`);
    if (result.size) console.log(`   Size: ${result.size}`);
    if (result.stage) console.log(`   Stage: ${result.stage}`);
    if (result.structure) console.log(`   Structure: ${result.structure}`);
    if (result.composition.length > 0) console.log(`   Composition: ${result.composition.join(', ')}`);
    if (result.implications.length > 0) console.log(`   Implications: ${result.implications.slice(0, 2).join(', ')}...`);
    console.log('');
  }
  
  console.log(`Passed ${passCount}/${teamTests.length} team understanding tests\n`);
  
  // Test in conversation context
  console.log('📝 Testing in conversation context:\n');
  
  const init = await adapter.handleInit({
    idea: "Project management tool"
  });
  
  // Test team extraction in conversation
  await adapter.handleRespond({
    sessionId: init.sessionId,
    message: "We're a distributed team of 25 engineers and designers"
  });
  
  await adapter.handleRespond({
    sessionId: init.sessionId,
    message: "We're scaling fast, just raised Series B funding"
  });
  
  const session = adapter.activeSessions.get(init.sessionId);
  if (session.requirements.team) {
    console.log('Team context detected:');
    console.log('- Size:', session.requirements.team.size);
    console.log('- Stage:', session.requirements.team.stage);
    console.log('- Structure:', session.requirements.team.structure);
    console.log('- Composition:', session.requirements.team.composition);
    console.log('- Implications:', session.requirements.team.implications);
  } else {
    console.log('No team context detected');
  }
  
  // Test how it affects proposals
  console.log('\n🏗️ Testing team impact on architecture:\n');
  
  const init2 = await adapter.handleInit({
    idea: "Internal communication platform"
  });
  
  await adapter.handleRespond({
    sessionId: init2.sessionId,
    message: "We have 200 employees distributed across 5 offices"
  });
  
  await adapter.handleRespond({
    sessionId: init2.sessionId,
    message: "Need something that works for our hybrid teams"
  });
  
  const session2 = adapter.activeSessions.get(init2.sessionId);
  console.log('Team context applied:');
  console.log('- Size:', session2.requirements.team?.size);
  console.log('- Structure:', session2.requirements.team?.structure);
  console.log('- Zeus should now consider enterprise needs and hybrid communication in the proposal');
  
  console.log('\n✅ Team understanding test completed!');
  process.exit();
}

testTeamUnderstanding();