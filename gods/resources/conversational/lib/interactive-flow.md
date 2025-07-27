# Interactive Flow Patterns for BACO

This library provides shared patterns for creating interactive, conversational experiences in BACO commands.

## Core Principles

1. **Continuous Conversation**: Maintain context throughout the interaction
2. **Clear Choices**: Present numbered options with emoji indicators
3. **Progress Updates**: Keep users informed of what's happening
4. **Graceful Interruption**: Allow pausing and resuming
5. **Error Recovery**: Provide options when things go wrong

## Standard Interaction Patterns

### 1. Choice Prompts
```
What would you like to do next?
1. 🚀 [Primary action - most likely choice]
2. 📄 [Review/inspect option]
3. ✏️ [Modify/adjust option]
4. ⏸️ [Pause/defer option]

Your choice (1-4):
```

### 2. Confirmation Prompts
```
✅ [Completed action]. Ready to [next action]? (y/n):
```

### 3. Progress Updates
```
📋 Current Progress:
✓ Phase 1: Complete
→ Phase 2: In Progress (60%)
  Phase 3: Pending
  Phase 4: Pending

Working on: [specific task]...
```

### 4. Milestone Notifications
```
✅ Phase 1 Complete!

Summary:
- [Key achievement 1]
- [Key achievement 2]
- [Created X files, Y components]

Ready to proceed with Phase 2: [Description]? (y/n):
```

### 5. Error Recovery
```
⚠️ Issue Encountered: [Brief description]

Options:
1. 🔧 Fix automatically and retry
2. 📝 Show detailed error information
3. ⏭️ Skip this step (may impact later steps)
4. ❌ Abort and save progress

Your choice (1-4):
```

## Session State Management

### State Structure
```json
{
  "session_id": "baco-[timestamp]",
  "command": "/baco execute",
  "current_phase": 2,
  "total_phases": 4,
  "completed_steps": ["project_setup", "layout_creation"],
  "pending_steps": ["api_integration", "ui_components"],
  "artifacts": {
    "prp_file": "baco-prp-20250120.md",
    "created_files": ["src/app/page.tsx", "src/components/PromptInput.tsx"]
  },
  "paused_at": null,
  "can_resume": true
}
```

### Resumption Flow
```
🔄 Resume Previous Session?

Found incomplete session from [time ago]:
- Command: /baco execute
- Progress: Phase 2 of 4 (40% complete)
- Last action: Created layout components

Resume where you left off? (y/n):
```

## Implementation Guidelines

### 1. Starting an Interactive Flow
```markdown
When starting an interactive command:
1. Set clear expectations about what will happen
2. Show estimated time/phases if applicable
3. Offer immediate choice to proceed or customize
```

### 2. During Execution
```markdown
While executing:
1. Provide regular updates (every 30-60 seconds of work)
2. Break long tasks into visible sub-steps
3. Ask for confirmation at major transitions
4. Show what was created/modified
```

### 3. Handling User Responses
```markdown
Process user input:
- "1", "2", etc. → Execute corresponding option
- "y", "yes" → Continue with default action
- "n", "no" → Offer alternatives
- "pause", "stop" → Save state and provide resume instructions
- Unexpected input → Clarify and re-prompt
```

### 4. Completion Handling
```markdown
When completing:
1. Summarize what was accomplished
2. List all created/modified artifacts
3. Suggest logical next steps
4. Offer to continue with related tasks
```

## Example Integration

### In `/baco execute`:
```markdown
After PRP generation:

✅ PRP Generated: baco-prp-[timestamp].md

I've created a comprehensive implementation blueprint for your [project].

What would you like to do next?
1. 🚀 Start implementing immediately
2. 📄 Review the PRP first
3. ✏️ Modify the plan
4. ⏸️ Pause for now

Your choice (1-4): 1

Great! Let's start implementing your [project].

📋 Implementation Plan:
- Phase 1: Foundation Setup (Days 1-2)
- Phase 2: Core Logic (Days 2-3)
- Phase 3: User Interface (Days 4-5)
- Phase 4: Testing & Polish (Days 6-7)

This will create approximately [X] files and [Y] components.

Ready to begin with Phase 1? (y/n): y

Starting Phase 1: Foundation Setup...

[... implementation happens ...]

✅ Created project structure!
✅ Set up TypeScript configuration
✅ Initialized package.json with dependencies

Phase 1 Complete! Next is Phase 2: Core Logic.
This phase will implement [brief description].

Continue? (y/n):
```

## State Persistence

Save state to `.claude/memory/session-state.json`:
- Update after each major step
- Include enough context to resume
- Clear completed sessions after 24 hours
- Allow multiple concurrent sessions

## Best Practices

1. **Be Conversational**: Write as if having a helpful dialogue
2. **Show Progress**: Users should never wonder what's happening
3. **Offer Control**: Always provide options to adjust course
4. **Handle Errors Gracefully**: Turn failures into choices
5. **Celebrate Success**: Acknowledge completed milestones
6. **Maintain Context**: Reference previous choices and actions
7. **Be Concise**: Keep prompts clear and scannable

## Anti-Patterns to Avoid

- ❌ Long walls of text without interaction
- ❌ Proceeding without confirmation on major changes
- ❌ Hiding errors or glossing over failures
- ❌ Forcing users to copy/paste commands
- ❌ Losing context between interactions
- ❌ Making users start over after interruptions