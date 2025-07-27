# Pantheon v2 - AI Development System 🏛️

An intelligent conversational system that transforms your ideas into complete, production-ready applications.

## 🚀 Quick Start

```bash
/gods init
```

That's it! Pantheon will guide you through creating your entire project.

## 🎯 What is Pantheon?

Pantheon combines:
- **Conversational project setup** - Natural language interaction
- **Intelligent code generation** - Understands your requirements
- **Production quality** - Tests, Docker, Git included
- **Complete automation** - From idea to deployed code

## 📋 Core Commands

### `/gods init`
Start a new project through conversation:
```
You: /gods init
Pantheon: What would you like to name your project?
You: awesome-api
Pantheon: What type of application are you building?
You: REST API for task management
[... continues conversationally ...]
```

### `/gods plan`
Analyze your project and create a development plan:
- Detects data models from your requirements
- Matches code templates
- Creates phased implementation
- Shows team recommendations

### `/gods execute`
Build your entire project automatically:
- Generates all code files
- Creates comprehensive tests
- Sets up Git repository
- Configures Docker
- Optionally creates GitHub repo

## 🎭 AI Agent Team

Access specialized agents directly:
```bash
/agents zeus         # Orchestrator
/agents daedalus     # System Architect
/agents hephaestus   # Developer
/agents themis       # QA Engineer
/agents code-reviewer # Quick code reviews
```

## 📁 Clean Structure

```
.claude/
├── commands/
│   └── gods.md          # Main /gods implementation
├── lib/                 # Essential generation libraries (11 files)
│   ├── model-generator.md
│   ├── test-generator.md
│   ├── docker-generator.md
│   ├── framework-detector.md
│   ├── git-integration.md
│   ├── session-state.md
│   ├── template-engine.md
│   ├── test-detection.md
│   ├── dependency-manager.md
│   ├── interactive-flow.md
│   └── string-utils.md
├── agents/              # AI team members
├── templates/           # Code templates
├── workflows/           # Multi-agent workflows
└── examples/            # Example projects
```

## ✨ Key Features

### Intelligent Detection
- **Models**: Extracts entities from your description
- **Frameworks**: Detects Next.js, Express, etc.
- **Dependencies**: Knows what packages you need
- **Templates**: Matches patterns to your needs

### Complete Automation
- **Git**: Initializes repo, commits at each phase
- **Tests**: Generates test files for all code
- **Docker**: Creates optimized containers
- **GitHub**: Can create and push to repos

### Production Quality
- TypeScript interfaces
- Database schemas (Mongoose, Prisma)
- Authentication systems
- CRUD operations
- Error handling
- Input validation

## 🔄 Example Workflow

```bash
# 1. Start project
/gods init
> "I want to build a task management API"
> "Using Node.js, Express, and MongoDB"
> "Features: user auth, tasks CRUD, real-time updates"

# 2. Review plan
/gods plan
> Detected models: User, Task
> Matched templates: jwt-auth, rest-crud
> 3 phases planned

# 3. Build everything
/gods execute
> ✅ Phase 1: Project setup complete
> ✅ Phase 2: Features implemented
> ✅ Phase 3: Tests and Docker ready
> 🎉 Project complete! 24 files generated
```

## 🛠️ Customization

### Add Templates
Create new templates in `.claude/templates/`:
```yaml
---
name: my-template
framework: express
features: [api, custom]
---

# Template content...
```

### Configure Workflow
Set preferences during `/gods init`:
- Git integration
- Test generation
- Docker support
- GitHub automation

## 📚 More Information

- See `GETTING_STARTED.md` for detailed walkthrough
- Check `examples/` for sample projects
- Explore `agents/` for specialist capabilities

---

**Start building:** `/gods init` 🚀

*Where conversation becomes code.*