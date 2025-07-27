# Contributing to Pantheon V2

Welcome to Pantheon V2! This guide will help you understand the architecture and contribute to the project.

## 🏛️ Architecture Overview

Pantheon V2 is a modular AI-powered development assistant built around the `/gods` command system.

### Directory Structure
```
.claude/
├── config.yaml          # System configuration
├── commands/            # Command implementations
│   └── gods.md         # Main /gods command
├── lib/                 # Core libraries
│   ├── model-generator.md
│   ├── test-generator.md
│   ├── framework-detector.md
│   └── ... (11 total)
├── templates/           # Code generation templates
├── examples/            # Example pantheon.md files
├── agents/              # Future: AI agent configurations
└── workflows/           # Future: Custom workflows
```

### Core Components

1. **Commands** (`/commands`)
   - Each `.md` file defines a command with activation patterns
   - Commands orchestrate libraries to perform complex tasks
   - Current commands: `/gods` (with subcommands: init, plan, execute, validate, resume)

2. **Libraries** (`/lib`)
   - Reusable functionality modules
   - Each library focuses on a specific capability
   - Libraries can depend on each other
   - All functions should be pure when possible

3. **Templates** (`/templates`)
   - Code generation templates
   - Support variable substitution via `{{variable}}`
   - Framework-specific templates in subdirectories

## 📝 Adding a New Command

1. Create a new file in `.claude/commands/`:
```markdown
# /mycommand - Description

## ACTIVATION
When user types `/mycommand` or variations, execute this command.

## Required Libraries
- lib/session-state.md
- lib/other-library.md

## Implementation
[Command logic here]
```

2. Follow the pattern in `gods.md`:
   - Clear activation patterns
   - List required libraries
   - Implement subcommands if needed
   - Include error handling
   - Save state for resume capability

## 📚 Adding a New Library

1. Create a new file in `.claude/lib/`:
```markdown
# Library Name for Pantheon

**Purpose**: Clear description of what this library does.

**Key Functions**:
- `functionName(params)` - Description
- `anotherFunction()` - Description

**Usage**: Explain when and how this library is used.

## Implementation

[Library code and patterns here]
```

2. Library Best Practices:
   - Single responsibility principle
   - Clear function signatures
   - Include usage examples
   - Handle edge cases
   - Document dependencies

## 🎨 Adding Templates

1. Create framework-specific directories:
```
templates/
├── react/
│   ├── component.tsx
│   └── hook.ts
├── express/
│   ├── controller.ts
│   └── model.ts
└── shared/
    └── README.md
```

2. Use template variables:
```typescript
// templates/react/component.tsx
import React from 'react';

interface {{ModelName}}Props {
  // Props here
}

export const {{ModelName}}: React.FC<{{ModelName}}Props> = (props) => {
  return <div>{{ModelName}} Component</div>;
};
```

## 🧪 Testing Libraries

While Pantheon generates tests for user projects, we should also test our libraries:

1. Create test structure:
```
.claude/tests/
├── lib/
│   ├── model-generator.test.js
│   ├── test-generator.test.js
│   └── ...
└── commands/
    └── gods.test.js
```

2. Test pattern example:
```javascript
// tests/lib/model-generator.test.js
describe('Model Generator', () => {
  test('parseFeatureText extracts entities', () => {
    const text = 'Users can create Tasks with title and description';
    const entities = parseFeatureText(text);
    expect(entities).toHaveLength(2);
    expect(entities[0].name).toBe('User');
    expect(entities[1].name).toBe('Task');
  });
});
```

## 🔄 Workflow Guidelines

1. **Feature Development Flow**:
   - Discuss feature in issue/discussion
   - Create feature branch
   - Implement with tests
   - Update documentation
   - Submit PR

2. **Code Standards**:
   - Clear, descriptive names
   - Comprehensive error messages
   - Session state management
   - Progress indicators for long operations

3. **Documentation**:
   - Update README.md for user-facing changes
   - Update this file for architectural changes
   - Include inline comments for complex logic

## 🎯 Key Design Principles

1. **Conversational UX**: Commands should feel like natural dialogue
2. **Resumability**: All operations should be resumable after interruption
3. **Framework Agnostic**: Support multiple frameworks/languages
4. **Fail Gracefully**: Clear error messages and recovery options
5. **Progressive Disclosure**: Simple by default, powerful when needed

## 🐛 Debugging Tips

1. **Session State**: Check `.claude/sessions/` for saved state
2. **Verbose Mode**: Add logging to track execution flow
3. **Test in Isolation**: Test libraries independently
4. **Use Examples**: Test with provided example projects

## 📋 Contribution Checklist

Before submitting a PR:
- [ ] Code follows existing patterns
- [ ] Documentation is updated
- [ ] Tests are included (when test suite is ready)
- [ ] Examples work correctly
- [ ] Error handling is comprehensive
- [ ] Session state is managed properly

## 🤝 Getting Help

- Review existing code for patterns
- Check library documentation headers
- Test with example projects
- Ask questions in discussions

Thank you for contributing to Pantheon V2! 🏛️✨
