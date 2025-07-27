# 🏛️ Using Pantheon with Claude Code CLI

## Quick Setup (One Time)

```bash
# Make the script executable
chmod +x claude-pantheon.js

# Create a global alias (add to your ~/.zshrc or ~/.bashrc)
alias pantheon="/Users/loic/develop/pantheon/claude-pantheon.js"

# Or create a symlink
ln -s /Users/loic/develop/pantheon/claude-pantheon.js /usr/local/bin/pantheon
```

## Usage in Claude Code

### Method 1: Direct Execution
```bash
# In Claude Code, just run:
node /Users/loic/develop/pantheon/claude-pantheon.js "Build a task management app"
```

### Method 2: With Alias (Recommended)
```bash
# After setting up the alias:
pantheon "Create a REST API for blog with authentication"
pantheon "Summon Apollo to design a dashboard"
pantheon "Ask Daedalus about microservices architecture"
```

### Method 3: Task Tool in Claude Code
When using Claude Code, you can use the Task tool:
```
Task: Use Pantheon to build an e-commerce platform
```

## Examples

### 1. Build Something
```bash
pantheon "Build a real-time chat application with React and WebSockets"
```
This will:
- Zeus orchestrates the project
- Prometheus defines requirements
- Apollo designs the UI
- Daedalus creates the architecture
- Returns a complete plan with PRD

### 2. Specific God Help
```bash
# UI/UX Design
pantheon "Summon Apollo to design a mobile app interface"

# Architecture
pantheon "Ask Daedalus about scaling a microservices system"

# Development
pantheon "Use Hephaestus to implement user authentication"

# Testing
pantheon "Ask Themis to create a test plan"
```

### 3. General Requests
```bash
# Code review
pantheon "Review the code quality of my React components"

# Planning
pantheon "Plan migration from monolith to microservices"

# Analysis
pantheon "Analyze security vulnerabilities in my API"
```

## Integration with Your Workflow

### In Your Development Process
1. **Planning Phase**: 
   ```bash
   pantheon "Plan a social media analytics dashboard"
   ```

2. **Design Phase**:
   ```bash
   pantheon "Summon Apollo for UI design"
   ```

3. **Implementation**:
   ```bash
   pantheon "Use Hephaestus to implement the backend"
   ```

4. **Testing**:
   ```bash
   pantheon "Ask Themis to test the system"
   ```

### With Claude Code's Tools
You can combine Pantheon with Claude Code's native tools:

```javascript
// In Claude Code
Task("Use Pantheon to design the architecture")
// Then use the result with other tools
Write("architecture.md", pantheonResult)
```

## Advanced Usage

### Conversational Mode
For complex projects, use conversational planning:
```bash
# This starts a full conversational planning session
pantheon "I need a SaaS platform for project management with AI features"
```

### Batch Operations
Create a script for multiple operations:
```bash
#!/bin/bash
# pantheon-workflow.sh

echo "🏛️ Starting Pantheon Workflow"

# 1. Planning
pantheon "Plan e-commerce platform" > plan.md

# 2. Architecture 
pantheon "Ask Daedalus for microservices design" > architecture.md

# 3. Implementation
pantheon "Use Hephaestus to create boilerplate" > implementation.md

echo "✅ Workflow complete!"
```

## Tips for Best Results

1. **Be Specific**: 
   - ❌ "Build something"
   - ✅ "Build a REST API for task management with user auth"

2. **Use God Names for Specialized Tasks**:
   - UI/UX → Apollo
   - Architecture → Daedalus
   - Coding → Hephaestus
   - Testing → Themis
   - Security → Aegis

3. **Combine with Claude Code**:
   ```
   # Let Pantheon plan, then implement with Claude Code
   pantheon "Plan authentication system" 
   # Then use Claude Code to implement the plan
   ```

## Building a UI (Future)

When you build your UI, you can use the Pantheon API directly:

```javascript
// Your future UI can call Pantheon like this
import { PantheonCore } from './gods/lib/pantheon-core.js';

const pantheon = new PantheonCore();
await pantheon.initialize();

// Direct API usage
const zeus = await pantheon.summonGod('zeus');
const result = await zeus.orchestrate({
  request: userInput,
  type: 'web-app'
});
```

## Troubleshooting

- **"Command not found"**: Make sure you've set up the alias or symlink
- **"Cannot find module"**: Run from the pantheon directory or use absolute paths
- **No output**: Add `--verbose` flag for detailed output

## Next Steps

1. Set up the alias for easy access
2. Try building something: `pantheon "Build a todo app"`
3. Explore different gods for specialized tasks
4. Integrate into your Claude Code workflow