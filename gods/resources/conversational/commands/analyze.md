# /analyze Command - Complexity Analysis

ACTIVATION: When user types `/analyze <task>`, perform this multi-dimensional analysis.

## Analysis Framework

Analyze the provided task across these dimensions:

### 1. Technical Complexity (0-10)
- Architectural patterns required
- Integration points and dependencies  
- Performance and scalability needs
- Technical debt implications
- Required expertise domains

### 2. Domain Complexity (0-10)
- Business logic sophistication
- Compliance and regulatory requirements
- Industry-specific knowledge needed
- User experience considerations
- Security implications

### 3. Scale Complexity (0-10)
- Data volume and velocity
- Concurrent user requirements
- Geographic distribution needs
- Growth projections
- Infrastructure demands

### 4. Team Complexity (0-10)
- Coordination overhead
- Skill specialization requirements
- Communication pathways
- Knowledge transfer needs
- Stakeholder management

### 5. Timeline Complexity (0-10)
- Schedule constraints
- Critical path dependencies
- Parallel work streams
- Risk mitigation needs
- Iterative refinement cycles

## Output Format

```yaml
Task: [Original task description]

Complexity Analysis:
  Overall Level: [simple|moderate|complex|extreme]
  Confidence: [0.0-1.0]
  
  Dimensions:
    Technical: 
      Score: X.X/10
      Reasoning: [Specific evidence and considerations]
      Risk Factors: [What could increase complexity]
    
    Domain:
      Score: X.X/10  
      Reasoning: [Specific evidence and considerations]
      Risk Factors: [What could increase complexity]
    
    Scale:
      Score: X.X/10
      Reasoning: [Specific evidence and considerations]
      Risk Factors: [What could increase complexity]
    
    Team:
      Score: X.X/10
      Reasoning: [Specific evidence and considerations]
      Risk Factors: [What could increase complexity]
    
    Timeline:
      Score: X.X/10
      Reasoning: [Specific evidence and considerations]
      Risk Factors: [What could increase complexity]

  Key Complexity Drivers:
    1. [Most significant factor]
    2. [Second most significant]
    3. [Third most significant]

  Hidden Complexities:
    - [Non-obvious challenges]
    - [Potential surprises]

  Recommended Approach:
    [High-level strategy for handling this complexity]

  Suggested Agents:
    - [Agent name]: [Why they're needed]
    - [Agent name]: [Why they're needed]
```

## Important Considerations

1. Look beyond surface keywords - understand the true nature of the task
2. Consider both explicit and implicit requirements
3. Think about edge cases and failure modes
4. Evaluate long-term maintenance implications
5. Consider the human factors, not just technical

## Confidence Scoring

- **0.9-1.0**: Very confident, clear understanding of all aspects
- **0.7-0.8**: Good understanding, minor uncertainties
- **0.5-0.6**: Moderate understanding, several unknowns
- **Below 0.5**: Limited understanding, need more context

If confidence is below 0.7, explicitly state what additional information would help improve the analysis.

## Example

User: `/analyze Build a real-time collaborative document editor like Google Docs`

You would analyze across all dimensions, considering:
- Technical: WebSockets, operational transforms, conflict resolution
- Domain: Document editing, collaboration patterns
- Scale: Concurrent users, data synchronization
- Team: Frontend/backend coordination, UX expertise
- Timeline: Complex algorithm implementation time

Then provide the structured analysis following the format above.