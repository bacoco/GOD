#!/usr/bin/env node

/**
 * Dynamic Workflow Generation Demo
 * Shows how Zeus can dynamically construct workflows based on requirements
 */

import { ZeusEnhanced } from '../gods/lib/gods/zeus-enhanced.js';
import { DynamicWorkflowBuilder } from '../gods/lib/dynamic-workflow-builder.js';
import { EventEmitter } from 'events';
import chalk from 'chalk';

// Mock pantheon for demo
class MockPantheon extends EventEmitter {
  constructor() {
    super();
    this.gods = new Map();
  }
  
  async summon(godName) {
    if (!this.gods.has(godName)) {
      // For demo, just return a mock god
      this.gods.set(godName, {
        name: godName,
        executeTask: async (task) => ({
          success: true,
          result: `${godName} completed: ${task.description || task}`,
          duration: Math.random() * 5000 + 1000
        })
      });
    }
    return this.gods.get(godName);
  }
}

/**
 * Visualize workflow graph
 */
function visualizeWorkflow(workflow) {
  console.log(chalk.cyan('\n📊 Workflow Visualization\n'));
  console.log(chalk.white(`Name: ${workflow.name}`));
  console.log(chalk.white(`ID: ${workflow.id}`));
  console.log(chalk.white(`Confidence: ${(workflow.confidence * 100).toFixed(1)}%`));
  console.log(chalk.white(`Estimated Duration: ${(workflow.estimatedDuration / 60000).toFixed(1)} minutes\n`));
  
  if (workflow.graph && workflow.graph.nodes) {
    console.log(chalk.yellow('Nodes:'));
    workflow.graph.nodes.forEach((node, id) => {
      const agent = node.agent;
      console.log(`  ${chalk.green(id)} - ${node.task.description || node.task.type}`);
      console.log(`    Agent: ${chalk.blue(`${agent.type}:${agent.name}`)}`);
      console.log(`    Complexity: ${node.metadata.complexity}/10`);
    });
    
    console.log(chalk.yellow('\nEdges:'));
    workflow.graph.edges.forEach(edge => {
      console.log(`  ${chalk.green(edge.from)} → ${chalk.green(edge.to)} (${edge.type})`);
    });
  }
  
  if (workflow.parallelizable) {
    console.log(chalk.yellow('\nParallel Execution Levels:'));
    Object.entries(workflow.parallelizable).forEach(([level, tasks]) => {
      console.log(`  ${chalk.cyan(level)}: ${tasks.length} tasks in parallel`);
      tasks.forEach(t => {
        console.log(`    - ${t.task.description || t.task.type} (${t.agent.name})`);
      });
    });
  }
  
  console.log(chalk.cyan('\nMetadata:'));
  console.log(`  Build time: ${workflow.metadata.buildTime}ms`);
  console.log(`  Task count: ${workflow.metadata.taskCount}`);
  console.log(`  Agent count: ${workflow.metadata.agentCount}`);
  console.log(`  Max parallelism: ${workflow.metadata.maxParallelism}`);
}

/**
 * Main demo
 */
