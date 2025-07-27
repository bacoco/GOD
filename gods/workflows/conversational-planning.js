import { ConversationalUX } from '../lib/conversational/conversational-ux.js';
import { ConversationRecovery } from '../lib/conversational/conversation-recovery.js';

/**
 * Conversational project planning workflow
 * Guides users through natural conversation to full project implementation
 */
export async function conversationalProjectPlanning(pantheon, userRequest, options = {}) {
  const ux = options.ux || new ConversationalUX();
  const recovery = new ConversationRecovery();
  
  // Initialize UX if needed
  if (!ux.initialized) {
    await ux.initialize();
  }
  
  try {
    // 1. Start with Zeus for high-level understanding
    const zeus = await pantheon.summon('zeus');
    
    // Show conversation plan to user
    const plan = await ux.showConversationPlan(null, {
      phases: ['Understanding', 'Requirements', 'Design', 'Architecture', 'Planning', 'Implementation'],
      estimatedTime: '15-20 minutes'
    });
    
    console.log('\n🏛️ Starting Conversational Project Planning\n');
    console.log(formatConversationPlan(plan));
    
    // Start conversation with Zeus
    const { session, agent: zeusAgent } = await zeus.startConversation(userRequest, {
      baseAgent: 'orchestrator',
      adaptations: {
        focus: 'Project understanding and orchestration',
        conversationalStyle: 'exploratory'
      }
    });
    
    // Zeus gathers initial understanding
    console.log(`\n${ux.getPersona('zeus').greeting}\n`);
    
    const projectOverview = await zeusAgent.execute({
      task: 'understand-project',
      userRequest: userRequest,
      questions: [
        "What problem are you trying to solve?",
        "Who are your target users?",
        "What's your timeline?"
      ]
    });
    
    // Update session context
    await session.updateContext('zeus', {
      project: {
        type: projectOverview.projectType,
        name: projectOverview.projectName,
        description: projectOverview.description
      },
      currentPhase: 'Requirements'
    }, 'Initial project understanding complete');
    
    // 2. Determine which specialists to involve
    const requiredGods = await zeus.analyzeProjectNeeds(projectOverview);
    console.log(`\n⚡ Zeus: Based on your project, I'll bring in: ${requiredGods.join(', ')}\n`);
    
    // 3. Requirements gathering with Prometheus
    if (requiredGods.includes('prometheus')) {
      const prometheus = await pantheon.summon('prometheus');
      
      // Handoff from Zeus to Prometheus
      const handoff = ux.generateHandoff('zeus', 'prometheus', {
        reason: 'detailed requirements gathering',
        previousWork: { phase: 'understanding' },
        transitionType: 'toRequirements'
      });
      
      console.log(`\n${handoff.farewell}`);
      await displayTransition(handoff);
      console.log(`${handoff.greeting}\n`);
      
      await pantheon.messenger.handoffConversation(zeus, prometheus, session, {
        phase: 'requirements',
        reason: 'Detailed feature and requirement definition'
      });
      
      // Prometheus continues conversation
      const requirements = await prometheus.continueConversation(session);
      
      // Generate PRD
      const prd = await prometheus.generateDocumentation('PRD', {
        projectOverview,
        requirements,
        format: 'markdown'
      });
      
      await session.updateContext('prometheus', {
        requirements: {
          functional: requirements.features,
          nonFunctional: requirements.constraints,
          userStories: requirements.stories
        },
        artifacts: {
          documents: [{ type: 'PRD', content: prd, createdBy: 'prometheus' }]
        },
        currentPhase: 'Design'
      }, 'Requirements documented');
      
      // Show progress
      const progress = ux.renderConversationProgress(session);
      console.log(formatProgress(progress));
    }
    
    // 4. Design phase with Apollo
    if (requiredGods.includes('apollo')) {
      const apollo = await pantheon.summon('apollo');
      
      // Handoff to Apollo
      const handoff = ux.generateHandoff(
        session.getCurrentSpeaker() || 'prometheus', 
        'apollo',
        {
          reason: 'user experience design',
          previousWork: { phase: 'requirements' },
          transitionType: 'toDesign'
        }
      );
      
      await displayTransition(handoff);
      
      await pantheon.messenger.handoffConversation(
        pantheon.getGod(session.getCurrentSpeaker()),
        apollo,
        session,
        { phase: 'design', reason: 'Create user experience' }
      );
      
      // Apollo designs user experience
      const userJourneys = await apollo.continueConversation(session);
      
      // Generate design artifacts
      const designDocs = await apollo.generateDocumentation('user-journey', {
        requirements: session.context.requirements,
        journeys: userJourneys
      });
      
      await session.updateContext('apollo', {
        design: {
          userFlows: userJourneys.flows,
          wireframes: userJourneys.wireframes,
          designSystem: userJourneys.designSystem
        },
        artifacts: {
          diagrams: [{ type: 'user-journey', content: designDocs, createdBy: 'apollo' }]
        },
        currentPhase: 'Architecture'
      }, 'Design complete');
    }
    
    // 5. Architecture with Daedalus
    if (requiredGods.includes('daedalus')) {
      const daedalus = await pantheon.summon('daedalus');
      
      const handoff = ux.generateHandoff(
        session.getCurrentSpeaker() || 'apollo',
        'daedalus',
        {
          reason: 'technical architecture',
          previousWork: { phase: 'design' },
          transitionType: 'toArchitecture'
        }
      );
      
      await displayTransition(handoff);
      
      await pantheon.messenger.handoffConversation(
        pantheon.getGod(session.getCurrentSpeaker()),
        daedalus,
        session,
        { phase: 'architecture', reason: 'Design technical architecture' }
      );
      
      // Daedalus creates architecture
      const architecture = await daedalus.continueConversation(session);
      
      const techSpec = await daedalus.generateDocumentation('tech-spec', {
        requirements: session.context.requirements,
        design: session.context.design,
        architecture
      });
      
      await session.updateContext('daedalus', {
        architecture: {
          components: architecture.components,
          technologies: architecture.techStack,
          patterns: architecture.patterns
        },
        artifacts: {
          documents: [{ type: 'tech-spec', content: techSpec, createdBy: 'daedalus' }]
        },
        currentPhase: 'Planning'
      }, 'Architecture defined');
    }
    
    // 6. Final orchestration plan
    // Return to Zeus for final orchestration
    const finalHandoff = ux.generateHandoff(
      session.getCurrentSpeaker(),
      'zeus',
      {
        reason: 'final project orchestration',
        previousWork: { phase: 'planning' }
      }
    );
    
    await displayTransition(finalHandoff);
    
    await pantheon.messenger.handoffConversation(
      pantheon.getGod(session.getCurrentSpeaker()),
      zeus,
      session,
      { phase: 'orchestration', reason: 'Create implementation plan' }
    );
    
    // Zeus creates final implementation plan
    const implementationPlan = await zeus.continueConversation(session);
    
    await session.updateContext('zeus', {
      implementation: {
        plan: implementationPlan,
        phases: implementationPlan.phases,
        timeline: implementationPlan.timeline
      },
      currentPhase: 'Complete'
    }, 'Planning complete');
    
    // 7. Generate final summary
    const summary = ux.generateConversationSummary(session);
    console.log('\n' + formatSummary(summary));
    
    // Generate all artifacts
    const artifacts = await session.generateArtifacts({
      includeDecisionLog: true,
      includeConversationSummary: true,
      linkToSource: true
    });
    
    // Option to proceed with implementation
    if (options.autoImplement) {
      console.log('\n🚀 Proceeding with implementation...\n');
      
      const implementationResult = await pantheon.executeWorkflow('full-development', {
        session,
        artifacts,
        plan: implementationPlan
      });
      
      return {
        session,
        artifacts,
        implementationResult
      };
    }
    
    return {
      session,
      artifacts,
      plan: implementationPlan,
      nextSteps: [
        'Review generated documentation',
        'Approve implementation plan',
        'Execute development workflow'
      ]
    };
    
  } catch (error) {
    // Handle failures gracefully
    const recoveryResult = await recovery.handleAgentFailure(
      session,
      { id: 'workflow', name: 'conversational-planning' },
      error
    );
    
    if (recoveryResult.action === 'retry') {
      console.log(`\n⚠️ ${recoveryResult.message}\n`);
      // Retry with simplified approach
      return conversationalProjectPlanning(pantheon, userRequest, {
        ...options,
        simplified: true
      });
    }
    
    throw error;
  }
}

