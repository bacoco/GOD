# Dependency Manager for BACO

This library manages package dependencies by parsing imports, resolving conflicts, and auto-installing missing packages.

## Overview

The dependency manager:
- Parses import/require statements from generated code
- Collects dependencies from templates
- Detects already installed packages
- Resolves version conflicts
- Runs the appropriate package manager
- Handles different package registries
- Manages dev vs production dependencies

## Import Parsing

### 1. Import Pattern Detection

```typescript
interface ParsedImport {
  packageName: string;
  importType: 'es6' | 'commonjs' | 'dynamic';
  isRelative: boolean;
  isBuiltin: boolean;
  members?: string[];
}

const importPatterns = {
  // ES6 imports
  es6Default: /^import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/gm,
  es6Named: /^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/gm,
  es6Namespace: /^import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/gm,
  es6Side: /^import\s+['"]([^'"]+)['"]/gm,
  
  // CommonJS requires
  commonjsRequire: /(?:const|let|var)\s+(\w+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/gm,
  commonjsDestructure: /(?:const|let|var)\s+\{([^}]+)\}\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/gm,
  
  // Dynamic imports
  dynamicImport: /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  
  // TypeScript type imports
  typeImport: /^import\s+type\s+(?:\{[^}]+\}|\w+)\s+from\s+['"]([^'"]+)['"]/gm
};

function parseImports(code: string): ParsedImport[] {
  const imports: ParsedImport[] = [];
  const processed = new Set<string>();
  
  // Parse ES6 imports
  for (const [patternName, pattern] of Object.entries(importPatterns)) {
    const matches = code.matchAll(pattern);
    
    for (const match of matches) {
      const packagePath = match[match.length - 1];
      
      if (processed.has(packagePath)) continue;
      processed.add(packagePath);
      
      const parsed = parsePackagePath(packagePath);
      if (parsed && !parsed.isRelative && !parsed.isBuiltin) {
        imports.push({
          ...parsed,
          importType: patternName.includes('commonjs') ? 'commonjs' : 
                      patternName.includes('dynamic') ? 'dynamic' : 'es6'
        });
      }
    }
  }
  
  return imports;
}

function parsePackagePath(importPath: string): ParsedImport | null {
  // Check if it's a relative import
  if (importPath.startsWith('.') || importPath.startsWith('/')) {
    return null;
  }
  
  // Check if it's a Node.js built-in module
  const builtins = new Set([
    'fs', 'path', 'http', 'https', 'crypto', 'os', 'util',
    'stream', 'buffer', 'events', 'querystring', 'url',
    'child_process', 'cluster', 'dgram', 'dns', 'net',
    'readline', 'repl', 'tls', 'tty', 'vm', 'zlib'
  ]);
  
  const packageName = extractPackageName(importPath);
  
  return {
    packageName,
    importType: 'es6',
    isRelative: false,
    isBuiltin: builtins.has(packageName)
  };
}

function extractPackageName(importPath: string): string {
  // Handle scoped packages (@org/package)
  if (importPath.startsWith('@')) {
    const parts = importPath.split('/');
    return parts.slice(0, 2).join('/');
  }
  
  // Handle regular packages
  return importPath.split('/')[0];
}
```

### 2. Template Dependency Collection

```typescript
interface TemplateDependency {
  package: string;
  version: string;
  dev?: boolean;
  peer?: boolean;
  optional?: boolean;
}

interface DependencySet {
  dependencies: Map<string, TemplateDependency>;
  devDependencies: Map<string, TemplateDependency>;
  peerDependencies: Map<string, TemplateDependency>;
}

function collectTemplateDependencies(templates: Template[]): DependencySet {
  const deps: DependencySet = {
    dependencies: new Map(),
    devDependencies: new Map(),
    peerDependencies: new Map()
  };
  
  for (const template of templates) {
    if (!template.dependencies) continue;
    
    for (const dep of template.dependencies) {
      const targetMap = dep.dev ? deps.devDependencies :
                       dep.peer ? deps.peerDependencies :
                       deps.dependencies;
      
      const existing = targetMap.get(dep.package);
      
      if (existing) {
        // Resolve version conflict
        const resolved = resolveVersionConflict(existing.version, dep.version);
        targetMap.set(dep.package, { ...dep, version: resolved });
      } else {
        targetMap.set(dep.package, dep);
      }
    }
  }
  
  return deps;
}
```

### 3. Version Conflict Resolution

