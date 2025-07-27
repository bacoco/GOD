# /workflow Command - Multi-Agent Workflow Execution

## ACTIVATION

When the user types `/workflow [name]` or `/workflow`, execute the multi-agent workflow orchestration system using the WorkflowEngine from `.claude/lib/workflow-engine.md`.

## Command Overview

The `/workflow` command enables coordinated multi-agent execution where agents work together in sequence or parallel to complete complex tasks. Workflows preserve context between agents and manage handoffs effectively.

## Available Workflows

### 1. Product Planning Workflow
**Command**: `/workflow product-planning`
**Flow**: PM (Prometheus) → PO (Athena) → SM (Hermes)
**Purpose**: Transform product vision into sprint-ready stories

### 2. Implementation Workflow  
**Command**: `/workflow implementation`
**Flow**: Architect (Daedalus) → Developer (Hephaestus) → QA (Themis) with Security (Aegis) review
**Purpose**: From architecture to tested implementation with security

### 3. UI Feature Workflow
**Command**: `/workflow ui-feature`
**Flow**: UX (Apollo) → Developer (Hephaestus) → QA (Themis)
**Purpose**: Design to implemented UI component with testing

### 4. Security-First Development
**Command**: `/workflow security-development`
**Flow**: Security (Aegis) → Developer (Hephaestus) → Security (Aegis)
**Purpose**: Build features with security designed in from the start

### 5. Adaptive Feature Development (NEW - Smart Routing)
**Command**: `/workflow adaptive-feature`
**Flow**: Auto-Route → Auto-Route → Auto-Route → Auto-Route
**Purpose**: Feature development with dynamic agent selection based on task requirements
**Note**: Requires Smart Routing to be enabled

### 6. Security-First Adaptive (NEW - Smart Routing)
**Command**: `/workflow security-adaptive`
**Flow**: Auto-Route (Security Focus) → Auto-Route (Architecture) → Implementation
**Purpose**: Security-focused development with intelligent agent selection
**Note**: Requires Smart Routing to be enabled

### 7. Custom Workflow
**Command**: `/workflow custom`
**Purpose**: Build a custom workflow interactively

## Usage Patterns

### List Available Workflows
```
/workflow
```
Shows all available workflows with descriptions and visual flow.

### Start Specific Workflow
```
/workflow product-planning
/workflow implementation
/workflow ui-feature
```
Initiates the specified workflow with progress tracking.

### Resume Paused Workflow
```
/workflow resume
```
Continue a previously paused workflow from where it left off.

## Implementation

When this command is invoked:

1. **Parse the command**:
   - No argument: List available workflows
   - With workflow name: Start specified workflow
   - `resume`: Continue paused workflow
   - `custom`: Build custom workflow

2. **For listing workflows**:
   ```
   🔄 Available BACO Workflows
   
   1️⃣ Product Planning (product-planning)
      Flow: PM → PO → SM
      Creates: PRD, Roadmap, User Stories, Sprint Plan
      Duration: 30-45 minutes
   
   2️⃣ Implementation (implementation)
      Flow: Architect → Developer → QA (+ Security)
      Creates: System Design, Code, Tests, Security Assessment
      Duration: 45-60 minutes
   
   3️⃣ UI Feature (ui-feature)
      Flow: UX → Developer → QA
      Creates: Component Specs, Implementation, Tests
      Duration: 30-45 minutes
   
   4️⃣ Security-First Development (security-development)
      Flow: Security → Developer → Security
      Creates: Threat Model, Secure Implementation, Validation
      Duration: 45-60 minutes
   
   Usage: /workflow <name> to start
   ```

3. **For workflow execution**:
   ```typescript
   // Pseudo-implementation using WorkflowEngine
   async function executeWorkflow(workflowName: string) {
     // Import and initialize engine
     const engine = new WorkflowEngine();
     
     // Get workflow definition
     const workflow = engine.getWorkflow(workflowName);
     
     // Gather required inputs
     const inputs = await gatherInputs(workflow);
     
     // Execute with real-time updates
     console.log(`🚀 Starting ${workflow.name}`);
     
     // Subscribe to events
     engine.on('step:started', showStepStart);
     engine.on('step:completed', showStepComplete);
     
     // Execute workflow
     const result = await engine.executeWorkflow(workflowName, inputs);
     
     // Show results
     showWorkflowSummary(result);
   }
   ```

## Workflow Execution Examples

