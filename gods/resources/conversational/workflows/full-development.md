---
name: full-development
description: Complete development workflow from requirements to deployment
agents: [prometheus, daedalus, hephaestus, themis, aegis]
---

# Full Development Workflow

This workflow coordinates multiple agents to deliver a complete solution.

## Workflow Steps

### 1. Product Definition (Prometheus)
- Gather requirements
- Create PRD
- Define success metrics
- Prioritize features

### 2. Architecture Design (Daedalus)
- System design based on PRD
- Technology selection
- Component architecture
- Integration planning

### 3. Security Planning (Aegis)
- Threat modeling
- Security requirements
- Authentication design
- Compliance check

### 4. Implementation (Hephaestus)
- Code structure setup
- Core feature implementation
- API development
- Error handling

### 5. Quality Assurance (Themis)
- Test strategy
- Test case creation
- Automation planning
- Performance testing

## Handoff Points

Each agent provides clear deliverables:

```yaml
prometheus_to_daedalus:
  - requirements.md
  - user-stories.md
  - success-metrics.md

daedalus_to_aegis:
  - architecture-diagram.png
  - tech-stack.md
  - api-spec.yaml

aegis_to_hephaestus:
  - security-requirements.md
  - auth-flow.md
  - threat-model.md

hephaestus_to_themis:
  - implemented-code/
  - setup-guide.md
  - api-docs.md

themis_output:
  - test-plan.md
  - test-cases.yaml
  - quality-report.md
```

## Usage

1. Start with Zeus:
   ```
   /agents zeus
   orchestrate "Build a task management app"
   ```

2. Zeus will coordinate this workflow automatically

3. Each agent will:
   - Analyze their part
   - Create deliverables
   - Hand off to next agent

## Success Criteria

- [ ] Clear requirements documented
- [ ] Architecture scalable and maintainable  
- [ ] Security built-in from start
- [ ] Code follows best practices
- [ ] Comprehensive test coverage

## Notes

- Workflow is adaptive based on project needs
- Agents may loop back for clarification
- Zeus monitors overall progress
- Context preserved between handoffs