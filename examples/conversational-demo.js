#!/usr/bin/env node

/**
 * Demonstration of conversational features in Pantheon
 * Shows how gods can have natural conversations with users
 */

import { PantheonCore } from '../gods/lib/pantheon-core.js';
import { conversationalProjectPlanning, startConversation } from '../gods/workflows/conversational-planning.js';
import chalk from 'chalk';
import readline from 'readline/promises';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function demo() {
  console.log(chalk.blue.bold(`
🏛️  ╔═══════════════════════════════════════════════════════╗
🏛️  ║      PANTHEON CONVERSATIONAL DEMO                     ║
🏛️  ║      Natural AI Orchestration Through Dialogue        ║
🏛️  ╚═══════════════════════════════════════════════════════╝
  `));

  try {
    // Initialize Pantheon
    console.log(chalk.gray('\nInitializing Pantheon...\n'));
    const pantheon = new PantheonCore({
      claudeFlowPath: './claude-flow',
      config: {
        conversationalMode: true
      }
    });
    
    await pantheon.initialize();
    
    // Show demo options
    console.log(chalk.cyan('Choose a demo:\n'));
    console.log('1. 💬 Simple Conversation with Zeus');
    console.log('2. 📋 Full Project Planning Conversation');
    console.log('3. 🔧 Technical Architecture Discussion');
    console.log('4. 🎨 UI/UX Design Consultation');
    console.log('5. 📊 Product Requirements Workshop\n');
    
    const choice = await rl.question('Your choice (1-5): ');
    
    switch (choice) {
      case '1':
        await simpleConversationDemo(pantheon);
        break;
        
      case '2':
        await fullProjectPlanningDemo(pantheon);
        break;
        
      case '3':
        await architectureDiscussionDemo(pantheon);
        break;
        
      case '4':
        await uxDesignDemo(pantheon);
        break;
        
      case '5':
        await productRequirementsDemo(pantheon);
        break;
        
      default:
        console.log(chalk.yellow('\nInvalid choice. Running simple conversation demo.\n'));
        await simpleConversationDemo(pantheon);
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ Demo failed:'), error.message);
    if (process.env.DEBUG) {
      console.error(error);
    }
  } finally {
    rl.close();
  }
}

/**
 * Demo 1: Simple conversation with Zeus
 */
async function simpleConversationDemo(pantheon) {
  console.log(chalk.blue('\n\n=== Simple Conversation Demo ===\n'));
  
  const topic = await rl.question('What would you like to discuss? ');
  
  // Start conversation with Zeus
  const conversation = await startConversation(pantheon, topic);
  
  console.log(chalk.gray('\n[Starting conversation with Zeus...]\n'));
  
  // Interactive conversation loop
  let continuing = true;
  while (continuing) {
    const question = await rl.question(chalk.cyan('\nYou: '));
    
    if (question.toLowerCase() === 'exit' || question.toLowerCase() === 'quit') {
      continuing = false;
    } else {
      const response = await conversation.ask(question);
      console.log(chalk.yellow(`\nZeus: ${response.content || response}`));
    }
  }
  
  // Conclude conversation
  const summary = await conversation.conclude();
  console.log(chalk.green('\n\n' + formatSummary(summary)));
}

/**
 * Demo 2: Full project planning conversation
 */
async function fullProjectPlanningDemo(pantheon) {
  console.log(chalk.blue('\n\n=== Full Project Planning Demo ===\n'));
  
  const projectIdea = await rl.question('Describe your project idea: ');
  
  console.log(chalk.gray('\n[Starting conversational project planning...]\n'));
  
  // Run the full conversational planning workflow
  const result = await conversationalProjectPlanning(pantheon, projectIdea, {
    autoImplement: false,
    interactive: true
  });
  
  console.log(chalk.green('\n\n✅ Project Planning Complete!\n'));
  console.log(chalk.cyan('Generated Artifacts:'));
  
  for (const [type, items] of Object.entries(result.artifacts.artifacts)) {
    if (items.length > 0) {
      console.log(`  - ${type}: ${items.length} items`);
    }
  }
  
  console.log(chalk.cyan('\nNext Steps:'));
  result.nextSteps.forEach((step, i) => {
    console.log(`  ${i + 1}. ${step}`);
  });
  
  const proceed = await rl.question('\nWould you like to see the implementation plan? (y/n): ');
  
  if (proceed.toLowerCase() === 'y') {
    console.log(chalk.blue('\n\n=== Implementation Plan ===\n'));
    console.log(formatImplementationPlan(result.plan));
  }
}

/**
 * Demo 3: Architecture discussion with Daedalus
 */
async function architectureDiscussionDemo(pantheon) {
  console.log(chalk.blue('\n\n=== Architecture Discussion Demo ===\n'));
  
  const system = await rl.question('What system architecture would you like to discuss? ');
  
  // Summon Daedalus
  const daedalus = await pantheon.summon('daedalus');
  
  // Start architecture-focused conversation
  const { session, agent } = await daedalus.startConversation(system, {
    baseAgent: 'architect',
    adaptations: {
      focus: 'System architecture and design patterns',
      expertise: ['microservices', 'cloud architecture', 'scalability']
    }
  });
  
  console.log(chalk.gray('\n[Daedalus joins the conversation...]\n'));
  console.log(chalk.yellow(`Daedalus: ${daedalus.persona.greeting}\n`));
  
  // Architecture discussion loop
  const questions = [
    'What scale do you need to support?',
    'Are there specific technology constraints?',
    'What are your main quality attributes (performance, security, etc.)?'
  ];
  
  for (const question of questions) {
    console.log(chalk.yellow(`\nDaedalus: ${question}`));
    const answer = await rl.question(chalk.cyan('You: '));
    
    const response = await daedalus.handleConversation({
      content: answer,
      from: 'user'
    }, session);
    
    if (response.suggestion) {
      console.log(chalk.green(`\n💡 Suggestion: ${response.suggestion}`));
    }
  }
  
  // Generate architecture document
  console.log(chalk.gray('\n[Generating architecture specification...]\n'));
  
  const techSpec = await daedalus.generateDocumentation('tech-spec', {
    session: session,
    format: 'detailed'
  });
  
  console.log(chalk.green('✅ Architecture specification generated!'));
  
  const view = await rl.question('\nWould you like to see a summary? (y/n): ');
  if (view.toLowerCase() === 'y') {
    console.log(chalk.blue('\n\n=== Architecture Summary ===\n'));
    console.log(techSpec.summary || 'Architecture document created successfully.');
  }
}

/**
 * Demo 4: UI/UX design consultation with Apollo
 */
async function uxDesignDemo(pantheon) {
  console.log(chalk.blue('\n\n=== UI/UX Design Consultation Demo ===\n'));
  
  const project = await rl.question('What kind of user interface are you designing? ');
  
  // Summon Apollo
  const apollo = await pantheon.summon('apollo');
  
  // Start design-focused conversation
  const conversation = await apollo.converseAbout(project, {
    baseAgent: 'ux-designer',
    adaptations: {
      focus: 'User experience and interface design',
      tools: ['ui-design', 'journey-mapper']
    }
  });
  
  console.log(chalk.gray('\n[Apollo joins for design consultation...]\n'));
  console.log(chalk.yellow(`Apollo: ${apollo.persona.greeting}\n`));
  
  // Design consultation
  const designQuestions = [
    'Who are your primary users?',
    'What emotions should the design evoke?',
    'Do you have any design inspirations or references?'
  ];
  
  for (const question of designQuestions) {
    console.log(chalk.yellow(`\nApollo: ${question}`));
    const answer = await rl.question(chalk.cyan('You: '));
    
    const response = await conversation.ask(answer);
    console.log(chalk.yellow(`\nApollo: ${response.content || response}`));
  }
  
  // Conclude with design recommendations
  const summary = await conversation.conclude();
  console.log(chalk.green('\n\n' + formatDesignSummary(summary)));
}

/**
 * Demo 5: Product requirements workshop with Prometheus
 */
async function productRequirementsDemo(pantheon) {
  console.log(chalk.blue('\n\n=== Product Requirements Workshop Demo ===\n'));
  
  const productIdea = await rl.question('What product are you building? ');
  
  // Summon Prometheus
  const prometheus = await pantheon.summon('prometheus');
  
  // Start requirements-focused conversation
  const { session, agent } = await prometheus.startConversation(productIdea, {
    baseAgent: 'product-manager',
    adaptations: {
      focus: 'Product requirements and user stories',
      tools: ['generate-prp', 'requirement-parser']
    }
  });
  
  console.log(chalk.gray('\n[Prometheus facilitates requirements workshop...]\n'));
  console.log(chalk.yellow(`Prometheus: ${prometheus.persona.greeting}\n`));
  
  // Requirements gathering
  console.log(chalk.yellow('Let\'s define your product requirements together.\n'));
  
  // Feature definition
  console.log(chalk.yellow('First, let\'s identify the core features:'));
  const features = [];
  
  let addingFeatures = true;
  while (addingFeatures) {
    const feature = await rl.question(chalk.cyan('\nDescribe a feature (or "done" to finish): '));
    
    if (feature.toLowerCase() === 'done') {
      addingFeatures = false;
    } else {
      features.push(feature);
      console.log(chalk.green(`✓ Added: ${feature}`));
    }
  }
  
  // User stories
  console.log(chalk.yellow('\n\nNow, let\'s create some user stories:'));
  
  for (let i = 0; i < 2; i++) {
    const story = await rl.question(chalk.cyan(`\nUser story ${i + 1}: As a [user], I want to [action] so that [benefit]\n`));
    
    await session.updateContext('prometheus', {
      requirements: {
        userStories: [story]
      }
    }, 'Added user story');
  }
  
  // Generate PRD
  console.log(chalk.gray('\n[Generating Product Requirements Document...]\n'));
  
  const prd = await prometheus.generateDocumentation('PRD', {
    productIdea,
    features,
    session
  });
  
  console.log(chalk.green('✅ PRD generated successfully!'));
  console.log(chalk.cyan('\nKey sections included:'));
  console.log('  • Executive Summary');
  console.log('  • Feature Requirements');
  console.log('  • User Stories');
  console.log('  • Success Metrics');
  console.log('  • Technical Constraints');
}

/**
 * Helper function to format summary
 */
function formatSummary(summary) {
  let output = '📊 Conversation Summary\n';
  output += '═══════════════════════\n\n';
  
  if (summary.duration) {
    output += `Duration: ${summary.duration}\n`;
  }
  
  if (summary.keyOutcomes) {
    output += '\nKey Outcomes:\n';
    summary.keyOutcomes.forEach(outcome => {
      output += `  • ${outcome}\n`;
    });
  }
  
  if (summary.nextSteps) {
    output += '\nNext Steps:\n';
    summary.nextSteps.forEach((step, i) => {
      output += `  ${i + 1}. ${step}\n`;
    });
  }
  
  return output;
}

/**
 * Helper function to format implementation plan
 */
function formatImplementationPlan(plan) {
  let output = 'Implementation Phases:\n\n';
  
  if (plan.phases) {
    plan.phases.forEach((phase, i) => {
      output += `Phase ${i + 1}: ${phase.name}\n`;
      output += `  Duration: ${phase.duration}\n`;
      output += `  Team: ${phase.team.join(', ')}\n`;
      output += `  Deliverables:\n`;
      phase.deliverables.forEach(d => {
        output += `    - ${d}\n`;
      });
      output += '\n';
    });
  }
  
  if (plan.timeline) {
    output += `\nTotal Timeline: ${plan.timeline}\n`;
  }
  
  return output;
}

/**
 * Helper function to format design summary
 */
function formatDesignSummary(summary) {
  let output = '🎨 Design Consultation Summary\n';
  output += '═════════════════════════════\n\n';
  
  output += 'Design Principles:\n';
  output += '  • User-centered approach\n';
  output += '  • Intuitive navigation\n';
  output += '  • Consistent visual language\n';
  output += '  • Accessible design\n\n';
  
  if (summary.recommendations) {
    output += 'Recommendations:\n';
    summary.recommendations.forEach(rec => {
      output += `  • ${rec}\n`;
    });
  }
  
  return output;
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  demo().catch(console.error);
}