async function runDynamicWorkflowDemo() {
  console.log(chalk.bold.magenta('🌟 Dynamic Workflow Generation Demo\n'));
  console.log('This demo shows how Zeus can dynamically generate workflows based on requirements.\n');
  
  const pantheon = new MockPantheon();
  const zeus = new ZeusEnhanced({ pantheon });
  
  await zeus.initialize();
  
  // Listen to Zeus events
  zeus.on('zeus:analyzing-request', ({ analysisId }) => {
    console.log(chalk.gray(`\n🔍 Analyzing request (${analysisId})...`));
  });
  
  zeus.on('zeus:generating-dynamic-workflow', ({ analysis }) => {
    console.log(chalk.gray(`\n🏗️ Generating dynamic workflow...`));
    console.log(chalk.gray(`   Complexity: ${analysis.complexity}/10`));
    console.log(chalk.gray(`   Domains: ${analysis.domains.join(', ')}`));
    console.log(chalk.gray(`   Required capabilities: ${analysis.requiredCapabilities.join(', ')}`));
  });
  
  zeus.on('zeus:delegation-complete', ({ workflow }) => {
    console.log(chalk.green(`\n✅ Workflow generation complete!`));
  });
  
  // Test different scenarios
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Scenario 1: Simple Task\n'));
  
  const simpleRequest = {
    description: 'Create a simple REST API endpoint',
    type: 'development'
  };
  
  console.log('Request:', JSON.stringify(simpleRequest, null, 2));
  
  const simplePlan = await zeus.analyzeAndDelegate(simpleRequest);
  
  if (simplePlan.workflow) {
    visualizeWorkflow(simplePlan.workflow);
  }
  
  // Complex scenario
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Scenario 2: Complex Full-Stack Application\n'));
  
  const complexRequest = {
    name: 'E-commerce Platform',
    description: 'Build a complete e-commerce platform with frontend, backend, and payment integration',
    requirements: [
      'React frontend with responsive design',
      'Node.js backend with REST API',
      'PostgreSQL database',
      'Stripe payment integration',
      'User authentication with JWT',
      'Admin dashboard',
      'Real-time inventory updates'
    ],
    constraints: {
      deadline: '2 weeks',
      budget: 'medium'
    },
    preferences: {
      parallel: true,
      thorough: true
    }
  };
  
  console.log('Request:', JSON.stringify(complexRequest, null, 2));
  
  const complexPlan = await zeus.analyzeAndDelegate(complexRequest);
  
  if (complexPlan.workflow) {
    visualizeWorkflow(complexPlan.workflow);
  }
  
  // Custom scenario
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Scenario 3: Custom Workflow with Specific Phases\n'));
  
  const customRequest = {
    name: 'AI-Powered Analytics Dashboard',
    description: 'Create an analytics dashboard with AI insights',
    domains: ['frontend', 'backend', 'data'],
    customPhases: ['data-collection', 'ml-model-training', 'visualization'],
    goals: [
      'Collect user behavior data',
      'Train predictive models',
      'Create interactive visualizations',
      'Real-time dashboard updates'
    ]
  };
  
  console.log('Request:', JSON.stringify(customRequest, null, 2));
  
  const customPlan = await zeus.analyzeAndDelegate(customRequest);
  
  if (customPlan.workflow) {
    visualizeWorkflow(customPlan.workflow);
  }
  
  // Execute a workflow
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Executing Workflow\n'));
  
  console.log('Executing the simple workflow...\n');
  
  // Listen to execution events
  zeus.on('zeus:execution-started', ({ executionId }) => {
    console.log(chalk.cyan(`\n▶️ Execution started: ${executionId}`));
  });
  
  zeus.on('zeus:phase-started', ({ phase, name }) => {
    console.log(chalk.yellow(`\n🔄 Phase ${phase}: ${name}`));
  });
  
  zeus.on('zeus:execution-completed', ({ duration }) => {
    console.log(chalk.green(`\n✅ Execution completed in ${(duration / 1000).toFixed(1)} seconds`));
  });
  
  try {
    const result = await zeus.executeOrchestration(simplePlan);
    
    console.log(chalk.green('\nExecution Results:'));
    result.results.forEach((taskResult, index) => {
      console.log(`  Task ${index + 1}: ${taskResult.status}`);
      if (taskResult.result) {
        console.log(`    Result: ${taskResult.result.result}`);
      }
    });
  } catch (error) {
    console.error(chalk.red('Execution failed:'), error.message);
  }
  
  // Show learning summary
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Zeus Learning Summary\n'));
  
  const learningSummary = zeus.getLearningSummary();
  console.log(chalk.cyan('Metacognition Stats:'));
  console.log(`  Total analyses: ${learningSummary.totalAnalyses}`);
  console.log(`  Patterns identified: ${learningSummary.patternsIdentified}`);
  console.log(`  Strategies learned: ${learningSummary.strategiesLearned}`);
  
  console.log(chalk.cyan('\nWorkflow Generation Stats:'));
  console.log(`  Workflows generated: ${zeus.workflowHistory.length}`);
  console.log(`  Successful patterns: ${zeus.successfulPatterns.size}`);
  
  console.log(chalk.bold.green('\n🎉 Dynamic Workflow Demo Complete!\n'));
  
  console.log('Key Takeaways:');
  console.log('1. Zeus analyzes request complexity and requirements');
  console.log('2. Simple tasks use streamlined workflows');
  console.log('3. Complex tasks generate sophisticated multi-phase workflows');
  console.log('4. Workflows optimize for parallelism and efficiency');
  console.log('5. Zeus learns from execution to improve future workflows\n');
}

// Run the demo
runDynamicWorkflowDemo().catch(console.error);