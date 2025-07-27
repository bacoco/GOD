# /orchestrate Command - Multi-Agent Coordination

ACTIVATION: When user types `/orchestrate <task>`, activate the Zeus for intelligent agent coordination.

## New Orchestration Approach

This command now activates the Zeus agent, which provides:
- Dynamic agent transformation capabilities
- Intelligent workflow selection
- Pattern-based learning
- Comprehensive multi-agent coordination

## How to Use

When the user types `/orchestrate` or `/orchestrate <task>`:

1. **Load and activate** `.claude/agents/janus.md`
2. The orchestrator will:
   - Greet the user and explain capabilities
   - Analyze the task (if provided)
   - Recommend appropriate agents or workflows
   - Guide through transformations and coordination

## Key Orchestrator Commands

Once in orchestrator mode, users can:
- `*help` - Show all available commands
- `*analyze <task>` - Perform complexity analysis
- `*agent <name>` - Transform into specific agent
- `*workflow` - Start multi-agent workflow
- `*status` - Check current state
- `*reset` - Return to orchestrator

## Benefits of New System

1. **Dynamic Loading**: Agents loaded only when needed
2. **State Tracking**: Maintains context across transformations
3. **Flexible Coordination**: Sequential, parallel, or adaptive strategies
4. **Pattern Learning**: Improves recommendations over time
5. **Command-Based**: Clear, explicit interactions

## Example Usage

```
User: /orchestrate Build a payment processing microservice

[System loads Zeus]

Orchestrator: Welcome! I'm the Zeus. I see you want to build a payment processing microservice. This is a complex task involving security, architecture, and careful implementation.

Let me analyze this for you...

*analyzing complexity*

This scores 8/10 complexity due to:
- Financial data handling
- Security requirements
- Scalability needs
- Compliance considerations

I recommend starting with our security-focused workflow. Would you like me to:
1. Start the security-review workflow
2. Transform to Daedalus (Architect) for system design
3. See all available options with *help

Type your choice or use a command like *agent architect to proceed.
```

## Migration Note

The previous static orchestration approach has been replaced with this dynamic, transformation-based system. All agent personas and coordination logic now reside in the dedicated agent files under `.claude/agents/`.