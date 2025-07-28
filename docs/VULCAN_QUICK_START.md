# Vulcan Quick Start Guide

## What is Vulcan?

Vulcan is a conversational tool broker that helps Pantheon gods discover and access Claude Flow's 87+ MCP tools through natural language interaction.

## Quick Integration

### 1. Basic Usage in Claude Flow

```bash
# Start Claude Flow with Pantheon
./claude-flow start --ui

# Summon Vulcan for tool discovery
./claude-flow sparc "Ask Vulcan what tools can help with performance optimization"
```

### 2. Direct God-to-Vulcan Communication

```javascript
// In any god's code
await this.messenger.send(this.name, 'vulcan', 
  'I need tools for analyzing code quality'
);
```

### 3. Common Requests

#### "I need help with X"
```
You: "I need help with performance testing"
Vulcan: Recommends performance_report, benchmark_run, bottleneck_analyze
```

#### "What does X tool do?"
```
You: "What does swarm_init do?"
Vulcan: Explains the tool with examples
```

#### "Grant me access to X"
```
You: "Grant me access to github_pr_manage"
Vulcan: Grants 7-day access (or permanent if requested)
```

## Tool Discovery Patterns

### Performance Optimization
- Request: "optimize performance"
- Tools: performance_report, bottleneck_analyze, metrics_collect

### AI/ML Development
- Request: "machine learning"
- Tools: neural_train, neural_predict, neural_patterns

### Distributed Systems
- Request: "distributed processing"
- Tools: swarm_init, parallel_execute, task_orchestrate

### Code Quality
- Request: "code review"
- Tools: github_code_review, security_scan, quality_metrics

## Access Duration

- **Default**: 7 days (auto-expires)
- **Extended**: Up to 30 days
- **Permanent**: Available with justification

## Examples

### Example 1: Developer Needing Performance Tools
```bash
./claude-flow sparc "Ask Vulcan for performance analysis tools"
# Vulcan recommends tools
# Developer requests access
# Vulcan grants temporary access
```

### Example 2: Security Audit
```bash
./claude-flow sparc "Need Vulcan's help with security scanning tools"
# Vulcan suggests security_scan, vulnerability_assess
# Explains each tool's purpose
# Grants access upon request
```

### Example 3: Complex Project
```bash
./claude-flow sparc "Tell Vulcan I'm building a distributed AI system"
# Vulcan recommends comprehensive tool suite
# Explains how tools work together
# Offers staged access approach
```

## Best Practices

1. **Start with Discovery**: Ask what tools are available before requesting
2. **Be Specific**: Describe your actual goal, not just tool names
3. **Learn First**: Ask for explanations before requesting access
4. **Temporary First**: Start with temporary access, upgrade if needed

## Monitoring Your Access

```bash
# Check what tools you have
./claude-flow sparc "Ask Vulcan what tools I currently have access to"

# Check access expiration
./claude-flow sparc "Ask Vulcan when my tool access expires"
```

## Need Help?

Just ask Vulcan naturally:
- "I'm stuck with X, what tools can help?"
- "How do I use tool Y?"
- "What's the best tool for Z?"

Vulcan is designed to understand context and provide helpful, educational responses.

---

*Remember: Vulcan's philosophy is "The right tool for the right god at the right time"*