# /generate-prp Command - Product Requirements Prompt Generation

ACTIVATION: When user types `/generate-prp <task>`, create a comprehensive implementation guide.

## PRP Structure

Generate a complete Product Requirements Prompt following Context Engineering best practices.

### Core Sections

```markdown
# [Descriptive Name for the Task]

## Purpose
[Clear explanation of what needs to be built and why]

## Goal
[Specific, measurable end state]

## Why
- [Business value point 1]
- [Business value point 2]
- [User impact]

## What
[User-visible behavior and technical requirements]

### Success Criteria
- [ ] [Specific measurable outcome]
- [ ] [Specific measurable outcome]
- [ ] [Specific measurable outcome]

## All Needed Context

### Documentation & References
\`\`\`yaml
- resource: [Type of resource]
  location: [Where to find it]
  why: [What specific information is needed]
\`\`\`

### Current State
\`\`\`
[Current codebase structure or system state]
\`\`\`

### Desired State
\`\`\`
[Target codebase structure or system state]
\`\`\`

### Known Constraints & Considerations
- **Technical**: [Constraints]
- **Business**: [Constraints]
- **Timeline**: [Constraints]

## Implementation Blueprint

### Task Breakdown
1. **[Task Name]**
   - Description: [What to do]
   - Files: [What to create/modify]
   - Validation: [How to verify]

2. **[Task Name]**
   - Description: [What to do]
   - Files: [What to create/modify]
   - Validation: [How to verify]

### Technical Approach
\`\`\`[language]
// Pseudocode or key implementation details
// Focus on non-obvious aspects
// Include critical patterns
\`\`\`

### Integration Points
- **Database**: [Changes needed]
- **APIs**: [Endpoints to create/modify]
- **Configuration**: [Settings to add]
- **Dependencies**: [Packages to install]

## Validation Strategy

### Level 1: Unit Testing
\`\`\`bash
# Commands to run
# Expected outcomes
\`\`\`

### Level 2: Integration Testing
\`\`\`bash
# Commands to run
# Expected outcomes
\`\`\`

### Level 3: End-to-End Validation
\`\`\`bash
# Commands to run
# Expected outcomes
\`\`\`

## Risk Mitigation

### Potential Issues
1. **[Risk]**: [Mitigation strategy]
2. **[Risk]**: [Mitigation strategy]

### Rollback Plan
[How to safely revert if needed]

## Anti-Patterns to Avoid
- ❌ [Common mistake]
- ❌ [Common mistake]
- ❌ [Common mistake]

## Definition of Done
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Performance validated
- [ ] Security reviewed
- [ ] Deployed successfully
```

## PRP Generation Process

### 1. Research Phase (CRITICAL)

**Codebase Analysis**:
- Search for similar features/patterns in the codebase
- Identify existing conventions and patterns to follow
- Find relevant files to reference in the PRP
- Check test patterns for validation approach

**External Research**:
- Search for library documentation (include specific URLs)
- Find implementation examples (GitHub/StackOverflow/blogs)
- Identify best practices and common pitfalls
- Note version-specific requirements or gotchas

**Example Mining**:
- Check `.claude/examples/` for relevant patterns
- Identify which examples to reference
- Note adaptations needed for current task

### 2. Context Gathering

**Documentation Collection**:
- Gather all relevant API documentation URLs
- Include specific sections that will be needed
- Note any quirks or special considerations
- Add links to official guides

**User Clarification** (if needed):
- Which patterns should be followed?
- Any specific integration requirements?
- Performance or security constraints?
- Preferred libraries or approaches?

### 3. PRP Structure

**ULTRATHINK before writing**:
- Plan the complete approach
- Identify all components needed
- Consider error scenarios
- Plan validation strategy

**Include ALL Context**:
```yaml
# Documentation section must include:
- url: [Official docs with specific section]
  why: [What specific info is needed]
- file: [Path to example or existing code]
  why: [Pattern to follow or adapt]
- example: examples/[relevant-pattern].md
  why: [How this example helps]
```

### 4. Validation Design

**Progressive Validation**:
1. Syntax/lint checks (quick feedback)
2. Unit tests (component validation)
3. Integration tests (system validation)
4. End-to-end validation (user perspective)

**Make it Executable**:
- Include exact commands to run
- Specify expected outputs
- Provide error diagnosis hints

## Quality Criteria

A good PRP should be:
- **Self-contained**: All needed information included
- **Actionable**: Clear steps to follow
- **Verifiable**: Success can be measured
- **Risk-aware**: Potential issues addressed
- **Maintainable**: Considers long-term implications

## Adaptation Guidelines

Adjust detail level based on complexity:
- **Simple tasks**: Focus on clarity and efficiency
- **Complex tasks**: Include extensive detail and considerations
- **Novel tasks**: Emphasize exploration and validation
- **Critical tasks**: Stress testing and rollback procedures

## Example

User: `/generate-prp Create a REST API for user authentication`

You would generate a complete PRP including:
- JWT implementation details
- Database schema for users
- API endpoint specifications
- Security considerations
- Testing strategies
- Deployment steps

The output should be immediately usable by a developer to implement the feature with confidence.

## Quality Assessment

After generating the PRP, score it on a scale of 1-10 for confidence in one-pass implementation:

**Scoring Criteria**:
- **9-10**: All context included, clear validation, existing patterns referenced
- **7-8**: Good context, some assumptions but manageable
- **5-6**: Missing some context, may need clarification during implementation
- **Below 5**: Insufficient context, needs more research

**Include at end of PRP**:
```
---
Confidence Score: 8/10
Reasoning: Strong context and examples provided, validation comprehensive, minor uncertainty on performance requirements
```

Remember: The goal is one-pass implementation success through comprehensive context.