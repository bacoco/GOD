# Framework Detector for Pantheon

**Purpose**: Automatically detects project frameworks, build tools, and package managers to configure appropriate code generation.

**Key Functions**:
- `detectFramework(projectPath)` - Identifies the main framework
- `detectPackageManager(projectPath)` - Finds npm/yarn/pnpm/bun
- `detectTestCommand(projectPath)` - Identifies test runner
- `detectBuildTool(projectPath)` - Finds webpack/vite/etc
- `getFrameworkDefaults(framework)` - Returns framework conventions

**Usage**: Called by `/gods init` and `/gods plan` to understand project context and generate compatible code.

## Overview

The framework detector:
- Identifies project type from files
- Detects package managers
- Finds test runners
- Determines build tools
- Suggests appropriate configurations

## Detection Patterns

### 1. Frontend Frameworks
```yaml
Next.js:
  - Files: next.config.js, pages/ or app/
  - Package: "next" in package.json

React:
  - Files: public/index.html, src/App.js
  - Package: "react" in package.json

Vue:
  - Files: vue.config.js, src/App.vue
  - Package: "vue" in package.json

Angular:
  - Files: angular.json, src/app/
  - Package: "@angular/core"

Svelte:
  - Files: svelte.config.js
  - Package: "svelte"
```

### 2. Backend Frameworks
```yaml
Express:
  - Package: "express"
  - Common files: app.js, server.js

NestJS:
  - Package: "@nestjs/core"
  - Files: nest-cli.json

Fastify:
  - Package: "fastify"

Django:
  - Files: manage.py, settings.py
  - Requirements: django

FastAPI:
  - Requirements: fastapi
  - Files: main.py
```

### 3. Package Managers
```yaml
npm: package-lock.json
yarn: yarn.lock
pnpm: pnpm-lock.yaml
bun: bun.lockb
```

### 4. Test Runners
```yaml
Jest: jest.config.js or "jest" in package.json
Vitest: vitest.config.js
Mocha: mocha in package.json
Pytest: pytest.ini or test_*.py files
```

## Usage in /gods

### During Init
```javascript
// Detect existing framework
const framework = detectFramework(projectPath);
if (framework) {
  console.log(`🔍 Detected: ${framework.name}`);
  // Use framework-specific templates
}
```

### During Execute
```javascript
// Detect package manager for installation
const pm = detectPackageManager(projectPath);
const installCmd = getInstallCommand(pm); // npm install, yarn, etc.
```

### Test Detection
```javascript
// Find test command
const testCommand = detectTestCommand(projectPath);
// Returns: npm test, yarn test, pytest, etc.
```

## Framework-Specific Defaults

### Next.js
- Structure: app/ directory
- Styling: Tailwind CSS
- Testing: Jest + React Testing Library
- API: app/api routes

### Express
- Structure: MVC pattern
- Database: MongoDB/PostgreSQL
- Testing: Jest + Supertest
- Middleware: cors, helmet, morgan

### React
- Structure: components/, hooks/, utils/
- State: Context or Redux Toolkit
- Testing: React Testing Library
- Build: Vite or Create React App

## Integration Points

1. **Project Setup**: Choose appropriate scaffolding
2. **Template Selection**: Use framework-specific templates
3. **Dependency Installation**: Use correct package manager
4. **Test Execution**: Run framework-appropriate tests
5. **Build Process**: Use framework build commands

The framework detector ensures Pantheon generates idiomatic code for each framework.