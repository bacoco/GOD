# /help Command - BACO Command Reference

ACTIVATION: When user types `/help`, display available commands and usage.

## 🆕 New: Simplified Workflow with pantheon.md

The gods now guide your development through sacred `pantheon.md` scrolls:

### Quick Start
```bash
/gods init     # Create a template pantheon.md file
/baco plan     # Generate development plan from pantheon.md
/baco execute  # Execute the plan
```

## Available Commands

### 🏛️ Divine Commands (NEW)
#### `/gods`
Summon the divine pantheon to orchestrate your development.

**Subcommands**:
- `/gods init` - Start interactive project setup conversation
- `/gods init --template` - Create a basic template pantheon.md file
- `/gods plan` - Generate development plan from pantheon.md
- `/gods validate` - Validate pantheon.md syntax and structure
- `/gods execute` - Execute the development plan

**Usage**: 
```
/gods init
# Edit pantheon.md with your requirements
/baco plan
```

### 📊 `/analyze <task>`
Perform multi-dimensional complexity analysis of a software development task.

**Usage**: `/analyze Build a real-time notification system`

**Output**: Detailed analysis across 5 dimensions (technical, domain, scale, team, timeline) with complexity scoring and recommendations.

### 🎭 `/orchestrate <task>`
Coordinate multiple specialist agents to provide comprehensive insights.

**Usage**: `/orchestrate Design a payment processing microservice`

**Output**: Perspectives from relevant agents (Architect, Developer, QA, Security) synthesized into actionable recommendations.

### 📝 `/generate-prp <task>`
Generate a complete Product Requirements Prompt for implementation.

**Usage**: `/generate-prp Create user authentication with JWT`

**Output**: Comprehensive implementation guide with context, tasks, validation strategy, and success criteria.

### 🧠 `/learn-pattern <task> <outcome>`
Evaluate and store successful implementation patterns for future use.

**Usage**: `/learn-pattern "WebSocket chat implementation" "Success: 50ms latency, 10k users"`

**Output**: Pattern evaluation and storage decision with applicability conditions.

### 🎯 `/gods route <task>` (NEW - Preview)
Intelligently route tasks to the most appropriate specialist agent(s) using Smart Routing.

**Usage**: `/gods route Design a secure API with rate limiting`

**Options**:
- `--preview` - Show routing without activation
- `--details` - Show detailed analysis
- `--auto` - Auto-accept if confidence > 70%
- `--json` - Output in JSON format

**Output**: Task analysis, routing recommendation with confidence, supporting agents, and alternatives.

### 👤 `/persona [action]`
Create, view, and manage user personas for user-centered development.

**Usage**: `/persona create` or `/persona view "Developer Dan"`

**Subcommands**:
- `/persona create` - Create new persona interactively
- `/persona list` - View all project personas
- `/persona view <name>` - View specific persona details
- `/persona edit <name>` - Modify existing persona
- `/persona generate <description>` - AI-generate persona
- `/persona use <name> for <task>` - Apply persona context

**Output**: Detailed persona information to guide development decisions.

### 📦 `/workspace [subcommand]`
Manage monorepo packages and dependencies.

**Subcommands**:
- `/workspace list` - List all packages in the workspace
- `/workspace add` - Add a new package to the workspace
- `/workspace link` - Link packages together
- `/workspace run` - Run commands across packages
- `/workspace graph` - Show dependency graph
- `/workspace info <package>` - Show package details

**Usage**: 
```
/workspace list
/workspace add
/workspace link @myapp/web @myapp/ui
/workspace run build --filter=changed
```

### 🐳 `/docker [subcommand]`
Generate and manage Docker configurations for your projects.

**Subcommands**:
- `/docker generate` - Generate optimized Dockerfile
- `/docker compose` - Generate docker-compose.yml
- `/docker optimize` - Optimize existing Docker setup
- `/docker security` - Add security best practices
- `/docker validate` - Validate Docker configuration

**Usage**: 
```
/docker generate --optimize
/docker compose --services frontend,backend,db
```

**Output**: Docker configuration files with best practices, multi-stage builds, and security features.

### ❓ `/help`
Display this help message with command descriptions and usage examples.

## Quick Start Guide

1. **Start with Analysis**: Always begin by analyzing task complexity
   ```
   /analyze Create a REST API for inventory management
   ```

2. **Get Expert Insights**: For complex tasks, orchestrate multiple agents
   ```
   /orchestrate Build a distributed event processing system
   ```

