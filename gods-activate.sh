#!/bin/bash

# 🏛️ One-Command Pantheon Activator
# Just run this in any project to enable /gods commands

# Get the directory where this script is located
PANTHEON_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if we're in Pantheon directory
if [ "$PWD" = "$PANTHEON_DIR" ]; then
    echo "❌ Don't run this in the Pantheon directory!"
    echo "📁 Change to your project directory first, then run:"
    echo "   $0"
    exit 1
fi

echo "🏛️ Activating Pantheon Gods..."
echo ""

# Run claude-flow init which will copy all the commands
npx claude-flow@alpha init --quiet 2>/dev/null || npx claude-flow@alpha init

echo ""
echo "✨ Pantheon Gods are now active in this project!"
echo ""
echo "🏛️ Use these commands in Claude:"
echo "  /gods         - Show all commands"
echo "  /gods-init    - Start a new project"
echo "  /gods-chat    - Talk to any god"
echo ""
echo "⚡ Quick start: /gods-init \"your idea\""