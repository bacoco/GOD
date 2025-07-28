# 🏛️ Pantheon Setup for Claude Desktop

## Quick Setup (3 minutes)

### 1. Install Pantheon

```bash
# Clone and install
git clone https://github.com/bacoco/GOD.git pantheon
cd pantheon
npm install
cd claude-flow && npm install && cd ..
```

### 2. Configure Claude Desktop

Find your configuration file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

Add this configuration:
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

**Important**: Replace `/path/to/pantheon` with your actual path (e.g., `/Users/loic/develop/pantheon`)

### 3. Restart Claude Desktop

Completely quit and reopen Claude Desktop.

## Using Pantheon

Claude Desktop automatically manages the MCP server - no terminal needed!

### Start a New Project
```
/gods-init "I want to build a recipe sharing app"
```

### Continue Conversation
```
/gods-chat
```

### Convene Divine Council
```
/gods-council
```

## How It Works in Claude Desktop

```
Claude Desktop
    ↓
Automatically starts → Pantheon MCP Server
    ↓
You type → /gods-init
    ↓
Zeus appears → Guides your project
    ↓
Other gods join → Build your app
```

## Example Conversation

```
You: /gods-init "I need a mobile app for tracking expenses"

Zeus: Greetings, mortal! I am Zeus, King of Olympus...
      Tell me about your users - who will track these expenses?

You: Small business owners who need to track receipts on the go

Zeus: Ah, entrepreneurs! They need swift, reliable tools...
      What is your timeline?

You: I need an MVP in 3 weeks

Zeus: *Thunder rumbles* A Lightning Strike approach then!
      Let me summon Apollo for the mobile interface...

Apollo: *Radiant light fills the room*
        For mobile expense tracking, I envision a camera-first design...
```

## Verifying It Works

1. Open Claude Desktop
2. Type `/` - you should see:
   - `/gods-init`
   - `/gods-chat`
   - `/gods-council`

If you don't see these commands:
- Check your configuration file path
- Make sure you restarted Claude Desktop
- Verify Pantheon is installed correctly

## Troubleshooting

### Commands Don't Appear

1. **Check config file location**:
   ```bash
   # macOS
   ls ~/Library/Application\ Support/Claude/
   
   # Should show: claude_desktop_config.json
   ```

2. **Verify JSON syntax**:
   - No trailing commas
   - Proper quotes around strings
   - Correct path separators for your OS

3. **Check installation**:
   ```bash
   cd /path/to/pantheon
   node pantheon-mcp-server.js
   # Should show: "Pantheon MCP Server Ready!"
   ```

### "Failed to start MCP server"

1. Check Node.js version:
   ```bash
   node --version  # Should be v18 or higher
   ```

2. Reinstall dependencies:
   ```bash
   cd pantheon
   rm -rf node_modules package-lock.json
   npm install
   ```

### Session Errors

If you see "Session not found", just start fresh with `/gods-init`

## Advanced Configuration

### Multiple MCP Servers

You can have multiple MCP servers:
```json
{
  "mcpServers": {
    "pantheon": {
      "command": "node",
      "args": ["/path/to/pantheon/pantheon-mcp-server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    },
    "another-server": {
      "command": "python",
      "args": ["/path/to/another/server.py"]
    }
  }
}
```

### Development Mode

For debugging:
```json
{
  "mcpServers": {
    "pantheon": {
      "command": "node",
      "args": ["/path/to/pantheon/pantheon-mcp-server.js"],
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "pantheon:*"
      }
    }
  }
}
```

## Benefits of Claude Desktop

- **No Terminal Required**: MCP server runs automatically
- **Persistent Sessions**: Conversations saved across restarts
- **Native Experience**: Commands integrated into Claude
- **Auto-Updates**: Claude Desktop handles updates

## Next Steps

1. Try: `/gods-init "your first project idea"`
2. Explore different gods and their expertise
3. Use councils for major decisions
4. Let the gods build your project!

Remember: The gods are here to help. Be specific about your needs, and they'll handle the divine implementation!