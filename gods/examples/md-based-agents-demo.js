/**
 * Demonstration of MD-based Dynamic Agent Creation
 * Shows how gods can create custom agents using Claude-Flow agents as templates
 */

import { BaseGod } from '../lib/base-god-enhanced.js';

/**
 * Example 1: Zeus creates a specialized blockchain orchestrator
 */
async function zeusBlockchainExample(zeus) {
  console.log('\n=== Example 1: Zeus Creates Blockchain Orchestrator ===\n');
  
  // Create a blockchain-focused orchestrator by adapting the base orchestrator
  const blockchainOrchestrator = await zeus.createSubAgent('blockchain-orchestrator', {
    baseAgent: 'orchestrator-task',  // Claude-Flow's task orchestrator
    adaptations: {
      name: 'Blockchain Project Orchestrator',
      focus: 'Orchestrating blockchain and DeFi project development',
      expertise: [
        'Smart contract architecture',
        'DeFi protocol design', 
        'Cross-chain integration',
        'Security best practices'
      ],
      additionalInstructions: `
        When orchestrating blockchain projects:
        - Always prioritize security audits
        - Consider gas optimization in all implementations
        - Ensure proper testing on testnets before mainnet
        - Follow established standards (ERC-20, ERC-721, etc.)
      `,
      tools: ['Task', 'TodoWrite', 'Memory', 'github'],
      personality: {
        traits: ['security-conscious', 'detail-oriented', 'methodical'],
        approach: 'conservative and thorough'
      }
    }
  });
  
  console.log('Created:', blockchainOrchestrator.id);
  console.log('Type:', blockchainOrchestrator.type);
  console.log('Heritage:', blockchainOrchestrator.specialization.heritage);
  
  // The orchestrator can now coordinate blockchain-specific tasks
  const result = await blockchainOrchestrator.execute(
    'Plan the development of a decentralized exchange (DEX) with automated market maker'
  );
  
  return blockchainOrchestrator;
}

/**
 * Example 2: Hephaestus creates specialized developers
 */
async function hephaestusDeveloperTeam(hephaestus) {
  console.log('\n=== Example 2: Hephaestus Creates Specialized Developer Team ===\n');
  
  // 1. Solidity Developer - Based on coder.md
  const solidityDev = await hephaestus.createSubAgent('solidity-developer', {
    baseAgent: 'coder',
    adaptations: {
      name: 'Solidity Smart Contract Developer',
      focus: 'Developing secure and efficient smart contracts',
      expertise: [
        'Solidity programming',
        'OpenZeppelin libraries',
        'Gas optimization',
        'Security patterns'
      ],
      tools: ['github', 'desktop-commander'],
      patterns: [
        {
          name: 'Reentrancy Guard',
          code: `
modifier nonReentrant() {
    require(!locked, "Reentrant call");
    locked = true;
    _;
    locked = false;
}`,
          description: 'Prevent reentrancy attacks'
        }
      ]
    }
  });
  
  // 2. Full-Stack Web3 Developer - Combination of multiple agents
  const web3FullStack = await hephaestus.createSubAgent('web3-fullstack', {
    baseAgents: ['backend-dev', 'spec-mobile-react-native'],
    mergeStrategy: 'best-features',
    adaptations: {
      name: 'Web3 Full-Stack Developer',
      focus: 'Building complete dApps with Web3 integration',
      expertise: [
        'React with Web3 hooks',
        'Node.js backend with ethers.js',
        'IPFS integration',
        'MetaMask and wallet connections'
      ],
      additionalInstructions: `
        Specialize in creating seamless Web3 user experiences:
        - Handle wallet connections gracefully
        - Provide clear transaction feedback
        - Implement proper error handling for blockchain errors
        - Cache blockchain data appropriately
      `
    }
  });
  
  // 3. ML-Blockchain Hybrid Developer
  const mlBlockchainDev = await hephaestus.createSubAgent('ml-blockchain-dev', {
    baseAgents: ['coder', 'data-ml-model'],
    mergeStrategy: 'capabilities-union',
    adaptations: {
      name: 'ML-Blockchain Integration Specialist',
      focus: 'Combining machine learning with blockchain technology',
      expertise: [
        'On-chain ML inference',
        'Decentralized ML training',
        'Zero-knowledge ML proofs',
        'Tokenomics modeling'
      ]
    }
  });
  
  console.log('Created Developer Team:');
  console.log('- Solidity Developer:', solidityDev.id);
  console.log('- Web3 Full-Stack:', web3FullStack.id);
  console.log('- ML-Blockchain Specialist:', mlBlockchainDev.id);
  
  return { solidityDev, web3FullStack, mlBlockchainDev };
}

/**
 * Example 3: Themis creates specialized testing agents
 */
async function themisTestingSquad(themis) {
  console.log('\n=== Example 3: Themis Creates Specialized Testing Squad ===\n');
  
  // Security-focused tester combining multiple capabilities
  const securityTester = await themis.createSubAgent('security-tester', {
    baseAgents: ['tester', 'security-manager'],
    mergeStrategy: 'union',
    adaptations: {
      name: 'Security Test Specialist',
      focus: 'Comprehensive security testing and vulnerability assessment',
      expertise: [
        'Smart contract auditing',
        'Penetration testing',
        'Static code analysis',
        'Fuzzing techniques'
      ],
      tools: ['github', 'security-scanner', 'mythril'],
      guidelines: [
        'Always test for common vulnerabilities (OWASP Top 10)',
        'Use both automated and manual testing approaches',
        'Document all findings with severity levels',
        'Provide remediation recommendations'
      ]
    }
  });
  
  // Performance tester based on benchmarking patterns
  const performanceTester = await themis.createSubAgent('performance-tester', {
    baseAgent: 'performance-benchmarker',
    adaptations: {
      name: 'Blockchain Performance Tester',
      focus: 'Gas optimization and throughput testing',
      additionalInstructions: `
        Focus on blockchain-specific performance metrics:
        - Gas consumption per function
        - Transaction throughput
        - State storage optimization
        - Event emission efficiency
      `
    }
  });
  
  console.log('Testing Squad Created:');
  console.log('- Security Tester:', securityTester.id);
  console.log('- Performance Tester:', performanceTester.id);
  
  return { securityTester, performanceTester };
}