```typescript
function resolveVersionConflict(version1: string, version2: string): string {
  // If versions are identical, no conflict
  if (version1 === version2) return version1;
  
  // Parse version constraints
  const v1 = parseVersionConstraint(version1);
  const v2 = parseVersionConstraint(version2);
  
  // If one is exact and the other is range, prefer exact
  if (v1.type === 'exact' && v2.type !== 'exact') return version1;
  if (v2.type === 'exact' && v1.type !== 'exact') return version2;
  
  // If both are ranges, try to find compatible version
  if (v1.type === 'range' && v2.type === 'range') {
    const compatible = findCompatibleVersion(v1, v2);
    if (compatible) return compatible;
  }
  
  // Default to newer version (simplified)
  return compareVersions(v1.version, v2.version) > 0 ? version1 : version2;
}

interface VersionConstraint {
  type: 'exact' | 'range' | 'caret' | 'tilde';
  version: string;
  operator?: string;
}

function parseVersionConstraint(constraint: string): VersionConstraint {
  if (constraint.startsWith('^')) {
    return { type: 'caret', version: constraint.slice(1) };
  }
  if (constraint.startsWith('~')) {
    return { type: 'tilde', version: constraint.slice(1) };
  }
  if (constraint.includes('>') || constraint.includes('<') || constraint.includes('=')) {
    return { type: 'range', version: constraint };
  }
  return { type: 'exact', version: constraint };
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  
  return 0;
}
```

## Dependency Installation

### 1. Package Manager Detection

```typescript
function detectPackageManager(projectPath: string): 'npm' | 'yarn' | 'pnpm' | 'bun' {
  if (fs.existsSync(path.join(projectPath, 'bun.lockb'))) return 'bun';
  if (fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) return 'yarn';
  return 'npm'; // default
}

function getInstallCommand(
  packageManager: string,
  packages: string[],
  dev: boolean = false
): string {
  const devFlag = dev ? ' -D' : '';
  
  switch (packageManager) {
    case 'npm':
      return `npm install${devFlag} ${packages.join(' ')}`;
    case 'yarn':
      return `yarn add${devFlag} ${packages.join(' ')}`;
    case 'pnpm':
      return `pnpm add${devFlag} ${packages.join(' ')}`;
    case 'bun':
      return `bun add${devFlag} ${packages.join(' ')}`;
    default:
      return `npm install${devFlag} ${packages.join(' ')}`;
  }
}
```

### Workspace Dependency Handling

```typescript
interface WorkspaceContext {
  isMonorepo: boolean;
  monorepoType?: 'npm-workspaces' | 'yarn-workspaces' | 'pnpm' | 'nx' | 'lerna' | 'rush' | 'turborepo';
  workspacePackages?: Map<string, string>; // package name -> package path
  rootPath?: string;
}

async function detectWorkspaceContext(projectPath: string): Promise<WorkspaceContext> {
  // Use monorepo-detector library
  const monorepoInfo = await detectMonorepo(projectPath);
  
  if (!monorepoInfo) {
    return { isMonorepo: false };
  }
  
  // Build workspace package map
  const workspacePackages = new Map<string, string>();
  for (const pkg of monorepoInfo.packages) {
    workspacePackages.set(pkg.name, pkg.path);
  }
  
  return {
    isMonorepo: true,
    monorepoType: monorepoInfo.type,
    workspacePackages,
    rootPath: monorepoInfo.root
  };
}

function resolveWorkspaceDependency(
  packageName: string,
  workspaceContext: WorkspaceContext
): DependencyInfo | null {
  if (!workspaceContext.isMonorepo || !workspaceContext.workspacePackages) {
    return null;
  }
  
  // Check if this is a workspace package
  if (workspaceContext.workspacePackages.has(packageName)) {
    const version = getWorkspaceProtocol(workspaceContext.monorepoType!);
    return {
      name: packageName,
      version,
      isWorkspace: true,
      localPath: workspaceContext.workspacePackages.get(packageName)
    };
  }
  
  return null;
}

function getWorkspaceProtocol(monorepoType: string): string {
  switch (monorepoType) {
    case 'pnpm':
      return 'workspace:*';
    case 'yarn-workspaces':
      // Yarn 2+ uses workspace:*, Yarn 1 uses *
      return 'workspace:*';
    case 'npm-workspaces':
      return '*';
    case 'nx':
      return '*'; // Nx uses TypeScript paths
    default:
      return '*';
  }
}

// Enhanced dependency resolution
async function resolveDependencies(
  imports: ParsedImport[],
  projectPath: string
): Promise<DependencySet> {
  const dependencies = new Map<string, DependencyInfo>();
  const devDependencies = new Map<string, DependencyInfo>();
  
  // Detect workspace context
  const workspaceContext = await detectWorkspaceContext(projectPath);
  
  for (const imp of imports) {
    if (imp.isBuiltin || imp.isRelative) continue;
    
    // Check if it's a workspace dependency
    const workspaceDep = resolveWorkspaceDependency(imp.packageName, workspaceContext);
    
    if (workspaceDep) {
      dependencies.set(imp.packageName, workspaceDep);
    } else {
      // External dependency - resolve version from registry
      const depInfo = await resolveExternalDependency(imp.packageName);
      dependencies.set(imp.packageName, depInfo);
    }
  }
  
  return {
    dependencies,
    devDependencies,
    peerDependencies: new Map(),
    workspaceContext
  };
}
```

