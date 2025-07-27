# MD-Based Dynamic Agent System

## Overview

The MD-Based Dynamic Agent System allows Pantheon gods to create custom AI agents by leveraging Claude-Flow's 54+ pre-defined agent templates. This powerful system enables unlimited customization while maintaining full execution compatibility with Claude-Flow.

## Key Features

- **Dynamic Agent Creation**: Gods can create specialized agents on-demand
- **Agent Adaptation**: Customize existing agents with new capabilities
- **Agent Combination**: Merge multiple agents to create powerful hybrids
- **Smart Discovery**: Find and recommend agents based on task requirements
- **Execution Compatibility**: All custom agents execute through Claude-Flow
- **Heritage Tracking**: Custom agents track their base agent lineage

## Architecture

### Core Components

1. **AgentMDLoader** (`gods/lib/agent-md-loader.js`)
   - Loads and indexes all Claude-Flow agent MD files
   - Provides search and discovery capabilities
   - Caches agent data for performance

2. **AgentAdapter** (`gods/lib/agent-adapter.js`)
   - Adapts single agents with customizations
   - Combines multiple agents using merge strategies
   - Supports 5 different merge strategies

3. **AgentMDGenerator** (`gods/lib/agent-md-generator.js`)
   - Generates well-structured MD files for custom agents
   - Creates YAML frontmatter with proper configuration
   - Ensures Claude-Flow compatibility

4. **Enhanced BaseGod** (`gods/lib/base-god.js`)
   - Extended createSubAgent() method
   - Support for baseAgent and baseAgents parameters
   - Integrated agent discovery functions

## How It Works

### 1. Loading Base Agents

When a god initializes, it loads all available Claude-Flow agents:

```javascript
// Automatic during god initialization
const loader = new AgentMDLoader(claudeFlowPath);
await loader.initialize();
// Loads 54+ agents from claude-flow/.claude/agents/
```

### 2. Creating Custom Agents

Gods can create custom agents in three ways:

#### A. Simple Adaptation
```javascript
const customAgent = await god.createSubAgent('custom-coder', {
  baseAgent: 'coder',  // Use Claude-Flow's coder as base
  adaptations: {
    focus: 'Blockchain development',
    expertise: ['Solidity', 'Web3'],
    additionalInstructions: 'Always prioritize security'
  }
});
```

#### B. Agent Combination
```javascript
const hybridAgent = await god.createSubAgent('fullstack-dev', {
  baseAgents: ['backend-dev', 'frontend-dev'],
  mergeStrategy: 'union',  // Combine all capabilities
  adaptations: {
    name: 'Full-Stack Developer',
    focus: 'End-to-end development'
  }
});
```

#### C. Predefined Specializations
```javascript
const specialist = await god.createSpecializedAgent('blockchain-developer');
// Uses pre-configured templates
```

### 3. Agent Discovery

Gods can discover suitable agents for tasks:

```javascript
// Find agents for a specific task
const recommendations = await god.discoverAgentsForTask(
  'Build a real-time chat application'
);

// Find agents by capability
const testers = await god.findAgentsByCapability('test');
```

## Merge Strategies

When combining multiple agents, you can choose from:

1. **union** - Combines all features from all agents
2. **intersection** - Only keeps common features
3. **weighted** - Prioritizes certain agents (with weights)
4. **best-features** - Cherry-picks the best from each
5. **capabilities-union** - Organizes by capability domains

## Example Workflows

### Creating a Blockchain Team

```javascript
// Zeus creates a specialized blockchain development team
const blockchainTeam = {
  architect: await zeus.createSubAgent('blockchain-architect', {
    baseAgent: 'architect',
    adaptations: {
      focus: 'DeFi architecture',
      expertise: ['Smart contracts', 'Layer 2 solutions']
    }
  }),
  
  developer: await zeus.createSubAgent('solidity-dev', {
    baseAgent: 'coder',
    adaptations: {
      focus: 'Smart contract development',
      expertise: ['Solidity', 'Hardhat', 'OpenZeppelin']
    }
  }),
  
  auditor: await zeus.createSubAgent('security-auditor', {
    baseAgents: ['tester', 'security-analyst'],
    mergeStrategy: 'best-features',
    adaptations: {
      focus: 'Smart contract security auditing'
    }
  })
};
```

### Dynamic Task Force Creation

```javascript
// Analyze task and create optimal team
const task = "Build a machine learning pipeline";
const recommendedAgents = await zeus.discoverAgentsForTask(task);

// Create specialized team based on recommendations
const mlTeam = await Promise.all(
  recommendedAgents.slice(0, 3).map(async (agent, i) => {
    return zeus.createSubAgent(`ml-specialist-${i}`, {
      baseAgent: agent.name,
      adaptations: {
        focus: 'Machine learning pipeline development',
        priority: agent.relevance
      }
    });
  })
);
```

## Benefits

1. **Leverage Existing Knowledge**: Use battle-tested Claude-Flow agents as starting points
2. **Infinite Customization**: Create agents tailored to any specific need
3. **Maintain Compatibility**: All agents work seamlessly with Claude-Flow
4. **Dynamic Teams**: Build specialized teams on-demand
5. **No Duplication**: Reuse and extend existing agent capabilities

## Testing

The system includes comprehensive tests (`tests/test-md-system.js`) that verify:
- Agent loading and indexing
- Custom agent creation
- Agent combination with all merge strategies
- Discovery and recommendation algorithms
- MD generation and validation

Run tests with:
```bash
node test-md-system.js
```

## Implementation Status

✅ **Completed**:
- AgentMDLoader with caching and indexing
- AgentAdapter with 5 merge strategies
- AgentMDGenerator with validation
- BaseGod integration
- Predefined specializations
- Comprehensive test suite
- Full Claude-Flow compatibility

## Next Steps

1. Create more predefined specializations
2. Add agent performance tracking
3. Implement agent evolution based on task results
4. Create visual agent builder UI
5. Add agent marketplace for sharing custom agents

## Related Documentation

- [MD System Implementation Summary](MD_SYSTEM_IMPLEMENTATION_SUMMARY.md)
- [Hybrid Orchestration](HYBRID_ORCHESTRATION.md)
- [Implementation Plan](IMPLEMENTATION_PLAN.md)