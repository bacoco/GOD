# 🏛️ Pantheon - Quick Start Guide

## One-Time Setup (2 minutes)

### 1. Install Pantheon

```bash
# Clone and install
git clone https://github.com/bacoco/GOD.git pantheon
cd pantheon
npm install
cd claude-flow && npm install && cd ..
```

### 2. Configure Claude

Add to your Claude MCP configuration:

**macOS**: `~/Library/Application Support/Claude/claude_config.json`  
**Linux**: `~/.config/Claude/claude_config.json`  
**Windows**: `%APPDATA%\Claude\claude_config.json`

```json
{
  "mcpServers": {
    "pantheon": {
      "command": "node",
      "args": ["/path/to/pantheon/pantheon-mcp-server.js"],
      "env": {
        "NODE_ENV": "production",
        "CLAUDE_FLOW_PATH": "/path/to/pantheon/claude-flow"
      }
    }
  }
}
```

### 3. Restart Claude

Close and reopen Claude for the changes to take effect.

## Usage (Forever After)

In Claude, simply use these commands:

```
/gods-init "build a task management app"
/gods-chat
/gods-council
```

That's it! The gods are now built into Claude! 🏛️⚡

## Available Commands

- `/gods-init` - Start new project with Zeus
- `/gods-chat` - Continue conversation with gods
- `/gods-council` - Convene divine council meeting

## Quick Examples

### Creating a Web App
```
/gods-init "I need a modern blog platform with comments"
```

Zeus will:
1. Ask clarifying questions
2. Bring in specialist gods
3. Create your complete project

### Continuing Work
```
/gods-chat
```

Resume your conversation with the gods anytime.

### Major Decisions
```
/gods-council
Choose: Architecture Review
Topic: "Should we use REST or GraphQL?"
```

## How It Works

1. **You describe** what you want to build
2. **Zeus orchestrates** the project
3. **Specialist gods** join as needed:
   - Apollo for design
   - Hephaestus for backend
   - Athena for AI features
   - And many more!
4. **Real code** is generated
5. **You own everything** - no lock-in

## Troubleshooting

If commands don't appear:
1. Make sure MCP server path is correct in config
2. Restart Claude completely
3. Check [MCP Setup Guide](MCP_SETUP.md) for details

## No Terminal Needed!

Unlike before, you don't need to:
- Run any terminal commands
- Navigate to project directories  
- Execute complex scripts

Everything happens directly in Claude! ✨