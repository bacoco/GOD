#!/bin/bash

# 🏛️ Pantheon Setup Test Script
# Verifies that all components are properly installed

echo "🏛️ Testing Pantheon + Claude-Flow Integration..."
echo "============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Check if claude-flow exists
echo "1. Checking claude-flow installation..."
if [ -d "claude-flow/bin" ] && [ -f "claude-flow/bin/claude-flow" ]; then
    echo -e "${GREEN}✅ Claude-flow is installed${NC}"
else
    echo -e "${RED}❌ Claude-flow not found${NC}"
    echo "   Run: ./install-pantheon-gods.sh"
    exit 1
fi

# Test 2: Check if command files exist
echo ""
echo "2. Checking Pantheon command files..."
COMMANDS_DIR="claude-flow/src/templates/claude-optimized/.claude/commands"
REQUIRED_FILES=(
    "gods.md"
    "gods-init.md"
    "gods-council.md"
    "gods-tools.md"
    "gods-status.md"
    "gods-resume.md"
    "gods-chat.md"
    "gods-help.md"
    "gods-list.md"
)

ALL_GOOD=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$COMMANDS_DIR/$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
        ALL_GOOD=false
    fi
done

if [ "$ALL_GOOD" = false ]; then
    echo ""
    echo -e "${RED}Some command files are missing!${NC}"
    exit 1
fi

# Test 3: Check if Pantheon scripts are executable
echo ""
echo "3. Checking Pantheon scripts..."
SCRIPTS=(
    "install-pantheon-gods.sh"
    "launch-pantheon.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ -x "$script" ]; then
        echo -e "${GREEN}✅ $script is executable${NC}"
    else
        echo -e "${RED}❌ $script is not executable${NC}"
        chmod +x "$script"
        echo "   Fixed: made $script executable"
    fi
done

# Test 4: Test claude-flow command
echo ""
echo "4. Testing claude-flow command..."
if cd claude-flow && ./bin/claude-flow --version > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Claude-flow command works${NC}"
    cd ..
else
    echo -e "${RED}❌ Claude-flow command failed${NC}"
    cd ..
    exit 1
fi

# Summary
echo ""
echo "============================================="
echo -e "${GREEN}🎉 All tests passed!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. In your project: npx claude-flow init"
echo "2. In Claude: /gods"
echo "3. Start building: /gods-init \"your idea\""
echo ""
echo "🏛️ The gods await your command!"