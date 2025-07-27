# /workspace Command - Monorepo Management

## ACTIVATION

When the user types `/workspace` or `/workspace [subcommand]`, provide monorepo management capabilities.

## Overview

The `/workspace` command helps manage monorepo packages and dependencies:
- List all packages in the workspace
- Add new packages to the workspace
- Link local packages together
- Run commands across packages
- View dependency graphs

## Subcommands

### /workspace list

Lists all packages in the current monorepo:

```
/workspace list

📦 Workspace Packages (pnpm monorepo)

Applications:
  🚀 @acme/web         apps/web         v0.1.0
  🚀 @acme/docs        apps/docs        v0.1.0

Libraries:
  📚 @acme/ui          packages/ui      v0.0.1
  📚 @acme/utils       packages/utils   v0.0.1
  📚 @acme/database    packages/db      v0.0.1

Configuration:
  ⚙️ @acme/tsconfig    packages/tsconfig  -
  ⚙️ @acme/eslint      packages/eslint    -

Total: 7 packages (2 apps, 3 libs, 2 configs)
```

### /workspace add

Add a new package to the workspace:

```
/workspace add

📦 Add Package to Workspace

Package name: auth-service
Package type:
1. 🚀 Application
2. 📚 Library  
3. 🔧 Tool
4. ⚙️ Configuration

Choice: 1

Application framework:
1. Next.js
2. Express API
3. Fastify API
4. NestJS
5. Other

Choice: 2

✅ Creating @acme/auth-service in apps/auth-service...
✅ Updated workspace configuration
✅ Installed dependencies
✅ Ready to develop!

Next steps:
- cd apps/auth-service
- pnpm dev
```

### /workspace link

Link packages together:

```
/workspace link

🔗 Link Workspace Packages

From package: @acme/web
To package: @acme/auth-service

Dependency type:
1. Regular dependency
2. Dev dependency
3. Peer dependency

Choice: 1

✅ Added @acme/auth-service to @acme/web dependencies
✅ Updating lock file...
✅ Link established!

Import in your code:
import { AuthClient } from '@acme/auth-service';
```

### /workspace run

Run commands across packages:

```
/workspace run

🏃 Run Command Across Packages

Command: build
Filter:
1. All packages
2. Apps only
3. Libraries only
4. Changed packages
5. Specific package

Choice: 4

🔍 Detecting changed packages...
Found 3 changed packages:
- @acme/ui
- @acme/web
- @acme/auth-service

Running: pnpm turbo build --filter=[ui,web,auth-service]

@acme/ui:build: ✅ Built in 2.3s
@acme/auth-service:build: ✅ Built in 4.1s  
@acme/web:build: ✅ Built in 5.7s

✅ All builds completed successfully!
Cache hit rate: 67%
```

### /workspace graph

Show dependency graph:

```
/workspace graph

📊 Dependency Graph

@acme/web
├── @acme/ui
├── @acme/utils
└── @acme/auth-service
    └── @acme/database
        └── @acme/utils

@acme/docs
└── @acme/ui

Legend:
→ Regular dependency
⇢ Dev dependency
⇀ Peer dependency
```

### /workspace info

Show detailed package information:

```
/workspace info @acme/ui

📦 Package: @acme/ui
📍 Location: packages/ui
🏷️ Version: 0.0.1
🏗️ Type: Library

Dependencies:
  → react: ^18.2.0
  → react-dom: ^18.2.0
  → clsx: ^2.0.0

Used by:
  ← @acme/web
  ← @acme/docs

Scripts:
  - build: tsup src/index.tsx --format esm,cjs --dts
  - dev: tsup src/index.tsx --watch
  - lint: eslint . --max-warnings 0
  - test: jest

Exports:
  - Button
  - Card
  - Input
  - Select
  [+12 more]
```

## Implementation

### Command Processing

```typescript
switch (subcommand) {
  case 'list':
    await listWorkspacePackages();
    break;
  case 'add':
    await addPackageInteractive();
    break;
  case 'link':
    await linkPackagesInteractive();
    break;
  case 'run':
    await runCommandInteractive();
    break;
  case 'graph':
    await showDependencyGraph();
    break;
  case 'info':
    await showPackageInfo(packageName);
    break;
  default:
    await showWorkspaceHelp();
}
```

### Integration with Libraries

Use the monorepo-detector and workspace-manager libraries:

```typescript
// Detect monorepo
const monorepoInfo = await detectMonorepo(process.cwd());
if (!monorepoInfo) {
  console.log('❌ Not in a monorepo workspace');
  return;
}

// Use workspace manager for operations
await createPackage({
  name: packageName,
  type: packageType,
  monorepoInfo,
  // ... other options
});
```

### Smart Defaults

Based on monorepo type, adjust behavior:

- **Nx**: Use nx commands and generators
- **Turborepo**: Use turbo for running commands
- **Lerna**: Use lerna commands
- **Rush**: Use rush commands
- **pnpm/yarn/npm**: Use workspace protocols

## Examples

### Complete Workflow

```bash
# Start in monorepo root
/workspace list          # See current packages

/workspace add          # Create new auth service
> auth-service
> Application  
> Express API

/workspace link         # Link to web app
> @acme/web
> @acme/auth-service

/workspace run build    # Build everything
> Changed packages

/workspace graph        # Visualize dependencies
```

### Quick Commands

For power users, support quick syntax:

```bash
/workspace add lib shared-types    # Create library quickly
/workspace link @acme/web @acme/shared-types    # Direct linking
/workspace run test --filter=@acme/web    # Direct command
```

## Error Handling

Handle common issues gracefully:

1. **Not in monorepo**: Suggest initializing one
2. **Package exists**: Offer to update or choose new name
3. **Circular dependency**: Warn and show cycle
4. **Build failures**: Show which packages failed
5. **Missing dependencies**: Offer to install

## Best Practices

1. **Scope packages** - Use consistent naming like @company/package
2. **Type packages** - Separate apps, libs, and configs
3. **Version together** - Use changesets or lerna for versioning
4. **Cache builds** - Leverage Turborepo or Nx caching
5. **Test affected** - Only test changed packages

This command makes monorepo management intuitive and efficient within BACO.