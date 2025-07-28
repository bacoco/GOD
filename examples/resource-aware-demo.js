#!/usr/bin/env node

/**
 * Resource-Aware Orchestration Demo
 * Shows how Pantheon can orchestrate tasks within budget constraints
 */

import { ResourceAwareOrchestrator } from '../gods/lib/resource-aware-orchestrator.js';
import { ResourceManager } from '../gods/lib/resource-manager.js';
import { DynamicWorkflowBuilder } from '../gods/lib/dynamic-workflow-builder.js';
import chalk from 'chalk';

/**
 * Format currency
 */
function formatCost(cost) {
  return `$${cost.toFixed(4)}`;
}

/**
 * Create demo workflow
 */
function createDemoWorkflow(complexity = 'medium') {
  const workflows = {
    simple: {
      id: 'workflow-simple',
      name: 'Simple Analysis Workflow',
      graph: {
        nodes: new Map([
          ['analyze', {
            task: { type: 'analyze', description: 'Analyze requirements', complexity: 3 },
            agent: { type: 'god', name: 'athena', model: 'claude-3-sonnet' }
          }],
          ['report', {
            task: { type: 'report', description: 'Generate report', complexity: 2 },
            agent: { type: 'god', name: 'hermes', model: 'claude-3-haiku' }
          }]
        ]),
        edges: [{ from: 'analyze', to: 'report' }]
      },
      parallelizable: {
        'level-0': [{ task: { id: 'analyze' }, agent: { name: 'athena' } }],
        'level-1': [{ task: { id: 'report' }, agent: { name: 'hermes' } }]
      }
    },
    
    medium: {
      id: 'workflow-medium',
      name: 'Full Development Workflow',
      graph: {
        nodes: new Map([
          ['requirements', {
            task: { type: 'analyze', description: 'Gather requirements', complexity: 4, critical: true },
            agent: { type: 'god', name: 'prometheus', model: 'claude-3-sonnet' }
          }],
          ['design', {
            task: { type: 'design', description: 'Design architecture', complexity: 6 },
            agent: { type: 'god', name: 'daedalus', model: 'claude-3-opus' }
          }],
          ['frontend', {
            task: { type: 'implement', description: 'Build frontend', complexity: 8 },
            agent: { type: 'god', name: 'apollo', model: 'claude-3-sonnet' }
          }],
          ['backend', {
            task: { type: 'implement', description: 'Build backend', complexity: 8 },
            agent: { type: 'god', name: 'hephaestus', model: 'claude-3-sonnet' }
          }],
          ['testing', {
            task: { type: 'test', description: 'Run tests', complexity: 5 },
            agent: { type: 'god', name: 'themis', model: 'claude-3-sonnet' }
          }]
        ]),
        edges: [
          { from: 'requirements', to: 'design' },
          { from: 'design', to: 'frontend' },
          { from: 'design', to: 'backend' },
          { from: 'frontend', to: 'testing' },
          { from: 'backend', to: 'testing' }
        ]
      },
      parallelizable: {
        'level-0': [{ task: { id: 'requirements' }, agent: { name: 'prometheus' } }],
        'level-1': [{ task: { id: 'design' }, agent: { name: 'daedalus' } }],
        'level-2': [
          { task: { id: 'frontend' }, agent: { name: 'apollo' } },
          { task: { id: 'backend' }, agent: { name: 'hephaestus' } }
        ],
        'level-3': [{ task: { id: 'testing' }, agent: { name: 'themis' } }]
      }
    },
    
    complex: {
      id: 'workflow-complex',
      name: 'Enterprise Platform Workflow',
      graph: {
        nodes: new Map([
          ['research', {
            task: { type: 'research', description: 'Market research', complexity: 5, critical: true },
            agent: { type: 'god', name: 'athena', model: 'gpt-4' }
          }],
          ['requirements', {
            task: { type: 'analyze', description: 'Requirements analysis', complexity: 6, critical: true },
            agent: { type: 'god', name: 'prometheus', model: 'claude-3-opus' }
          }],
          ['architecture', {
            task: { type: 'design', description: 'System architecture', complexity: 9, critical: true },
            agent: { type: 'god', name: 'daedalus', model: 'claude-3-opus' }
          }],
          ['security', {
            task: { type: 'analyze', description: 'Security design', complexity: 7 },
            agent: { type: 'god', name: 'aegis', model: 'claude-3-opus' }
          }],
          ['ui-design', {
            task: { type: 'design', description: 'UI/UX design', complexity: 8 },
            agent: { type: 'god', name: 'apollo', model: 'gpt-4' }
          }],
          ['api-dev', {
            task: { type: 'implement', description: 'API development', complexity: 10 },
            agent: { type: 'god', name: 'hephaestus', model: 'claude-3-opus' }
          }],
          ['frontend-dev', {
            task: { type: 'implement', description: 'Frontend development', complexity: 10 },
            agent: { type: 'god', name: 'apollo', model: 'claude-3-opus' }
          }],
          ['ml-features', {
            task: { type: 'implement', description: 'ML features', complexity: 9, optional: true },
            agent: { type: 'god', name: 'athena', model: 'gpt-4' }
          }],
          ['integration', {
            task: { type: 'test', description: 'Integration testing', complexity: 7 },
            agent: { type: 'god', name: 'themis', model: 'claude-3-sonnet' }
          }],
          ['deployment', {
            task: { type: 'deploy', description: 'Deploy to production', complexity: 5 },
            agent: { type: 'god', name: 'hermes', model: 'claude-3-sonnet' }
          }]
        ]),
        edges: [
          { from: 'research', to: 'requirements' },
          { from: 'requirements', to: 'architecture' },
          { from: 'architecture', to: 'security' },
          { from: 'architecture', to: 'ui-design' },
          { from: 'architecture', to: 'api-dev' },
          { from: 'ui-design', to: 'frontend-dev' },
          { from: 'api-dev', to: 'integration' },
          { from: 'frontend-dev', to: 'integration' },
          { from: 'api-dev', to: 'ml-features' },
          { from: 'ml-features', to: 'integration' },
          { from: 'security', to: 'integration' },
          { from: 'integration', to: 'deployment' }
        ]
      }
    }
  };
  
  return workflows[complexity];
}

