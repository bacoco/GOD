# 🏛️ Pantheon God Agent System

A powerful AI agent orchestration system that extends Claude-Flow with 16 specialized "god" agents, each capable of creating unlimited sub-agents and coordinating complex multi-agent workflows.

## Overview

Pantheon transforms Claude-Flow into a divine orchestration system where each "god" represents a specialized AI agent with unique capabilities:

- **Zeus** - Supreme Orchestrator who coordinates all other gods
- **Janus** - Universal Executor with meta-orchestration abilities
- **Daedalus** - System Architect for design patterns and architecture
- **Hephaestus** - Master Developer for implementation and coding
- **Apollo** - UX Designer for user interfaces and experiences
- And 11 more specialized gods...

## Features

- 🌟 **Dynamic Agent Creation**: Each god can spawn unlimited specialized sub-agents
- 🤖 **MD-Based Agent Adaptation**: Create custom agents by adapting Claude-Flow's 54+ agents
- 🔄 **Agent Combination**: Merge multiple agents to create powerful hybrids
- 💬 **Conversational AI** ✨ NEW!: Natural dialogue with gods for requirements gathering and planning
- 🗣️ **Multi-God Conversations**: Seamless handoffs between specialists during conversations
- 📝 **Auto-Documentation**: Generate PRDs, user journeys, and specs through conversation
- 🎯 **Task Orchestration**: Zeus analyzes complexity and assigns appropriate gods
- ⚡ **Parallel Execution**: Multiple gods working simultaneously on tasks
- 🧠 **Context Preservation**: Maintain state across agent handoffs
- 💾 **Memory Persistence**: Cosmic memory system for knowledge retention
- 🔌 **Plugin Architecture**: Clean separation from Claude-Flow core
- 🔧 **MCP Tool Integration**: Each god has access to specific tools

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pantheon.git
cd pantheon

# Install dependencies
npm install

# Make launch script executable
chmod +x launch.js
```

## Quick Start

### Method 1: Use with Claude Code CLI (Recommended)

```bash
# Direct command in Claude Code
node claude-pantheon.js "Build a task management app"

# Or set up alias (one time)
alias pantheon="$(pwd)/claude-pantheon.js"

# Then use simply
pantheon "Create a REST API with authentication"
pantheon "Summon Apollo to design a dashboard"
```

### Method 2: Launch with Claude-Flow

```bash
# Start in interactive mode
node launch.js

# Or use with Claude-Flow commands
node launch.js agent spawn zeus
node launch.js task create "Build a web application"
```

### Summon a God

```javascript
// Using Claude-Flow CLI
npx claude-flow agent spawn zeus

// In code
const zeus = await pantheon.summon('zeus');
```

### Execute a Workflow

```javascript
// Full-stack development workflow
npx claude-flow workflow full-stack-dev

// Product planning workflow
npx claude-flow workflow product-planning
```

## 🤖 Claude Code Integration (NEW!)

Use Pantheon seamlessly within Claude Code CLI:

```bash
# Quick usage
node claude-pantheon.js "Build an e-commerce platform"

# With specific gods
node claude-pantheon.js "Ask Apollo to design a mobile app"

# See all options
node claude-pantheon.js help
```

📚 **[Complete Claude Code Usage Guide](CLAUDE_CODE_USAGE.md)**

## 💬 Conversational Features (NEW!)

Pantheon gods can now engage in natural conversations with users, making complex project planning and development more intuitive than ever.

### Start a Conversation

```javascript
// Simple conversation with Zeus
const conversation = await zeus.converseAbout('Build a SaaS platform');

// Ask follow-up questions
const response = await conversation.ask('Should it support team collaboration?');

// Get implementation plan
const summary = await conversation.conclude();
```

### Multi-God Collaborative Planning

```javascript
// Full conversational project planning
import { conversationalProjectPlanning } from './gods/workflows/conversational-planning.js';

const result = await conversationalProjectPlanning(
  pantheon,
  'I need an e-commerce platform with AI recommendations',
  { autoImplement: true }  // Proceed to build after planning
);

// Result includes:
// - Generated PRD, user journeys, tech specs
// - Complete implementation plan
// - All conversation artifacts
```

### Natural Handoffs

Gods seamlessly hand off conversations to the right specialists:

```
You: "I need a mobile app"
Zeus: "Let me understand your vision..."
[After gathering requirements]
Zeus: "I'll hand you to Apollo for the design aspects."
Apollo: "Thank you Zeus. Let's explore the user experience..."
```

### Try the Demo

```bash
# Interactive conversational demo
node examples/conversational-demo.js

