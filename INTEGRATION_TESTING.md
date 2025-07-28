# Pantheon + Claude-Flow Integration Testing Guide

## Overview

This guide explains how to test the integration between Pantheon's conversational interface and Claude-Flow's agent orchestration system.

## Quick Test

Run the automated test script:

```bash
node test-integration.js
```

This will verify:
- All components load correctly
- Claude-Flow detection works
- Command routing functions properly
- Fallback mechanisms are in place

## Manual Testing

### 1. Test Basic Conversation (Standalone Mode)

```bash
# Test without Claude-Flow
./gods/bin/pantheon-claude init "a todo app"
```

Expected behavior:
- Conversational wizard starts
- Zeus asks discovery questions
- Other gods gather requirements
- Template-based project generation

### 2. Test with Claude-Flow Integration

First, ensure Claude-Flow is available:

```bash
# Check if Claude-Flow exists
ls ./claude-flow/src/index.js

# If not, clone it:
git clone [claude-flow-repo] ./claude-flow
```

Then test:

```bash
# Test with Claude-Flow
./gods/bin/pantheon-claude init "a todo app"
```

Expected behavior:
- Conversational wizard starts normally
- After requirements gathering, system detects Claude-Flow
- Message: "🏛️ Summoning the divine council to build your project..."
- Real agents are spawned (Zeus orchestrator)
- Progress updates shown in real-time
- Actual code generation by agents

### 3. Test Command Routing

Test various commands to ensure routing works:

```bash
# Conversational commands
./gods/bin/pantheon-claude status
./gods/bin/pantheon-claude help
./gods/bin/pantheon-claude summon zeus

# Should attempt Claude-Flow if available
./gods/bin/pantheon-claude spark "build a feature"
```

### 4. Test Fallback Mechanisms

Simulate Claude-Flow failure:

```bash
# Temporarily rename Claude-Flow directory
mv ./claude-flow ./claude-flow.bak

# Run command
./gods/bin/pantheon-claude init "test project"

# Should fall back to template generation
# Restore Claude-Flow
mv ./claude-flow.bak ./claude-flow
```

## Integration Points to Verify

### 1. **Command Detection**
- UnifiedCommandHandler correctly identifies command types
- Routes to appropriate handler (conversational vs Claude-Flow)

### 2. **Agent Spawning**
- When Claude-Flow is available, real agents are created
- Agent progress is streamed to console
- Multiple agents can work in parallel

### 3. **Context Bridging**
- Conversation data is passed to agents
- Project requirements become agent instructions
- Decisions are stored and shared

### 4. **Fallback Handling**
- System works without Claude-Flow
- Graceful degradation to templates
- No errors when Claude-Flow missing

## Debug Mode

Enable debug output for detailed logs:

```bash
DEBUG=1 ./gods/bin/pantheon-claude init "test app"
```

## Expected Console Output

### With Claude-Flow:
```
🏛️ Welcome to Pantheon - Where Gods Build Software

[Zeus]: Tell me about your project idea...
[User answers questions]

🏛️ Summoning the divine council to build your project...

[Zeus]: I will now coordinate the gods to build your vision:
  • Daedalus will design the architecture
  • Hephaestus will implement the code
  • Apollo will create the user interface
  • Themis will ensure quality with tests

[Starting divine orchestration...]

[Zeus]: Creating comprehensive project plan...
[Daedalus]: Designing system architecture...
[Hephaestus]: Implementing core functionality...
✓ Zeus has completed their task
✓ Project files created by the gods
```

### Without Claude-Flow (Fallback):
```
🏛️ Welcome to Pantheon - Where Gods Build Software

[Zeus]: Tell me about your project idea...
[User answers questions]

[Zeus]: I'll hand this over to Hephaestus, our master builder...
[Generating project from templates...]
✓ Project generated successfully
```

## Troubleshooting

### Issue: Claude-Flow not detected
- Check path: `./claude-flow/src/index.js` exists
- Verify permissions: Script can read Claude-Flow files
- Enable debug mode for detailed errors

### Issue: Agents not spawning
- Check PantheonCore initialization logs
- Verify AgentSpawner is loaded
- Ensure Claude-Flow bridge initialized

### Issue: No progress updates
- Check subscribeToAgentProgress implementation
- Verify event emitters are connected
- Enable debug logging

## Success Criteria

✅ Integration is working if:
1. Commands route correctly based on type
2. Claude-Flow agents spawn when available
3. Fallback works when Claude-Flow missing
4. No errors during normal operation
5. Progress updates display in real-time
6. Project files are created successfully