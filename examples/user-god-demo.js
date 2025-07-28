#!/usr/bin/env node

/**
 * User-as-God Pattern Demo
 * Shows how humans can be formal participants in AI workflows
 */

import { UserGod } from '../gods/lib/user-god.js';
import { EventEmitter } from 'events';
import chalk from 'chalk';

// Mock gods for demo
class MockGod extends EventEmitter {
  constructor(name, role) {
    super();
    this.name = name;
    this.role = role;
  }
  
  async analyzeForUser(task) {
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const analyses = {
      athena: {
        recommendation: 'Based on data analysis, Option B shows 23% better performance metrics',
        confidence: 0.87,
        risks: 'Higher initial complexity'
      },
      prometheus: {
        recommendation: 'From a product perspective, Option A aligns better with user needs',
        confidence: 0.79,
        risks: 'May require more iterations'
      },
      daedalus: {
        recommendation: 'Architecture-wise, Option B provides better scalability',
        confidence: 0.92,
        risks: 'Requires experienced team'
      }
    };
    
    return analyses[this.name] || {
      recommendation: `${this.name} analysis complete`,
      confidence: 0.75
    };
  }
}

// Mock workflow system
class MockWorkflow {
  constructor() {
    this.tasks = [];
    this.results = [];
  }
  
  addTask(task) {
    this.tasks.push(task);
  }
  
  addResult(result) {
    this.results.push(result);
  }
}

/**
 * Simulate different user task scenarios
 */
