# BACO Commands Directory

This directory contains all Claude Code slash commands for the BACO framework.

## Command Structure

Each `.md` file in this directory represents a slash command that can be invoked in Claude Code.

### Core Commands

1. **`/baco`** - NEW: Simplified workflow using baco.in files
   - `/baco init` - Create a template baco.in file
   - `/baco plan` - Generate development plan from baco.in
   - `/baco validate` - Validate baco.in syntax
   - `/baco execute` - Execute the development plan

2. **`/analyze`** - Multi-dimensional task analysis
   - Complexity assessment
   - Risk evaluation
   - Resource requirements

3. **`/orchestrate`** - Coordinate multiple agents
   - Dynamic team formation
   - Task delegation
   - Progress tracking

4. **`/generate-prp`** - Generate Product Requirements Prompt
   - Now supports baco.in as input
   - Backward compatible with CLI flags

## Integration Flow

```mermaid
graph TD
    A[User creates baco.in] --> B[/baco plan]
    B --> C{Parse baco.in}
    C -->|Success| D[Generate Plan]
    C -->|Error| E[Show errors & suggestions]
    D --> F[Display plan]
    F --> G[/baco execute]
    G --> H[/orchestrate with team]
    H --> I[Generate code]
```

## Adding New Commands

To add a new command:

1. Create a new `.md` file in this directory
2. Start with an `## ACTIVATION` section
3. Define the command behavior and integration points
4. Update this README

## Command Patterns

All commands should follow these patterns:

1. **Clear Activation**: Specify exactly when the command activates
2. **Error Handling**: Provide helpful error messages and recovery suggestions
3. **Integration**: Work seamlessly with other BACO commands
4. **Progress Feedback**: Keep users informed of what's happening
5. **Fallbacks**: Gracefully handle missing dependencies or files

## baco.in Integration

Commands that should be aware of baco.in files:
- `/baco` (primary handler)
- `/generate-prp` (can use baco.in as input)
- `/orchestrate` (uses team recommendations from baco.in)
- `/analyze` (considers constraints from baco.in)

## Testing Commands

To test a command:
1. Invoke it directly in Claude Code (e.g., `/baco init`)
2. Check error handling with invalid inputs
3. Verify integration with other commands
4. Test both with and without baco.in files