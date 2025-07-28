/**
 * Enhanced MCP Adapter with Approval Flow
 * This shows what needs to be added for user approval
 */

// Add to conversation phases
const CONVERSATION_PHASES = {
  DISCOVERY: 'discovery',
  PLANNING: 'planning', 
  PROPOSAL: 'proposal',  // NEW PHASE
  APPROVED: 'approved',
  EXECUTION: 'execution'
};

// Add to generateGodResponse method
async generateGodResponseWithApproval(god, message, session) {
  const context = {
    projectIdea: session.projectIdea,
    currentPhase: session.currentPhase,
    participants: session.participants,
    conversationHistory: session.conversationHistory.slice(-10)
  };

  // Check if we have enough info to create proposal
  if (session.currentPhase === 'discovery' && this.hasEnoughInfoForProposal(session)) {
    session.currentPhase = 'proposal';
    
    // Generate comprehensive proposal
    const proposal = this.generateProjectProposal(session);
    
    return {
      message: proposal,
      expectsResponse: true,
      awaitingApproval: true,  // NEW FLAG
      proposalData: session.proposalData  // Store for reference
    };
  }

  // Handle approval response
  if (session.awaitingApproval) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('yes') || lowerMessage.includes('approve') || lowerMessage.includes('proceed')) {
      session.currentPhase = 'approved';
      session.awaitingApproval = false;
      
      return {
        message: `Excellent! The divine plan is approved. 
        
I shall now summon our builders to begin creation:
- Hephaestus will spawn a backend specialist
- Apollo will create a UI artist
- Themis will deploy a testing guardian

*Thunder rumbles as the gods prepare to create their agents...*

The construction of ${session.projectIdea} begins NOW!`,
        expectsResponse: false,
        triggerExecution: true  // Signal to spawn agents
      };
    } 
    
    else if (lowerMessage.includes('no') || lowerMessage.includes('change')) {
      session.awaitingApproval = false;
      
      return {
        message: "Of course! What would you like to change about the plan?",
        expectsResponse: true,
        currentPhase: 'planning'  // Go back to planning
      };
    }
  }

  // Regular conversation flow
  return this.generateGodResponse(god, message, session);
}

// Check if we have enough info
hasEnoughInfoForProposal(session) {
  const hasUsers = session.conversationHistory.some(m => 
    m.message.toLowerCase().includes('user') || 
    m.message.toLowerCase().includes('team')
  );
  
  const hasTimeline = session.conversationHistory.some(m =>
    m.message.toLowerCase().includes('week') ||
    m.message.toLowerCase().includes('month') ||
    m.message.toLowerCase().includes('timeline')
  );
  
  const hasFeatures = session.conversationHistory.some(m =>
    m.message.toLowerCase().includes('need') ||
    m.message.toLowerCase().includes('feature') ||
    m.message.toLowerCase().includes('want')
  );
  
  return hasUsers && hasTimeline && hasFeatures;
}

// Generate the proposal
generateProjectProposal(session) {
  const proposal = {
    architecture: this.determineArchitecture(session),
    techStack: this.determineTechStack(session),
    timeline: this.determineTimeline(session),
    features: this.extractFeatures(session),
    godAssignments: this.assignGods(session)
  };
  
  session.proposalData = proposal;
  
  return `🏛️ **DIVINE DEVELOPMENT PROPOSAL**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**PROJECT**: ${session.projectIdea}
**USERS**: ${proposal.users || 'To be determined'}
**TIMELINE**: ${proposal.timeline}

**TECHNICAL ARCHITECTURE**:
${proposal.architecture}

**TECHNOLOGY STACK**:
• Backend: ${proposal.techStack.backend}
• Frontend: ${proposal.techStack.frontend}
• Database: ${proposal.techStack.database}
• Infrastructure: ${proposal.techStack.infrastructure}

**MVP FEATURES**:
${proposal.features.map(f => `✓ ${f}`).join('\n')}

**DIVINE TEAM ASSIGNMENTS**:
${proposal.godAssignments.map(g => `• ${g.god}: ${g.responsibility}`).join('\n')}

**DEVELOPMENT PHASES**:
Week 1: ${proposal.phases?.week1 || 'Backend & Infrastructure'}
Week 2: ${proposal.phases?.week2 || 'Frontend & Integration'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Do you approve this divine plan?** 
(Reply with "Yes" to proceed, or tell me what changes you'd like)`;
}

// Execute after approval
async executeApprovedPlan(session) {
  const plan = session.proposalData;
  
  // Spawn agents based on approved plan
  for (const assignment of plan.godAssignments) {
    await this.pantheon.spawnAgent({
      god: assignment.god,
      type: assignment.agentType,
      tools: assignment.tools,
      mission: assignment.responsibility,
      context: {
        project: session.projectIdea,
        techStack: plan.techStack,
        features: plan.features
      }
    });
  }
  
  return {
    message: "The gods have spawned their agents! Check your project directory - the divine construction has begun!",
    executionStarted: true,
    agents: plan.godAssignments.map(g => g.god)
  };
}