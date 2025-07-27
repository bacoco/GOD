# /gods - Complete Implementation with Libraries

## ACTIVATION
When user runs `/gods` or any subcommand, follow these instructions using the integrated libraries.

## Required Libraries
- `lib/model-generator.md` - Extract and generate models
- `lib/test-generator.md` - Create test files
- `lib/docker-generator.md` - Docker configuration
- `lib/framework-detector.md` - Detect project setup
- `lib/git-integration.md` - Version control
- `lib/session-state.md` - Track progress
- `lib/template-engine.md` - Process templates
- `lib/test-detection.md` - Detect test runners
- `lib/dependency-manager.md` - Manage npm dependencies
- `lib/interactive-flow.md` - Conversational UI patterns
- `lib/string-utils.md` - String transformation utilities

## Command Handlers

### `/gods` (no subcommand)
```
🏛️ Welcome to Pantheon - Where Gods Build Software

Available commands:
  /gods init      - Start a new project interactively
  /gods plan      - Create development plan from pantheon.md
  /gods execute   - Execute the development plan
  /gods validate  - Validate pantheon.md structure
  /gods resume    - Resume interrupted project

Quick start: Run '/gods init' to begin your project
```

### `/gods init` - Enhanced with Libraries

**Helper Functions**
```typescript
// Generate pantheon.md content from session data
function generatePantheonMd(session: SessionState): string {
  const yaml = `---
version: 1.0
project_type: "${session.projectType}"
author: "${session.author}"
created_at: "${new Date().toISOString()}"
workflow:
  git_enabled: ${session.workflow.git_enabled}
  auto_commit: ${session.workflow.auto_commit}
  test_before_commit: ${session.workflow.test_before_commit}
  generate_tests: ${session.workflow.generate_tests}
  create_github_immediately: ${session.workflow.create_github_immediately}
  continuous_push: ${session.workflow.continuous_push}
  docker_enabled: ${session.workflow.docker_enabled}
  docker_compose: ${session.workflow.docker_compose}
---

`;
  
  // Add features
  let content = yaml;
  for (const feature of session.features) {
    content += `## FEATURE: ${feature.name}\n\n`;
    content += `${feature.priority ? `[${feature.priority}] ` : ''}${feature.description}\n\n`;
    if (feature.dependencies) {
      content += `Dependencies: ${feature.dependencies.join(', ')}\n\n`;
    }
  }
  
  return content;
}

// Parse pantheon.md content
function parsePantheonMd(content: string): ParsedPantheon {
  // Extract YAML frontmatter
  const yamlMatch = content.match(/^---\n([\s\S]+?)\n---/);
  const yaml = yamlMatch ? parseYaml(yamlMatch[1]) : {};
  
  // Extract features
  const features = [];
  const featureRegex = /## FEATURE: (.+)\n\n(?:\[(.+?)\] )?(.+?)(?=\n## |$)/gs;
  let match;
  while ((match = featureRegex.exec(content)) !== null) {
    features.push({
      name: match[1],
      priority: match[2] || 'MEDIUM',
      description: match[3].trim()
    });
  }
  
  return { yaml, features };
}

// Generate implementation phases from features
function generatePhases(features: Feature[], models: Entity[]): Phase[] {
  const phases = [];
  
  // Phase 1: Foundation
  phases.push({
    number: 1,
    name: 'Foundation Setup',
    tasks: [
      { type: 'create_structure', description: 'Set up project structure' },
      { type: 'generate_models', description: 'Generate data models', models }
    ]
  });
  
  // Phase 2: Features
  phases.push({
    number: 2,
    name: 'Core Features',
    tasks: features.map(f => ({
      type: 'implement_feature',
      description: `Implement ${f.name}`,
      feature: f
    }))
  });
  
  // Phase 3: Polish
  phases.push({
    number: 3,
    name: 'Testing & Documentation',
    tasks: [
      { type: 'run_tests', description: 'Run all tests' },
      { type: 'generate_docs', description: 'Generate documentation' }
    ]
  });
  
  return phases;
}

