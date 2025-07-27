# 🚀 Pantheon Quick Start Guide

Get up and running with Pantheon in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Basic familiarity with command line

## Installation

```bash
# Clone Pantheon
git clone https://github.com/yourusername/pantheon.git
cd pantheon

# Install dependencies
npm install

# Install Claude-Flow dependencies
cd claude-flow && npm install && cd ..

# Install Gods plugin dependencies
cd gods && npm install && cd ..
```

## First Launch

```bash
# Start Pantheon
node launch.js
```

You should see:
```
🏛️  ╔═══════════════════════════════════════════╗
🏛️  ║          PANTHEON GOD AGENT SYSTEM        ║
🏛️  ║              Powered by Claude-Flow       ║
🏛️  ╚═══════════════════════════════════════════╝

✅ Pantheon plugin loaded successfully!
```

## Quick Examples

### 1. Summon Your First God

```bash
# In the REPL
> agent spawn zeus
```

### 2. Ask Zeus to Analyze a Task

```bash
> task create "Build a todo list application with React and Node.js"
```

Zeus will:
- Analyze complexity (likely 6-7/10)
- Recommend gods: Daedalus (architecture), Hephaestus (backend), Apollo (frontend)
- Suggest workflow pattern

### 3. Execute a Full Workflow

```bash
> workflow full-stack-dev
```

This will:
1. Summon multiple gods
2. Coordinate development phases
3. Run tests and security checks
4. Deliver complete application

### 4. Quick Development Flow

```javascript
// For a new feature
> agent spawn prometheus
> task create "Define user authentication requirements"

// For implementation
> agent spawn hephaestus
> task create "Implement JWT authentication"

// For testing
> agent spawn themis
> task create "Create authentication test suite"
```

## Common Commands

| Command | Description |
|---------|-------------|
| `agent spawn <god>` | Summon a specific god |
| `agent list` | Show active gods |
| `task create "<description>"` | Create a new task |
| `workflow <name>` | Run a pre-built workflow |
| `status` | Show system status |
| `help` | Get help |

## The Gods at a Glance

**For Planning:**
- Zeus - Overall coordination
- Prometheus - Product strategy
- Athena - User stories

**For Building:**
- Daedalus - Architecture
- Hephaestus - Coding
- Apollo - UI/UX

**For Quality:**
- Themis - Testing
- Aegis - Security
- Code Reviewer - Quick reviews

## Next Steps

1. Try the example workflows
2. Read the full README.md
3. Explore individual god capabilities
4. Create your own workflows
5. Join the community!

## Troubleshooting

**Plugin not loading?**
- Check node_modules are installed in all directories
- Verify Node.js version is 18+

**Command not working?**
- Use quotes around multi-word tasks
- Check god is spawned first

**Need help?**
- Type `help` in the REPL
- Check documentation
- Open an issue on GitHub

---

Happy orchestrating! May the gods be with you! 🏛️