### Product Planning Workflow

```
/workflow product-planning

📝 Product Planning Workflow
━━━━━━━━━━━━━━━━━━━━━━━━━━━

This workflow will transform your product vision into sprint-ready stories.

Required inputs:
• Product Vision: [Enter your product vision]
• Market Research: [Key insights and data]
• Team Capacity: [Available hours/points]

Ready to start? (y/n): y

🚀 Starting Product Planning Workflow

Step 1/6: Create PRD
✨ Prometheus (PM): Starting generatePRD
   Creating comprehensive product requirements document...
✅ Prometheus (PM): Completed generatePRD
📄 Created: docs/product/prd.md

Step 2/6: Create Roadmap
✨ Prometheus (PM): Starting generateRoadmap
   Mapping out product timeline and milestones...
✅ Prometheus (PM): Completed generateRoadmap
📄 Created: docs/product/roadmap.md

[Workflow continues...]

✅ Workflow Complete!
━━━━━━━━━━━━━━━━━━━
Duration: 35 minutes
Artifacts created: 6
• PRD
• Roadmap
• 8 User Stories
• Validation Report
• 8 AI-Ready Stories
• Sprint Plan
```

### Implementation Workflow

```
/workflow implementation

🏗️ Implementation Workflow
━━━━━━━━━━━━━━━━━━━━━━━━

From architecture to tested implementation with security review.

Required inputs:
• Requirements: [Path to requirements doc or description]
• Technical Constraints: [Any limitations or requirements]
• Security Level: [standard/enhanced/critical]

🚀 Executing workflow...

Step 1/6: Design Architecture
✨ Daedalus (Architect): Starting generateSystemDesign
⚙️ Parallel Step 2/6: Security Review
✨ Aegis (Security): Starting securityAssessment

[Progress visualization]
Architecture: ████████████████░░░░ 80%
Security:     ██████████░░░░░░░░░░ 50%

✅ Daedalus: Completed generateSystemDesign
📄 Created: docs/architecture/system-design.md
📄 Created: docs/architecture/decisions/

Step 3/6: Implement Feature
✨ Hephaestus (Developer): Starting implementFeature
   Context received from Daedalus: System design with microservices approach
```

### UI Feature Workflow

```
/workflow ui-feature

🎨 UI Feature Workflow
━━━━━━━━━━━━━━━━━━━━

Design to implementation for UI components.

Required inputs:
• User Story: [Description of the UI feature]
• Design Requirements: [Visual/UX requirements]
• Target Framework: [React/Vue/Angular/etc]

Component: User Profile Card
Framework: React
Accessibility: WCAG 2.1 AA

🚀 Starting workflow...

✨ Apollo (UX): Creating component specification
   - Analyzing user needs
   - Defining interaction patterns
   - Creating design tokens
```

## Workflow Features

### Parallel Execution
Workflows automatically identify steps that can run in parallel:
- Security reviews run alongside architecture design
- UI tests run alongside accessibility audits
- Visual indicators show parallel progress

### Context Preservation
Each agent receives:
- Artifacts from previous steps
- Handoff summaries with key decisions
- Shared memory with project context
- Clear action requirements

### Progress Tracking
```
Product Planning Progress
════════════════════════
[✅] Create PRD           (2 min)
[✅] Create Roadmap       (1 min)
[🔄] Create User Stories  (40% - in progress)
[⏸️] Validate Stories     (waiting)
[⏸️] AI-Ready Stories     (waiting)
[⏸️] Sprint Planning      (waiting)

Overall: ████████░░░░░░░░ 35%
Elapsed: 8 minutes | Est. remaining: 15 minutes
```

### State Management
- **Auto-save**: Progress saved after each step
- **Pause/Resume**: Stop and continue workflows anytime
- **Recovery**: Automatic recovery from interruptions
- **History**: Track all workflow executions

## Custom Workflow Builder

```
/workflow custom

🔧 Custom Workflow Builder
━━━━━━━━━━━━━━━━━━━━━━━

Let's build a custom workflow!

Workflow name: Feature Deployment
Description: Complete feature from dev to production

Step 1:
• Agent: Hephaestus (Developer)
• Action: Complete feature implementation
• Creates: Source code

Add another step? (y/n): y

Step 2:
• Agent: Themis (QA)
• Action: Run comprehensive tests
• Requires: Source code from Step 1
• Creates: Test results
• Can run in parallel with: None

[Continue building...]

✅ Custom workflow "Feature Deployment" created!
Run with: /workflow feature-deployment
```

