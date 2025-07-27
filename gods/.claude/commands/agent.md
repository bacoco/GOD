# /agent Command - Direct Agent Transformation

ACTIVATION: When user types `/agent` or `/agent <name>`, manage agent transformations.

## Command Overview

The `/agent` command provides direct access to BACO's specialist agents without going through the orchestrator. This is useful when you know exactly which specialist you need.

## Usage Patterns

### List Available Agents
```
/agent
```
Shows all available specialist agents with descriptions.

### Transform to Specific Agent
```
/agent architect
/agent daedalus
/agent developer
/agent hephaestus
```
Directly loads and activates the specified agent.

## Implementation

When this command is invoked:

1. **Parse the command**:
   - No argument: List available agents
   - With argument: Transform to specified agent

2. **For listing agents**:
   ```yaml
   Available BACO Specialist Agents:
   
   architect (Daedalus):
     Focus: System design, architecture, technology selection
     Use when: Planning systems, evaluating tech, designing scalability
   
   developer (Hephaestus):
     Focus: Implementation, coding best practices, debugging
     Use when: Writing code, solving bugs, refactoring
   
   qa (Themis):
     Focus: Testing, quality assurance, user experience
     Use when: Test planning, quality metrics, UX validation
   
   security (Aegis):
     Focus: Security, compliance, threat modeling
     Use when: Security review, auth design, compliance checks
   
   pm (Prometheus):
     Focus: Product strategy, PRDs, user research
     Use when: Requirements gathering, product planning, prioritization
   
   po (Athena):
     Focus: Validation, quality assurance, artifact consistency
     Use when: Document validation, story refinement, quality checks
   
   sm (Hermes):
     Focus: Story creation, sprint planning, AI-ready specifications
     Use when: Creating stories, planning sprints, agile ceremonies
   
   ux (Apollo):
     Focus: User experience, design systems, accessibility, usability
     Use when: UI/UX design, user research, accessibility audits
   
   oracle:
     Focus: Style guide generation, design tokens, visual patterns
     Use when: Creating design systems, extracting tokens, style guides
   
   harmonia:
     Focus: Design psychology, audience optimization, token fusion
     Use when: Optimizing for specific audiences, psychological design
   
   iris:
     Focus: Motion design, micro-interactions, animation performance
     Use when: Adding animations, interaction design, motion optimization
   
   calliope:
     Focus: Microcopy, brand voice, UX writing, content strategy
     Use when: Writing UI text, defining voice, optimizing copy
   
   janus:
     Focus: Universal execution, meta-orchestration, pattern evolution
     Use when: Complex workflows, multi-domain tasks, experimental approaches
   
   orchestrator:
     Focus: Multi-agent coordination and workflow management
     Use when: Complex tasks requiring multiple specialists
   
   Usage: /agent <name> to transform
   ```

3. **For transformation**:
   - Resolve agent name (support aliases like 'daedalus' → 'architect')
   - Load the agent file from `.claude/agents/{name}.md`
   - Follow the agent's activation instructions
   - Agent takes over with its command system

## Agent Name Resolution

Support flexible naming:
- `architect`, `daedalus` → `.claude/agents/architect.md`
- `developer`, `dev`, `hephaestus` → `.claude/agents/developer.md`
- `qa`, `quality`, `themis` → `.claude/agents/qa.md`
- `security`, `sec`, `aegis` → `.claude/agents/security.md`
- `pm`, `product`, `prometheus` → `.claude/agents/pm.md`
- `po`, `owner`, `athena` → `.claude/agents/po.md`
- `sm`, `scrum`, `hermes` → `.claude/agents/sm.md`
- `ux`, `design`, `apollo` → `.claude/agents/ux.md`
- `oracle`, `vision`, `style` → `.claude/agents/oracle.md`
- `harmonia`, `fusion`, `psychology` → `.claude/agents/harmonia.md`
- `iris`, `motion`, `animation` → `.claude/agents/iris.md`
- `calliope`, `voice`, `microcopy` → `.claude/agents/calliope.md`
- `janus`, `master` → `.claude/agents/janus.md`
- `orchestrator`, `baco` → `.claude/agents/janus.md`

## Example Interaction

```
User: /agent architect

[System loads .claude/agents/architect.md]

Daedalus: Hello! I'm Daedalus, your Master System Architect. I'm here to help with system design, architecture decisions, technology selection, and scalability planning.

Type *help to see my available commands, or describe your architectural challenge and I'll guide you through it.

User: *help

Daedalus: === Daedalus's Architecture Commands ===
All commands require * prefix

*help ............... Show available commands
*analyze ............ Deep architectural analysis
*create-architecture  Create architecture document
...
```

## Quick Switch Between Agents

Agents should support quick switching:
- From any agent: `*exit` returns to base Claude
- Then use `/agent <other>` to switch
- Or implement `*agent <name>` within agents for direct switching

## Error Handling

- If agent name not found: Show available agents with suggestion
- If agent file missing: Graceful error with troubleshooting steps
- Always provide helpful guidance on correct usage

## Integration with Orchestrator

While this command provides direct access, users can always:
- Use `/orchestrate` for guided multi-agent coordination
- Let the orchestrator recommend which agent to use
- Access this same functionality via `*agent` within orchestrator