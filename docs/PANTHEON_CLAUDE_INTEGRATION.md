# 🏛️ Pantheon + Claude Integration Guide

Welcome to Pantheon - Where Gods Build Software! This guide shows you how to use Pantheon's divine project creation system directly within Claude.

## 🚀 Quick Start

### 1. Installation (One Time)

```bash
# Clone or navigate to the pantheon directory
cd /Users/loic/develop/pantheon

# Run the installer
./install-pantheon-gods.sh
```

This will:
- Install claude-flow if needed
- Add all `/gods` commands to claude-flow templates

### 2. Enable in Your Project

In any project where you want to use Pantheon:

```bash
# Initialize claude-flow (this copies the commands)
npx claude-flow init

# Or use the launcher helper
./launch-pantheon.sh
```

### 3. Use in Claude

Now in Claude, simply type:
```
/gods-init "I want to build a task management app"
```

## 📚 Available Commands

### `/gods`
Overview of all Pantheon commands and quick help.

### `/gods-init`
Start a new project with Zeus's guidance. This begins an interactive conversation where:
1. Zeus asks about your project vision
2. A divine council convenes to plan the approach  
3. Gods are assigned based on your needs
4. Your project is built with divine craftsmanship

**Example:**
```
/gods-init "An e-commerce platform for handmade crafts"
```

### `/gods-council`
Convene a meeting with specific gods. Choose from:
- Sprint Planning
- Architecture Review
- Code Review
- Design Review
- Emergency Debug Session
- Custom Brainstorming

**Example:**
```
/gods-council
> Choose meeting type: 2 (Architecture Review)
> Your role: Observer
```

### `/gods-tools`
Request tools from Vulcan, the divine tool broker. He manages access to 87+ MCP tools.

**Example:**
```
/gods-tools
> "I need tools for performance analysis"
> Vulcan recommends: performance_report, bottleneck_analyze, benchmark_run
```

### `/gods-chat`
Have a direct conversation with any specific god.

**Example:**
```
/gods-chat
> "I want to speak with Daedalus about microservices"
```

### `/gods-status`
Check your project's progress, see active gods, and review recent activity.

### `/gods-resume`
Continue working on an existing Pantheon project. Restores all context and reconvenes the gods.

### `/gods-help`
Detailed help for all commands and common workflows.

### `/gods-list`
See all available gods and their areas of expertise.

## 🏛️ How It Works

### 1. **Conversational Interface**
Claude becomes the interface for the entire Pantheon system. Zeus, Concilium, and other gods speak through Claude, maintaining their unique personalities.

### 2. **Real Agent Orchestration**
When gods are summoned, they're created as real claude-flow agents with:
- Specific MCP tools based on their expertise
- Ability to execute actual work
- Coordination through shared memory

### 3. **Persistent State**
All conversations and decisions are saved using claude-flow's memory system. You can:
- Resume projects anytime
- Check progress
- Continue conversations with specific gods

### 4. **Dynamic Tool Allocation**
Vulcan manages tool access dynamically:
- Gods start with minimal essential tools
- Request additional tools as needed
- You maintain visibility and control

## 🎯 Example Workflows

### Starting a New Project
```
1. /gods-init "recipe sharing app with social features"
2. Answer Zeus's questions about users and goals
3. Participate in the council meeting
4. Choose architecture (monolith vs microservices)
5. Approve technology choices
6. Let the gods build your project
```

### Getting Help with Existing Code
```
1. /gods-council
2. Choose "Code Review"
3. Hephaestus and Themis review your code
4. Get actionable feedback and improvements
```

### Debugging Production Issues
```
1. /gods-council
2. Choose "Emergency Debug Session"
3. Aegis, Themis, and Hephaestus help diagnose
4. Get immediate action items
```

### Learning Architecture Patterns
```
1. /gods-chat
2. Choose "Daedalus"
3. Discuss architecture patterns and best practices
4. Get personalized recommendations
```

## 🔧 Technical Details

### Integration Architecture
- Pantheon commands are markdown files in `.claude/commands/`
- Each command can conduct conversations and execute actions
- Gods are spawned as claude-flow agents with specific tools
- State persists through claude-flow's memory system

### Available Gods
- **Zeus** - Orchestration
- **Daedalus** - Architecture  
- **Hephaestus** - Implementation
- **Apollo** - UI/UX
- **Themis** - Testing
- **Vulcan** - Tool Management
- **Concilium** - Meeting Facilitation
- And 15+ more specialized gods!

### MCP Tools Integration
Gods have access to appropriate tools from claude-flow's 87 MCP tools:
- Swarm coordination tools
- Code generation and analysis
- Performance monitoring
- GitHub integration
- And many more

## 🆘 Troubleshooting

### Commands Not Appearing
Make sure you've run `npx claude-flow init` in your project directory.

### Gods Not Responding
Use `/gods-status` to check the current state, then `/gods-resume` to reactivate.

### Need Different Gods
Use `/gods-council` with custom participant selection, or `/gods-chat` for direct access.

### Tool Access Issues
Talk to Vulcan with `/gods-tools` - he can grant access to any tools you need.

## 📝 Tips for Success

1. **Be Specific**: The more detail you provide, the better the gods can help
2. **Trust the Council**: The gods consider best practices and scalability
3. **Use Meetings**: Different meeting types serve different purposes
4. **Build Relationships**: Each god remembers your conversations

## 🌟 What Makes This Special

- **Natural Conversation**: No complex commands, just chat
- **Real Execution**: Gods create actual code and projects
- **Persistent Memory**: Everything is remembered across sessions
- **Personality-Driven**: Each god has unique expertise and character
- **Flexible Orchestration**: From simple scripts to complex systems

---

Welcome to Pantheon! May the gods guide your code to greatness! 🏛️⚡