## Error Handling

### Graceful Recovery
- **Failed Steps**: Option to retry, skip, or abort
- **Missing Inputs**: Interactive prompts for required data
- **Agent Errors**: Fallback to manual completion
- **Network Issues**: Auto-save and resume capability

### User Controls During Execution
```
⚠️ Step failed: Security assessment incomplete

Options:
1. Retry step with Aegis
2. Skip security review (not recommended)
3. Pause workflow for manual intervention
4. Abort workflow

Choice (1-4): _
```

## Smart Routing Integration (NEW)

When Smart Routing is enabled, workflows can dynamically select the best agents for each task:

### How It Works

1. **Auto-Route Steps**: Steps marked with `agent: 'auto-route'` will use Smart Routing
2. **Task Analysis**: Each step's requirements are analyzed in real-time
3. **Agent Selection**: The best agent is selected based on capabilities and task match
4. **Transparency**: All routing decisions show confidence scores and reasoning

### Example: Adaptive Workflow

```
/workflow adaptive-feature

🎯 Smart Routing Workflow: Adaptive Feature Development
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Analyze Requirements
📊 Analyzing task...
✓ Domains: [planning, analysis]
✓ Complexity: 5/10
🎯 Routing to: Prometheus (PM) - 88% confidence
Reasoning: Strong domain expertise in planning, requirements.

Step 2: Design Solution  
📊 Analyzing task...
✓ Domains: [architecture, design]
✓ Complexity: 7/10
🎯 Routing to: Daedalus (Architect) - 92% confidence
Reasoning: Expert in architecture-design, system-design.

[Continue with dynamic routing for each step...]
```

### Configuration

Smart Routing in workflows respects these settings:
- `ENABLE_WORKFLOW_ROUTING`: Master switch for workflow routing
- `WORKFLOW_ROUTE_THRESHOLD`: Auto-accept threshold (default: 0.75)
- `ALLOW_EXECUTION_OVERRIDE`: Allow manual override during execution

### Creating Custom Adaptive Workflows

```
/workflow custom

Add step with Smart Routing? Yes
Describe the task: Design a scalable API architecture
📊 Analysis: architecture, backend | Complexity: 7/10
🎯 Recommended: Daedalus (85%)
Use recommendation? Yes/No/Auto-route
```

## Integration with Other Commands

### Workflow Recommendations
Use `/analyze` first to get workflow suggestions:
```
/analyze "implement user authentication"

Recommended workflow: implementation
- High security requirements detected
- Multiple components involved
- Testing critical for auth features
```

### Agent Context
Agents within workflows have access to:
- All previous artifacts
- Workflow goals and context
- Handoff information
- Shared memory state

### Artifact Management
All workflow artifacts are:
- Organized by workflow session
- Tagged with metadata
- Easily exportable
- Version controlled

## Best Practices

1. **Start Simple**: Use pre-built workflows before creating custom ones
2. **Provide Context**: Rich initial inputs lead to better results
3. **Monitor Progress**: Watch for blockers or issues
4. **Review Handoffs**: Ensure context is preserved between agents
5. **Save Important Artifacts**: Export key deliverables after completion

## Workflow Completion

When a workflow completes:
```
✅ Workflow Complete: Implementation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Duration: 47 minutes
Steps completed: 6/6
Artifacts created: 12

Key Deliverables:
📄 System Design: docs/architecture/system-design.md
💻 Implementation: src/features/auth/
🧪 Test Suite: src/__tests__/auth/
🔒 Security Report: docs/security/auth-assessment.md

Quality Metrics:
✓ All tests passing
✓ Security review approved
✓ Code coverage: 92%
✓ Documentation complete

Next Steps:
1. Review all artifacts with team
2. Deploy to staging environment
3. Schedule security penetration test
4. Plan production rollout

Export artifacts? (y/n): _
```

## Advanced Usage

### Workflow Composition
Chain workflows together:
```
/workflow compose implementation → deployment
```

### Conditional Workflows
Workflows can branch based on:
- Analysis results
- User decisions
- Quality gates
- External factors

### Workflow Templates
Save successful workflows as templates:
```
/workflow save-as-template "auth-implementation"
```

Remember: Workflows are designed to handle complex, multi-step processes that benefit from multiple specialist perspectives working in coordination.