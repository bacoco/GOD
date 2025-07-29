#!/usr/bin/env node

/**
 * Test the industry context understanding capabilities
 */

import { PantheonCore } from './gods/lib/pantheon-core.js';
import { MCPAdapter } from './gods/lib/mcp-adapter.js';

async function testIndustryUnderstanding() {
  console.log('🏢 Testing Industry Context Understanding\n');
  
  const pantheon = new PantheonCore();
  await pantheon.initialize();
  const adapter = new MCPAdapter(pantheon);
  
  // Test cases for industry understanding
  const industryTests = [
    {
      message: "We're a fintech startup building a payment platform",
      expectedIndustry: "Financial Services",
      expectedCompliance: ['PCI DSS', 'SOX compliance', 'Financial regulations'],
      expectedSecurity: ['Transaction security', 'Fraud detection', 'Data encryption']
    },
    {
      message: "Building a healthcare app for patient management",
      expectedIndustry: "Healthcare",
      expectedCompliance: ['HIPAA compliance required'],
      expectedSecurity: ['Patient data encryption', 'Access control', 'Audit trails']
    },
    {
      message: "E-commerce marketplace for handmade goods",
      expectedIndustry: "E-commerce/Retail",
      expectedCompliance: ['PCI DSS for payments'],
      expectedSpecial: ['Inventory management', 'Order processing', 'Shopping cart']
    },
    {
      message: "Educational platform for university students",
      expectedIndustry: "Education",
      expectedCompliance: ['FERPA compliance', 'COPPA for minors'],
      expectedData: ['Student records', 'Grade information']
    },
    {
      message: "Government portal for municipal services",
      expectedIndustry: "Government/Public Sector",
      expectedCompliance: ['FedRAMP', 'FISMA compliance', 'Section 508 accessibility'],
      expectedSecurity: ['High security standards', 'Data sovereignty', 'Access controls']
    },
    {
      message: "Law firm case management system",
      expectedIndustry: "Legal",
      expectedCompliance: ['Attorney-client privilege', 'Legal hold requirements'],
      expectedSpecial: ['Document management', 'Case tracking', 'Time billing']
    },
    {
      message: "Real estate property listing platform",
      expectedIndustry: "Real Estate",
      expectedCompliance: ['Fair Housing Act', 'RESPA compliance'],
      expectedSpecial: ['Property listings', 'Virtual tours', 'Document management']
    },
    {
      message: "Insurance claims processing system",
      expectedIndustry: "Insurance",
      expectedCompliance: ['State insurance regulations', 'HIPAA (if health insurance)'],
      expectedSpecial: ['Claims processing', 'Policy management', 'Risk assessment']
    }
  ];
  
  console.log('Testing direct extraction:');
  let passCount = 0;
  for (const test of industryTests) {
    const result = adapter.extractIndustryContext(test.message);
    const industryMatch = result.industry === test.expectedIndustry;
    
    console.log(`${industryMatch ? '✅' : '❌'} "${test.message}"`);
    console.log(`   Industry: ${result.industry} (expected: ${test.expectedIndustry})`);
    
    if (test.expectedCompliance) {
      const complianceMatch = test.expectedCompliance.every(c => result.compliance.includes(c));
      console.log(`   Compliance: ${complianceMatch ? '✓' : '✗'} ${result.compliance.length} items`);
    }
    
    if (test.expectedSecurity) {
      const securityMatch = test.expectedSecurity.every(s => result.securityNeeds.includes(s));
      console.log(`   Security: ${securityMatch ? '✓' : '✗'} ${result.securityNeeds.length} items`);
    }
    
    if (industryMatch) passCount++;
    console.log('');
  }
  
  console.log(`Passed ${passCount}/${industryTests.length} industry detection tests\n`);
  
  // Test in conversation context
  console.log('📝 Testing in conversation context:\n');
  
  const init = await adapter.handleInit({
    idea: "Platform for our company"
  });
  
  // Test industry extraction in conversation
  await adapter.handleRespond({
    sessionId: init.sessionId,
    message: "We're a healthcare provider network managing patient records"
  });
  
  const session = adapter.activeSessions.get(init.sessionId);
  if (session.requirements.industry) {
    console.log('Industry detected:', session.requirements.industry.industry);
    console.log('Compliance requirements:', session.requirements.industry.compliance);
    console.log('Security needs:', session.requirements.industry.securityNeeds);
    console.log('Special requirements:', session.requirements.industry.specialRequirements);
    console.log('Data handling:', session.requirements.industry.dataHandling);
  } else {
    console.log('No industry detected');
  }
  
  // Test how it affects proposals
  console.log('\n🏗️ Testing industry impact on architecture:\n');
  
  const init2 = await adapter.handleInit({
    idea: "Customer management system"
  });
  
  await adapter.handleRespond({
    sessionId: init2.sessionId,
    message: "We're a fintech company handling payment processing"
  });
  
  await adapter.handleRespond({
    sessionId: init2.sessionId,
    message: "About 50 employees, need it in 2 months"
  });
  
  await adapter.handleRespond({
    sessionId: init2.sessionId,
    message: "Need secure payment handling and fraud detection"
  });
  
  const session2 = adapter.activeSessions.get(init2.sessionId);
  console.log('Industry context applied:');
  console.log('- Industry:', session2.requirements.industry?.industry);
  console.log('- Compliance:', session2.requirements.industry?.compliance);
  console.log('- Zeus should now consider financial regulations in the proposal');
  
  console.log('\n✅ Industry understanding test completed!');
  process.exit();
}

testIndustryUnderstanding();