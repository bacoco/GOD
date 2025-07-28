#!/usr/bin/env node

/**
 * Pantheon Installation Verification Script
 * Checks that all components are properly installed and configured
 */

import { existsSync } from 'fs';
import { spawn } from 'child_process';
import chalk from 'chalk';
import path from 'path';

console.log(chalk.blue.bold('\n🏛️ Pantheon Installation Verification\n'));

const checks = [];
let hasErrors = false;

// Check Node.js version
function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.split('.')[0].substring(1));
  
  if (major >= 18) {
    checks.push({ 
      name: 'Node.js version', 
      status: true, 
      message: `${version} ✓` 
    });
  } else {
    checks.push({ 
      name: 'Node.js version', 
      status: false, 
      message: `${version} (requires 18.0.0+)` 
    });
    hasErrors = true;
  }
}

// Check required files exist
function checkRequiredFiles() {
  const requiredFiles = [
    'claude-pantheon.js',
    'launch.js',
    'package.json',
    'gods/index.js',
    'gods/lib/pantheon-core.js',
    'gods/lib/command-handler.js',
    'gods/lib/conversational-interface.js',
    'gods/lib/conversation-state.js',
    'gods/lib/project-generator.js'
  ];

  requiredFiles.forEach(file => {
    if (existsSync(file)) {
      checks.push({ 
        name: `File: ${file}`, 
        status: true, 
        message: 'exists ✓' 
      });
    } else {
      checks.push({ 
        name: `File: ${file}`, 
        status: false, 
        message: 'missing ✗' 
      });
      hasErrors = true;
    }
  });
}

// Check required directories
function checkRequiredDirectories() {
  const requiredDirs = [
    'gods',
    'gods/lib',
    'gods/lib/commands',
    'gods/lib/gods',
    'claude-flow',
    'examples',
    'docs'
  ];

  requiredDirs.forEach(dir => {
    if (existsSync(dir)) {
      checks.push({ 
        name: `Directory: ${dir}`, 
        status: true, 
        message: 'exists ✓' 
      });
    } else {
      checks.push({ 
        name: `Directory: ${dir}`, 
        status: false, 
        message: 'missing ✗' 
      });
      hasErrors = true;
    }
  });
}

// Check state directory is writable
function checkStateDirectory() {
  const stateDir = 'gods/.pantheon-state';
  
  if (!existsSync(stateDir)) {
    try {
      // Try to create it
      require('fs').mkdirSync(stateDir, { recursive: true });
      checks.push({ 
        name: 'State directory', 
        status: true, 
        message: 'created ✓' 
      });
    } catch (error) {
      checks.push({ 
        name: 'State directory', 
        status: false, 
        message: 'cannot create (permission issue?) ✗' 
      });
      hasErrors = true;
    }
  } else {
    checks.push({ 
      name: 'State directory', 
      status: true, 
      message: 'exists ✓' 
    });
  }
}

// Test /gods help command
async function testGodsCommand() {
  return new Promise((resolve) => {
    const proc = spawn('node', ['claude-pantheon.js', '/gods help'], {
      cwd: process.cwd()
    });
    
    let output = '';
    let errorOutput = '';
    
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    proc.on('close', (code) => {
      if (code === 0 && output.includes('Pantheon - Where Gods Build Software')) {
        checks.push({ 
          name: '/gods help command', 
          status: true, 
          message: 'working ✓' 
        });
      } else {
        checks.push({ 
          name: '/gods help command', 
          status: false, 
          message: 'not working ✗' 
        });
        hasErrors = true;
        if (errorOutput) {
          console.log(chalk.red('\nError output:'), errorOutput);
        }
      }
      resolve();
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      proc.kill();
      checks.push({ 
        name: '/gods help command', 
        status: false, 
        message: 'timeout ✗' 
      });
      hasErrors = true;
      resolve();
    }, 5000);
  });
}

// Display results
function displayResults() {
  console.log(chalk.cyan('Verification Results:\n'));
  
  const maxNameLength = Math.max(...checks.map(c => c.name.length));
  
  checks.forEach(check => {
    const name = check.name.padEnd(maxNameLength + 2);
    const status = check.status 
      ? chalk.green(check.message)
      : chalk.red(check.message);
    console.log(`  ${name} ${status}`);
  });
  
  console.log('\n' + chalk.gray('─'.repeat(50)) + '\n');
  
  if (hasErrors) {
    console.log(chalk.red.bold('❌ Installation has issues!\n'));
    console.log('Please fix the issues above and run verification again.');
    console.log('See TROUBLESHOOTING.md for help.\n');
    process.exit(1);
  } else {
    console.log(chalk.green.bold('✅ Installation verified successfully!\n'));
    console.log('You can now use Pantheon with:');
    console.log(chalk.yellow('  node claude-pantheon.js "/gods init \'your idea\'"'));
    console.log('\nOr try:');
    console.log(chalk.yellow('  npm run gods:help'));
    console.log(chalk.yellow('  npm run quickstart\n'));
  }
}

// Run all checks
async function runVerification() {
  console.log(chalk.gray('Running verification checks...\n'));
  
  checkNodeVersion();
  checkRequiredFiles();
  checkRequiredDirectories();
  checkStateDirectory();
  await testGodsCommand();
  
  displayResults();
}

// Run verification
runVerification().catch(error => {
  console.error(chalk.red('\nVerification failed:'), error.message);
  process.exit(1);
});