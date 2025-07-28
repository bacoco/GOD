#!/bin/bash

# 🏛️ Global Pantheon Installer
# Run this ONCE to enable 'gods' command globally

echo "🏛️ Installing Pantheon Gods globally..."
echo ""

# Get the directory where this script is located
PANTHEON_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create a simple wrapper script
WRAPPER_CONTENT="#!/bin/bash
# Pantheon Gods Activator

if [ \"\$1\" = \"activate\" ] || [ \$# -eq 0 ]; then
    # Activate in current directory
    npx claude-flow@alpha init --quiet 2>/dev/null || npx claude-flow@alpha init
    echo \"\"
    echo \"✨ Pantheon Gods activated!\"
    echo \"\"
    echo \"🏛️ Use in Claude:\"
    echo \"  /gods-init \\\"your project idea\\\"\"
    echo \"  /gods-chat\"
    echo \"  /gods\"
elif [ \"\$1\" = \"help\" ]; then
    echo \"🏛️ Pantheon Gods Commands\"
    echo \"\"
    echo \"Usage:\"
    echo \"  gods          - Activate gods in current directory\"
    echo \"  gods activate - Same as above\"
    echo \"  gods help     - Show this help\"
    echo \"\"
    echo \"After activation, use /gods commands in Claude\"
fi"

# Detect shell and add to appropriate config
if [ -n "$ZSH_VERSION" ]; then
    # Zsh
    CONFIG_FILE="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    # Bash
    CONFIG_FILE="$HOME/.bashrc"
else
    # Default to bashrc
    CONFIG_FILE="$HOME/.bashrc"
fi

# Create local bin directory if it doesn't exist
mkdir -p "$HOME/.local/bin"

# Write the wrapper script
echo "$WRAPPER_CONTENT" > "$HOME/.local/bin/gods"
chmod +x "$HOME/.local/bin/gods"

# Check if PATH includes .local/bin
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo "" >> "$CONFIG_FILE"
    echo "# Pantheon Gods" >> "$CONFIG_FILE"
    echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> "$CONFIG_FILE"
    echo "✅ Added ~/.local/bin to PATH in $CONFIG_FILE"
    echo "⚠️  Run 'source $CONFIG_FILE' or restart your terminal"
else
    echo "✅ ~/.local/bin already in PATH"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "📋 Usage:"
echo "  1. Go to any project: cd your-project"
echo "  2. Run: gods"
echo "  3. Use /gods commands in Claude"
echo ""
echo "That's it! Just 'gods' to activate!"