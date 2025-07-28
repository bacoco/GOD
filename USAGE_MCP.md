# 🏛️ How to Use Pantheon with MCP

## Quick Start (2 Steps)

### Step 1: Start the MCP Server

In your terminal:
```bash
cd /Users/loic/develop/pantheon
./start-pantheon-mcp.sh
```

Keep this terminal open! The server needs to run in the background.

### Step 2: Use in Claude

Open Claude and type:
```
/gods-init "I want to build a recipe sharing app"
```

That's it! Zeus will start talking to you.

## Complete Setup Process

### First-Time Setup (One Time Only)

1. **Install Pantheon**:
   ```bash
   git clone https://github.com/bacoco/GOD.git pantheon
   cd pantheon
   npm install
   cd claude-flow && npm install && cd ..
   ```

2. **Configure Claude**:
   - Open: `~/Library/Application Support/Claude/claude_config.json`
   - Add this configuration:
   ```json
   {
     "mcpServers": {
       "pantheon": {
         "command": "node",
         "args": ["/Users/loic/develop/pantheon/pantheon-mcp-server.js"],
         "env": {
           "NODE_ENV": "production",
           "CLAUDE_FLOW_PATH": "/Users/loic/develop/pantheon/claude-flow"
         }
       }
     }
   }
   ```

3. **Restart Claude**

### Daily Usage

1. **Terminal**: `./start-pantheon-mcp.sh`
2. **Claude**: `/gods-init "your idea"`

## Available Commands in Claude

### `/gods-init` - Start New Project
```
/gods-init "I need a mobile app for tracking gym workouts"
```
Zeus will:
- Ask about your users
- Understand your timeline
- Learn about constraints
- Summon the right gods

### `/gods-chat` - Continue Conversation
```
/gods-chat
```
Continue talking with the current god or summon a new one.

### `/gods-council` - Major Decisions
```
/gods-council
```
Convene a divine council for architecture, design, or planning decisions.

## Example Conversation Flow

```
You: /gods-init "I want to build a task management app for remote teams"

Zeus: Greetings, mortal! I am Zeus... Tell me:
1. Who will use this creation?
2. What is your timeline?
3. Are there any constraints?

You: Remote teams of 5-20 people need to coordinate across timezones. We need an MVP in 2 weeks.

Zeus: Ah, remote collaboration! For this timeline, I recommend the Lightning Strike approach...

You: What tech stack should we use?

Zeus: *Summons Hephaestus*

Hephaestus: I can forge this with React + Node.js + PostgreSQL for quick deployment...
```

## Tips

1. **Be Specific**: The more details you provide, the better the gods can help
2. **Ask Questions**: The gods love to explain their divine wisdom
3. **Request Gods**: Ask for specific gods when you need their expertise
4. **Use Councils**: For big decisions, convene a divine council

## Stopping the Server

When done, in the terminal running the server:
- Press `Ctrl+C` twice
- This is normal - Claude-Flow keeps background processes

## Troubleshooting

### Commands Don't Appear in Claude
1. Make sure the server is running (check terminal)
2. Restart Claude
3. Check the MCP configuration

### Server Won't Start
1. Run `npm install` in the pantheon directory
2. Run `npm install` in the claude-flow directory
3. Check Node.js version (needs v18+)

### "Session not found" Error
Just start fresh with `/gods-init`

## Architecture

```
Claude (with MCP) <---> Pantheon MCP Server <---> Gods & Claude-Flow
       ↓                        ↓                         ↓
   You type              Orchestration            Real AI Agents
  /gods-init            Session Mgmt             Code Generation
```

Pantheon runs as an external server, Claude provides the conversation interface, and Claude-Flow creates real AI agents that build your project!