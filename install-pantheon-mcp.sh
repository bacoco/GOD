#!/bin/bash

# 🏛️ Pantheon MCP Installer
# This script sets up Pantheon as an MCP server for Claude

set -e  # Exit on error

echo "🏛️ Pantheon MCP Installer"
echo "========================"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CLAUDE_FLOW_DIR="$SCRIPT_DIR/claude-flow"

# Step 1: Check if claude-flow exists
if [ ! -d "$CLAUDE_FLOW_DIR" ]; then
    echo "📦 Claude-Flow not found. Installing..."
    
    # Check if install-claude-flow.js exists
    if [ -f "$SCRIPT_DIR/install-claude-flow.js" ]; then
        node "$SCRIPT_DIR/install-claude-flow.js"
    else
        echo "❌ Error: install-claude-flow.js not found!"
        echo "Please ensure you've cloned the complete Pantheon repository"
        exit 1
    fi
    
    # Wait for installation to complete
    echo "⏳ Waiting for installation to complete..."
    sleep 3
else
    echo "✅ Claude-Flow found at: $CLAUDE_FLOW_DIR"
fi

# Step 2: Install Pantheon dependencies
echo ""
echo "📦 Installing Pantheon dependencies..."
cd "$SCRIPT_DIR"
npm install

# Step 3: Install claude-flow dependencies
echo ""
echo "📦 Installing Claude-Flow dependencies..."
cd "$CLAUDE_FLOW_DIR"
npm install
cd "$SCRIPT_DIR"

# Step 4: Verify MCP dependencies
echo ""
echo "🔍 Verifying MCP dependencies..."
if [ ! -d "$SCRIPT_DIR/node_modules/@modelcontextprotocol" ]; then
    echo "❌ Error: MCP SDK not found!"
    echo "Please run: npm install @modelcontextprotocol/sdk"
    exit 1
fi

echo "✅ All dependencies installed!"

# Step 5: Create MCP configuration template
echo ""
echo "📝 Creating MCP configuration template..."

CONFIG_TEMPLATE='{
  "mcpServers": {
    "pantheon": {
      "command": "node",
      "args": ["'$SCRIPT_DIR'/pantheon-mcp-server.js"],
      "env": {
        "NODE_ENV": "production",
        "CLAUDE_FLOW_PATH": "'$CLAUDE_FLOW_DIR'"
      }
    }
  }
}'

echo "$CONFIG_TEMPLATE" > "$SCRIPT_DIR/mcp-config-pantheon.json"

# Step 6: Detect Claude configuration location
echo ""
echo "🔍 Detecting Claude configuration..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
    PLATFORM="macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CLAUDE_CONFIG_DIR="$HOME/.config/Claude"
    PLATFORM="Linux"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    CLAUDE_CONFIG_DIR="$APPDATA/Claude"
    PLATFORM="Windows"
else
    CLAUDE_CONFIG_DIR=""
    PLATFORM="Unknown"
fi

# Step 7: Show instructions
echo ""
echo "🏛️ Installation complete! 🎉"
echo ""
echo "✨ Next Steps:"
echo ""
echo "1. Add Pantheon to your Claude MCP configuration:"
echo "   Platform: $PLATFORM"
if [ -n "$CLAUDE_CONFIG_DIR" ]; then
    echo "   Config location: $CLAUDE_CONFIG_DIR/claude_config.json"
else
    echo "   Config location varies by platform:"
    echo "   - macOS: ~/Library/Application Support/Claude/claude_config.json"
    echo "   - Linux: ~/.config/Claude/claude_config.json"
    echo "   - Windows: %APPDATA%\\Claude\\claude_config.json"
fi
echo ""
echo "2. Add this configuration to your claude_config.json:"
echo ""
cat "$SCRIPT_DIR/mcp-config-pantheon.json"
echo ""
echo "3. Restart Claude"
echo ""
echo "4. Use these commands in Claude:"
echo "   /gods-init \"your project idea\""
echo "   /gods-chat"
echo "   /gods-council"
echo ""
echo "📖 For detailed setup instructions, see: MCP_SETUP.md"
echo ""

# Optional: Test the MCP server
echo "Would you like to test the MCP server? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "🧪 Testing MCP server..."
    echo "Press Ctrl+C to stop the test"
    echo ""
    node "$SCRIPT_DIR/pantheon-mcp-server.js"
fi