/**
 * Display transition animation
 */
async function displayTransition(handoff) {
  // In a real implementation, this would show visual transition
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('...');
  await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Format conversation plan for display
 */
function formatConversationPlan(plan) {
  let output = `${plan.title}\n${'─'.repeat(40)}\n\n`;
  
  plan.phases.forEach((phase, i) => {
    const status = phase.status === 'active' ? '▶' : '○';
    output += `${status} ${phase.number}. ${phase.name} (${phase.god})\n`;
  });
  
  output += `\n⏱️ Estimated time: ${plan.estimatedTime}\n`;
  output += `\n${plan.message}\n`;
  
  return output;
}

/**
 * Format progress display
 */
function formatProgress(progress) {
  let output = '\n📊 Progress Update\n─────────────────\n';
  
  output += `Current: ${progress.currentSpeaker.name} ${progress.currentSpeaker.avatar}\n`;
  output += `Progress: ${progress.progress.bar}\n`;
  output += `Phase: ${progress.progress.phase}\n\n`;
  
  output += 'Participants:\n';
  progress.participants.forEach(p => {
    output += `  ${p.emoji} ${p.name} ${p.status} - ${p.contributions} contributions\n`;
  });
  
  return output;
}

/**
 * Format conversation summary
 */
function formatSummary(summary) {
  let output = `${summary.title}\n${'═'.repeat(40)}\n\n`;
  
  output += `Duration: ${summary.duration}\n`;
  output += `Topic: ${summary.mainTopics}\n\n`;
  
  output += 'Participants:\n';
  summary.participants.forEach(p => {
    output += `  ${p.emoji} ${p.name} (${p.role}) - ${p.contributions} contributions\n`;
  });
  
  output += '\nKey Outcomes:\n';
  summary.keyOutcomes.forEach(outcome => {
    output += `  • ${outcome}\n`;
  });
  
  if (summary.mvp) {
    output += `\n🏆 MVP: ${summary.mvp.emoji} ${summary.mvp.name}\n`;
  }
  
  return output;
}

/**
 * Simple conversational start
 */
export async function startConversation(pantheon, topic) {
  const zeus = await pantheon.summon('zeus');
  const conversation = await zeus.converseAbout(topic);
  
  return {
    ask: conversation.ask,
    conclude: conversation.conclude,
    session: conversation.session
  };
}