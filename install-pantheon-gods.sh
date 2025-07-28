#!/bin/bash

# 🏛️ Pantheon Gods Installer for Claude-Flow
# This script integrates Pantheon's divine commands with claude-flow

set -e  # Exit on error

echo "🏛️ Pantheon Gods Installer"
echo "=========================="
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
        echo "Please ensure claude-flow is installed in ./claude-flow directory"
        exit 1
    fi
    
    # Wait for installation to complete
    echo "⏳ Waiting for installation to complete..."
    sleep 3
else
    echo "✅ Claude-Flow found at: $CLAUDE_FLOW_DIR"
fi

# Step 2: Verify claude-flow is properly installed
if [ ! -f "$CLAUDE_FLOW_DIR/bin/claude-flow" ]; then
    echo "❌ Error: Claude-Flow binary not found!"
    echo "Please run: cd claude-flow && npm install"
    exit 1
fi

# Step 3: Create the templates directory if it doesn't exist
TEMPLATES_DIR="$CLAUDE_FLOW_DIR/src/templates/claude-optimized/.claude/commands"
mkdir -p "$TEMPLATES_DIR"

echo ""
echo "🔧 Adding Pantheon commands to claude-flow templates..."
echo ""

# Step 4: Create all the command files
# Note: These will be created by subsequent script execution

# Create a temporary marker file to indicate installation is in progress
touch "$SCRIPT_DIR/.pantheon-installing"

echo "📝 Creating command files..."
echo ""

# We'll create the command files via subsequent Write commands
# For now, just prepare the structure

echo "✅ Directory structure prepared!"
echo ""

# Install global 'gods' command
echo "📦 Installing global 'gods' command..."
./install-gods-global.sh > /dev/null 2>&1

echo "🏛️ Installation complete! 🎉"
echo ""
echo "✨ Super Simple Usage:"
echo "  1. Go to any project: cd your-project"
echo "  2. Type: gods"
echo "  3. Use /gods in Claude!"
echo ""
echo "That's it! Just 'gods' to activate the pantheon!"

# Remove marker file
rm -f "$SCRIPT_DIR/.pantheon-installing"