#!/usr/bin/env node

/**
 * Comprehensive test for all NLU understanding functions
 */

import { PantheonCore } from './gods/lib/pantheon-core.js';
import { MCPAdapter } from './gods/lib/mcp-adapter.js';

async function testComprehensiveUnderstanding() {
  console.log('🧠 Comprehensive Natural Language Understanding Test\n');
  
  const pantheon = new PantheonCore();
  await pantheon.initialize();
  const adapter = new MCPAdapter(pantheon);
  
  // Test scenarios that combine multiple understanding aspects
  const scenarios = [
    {
      name: "Healthcare Startup Scenario",
      messages: [
        "We need a patient management system",
        "We're a Series A healthcare startup with 35 employees",
        "Team is distributed across US and Europe",
        "Budget is around $150k for the MVP",
        "We prefer Python and need to integrate with our existing Django API",
        "Must be HIPAA compliant with strong security"
      ],
      expectedUnderstanding: {
        budget: "$150k budget",
        industry: "Healthcare",
        teamSize: "35 people - Mid-size team",
        teamStructure: "Distributed/Remote",
        technologyPreferences: ["python preferred"],
        technologyExisting: ["Django"],
        compliance: ["HIPAA compliance required"]
      }
    },
    {
      name: "Enterprise Fintech Scenario",
      messages: [
        "Building a new payment processing platform",
        "We're a Fortune 500 financial services company",
        "200+ engineers across multiple offices",
        "Need enterprise-grade security and real-time processing",
        "Must use AWS due to company policy",
        "Avoid any legacy COBOL systems"
      ],
      expectedUnderstanding: {
        budget: "Enterprise budget - Premium solutions viable",
        industry: "Financial Services",
        teamSize: "200 people - Large organization",
        technologyConstraints: ["Must use AWS due to company policy", "Real-time capabilities needed"],
        technologyAvoid: ["COBOL"],
        compliance: ["PCI DSS", "SOX compliance"]
      }
    },
    {
      name: "Bootstrapped E-commerce Startup",
      messages: [
        "We want to build an online marketplace",
        "Small team of 5 developers working remotely",
        "We're bootstrapped, need to keep costs low",
        "Looking for a no-code solution if possible",
        "Selling handmade crafts to US customers"
      ],
      expectedUnderstanding: {
        budget: "Bootstrapped - Limited budget",
        industry: "E-commerce/Retail",
        teamSize: "5 people - Small startup team",
        teamStructure: "Distributed/Remote",
        technologyPreferences: ["No-code solution preferred"],
        compliance: ["PCI DSS for payments"]
      }
    },
    {
      name: "Education Tech Scale-up",
      messages: [
        "Educational platform for K-12 students",
        "Series B company with 80 employees",
        "Engineering team of 30 developers and 5 designers",
        "Fast-growing, doubling every year",
        "Need to handle millions of students",
        "Existing React frontend we want to keep"
      ],
      expectedUnderstanding: {
        budget: "Series B funded ($30-80M typical)",
        industry: "Education",
        teamSize: "80 people - Large organization",
        teamComposition: ["Engineering team", "Design team"],
        teamStage: "Scaling startup",
        technologyExisting: ["React"],
        compliance: ["FERPA compliance", "COPPA for minors"]
      }
    }
  ];
  
  console.log('Running comprehensive scenarios:\n');
  
  for (const scenario of scenarios) {
    console.log(`📋 ${scenario.name}`);
    console.log('=' + '='.repeat(scenario.name.length + 3) + '\n');
    
    // Initialize new session for each scenario
    const init = await adapter.handleInit({
      idea: scenario.messages[0]
    });
    
    // Send all messages
    for (let i = 1; i < scenario.messages.length; i++) {
      await adapter.handleRespond({
        sessionId: init.sessionId,
        message: scenario.messages[i]
      });
    }
    
    // Get final session state
    const session = adapter.activeSessions.get(init.sessionId);
    
    // Verify understanding
    console.log('📊 Extracted Understanding:');
    console.log('Budget:', session.requirements.budget || 'Not detected');
    console.log('Industry:', session.requirements.industry?.industry || 'Not detected');
    console.log('Team Size:', session.requirements.team?.size || 'Not detected');
    console.log('Team Structure:', session.requirements.team?.structure || 'Not detected');
    console.log('Team Stage:', session.requirements.team?.stage || 'Not detected');
    console.log('Tech Preferences:', session.requirements.technology?.preferences || []);
    console.log('Tech Constraints:', session.requirements.technology?.constraints || []);
    console.log('Tech Existing:', session.requirements.technology?.existing || []);
    console.log('Tech Avoid:', session.requirements.technology?.avoid || []);
    console.log('Compliance:', session.requirements.industry?.compliance || []);
    
    // Check expectations
    console.log('\n🎯 Validation:');
    let passed = 0;
    let total = 0;
    
    for (const [key, expected] of Object.entries(scenario.expectedUnderstanding)) {
      total++;
      let actual;
      let match = false;
      
      switch(key) {
        case 'budget':
          actual = session.requirements.budget;
          match = actual === expected;
          break;
        case 'industry':
          actual = session.requirements.industry?.industry;
          match = actual === expected;
          break;
        case 'teamSize':
          actual = session.requirements.team?.size;
          match = actual === expected;
          break;
        case 'teamStructure':
          actual = session.requirements.team?.structure;
          match = actual === expected;
          break;
        case 'teamStage':
          actual = session.requirements.team?.stage;
          match = actual === expected;
          break;
        case 'teamComposition':
          actual = session.requirements.team?.composition || [];
          match = expected.every(e => actual.includes(e));
          break;
        case 'technologyPreferences':
          actual = session.requirements.technology?.preferences || [];
          match = expected.every(e => actual.includes(e));
          break;
        case 'technologyConstraints':
          actual = session.requirements.technology?.constraints || [];
          match = expected.every(e => actual.includes(e));
          break;
        case 'technologyExisting':
          actual = session.requirements.technology?.existing || [];
          match = expected.every(e => actual.includes(e));
          break;
        case 'technologyAvoid':
          actual = session.requirements.technology?.avoid || [];
          match = expected.every(e => actual.includes(e));
          break;
        case 'compliance':
          actual = session.requirements.industry?.compliance || [];
          match = expected.every(e => actual.includes(e));
          break;
      }
      
      if (match) passed++;
      console.log(`${match ? '✅' : '❌'} ${key}: ${match ? 'Correct' : `Expected "${expected}", got "${actual}"`}`);
    }
    
    console.log(`\nScenario Score: ${passed}/${total} (${Math.round(passed/total * 100)}%)`);
    console.log('\n' + '-'.repeat(50) + '\n');
  }
  
  // Test edge cases
  console.log('🔧 Testing Edge Cases:\n');
  
  const edgeCases = [
    {
      name: "Contradictory budget information",
      messages: [
        "We have unlimited budget",
        "Actually, we're bootstrapped and need to minimize costs"
      ],
      check: (session) => session.requirements.budget === "Bootstrapped - Limited budget"
    },
    {
      name: "Multiple technology mentions",
      messages: [
        "We use Python, Node.js, and React",
        "Want to avoid PHP and Ruby",
        "Must integrate with existing Java services"
      ],
      check: (session) => {
        const tech = session.requirements.technology;
        return tech.preferences.includes('python preferred') &&
               tech.preferences.includes('javascript preferred') &&
               tech.avoid.includes('PHP') &&
               tech.avoid.includes('Ruby') &&
               tech.existing.includes('Java');
      }
    },
    {
      name: "Complex team description",
      messages: [
        "We have engineers in SF, designers in NY, and product team in London",
        "Total of 45 people across all offices",
        "Growing fast, just closed Series A"
      ],
      check: (session) => {
        const team = session.requirements.team;
        return team.size === "45 people - Mid-size team" &&
               team.structure === "Distributed/Remote" &&
               team.composition.includes("Engineering team") &&
               team.composition.includes("Design team") &&
               team.composition.includes("Product team") &&
               team.stage === "Scaling startup";
      }
    }
  ];
  
  for (const testCase of edgeCases) {
    const init = await adapter.handleInit({ idea: "Test project" });
    
    for (const message of testCase.messages) {
      await adapter.handleRespond({ sessionId: init.sessionId, message });
    }
    
    const session = adapter.activeSessions.get(init.sessionId);
    const passed = testCase.check(session);
    
    console.log(`${passed ? '✅' : '❌'} ${testCase.name}`);
  }
  
  console.log('\n✅ Comprehensive understanding test completed!');
  process.exit();
}

testComprehensiveUnderstanding();