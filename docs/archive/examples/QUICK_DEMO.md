# Quick Demo: Try It Yourself!

This demo shows exactly how to use the Pantheon God Agent System with all its features.

## Setup

```bash
# Clone and install
git clone https://github.com/bacoco/GOD.git pantheon
cd pantheon
npm install

# Start Pantheon
node launch.js
```

## Demo 1: Simple Task (JS Orchestration)

```bash
# In the Claude-Flow console
> agent spawn zeus
✅ Zeus summoned!

> zeus analyze "Create a function to validate email addresses"
```

**What happens:**
```javascript
// Zeus.js analyzes:
{
  score: 2,  // Simple!
  primaryDomain: 'development',
  suggestedGods: ['hephaestus']
}

// JS orchestration kicks in (fast path)
// Directly summons Hephaestus
// No AI agent needed!
```

**Result in ~100ms:**
```javascript
// Created by Hephaestus
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

## Demo 2: Complex Task (AI Orchestration)

```bash
> zeus orchestrate "Build a real-time chat application with user authentication, message history, and file sharing"
```

**What happens behind the scenes:**

### 1. Zeus Analyzes (zeus.js)
```javascript
const analysis = {
  score: 8,  // Complex!
  complexity: {
    technical: 7,
    uncertainty: 5,
    domainCount: 4  // auth, realtime, storage, frontend
  }
}
// Score > 5 → AI Orchestration!
```

### 2. Zeus Creates AI Orchestrator
```javascript
// Zeus.js creates a Claude Code sub-agent
const orchestrator = await this.createSubAgent('zeus-orchestrator', {
  instructions: zeusMarkdown,  // From zeus.md
  tools: ['Task', 'TodoWrite', 'Memory'],
  allowAgentCreation: true
});
```

### 3. AI Orchestrator Takes Over
The Zeus AI agent (using zeus.md instructions) executes:

```javascript
// AI agent's execution (it can use Task tool!)

// First, create a plan
TodoWrite([
  { content: "Design chat architecture", priority: "high" },
  { content: "Implement authentication", priority: "high" },
  { content: "Create WebSocket server", priority: "high" },
  { content: "Build chat UI", priority: "medium" },
  { content: "Add file sharing", priority: "medium" },
  { content: "Security audit", priority: "high" }
]);

// Phase 1: Architecture & Planning
Task("Chat Architecture", "Design scalable real-time chat system", "daedalus");

// Phase 2: Parallel Implementation
Task("Backend Development", "Build Node.js server with Socket.io, auth, and file handling", "hephaestus");
Task("Frontend Development", "Create React chat interface with real-time updates", "apollo");
Task("Database Design", "Design message storage and user management", "daedalus");

// Phase 3: Quality & Security
Task("Testing Suite", "Create tests for chat functionality", "themis");
Task("Security Audit", "Review auth and file sharing security", "aegis");
```

### 4. Watch Gods Work in Parallel

You'll see output like:
```
🏛️ Daedalus: Designing chat architecture...
🔨 Hephaestus: Setting up Node.js server...
🎨 Apollo: Creating React components...

[Divine Messenger] Daedalus → Hephaestus: "Use Redis for session management"
[Divine Messenger] Hephaestus → Apollo: "WebSocket endpoint ready at ws://localhost:3001"

⚖️ Themis: Writing test suites...
🛡️ Aegis: Running security audit...
```

### 5. Final Result Structure
```
chat-app/
├── architecture/
│   ├── system-design.md
│   └── database-schema.sql
├── backend/
│   ├── server.js
│   ├── auth/
│   ├── websocket/
│   └── file-upload/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── security/
    └── audit-report.md
```

## Demo 3: Meta-Orchestration with Janus

```bash
> agent spawn janus
✅ Janus summoned!

> janus cross-domain "frontend:React" "backend:Python" "ml:TensorFlow" "Build AI-powered code review system"
```

**Janus (Always AI-Driven) Creates:**
```javascript
// Janus can spawn ANY god!
Task("Frontend Expert", "React code review UI", "apollo");
Task("Backend Expert", "Python API server", "python-specialist");
Task("ML Expert", "TensorFlow model for code analysis", "ml-engineer");
Task("Integration Architect", "Connect all systems", "daedalus");
```

## Demo 4: Safety Features in Action

```bash
# Try to create too many agents
> zeus orchestrate "Create 50 different microservices"

⚠️ Safety Manager: Cannot exceed 10 agents
✅ Zeus AI adapts: Groups services into 8 logical units
```

## Demo 5: Using Different Modes

### Force JS-Only Mode
```javascript
// In zeus.js or via config
zeus.orchestrationMode = 'js-only';
// Now ALL tasks use JS orchestration (no AI)
```

### Force AI-Driven Mode
```javascript
zeus.orchestrationMode = 'ai-driven';
// Now even simple tasks use AI orchestration
```

## Interactive Features

### 1. Watch the Hierarchy
```bash
> pantheon status

Active Gods:
└── Zeus (orchestrator)
    ├── Daedalus (working)
    ├── Hephaestus (working)
    │   ├── DB-Specialist (active)
    │   └── API-Specialist (active)
    ├── Apollo (working)
    └── Themis (idle)

Total Agents: 7/10
Max Depth: 3/3
```

### 2. Inter-God Communication
```bash
> pantheon messages

[12:34:15] Daedalus → Hephaestus: "Database schema ready"
[12:34:18] Hephaestus → Apollo: "API endpoints documented"
[12:34:22] Apollo → Zeus: "UI implementation complete"
```

### 3. Memory Inspection
```bash
> memory list

chat-architecture: {type: "websocket", db: "PostgreSQL"}
api-endpoints: ["/api/messages", "/api/users", "/api/files"]
security-config: {auth: "JWT", encryption: "AES-256"}
```

## Complete Code Example

Here's a full example you can run:

```javascript
// example.js
import { ClaudeFlow } from './claude-flow/index.js';
import pantheonPlugin from './gods/index.js';

async function demo() {
  // Initialize Claude-Flow with Pantheon
  const claudeFlow = new ClaudeFlow({
    plugins: [pantheonPlugin]
  });
  
  // Get Pantheon instance
  const pantheon = claudeFlow.plugins.pantheon;
  
  // Summon Zeus
  const zeus = await pantheon.summon('zeus');
  
  // Simple task (JS orchestration)
  console.log('Simple task:');
  const simple = await zeus.orchestrate('Create user model');
  console.log(simple);
  
  // Complex task (AI orchestration)
  console.log('\nComplex task:');
  const complex = await zeus.orchestrate(
    'Build complete SaaS application with multi-tenancy, billing, and analytics'
  );
  console.log(complex);
  
  // Check metrics
  console.log('\nMetrics:', zeus.metrics);
}

demo();
```

## What Makes It Special?

1. **Intelligent Mode Selection**: Automatically chooses the best approach
2. **Recursive Agent Creation**: Gods can create specialized sub-agents
3. **Safety First**: Built-in limits prevent runaway creation
4. **Real Collaboration**: Gods communicate and share knowledge
5. **Tool Specialization**: Each god has specific MCP tools

Try it yourself and watch the gods work their magic! 🏛️⚡