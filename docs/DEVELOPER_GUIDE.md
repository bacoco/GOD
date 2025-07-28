# Pantheon Developer Guide

This guide is for developers who want to understand Pantheon's technical architecture, extend its capabilities, or integrate it into other systems.

## Technical Overview

Pantheon is a sophisticated AI agent orchestration system built on top of Claude-Flow. It implements a plugin architecture with specialized "god" agents that can create unlimited sub-agents and coordinate complex multi-agent workflows.

## Architecture

```
Pantheon System
├── Core Plugin System (gods/)
│   ├── PantheonCore - Main orchestration engine
│   ├── GodFactory - God instantiation system  
│   ├── BaseGod - Base class for all gods
│   └── DivineMessenger - Inter-god communication
├── God Implementations (gods/lib/gods/)
│   ├── Zeus - Supreme orchestrator
│   ├── Hephaestus - Development specialist
│   └── [14 more god implementations]
├── Enhancement Layers
│   ├── Metacognition - Self-improvement system
│   ├── Dynamic Workflows - Workflow generation
│   ├── Resource Management - Cost tracking
│   ├── Marketplace - Agent sharing platform
│   └── User Integration - Human-in-the-loop
└── Claude-Flow Integration
    └── 54+ base agents for adaptation
```

## Installation for Developers

```bash
# Clone the repository
git clone https://github.com/yourusername/pantheon.git
cd pantheon

# Install dependencies
npm install

# Run tests
npm test

# Start in development mode
npm run dev
```

## Core Components

### PantheonCore

The main orchestration engine that manages gods and workflows:

```javascript
import { PantheonCore } from './gods/lib/pantheon-core.js';

const pantheon = new PantheonCore(claudeFlow, {
  hooks: claudeFlowHooks,
  emit: eventEmitter,
  meta: { version: '1.0.0' }
});

await pantheon.initialize();
```

### BaseGod Class

All gods extend the BaseGod class:

```javascript
import { BaseGod } from './gods/lib/base-god.js';

export class CustomGod extends BaseGod {
  async onInitialize() {
    this.capabilities = ['analyze', 'create', 'coordinate'];
    this.tools = ['github', 'browsermcp'];
  }
  
  async performTask(task) {
    // Implementation
    return result;
  }
}
```

### God Factory

Creates and manages god instances:

```javascript
const godFactory = new GodFactory(pantheon);
const zeus = await godFactory.createGod('zeus', {
  tools: ['ALL'],
  maxAgents: 20,
  orchestrationMode: 'hybrid'
});
```

## Advanced Features

### 1. Metacognition System

Gods can analyze and improve their performance:

```javascript
import { enableMetacognition } from './gods/lib/metacognition.js';

enableMetacognition(god, {
  learningRate: 0.1,
  memoryPath: './memory/metacognition',
  maxHistorySize: 1000
});

// After workflow completion
const analysis = await god.analyzePerformance(session, metrics);
```

### 2. Dynamic Workflow Generation

```javascript
import { DynamicWorkflowBuilder } from './gods/lib/dynamic-workflow-builder.js';

const builder = new DynamicWorkflowBuilder({ pantheon });
const workflow = await builder.buildWorkflow(requirements, {
  optimizationGoals: ['minimize-handoffs', 'maximize-parallel'],
  context: { budget: 100, deadline: '2 days' }
});
```

### 3. Resource Management

```javascript
import { ResourceAwareOrchestrator } from './gods/lib/resource-aware-orchestrator.js';

const orchestrator = new ResourceAwareOrchestrator({
  costWeight: 0.4,
  performanceWeight: 0.3,
  qualityWeight: 0.3
});

const result = await orchestrator.orchestrateWithBudget(
  workflow, 
  budget,
  { strategy: 'balanced' }
);
```

### 4. Agent Marketplace

```javascript
import { AgentMarketplace } from './gods/lib/agent-marketplace.js';

const marketplace = new AgentMarketplace();
await marketplace.initialize();

// Publish an agent
await marketplace.publish(agentDefinition, {
  author: 'developer',
  category: 'development',
  tags: ['react', 'frontend']
});

// Search and install
const results = await marketplace.search('react');
await marketplace.install(results[0].agent.id);
```

### 5. Human Integration

```javascript
import { UserGod } from './gods/lib/user-god.js';

const user = new UserGod({
  notificationMethod: 'console',
  preferences: {
    autoApprove: false,
    maxWaitTime: 3600000
  }
});

// Assign task to human
const result = await user.executeTask({
  type: 'approval',
  title: 'Review Architecture',
  description: 'Please approve the proposed architecture'
});
```

## Creating Custom Gods

### Step 1: Define God Configuration

Create `.claude/agents/yourgod.md`:

```markdown
---
name: YourGod
orchestrationMode: hybrid
allowedGods: hephaestus, apollo
tools: github, desktop-commander
---

# YourGod

## Role
Specialized in [your domain]

## Capabilities
- capability1
- capability2

## Tools
- tool1
- tool2
```

### Step 2: Implement God Class

```javascript
// gods/lib/gods/yourgod.js
import { MetacognitiveGod } from '../metacognitive-god.js';

export class YourGod extends MetacognitiveGod {
  async onInitialize() {
    await super.onInitialize();
    
    this.capabilities = [
      'your-special-capability'
    ];
    
    this.responsibilities = [
      'Your key responsibility'
    ];
  }
  
  async performTask(task) {
    // Your implementation
    switch(task.type) {
      case 'analyze':
        return await this.analyze(task);
      case 'create':
        return await this.create(task);
      default:
        return await super.performTask(task);
    }
  }
}
```