# Non-interactive demonstration
node tests/test-conversational-flow.js
```

📚 **[Complete Conversational Documentation](docs/conversational/README.md)**

## The 16 Gods

### Leadership & Coordination
- **Zeus** 👑 - Supreme Orchestrator (can create new gods)
- **Janus** 🌌 - Universal Executor & Meta-Orchestrator

### Development Team
- **Daedalus** 🏛️ - System Architect
- **Hephaestus** 🔨 - Master Developer
- **Apollo** 🎨 - UX Designer

### Quality & Process
- **Themis** ⚖️ - QA Engineer
- **Aegis** 🛡️ - Security Expert
- **Athena** 🦉 - Product Owner
- **Hermes** 💫 - Scrum Master

### Product & Strategy
- **Prometheus** 🔥 - Product Manager

### Design System Specialists
- **Oracle** 🔮 - Style Guide Generator
- **Harmonia** 🎵 - Design Token Optimizer
- **Calliope** ✍️ - Microcopy Specialist
- **Iris** 🌈 - Interactivity Specialist
- **Argus** 👁️ - UI Quality Guardian

### Specialized
- **Code Reviewer** 📝 - Lightweight review specialist

## Example Workflows

### Full-Stack Development
```javascript
await pantheon.executeWorkflow('full-stack-dev', {
  project: 'E-commerce Platform',
  requirements: 'Modern SPA with microservices backend'
});
```

This workflow:
1. Zeus analyzes complexity
2. Prometheus defines product strategy
3. Daedalus designs architecture
4. Hephaestus & Apollo implement backend/frontend in parallel
5. Themis runs tests
6. Aegis performs security audit
7. Code Reviewer ensures quality

### Product Planning
```javascript
await pantheon.executeWorkflow('product-planning', {
  product: 'AI Assistant',
  vision: 'Democratize AI',
  timeline: '6 months'
});
```

### Design System Creation
```javascript
await pantheon.executeWorkflow('design-system', {
  brand: 'TechCorp',
  platforms: ['web', 'mobile', 'desktop']
});
```

## Architecture

```
/pantheon/
├── gods/                    # Pantheon plugin
│   ├── index.js            # Plugin entry point
│   ├── lib/
│   │   ├── pantheon-core.js    # Core orchestration
│   │   ├── god-factory.js      # God creation factory
│   │   ├── divine-messenger.js # Inter-god communication
│   │   ├── base-god.js         # Base god class
│   │   └── gods/              # Individual god implementations
│   ├── workflows/          # Pre-built workflows
│   └── .claude/           # God configurations
└── claude-flow/           # Extended Claude-Flow
```

## Hybrid Orchestration Architecture

Pantheon implements a sophisticated hybrid orchestration system that combines the best of both worlds:

### Orchestration Modes

1. **JS-Only Mode**: Fast, deterministic orchestration through JavaScript
2. **Hybrid Mode** (Default): Intelligent mode selection based on task complexity
3. **AI-Driven Mode**: Full AI orchestration using Claude Code sub-agents

### How It Works

#### For Simple Tasks (Complexity ≤ 5)
```javascript
// JavaScript orchestration for predictable, fast execution
zeus.orchestrate("Create a REST endpoint")
// → Directly spawns Hephaestus
// → Executes in milliseconds
// → Fully deterministic
```

#### For Complex Tasks (Complexity > 5 or High Uncertainty)
```javascript
// AI-driven orchestration for adaptive, intelligent execution
zeus.orchestrate("Build distributed ML system with blockchain")
// → Creates AI orchestrator sub-agent with Task tool
// → AI analyzes and spawns multiple specialized gods
// → Adapts strategy based on progress
// → Handles unexpected scenarios
```

### Safety Features

- **Agent Limits**: Maximum 10-20 agents per orchestration
- **Depth Control**: Maximum 3 levels of agent hierarchy
- **Rate Limiting**: Prevents runaway agent creation
- **Resource Monitoring**: Tracks and limits resource usage
- **Automatic Cleanup**: Removes completed agents

### God Configuration

Each god's markdown file can specify:
```yaml
---
orchestrationMode: hybrid  # or 'js-only', 'ai-driven'
allowedGods: hephaestus, apollo, themis  # or 'all' for Janus
tools: Task, TodoWrite, Memory  # Task tool enables agent creation
---
```

## MD-Based Dynamic Agent System

Pantheon gods can create custom agents by leveraging Claude-Flow's 54+ pre-defined agents as templates. This powerful system enables unlimited customization while maintaining execution compatibility.

📚 **[Complete MD System Documentation](gods/README.md)** | 🔧 **[Technical Guide](docs/implementation/MD_BASED_AGENT_SYSTEM.md)** | 🧪 **[Test Suite](tests/test-md-system.js)**

### Quick Examples

#### Simple Agent Adaptation
```javascript
// Create a blockchain-focused developer
const blockchainDev = await hephaestus.createSubAgent('blockchain-dev', {
  baseAgent: 'coder',  // Use Claude-Flow's coder as base
  adaptations: {
    focus: 'Smart contract development',
    expertise: ['Solidity', 'Web3', 'DeFi patterns']
  }
});
```

#### Combine Multiple Agents
```javascript
// Create a full-stack developer by merging agents
const fullStackDev = await zeus.createSubAgent('fullstack-dev', {
  baseAgents: ['backend-dev', 'frontend-dev'],
  mergeStrategy: 'union'  // Combine all capabilities
});
```

#### Agent Discovery
```javascript
// Find suitable agents for a task
const recommendations = await zeus.discoverAgentsForTask(
  'Build a real-time chat application'
);
```

### Key Features

- 🤖 **54+ Base Agents**: Leverage Claude-Flow's entire agent library
- 🔄 **5 Merge Strategies**: union, intersection, weighted, best-features, capabilities-union
- 🔍 **Smart Discovery**: AI-powered agent recommendations
- 🏗️ **10+ Specializations**: Pre-configured expert agents
- ⚡ **Fast Loading**: ~50ms to load all agents with caching
- ✅ **Fully Tested**: Comprehensive test suite included

### Learn More

- **[Gods README](gods/README.md)** - Complete guide with all features
- **[Implementation Details](docs/implementation/MD_BASED_AGENT_SYSTEM.md)** - Technical architecture
- **[Simple Explanation](docs/explanations/SIMPLEST_EXPLANATION.md)** - Easy-to-understand overview
- **[Examples](docs/examples/)** - Hands-on tutorials

## MCP Tool Assignments

Each god has access to specific MCP tools from Claude Flow's 87+ tool collection:

📚 **[Complete MCP Tools Guide](docs/MCP_TOOLS_EXPLAINED.md)** - Simple explanation of how tools work

- **Zeus & Janus**: ALL tools (universal access)
- **Daedalus**: github, context7, browsermcp
- **Hephaestus**: github, desktop-commander, context7, claude-task-master
- **Apollo**: desktop-commander, browsermcp, github
- **Themis**: desktop-commander, github, browsermcp, claude-task-master
- And more...

## API Reference

### Pantheon Plugin API

```javascript
// Summon a god
const god = await pantheon.summon('zeus', options);

