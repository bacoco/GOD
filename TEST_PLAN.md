# Pantheon MCP Test Plan

## 🧪 Testing the Complete Conversation Flow

This document outlines how to test the Pantheon MCP integration to ensure all components work correctly.

## Prerequisites

- [ ] Pantheon repository cloned and dependencies installed
- [ ] MCP server configured in Claude
- [ ] Claude restarted after configuration
- [ ] Terminal ready for monitoring server logs

## Test Scenarios

### 1. Basic Server Startup Test

**Goal**: Verify MCP server starts correctly

```bash
# In terminal 1 - Monitor server
cd /Users/loic/develop/pantheon
node pantheon-mcp-server.js

# Expected output:
# 🏛️ Pantheon MCP Server
# Checking Claude-Flow installation...
# Summoning the gods...
# ✨ 17 gods ready to serve!
# Registering divine tools...
# 🏛️ Pantheon MCP Server Ready!
```

### 2. Command Availability Test

**Goal**: Verify slash commands appear in Claude

**In Claude:**
- Type `/` to see command list
- Verify these commands appear:
  - `/gods-init` - Initialize a new project
  - `/gods-chat` - Continue conversation
  - `/gods-council` - Convene divine council

### 3. Project Initialization Flow

**Goal**: Test complete Zeus initialization

**Test Case 1 - Simple Project:**
```
/gods-init
"I want to build a simple todo list app"
```

**Expected Flow:**
1. Zeus greets and acknowledges the project
2. Zeus asks clarifying questions:
   - Tech stack preferences?
   - User authentication needed?
   - Data persistence requirements?
3. Zeus summarizes understanding
4. Zeus suggests which gods to involve

**Test Case 2 - Complex Project:**
```
/gods-init
"I need an e-commerce platform with inventory management, payment processing, and real-time analytics"
```

**Expected Flow:**
1. Zeus identifies complexity
2. Multiple clarifying questions about:
   - Scale expectations
   - Payment providers
   - Analytics requirements
3. Zeus proposes phased approach
4. Suggests initial god consultation team

### 4. God Summoning Test

**Goal**: Verify specific gods can be summoned

**Test Cases:**
```
/gods-chat
"I need to speak with Apollo about UI design"

/gods-chat
"Summon Hephaestus for backend architecture"

/gods-chat  
"I need Aegis for security review"
```

**Expected**: Each god responds with their personality and expertise

### 5. Multi-God Conversation Test

**Goal**: Test natural conversation flow between gods

**Scenario:**
1. Start with Zeus: `/gods-init` "Building a real-time chat app"
2. Zeus brings in Apollo for UI
3. Apollo suggests design, Zeus summons Hephaestus
4. Hephaestus discusses backend with Hermes (real-time)
5. Natural handoffs between gods

**Success Criteria:**
- Smooth transitions between gods
- Context maintained across switches
- Each god maintains personality
- Relevant expertise demonstrated

### 6. Divine Council Test

**Goal**: Test council meeting functionality

**Test Each Council Type:**

```
/gods-council
1 (Architecture Review)
"Should we use microservices or monolith for our e-commerce platform?"
```

```
/gods-council
2 (Design Review)
"Review the proposed UI for mobile app"
```

```
/gods-council
5 (Sprint Planning)
"Plan the next 2-week sprint for chat app development"
```

**Expected**:
- Concilium facilitates
- Multiple gods participate
- Structured discussion
- Clear outcome/decision

### 7. Agent Creation Test

**Goal**: Verify gods can spawn real agents

**Test Flow:**
1. Initialize project with specific requirements
2. Let conversation progress to implementation phase
3. Observe when god says "I'll create an agent..."
4. Verify in server logs: "Spawning agent: [type]"
5. Check if agent receives correct tools from Vulcan

### 8. Tool Allocation Test

**Goal**: Test Vulcan's tool management

**Scenario:**
```
/gods-chat
"Hephaestus needs database and API tools for the backend"
```

**Expected**:
- Vulcan responds to tool request
- Appropriate tools allocated
- Constraints enforced (e.g., security tools need approval)

### 9. Session Persistence Test

**Goal**: Verify conversations persist

**Steps:**
1. Start project with `/gods-init`
2. Have multi-turn conversation
3. Close Claude
4. Reopen Claude
5. Use `/gods-chat` to continue
6. Verify context maintained

### 10. Error Handling Test

**Goal**: Test graceful error handling

**Test Cases:**

**Invalid Input:**
```
/gods-init
[Just press enter without description]
```

**Server Crash Recovery:**
1. Start conversation
2. Kill MCP server (Ctrl+C)
3. Try to continue conversation
4. Restart server
5. Resume conversation

**Invalid God Request:**
```
/gods-chat
"I need to speak with Thor" (non-existent god)
```

### 11. Performance Test

**Goal**: Verify responsive performance

**Metrics to Monitor:**
- Initial response time < 2 seconds
- God switching time < 1 second  
- Council convening < 3 seconds
- No memory leaks over extended conversation

### 12. Integration Test

**Goal**: Full end-to-end workflow

**Complete Scenario:**
1. `/gods-init` - Start task management project
2. Answer Zeus's questions
3. Apollo joins for design discussion
4. `/gods-council` - Architecture review
5. Hephaestus spawns backend agent
6. Athena spawns frontend agent
7. Themis creates testing agent
8. Monitor actual code generation
9. `/gods-chat` - Check progress
10. Session persists across restarts

## Debugging Commands

If issues arise, use these for debugging:

**Check MCP Tools:**
```
# In Claude, check if tools are registered:
List available MCP tools
```

**Manual Tool Test:**
```
# Test individual tools:
pantheon_init({ project_description: "test project" })
pantheon_respond({ message: "test message" })
```

**Server Logs:**
```bash
# Run with debug output:
NODE_ENV=development node pantheon-mcp-server.js
```

## Success Criteria

- [ ] All slash commands appear and function
- [ ] Zeus successfully initializes projects
- [ ] Gods can be summoned individually
- [ ] Natural conversation flow works
- [ ] Council meetings function properly
- [ ] Agents are created with correct tools
- [ ] Sessions persist across restarts
- [ ] Error handling is graceful
- [ ] Performance is responsive
- [ ] End-to-end workflow completes

## Reporting Issues

When reporting issues, include:
1. Exact command/input used
2. Expected behavior
3. Actual behavior
4. Server log output
5. Claude version
6. Node.js version

## Test Automation

For automated testing, create test scripts:

```javascript
// test-mcp-tools.js
import { MCPClient } from '@modelcontextprotocol/sdk';

async function testPantheonTools() {
  const client = new MCPClient();
  
  // Test tool listing
  const tools = await client.listTools();
  console.assert(tools.includes('pantheon_init'));
  
  // Test initialization
  const result = await client.callTool('pantheon_init', {
    project_description: 'Test project'
  });
  console.assert(result.greeting.includes('Zeus'));
  
  // More tests...
}
```

This comprehensive test plan ensures all aspects of the Pantheon MCP integration work correctly from basic functionality to complex multi-god workflows.