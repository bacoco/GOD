# Pantheon Project Structure

```
pantheon/
├── gods/                    # 🏛️ Core Pantheon system
│   ├── lib/                # Core libraries and god implementations
│   │   ├── gods/          # Individual god classes (Zeus, Apollo, etc.)
│   │   ├── conversational/ # Conversational AI system
│   │   └── *.js           # Core components (base-god, messenger, etc.)
│   ├── resources/         # God resources
│   │   └── conversational/ # Conversational templates and commands
│   ├── workflows/         # Pre-built workflows
│   ├── debug/            # Debug infrastructure
│   └── .claude/          # God configuration files
│
├── claude-flow/          # 🌊 Extended Claude-Flow integration
│   └── [Claude-Flow structure]
│
├── docs/                 # 📚 Documentation
│   ├── conversational/   # Conversational system docs
│   ├── implementation/   # Technical implementation details
│   ├── examples/        # Usage examples and tutorials
│   ├── explanations/    # Concepts and architecture
│   └── analysis/        # Code analysis and reviews
│
├── examples/            # 💡 Example applications
│   └── conversational-demo.js
│
├── tests/              # 🧪 Test suites
│   ├── test-md-system.js
│   ├── test-conversational-system.js
│   └── test-conversational-flow.js
│
├── launch.js           # 🚀 Main entry point
├── package.json        # 📦 Node.js configuration
├── README.md          # 📖 Main documentation
└── .gitignore         # Git configuration
```

## Directory Purposes

### `/gods` - Core System
The heart of Pantheon. Contains all god implementations, the messaging system, and core infrastructure.

### `/claude-flow` - AI Engine
Extended Claude-Flow that provides the underlying AI capabilities and agent system.

### `/docs` - Documentation
Comprehensive documentation organized by type:
- **conversational/** - Guide for the new conversational AI features
- **implementation/** - Technical details and architecture
- **examples/** - Hands-on tutorials
- **explanations/** - Conceptual understanding
- **analysis/** - Code reviews and improvements

### `/examples` - Demo Applications
Ready-to-run examples showing Pantheon capabilities.

### `/tests` - Test Suite
All tests organized in one place for easy testing and CI/CD integration.

## Key Files

- `launch.js` - Main entry point for starting Pantheon
- `package.json` - Dependencies and scripts
- `README.md` - Project overview and quick start guide