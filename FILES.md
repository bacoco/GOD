# 🏛️ Pantheon Project Structure

## Root Directory Files

| File | Purpose |
|------|---------|
| `install-pantheon-gods.sh` | Main installer - sets up everything including the global `gods` command |
| `test-pantheon-setup.sh` | Optional test script to verify installation |
| `README.md` | Project overview and documentation |
| `QUICK_START.md` | Quick start guide for new users |
| `package.json` | Node.js project configuration |

## Key Directories

| Directory | Contents |
|-----------|----------|
| `gods/` | Core Pantheon system - all god implementations |
| `claude-flow/` | AI agent orchestration platform (installed by installer) |
| `docs/` | Documentation and guides |
| `examples/` | Example projects and demos |
| `test/` | Test files and demos |

## Why So Simple?

We consolidated everything into just 2 shell scripts:
- **One installer** that does everything
- **One test script** to verify it worked

The `gods` command is installed globally, so you never need to run complex commands again!