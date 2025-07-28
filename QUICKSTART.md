# 🚀 Pantheon Quick Start Guide

Get started with Pantheon in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Claude Code CLI running
- Basic command line knowledge

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pantheon.git
cd pantheon

# Install dependencies
npm install
```

## Your First Project

### 1. Start with an idea

```bash
node claude-pantheon.js "/gods init 'I want to build a task tracker'"
```

### 2. Have a conversation

Zeus will ask you questions:
- Who will use this? → "Students and professionals"
- Key feature? → "Simple task lists with deadlines"
- Experience? → "Clean and focused"

### 3. Watch the magic

The gods will:
- Understand your vision
- Plan your features
- Generate your project structure
- Create working code

## Essential Commands

```bash
# See what you're building
node claude-pantheon.js "/gods status"

# List all projects
node claude-pantheon.js "/gods projects"

# Continue later
node claude-pantheon.js "/gods resume"

# Get help anytime
node claude-pantheon.js "/gods help"
```

## Real Example Session

```bash
$ node claude-pantheon.js "/gods init 'I need a blog with comments'"

[Zeus]: Greetings! I am Zeus, orchestrator of the Pantheon...
        A blog with comments - what an intriguing vision!
        
        • Who do you envision as the primary users of this?
        
You: Writers who want a simple platform to share thoughts

[Zeus]: Excellent insights! Based on what you've shared, 
        I'll bring in Prometheus to help define features...

[Prometheus]: What are the 3-5 core features for your MVP?

You: Writing posts, adding comments, simple categories

[Zeus]: The council has deliberated! Here's your plan...
        Would you like me to start building this? (yes/no)
        
You: yes

[Hephaestus]: I'll transform these plans into working code...

✨ Project created at: blog-with-comments/
```

## What Gets Created

Your project will include:
- ✅ Complete file structure
- ✅ Package.json with dependencies
- ✅ README with your project vision
- ✅ Basic implementation files
- ✅ Git repository initialized
- ✅ Ready for development

## Next Steps

1. Navigate to your project:
   ```bash
   cd your-project-name
   npm install
   npm start
   ```

2. Continue development:
   ```bash
   node claude-pantheon.js "/gods resume"
   ```

3. Check progress:
   ```bash
   node claude-pantheon.js "/gods status"
   ```

## Tips

- 💡 Be natural in conversation - the gods understand context
- 🎯 Start simple - you can always add features later
- 💬 Ask questions if unsure - the gods love to explain
- 🔄 Use `/gods resume` to pick up where you left off

## Troubleshooting

**"No projects found"**
- You haven't created any yet! Run `/gods init`

**"Command not found"**
- Make sure you're in the pantheon directory
- Check that you're using quotes: `"/gods init 'idea'"`

**Conversation seems stuck**
- Press Ctrl+C to exit
- Run `/gods resume` to continue

## Get Help

```bash
# General help
node claude-pantheon.js "/gods help"

# Command-specific help
node claude-pantheon.js "/gods help init"
```

---

Ready to build something amazing? The gods await your command! 🏛️