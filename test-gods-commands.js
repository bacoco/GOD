#!/usr/bin/env node

/**
 * Test script for /gods commands
 * Verifies all commands are working properly
 */

import { spawn } from 'child_process';
import chalk from 'chalk';

const tests = [
  {
    name: 'Help Command',
    command: '/gods help',
    expectedOutput: 'Pantheon - Where Gods Build Software'
  },
  {
    name: 'Projects Command (empty)',
    command: '/gods projects',
    expectedOutput: 'No projects found'
  },
  {
    name: 'Status Command (no project)',
    command: '/gods status',
    expectedOutput: 'No active project found'
  },
  {
    name: 'Init Command (no args)',
    command: '/gods init',
    expectedOutput: 'What would you like to build?',
    requiresInput: true
  },
  {
    name: 'Help for specific command',
    command: '/gods help init',
    expectedOutput: 'Start a new project through natural conversation'
  }
];

async function runTest(test) {
  console.log(chalk.blue(`\nTesting: ${test.name}`));
  console.log(chalk.gray(`Command: claude-pantheon "${test.command}"`));
  
  return new Promise((resolve) => {
    const proc = spawn('node', ['claude-pantheon.js', test.command], {
      cwd: process.cwd()
    });
    
    let output = '';
    let errorOutput = '';
    
    proc.stdout.on('data', (data) => {
      output += data.toString();
      
      // If test requires input, send Ctrl+C after seeing expected output
      if (test.requiresInput && output.includes(test.expectedOutput)) {
        proc.kill('SIGINT');
      }
    });
    
    proc.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    proc.on('close', (code) => {
      if (errorOutput) {
        console.log(chalk.red('❌ Error output:'), errorOutput);
        resolve(false);
      } else if (output.includes(test.expectedOutput)) {
        console.log(chalk.green('✅ Test passed'));
        resolve(true);
      } else {
        console.log(chalk.red('❌ Test failed'));
        console.log(chalk.yellow('Expected to find:'), test.expectedOutput);
        console.log(chalk.gray('Actual output:'), output.substring(0, 200) + '...');
        resolve(false);
      }
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      proc.kill();
      resolve(false);
    }, 5000);
  });
}

async function runAllTests() {
  console.log(chalk.blue.bold('🏛️ Testing /gods Commands\n'));
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await runTest(test);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log(chalk.blue('\n' + '='.repeat(50)));
  console.log(chalk.green(`Passed: ${passed}`));
  console.log(chalk.red(`Failed: ${failed}`));
  console.log(chalk.blue('='.repeat(50) + '\n'));
  
  if (failed === 0) {
    console.log(chalk.green.bold('✨ All tests passed!'));
  } else {
    console.log(chalk.red.bold('⚠️  Some tests failed.'));
  }
}

// Run tests
runAllTests().catch(console.error);