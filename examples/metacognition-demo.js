#!/usr/bin/env node

/**
 * Metacognition Demo - Demonstrating self-improving gods
 * Shows how gods learn from their performance and adapt strategies
 */

import { MetacognitiveGod } from '../gods/lib/metacognitive-god.js';
import { PantheonCore } from '../gods/lib/pantheon-core.js';
import { EventEmitter } from 'events';

class MockPantheon extends EventEmitter {
  constructor() {
    super();
    this.gods = new Map();
  }
  
  async summon(godName) {
    if (!this.gods.has(godName)) {
      const god = new MetacognitiveGod({
        name: godName,
        metacognitionEnabled: true,
        learningRate: 0.2,
        config: {
          capabilities: ['orchestrate', 'analyze', 'improve'],
          orchestrationMode: 'hybrid'
        }
      });
      
      await god.initialize();
      this.gods.set(godName, god);
    }
    return this.gods.get(godName);
  }
}

/**
 * Simulate a workflow session
 */
function createMockSession(id, successful = true) {
  const startTime = Date.now();
  const duration = Math.random() * 60000 + 30000; // 30-90 seconds
  
  return {
    id,
    startTime,
    endTime: startTime + duration,
    events: [
      { type: 'task', complexity: 5 },
      { type: 'task', complexity: 8 },
      { type: 'handoff', from: 'zeus', to: 'apollo' },
      { type: 'message', from: 'apollo', to: 'zeus' },
      ...(successful ? [] : [{ type: 'error', errorType: 'TimeoutError' }])
    ],
    getCurrentSpeaker: () => 'zeus'
  };
}

/**
 * Main demo
 */