// Execute orchestration
const result = await pantheon.orchestrate(workflow);

// Inter-god communication
await pantheon.communicate(fromGod, toGod, message);

// Execute workflow
await pantheon.executeWorkflow(workflowName, params);

// Get active gods
const gods = pantheon.getGods();
```

### God API

```javascript
// Create sub-agent (enhanced with MD support)
const agent = await god.createSubAgent(type, config);
// config can include: baseAgent, baseAgents, adaptations, mergeStrategy

// Create specialized agent
const specialist = await god.createSpecializedAgent('blockchain-developer');

// Discover agents for task
const agents = await god.discoverAgentsForTask('Build chat app');

// Find agents by capability
const testers = await god.findAgentsByCapability('test');

// Send message
await god.sendMessage(recipient, content, options);

// Collaborate
await god.collaborateWith(otherGods, task);

// Memory
await god.remember(key, value);
const value = await god.recall(key);

// Conversational Features (NEW!)
// Start a conversation
const { session, agent } = await god.startConversation(topic, config);

// Simple conversation interface
const conversation = await god.converseAbout(topic);
await conversation.ask('Follow-up question');
const summary = await conversation.conclude();

// Continue existing conversation
await god.continueConversation(session);

// Generate documentation from conversation
const prd = await god.generateDocumentation('PRD', { session });

// Hand off conversation to another god
await god.handoffConversation(toGod, session, reason);
```

## Development

### Creating a New God

1. Create god configuration in `.claude/agents/newgod.md`
2. Implement god class extending BaseGod
3. Add to god factory
4. Update tool assignments

### Creating a New Workflow

```javascript
// workflows/my-workflow.js
export default async function myWorkflow(pantheon, params) {
  // Summon required gods
  const zeus = await pantheon.summonGod('zeus');
  
  // Orchestrate tasks
  // ...
  
  return results;
}
```

## Testing

```bash
# Run all tests
npm test

# Run specific tests
node tests/test-md-system.js              # MD system tests
node tests/test-conversational-system.js  # Conversational tests
node tests/test-conversational-flow.js    # Integration demo

# Run specific test suite
npm test -- --grep "Zeus"
```

## Documentation

For comprehensive documentation, see the [docs/](docs/) directory:

- 📚 [Implementation Details](docs/implementation/) - Technical architecture and plans
- 🎯 [Examples](docs/examples/) - Hands-on guides and demos
- 💡 [Explanations](docs/explanations/) - Visual diagrams and simple explanations
- 📋 [Analysis](docs/analysis/) - Code analysis and improvement plans

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built on top of [Claude-Flow](https://github.com/ruvnet/claude-flow)
- Inspired by Greek mythology and the pantheon of gods
- Powered by Claude AI

---

*"From chaos comes order, from many comes one. The gods of Pantheon await your command."* 🏛️