# /persona Command - User Persona Management

## ACTIVATION

When the user types `/persona [action]`, manage user personas for the current project.

## Overview

The `/persona` command helps create, view, modify, and reference user personas that guide product development decisions. Personas are essential for user-centered design and are used by multiple agents (PM, UX, PO, Developer) to make informed decisions.

## Subcommands

### 1. Create New Persona
**Command**: `/persona create` or `/persona new`

Interactive persona creation using the standard template:

```yaml
=== CREATE USER PERSONA ===

Let's create a detailed user persona for your project.

1. Basic Information
   Name: Athena Chen
   Age: 28
   Occupation: Software Developer
   Location: San Francisco, CA

2. Demographics
   Education: Bachelor's in Computer Science
   Income: $120,000/year
   Tech Savviness: Expert

[Continue through template sections...]
```

### 2. View Personas
**Command**: `/persona` or `/persona list`

Display all personas for the current project:

```yaml
=== PROJECT PERSONAS ===

📊 Active Personas: 3

1. 🧑‍💼 "Efficient Emma" - Project Manager
   Age: 32 | Experience: Advanced
   Primary Goal: Streamline team workflows
   Pain Points: Tool fragmentation, context switching

2. 👨‍💻 "Developer Dan" - Senior Engineer  
   Age: 28 | Experience: Expert
   Primary Goal: Write quality code faster
   Pain Points: Boilerplate, documentation gaps

3. 🧑‍🎓 "Junior Jamie" - New Developer
   Age: 24 | Experience: Beginner
   Primary Goal: Learn best practices
   Pain Points: Steep learning curve, unclear patterns

Use: /persona view <number> for details
```

### 3. View Specific Persona
**Command**: `/persona view <name|number>`

Show detailed information about a specific persona:

```yaml
=== PERSONA: Developer Dan ===

👨‍💻 Basic Information
├─ Name: Dan Rodriguez
├─ Age: 28
├─ Occupation: Senior Full-Stack Developer
├─ Location: Austin, TX
└─ Quote: "I want tools that get out of my way"

📊 Demographics
├─ Education: BS Computer Science
├─ Experience: 6 years
├─ Income: $140,000/year
└─ Tech Stack: React, Node.js, AWS

🎯 Goals & Motivations
├─ Primary: Ship features faster without sacrificing quality
├─ Secondary: Mentor junior developers
└─ Hidden: Become a technical lead

😤 Pain Points & Frustrations
├─ Repetitive boilerplate code
├─ Switching between multiple tools
├─ Unclear or outdated documentation
└─ Slow CI/CD pipelines

💻 Technology & Tools
├─ Daily: VS Code, GitHub, Slack, Jira
├─ Preferred: Modern frameworks, TypeScript
└─ Avoids: Legacy systems, verbose configs

🗺️ User Journey
├─ Discovery: Finds tool through colleague recommendation
├─ Onboarding: Expects quick setup (<5 minutes)
├─ Daily Use: Integrates into existing workflow
└─ Advocacy: Shares with team if it saves time
```

### 4. Modify Persona
**Command**: `/persona edit <name|number>`

Edit an existing persona:

```yaml
=== EDIT PERSONA: Developer Dan ===

Select what to modify:
1. Basic Information
2. Demographics
3. Goals & Motivations
4. Pain Points
5. Technology & Tools
6. User Journey
7. Scenarios

Choice: 3

Current Goals:
- Primary: Ship features faster without sacrificing quality

New Primary Goal: Build scalable microservices architecture

✅ Persona updated successfully
```

### 5. Generate Persona
**Command**: `/persona generate <description>`

Use AI to generate a persona based on a description:

```bash
/persona generate startup founder who needs project management tools

Generating persona based on your description...

=== GENERATED PERSONA ===

👤 "Founder Fiona"
├─ Age: 34
├─ Role: Startup CEO/Founder
├─ Company: B2B SaaS (15 employees)
└─ Quote: "Every minute counts when you're building a company"

[Full persona generated...]

Save this persona? (Y/N): Y
✅ Persona saved as "Founder Fiona"
```

