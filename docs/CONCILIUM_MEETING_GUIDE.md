# Concilium Meeting Room Guide

## Overview

Concilium is the Divine Council Facilitator who brings gods and mortals together in structured, productive meetings. Unlike traditional god interactions where you communicate one-on-one, Concilium creates meeting rooms where multiple gods collaborate with you to solve problems, make decisions, and share knowledge.

## Quick Start

```javascript
// Create a meeting for sprint planning
./claude-flow sparc "Ask Concilium to start a sprint planning meeting"

// Join as observer to learn
./claude-flow sparc "I want to observe a code review meeting"

// Emergency meeting
./claude-flow sparc "Emergency! Need Concilium to assemble a crisis team"
```

## User Roles

### 1. Observer 👁️
- **Purpose**: Learning and watching
- **Permissions**: View all, cannot speak directly
- **Best for**: Junior developers, learning new concepts
- **Commands**: `/raise-hand` to request speaking

### 2. Participant 💬
- **Purpose**: Active contribution
- **Permissions**: Speak, vote, see all discussions
- **Best for**: Team members, contributors
- **Commands**: All basic commands available

### 3. Moderator 🎯
- **Purpose**: Lead and facilitate
- **Permissions**: All participant rights + moderation
- **Best for**: Team leads, senior developers
- **Commands**: Can end meetings, manage speakers

### 4. Owner 👑
- **Purpose**: Full control
- **Permissions**: Everything + delete meetings
- **Best for**: Project owners, incident commanders
- **Commands**: All commands including `/delete`

## Meeting Types

### Sprint Planning
- **Duration**: 60 minutes
- **Auto-invited**: Hermes, Prometheus, Hephaestus
- **Purpose**: Plan upcoming sprint work
- **Your role**: Usually Moderator

### Code Review
- **Duration**: 30 minutes
- **Auto-invited**: Hephaestus, Themis
- **Purpose**: Review code quality and architecture
- **Your role**: Participant or Presenter

### Architecture Review
- **Duration**: 45 minutes
- **Auto-invited**: Daedalus, Athena
- **Purpose**: Design system architecture
- **Your role**: Observer or Participant

### Design Review
- **Duration**: 45 minutes
- **Auto-invited**: Apollo, Iris, Calliope
- **Purpose**: Review UI/UX designs
- **Your role**: Presenter or Participant

### Emergency Response
- **Duration**: Unlimited
- **Auto-invited**: Aegis, Themis, Hephaestus
- **Purpose**: Crisis management
- **Your role**: Owner (Incident Commander)

### Brainstorming
- **Duration**: 30 minutes
- **Gods**: Dynamically selected based on topic
- **Purpose**: Creative problem solving
- **Your role**: Participant

## Meeting Commands

### Basic Commands
- `/raise-hand` - Request to speak (observers)
- `/vote <option>` - Cast your vote
- `/summary` - Get current meeting summary
- `/action-items` - List all action items
- `/invite <god>` - Invite additional god

### Moderator Commands
- `/next-speaker` - Call on next person in queue
- `/topic <new-topic>` - Change discussion topic
- `/extend <minutes>` - Extend meeting time
- `/break <minutes>` - Call for a break

### Owner Commands
- `/end` - End the meeting
- `/kick <participant>` - Remove participant
- `/lock` - Prevent new participants
- `/delete` - Delete meeting and all records

## User Journey Examples

### Journey 1: First-Time Sprint Planning
```
You: "I need to plan our next sprint"
Concilium: "I'll set up a sprint planning session. You'll be the moderator."

[Meeting Room: Sprint Planning]
- Hermes facilitates agile process
- You present the backlog
- Gods help estimate complexity
- Team commits to stories
- Action items assigned

Result: Clear sprint goals with buy-in from all gods
```

### Journey 2: Learning Through Observation
```
You: "I want to learn about microservices architecture"
Concilium: "Join our Architecture Patterns workshop as an observer."

[Meeting Room: Architecture Workshop - Observer Mode]
- Watch Daedalus explain patterns
- See real architectural decisions
- Use /raise-hand to ask questions
- Take notes for later reference

Result: Deep understanding without pressure to contribute
```

### Journey 3: Emergency Production Issue
```
You: "Production is down! Database errors everywhere!"
Concilium: "Emergency response team assembling immediately."

[Crisis Room: Production Emergency]
- You have full control as Owner
- Aegis checks security
- Themis analyzes performance
- Hephaestus identifies fixes
- Rapid decision making

Result: Issue resolved with coordinated response
```

