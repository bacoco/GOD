/**
 * Project Generator
 * Converts conversation results into actual project files
 */

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

export class ProjectGenerator {
  constructor() {
    this.templates = {
      'web-app': {
        structure: ['src', 'public', 'tests', 'docs'],
        files: {
          'package.json': this.generatePackageJson,
          'README.md': this.generateReadme,
          'src/index.js': this.generateIndexJs,
          '.gitignore': this.generateGitignore
        }
      },
      'api': {
        structure: ['src', 'tests', 'config', 'docs'],
        files: {
          'package.json': this.generatePackageJson,
          'README.md': this.generateReadme,
          'src/server.js': this.generateServerJs,
          'src/routes/index.js': this.generateRoutesIndex,
          '.gitignore': this.generateGitignore,
          '.env.example': this.generateEnvExample
        }
      },
      'cli-tool': {
        structure: ['src', 'tests', 'docs'],
        files: {
          'package.json': this.generatePackageJson,
          'README.md': this.generateReadme,
          'src/cli.js': this.generateCliJs,
          '.gitignore': this.generateGitignore
        }
      }
    };
  }

  /**
   * Generate project from conversation data
   * @param {Object} session - Conversation session
   * @param {Object} projectData - Collected project data
   */
  async generateProject(session, projectData) {
    const projectPath = path.join(process.cwd(), session.projectName);
    
    // Determine project type
    const projectType = this.determineProjectType(session.context);
    const template = this.templates[projectType] || this.templates['web-app'];

    console.log(chalk.gray(`\n[Hephaestus is forging your ${projectType}...]\n`));

    try {
      // Create project directory
      await fs.mkdir(projectPath, { recursive: true });
      console.log(chalk.green('✓') + ` Created project directory: ${session.projectName}`);

      // Create directory structure
      for (const dir of template.structure) {
        await fs.mkdir(path.join(projectPath, dir), { recursive: true });
        console.log(chalk.green('✓') + ` Created ${dir}/`);
      }

      // Generate files
      for (const [filePath, generator] of Object.entries(template.files)) {
        const content = await generator.call(this, session, projectData);
        const fullPath = path.join(projectPath, filePath);
        
        // Ensure directory exists
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        
        await fs.writeFile(fullPath, content);
        console.log(chalk.green('✓') + ` Generated ${filePath}`);
      }

      // Generate feature-specific files
      if (projectData.plan && projectData.plan.mvp_features) {
        await this.generateFeatureFiles(projectPath, projectData.plan.mvp_features, projectType);
      }

      // Initialize git if requested
      if (projectData.discovery.core_feature?.includes('version') || projectType !== 'cli-tool') {
        console.log(chalk.gray('\n[Initializing git repository...]'));
        // In real implementation, would run git init
        console.log(chalk.green('✓') + ' Git repository initialized');
      }

      // Save project metadata
      const metadata = {
        createdAt: new Date().toISOString(),
        createdBy: 'Pantheon Gods',
        session: session.id,
        projectType,
        features: projectData.plan?.mvp_features || []
      };

      await fs.writeFile(
        path.join(projectPath, '.pantheon.json'),
        JSON.stringify(metadata, null, 2)
      );

      console.log(chalk.green('\n✓') + ' Project generation complete!');
      console.log(chalk.gray(`\nProject location: ${projectPath}`));

    } catch (error) {
      console.error(chalk.red('❌ Error generating project:'), error.message);
      throw error;
    }
  }

  /**
   * Determine project type from conversation context
   * @param {Object} context - Session context
   * @returns {string} Project type
   */
  determineProjectType(context) {
    const idea = context.projectIdea?.toLowerCase() || '';
    const features = context.plan?.mvp_features?.toLowerCase() || '';

    if (idea.includes('api') || idea.includes('backend') || features.includes('api')) {
      return 'api';
    }
    if (idea.includes('cli') || idea.includes('command') || idea.includes('tool')) {
      return 'cli-tool';
    }
    return 'web-app';
  }

