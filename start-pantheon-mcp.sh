#!/bin/bash

# 🏛️ Pantheon MCP Server Launcher
# This script starts the Pantheon MCP server for use with Claude

set -e

echo "🏛️ Pantheon MCP Server Launcher"
echo "================================"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if dependencies are installed
if [ ! -d "$SCRIPT_DIR/node_modules/@modelcontextprotocol" ]; then
    echo "❌ MCP dependencies not found!"
    echo ""
    echo "Please run the installer first:"
    echo "  ./install-pantheon-mcp.sh"
    echo ""
    exit 1
fi

# Check if Claude-Flow is installed
if [ ! -d "$SCRIPT_DIR/claude-flow/node_modules" ]; then
    echo "❌ Claude-Flow not installed!"
    echo ""
    echo "Please run:"
    echo "  cd claude-flow && npm install"
    echo ""
    exit 1
fi

echo "✅ All dependencies found"
echo ""

# Show current configuration
echo "📋 Current Configuration:"
echo "  Pantheon Path: $SCRIPT_DIR"
echo "  Claude-Flow: $SCRIPT_DIR/claude-flow"
echo ""

# Check if MCP is configured in Claude
echo "🔍 Checking Claude configuration..."
echo ""
echo "Make sure you've added Pantheon to your Claude MCP config:"
echo ""
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "  ~/Library/Application Support/Claude/claude_config.json"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "  ~/.config/Claude/claude_config.json"
else
    echo "  Check MCP_SETUP.md for your platform"
fi
echo ""

# Start the server
echo "🚀 Starting Pantheon MCP Server..."
echo ""
echo "Once the server starts:"
echo "  1. Keep this terminal open"
echo "  2. Open Claude"
echo "  3. Use these commands:"
echo "     /gods-init \"your project idea\""
echo "     /gods-chat"
echo "     /gods-council"
echo ""
echo "Press Ctrl+C (twice) to stop the server"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

# Start the MCP server
node "$SCRIPT_DIR/pantheon-mcp-server.js"