# Pantheon MCP Setup Guide

## 🏛️ Setting Up Pantheon as an MCP Server

This guide explains how to configure and use Pantheon through Claude's Model Context Protocol (MCP).

## Prerequisites

1. **Claude Code** with MCP support installed
2. **Node.js** v18 or higher
3. **Pantheon** repository cloned to `/Users/loic/develop/pantheon`
4. **Claude-Flow** installed within Pantheon

## Installation Steps

### 1. Install Dependencies

First, ensure all dependencies are installed:

```bash
cd /Users/loic/develop/pantheon
npm install

# Install Claude-Flow dependencies
cd claude-flow
npm install
cd ..
```

### 2. Configure MCP Server

Add Pantheon to your Claude MCP configuration. The configuration file location depends on your system:

- **macOS**: `~/Library/Application Support/Claude/claude_config.json`
- **Linux**: `~/.config/Claude/claude_config.json`
- **Windows**: `%APPDATA%\Claude\claude_config.json`

Add the Pantheon server configuration:

```json
{
  "mcpServers": {
    "pantheon": {
      "command": "node",
      "args": ["/Users/loic/develop/pantheon/pantheon-mcp-server.js"],
      "env": {
        "NODE_ENV": "production",
        "CLAUDE_FLOW_PATH": "/Users/loic/develop/pantheon/claude-flow"
      },
      "metadata": {
        "name": "Pantheon",
        "description": "Divine AI orchestration system - Where gods build software",
        "version": "1.0.0",
        "author": "Pantheon Team",
        "capabilities": [
          "Project initialization with Zeus",
          "Multi-god conversations",
          "Divine council meetings", 
          "Real agent spawning",
          "Tool allocation via Vulcan",
          "Session persistence"
        ]
      }
    }
  }
}
```

**Note**: If you already have MCP servers configured, add Pantheon to your existing `mcpServers` object.

### 3. Restart Claude

After updating the configuration, restart Claude for the changes to take effect.

## Using Pantheon MCP Commands

Once configured, you'll have access to these commands in Claude:

### 🏛️ `/gods-init` - Start a New Project
```
/gods-init

# Then describe your project:
"I want to build a real-time chat application with user authentication"
```

Zeus will guide you through the project planning process, bringing in other gods as needed.

### 💬 `/gods-chat` - Continue Conversation
```
/gods-chat

# Options:
1. Continue current conversation
2. Summon a specific god (e.g., "I need to speak with Apollo about the UI design")
```

### 🏛️ `/gods-council` - Convene Divine Council
```
/gods-council

# Choose council type:
1. Architecture Review
2. Design Review
3. Code Review
4. Security Review
5. Sprint Planning
6. Emergency Debug
7. Custom Meeting
```

## How It Works

### Conversation Flow

1. **You** describe your project or request
2. **Zeus** analyzes and asks clarifying questions
3. **Specialized gods** join based on needs:
   - Apollo for design
   - Hephaestus for backend
   - Athena for AI/ML
   - Daedalus for architecture
   - And many more!
4. **Real agents** are spawned with specific MCP tools
5. **Actual code** is generated and implemented

### Session Persistence

Your conversations are saved and can be resumed later:
- Sessions persist across Claude restarts
- Each project maintains its own context
- Gods remember previous decisions

### Real Agent Creation

When gods determine it's time to build, they:
1. Spawn Claude-Flow agents with specific capabilities
2. Allocate appropriate MCP tools through Vulcan
3. Execute real development tasks
4. Report progress back to the divine council

## Troubleshooting

### MCP Server Not Starting

If you see "MCP server pantheon failed to start":

1. Check the server logs:
   ```bash
   # Run manually to see errors:
   node /Users/loic/develop/pantheon/pantheon-mcp-server.js
   ```

2. Verify Claude-Flow is installed:
   ```bash
   cd /Users/loic/develop/pantheon/claude-flow
   npm install
   ```

3. Check Node.js version:
   ```bash
   node --version  # Should be v18 or higher
   ```

### Commands Not Appearing

If `/gods-init` and other commands don't appear:

1. Ensure MCP server is in your configuration
2. Restart Claude completely
3. Check that the server path is correct

### Session Issues

If sessions aren't persisting:

1. Check write permissions in the sessions directory
2. Ensure the MCP server has proper file access
3. Try clearing old sessions: `rm -rf /Users/loic/develop/pantheon/sessions/*`

## Advanced Usage

### Direct Tool Access

You can also use individual MCP tools directly:

```
# Initialize with Zeus
pantheon_init({ project_description: "E-commerce platform" })

# Continue conversation
pantheon_respond({ message: "I need user authentication" })

# Request specific tools
pantheon_request_tools({ 
  god: "Hephaestus",
  task: "Build REST API",
  requirements: ["express", "jwt", "postgres"]
})
```

### Custom God Configurations

Gods can be customized by editing their definitions in `/Users/loic/develop/pantheon/gods/definitions/`.

### Adding New Gods

To add a new god:
1. Create definition in `gods/definitions/`
2. Add to `gods-registry.js`
3. Restart MCP server

## Example Workflow

Here's a complete example of building a task management app:

1. **Start the project**:
   ```
   /gods-init
   "I want to build a task management app with projects, tasks, and team collaboration"
   ```

2. **Zeus orchestrates**:
   - Asks about tech stack preferences
   - Determines scope and requirements
   - Summons relevant gods

3. **Gods collaborate**:
   - Daedalus designs the architecture
   - Apollo plans the UI/UX
   - Hephaestus structures the backend
   - Themis prepares testing strategy

4. **Agents are spawned**:
   - Frontend agent with React tools
   - Backend agent with Node.js tools
   - Database agent with migration tools
   - Testing agent with Jest tools

5. **Development proceeds**:
   - Real code is generated
   - Tests are written
   - Documentation is created
   - Progress is reported back

6. **Council meetings** for major decisions:
   ```
   /gods-council
   "Architecture Review - Need to decide on microservices vs monolith"
   ```

## Support

For issues or questions:
- Check logs: `node /Users/loic/develop/pantheon/pantheon-mcp-server.js`
- Review god definitions in `gods/definitions/`
- See Claude-Flow documentation for agent capabilities

Remember: The gods are here to help you build great software. They bring millennia of wisdom to modern development challenges!