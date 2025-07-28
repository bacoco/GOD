# 🛠️ MCP Tools in Pantheon - Simple Explanation

## What are MCP Tools?

Think of **MCP (Model Control Protocol) tools** as special abilities that gods and agents can use. Just like a carpenter has different tools (hammer, saw, drill), Pantheon gods have different MCP tools to help them work.

## 🎯 The Big Picture

Claude Flow comes with **87+ MCP tools** that provide capabilities like:
- 🌐 Web browsing and searching
- 📁 File system operations
- 🔧 Desktop automation
- 🐙 GitHub integration
- 📊 Database connections
- 🖥️ Terminal commands
- And many more...

## 🏛️ How Gods Access MCP Tools

### 1. **Tool Assignment by God Type**

Each god has specific tools assigned based on their role:

```javascript
// In pantheon-core.js
this.toolAssignments = {
  zeus: ['ALL'],           // Zeus can use ALL 87+ tools
  janus: ['ALL'],          // Janus can use ALL 87+ tools
  daedalus: ['github', 'context7', 'browsermcp'],
  hephaestus: ['github', 'desktop-commander', 'context7', 'claude-task-master'],
  apollo: ['desktop-commander', 'browsermcp', 'github'],
  // ... and so on for each god
};
```

### 2. **Special Access: Zeus & Janus**

- **Zeus** and **Janus** have `['ALL']` - meaning they can access all 87+ MCP tools
- Other gods have specific tools relevant to their expertise

## 🤖 How Created Agents Access Tools

### The Simple Answer: **They Inherit from Their Creator**

When a god creates an agent, the agent gets access to the same tools as the god:

```javascript
// When Zeus creates an agent
const agent = await zeus.createSubAgent('researcher');
// This agent can use ALL tools because Zeus has ALL tools

// When Apollo creates an agent  
const designAgent = await apollo.createSubAgent('ui-designer');
// This agent can use: desktop-commander, browsermcp, github
// (Same as Apollo's tools)
```

## 📊 Tool Inheritance Flow

```
Claude Flow (87+ MCP Tools)
    ↓
Pantheon Gods (Specific tool access)
    ↓
Created Agents (Inherit creator's tools)
```

### Real Example:

1. **Claude Flow** has all MCP tools available
2. **Hephaestus** (coding god) gets: `github`, `desktop-commander`, `context7`, `claude-task-master`
3. **Agent created by Hephaestus** inherits the same 4 tools

## 🎨 Practical Examples

### Example 1: Zeus Creates a Research Agent
```javascript
// Zeus has ALL tools
const researcher = await zeus.createSubAgent('researcher');

// The researcher can now:
// - Browse the web (browsermcp)
// - Search Google (google-search)
// - Read files (desktop-commander)
// - Access GitHub (github)
// - Run terminal commands (desktop-commander)
// - And use all other 80+ tools!
```

### Example 2: Apollo Creates a Design Agent
```javascript
// Apollo has specific tools for design
const designer = await apollo.createSubAgent('ui-designer');

// The designer can:
// - Control desktop apps (desktop-commander)
// - Browse for inspiration (browsermcp)  
// - Manage design files on GitHub (github)
// BUT cannot use tools Apollo doesn't have
```

## 🔑 Key Points to Remember

1. **Tool Access is Hierarchical**
   - Claude Flow → Gods → Agents
   - Each level inherits from above

2. **Zeus & Janus are Special**
   - They have ALL tools
   - Any agent they create also has ALL tools

3. **Other Gods are Specialized**
   - They have specific tools for their role
   - Their agents inherit only those specific tools

4. **The Task Tool is Special**
   - If a god has the `Task` tool, their agents can create more agents
   - This enables multi-level agent hierarchies
   - Gods like Zeus, Janus, Hephaestus, and Themis have this capability
   - The `claude-task-master` tool provides advanced task orchestration

## 🚀 Why This Matters

This design ensures:
- **Security**: Gods only get tools they need
- **Efficiency**: Agents aren't overloaded with unnecessary tools
- **Flexibility**: Zeus can create any type of agent with full capabilities
- **Specialization**: Domain experts (like Apollo) create focused agents

## 📋 Quick Reference

| God | Tool Access | What Their Agents Can Do |
|-----|------------|-------------------------|
| Zeus | ALL (87+ tools) | Everything! Full access |
| Janus | ALL (87+ tools) | Everything! Full access |
| Hephaestus | 4 specific tools | Code, use GitHub, control desktop |
| Apollo | 3 specific tools | Design, browse web, use GitHub |
| Daedalus | 3 specific tools | Architecture, browse, use context |
| ... | ... | ... |

## 🗂️ Available MCP Tool Categories

While there are 87+ MCP tools in Claude Flow, here are the main categories gods use:

### Core Tools Used by Gods:
- **github** - Full GitHub integration (PRs, issues, repos)
- **desktop-commander** - File system and desktop control
- **browsermcp** - Web browsing capabilities
- **context7** - Advanced context management
- **claude-task-master** - Agent creation and orchestration
- **playwright** - Web automation and testing
- **i18next-parser** - Internationalization
- **grammarly-mcp** - Writing assistance
- **framer-motion-mcp** - Animation tools

### When Gods Have "ALL" Tools:
Zeus and Janus can access all 87+ tools including:
- Database connections (PostgreSQL, MongoDB, etc.)
- Cloud services (AWS, Google Cloud, etc.)
- Development tools (Docker, Kubernetes, etc.)
- Analytics and monitoring
- Communication platforms
- And many more...

## 💡 Simple Analogy

Think of it like a company:
- **CEO (Zeus)**: Has keys to everything
- **Department Heads (Other gods)**: Have keys to their department
- **Employees (Created agents)**: Get the same keys as their manager

When the CEO creates an assistant, that assistant gets executive access.
When a department head creates an assistant, that assistant only gets department access.

---

**Bottom Line**: Any agent created by a god can use the same MCP tools as their creator. If Zeus (with ALL tools) creates an agent, that agent has ALL tools. If Apollo (with 3 tools) creates an agent, that agent has those same 3 tools.