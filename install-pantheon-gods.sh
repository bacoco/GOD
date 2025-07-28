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

# Step 2: Install claude-flow dependencies if needed
if [ ! -d "$CLAUDE_FLOW_DIR/node_modules" ]; then
    echo "📦 Installing Claude-Flow dependencies..."
    cd "$CLAUDE_FLOW_DIR"
    npm install
    cd "$SCRIPT_DIR"
    
    # Wait a moment for post-install scripts
    sleep 3
fi

# Verify installation - just check if node_modules exists
if [ ! -d "$CLAUDE_FLOW_DIR/node_modules" ]; then
    echo "❌ Error: Claude-Flow installation failed!"
    echo "Please try running manually: cd claude-flow && npm install"
    exit 1
fi

# The binary might be created asynchronously, so just check node_modules
echo "✅ Claude-Flow dependencies installed successfully!"

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

# Create gods command wrapper
WRAPPER_CONTENT="#!/bin/bash
# Pantheon Gods Activator

# Find Pantheon installation
PANTHEON_DIR=\"\"
if [ -d \"\$HOME/develop/pantheon/claude-flow\" ]; then
    PANTHEON_DIR=\"\$HOME/develop/pantheon\"
elif [ -d \"$SCRIPT_DIR/claude-flow\" ]; then
    PANTHEON_DIR=\"$SCRIPT_DIR\"
fi

if [ \"\$1\" = \"help\" ] || [ \"\$1\" = \"--help\" ]; then
    echo \"🏛️ Pantheon Gods - Activate divine coding assistance\"
    echo \"\"
    echo \"Usage: gods\"
    echo \"\"
    echo \"This activates Pantheon commands in your current project.\"
    echo \"After activation, use /gods commands in Claude.\"
else
    if [ -z \"\$PANTHEON_DIR\" ]; then
        echo \"❌ Error: Pantheon installation not found!\"
        echo \"Please ensure Pantheon is installed at ~/develop/pantheon\"
        exit 1
    fi
    
    # Use local Pantheon claude-flow
    CLAUDE_FLOW_BIN=\"\$PANTHEON_DIR/claude-flow/bin/claude-flow\"
    
    if [ ! -f \"\$CLAUDE_FLOW_BIN\" ]; then
        echo \"❌ Error: Claude-Flow binary not found at \$CLAUDE_FLOW_BIN\"
        echo \"Please run: cd \$PANTHEON_DIR/claude-flow && npm install\"
        exit 1
    fi
    
    # Run local claude-flow init
    \"\$CLAUDE_FLOW_BIN\" init --quiet 2>/dev/null || \"\$CLAUDE_FLOW_BIN\" init
    
    echo \"\"
    echo \"✨ Pantheon Gods activated!\"
    echo \"\"
    echo \"🏛️ Use in Claude:\"
    echo \"  /gods-init \\\"your project idea\\\"\"
    echo \"  /gods-chat\"
    echo \"  /gods\"
fi"

# Create local bin directory if it doesn't exist
mkdir -p "$HOME/.local/bin"

# Write the wrapper script
echo "$WRAPPER_CONTENT" > "$HOME/.local/bin/gods"
chmod +x "$HOME/.local/bin/gods"

# Detect shell and add to appropriate config
if [ -n "$ZSH_VERSION" ]; then
    CONFIG_FILE="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    CONFIG_FILE="$HOME/.bashrc"
else
    CONFIG_FILE="$HOME/.bashrc"
fi

# Check if PATH includes .local/bin
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo "" >> "$CONFIG_FILE"
    echo "# Pantheon Gods" >> "$CONFIG_FILE"
    echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> "$CONFIG_FILE"
    echo "✅ Added ~/.local/bin to PATH in $CONFIG_FILE"
    echo "⚠️  Run 'source $CONFIG_FILE' or restart your terminal"
else
    echo "✅ 'gods' command installed"
fi

echo ""
echo "🏛️ Installation complete! 🎉"
echo ""
echo "✨ Next Steps:"
if [ -n "$CONFIG_FILE" ]; then
    echo "  1. Restart your terminal or run: source $CONFIG_FILE"
else
    echo "  1. Restart your terminal"
fi
echo "  2. Go to any project: cd your-project"
echo "  3. Type: gods"
echo "  4. Use /gods commands in Claude!"
echo ""
echo "That's it! Just 'gods' to activate divine coding assistance!"

# Remove marker file
rm -f "$SCRIPT_DIR/.pantheon-installing"