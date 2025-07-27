# /team Command - Agent Team Coordination

ACTIVATION: When user types `/team` or `/team <name>`, manage agent team coordination.

## Command Overview

The `/team` command enables pre-configured teams of agents to work together on specific types of projects. Teams have defined roles, responsibilities, and coordination patterns.

## Usage Patterns

### List Available Teams
```
/team
```
Shows all configured teams with descriptions.

### Activate Team
```
/team product-team
/team security-team
/team agile-team
```
Activates the specified team configuration.

### Team Management
```
/team-status
/team-assign <task>
/team-rotate
```
Manage active team operations.

## Implementation

When this command is invoked:

1. **Parse the command**:
   - No argument: List available teams
   - With argument: Activate specified team
   - Special commands: Manage active team

2. **For listing teams**:
   ```yaml
   Available BACO Agent Teams:
   
   product-team:
     Description: Full product development team
     Members: PM, UX, Architect, Developer, QA
     Best for: New features, product development
   
   security-team:
     Description: Security review and audit team
     Members: Security Lead, Security Architect, Developer, QA
     Best for: Security audits, compliance, threat modeling
   
   agile-team:
     Description: Sprint-based agile development
     Members: Scrum Master, Product Owner, Developer, QA
     Best for: Iterative development, sprint execution
   
   Usage: /team <name> to activate team
   ```

3. **For team activation**:
   - Load team configuration from `.claude/teams/{name}.yaml`
   - Initialize team workspace
   - Assign roles to agents
   - Set up communication channels
   - Brief team on objectives

## Team Activation Flow

### 1. Team Assembly
```
Activating {team_name}...

Team Members:
- {role}: {agent_name} - {responsibilities}
- {role}: {agent_name} - {responsibilities}
...

Team Leader: {leader_agent}
Coordination Style: {coordination_type}

Team workspace initialized.
```

### 2. Team Briefing
```
=== Team Briefing ===

Objective: {user_provided_goal}

{leader_agent}: "Team, here's our mission..."

Each team member introduces their role and initial thoughts.

Ready to begin? Use team commands:
- *team-plan: Create action plan
- *team-execute: Start execution
- *team-sync: Team synchronization
```

### 3. Team Operations

**Planning Phase**:
```
*team-plan

{leader_agent} facilitating...

1. Goal breakdown
2. Role assignments  
3. Timeline estimation
4. Deliverable definition
5. Success criteria

Team Plan created. Use *team-execute to begin.
```

**Execution Phase**:
```
*team-execute

Team working in {coordination_style} mode...

{agent_1}: Working on {task_1}
{agent_2}: Working on {task_2}
...

Progress updates every {interval}.
```

**Synchronization**:
```
*team-sync

=== Team Sync ===

{each_agent}: {status_update}

Blockers: {list_blockers}
Decisions needed: {list_decisions}

Next sync in {time}.
```

## Team Commands

Available during team operations:

- `*team-plan` - Create team action plan
- `*team-execute` - Start team execution
- `*team-sync` - Synchronize team members
- `*team-status` - Show team progress
- `*team-handoff` - Manage work handoffs
- `*team-retrospective` - Team reflection
- `*team-help` - Team-specific commands

## Team Coordination Patterns

### Sequential Coordination
- Tasks flow from one member to next
- Clear handoffs with artifacts
- Suitable for: Waterfall-style projects

### Parallel Coordination
- Multiple members work simultaneously
- Regular sync points
- Suitable for: Independent workstreams

### Collaborative Coordination
- Continuous collaboration
- Shared workspace
- Suitable for: Complex problems

### Adaptive Coordination
- Coordination style changes based on needs
- Dynamic role assignment
- Suitable for: Uncertain requirements

## Team Workspaces

Each team gets:
- Shared artifact directory
- Communication channel
- Progress tracking
- Decision log
- Team memory

## Example Team Interaction

```
User: /team product-team

[System loads product team configuration]

PM (Prometheus): Welcome! I'm leading the product team. We have:
- Apollo (UX) for design
- Daedalus (Architect) for system design  
- Hephaestus (Developer) for implementation
- Themis (QA) for quality

What product feature should we tackle?

User: Build a real-time chat feature

PM: Excellent! Let me coordinate the team...

*team-plan

=== Product Team Planning ===

Phase 1 - Discovery (PM + UX):
- User research on chat needs
- Competitive analysis
- Initial wireframes

Phase 2 - Design (UX + Architect):
- Chat UI design
- Real-time architecture
- API specification

Phase 3 - Implementation (Developer + QA):
- Build chat components
- WebSocket integration
- Test automation

Estimated timeline: 3 weeks
Ready to begin discovery phase?
```

## Team Performance Metrics

Track team effectiveness:
- Goal achievement rate
- Handoff efficiency
- Communication quality
- Delivery speed
- Team satisfaction

## Integration with Workflows

Teams can be used within workflows:
- Workflow step: "Activate product team"
- Team completes phase
- Workflow continues with results

## Error Handling

- Team member conflicts: Resolve with leader
- Missing capabilities: Add specialized agents
- Communication breakdown: Force sync
- Blocked progress: Escalate to user

## Best Practices

1. **Clear Objectives**: Define what team should achieve
2. **Role Clarity**: Each member knows their part
3. **Regular Syncs**: Keep team aligned
4. **Document Decisions**: Maintain team memory
5. **Retrospectives**: Learn and improve

The team system enables complex multi-agent coordination with defined roles and proven patterns.