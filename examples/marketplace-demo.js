#!/usr/bin/env node

/**
 * Agent Marketplace ("Agora") Demo
 * Shows how to publish, search, install, and rate agents
 */

import { AgentMarketplace } from '../gods/lib/agent-marketplace.js';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

/**
 * Create sample agents for the marketplace
 */
const sampleAgents = [
  {
    definition: {
      name: 'React Component Generator',
      description: 'Specialized agent for creating React components with TypeScript',
      capabilities: ['code', 'generate', 'react', 'typescript'],
      tools: ['github', 'desktop-commander'],
      instructions: `You are a React component specialist. You create clean, reusable React components with TypeScript.
      
Follow these principles:
- Use functional components with hooks
- Include proper TypeScript types
- Add JSDoc comments
- Follow React best practices
- Include unit tests when requested`
    },
    metadata: {
      version: '2.1.0',
      author: 'react-masters',
      category: 'development',
      tags: ['react', 'typescript', 'frontend', 'components'],
      examples: [{
        name: 'Button Component',
        code: `// Example usage
const agent = await god.createSubAgent('react-component', {
  baseAgent: 'react-component-generator'
});

await agent.execute({
  task: 'Create a Button component with variants'
});`
      }]
    }
  },
  
  {
    definition: {
      name: 'API Security Auditor',
      description: 'Performs comprehensive security audits on REST APIs',
      capabilities: ['analyze', 'test', 'security', 'audit'],
      tools: ['github', 'browsermcp', 'security-scanner'],
      instructions: `You are an API security expert. You analyze REST APIs for vulnerabilities.
      
Your responsibilities:
- Test for OWASP Top 10 vulnerabilities
- Check authentication and authorization
- Analyze data validation
- Review rate limiting and DDoS protection
- Generate detailed security reports`
    },
    metadata: {
      version: '1.3.0',
      author: 'security-pro',
      category: 'security',
      tags: ['security', 'api', 'testing', 'audit', 'owasp']
    }
  },
  
  {
    definition: {
      name: 'Data Pipeline Architect',
      description: 'Designs and implements data processing pipelines',
      capabilities: ['design', 'implement', 'data', 'etl'],
      tools: ['github', 'desktop-commander', 'data-tools'],
      instructions: `You are a data engineering specialist focused on building robust data pipelines.
      
Key skills:
- Design ETL/ELT pipelines
- Optimize data processing
- Implement data quality checks
- Handle streaming and batch processing
- Work with various data formats`
    },
    metadata: {
      version: '1.0.0',
      author: 'data-wizards',
      category: 'data',
      tags: ['data', 'etl', 'pipeline', 'streaming', 'batch']
    }
  },
  
  {
    definition: {
      name: 'Microservices Coordinator',
      description: 'Orchestrates microservices development and deployment',
      capabilities: ['coordinate', 'design', 'deploy', 'monitor'],
      tools: ['github', 'kubernetes', 'docker', 'monitoring'],
      instructions: `You coordinate microservices architecture and deployment.
      
Focus areas:
- Service decomposition
- API gateway design
- Service mesh configuration
- Container orchestration
- Monitoring and observability`
    },
    metadata: {
      version: '1.5.0',
      author: 'cloud-architects',
      category: 'coordination',
      tags: ['microservices', 'kubernetes', 'docker', 'devops']
    }
  },
  
  {
    definition: {
      name: 'UX Research Analyst',
      description: 'Conducts user research and analyzes UX patterns',
      capabilities: ['analyze', 'research', 'design', 'report'],
      tools: ['browsermcp', 'analytics', 'survey-tools'],
      instructions: `You are a UX research specialist who analyzes user behavior and design patterns.
      
Your expertise:
- Conduct user interviews
- Analyze usage patterns
- Create personas
- Design user journeys
- Provide actionable insights`
    },
    metadata: {
      version: '1.1.0',
      author: 'ux-guild',
      category: 'design',
      tags: ['ux', 'research', 'analysis', 'design', 'user-experience']
    }
  }
];

/**
 * Display agent card
 */
