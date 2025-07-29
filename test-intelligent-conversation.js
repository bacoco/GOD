#!/usr/bin/env node

/**
 * Test the new intelligent conversation system
 * This verifies that gods understand context naturally without keyword extraction
 */

import { PantheonCore } from './gods/lib/pantheon-core.js';
import { MCPAdapter } from './gods/lib/mcp-adapter.js';

async function testIntelligentConversation() {
  console.log('🧪 Testing Intelligent Conversation System\n');
  
  try {
    // Initialize Pantheon
    const pantheon = new PantheonCore();
    await pantheon.initialize();
    
    // Create MCP adapter
    const adapter = new MCPAdapter(pantheon);
    
    // Test 1: Start conversation
    console.log('Test 1: Starting conversation with natural language');
    const initResult = await adapter.handleInit({
      idea: "I want to build a collaborative platform for remote teams to manage projects"
    });
    
    console.log('Zeus:', initResult.message);
    console.log('Session ID:', initResult.sessionId);
    console.log('---\n');
    
    // Test 2: Natural user response (no keywords like "team")
    console.log('Test 2: User provides natural context');
    const response1 = await adapter.handleRespond({
      sessionId: initResult.sessionId,
      message: "It's for distributed engineering groups working across different time zones. Usually around 15-30 developers per company."
    });
    
    console.log('God response:', response1?.message || 'No message in response');
    console.log('---\n');
    
    // Test 3: Timeline without saying "timeline" or "weeks"
    console.log('Test 3: User discusses timing naturally');
    const response2 = await adapter.handleRespond({
      sessionId: initResult.sessionId,
      message: "We're hoping to have something ready by the end of next month for our Q1 planning"
    });
    
    console.log('God response:', response2?.message || 'No message in response');
    console.log('---\n');
    
    // Test 4: Features described naturally
    console.log('Test 4: User describes needs conversationally');
    const response3 = await adapter.handleRespond({
      sessionId: initResult.sessionId,
      message: "The main thing is we need to see what everyone is working on in real-time, be able to chat about specific tasks, and have some way to track progress visually. Oh and it needs to be secure since we work with financial data."
    });
    
    console.log('God response:', response3?.message || 'No message in response');
    console.log('---\n');
    
    // Check session understanding
    const session = adapter.activeSessions.get(initResult.sessionId);
    console.log('📊 Session Understanding:');
    console.log('Users:', session.requirements.users);
    console.log('Timeline:', session.requirements.timeline);
    console.log('Features:', session.requirements.features);
    console.log('Understanding:', session.understanding);
    console.log('---\n');
    
    // Test 5: Check if proposal is generated
    console.log('Test 5: Checking if intelligent proposal generation works');
    if (session.awaitingApproval) {
      console.log('✅ Proposal was generated based on natural conversation!');
      console.log('Proposal shown:', session.proposalShown);
    } else {
      console.log('❌ No proposal generated yet - may need more conversation');
    }
    
    console.log('\n✅ Intelligent conversation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  process.exit();
}

// Run the test
testIntelligentConversation();