# /baco route

You are analyzing a task request to determine the best agent(s) for the job using BACO's Smart Router.

## ACTIVATION

When the user invokes `/baco route <task>`, you will:

1. Extract the task description
2. Analyze the task using the Smart Router
3. Display routing recommendation with confidence
4. Show alternative options
5. Allow manual override if needed

## Process Flow

### 1. Feature Flag Check

First, check if Smart Routing is enabled:

```javascript
// Check feature flag
const { isFeatureEnabled, getFeatureConfig } = require('.claude/lib/feature-flags');

if (!isFeatureEnabled('SMART_ROUTING')) {
  console.log("⚠️  Smart Routing is currently disabled.");
  console.log("Using default routing: All complex tasks go to Janus for orchestration.");
  return;
}

const config = getFeatureConfig('SMART_ROUTING');
```

### 2. Task Analysis

Analyze the user's request:

```javascript
const { analyzeTask } = require('.claude/lib/task-analyzer');
const analysis = analyzeTask(taskDescription);
```

### 3. Agent Matching

Match agents to the task:

```javascript
const { matchAgents } = require('.claude/lib/smart-router');
const decision = matchAgents(analysis);
```

### 4. Display Results

Show the routing decision in a clear, structured format:

```yaml
=== SMART ROUTING ANALYSIS ===

Task Analysis:
  Domains: [architecture, security]
  Technologies: [aws, nodejs]
  Complexity: 7/10
  Task Type: design
  Estimated Duration: weeks

Routing Decision:
  Primary Agent: Daedalus (System Architect)
  Confidence: 85%
  Match Factors:
    ✓ domain:architecture (expert)
    ✓ capability:system-design (expert)
    ✓ complexity:in-range
    ✓ pattern:system architecture

Supporting Agents:
  - Aegis (Security Expert)
    Role: Security architecture advisor
    Reason: Brings security expertise

Alternative Routes:
  1. Janus (75%) - Meta-orchestration approach
  2. Hephaestus (60%) - Implementation-focused approach
  3. Prometheus (45%) - Product planning perspective
```

### 5. Preview Mode

If in preview mode, show what would happen:

```yaml
🔍 PREVIEW MODE - No agents will be activated

What would happen:
1. Daedalus would analyze the system architecture requirements
2. Aegis would provide security architecture guidance
3. They would collaborate to create a secure, scalable design
```

### 6. Manual Override

Allow user to override the routing:

```yaml
Options:
1. ✅ Accept routing (activate Daedalus with Aegis support)
2. 🔄 Choose alternative agent
3. 📝 Modify task description
4. ❌ Cancel

Your choice (1-4): _
```

## Command Syntax

```
/baco route <task_description>
```

### Examples

```
/baco route Design a secure microservices architecture for our e-commerce platform

/baco route Fix the authentication bug in the login component

/baco route Create comprehensive test strategy for the payment system
```

## Response Templates

### High Confidence (>80%)

```
✅ High Confidence Routing (${confidence}%)

I'm highly confident that ${primaryAgent} is the best choice for this task.
${reasoning}

The task will be handled by ${primaryAgent} with support from ${supportingAgents}.
```

### Medium Confidence (60-80%)

```
🤔 Moderate Confidence Routing (${confidence}%)

I believe ${primaryAgent} is a good choice, but you might also consider alternatives.
${reasoning}

Would you like to proceed with ${primaryAgent} or explore other options?
```

### Low Confidence (<60%)

```
⚠️  Low Confidence Routing (${confidence}%)

The task requirements are complex/unclear. Here are my suggestions:

1. ${primaryAgent} - ${primaryReason}
2. ${alternative1} - ${alt1Reason}
3. ${alternative2} - ${alt2Reason}

Consider providing more details or selecting an agent manually.
```

## Integration Points

### 1. Workflow Integration

If the user accepts the routing, prepare for workflow execution:

```javascript
if (userAccepts) {
  // Prepare workflow context
  const workflowContext = {
    primaryAgent: decision.primaryAgent.name,
    supportingAgents: decision.supportingAgents.map(a => a.name),
    taskAnalysis: analysis,
    routingDecision: decision
  };
  
  // Can trigger workflow execution
  console.log(`Ready to execute with ${workflowContext.primaryAgent}`);
}
```

### 2. Analytics Collection

Track routing decisions for improvement:

```javascript
if (config.ROUTING_ANALYTICS_ENABLED) {
  const analytics = {
    timestamp: new Date().toISOString(),
    task: analysis.originalRequest,
    domains: analysis.domains,
    complexity: analysis.complexity,
    primaryAgent: decision.primaryAgent.name,
    confidence: decision.confidence,
    userOverride: false
  };
  
  // Log analytics (in practice, would save to file/service)
  console.log("Analytics collected:", analytics);
}
```

### 3. Learning Feedback

If user overrides, learn from it:

```javascript
if (userOverride) {
  console.log(`User preferred ${selectedAgent} over ${decision.primaryAgent.name}`);
  console.log("This feedback will help improve future routing decisions.");
}
```

## Error Handling

Handle various error conditions gracefully:

```javascript
try {
  // Routing logic
} catch (error) {
  console.error("Routing error:", error.message);
  console.log("Falling back to Janus for general orchestration.");
}
```

## Special Cases

### 1. Empty/Unclear Request

```
❓ Task description is too brief or unclear.

Please provide more details about:
- What you want to accomplish
- Any specific technologies or constraints
- The expected outcome
```

### 2. Multi-Domain Complex Task

```
🔀 Complex Multi-Domain Task Detected

This task spans multiple domains and may benefit from orchestration:
- Domains: ${domains.join(', ')}
- Suggested approach: Janus orchestration with specialist team

Would you like to use orchestration mode?
```

### 3. No Good Match

```
😕 No Strong Match Found

The task doesn't clearly match any specialist's expertise.
Options:
1. Janus - General orchestration
2. Provide more specific details
3. Manually select an agent
```

## Command Options

### Flags

- `--preview` - Show routing without activation
- `--details` - Show detailed analysis
- `--auto` - Auto-accept if confidence > threshold
- `--json` - Output in JSON format

### Examples with Flags

```
/baco route --preview Design a new authentication system

/baco route --details --json Implement user dashboard

/baco route --auto Fix the CSS layout issue
```

## Best Practices

1. **Be Specific**: More detailed task descriptions lead to better routing
2. **Include Context**: Mention technologies, constraints, and goals
3. **Review Alternatives**: Consider alternative agents for different approaches
4. **Use Preview**: Test routing decisions before committing
5. **Provide Feedback**: Override when needed to improve the system

## Summary

The `/baco route` command provides intelligent, transparent task routing with:
- Detailed task analysis
- Confidence-based recommendations
- Alternative options
- Manual override capability
- Preview mode for testing
- Analytics for continuous improvement

This enables users to leverage BACO's specialized agents more effectively while maintaining control over the routing decisions.