# MD-Based Dynamic Agent System Guide

## Overview

The MD-Based Dynamic Agent System enables Pantheon gods to create custom agents by leveraging the 54+ pre-defined Claude-Flow agents as templates. This powerful system allows gods to:

- **Load** existing Claude-Flow agents as base templates
- **Adapt** agent instructions and capabilities dynamically
- **Combine** multiple agents to create hybrids
- **Generate** new agent definitions on the fly

All agents continue to execute through Claude-Flow, ensuring compatibility, safety, and consistent performance.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Basic Usage](#basic-usage)
3. [Advanced Features](#advanced-features)
4. [Available Base Agents](#available-base-agents)
5. [Merge Strategies](#merge-strategies)
6. [Best Practices](#best-practices)
7. [Examples](#examples)
8. [API Reference](#api-reference)

## Core Concepts

### Agent Heritage

Every dynamically created agent maintains its "heritage" - a record of which Claude-Flow agents it's based on:

```javascript
const customAgent = await zeus.createSubAgent('my-agent', {
  baseAgent: 'coder',  // Single parent
  // OR
  baseAgents: ['coder', 'tester'],  // Multiple parents
});

// The agent knows its heritage:
console.log(customAgent.specialization.heritage); // ['coder'] or ['coder', 'tester']
```

### Execution Through Claude-Flow

**Important**: All agents, whether custom or standard, execute through Claude-Flow:

```
Custom Instructions (MD) → Claude-Flow Engine → Isolated Context → Results
```

This means:
- Same security model
- Same resource limits
- Same tool access
- Same performance characteristics

### Dynamic Adaptation

Agents can be adapted in multiple ways:

1. **Focus**: Specialize the agent for a specific domain
2. **Expertise**: Add specific skills or knowledge areas
3. **Instructions**: Provide additional behavioral guidelines
4. **Tools**: Add or remove available tools
5. **Personality**: Define traits and approach

## Basic Usage

### Creating a Simple Custom Agent

```javascript
// Basic adaptation of a Claude-Flow agent
const customCoder = await hephaestus.createSubAgent('custom-coder', {
  baseAgent: 'coder',  // Use Claude-Flow's coder as base
  adaptations: {
    focus: 'Backend API development',
    expertise: ['Node.js', 'Express', 'PostgreSQL'],
    additionalInstructions: `
      Always follow RESTful principles.
      Include comprehensive error handling.
      Document all endpoints with OpenAPI specs.
    `
  }
});
```

### Combining Multiple Agents

```javascript
// Create a hybrid agent combining multiple capabilities
const fullStackDev = await hephaestus.createSubAgent('fullstack-dev', {
  baseAgents: ['backend-dev', 'spec-mobile-react-native'],
  mergeStrategy: 'union',  // Combine all capabilities
  adaptations: {
    name: 'Full-Stack Developer',
    focus: 'End-to-end web application development'
  }
});
```

### Using Predefined Specializations

```javascript
// Use built-in specializations
const blockchainDev = await god.createSpecializedAgent('blockchain-developer');
const mlEngineer = await god.createSpecializedAgent('ml-engineer');
const securityAuditor = await god.createSpecializedAgent('security-auditor');
```

## Advanced Features

### Agent Discovery

Find suitable base agents for your needs:

```javascript
// Discover agents for a specific task
const recommendations = await zeus.discoverAgentsForTask(
  'Build a real-time chat application'
);

// Find agents by capability
const testers = await zeus.findAgentsByCapability('test');
const analyzers = await zeus.findAgentsByCapability('analyze');
```

### Custom Adaptation Patterns

```javascript
const agent = await zeus.createSubAgent('specialized-agent', {
  baseAgent: 'coordinator',
  adaptations: {
    // Domain specialization
    focus: 'Microservices orchestration',
    
    // Specific expertise
    expertise: [
      'Kubernetes orchestration',
      'Service mesh management',
      'Distributed tracing'
    ],
    
    // Behavioral guidelines
    additionalInstructions: `
      Priority order:
      1. System reliability
      2. Performance optimization
      3. Resource efficiency
    `,
    
    // Tool configuration
    tools: ['Task', 'TodoWrite', 'Memory', 'kubernetes-cli'],
    excludeTools: ['browsermcp'],  // Remove unneeded tools
    
    // Personality traits
    personality: {
      traits: ['methodical', 'proactive', 'detail-oriented'],
      approach: 'systematic',
      communication: 'technical but clear'
    },
    
    // Constraints
    constraints: {
      maxSubAgents: 5,
      timeout: '10m',
      memoryLimit: '1GB'
    }
  }
});
```

### Pattern Library

Include specific patterns in agent knowledge:

```javascript
const architect = await daedalus.createSubAgent('pattern-aware-architect', {
  baseAgent: 'architecture',
  adaptations: {
    patterns: [
      {
        name: 'Event Sourcing',
        code: `
class EventStore {
  async append(streamId, events) { }
  async readStream(streamId) { }
}`,
        description: 'Store state changes as events'
      },
      {
        name: 'CQRS',
        description: 'Separate read and write models'
      }
    ]
  }
});
```

## Available Base Agents

The system can use any of the 54+ Claude-Flow agents as base templates:

### Core Agents
- `coder` - Implementation specialist
- `tester` - Testing expert
- `researcher` - Information gathering
- `planner` - Strategic planning
- `reviewer` - Code review

### Development Agents
- `backend-dev` - Backend development
- `spec-mobile-react-native` - Mobile development
- `dev-backend-api` - API development
- `data-ml-model` - ML development

### Coordination Agents
- `orchestrator-task` - Task orchestration
- `hierarchical-coordinator` - Hierarchical coordination
- `mesh-coordinator` - Mesh network coordination
- `adaptive-coordinator` - Adaptive coordination

### Specialized Agents
- `security-manager` - Security specialist
- `performance-benchmarker` - Performance testing
- `architecture` - System architecture
- `byzantine-coordinator` - Distributed systems

[See full list in Claude-Flow documentation]

## Merge Strategies

When combining multiple agents, choose the appropriate merge strategy:

### 1. Union (Default)
Combines all features from all agents:

```javascript
baseAgents: ['coder', 'tester'],
mergeStrategy: 'union'
// Result: Has both coding AND testing capabilities
```

### 2. Intersection
Only keeps common features:

```javascript
baseAgents: ['backend-dev', 'frontend-dev'],
mergeStrategy: 'intersection'
// Result: Only general development capabilities
```

### 3. Weighted
Prioritizes certain agents:

```javascript
baseAgents: ['architect', 'coder'],
mergeStrategy: 'weighted',
weights: [0.7, 0.3]  // 70% architect, 30% coder
```

### 4. Best Features
Cherry-picks the best from each:

```javascript
baseAgents: ['tester', 'security-manager'],
mergeStrategy: 'best-features'
// Result: Best testing and security practices
```

### 5. Capabilities Union
Organizes by capability domains:

```javascript
baseAgents: ['coder', 'tester', 'reviewer'],
mergeStrategy: 'capabilities-union'
// Result: Organized by development, testing, review domains
```

## Best Practices

### 1. Choose Appropriate Base Agents

```javascript
// ✅ Good: Related agents for cohesive hybrid
const goodHybrid = await god.createSubAgent('api-specialist', {
  baseAgents: ['backend-dev', 'dev-backend-api'],
  mergeStrategy: 'union'
});

// ❌ Bad: Conflicting responsibilities
const confusedAgent = await god.createSubAgent('confused', {
  baseAgents: ['planner', 'coder', 'tester', 'reviewer'],
  mergeStrategy: 'union'  // Too many roles!
});
```

### 2. Provide Clear Focus

```javascript
// ✅ Good: Clear specialization
adaptations: {
  focus: 'Building secure REST APIs with Node.js',
  expertise: ['Express.js', 'JWT authentication', 'Rate limiting']
}

// ❌ Bad: Vague or too broad
adaptations: {
  focus: 'Do programming stuff'
}
```

### 3. Manage Tool Access

```javascript
// ✅ Good: Appropriate tools for the role
const analyst = await god.createSubAgent('analyst', {
  baseAgent: 'researcher',
  adaptations: {
    tools: ['github', 'browsermcp'],  // Research tools
    excludeTools: ['Task']  // Can't create more agents
  }
});
```

### 4. Use Meaningful Names

```javascript
// ✅ Good: Descriptive names
'blockchain-security-auditor'
'react-native-specialist'
'microservices-architect'

// ❌ Bad: Generic names
'agent-1'
'custom-agent'
'my-bot'
```

## Examples

### Example 1: Domain-Specific Developer Team

```javascript
async function createBlockchainTeam(hephaestus) {
  // Solidity Developer
  const solidityDev = await hephaestus.createSubAgent('solidity-dev', {
    baseAgent: 'coder',
    adaptations: {
      focus: 'Smart contract development',
      expertise: ['Solidity', 'OpenZeppelin', 'Hardhat'],
      patterns: [{
        name: 'Upgradeable Contract',
        code: 'contract MyContract is Initializable, UUPSUpgradeable { }'
      }]
    }
  });
  
  // Security Auditor
  const auditor = await hephaestus.createSubAgent('contract-auditor', {
    baseAgents: ['tester', 'security-manager'],
    mergeStrategy: 'union',
    adaptations: {
      focus: 'Smart contract security auditing',
      tools: ['mythril', 'slither', 'github']
    }
  });
  
  return { solidityDev, auditor };
}
```

### Example 2: Adaptive Team Creation

```javascript
async function createAdaptiveTeam(zeus, projectType) {
  // Discover suitable agents
  const candidates = await zeus.discoverAgentsForTask(projectType);
  
  // Create specialized team
  const team = [];
  for (const { agent } of candidates.slice(0, 3)) {
    const specialist = await zeus.createSubAgent(`${agent.name}-specialist`, {
      baseAgent: agent.name,
      adaptations: {
        focus: `Specialized for ${projectType}`,
        additionalInstructions: 'Work closely with team members'
      }
    });
    team.push(specialist);
  }
  
  return team;
}
```

### Example 3: Evolution Pattern

```javascript
// Start with basic agent
let agent = await god.createSubAgent('learner', {
  baseAgent: 'coder'
});

// Evolve based on experience
agent = await god.createSubAgent('experienced-learner', {
  baseAgent: 'coder',
  adaptations: {
    expertise: [...previousExpertise, 'New skill learned'],
    additionalInstructions: accumulatedWisdom
  }
});
```

## API Reference

### createSubAgent(type, config)

Creates a new sub-agent with custom configuration.

**Parameters:**
- `type` (string): Unique identifier for the agent
- `config` (object): Configuration options
  - `baseAgent` (string): Single base agent to adapt
  - `baseAgents` (array): Multiple base agents to combine
  - `mergeStrategy` (string): How to combine multiple agents
  - `adaptations` (object): Customization options
    - `name` (string): Display name
    - `focus` (string): Primary focus area
    - `expertise` (array): List of expertise areas
    - `additionalInstructions` (string): Extra guidelines
    - `tools` (array): Additional tools
    - `excludeTools` (array): Tools to remove
    - `personality` (object): Personality traits
    - `constraints` (object): Operational constraints
    - `patterns` (array): Code patterns to include

**Returns:** Agent instance

### discoverAgentsForTask(description)

Find suitable base agents for a task.

**Parameters:**
- `description` (string): Task description

**Returns:** Array of recommendations with scores

### findAgentsByCapability(capability)

Find agents with specific capability.

**Parameters:**
- `capability` (string): Capability to search for

**Returns:** Array of matching agents

### createSpecializedAgent(specialization, config)

Create agent using predefined specialization.

**Parameters:**
- `specialization` (string): One of: 'blockchain-developer', 'ml-engineer', 'full-stack-developer', 'security-auditor'
- `config` (object): Additional configuration

**Returns:** Specialized agent instance

## Troubleshooting

### Agent Creation Fails

```javascript
// Check if MD loader is initialized
if (!god.mdLoader.initialized) {
  await god.mdLoader.initialize();
}

// Verify base agent exists
const available = await god.mdLoader.getAllAgents();
console.log('Available agents:', available.map(a => a.name));
```

### Performance Issues

```javascript
// Use agent discovery instead of loading all
const recommendations = await god.discoverAgentsForTask(task);
// vs
const all = await god.mdLoader.getAllAgents(); // Slower
```

### Memory Usage

```javascript
// Clean up unused agents
god.subAgents.forEach((agent, id) => {
  if (agent.status === 'idle') {
    god.terminateSubAgent(id);
  }
});
```

## Conclusion

The MD-Based Dynamic Agent System provides a powerful way to create specialized agents that leverage the battle-tested Claude-Flow agents while adding custom capabilities. By understanding the base agents, merge strategies, and adaptation options, you can create the perfect agent for any task.

Remember: All agents execute through Claude-Flow, ensuring consistent behavior and safety while allowing unlimited customization possibilities!