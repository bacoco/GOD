#!/bin/bash

# 🏛️ Pantheon Quick Launcher
# Simple script to get started with Pantheon gods

echo "🏛️ Launching Pantheon..."
echo ""

# Check if claude-flow is initialized in current directory
if [ ! -d ".claude/commands" ]; then
    echo "📦 Initializing claude-flow in this directory..."
    npx claude-flow init
    echo ""
fi

echo "✅ Pantheon is ready!"
echo ""
echo "🏛️ Available commands in Claude:"
echo ""
echo "  /gods         - Show all available commands"
echo "  /gods-init    - Start a new project"
echo "  /gods-status  - Check project progress"
echo "  /gods-council - Convene a divine meeting"
echo "  /gods-tools   - Request tools from Vulcan"
echo "  /gods-chat    - Chat with a specific god"
echo "  /gods-help    - Get detailed help"
echo ""
echo "💡 Quick start: Type '/gods-init \"your project idea\"' in Claude"
echo ""