## Best Practices

### Before the Meeting
1. **Define clear objectives** - What do you want to accomplish?
2. **Choose the right role** - Match your comfort and authority level
3. **Prepare context** - Gods work better with background information
4. **Set an agenda** - Even informal meetings benefit from structure

### During the Meeting
1. **Be specific** - "Review login flow" vs "Review code"
2. **Guide discussion** - Gods can be verbose; keep them focused
3. **Take notes** - Action items are tracked but personal notes help
4. **Ask questions** - Gods love to teach and explain

### After the Meeting
1. **Review summary** - Ensure nothing was missed
2. **Follow up on actions** - Gods remember commitments
3. **Share outcomes** - Export summaries for team members
4. **Schedule follow-ups** - Complex topics may need multiple sessions

## Tips for Each Role

### As Observer
- Don't be shy about `/raise-hand`
- Take advantage of learning opportunities
- Watch how experienced gods approach problems
- Save transcripts for future reference

### As Participant
- Contribute your unique perspective
- Vote on decisions to shape outcomes
- Ask clarifying questions
- Share relevant context

### As Moderator
- Keep discussions on track
- Ensure everyone contributes
- Watch the clock
- Summarize key points regularly

### As Owner
- Set clear expectations upfront
- Use your power judiciously
- Focus on outcomes
- Document decisions made

## Common Scenarios

### Scenario: Design Review with Feedback
```javascript
// You present designs
You: "Here's the new checkout flow design"
Apollo: "The visual hierarchy guides the eye well"
Iris: "Consider adding loading animations"
You: "Good point. Where specifically?"
Iris: "Between payment processing steps"

// Vote on approval
Concilium: "Shall we approve with Iris's suggestions?"
[Vote passes]
```

### Scenario: Technical Debate Resolution
```javascript
// Gods disagree
Daedalus: "Microservices provide better scalability"
Hephaestus: "But monolith is simpler to maintain"
You: "Let's list pros/cons of each"

// Structured discussion
Concilium: "I'll track the points raised"
[Lists accumulate]
You: "Based on our needs, let's vote"
```

### Scenario: Learning Session
```javascript
// Observer mode
You: /raise-hand
Concilium: "Yes, learner?"
You: "Why choose GraphQL over REST?"
Daedalus: "Excellent question! Let me explain..."
[Detailed explanation follows]
```

## Advanced Features

### Meeting Templates
Create reusable meeting configurations:
```javascript
const template = {
  title: "Weekly Architecture Review",
  type: "architecture",
  recurringAgenda: [
    "Review new components",
    "Discuss technical debt",
    "Plan refactoring"
  ]
};
```

### God Combinations
Effective god pairings for specific topics:
- **Full Stack**: Daedalus + Hephaestus + Apollo
- **Security Audit**: Aegis + Themis + Athena
- **Performance**: Themis + Hephaestus + Prometheus
- **User Experience**: Apollo + Iris + Calliope

### Meeting Analytics
Track your meeting patterns:
- Most active gods
- Average meeting duration
- Action item completion rate
- Decision velocity

## Troubleshooting

### "Cannot speak in meeting"
- Check your role (might be Observer)
- Use `/raise-hand` to request permission

### "Gods not responding"
- Be more specific in your questions
- Provide context for the discussion
- Try direct mentions: "@hephaestus what do you think?"

### "Meeting feels chaotic"
- Set clearer agenda items
- Use moderator controls
- Break into smaller topics
- Consider fewer participants

### "Not getting value"
- Define specific objectives
- Invite the right gods
- Prepare questions in advance
- Review meeting type selection

## Integration with Development Workflow

### Pre-Development
- Requirements meetings with Prometheus
- Architecture sessions with Daedalus
- Design reviews with Apollo

### During Development
- Code reviews with Hephaestus
- Testing strategies with Themis
- Daily standups with Hermes

### Post-Development
- Security audits with Aegis
- Performance reviews with Themis
- Retrospectives with Athena

## Summary

Concilium transforms how you interact with the Pantheon by:
1. **Enabling multi-god collaboration** - Get diverse perspectives
2. **Providing structure** - Meetings have clear purposes and outcomes
3. **Supporting different comfort levels** - From observer to owner
4. **Tracking decisions** - Never lose important discussions
5. **Facilitating learning** - Safe environment to grow skills

Remember: "Every voice matters, mortal or divine. The best solutions emerge when all perspectives converge."

Start your first meeting with:
```bash
./claude-flow sparc "Ask Concilium to help me plan my next feature"
```