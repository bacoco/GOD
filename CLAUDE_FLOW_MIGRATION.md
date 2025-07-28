# Claude-Flow Migration: Removing All Template Fallbacks

## Summary of Changes

This document outlines the comprehensive changes made to Pantheon to make Claude-Flow mandatory and remove all template-based fallbacks.

## Key Changes

### 1. **Removed Template-Based Generation**
- ❌ Deleted `gods/lib/project-generator.js` - No more template-based project generation
- ✅ All projects now built by real Claude-Flow AI agents

### 2. **Made Claude-Flow Required**
- ❌ Removed all `useClaudeFlow` conditional checks
- ❌ Removed `createFallbackAgent` method from PantheonCore
- ✅ System now throws clear errors if Claude-Flow is missing
- ✅ No silent fallbacks - users are explicitly informed

### 3. **Updated Command System**
- ✅ `init-command.js` - Now requires Claude-Flow, no template fallback
- ✅ `resume-command.js` - Uses Claude-Flow agents to continue work
- ✅ All commands throw errors if Claude-Flow is unavailable

### 4. **Fixed Claude-Flow Integration**
- ✅ `claude-flow-bridge.js` - Rewritten to use CLI commands via child_process
- ✅ No longer tries to import internal Claude-Flow modules
- ✅ Spawns real Claude-Flow processes with proper streaming

### 5. **Created Installation Infrastructure**
- ✅ `install-claude-flow.js` - Automated installation script
- ✅ `ensure-claude-flow.js` - Runtime verification module
- ✅ Clear error messages with installation instructions

### 6. **Updated Documentation**
- ✅ `README.md` - Added Claude-Flow requirement notice
- ✅ `docs/user/quickstart.md` - Updated installation instructions
- ✅ `docs/user/troubleshooting.md` - Added Claude-Flow troubleshooting
- ✅ `package.json` - Added postinstall reminder

## Technical Implementation

### Claude-Flow Bridge Architecture
```javascript
// OLD: Direct module imports (failed)
import { ClaudeFlowOrchestrator } from 'claude-flow/src/core/orchestrator.js';

// NEW: CLI command execution
spawn('./claude-flow/bin/claude-flow', ['swarm', task, '--strategy', 'development']);
```

### Error Handling
```javascript
// Every entry point now checks:
if (!claudeFlowBridge) {
  throw new Error('Claude-Flow is required. Please run: node install-claude-flow.js');
}
```

### Agent Creation Flow
1. User runs `/gods init "project idea"`
2. Conversational interface gathers requirements
3. Claude-Flow agents are spawned via CLI
4. Real agents build the project (no templates!)
5. Progress is streamed back to conversation

## Benefits

1. **Authenticity**: Every project is built by real AI agents, not templates
2. **Transparency**: No hidden fallbacks - users know exactly what's happening
3. **Quality**: Real AI reasoning produces better, more contextual code
4. **Consistency**: One system, one approach, no confusion

## Migration Guide for Users

### If you have an existing Pantheon installation:

1. Pull the latest changes
2. Run the installation script:
   ```bash
   node install-claude-flow.js
   ```
3. All commands will now use Claude-Flow agents

### Error Messages You Might See:

- `"Claude-Flow is required but not installed"` → Run installation script
- `"Failed to initialize Claude-Flow Bridge"` → Check Claude-Flow installation
- `"Claude-Flow agents did not create any project files"` → Agent execution failed

## Future Considerations

- Monitor Claude-Flow agent performance
- Optimize agent spawning for faster execution
- Consider caching frequently used agent configurations
- Add progress indicators for long-running agent tasks

## Conclusion

Pantheon now delivers on its promise: **Real AI agents building your projects**, not template-based generation. This change ensures users get the full power of AI-driven development, with no compromises or fallbacks.