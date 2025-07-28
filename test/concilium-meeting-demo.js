#!/usr/bin/env node

import { PantheonCore } from '../gods/lib/pantheon-core.js';
import readline from 'readline/promises';
import chalk from 'chalk';

/**
 * Demonstration of Concilium - Divine Council Facilitator
 * Shows how users can participate in god meetings
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function demonstrateConciliumMeetings() {
  console.log(chalk.blue.bold('\n=== Concilium Meeting Room Demonstration ===\n'));
  
  // Initialize pantheon
  const pantheon = new PantheonCore({});
  await pantheon.initialize();
  
  // Summon Concilium
  console.log(chalk.cyan('Summoning Concilium - The Divine Council Facilitator...'));
  const concilium = await pantheon.summonGod('concilium');
  
  // Show meeting types
  console.log(chalk.yellow('\n--- Available Meeting Types ---'));
  const meetingTypes = Object.entries(concilium.meetingTypes).map(([key, config]) => 
    `${key}: ${config.name} (${config.duration || 'flexible'} min)`
  );
  console.log(meetingTypes.join('\n'));
  
  // Demo selection
  console.log(chalk.cyan('\n--- Choose a Demo Scenario ---'));
  console.log('1. Sprint Planning with Team Lead role');
  console.log('2. Architecture Review as Observer');
  console.log('3. Emergency Debug Session as Owner');
  console.log('4. Design Review as Participant');
  
  const choice = await rl.question('\nYour choice (1-4): ');
  
  switch (choice) {
    case '1':
      await demoSprintPlanning(pantheon, concilium);
      break;
    case '2':
      await demoArchitectureReview(pantheon, concilium);
      break;
    case '3':
      await demoEmergencySession(pantheon, concilium);
      break;
    case '4':
      await demoDesignReview(pantheon, concilium);
      break;
    default:
      console.log('Invalid choice, running sprint planning demo...');
      await demoSprintPlanning(pantheon, concilium);
  }
  
  await pantheon.shutdown();
  rl.close();
}

/**
 * Demo 1: Sprint Planning as Team Lead (Moderator)
 */
async function demoSprintPlanning(pantheon, concilium) {
  console.log(chalk.green('\n=== Sprint Planning Demo ==='));
  console.log('You are the Team Lead (Moderator role)');
  
  // Create meeting
  const meeting = await concilium.createMeeting({
    title: 'Sprint 42 Planning',
    type: 'sprint_planning',
    userId: 'team-lead-123',
    userRole: 'moderator',
    agenda: [
      'Review previous sprint',
      'Estimate new stories',
      'Commit to sprint goals'
    ]
  });
  
  console.log(chalk.gray(`\nMeeting created: ${meeting.room.title}`));
  console.log(chalk.gray(`Room ID: ${meeting.roomId}`));
  console.log(chalk.gray(`Gods present: ${meeting.gods.map(g => g.name).join(', ')}`));
  
  // Simulate meeting flow
  console.log(chalk.yellow('\n--- Meeting Started ---'));
  
  // User opens the meeting
  await simulateUserMessage(concilium, meeting.roomId, 'team-lead-123', 
    "Welcome everyone! Let's start with a review of last sprint."
  );
  
  // Hermes responds
  await simulateGodResponse(meeting.room, 'hermes', 
    "Last sprint we completed 8 story points. The authentication feature was delivered but the payment integration was carried over."
  );
  
  // Prometheus adds context
  await simulateGodResponse(meeting.room, 'prometheus', 
    "The payment integration delay was due to unclear requirements from the payment provider. I've since clarified these."
  );
  
  // User asks for estimates
  await simulateUserMessage(concilium, meeting.roomId, 'team-lead-123',
    "Good to know. Let's estimate the payment integration story. Hephaestus, what's your assessment?"
  );
  
  // Hephaestus provides estimate
  await simulateGodResponse(meeting.room, 'hephaestus',
    "With the clarified requirements, I estimate 5 story points. The main complexity is in handling webhook callbacks securely."
  );
  
  // Start a vote
  console.log(chalk.cyan('\n[Starting vote on estimate...]'));
  await simulateUserMessage(concilium, meeting.roomId, 'team-lead-123',
    "/vote Should we commit to 5 story points for payment integration?"
  );
  
  // Show action items
  console.log(chalk.cyan('\n[Extracting action items...]'));
  await simulateUserMessage(concilium, meeting.roomId, 'team-lead-123',
    "/action-items"
  );
  
  // End meeting
  console.log(chalk.cyan('\n[Ending meeting and generating summary...]'));
  const result = await concilium.endMeeting(meeting.roomId);
  
  console.log(chalk.green('\n--- Meeting Summary ---'));
  console.log(`Duration: ${result.summary.duration}`);
  console.log(`Decisions: ${result.summary.decisions.length}`);
  console.log(`Action Items: ${result.summary.actionItems.length}`);
  
  if (result.summary.actionItems.length > 0) {
    console.log(chalk.yellow('\nAction Items:'));
    result.summary.actionItems.forEach((item, i) => {
      console.log(`${i + 1}. ${item.action} (assigned to: ${item.assignedTo})`);
    });
  }
}

/**
 * Demo 2: Architecture Review as Observer
 */