### 2. Missing Dependency Detection

```typescript
async function detectMissingDependencies(
  projectPath: string,
  requiredDeps: DependencySet
): Promise<DependencySet> {
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    // All dependencies are missing if no package.json
    return requiredDeps;
  }
  
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
  const installedDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies
  };
  
  const missing: DependencySet = {
    dependencies: new Map(),
    devDependencies: new Map(),
    peerDependencies: new Map()
  };
  
  // Check each required dependency
  for (const [pkg, dep] of requiredDeps.dependencies) {
    if (!installedDeps[pkg]) {
      missing.dependencies.set(pkg, dep);
    } else if (!isVersionSatisfied(installedDeps[pkg], dep.version)) {
      // Version mismatch - needs update
      missing.dependencies.set(pkg, dep);
    }
  }
  
  // Check dev dependencies
  for (const [pkg, dep] of requiredDeps.devDependencies) {
    if (!installedDeps[pkg]) {
      missing.devDependencies.set(pkg, dep);
    }
  }
  
  return missing;
}

function isVersionSatisfied(installed: string, required: string): boolean {
  // Simplified version check - in production use semver library
  if (required.startsWith('^') || required.startsWith('~')) {
    // For caret and tilde, check if installed is >= base version
    const requiredBase = required.slice(1);
    return compareVersions(installed.replace(/[\^~]/, ''), requiredBase) >= 0;
  }
  
  return installed === required;
}
```

### 3. Dependency Installation Process

```typescript
export async function installDependencies(
  projectPath: string,
  dependencies: DependencySet,
  options: {
    autoInstall?: boolean;
    silent?: boolean;
    onProgress?: (message: string) => void;
  } = {}
): Promise<InstallResult> {
  const { autoInstall = true, silent = false, onProgress } = options;
  
  // Detect package manager
  const packageManager = detectPackageManager(projectPath);
  onProgress?.(`Detected package manager: ${packageManager}`);
  
  // Detect missing dependencies
  const missing = await detectMissingDependencies(projectPath, dependencies);
  
  // Count missing
  const missingCount = 
    missing.dependencies.size + 
    missing.devDependencies.size + 
    missing.peerDependencies.size;
  
  if (missingCount === 0) {
    onProgress?.('All dependencies are already installed');
    return { success: true, installed: [], skipped: [] };
  }
  
  onProgress?.(`Found ${missingCount} missing dependencies`);
  
  // Build install commands
  const commands: string[] = [];
  
  // Regular dependencies
  if (missing.dependencies.size > 0) {
    const deps = Array.from(missing.dependencies.entries())
      .map(([pkg, dep]) => `${pkg}@${dep.version}`);
    commands.push(getInstallCommand(packageManager, deps, false));
  }
  
  // Dev dependencies
  if (missing.devDependencies.size > 0) {
    const devDeps = Array.from(missing.devDependencies.entries())
      .map(([pkg, dep]) => `${pkg}@${dep.version}`);
    commands.push(getInstallCommand(packageManager, devDeps, true));
  }
  
  if (!autoInstall) {
    // Return commands for manual installation
    return {
      success: false,
      installed: [],
      skipped: Array.from(missing.dependencies.keys()),
      commands
    };
  }
  
  // Execute installation
  const installed: string[] = [];
  const failed: string[] = [];
  
  for (const command of commands) {
    onProgress?.(`Running: ${command}`);
    
    try {
      await execCommand(command, projectPath, silent);
      
      // Extract installed packages from command
      const packages = command.match(/\s([^@\s]+@[^\s]+)/g)?.map(p => p.trim()) || [];
      installed.push(...packages);
    } catch (error) {
      console.error(`Failed to run: ${command}`, error);
      failed.push(command);
    }
  }
  
  return {
    success: failed.length === 0,
    installed,
    skipped: [],
    failed
  };
}

async function execCommand(
  command: string,
  cwd: string,
  silent: boolean
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    
    if (!silent) {
      child.stdout?.pipe(process.stdout);
      child.stderr?.pipe(process.stderr);
    }
  });
}
```

## Integration with BACO

### 1. During Template Processing