### 6. Use in Development
**Command**: `/persona use <name> for <task>`

Apply persona context to development tasks:

```bash
/persona use "Developer Dan" for API design

=== APPLYING PERSONA CONTEXT ===

Designing API with Developer Dan in mind:
✓ RESTful patterns (familiar to Dan)
✓ Clear error messages (addresses documentation pain point)
✓ TypeScript types included (matches tech preferences)
✓ Minimal configuration (values simplicity)
✓ Good defaults (reduces boilerplate)

Recommendations:
1. Use conventional REST endpoints
2. Include comprehensive error codes
3. Provide TypeScript definitions
4. Enable auto-documentation
5. Add code examples
```

### 7. Export Personas
**Command**: `/persona export [format]`

Export personas for sharing:

```bash
/persona export markdown

=== EXPORTING PERSONAS ===

Format: Markdown
Location: ./docs/personas/

Files created:
✓ personas-overview.md
✓ efficient-emma.md
✓ developer-dan.md
✓ junior-jamie.md

✅ Export complete
```

## Integration with Agents

### How Agents Use Personas

**Prometheus (PM)**: Creates initial personas during product planning
```yaml
"I'll create 3-5 personas representing our target users..."
```

**Apollo (UX)**: References personas for design decisions
```yaml
"Based on Developer Dan's preference for minimal configuration..."
```

**Athena (PO)**: Validates stories against personas
```yaml
"This story addresses Efficient Emma's pain point about tool fragmentation..."
```

**Hermes (SM)**: Includes persona context in story preparation
```yaml
"For Developer Dan persona: Focus on developer experience and API simplicity"
```

**Hephaestus (Developer)**: Implements with persona needs in mind
```yaml
"Adding keyboard shortcuts since Developer Dan values efficiency..."
```

## Persona Template Structure

Personas follow the template in `.claude/templates/persona.md`:

1. **Header**: Name, photo placeholder, tagline
2. **Basic Information**: Demographics and background
3. **Psychographics**: Personality, values, lifestyle
4. **Goals & Motivations**: What drives them
5. **Pain Points**: Current frustrations
6. **Technology Profile**: Tools and preferences
7. **User Journey**: How they interact with product
8. **Scenarios**: Specific use cases
9. **Quotes**: Actual or representative statements

## Best Practices

### Creating Effective Personas

1. **Base on Research**: Use real user data when possible
2. **Be Specific**: Avoid generic descriptions
3. **Include Emotions**: Capture frustrations and delights
4. **Make Them Memorable**: Use names and quotes
5. **Keep Updated**: Evolve as you learn more

### Using Personas Effectively

1. **Reference Regularly**: Check decisions against personas
2. **Share Widely**: Ensure all team members know them
3. **Test Assumptions**: Validate persona accuracy
4. **Limit Number**: 3-5 personas maximum
5. **Prioritize**: Identify primary vs secondary personas

## Quick Examples

### Create Marketing Persona
```bash
/persona create
> Name: Marketing Mary
> Role: Digital Marketing Manager
> Primary Goal: Increase lead generation
> Pain Point: Disconnected analytics tools
```

### Check Feature Fit
```bash
/persona use "Marketing Mary" for analytics dashboard
# Get recommendations based on Mary's needs
```

### Team Alignment
```bash
/persona list
# Review all personas before sprint planning
```

## Storage

Personas are stored in the project directory:
```
project/
├── .claude/
│   └── personas/
│       ├── developer-dan.yaml
│       ├── efficient-emma.yaml
│       └── junior-jamie.yaml
└── docs/
    └── personas/
        └── personas-overview.md
```

## Tips

- Start with 2-3 core personas
- Update personas based on user feedback
- Use personas in all product decisions
- Share personas with stakeholders
- Review and refresh quarterly

The `/persona` command ensures user-centered development by keeping target users at the forefront of all decisions.