async function demoArchitectureReview(pantheon, concilium) {
  console.log(chalk.green('\n=== Architecture Review Demo ==='));
  console.log('You are a Learning Developer (Observer role)');
  
  const meeting = await concilium.createMeeting({
    title: 'Microservices Architecture Review',
    type: 'architecture',
    userId: 'learner-456',
    userRole: 'observer',
    context: {
      topic: 'Designing microservices for e-commerce platform'
    }
  });
  
  console.log(chalk.gray(`\nJoining as observer. You can watch but not speak directly.`));
  console.log(chalk.gray('Use /raise-hand if you have questions.'));
  
  // Gods discuss architecture
  await simulateGodResponse(meeting.room, 'daedalus',
    "For an e-commerce platform, I recommend a service-oriented architecture with separate services for: inventory, orders, payments, and user management."
  );
  
  await simulateGodResponse(meeting.room, 'athena',
    "Good separation of concerns. How will these services communicate? Synchronous REST or asynchronous messaging?"
  );
  
  await simulateGodResponse(meeting.room, 'daedalus',
    "I suggest a hybrid approach: REST for user-facing operations requiring immediate response, and message queues for backend processing like order fulfillment."
  );
  
  // Observer raises hand
  console.log(chalk.yellow('\n[You raise your hand to ask a question]'));
  await simulateUserMessage(concilium, meeting.roomId, 'learner-456',
    "/raise-hand"
  );
  
  // Facilitator acknowledges
  await simulateGodResponse(meeting.room, 'concilium',
    "Our observer has a question. Please go ahead."
  );
  
  // Now temporarily allowed to speak
  console.log(chalk.gray('[You can now ask your question]'));
  
  console.log(chalk.green('\n--- Learning Summary ---'));
  console.log('As an observer, you learned about:');
  console.log('- Service separation strategies');
  console.log('- Communication patterns (REST vs messaging)');
  console.log('- When to use each approach');
}

/**
 * Demo 3: Emergency Debug Session
 */
async function demoEmergencySession(pantheon, concilium) {
  console.log(chalk.red('\n=== Emergency Debug Session ==='));
  console.log('You are the Incident Commander (Owner role)');
  
  const meeting = await concilium.createMeeting({
    title: '🚨 Production Down - Database Connection Issues',
    type: 'emergency',
    userId: 'ops-789',
    userRole: 'owner'
  });
  
  console.log(chalk.red('\nCRISIS ROOM ACTIVATED'));
  console.log(chalk.gray('Gods auto-summoned: Aegis, Themis, Hephaestus'));
  
  // Crisis response
  await simulateUserMessage(concilium, meeting.roomId, 'ops-789',
    "Production is down! Getting connection pool exhausted errors."
  );
  
  await simulateGodResponse(meeting.room, 'aegis',
    "Checking for security implications... No signs of DDoS or malicious activity."
  );
  
  await simulateGodResponse(meeting.room, 'themis',
    "Performance metrics show connection spike started 15 minutes ago. Coincides with deployment of version 2.4.1."
  );
  
  await simulateGodResponse(meeting.room, 'hephaestus',
    "Found it! New version has a connection leak in the user service. ACTION: I'll prepare a hotfix immediately."
  );
  
  // Quick decision
  await simulateUserMessage(concilium, meeting.roomId, 'ops-789',
    "Approved. Roll back immediately and prepare hotfix. Aegis, monitor for any security implications during rollback."
  );
  
  console.log(chalk.green('\n--- Incident Resolution ---'));
  console.log('✅ Root cause identified: Connection leak');
  console.log('✅ Immediate action: Rollback to 2.4.0');
  console.log('✅ Follow-up: Hotfix in progress');
  console.log('✅ Security: No compromise detected');
}

/**
 * Demo 4: Design Review as Participant
 */
async function demoDesignReview(pantheon, concilium) {
  console.log(chalk.green('\n=== Design Review Demo ==='));
  console.log('You are a Product Designer (Participant role)');
  
  const meeting = await concilium.createMeeting({
    title: 'Mobile App Redesign Review',
    type: 'design_review',
    userId: 'designer-321',
    userRole: 'participant',
    requestedGods: ['apollo', 'iris', 'calliope']
  });
  
  console.log(chalk.gray('\nYou can speak, vote, and actively participate.'));
  
  // Present designs
  await simulateUserMessage(concilium, meeting.roomId, 'designer-321',
    "I've redesigned our mobile app onboarding flow. The goal was to reduce drop-off rates."
  );
  
  await simulateGodResponse(meeting.room, 'apollo',
    "The visual hierarchy is excellent. The primary CTA really stands out now. How did you decide on the color palette?"
  );
  
  await simulateUserMessage(concilium, meeting.roomId, 'designer-321',
    "I used our existing brand colors but increased contrast for accessibility. WCAG AAA compliant."
  );
  
  await simulateGodResponse(meeting.room, 'iris',
    "Love the subtle animations between screens. They guide the eye naturally. Consider adding a gentle haptic feedback on button presses for mobile."
  );
  
  await simulateGodResponse(meeting.room, 'calliope',
    "The microcopy is much clearer now. 'Start your journey' is more inviting than 'Register'. One suggestion: make the privacy message more reassuring."
  );
  
  // Vote on approval
  const vote = await meeting.room.startVote(
    'Approve the new onboarding design?',
    ['approve', 'needs-revision', 'reject']
  );
  
  console.log(chalk.green('\n--- Design Review Outcome ---'));
  console.log('✅ Visual hierarchy: Approved');
  console.log('📝 Haptic feedback: To be added');
  console.log('📝 Privacy copy: Minor revision needed');
  console.log('Overall: Approved with minor revisions');
}

/**
 * Helper functions for simulation
 */
async function simulateUserMessage(concilium, roomId, userId, message) {
  console.log(chalk.blue(`\n[You]: ${message}`));
  await concilium.handleUserMessage(roomId, userId, message);
  await delay(500); // Simulate real-time
}

async function simulateGodResponse(room, godName, content) {
  console.log(chalk.magenta(`[${godName}]: ${content}`));
  await room.addMessage({
    from: godName,
    content,
    type: 'god'
  });
  await delay(500);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the demonstration
demonstrateConciliumMeetings().catch(console.error);