3. **Generate Implementation Guide**: Create detailed PRPs for development
   ```
   /generate-prp Implement OAuth2 authentication flow
   ```

4. **Learn from Success**: Record patterns from successful implementations
   ```
   /learn-pattern "Microservice deployment" "Achieved 99.9% uptime"
   ```

## Specialist Agents

When using `/orchestrate`, these specialists may be activated:

- **🏗️ Daedalus (Architect)**: System design, scalability, technology selection
- **💻 Hephaestus (Developer)**: Implementation approach, code quality, best practices
- **✅ Themis (QA)**: Testing strategy, user experience, quality assurance
- **🔒 Aegis (Security)**: Threat modeling, security controls, compliance
- **📊 Prometheus (PM)**: Product strategy, requirements, roadmap
- **🎯 Athena (PO)**: Story validation, acceptance criteria
- **🏃️ Hermes (SM)**: Sprint planning, AI-ready stories
- **🎨 Apollo (UX)**: User experience, design systems
- **🤖 Janus**: Meta-orchestration, workflow optimization

## The pantheon.md File Format

Create structured project requirements with YAML frontmatter and markdown sections:

```yaml
---
version: 1.0
project_type: "FastAPI Web Service"
author: "Your Name"
---

## FEATURE: Feature Name
Description of the feature...

## EXAMPLES:
- `./examples/pattern.py`: Description of example

## DOCUMENTATION:
- `https://docs.example.com`: Framework documentation

## CONSTRAINTS:
- Technical requirements and constraints

## OTHER CONSIDERATIONS:
Additional context...
```

See the `examples/` directory for complete examples:
- `janus.pantheon.md` - BACO itself (meta-example)
- `ecommerce-platform.pantheon.md` - E-commerce platform
- `saas-dashboard.pantheon.md` - Multi-tenant SaaS
- `chat-messaging.pantheon.md` - Real-time chat
- `video-streaming.pantheon.md` - Video platform
- `cms-platform.pantheon.md` - Content management
- `analytics-platform.pantheon.md` - Data analytics
- `ml-api-service.pantheon.md` - Machine learning API
- `developer-tools.pantheon.md` - Developer tools
- And more...

## Tips for Effective Use

1. **Use pantheon.md for Complex Projects**: Structured requirements lead to better results
2. **Provide Examples**: BACO learns from your coding patterns
3. **Be Specific**: The more context you provide, the better the analysis
4. **Iterate**: Use analysis results to refine your orchestration requests
5. **Learn Continuously**: Record successful patterns to build institutional knowledge
6. **Combine Commands**: Use analysis → orchestration → PRP generation for complex projects

## Examples by Scenario

### Simple Feature

**Traditional Approach:**
```
/analyze Add a search function to the user list
/generate-prp Add a search function to the user list
```

**Template pantheon.md Approach:**
```
/gods init --template
# Edit pantheon.md with search feature requirements
/baco plan
/baco execute
```

**Interactive pantheon.md Approach (Recommended):**
```
/gods init
# Answer questions about your project
# BACO analyzes your needs and generates customized pantheon.md
/baco plan
/baco execute
```

### Complex System

**Traditional Approach:**
```
/analyze Build a real-time collaborative editing platform
/orchestrate Build a real-time collaborative editing platform
/generate-prp Implement operational transformation for collaborative editing
```

**Interactive pantheon.md Approach (Recommended):**
```
/gods init
# BACO guides you through:
#   - Project type and architecture questions
#   - Feature discovery and prioritization
#   - Technical requirements gathering
#   - Documentation and example analysis
# Generates comprehensive pantheon.md automatically

/baco plan      # Review AI-generated plan
/baco execute   # Implement with full context
```

### Security-Critical
```
/analyze Implement payment processing with PCI compliance
/orchestrate Implement payment processing with PCI compliance
/learn-pattern "PCI-compliant payment flow" "Passed security audit"
```

### Monorepo Development
```
# Working in a monorepo
/workspace list                    # See all packages
/workspace add                     # Create new package
/workspace link @app/web @app/ui   # Link packages
/workspace run build               # Build everything
/workspace graph                   # Visualize dependencies

# BACO detects monorepo context automatically
/gods init                         # Offers to create package or work at root
```

## Need More Help?

- Provide more context for better analysis
- Combine multiple commands for comprehensive guidance
- Review stored patterns for similar past implementations