### Step 3: Register with Factory

Add to `god-factory.js`:

```javascript
const godNames = [
  'zeus', 'hephaestus', 'apollo',
  'yourgod' // Add your god
];
```

## API Reference

### Pantheon Plugin API

```javascript
// Initialize plugin
const pantheonPlugin = await createPantheonPlugin(claudeFlow, options);

// Core methods
await pantheonPlugin.summon(godName, options);
await pantheonPlugin.orchestrate(workflow);
await pantheonPlugin.communicate(fromGod, toGod, message);
await pantheonPlugin.executeWorkflow(workflowName, params);

// Management
pantheonPlugin.getGods();
pantheonPlugin.getGodStatus(godName);
await pantheonPlugin.cleanup();
```

### God API

```javascript
// God instance methods
await god.initialize();
await god.createSubAgent(type, config);
await god.executeTask(task);
await god.sendMessage(recipient, content);
await god.collaborateWith(otherGods, task);

// Memory operations
god.remember(key, value);
god.recall(key);

// Lifecycle
await god.shutdown();
```

### Workflow API

```javascript
// Workflow execution
const workflow = {
  name: 'custom-workflow',
  tasks: [...],
  dependencies: {...},
  parallelizable: {...}
};

const result = await pantheon.executeWorkflow(workflow);
```

## Integration Examples

### With Express Server

```javascript
import express from 'express';
import { createPantheonPlugin } from './pantheon.js';

const app = express();
const pantheon = await createPantheonPlugin(claudeFlow);

app.post('/api/pantheon/summon', async (req, res) => {
  const { god, task } = req.body;
  const result = await pantheon.summon(god).executeTask(task);
  res.json(result);
});
```

### With CLI Tool

```javascript
#!/usr/bin/env node
import { program } from 'commander';
import { createPantheonPlugin } from './pantheon.js';

program
  .command('summon <god>')
  .action(async (god) => {
    const pantheon = await createPantheonPlugin(claudeFlow);
    const instance = await pantheon.summon(god);
    console.log(`Summoned ${god}`);
  });
```

### With Webhook System

```javascript
const webhookHandler = async (event) => {
  const pantheon = await createPantheonPlugin(claudeFlow);
  
  switch(event.type) {
    case 'pr_opened':
      const reviewer = await pantheon.summon('code-reviewer');
      await reviewer.executeTask({
        type: 'review',
        pr: event.data
      });
      break;
  }
};
```

## Performance Optimization

### Agent Pooling

```javascript
// Enable agent pooling in god configuration
const god = new MetacognitiveGod({
  enablePooling: true,
  poolSize: 10,
  poolTimeout: 300000
});
```

### Caching Strategies

```javascript
// Enable task result caching
god.enableTaskCaching();

// Custom cache configuration
god.setCacheConfig({
  maxSize: 100,
  ttl: 3600000, // 1 hour
  keyGenerator: (task) => `${task.type}:${task.id}`
});
```

### Parallel Execution

```javascript
// Configure parallel execution limits
const workflow = {
  parallelizable: {
    maxConcurrent: 5,
    batchSize: 10
  }
};
```

## Testing

### Unit Tests

```javascript
import { describe, it, expect } from 'vitest';
import { YourGod } from '../gods/lib/gods/yourgod.js';

describe('YourGod', () => {
  it('should perform analysis', async () => {
    const god = new YourGod();
    await god.initialize();
    
    const result = await god.executeTask({
      type: 'analyze',
      data: testData
    });
    
    expect(result.success).toBe(true);
  });
});
```

### Integration Tests

```javascript
describe('Pantheon Integration', () => {
  it('should orchestrate multi-god workflow', async () => {
    const pantheon = await createTestPantheon();
    
    const result = await pantheon.executeWorkflow('test-workflow', {
      tasks: ['analyze', 'create', 'deploy']
    });
    
    expect(result.completed).toBe(true);
  });
});
```

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "launch.js"]
```

### Environment Variables

```bash
# .env
CLAUDE_API_KEY=your_api_key
PANTHEON_MODE=production
ENABLE_METACOGNITION=true
MARKETPLACE_URL=https://pantheon-agora.io
```

### Production Configuration

```javascript
// config/production.js
export default {
  pantheon: {
    maxGods: 50,
    maxAgentsPerGod: 100,
    resourceLimits: {
      maxTokensPerHour: 1000000,
      maxCostPerDay: 1000
    },
    monitoring: {
      enabled: true,
      interval: 60000
    }
  }
};
```

## Troubleshooting

### Common Issues

1. **Agent Creation Failures**
   - Check safety limits in AgentSafetyManager
   - Verify tool availability
   - Review orchestration mode settings

2. **Memory Leaks**
   - Enable agent pooling
   - Set appropriate cleanup intervals
   - Monitor with `god.getMetrics()`

3. **Performance Issues**
   - Enable caching
   - Optimize workflow parallelization
   - Use resource-aware orchestration

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Write tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Submit pull request

## Advanced Topics

- [Hybrid Orchestration Architecture](docs/implementation/HYBRID_ORCHESTRATION.md)
- [MD-Based Agent System](docs/implementation/MD_BASED_AGENT_SYSTEM.md)
- [Metacognition Implementation](gods/lib/metacognition.js)
- [Resource Management](gods/lib/resource-manager.js)

## License

MIT License - see LICENSE file for details.