async function runUserGodDemo() {
  console.log(chalk.bold.magenta('👤 User-as-God Pattern Demo\n'));
  console.log('This demo shows how humans participate as formal workflow members.\n');
  
  // Initialize user god
  const user = new UserGod({
    name: 'user',
    userId: 'demo-user',
    userRole: 'decision-maker',
    preferences: {
      autoApprove: false,
      workingHours: { start: 9, end: 17 }
    }
  });
  
  await user.initialize();
  
  // Create mock AI gods
  const athena = new MockGod('athena', 'Data Analyst');
  const prometheus = new MockGod('prometheus', 'Product Manager');
  const daedalus = new MockGod('daedalus', 'System Architect');
  
  // Listen to user events
  user.on('user:notified', ({ task }) => {
    console.log(chalk.gray(`\n[System: User notified about ${task.type || 'task'}]`));
  });
  
  user.on('user:task-timeout', ({ task }) => {
    console.log(chalk.red(`\n[System: Task timed out - ${task.description}]`));
  });
  
  // Demo workflow
  const workflow = new MockWorkflow();
  
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Scenario 1: Code Review Approval\n'));
  
  console.log(chalk.gray('AI gods have completed code implementation...'));
  console.log(chalk.gray('Now requiring human review and approval.\n'));
  
  // Approval task
  const approvalTask = {
    type: 'approval',
    title: 'Code Review: Authentication Module',
    description: 'Review and approve the new authentication module implementation',
    details: `
- Implemented OAuth 2.0 flow
- Added JWT token management
- Created user session handling
- Included rate limiting
- All tests passing (42/42)
- Security scan: No vulnerabilities found`,
    impact: 'Critical - Core authentication system',
    risk: 'Low - Comprehensive test coverage'
  };
  
  workflow.addTask(approvalTask);
  
  try {
    const approvalResult = await user.executeTask(approvalTask);
    workflow.addResult(approvalResult);
    
    console.log(chalk.green(`\n✅ Approval Result: ${approvalResult.approved ? 'APPROVED' : 'REJECTED'}`));
    if (approvalResult.comments) {
      console.log(chalk.gray(`   Comments: ${approvalResult.comments}`));
    }
  } catch (error) {
    console.error(chalk.red('Approval failed:'), error.message);
  }
  
  // Scenario 2: Collaborative Decision
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Scenario 2: Collaborative Architecture Decision\n'));
  
  console.log(chalk.gray('Multiple AI gods have analyzed the options...'));
  console.log(chalk.gray('Human decision needed based on their input.\n'));
  
  // First, gather AI analyses
  const decisionContext = {
    title: 'Database Architecture Decision',
    description: 'Choose between SQL and NoSQL for the new analytics platform',
    options: [
      { label: 'Option A: PostgreSQL with TimescaleDB', value: 'sql' },
      { label: 'Option B: MongoDB with time-series collections', value: 'nosql' }
    ]
  };
  
  console.log(chalk.cyan('🤖 AI Gods analyzing options...\n'));
  
  // Get AI analyses
  const analyses = await Promise.all([
    athena.analyzeForUser(decisionContext),
    prometheus.analyzeForUser(decisionContext),
    daedalus.analyzeForUser(decisionContext)
  ]);
  
  // Present to user
  console.log(chalk.yellow('AI Recommendations:\n'));
  
  console.log(chalk.blue('Athena (Data Analysis):'));
  console.log(`  ${analyses[0].recommendation}`);
  console.log(chalk.gray(`  Confidence: ${(analyses[0].confidence * 100).toFixed(0)}%`));
  
  console.log(chalk.blue('\nPrometheus (Product):'));
  console.log(`  ${analyses[1].recommendation}`);
  console.log(chalk.gray(`  Confidence: ${(analyses[1].confidence * 100).toFixed(0)}%`));
  
  console.log(chalk.blue('\nDaedalus (Architecture):'));
  console.log(`  ${analyses[2].recommendation}`);
  console.log(chalk.gray(`  Confidence: ${(analyses[2].confidence * 100).toFixed(0)}%`));
  
  // Decision task
  const decisionTask = {
    type: 'decision',
    ...decisionContext,
    requireRationale: true
  };
  
  workflow.addTask(decisionTask);
  
  const decisionResult = await user.executeTask(decisionTask);
  workflow.addResult(decisionResult);
  
  console.log(chalk.green(`\n✅ Decision: ${decisionResult.decision.label}`));
  if (decisionResult.rationale) {
    console.log(chalk.gray(`   Rationale: ${decisionResult.rationale}`));
  }
  
  // Scenario 3: Manual Task Execution
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Scenario 3: Manual Deployment Verification\n'));
  
  console.log(chalk.gray('Automated deployment complete...'));
  console.log(chalk.gray('Manual verification required.\n'));
  
  const manualTask = {
    type: 'manual',
    title: 'Production Deployment Verification',
    instructions: 'Please verify the production deployment',
    steps: [
      'Open the production URL: https://app.example.com',
      'Login with test credentials',
      'Verify all main features are working',
      'Check monitoring dashboard for errors',
      'Confirm database migrations completed'
    ],
    collectResults: true,
    resultFields: [
      { name: 'accessible', prompt: 'Is the site accessible? (y/n): ', type: 'boolean' },
      { name: 'features_working', prompt: 'Are all features working? (y/n): ', type: 'boolean' },
      { name: 'errors_found', prompt: 'Any errors found? (describe or "none"): ' }
    ]
  };
  
  workflow.addTask(manualTask);
  
  const manualResult = await user.executeTask(manualTask);
  workflow.addResult(manualResult);
  
  console.log(chalk.green('\n✅ Manual Verification Complete'));
  if (manualResult.results) {
    console.log('Results:');
    Object.entries(manualResult.results).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  }
  
  // Scenario 4: Input Collection
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Scenario 4: API Credentials Input\n'));
  
  console.log(chalk.gray('AI gods need API credentials to proceed...'));
  console.log(chalk.gray('Secure input required from human.\n'));
  
  const inputTask = {
    type: 'input',
    title: 'API Configuration Required',
    prompts: [
      { 
        field: 'api_key',
        prompt: 'Enter API Key (will be encrypted): ',
        type: 'string',
        validation: (val) => val.length >= 32
      },
      {
        field: 'environment',
        prompt: 'Target environment (dev/staging/prod): ',
        type: 'string',
        validation: (val) => ['dev', 'staging', 'prod'].includes(val)
      }
    ]
  };
  
  workflow.addTask(inputTask);
  
  const inputResult = await user.executeTask(inputTask);
  workflow.addResult(inputResult);
  
  console.log(chalk.green('\n✅ Configuration Received'));
  console.log(`  Environment: ${inputResult.inputs.environment}`);
  console.log(`  API Key: ${'*'.repeat(inputResult.inputs.api_key.length - 4)}${inputResult.inputs.api_key.slice(-4)}`);
  
  // Scenario 5: Quality Review
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Scenario 5: Design Quality Review\n'));
  
  console.log(chalk.gray('Apollo has created UI designs...'));
  console.log(chalk.gray('Human review for quality and brand alignment.\n'));
  
  const reviewTask = {
    type: 'review',
    title: 'UI Design Review',
    materials: `
- Dashboard Layout (dashboard.png)
- Color Scheme (colors.pdf)
- Component Library (components.sketch)
- Mobile Responsive Views (mobile-views.png)
- Accessibility Report (a11y-report.html)`,
    questions: [
      { id: 'quality', prompt: 'Overall quality rating (1-5): ', type: 'number' },
      { id: 'brand_alignment', prompt: 'Brand alignment rating (1-5): ', type: 'number' },
      { id: 'issues', prompt: 'Any issues found? ' },
      { id: 'suggestions', prompt: 'Suggestions for improvement: ' }
    ]
  };
  
  workflow.addTask(reviewTask);
  
  const reviewResult = await user.executeTask(reviewTask);
  workflow.addResult(reviewResult);
  
  console.log(chalk.green('\n✅ Review Complete'));
  console.log(`  Quality Rating: ${reviewResult.feedback.quality}/5`);
  console.log(`  Brand Alignment: ${reviewResult.feedback.brand_alignment}/5`);
  if (reviewResult.feedback.issues !== 'none' && reviewResult.feedback.issues) {
    console.log(`  Issues: ${reviewResult.feedback.issues}`);
  }
  
  // Show workflow summary
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Workflow Summary\n'));
  
  console.log(`Total Tasks Completed: ${workflow.results.length}`);
  console.log(`User Response Time: ${(user.activity.averageResponseTime / 1000).toFixed(1)}s average`);
  
  console.log('\nTask Types:');
  const taskTypes = {};
  workflow.tasks.forEach(task => {
    taskTypes[task.type] = (taskTypes[task.type] || 0) + 1;
  });
  
  Object.entries(taskTypes).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  // Demonstrate availability
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('User Availability Management\n'));
  
  console.log(`Current Status: ${user.activity.availability}`);
  console.log('Setting user as away for 5 seconds...');
  
  user.setAvailability('away', 5000);
  console.log(chalk.yellow('Status: away'));
  
  user.once('user:available', () => {
    console.log(chalk.green('Status: available'));
  });
  
  // Wait for availability to return
  await new Promise(resolve => setTimeout(resolve, 6000));
  
  console.log(chalk.bold.green('\n\n🎉 User-as-God Demo Complete!\n'));
  
  console.log('Key Features Demonstrated:');
  console.log('1. Approval workflows with human review');
  console.log('2. Collaborative decision-making with AI input');
  console.log('3. Manual task execution and verification');
  console.log('4. Secure input collection from humans');
  console.log('5. Quality review and feedback loops');
  console.log('6. User availability management\n');
  
  // Cleanup
  await user.shutdown();
}

// Run the demo
runUserGodDemo().catch(console.error);