```typescript
export async function processTemplatesWithDependencies(
  templates: Template[],
  generatedFiles: GeneratedFile[],
  projectPath: string,
  options: DependencyOptions
): Promise<DependencyResult> {
  // Collect dependencies from templates
  const templateDeps = collectTemplateDependencies(templates);
  
  // Parse imports from generated code
  const importedPackages = new Set<string>();
  
  for (const file of generatedFiles) {
    if (file.path.endsWith('.ts') || file.path.endsWith('.js')) {
      const imports = parseImports(file.content);
      imports.forEach(imp => {
        if (!imp.isBuiltin) {
          importedPackages.add(imp.packageName);
        }
      });
    }
  }
  
  // Add imported packages that aren't in template deps
  for (const pkg of importedPackages) {
    if (!templateDeps.dependencies.has(pkg) && 
        !templateDeps.devDependencies.has(pkg)) {
      // Try to infer version from templates or use latest
      templateDeps.dependencies.set(pkg, {
        package: pkg,
        version: 'latest'
      });
    }
  }
  
  // Install dependencies
  const result = await installDependencies(
    projectPath,
    templateDeps,
    options
  );
  
  return {
    ...result,
    templateDependencies: templateDeps,
    detectedImports: Array.from(importedPackages)
  };
}
```

### 2. Package.json Generation

```typescript
export function generatePackageJson(
  projectName: string,
  framework: FrameworkInfo,
  dependencies: DependencySet
): string {
  const packageJson = {
    name: toKebabCase(projectName),
    version: '1.0.0',
    description: '',
    main: framework.language === 'typescript' ? 'dist/index.js' : 'index.js',
    scripts: generateScripts(framework),
    dependencies: Object.fromEntries(
      Array.from(dependencies.dependencies.entries())
        .map(([pkg, dep]) => [pkg, dep.version])
    ),
    devDependencies: Object.fromEntries(
      Array.from(dependencies.devDependencies.entries())
        .map(([pkg, dep]) => [pkg, dep.version])
    ),
    engines: {
      node: '>=18.0.0'
    }
  };
  
  return JSON.stringify(packageJson, null, 2);
}

function generateScripts(framework: FrameworkInfo): Record<string, string> {
  const scripts: Record<string, string> = {};
  
  switch (framework.primary) {
    case 'express':
      scripts.dev = 'nodemon';
      scripts.build = 'tsc';
      scripts.start = 'node dist/server.js';
      scripts.test = 'jest';
      scripts.lint = 'eslint src --ext .ts';
      break;
      
    case 'next.js':
      scripts.dev = 'next dev';
      scripts.build = 'next build';
      scripts.start = 'next start';
      scripts.lint = 'next lint';
      scripts.test = 'jest';
      break;
      
    case 'react':
      scripts.dev = 'vite';
      scripts.build = 'vite build';
      scripts.preview = 'vite preview';
      scripts.test = 'vitest';
      scripts.lint = 'eslint src --ext .ts,.tsx';
      break;
  }
  
  if (framework.language === 'typescript') {
    scripts.typecheck = 'tsc --noEmit';
  }
  
  return scripts;
}
```

## Usage in BACO Commands

### During `/baco execute`:

```typescript
// After generating all files
const dependencyResult = await processTemplatesWithDependencies(
  selectedTemplates,
  generatedFiles,
  projectPath,
  {
    autoInstall: true,
    onProgress: (message) => {
      console.log(`📦 ${message}`);
    }
  }
);

if (!dependencyResult.success) {
  console.log('⚠️ Some dependencies failed to install:');
  console.log('Run these commands manually:');
  dependencyResult.commands?.forEach(cmd => {
    console.log(`  ${cmd}`);
  });
}

// Update package.json with all dependencies
const packageJson = generatePackageJson(
  projectName,
  framework,
  dependencyResult.templateDependencies
);

Write(`${projectPath}/package.json`, packageJson);
```

## Best Practices

1. **Always check existing dependencies** before installing
2. **Prefer exact versions** for consistency
3. **Separate dev and production** dependencies correctly
4. **Handle peer dependencies** with care
5. **Provide manual fallback** when auto-install fails
6. **Cache dependency resolution** for performance
7. **Detect workspace dependencies** and use appropriate protocols
8. **Respect monorepo boundaries** when adding dependencies

## Monorepo Considerations

When working in a monorepo:

1. **Use workspace protocols**: Dependencies between packages in the same monorepo should use workspace protocols (e.g., `workspace:*` for pnpm)
2. **Install at the right level**: Some monorepos prefer installing dependencies at the root, others at the package level
3. **Share common dependencies**: Hoist common dependencies to reduce duplication
4. **Version consistency**: Ensure consistent versions across packages
5. **Build order**: Respect dependency order when building packages