async function runMetacognitionDemo() {
  console.log('🧠 Pantheon Metacognition Demo\n');
  console.log('This demo shows how gods learn from their performance and improve over time.\n');
  
  const pantheon = new MockPantheon();
  const zeus = await pantheon.summon('zeus');
  
  // Listen to metacognition events
  zeus.on('god:improvement-applied', (improvement) => {
    console.log(`✨ Applied improvement: ${improvement.strategy}`);
    console.log(`   Priority: ${improvement.priority}`);
    console.log(`   Actions:`, improvement.actions.join(', '));
  });
  
  zeus.metacognition.on('metacognition:analysis-complete', (analysis) => {
    console.log(`\n📊 Analysis complete for session ${analysis.sessionId}`);
    console.log(`   Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
    console.log(`   Patterns found: ${Object.values(analysis.patterns).flat().length}`);
    console.log(`   Improvements suggested: ${analysis.improvements.length}`);
  });
  
  console.log('='.repeat(60));
  console.log('Phase 1: Initial Performance\n');
  
  // Simulate some initial tasks with failures
  for (let i = 0; i < 3; i++) {
    const session = createMockSession(`session-${i}`, i > 0);
    
    // Update metrics to simulate performance
    zeus.metrics.tasksCompleted = i > 0 ? i * 2 : 0;
    zeus.metrics.tasksFailured = i === 0 ? 2 : 0;
    zeus.metrics.subAgentsCreated = 5 + i * 3;
    zeus.metrics.aiOrchestrations = 8 + i * 2;
    zeus.metrics.jsOrchestrations = 2;
    
    console.log(`\nRunning session ${i + 1}...`);
    const analysis = await zeus.performSelfAnalysis(session);
    
    if (analysis && analysis.patterns) {
      console.log('\nPatterns identified:');
      for (const category of Object.keys(analysis.patterns)) {
        const patterns = analysis.patterns[category];
        if (patterns.length > 0) {
          console.log(`  ${category}:`);
          patterns.forEach(p => {
            console.log(`    - ${p.description} (${p.severity} severity)`);
          });
        }
      }
    }
    
    // Small delay to simulate time passing
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Phase 2: After Learning\n');
  
  // Show learning summary
  const learningSummary = zeus.getLearningSummary();
  console.log('📚 Learning Summary:');
  console.log(`   Total analyses: ${learningSummary.totalAnalyses}`);
  console.log(`   Patterns identified: ${learningSummary.patternsIdentified}`);
  console.log(`   Strategies learned: ${learningSummary.strategiesLearned}`);
  console.log(`   Average confidence: ${(learningSummary.averageConfidence * 100).toFixed(1)}%`);
  
  if (learningSummary.topPatterns.length > 0) {
    console.log('\n   Top patterns:');
    learningSummary.topPatterns.forEach(p => {
      console.log(`     - ${p.type}: ${p.count} occurrences`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Phase 3: Improved Performance\n');
  
  // Simulate improved performance after learning
  const improvedSession = createMockSession('improved-session', true);
  
  // Update metrics to show improvement
  zeus.metrics.tasksCompleted = 10;
  zeus.metrics.tasksFailured = 0; // No failures after learning
  zeus.metrics.subAgentsCreated = 8; // More efficient
  zeus.metrics.aiOrchestrations = 5; // Better balance
  zeus.metrics.jsOrchestrations = 5;
  
  console.log('Running session with applied improvements...');
  const improvedAnalysis = await zeus.performSelfAnalysis(improvedSession);
  
  console.log('\n✅ Performance after learning:');
  console.log(`   Success rate: 100% (improved from initial failures)`);
  console.log(`   Orchestration balance: 50/50 AI/JS (improved from 80/20)`);
  console.log(`   Agent efficiency: Reduced agent creation by 20%`);
  
  // Demonstrate specific improvements
  console.log('\n' + '='.repeat(60));
  console.log('Phase 4: Demonstrating Specific Improvements\n');
  
  // Test error handling improvement
  console.log('1. Testing enhanced error handling...');
  try {
    const problematicTask = {
      type: 'network-operation',
      category: 'external',
      willFail: true
    };
    
    // Override performTask to simulate transient failure
    let attempts = 0;
    const originalPerformTask = zeus.performTask.bind(zeus);
    zeus.performTask = async function(task) {
      if (task.willFail && attempts < 2) {
        attempts++;
        throw new Error('NetworkError: Connection failed');
      }
      return { success: true, attempts };
    };
    
    const result = await zeus.executeTask(problematicTask);
    console.log(`   ✓ Task succeeded after ${result.attempts} retries (learning applied!)`);
  } catch (error) {
    console.log(`   ✗ Task failed: ${error.message}`);
  }
  
  // Test task decomposition
  console.log('\n2. Testing task decomposition for complex tasks...');
  const complexTask = {
    type: 'build-application',
    description: 'Build a full-stack web application',
    estimatedDuration: 120000, // 2 minutes
    requiresCoordination: true
  };
  
  const complexity = zeus.assessTaskComplexity(complexTask);
  console.log(`   Task complexity: ${complexity}/10`);
  
  if (complexity > 7) {
    const subtasks = await zeus.decomposeTask(complexTask);
    console.log(`   ✓ Decomposed into ${subtasks.length} subtasks:`);
    subtasks.forEach(st => {
      console.log(`     - ${st.content}`);
    });
  }
  
  // Test caching
  console.log('\n3. Testing performance optimization through caching...');
  zeus.enableTaskCaching();
  
  const cachedTask = {
    type: 'analyze',
    category: 'performance',
    params: { metric: 'response-time' }
  };
  
  console.log('   First execution...');
  const start1 = Date.now();
  await zeus.performTask(cachedTask);
  const duration1 = Date.now() - start1;
  console.log(`   Duration: ${duration1}ms`);
  
  console.log('   Second execution (should be cached)...');
  const start2 = Date.now();
  await zeus.performTask(cachedTask);
  const duration2 = Date.now() - start2;
  console.log(`   Duration: ${duration2}ms`);
  console.log(`   ✓ ${((1 - duration2/duration1) * 100).toFixed(0)}% faster with caching!`);
  
  console.log('\n' + '='.repeat(60));
  console.log('\n🎉 Metacognition Demo Complete!\n');
  console.log('Key Takeaways:');
  console.log('1. Gods analyze their performance after each workflow');
  console.log('2. They identify patterns in failures and inefficiencies');
  console.log('3. High-priority improvements are applied automatically');
  console.log('4. Performance improves over time through learning');
  console.log('5. Strategies include retry logic, task decomposition, and caching\n');
}

// Run the demo
runMetacognitionDemo().catch(console.error);