function displayAgentCard(result) {
  const { agent, rating, downloads, installed } = result;
  
  console.log(chalk.cyan(`\n📦 ${agent.name} v${agent.version}`));
  console.log(chalk.gray(`   by ${agent.author}`));
  console.log(`   ${agent.description}`);
  console.log(`   Category: ${chalk.yellow(agent.category)}`);
  console.log(`   Tags: ${agent.tags.map(t => chalk.blue(`#${t}`)).join(' ')}`);
  console.log(`   Rating: ${renderRating(rating)} (${rating.toFixed(1)}/5)`);
  console.log(`   Downloads: ${chalk.green(downloads)}`);
  console.log(`   Status: ${installed ? chalk.green('✓ Installed') : chalk.gray('Not installed')}`);
}

/**
 * Render star rating
 */
function renderRating(rating) {
  const stars = Math.round(rating);
  return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
}

/**
 * Main demo
 */
async function runMarketplaceDemo() {
  console.log(chalk.bold.magenta('🏛️ Agent Marketplace ("Agora") Demo\n'));
  console.log('The marketplace enables sharing and discovery of custom agent definitions.\n');
  
  // Initialize marketplace
  const marketplace = new AgentMarketplace({
    localRegistry: './demo-marketplace',
    autoUpdate: false // Disable remote updates for demo
  });
  
  await marketplace.initialize();
  
  // Listen to events
  marketplace.on('agent:published', ({ agentId }) => {
    console.log(chalk.green(`✅ Published: ${agentId}`));
  });
  
  marketplace.on('agent:installed', ({ agentId, version }) => {
    console.log(chalk.green(`✅ Installed: ${agentId} v${version}`));
  });
  
  marketplace.on('agent:rated', ({ agentId, rating }) => {
    console.log(chalk.green(`✅ Rated: ${agentId} - ${rating}/5`));
  });
  
  // Publish sample agents
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Publishing Sample Agents to Marketplace\n'));
  
  for (const sample of sampleAgents) {
    await marketplace.publish(sample.definition, sample.metadata);
  }
  
  console.log(chalk.green(`\n✅ Published ${sampleAgents.length} agents to marketplace`));
  
  // Search marketplace
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Searching the Marketplace\n'));
  
  // Search for React agents
  console.log(chalk.yellow('Search: "react"\n'));
  const reactResults = await marketplace.search('react');
  
  reactResults.forEach(result => displayAgentCard(result));
  
  // Search for security agents
  console.log(chalk.yellow('\nSearch: "security"\n'));
  const securityResults = await marketplace.search('security', {
    category: 'security'
  });
  
  securityResults.forEach(result => displayAgentCard(result));
  
  // Get featured agents
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Featured Agents\n'));
  
  // Rate some agents to make them featured
  await marketplace.rateAgent(reactResults[0].agent.id, 5, 'Excellent component generator!');
  await marketplace.rateAgent(securityResults[0].agent.id, 4, 'Very thorough security checks');
  
  const featured = await marketplace.getFeaturedAgents();
  console.log(`Found ${featured.length} featured agents:`);
  
  featured.forEach(item => {
    console.log(`- ${item.agent.name} (${item.rating.toFixed(1)}⭐)`);
  });
  
  // Install an agent
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Installing an Agent\n'));
  
  const toInstall = reactResults[0].agent;
  console.log(`Installing: ${toInstall.name}`);
  
  const installResult = await marketplace.install(toInstall.id);
  console.log(`Installed to: ${installResult.installPath}`);
  
  // Show installed agents
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Installed Agents\n'));
  
  const installed = marketplace.getInstalledAgents();
  installed.forEach(agent => {
    console.log(`- ${agent.name} v${agent.version}`);
    console.log(`  Path: ${agent.path}`);
    console.log(`  Installed: ${new Date(agent.installedAt).toLocaleString()}`);
  });
  
  // Get agent details
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Agent Details\n'));
  
  const details = await marketplace.getAgentDetails(toInstall.id);
  
  console.log(chalk.cyan(`${details.name} v${details.version}`));
  console.log(chalk.gray('─'.repeat(40)));
  console.log(`Author: ${details.author}`);
  console.log(`Category: ${details.category}`);
  console.log(`Downloads: ${details.downloads}`);
  console.log(`Average Rating: ${details.rating.toFixed(1)}/5`);
  console.log(`\nDescription:\n${details.description}`);
  
  if (details.tags.length > 0) {
    console.log(`\nTags: ${details.tags.map(t => `#${t}`).join(', ')}`);
  }
  
  // Browse by category
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Browse by Category\n'));
  
  const categories = ['development', 'security', 'data', 'design', 'coordination'];
  
  for (const category of categories) {
    const agents = await marketplace.getByCategory(category);
    console.log(chalk.yellow(`\n${category.toUpperCase()} (${agents.length})`));
    
    agents.slice(0, 3).forEach(item => {
      console.log(`  - ${item.agent.name} (${item.rating.toFixed(1)}⭐)`);
    });
  }
  
  // Import from file
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Import Agent from File\n'));
  
  // Create a sample agent file
  const sampleMD = `# Custom Test Runner

## Description
Automated test runner with advanced features

## Capabilities
- test
- validate
- report
- coverage

## Tools
- github
- desktop-commander
- test-frameworks

## Instructions
You are a test automation specialist. Run comprehensive test suites and generate detailed reports.`;
  
  const tempFile = './demo-agent.md';
  await fs.writeFile(tempFile, sampleMD);
  
  console.log('Importing agent from demo-agent.md...');
  
  const imported = await marketplace.importAgent(tempFile, {
    author: 'demo-user',
    category: 'testing',
    tags: ['testing', 'automation', 'coverage']
  });
  
  console.log(chalk.green(`✅ Imported: ${imported.agentId}`));
  
  // Clean up
  await fs.unlink(tempFile);
  
  // Export an agent
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Export Agent\n'));
  
  const exportPath = './exported-agent.json';
  await marketplace.exportAgent(toInstall.id, exportPath);
  
  console.log(`Exported ${toInstall.name} to: ${exportPath}`);
  
  // Read and display export
  const exportData = JSON.parse(await fs.readFile(exportPath, 'utf-8'));
  console.log('\nExport contains:');
  console.log(`- Agent metadata`);
  console.log(`- Package definition`);
  console.log(`- Version: ${exportData.agent.version}`);
  console.log(`- Exported at: ${new Date(exportData.exportedAt).toLocaleString()}`);
  
  // Clean up
  await fs.unlink(exportPath);
  
  // Show marketplace statistics
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Marketplace Statistics\n'));
  
  console.log(`Total Agents: ${marketplace.index.size}`);
  console.log(`Installed: ${marketplace.installed.size}`);
  console.log(`Categories: ${marketplace.categories.size}`);
  console.log(`Unique Tags: ${marketplace.tags.size}`);
  
  console.log(chalk.bold.green('\n🎉 Agent Marketplace Demo Complete!\n'));
  
  console.log('Key Features Demonstrated:');
  console.log('1. Publishing agents with metadata and examples');
  console.log('2. Searching by keywords and filters');
  console.log('3. Rating and featuring popular agents');
  console.log('4. Installing and managing agents locally');
  console.log('5. Importing/exporting agent definitions');
  console.log('6. Browsing by categories and tags\n');
  
  // Cleanup demo files
  await fs.rm('./demo-marketplace', { recursive: true, force: true });
}

// Run the demo
runMarketplaceDemo().catch(console.error);