/**
 * Visualize budget and cost
 */
function visualizeBudget(budget, estimate, actual = null) {
  console.log(chalk.cyan('\n💰 Budget Analysis\n'));
  
  console.log(`Total Budget: ${chalk.green(formatCost(budget))}`);
  console.log(`Estimated Cost: ${chalk.yellow(formatCost(estimate.total))}`);
  
  if (actual !== null) {
    console.log(`Actual Cost: ${chalk.blue(formatCost(actual))}`);
    const accuracy = (actual / estimate.total * 100).toFixed(1);
    console.log(`Estimate Accuracy: ${chalk.magenta(accuracy + '%')}`);
  }
  
  const budgetUsed = estimate.total / budget * 100;
  console.log(`\nBudget Usage: ${budgetUsed.toFixed(1)}%`);
  
  // Visual bar
  const barLength = 40;
  const filledLength = Math.round(budgetUsed / 100 * barLength);
  const bar = '█'.repeat(Math.min(filledLength, barLength)) + 
              '░'.repeat(Math.max(barLength - filledLength, 0));
  
  const barColor = budgetUsed > 100 ? chalk.red : 
                   budgetUsed > 80 ? chalk.yellow : 
                   chalk.green;
  
  console.log(barColor(`[${bar}]`));
  
  if (estimate.byAgent) {
    console.log(chalk.cyan('\nCost by Agent:'));
    Object.entries(estimate.byAgent).forEach(([agent, cost]) => {
      console.log(`  ${agent}: ${formatCost(cost)}`);
    });
  }
  
  if (estimate.byResource) {
    console.log(chalk.cyan('\nCost by Resource:'));
    Object.entries(estimate.byResource).forEach(([resource, cost]) => {
      console.log(`  ${resource}: ${formatCost(cost)}`);
    });
  }
}

/**
 * Main demo
 */
