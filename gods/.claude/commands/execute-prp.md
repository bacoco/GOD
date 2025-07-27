# /execute-prp Command - Execute Product Requirements Prompt

ACTIVATION: When user types `/execute-prp <prp-file>`, implement the feature using the PRP file.

## Command Overview

This command executes a Product Requirements Prompt (PRP) file to implement features with comprehensive context and validation loops, following Context Engineering principles.

**Project Directory Awareness**: When called from `/baco execute`, this command automatically works within the project directory created during `/baco init`. All file paths and commands are relative to the project directory.

## Execution Process

### 1. Load PRP
- Read the specified PRP file
- Parse all context and requirements
- Identify validation gates
- Understand success criteria

### 2. Planning Phase
**ULTRATHINK before execution:**
- Analyze the complete implementation blueprint
- Break down complex tasks into manageable steps
- Use TodoWrite tool to track implementation plan
- Identify patterns from existing code to follow
- Plan for validation and error handling

### 3. Execute Implementation
Follow the PRP blueprint:
- Create/modify files as specified using actual tools:
  - Use `Write` tool to create new files
  - Use `Edit` or `MultiEdit` to modify existing files
  - Use `Bash` tool to run commands (npm install, etc.)
- Follow existing patterns identified
- Implement validation as you go
- Handle errors gracefully

**CRITICAL: Generate actual code and create real files**
Example execution:
```
# Create project structure
Bash("mkdir -p src/components src/app/api")

# Create component file with actual code
Write("src/components/PromptInput.tsx", `
import React, { useState } from 'react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  maxWords: number;
}

export function PromptInput({ onSubmit, maxWords }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  // ... actual component implementation
}
`)

# Show progress
"✅ Created src/components/PromptInput.tsx (52 lines)"
```

### 4. Validation Loop
Run validation gates at each level:
- **Level 1**: Syntax and style checks
- **Level 2**: Unit tests
- **Level 3**: Integration tests
- Fix any failures and re-run until passing

### 5. Complete & Verify
- Ensure all checklist items completed
- Run final validation suite
- Verify success criteria met
- Report completion status

## Implementation Guidelines

### Context is King
- The PRP contains ALL needed context
- Don't make assumptions outside the PRP
- If context is missing, ask for clarification

### Progressive Success
- Start with basic implementation
- Validate at each step
- Enhance incrementally
- Never skip validation

### Error Handling
- When validation fails, use error patterns in PRP
- Fix issues based on actual errors, not mocks
- Re-run validation until passing

## Command Format

```
/execute-prp PRPs/feature-name.md
```

Or with a full path:
```
/execute-prp /path/to/prp-file.md
```

## Integration with Agents

While this command can work standalone, it integrates well with agents:
- **Developer (Hephaestus)**: Can execute technical PRPs
- **Architect (Daedalus)**: Can execute architecture PRPs
- **SM (Hermes)**: Can execute story-based PRPs

## Example Usage

```
User: /execute-prp PRPs/user-authentication.md

You would:
1. Load the PRP and understand all requirements
2. Create a TodoWrite plan with all implementation tasks
3. Execute each task with validation
4. Fix any issues found during validation
5. Report successful completion
```

## Detailed Implementation Example

When executing a PRP, here's the actual flow:

```
1. Parse PRP and create tasks:
TodoWrite([
  { id: "setup", content: "Set up project structure", status: "pending", priority: "high" },
  { id: "auth_model", content: "Create user authentication model", status: "pending", priority: "high" },
  { id: "auth_api", content: "Implement authentication API", status: "pending", priority: "high" }
])

2. Execute each task with real file creation:

# Task: Set up project structure
Bash("npm init -y")
Bash("npm install express bcrypt jsonwebtoken")
Write("package.json", <updated package.json with scripts>)
✅ Project initialized with dependencies

# Task: Create user model
Write("src/models/User.js", `
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
`)
✅ Created src/models/User.js (18 lines)

# Task: Create auth routes
Write("src/routes/auth.js", <actual route implementation>)
✅ Created src/routes/auth.js (45 lines)

3. Run validation:
Bash("npm test")
Bash("npm run lint")

4. Update task status:
TodoWrite([
  { id: "setup", status: "completed" },
  { id: "auth_model", status: "completed" },
  { id: "auth_api", status: "completed" }
])
```

## PRP File Structure Expected

The command expects PRPs to follow this structure:
- **Goal**: Clear end state
- **Context**: All needed documentation and references  
- **Implementation Blueprint**: Task breakdown and approach
- **Validation Loop**: Executable tests and checks
- **Success Criteria**: Measurable outcomes

## Error Recovery

If execution fails:
1. Identify the specific failure point
2. Use error messages to understand root cause
3. Apply fixes based on PRP guidance
4. Re-run validation from the failed step
5. Continue until all validations pass

## Best Practices

1. **Read Thoroughly**: Understand the entire PRP before starting
2. **Track Progress**: Use TodoWrite to manage tasks
3. **Validate Often**: Don't wait until the end to test
4. **Follow Patterns**: Use existing code patterns referenced in PRP
5. **Ask When Unclear**: Better to clarify than assume

## Integration with Workflows

This command can be part of larger workflows:
```yaml
workflow:
  - /generate-prp INITIAL.md
  - /execute-prp PRPs/generated-feature.md
  - /agent po  # Validate with Product Owner
  - *validate-all
```

## Validation Emphasis

Remember: The goal is **one-pass implementation success** through:
- Comprehensive context (from PRP)
- Self-validation capabilities
- Iterative refinement
- Working code delivery