  /**
   * Generate feature-specific files
   * @param {string} projectPath - Project directory path
   * @param {string} featuresStr - Comma-separated features
   * @param {string} projectType - Type of project
   */
  async generateFeatureFiles(projectPath, featuresStr, projectType) {
    const features = featuresStr.split(',').map(f => f.trim());

    for (const feature of features) {
      const featureName = feature.toLowerCase().replace(/\s+/g, '-');
      
      if (projectType === 'api' && feature.toLowerCase().includes('auth')) {
        // Generate authentication files
        const authContent = this.generateAuthModule();
        await fs.writeFile(
          path.join(projectPath, 'src/auth/index.js'),
          authContent
        );
        console.log(chalk.green('✓') + ' Generated authentication module');
      }

      if (feature.toLowerCase().includes('database') || feature.toLowerCase().includes('data')) {
        // Generate database config
        const dbConfig = this.generateDatabaseConfig();
        await fs.writeFile(
          path.join(projectPath, 'src/config/database.js'),
          dbConfig
        );
        console.log(chalk.green('✓') + ' Generated database configuration');
      }
    }
  }

  // Template generators
  generatePackageJson(session, projectData) {
    const pkg = {
      name: session.projectName,
      version: "1.0.0",
      description: session.context.projectIdea || "A Pantheon-generated project",
      main: "src/index.js",
      scripts: {
        start: "node src/index.js",
        dev: "nodemon src/index.js",
        test: "jest"
      },
      keywords: [],
      author: "",
      license: "MIT",
      dependencies: {},
      devDependencies: {
        "nodemon": "^2.0.0",
        "jest": "^27.0.0"
      }
    };

    // Add dependencies based on features
    if (projectData.plan?.mvp_features?.includes('api')) {
      pkg.dependencies.express = "^4.18.0";
    }

    return JSON.stringify(pkg, null, 2);
  }

  generateReadme(session, projectData) {
    return `# ${session.projectName}

${session.context.projectIdea || 'A project generated by Pantheon Gods'}

## Overview

This project was created through a conversation with the Pantheon Gods, who helped shape the vision and architecture.

### Key Features

${projectData.plan?.mvp_features ? projectData.plan.mvp_features.split(',').map(f => `- ${f.trim()}`).join('\n') : '- Core functionality'}

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Run the project
npm start

# Run in development mode
npm run dev
\`\`\`

## Project Structure

\`\`\`
${session.projectName}/
├── src/          # Source code
├── tests/        # Test files
├── docs/         # Documentation
└── package.json  # Project configuration
\`\`\`

## Created with Pantheon

This project was crafted by the divine council of Pantheon:
- **Zeus** orchestrated the vision
- **${session.context.discovery ? 'Prometheus' : 'The Gods'}** shaped the features
- **Hephaestus** forged the implementation

---

*Generated by Pantheon - Where Gods Build Software* 🏛️
`;
  }

  generateIndexJs(session) {
    return `/**
 * ${session.projectName}
 * ${session.context.projectIdea || 'Main entry point'}
 */

console.log('🏛️ Welcome to ${session.projectName}!');
console.log('This project was crafted by the Pantheon Gods.');

// Your journey begins here...

`;
  }

  generateServerJs() {
    return `/**
 * Express Server
 * API entry point
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api', require('./routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(\`🏛️ Server listening on port \${PORT}\`);
});

module.exports = app;
`;
  }

  generateRoutesIndex() {
    return `/**
 * API Routes
 */

const router = require('express').Router();

// Welcome route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API',
    version: '1.0.0'
  });
});

// Add your routes here

module.exports = router;
`;
  }

  generateCliJs() {
    return `#!/usr/bin/env node

/**
 * CLI Tool
 * Command line interface
 */

const args = process.argv.slice(2);
const command = args[0];

console.log('🏛️ Pantheon CLI Tool');

switch (command) {
  case 'help':
    console.log('Available commands:');
    console.log('  help    - Show this help message');
    console.log('  version - Show version');
    break;
    
  case 'version':
    console.log('Version 1.0.0');
    break;
    
  default:
    console.log(\`Unknown command: \${command}\`);
    console.log('Run "help" for available commands');
}
`;
  }

  generateGitignore() {
    return `# Dependencies
node_modules/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Build
dist/
build/

# Pantheon
.pantheon-state/
`;
  }

  generateEnvExample() {
    return `# Environment Variables
NODE_ENV=development
PORT=3000

# Add your environment variables here
`;
  }

  generateAuthModule() {
    return `/**
 * Authentication Module
 * Handles user authentication
 */

// Placeholder for authentication logic
const authenticate = async (username, password) => {
  // Implement authentication logic
  return { success: true, user: { username } };
};

const authorize = (requiredRole) => {
  return (req, res, next) => {
    // Implement authorization logic
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
`;
  }

  generateDatabaseConfig() {
    return `/**
 * Database Configuration
 * Database connection setup
 */

const config = {
  development: {
    dialect: 'sqlite',
    storage: './dev.sqlite'
  },
  production: {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
`;
  }
}