async function runResourceAwareDemo() {
  console.log(chalk.bold.magenta('💰 Resource-Aware Orchestration Demo\n'));
  console.log('This demo shows how Pantheon manages tasks within budget constraints.\n');
  
  // Initialize resource manager with custom costs
  const resourceManager = new ResourceManager({
    tokenCosts: {
      'claude-3-opus': { input: 0.015, output: 0.075 },
      'claude-3-sonnet': { input: 0.003, output: 0.015 },
      'claude-3-haiku': { input: 0.00025, output: 0.00125 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
    }
  });
  
  // Initialize orchestrator
  const orchestrator = new ResourceAwareOrchestrator({
    resourceManager,
    costWeight: 0.4,
    performanceWeight: 0.3,
    qualityWeight: 0.3
  });
  
  // Listen to events
  orchestrator.on('orchestration:estimated', ({ estimate, budget, withinBudget }) => {
    console.log(chalk.gray('\n📊 Workflow cost estimated'));
    console.log(chalk.gray(`   Within budget: ${withinBudget ? 'Yes' : 'No'}`));
  });
  
  orchestrator.on('workflow:optimizing', ({ budget }) => {
    console.log(chalk.yellow('\n⚡ Optimizing workflow for budget...'));
  });
  
  orchestrator.on('task:skipped', ({ taskId, reason }) => {
    console.log(chalk.gray(`   ⏭️ Skipped task ${taskId}: ${reason}`));
  });
  
  orchestrator.on('budget:warning', (alert) => {
    console.log(chalk.yellow(`\n⚠️ Budget Alert: ${alert.message}`));
  });
  
  orchestrator.on('execution:cost-reduction-enabled', ({ executionId }) => {
    console.log(chalk.yellow(`\n💸 Cost reduction mode enabled for ${executionId}`));
  });
  
  // Test scenarios
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Scenario 1: Simple Workflow with Ample Budget\n'));
  
  const simpleWorkflow = createDemoWorkflow('simple');
  const simpleBudget = 0.5; // $0.50
  
  console.log(`Workflow: ${simpleWorkflow.name}`);
  console.log(`Budget: ${formatCost(simpleBudget)}`);
  
  // Estimate cost
  const simpleEstimate = await resourceManager.estimateWorkflowCost(simpleWorkflow);
  visualizeBudget(simpleBudget, simpleEstimate);
  
  // Execute
  console.log(chalk.green('\n▶️ Executing with balanced strategy...'));
  
  try {
    const result = await orchestrator.orchestrateWithBudget(
      simpleWorkflow,
      simpleBudget,
      { strategy: 'balanced' }
    );
    
    console.log(chalk.green('\n✅ Execution completed successfully!'));
    visualizeBudget(simpleBudget, simpleEstimate, result.cost);
    
  } catch (error) {
    console.error(chalk.red('\n❌ Execution failed:'), error.message);
  }
  
  // Scenario 2: Complex workflow with tight budget
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Scenario 2: Complex Workflow with Tight Budget\n'));
  
  const complexWorkflow = createDemoWorkflow('complex');
  const tightBudget = 2.0; // $2.00 (likely insufficient)
  
  console.log(`Workflow: ${complexWorkflow.name}`);
  console.log(`Budget: ${formatCost(tightBudget)}`);
  
  // Estimate cost
  const complexEstimate = await resourceManager.estimateWorkflowCost(complexWorkflow);
  visualizeBudget(tightBudget, complexEstimate);
  
  // Execute with cost optimization
  console.log(chalk.green('\n▶️ Executing with cost-optimized strategy...'));
  
  try {
    const result = await orchestrator.orchestrateWithBudget(
      complexWorkflow,
      tightBudget,
      { 
        strategy: 'cost-optimized',
        policy: 'economy' 
      }
    );
    
    console.log(chalk.green('\n✅ Execution completed within budget!'));
    console.log(`Tasks completed: ${result.result.results.length}`);
    
  } catch (error) {
    console.error(chalk.red('\n❌ Execution failed:'), error.message);
  }
  
  // Scenario 3: Performance optimization with budget
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Scenario 3: Performance-Optimized with Sufficient Budget\n'));
  
  const mediumWorkflow = createDemoWorkflow('medium');
  const performanceBudget = 3.0; // $3.00
  
  console.log(`Workflow: ${mediumWorkflow.name}`);
  console.log(`Budget: ${formatCost(performanceBudget)}`);
  
  // Execute with performance optimization
  console.log(chalk.green('\n▶️ Executing with performance-optimized strategy...'));
  
  try {
    const startTime = Date.now();
    
    const result = await orchestrator.orchestrateWithBudget(
      mediumWorkflow,
      performanceBudget,
      { 
        strategy: 'performance-optimized',
        policy: 'premium' 
      }
    );
    
    const duration = Date.now() - startTime;
    
    console.log(chalk.green('\n✅ Execution completed!'));
    console.log(`Execution time: ${(duration / 1000).toFixed(1)}s`);
    console.log(`Parallel tasks executed: ${result.result.execution.tasks.size}`);
    
  } catch (error) {
    console.error(chalk.red('\n❌ Execution failed:'), error.message);
  }
  
  // Show resource usage report
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Resource Usage Report\n'));
  
  const report = resourceManager.getUsageReport({ hours: 0.1 });
  
  console.log(chalk.cyan('Total Cost:'), formatCost(report.totalCost));
  console.log(chalk.cyan('\nTop Consumers:'));
  report.topConsumers.forEach((consumer, index) => {
    console.log(`  ${index + 1}. ${consumer.agent}: ${formatCost(consumer.cost)}`);
  });
  
  console.log(chalk.cyan('\nCost by Resource Type:'));
  Object.entries(report.byResource).forEach(([resource, data]) => {
    console.log(`  ${resource}: ${formatCost(data.cost)}`);
  });
  
  // Show predictions
  const predictions = resourceManager.predictions;
  if (predictions.has('hourly-cost')) {
    console.log(chalk.cyan('\nCost Predictions:'));
    console.log(`  Hourly: ${formatCost(predictions.get('hourly-cost'))}`);
    console.log(`  Daily: ${formatCost(predictions.get('daily-cost'))}`);
    console.log(`  Monthly: ${formatCost(predictions.get('monthly-cost'))}`);
  }
  
  console.log(chalk.bold.green('\n🎉 Resource-Aware Orchestration Demo Complete!\n'));
  
  console.log('Key Takeaways:');
  console.log('1. Workflows are estimated for cost before execution');
  console.log('2. Different strategies optimize for cost, performance, or balance');
  console.log('3. Workflows are automatically optimized when over budget');
  console.log('4. Real-time monitoring tracks resource usage');
  console.log('5. Predictions help with capacity planning\n');
  
  // Cleanup
  resourceManager.destroy();
}

// Run the demo
runResourceAwareDemo().catch(console.error);