# Pantheon User Guide

## 🏛️ Welcome to Pantheon

Pantheon is a conversational AI system that transforms your ideas into working software. Simply describe what you want to build, and a team of specialized AI gods will create it for you.

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/bacoco/pantheon.git
cd pantheon

# Install dependencies
npm install

# Install Claude-Flow (REQUIRED - this powers the AI agents)
node install-claude-flow.js
```

### Your First Project

```bash
# Start a new project
/gods init "I want to build a task management app"

# The gods will ask clarifying questions:
# - Who are your users?
# - What makes your app unique?
# - What visual style do you prefer?

# Answer naturally, and watch your project come to life!
```

## 💬 Core Commands

### `/gods init [idea]`
Start a new project. The gods will guide you through:
1. **Discovery** - Understanding your vision
2. **Planning** - Defining features and approach  
3. **Design** - Creating the user experience
4. **Building** - Implementing with AI agents

### `/gods status`
Check the progress of your current project:
- See which gods are working
- View completed tasks
- Track remaining work

### `/gods resume`
Continue working on your project from where you left off.

### `/gods help`
Get help and see all available commands.

## 🏛️ Meet the Gods

Each god specializes in different aspects of development:

### Core Gods
- **Zeus** - Project orchestrator and coordinator
- **Apollo** - UI/UX design and user interfaces
- **Hephaestus** - Backend development and implementation
- **Athena** - Research, analysis, and AI features
- **Themis** - Testing and quality assurance

### Specialist Gods (Summoned as Needed)
- **Hermes** - Real-time features and messaging
- **Prometheus** - Planning and feature definition
- **Daedalus** - System architecture design
- **Aegis** - Security and authentication
- **Plutus** - Payments and monetization
- **Hestia** - User management and profiles
- **Iris** - API design and integrations
- **Clio** - Documentation and guides
- **Poseidon** - Data flow and processing
- **Hades** - Error handling and recovery
- **Demeter** - Data modeling and storage

## 🎯 Example Projects

### E-Commerce Platform
```bash
/gods init "online marketplace for handmade crafts with seller profiles"
```
Gods involved: Zeus, Apollo (design), Hephaestus (backend), Plutus (payments), Hestia (profiles)

### Social App
```bash
/gods init "social app for book lovers to share reviews and reading lists"
```
Gods involved: Zeus, Apollo (UI), Hephaestus (backend), Hermes (real-time), Hestia (profiles)

### AI Tool
```bash
/gods init "AI tool that summarizes YouTube videos into key points"
```
Gods involved: Zeus, Athena (AI), Hephaestus (backend), Apollo (interface), Iris (YouTube API)

## 💡 Tips for Best Results

### Be Specific About Your Vision
```
❌ "I want a website"
✅ "I want a portfolio website for photographers with gallery features"
```

### Answer the Gods' Questions Thoughtfully
The gods ask questions to understand your needs better:
- Target users help shape the experience
- Core features define the architecture
- Visual preferences guide the design

### Start Simple, Evolve Gradually
Begin with core features, then add complexity:
1. Start: "Task tracker with lists"
2. Evolve: "Add due dates and reminders"
3. Enhance: "Add team collaboration"

### Trust the Process
The gods work together intelligently:
- Zeus coordinates everything
- Specialists handle their domains
- Quality is built in from the start

## 🔧 Understanding the Output

When the gods complete your project, you'll receive:

### 1. Complete Source Code
- Frontend (React, Vue, or vanilla JS)
- Backend (Node.js, Python, or others)
- Database schemas
- API definitions

### 2. Project Structure
```
your-project/
├── frontend/        # User interface
├── backend/         # Server and APIs
├── database/        # Data models
├── docs/           # Documentation
└── deployment/     # Deployment configs
```

### 3. Documentation
- Setup instructions
- Architecture overview
- API documentation
- Deployment guide

### 4. Next Steps
- How to run locally
- Customization options
- Deployment recommendations

## 🎨 Customization

### During Conversation
Specify your preferences:
- "I prefer React for the frontend"
- "Use PostgreSQL for the database"
- "Make it mobile-first"
- "Include dark mode"

### After Generation
The generated code is yours to modify:
- Add features
- Change styling
- Integrate services
- Deploy anywhere

## 🚦 Common Scenarios

### "I Don't Know Programming"
Perfect! Just describe what you want in plain language. The gods handle all technical decisions.

### "I Have Specific Technical Requirements"
Great! Share them during the conversation. The gods adapt to your constraints.

### "I Want to Add Features Later"
Use `/gods resume` to continue the conversation and add new capabilities.

### "Something Isn't Working Right"
The gods test their work, but you can always ask for fixes or modifications.

## 🌟 Advanced Usage

### Custom AI Agents
Pantheon generates project-specific AI agents:
- Each god gets tools specific to your needs
- Agents are composed from 54 base types
- 87 specialized tools are allocated intelligently

### Viewing Generated Configurations
```bash
# See your custom AI agent configurations
ls ./claude-flow/.claude/agents/projects/
```

### Multiple Projects
Work on multiple projects by using different directories:
```bash
cd project1 && /gods init "First idea"
cd project2 && /gods init "Second idea"
```

## 🤝 Getting Help

### Built-in Help
```bash
/gods help          # General help
/gods help init     # Command-specific help
```

### Community Support
- GitHub Issues: Report bugs or request features
- Discussions: Share ideas and get help
- Examples: Learn from other projects

## 🎉 What's Possible?

With Pantheon, you can build:
- **Web Applications** - Full-stack apps with modern frameworks
- **Mobile Apps** - React Native or Progressive Web Apps
- **APIs & Services** - RESTful or GraphQL backends
- **AI Tools** - ML-powered applications
- **Automation** - Workflow and process automation
- **Games** - Web-based interactive games
- **And More** - If you can describe it, the gods can build it!

---

*Ready to bring your ideas to life? Start with `/gods init "your idea"` and let the gods work their magic!* 🏛️