// Simple YAML parser for frontmatter
function parseYaml(yamlStr: string): any {
  const result = {};
  const lines = yamlStr.split('\n');
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      result[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
  return result;
}

// Display development plan to user
function displayDevelopmentPlan(session: SessionState): void {
  console.log(`
⚡ DIVINE DEVELOPMENT PLAN
========================

📋 Project Type: ${session.projectType}
🔢 Total Features: ${session.features.length}
📊 Complexity: ${session.features.length > 5 ? 'Complex' : 'Moderate'}

🗂️ Detected Models:
${session.detectedModels.map(m => `   • ${m.name}`).join('\n')}

🧩 Available Templates:
${session.matchedTemplates.map(t => `   • ${t.template.name}: ${t.template.description}`).join('\n')}

🚀 Implementation Phases:
${session.phases.map(p => `
Phase ${p.number}: ${p.name}
${p.tasks.map(t => `- ${t.description}`).join('\n')}
`).join('\n')}

💡 Next Steps:
   1. Review and adjust if needed
   2. Run '/gods execute' to start
`);
}

// Determine output path for generated code
function determineOutputPath(template: Template, feature: Feature): string {
  // Example logic - customize based on project structure
  if (template.name.includes('controller')) {
    return `src/controllers/${feature.model.name}Controller.ts`;
  }
  if (template.name.includes('model')) {
    return `src/models/${feature.model.name}.ts`;
  }
  return `src/${feature.model.name}.ts`;
}

// Get test file path from source path
function getTestPath(sourcePath: string): string {
  const dir = path.dirname(sourcePath);
  const filename = path.basename(sourcePath);
  const name = filename.replace(/\.(ts|js)$/, '');
  return `${dir}/__tests__/${name}.test${path.extname(filename)}`;
}
```

**Step 1: Project Setup**
```typescript
// Initialize session state (lib/session-state.md)
const session = initializeSession(projectName);

// Create directory
mkdir(projectPath);

// Detect existing framework (lib/framework-detector.md)
const detectedFramework = detectFramework(projectPath);
if (detectedFramework) {
  console.log(`🔍 Detected: ${detectedFramework.name}`);
  session.framework = detectedFramework;
}
```

**Step 2-5: [Same conversational flow]**

**Step 6: Generate pantheon.md**
```typescript
// Store all collected data in session
session.projectType = projectType;
session.features = features;
session.workflow = workflowSettings;

// Generate customized pantheon.md
const pantheonContent = generatePantheonMd(session);
Write(`${projectPath}/pantheon.md`, pantheonContent);

// Save session state
saveSessionState(session);
```

### `/gods plan` - Enhanced with Model Detection

```typescript
// Load pantheon.md
const pantheonContent = Read('pantheon.md');
const parsed = parsePantheonMd(pantheonContent);

// Extract models (lib/model-generator.md)
const detectedModels = [];
for (const feature of parsed.features) {
  const entities = parseFeatureText(feature.content);
  detectedModels.push(...entities);
}
session.detectedModels = detectedModels;

// Match templates (lib/template-engine.md)
const matchedTemplates = matchTemplates({
  framework: session.framework,
  features: parsed.features,
  models: detectedModels
});
session.matchedTemplates = matchedTemplates;

// Generate implementation phases
const phases = generatePhases(parsed.features, detectedModels);
session.phases = phases;

// Display plan
displayDevelopmentPlan(session);
```

### `/gods execute` - Full Implementation

```typescript
async function executeProject(session: SessionState) {
  // Change to project directory
  cd(session.projectPath);
  
  // Initialize Git (lib/git-integration.md)
  if (session.workflow.git_enabled) {
    await initializeGitRepo(session);
  }
  
  // Execute each phase
  for (const phase of session.phases) {
    console.log(`\n📋 Phase ${phase.number}: ${phase.name}`);
    
    // Execute phase tasks
    for (const task of phase.tasks) {
      await executeTask(task, session);
    }
    
    // Run tests if enabled
    if (session.workflow.test_before_commit) {
      await runTests(session);
    }
    
    // Commit phase
    if (session.workflow.auto_commit) {
      await commitPhase(phase, session);
    }
    
    // Update session state
    session = updatePhaseProgress(session, phase.name);
    saveSessionState(session);
  }
  
  // Generate Docker if enabled
  if (session.workflow.docker_enabled) {
    await generateDockerConfig(session);
  }
  
  // Create GitHub repo if enabled
  if (session.workflow.create_github_immediately) {
    await createGitHubRepo(session);
  }
}

async function executeTask(task: Task, session: SessionState) {
  switch (task.type) {
    case 'create_structure':
      await createProjectStructure(session);
      break;
      
    case 'generate_models':
      await generateModels(session);
      break;
      
    case 'implement_feature':
      await implementFeature(task, session);
      break;
      
    case 'install_dependencies':
      await installDependencies(session);
      break;
  }
}
```

### Model Generation
```typescript
async function generateModels(session: SessionState) {
  for (const model of session.detectedModels) {
    // Generate TypeScript interface (lib/model-generator.md)
    const interfaceCode = generateTypeScriptInterface(model);
    Write(`src/types/${model.name}.ts`, interfaceCode);
    session = addGeneratedFile(session, `src/types/${model.name}.ts`);
    
    // Generate database schema
    if (session.framework.orm === 'mongoose') {
      const schemaCode = generateMongooseSchema(model);
      Write(`src/models/${model.name}.ts`, schemaCode);
      session = addGeneratedFile(session, `src/models/${model.name}.ts`);
    }
    
    // Generate tests (lib/test-generator.md)
    if (session.workflow.generate_tests) {
      const modelTests = generateModelTests(model);
      Write(`src/models/__tests__/${model.name}.test.ts`, modelTests);
      session = addGeneratedFile(session, `src/models/__tests__/${model.name}.test.ts`);
    }
  }
}
```

### Feature Implementation
```typescript
async function implementFeature(task: Task, session: SessionState) {
  const feature = task.feature;
  
  // Find matching template (lib/template-engine.md)
  const template = findBestTemplate(feature, session.matchedTemplates);
  
  if (template) {
    // Load and customize template
    const templateContent = loadTemplate(template.name);
    const customized = customizeForModel(templateContent, feature.model);
    const processed = processTemplate(customized, {
      projectName: session.projectName,
      framework: session.framework.name,
      modelName: feature.model.name,
      // ... other variables
    });
    
    // Write implementation
    const outputPath = determineOutputPath(template, feature);
    Write(outputPath, processed);
    session = addGeneratedFile(session, outputPath);
    
    // Generate tests (lib/test-generator.md)
    if (session.workflow.generate_tests) {
      const tests = generateFeatureTests(feature, template);
      const testPath = getTestPath(outputPath);
      Write(testPath, tests);
      session = addGeneratedFile(session, testPath);
    }
  } else {
    // No template - generate from scratch
    await generateCustomImplementation(feature, session);
  }
}
```

### Test Execution
```typescript
async function runTests(session: SessionState) {
  console.log('\n🧪 Running tests...');
  
  // Detect test command (lib/framework-detector.md)
  const testCommand = detectTestCommand(session.projectPath);
  
  try {
    const result = await Bash(testCommand);
    console.log('✅ All tests passing');
    return true;
  } catch (error) {
    console.log('❌ Tests failed');
    const choice = await prompt('Options: 1) Fix now 2) Commit as WIP 3) Skip commit');
    return handleTestFailure(choice, session);
  }
}
```

### Dependency Management
```typescript
async function installDependencies(session: SessionState) {
  // Collect all dependencies
  const deps = new Set<string>();
  
  // From templates
  session.matchedTemplates.forEach(t => {
    t.template.dependencies?.forEach(d => deps.add(d));
  });
  
  // From generated code
  const importedPackages = await scanImports(session.generatedFiles);
  importedPackages.forEach(p => deps.add(p));
  
  // Detect package manager (lib/framework-detector.md)
  const pm = detectPackageManager(session.projectPath);
  
  // Install
  const depsArray = Array.from(deps);
  console.log(`📦 Installing ${depsArray.length} dependencies...`);
  
  const installCmd = getInstallCommand(pm, depsArray);
  await Bash(installCmd);
  
  session.installedDependencies.push(...depsArray);
}
```

### Git Integration
```typescript
async function commitPhase(phase: Phase, session: SessionState) {
  const files = session.generatedFiles.filter(f => 
    !session.lastCommitFiles?.includes(f)
  );
  
  await Bash('git add -A');
  
  const message = `feat: complete ${phase.name} (Phase ${phase.number}/${session.phases.length})

- ${files.map(f => path.basename(f)).join('\n- ')}
- Tests: ${session.testsStatus}

Generated by Pantheon`;
  
  await Bash(`git commit -m "${message}"`);
  
  if (session.workflow.continuous_push) {
    await Bash('git push origin main');
    console.log('✅ Phase pushed to GitHub');
  }
  
  session.lastCommitFiles = [...session.generatedFiles];
}
```

### Docker Generation
```typescript
async function generateDockerConfig(session: SessionState) {
  console.log('\n🐳 Generating Docker configuration...');
  
  // Generate Dockerfile (lib/docker-generator.md)
  const dockerfile = generateDockerfile(session.framework);
  Write('Dockerfile', dockerfile);
  
  // Generate docker-compose
  if (session.workflow.docker_compose) {
    const compose = generateDockerCompose(session);
    Write('docker-compose.yml', compose);
  }
  
  // Dev compose
  if (session.workflow.docker_dev_config) {
    const devCompose = generateDevCompose(session);
    Write('docker-compose.dev.yml', devCompose);
  }
  
  console.log('✅ Docker configuration generated');
}
```

### `/gods resume`
```typescript
function resumeCommand(projectName?: string) {
  // Find project
  if (!projectName) {
    const projects = listSavedProjects();
    if (projects.length === 0) {
      console.log('No saved projects found');
      return;
    }
    // Show list and ask which to resume
  }
  
  // Load session (lib/session-state.md)
  const session = loadSessionState(projectName);
  
  console.log(`Resuming ${session.projectName}...`);
  console.log(`Progress: ${session.completedPhases.length}/${session.phases.length} phases`);
  console.log(`Next: ${session.phases[session.currentPhase]?.name}`);
  
  // Continue execution
  executeProject(session);
}
```

## Error Handling

All operations wrapped in try-catch with recovery:
```typescript
try {
  await riskyOperation();
} catch (error) {
  session.lastError = error;
  saveSessionState(session);
  
  console.log(`❌ Error: ${error.message}`);
  console.log('Your progress has been saved.');
  console.log('Resume with: /gods resume');
}
```

## Complete Integration

This implementation fully integrates all BACO libraries to provide:
1. **Model Detection**: Automatic entity extraction
2. **Test Generation**: Comprehensive test coverage
3. **Docker Support**: Container-ready projects
4. **Framework Detection**: Smart project setup
5. **Git Workflow**: Professional version control
6. **Session Management**: Progress tracking
7. **Template Engine**: Customized code generation

The `/gods` system now has the full power of BACO with a conversational interface!