/**
 * Example 4: Daedalus creates architecture specialists
 */
async function daedalusArchitectureTeam(daedalus) {
  console.log('\n=== Example 4: Daedalus Creates Architecture Specialists ===\n');
  
  // Microservices architect
  const microservicesArchitect = await daedalus.createSubAgent('microservices-architect', {
    baseAgent: 'architecture',
    adaptations: {
      name: 'Microservices Architecture Specialist',
      focus: 'Designing scalable microservices architectures',
      expertise: [
        'Service decomposition',
        'API gateway patterns',
        'Service mesh design',
        'Event-driven architecture'
      ],
      patterns: [
        {
          name: 'Saga Pattern',
          description: 'Manage distributed transactions across microservices'
        },
        {
          name: 'Circuit Breaker',
          description: 'Prevent cascading failures in service communication'
        }
      ]
    }
  });
  
  // Blockchain architect combining multiple domains
  const blockchainArchitect = await daedalus.createSubAgent('blockchain-architect', {
    baseAgents: ['architecture', 'byzantine-coordinator'],
    mergeStrategy: 'best-features',
    adaptations: {
      name: 'Distributed Ledger Architect',
      focus: 'Designing blockchain and distributed systems',
      expertise: [
        'Consensus mechanisms',
        'Sharding strategies',
        'Cross-chain bridges',
        'Layer 2 solutions'
      ]
    }
  });
  
  console.log('Architecture Team:');
  console.log('- Microservices Architect:', microservicesArchitect.id);
  console.log('- Blockchain Architect:', blockchainArchitect.id);
  
  return { microservicesArchitect, blockchainArchitect };
}

/**
 * Example 5: Dynamic team creation based on project requirements
 */
async function dynamicTeamCreation(zeus, projectDescription) {
  console.log('\n=== Example 5: Dynamic Team Creation ===\n');
  console.log('Project:', projectDescription);
  
  // Zeus analyzes project and discovers suitable base agents
  const recommendations = await zeus.discoverAgentsForTask(projectDescription);
  
  console.log('\nRecommended base agents:');
  recommendations.forEach(({ agent, score, relevance }) => {
    console.log(`- ${agent.name} (score: ${score}, relevance: ${relevance})`);
  });
  
  // Create a custom team based on recommendations
  const team = [];
  
  for (const { agent } of recommendations.slice(0, 3)) {
    const customAgent = await zeus.createSubAgent(`custom-${agent.name}`, {
      baseAgent: agent.name,
      adaptations: {
        focus: `Specialized for: ${projectDescription}`,
        additionalInstructions: `
          Apply your expertise specifically to this project context.
          Collaborate closely with other team members.
          Report progress regularly.
        `
      }
    });
    
    team.push(customAgent);
  }
  
  console.log(`\nCreated dynamic team of ${team.length} specialized agents`);
  
  return team;
}

/**
 * Example 6: Using predefined specializations
 */
async function predefinedSpecializations(god) {
  console.log('\n=== Example 6: Using Predefined Specializations ===\n');
  
  // Create agents using built-in specializations
  const specialists = await Promise.all([
    god.createSpecializedAgent('blockchain-developer'),
    god.createSpecializedAgent('ml-engineer'),
    god.createSpecializedAgent('full-stack-developer'),
    god.createSpecializedAgent('security-auditor')
  ]);
  
  console.log('Created specialists:');
  specialists.forEach(agent => {
    console.log(`- ${agent.type}: ${agent.specialization.focus}`);
  });
  
  return specialists;
}

/**
 * Main demonstration function
 */
async function runDemo() {
  console.log('=== MD-Based Dynamic Agent Creation Demo ===\n');
  
  // Mock god instances (in real usage, these would be actual god instances)
  const mockGod = (name) => new BaseGod({ 
    name, 
    claudeFlowPath: '../../claude-flow' 
  });
  
  const zeus = mockGod('zeus');
  const hephaestus = mockGod('hephaestus');
  const themis = mockGod('themis');
  const daedalus = mockGod('daedalus');
  
  // Initialize gods
  await Promise.all([
    zeus.initialize(),
    hephaestus.initialize(),
    themis.initialize(),
    daedalus.initialize()
  ]);
  
  try {
    // Run examples
    await zeusBlockchainExample(zeus);
    await hephaestusDeveloperTeam(hephaestus);
    await themisTestingSquad(themis);
    await daedalusArchitectureTeam(daedalus);
    await dynamicTeamCreation(zeus, 'Build a decentralized social media platform with AI content moderation');
    await predefinedSpecializations(zeus);
    
    // Show metrics
    console.log('\n=== Final Metrics ===');
    console.log('Zeus:', zeus.getMetrics());
    console.log('Hephaestus:', hephaestus.getMetrics());
    console.log('Themis:', themis.getMetrics());
    console.log('Daedalus:', daedalus.getMetrics());
    
  } catch (error) {
    console.error('Demo error:', error);
  }
}

// Run the demo
runDemo().catch(console.error);

export {
  zeusBlockchainExample,
  hephaestusDeveloperTeam,
  themisTestingSquad,
  daedalusArchitectureTeam,
  dynamicTeamCreation,
  predefinedSpecializations
};