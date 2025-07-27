# /update-deps Command - Dependency Update Management

## ACTIVATION

When the user types `/update-deps` in a project directory, manage dependency updates safely.

## Overview

The `/update-deps` command helps:
- Check for available updates
- Identify breaking changes
- Update dependencies safely
- Run tests after updates
- Rollback if needed

## Command Options

### Basic Usage
```
/update-deps              # Interactive update process
/update-deps check       # Only check for updates
/update-deps security    # Security updates only
/update-deps major       # Include major version updates
/update-deps [package]   # Update specific package
```

## Execution Flow

### 1. Dependency Analysis
```
/update-deps

🔍 Analyzing dependencies...

Project: task-manager-api
Package Manager: npm
Dependencies: 23 production, 15 development

Checking for updates...
```

### 2. Update Report
```
📦 Available Updates

SECURITY UPDATES (High Priority):
  🚨 lodash: 4.17.19 → 4.17.21 (security fix)

PATCH UPDATES (Bug Fixes):
  ✅ express: 4.18.1 → 4.18.2
  ✅ mongoose: 6.7.2 → 6.7.5
  ✅ jest: 29.3.0 → 29.3.1

MINOR UPDATES (New Features):
  📘 typescript: 4.8.4 → 4.9.4
  📘 @types/node: 18.11.9 → 18.11.18
  📘 eslint: 8.28.0 → 8.31.0

MAJOR UPDATES (Breaking Changes):
  ⚠️ mongoose: 6.7.5 → 7.0.0
  ⚠️ jest: 29.3.1 → 30.0.0

Update Strategy:
1. 🚨 Security updates only (1)
2. 🛡️ Security + Patch updates (4)
3. 📦 All non-breaking updates (7)
4. ⚡ Everything including major (9)
5. 🎯 Select specific updates
6. 📋 View detailed changes

Choice (1-6): 3
```

### 3. Pre-Update Checks
```
🔍 Pre-update checks...

✅ Git status: Clean working directory
✅ Tests passing: 45/45
✅ Build successful
✅ Backup created: .baco-backups/deps-backup-1634567890

Ready to update 7 packages.
```

### 4. Update Process
```
📦 Updating dependencies...

Security Updates:
  ✅ lodash@4.17.21

Patch Updates:
  ✅ express@4.18.2
  ✅ mongoose@6.7.5
  ✅ jest@29.3.1

Minor Updates:
  ✅ typescript@4.9.4
  ✅ @types/node@18.11.18
  ✅ eslint@8.31.0

📥 Installing updated packages...
✅ Installation complete
```

### 5. Post-Update Validation
```
🧪 Running post-update checks...

Type checking:
  ✅ No TypeScript errors

Linting:
  ✅ No new ESLint warnings

Tests:
  ✅ All tests passing (45/45)

Build:
  ✅ Build successful

🎉 Updates completed successfully!
```

## Breaking Change Detection

### Major Version Analysis
```
⚠️ Breaking Changes Detected

mongoose 6.x → 7.x:
  • Removed callback support (now Promise-only)
  • Changed connection string format
  • Dropped Node.js 12 support
  
Migration assistance available:
1. View detailed migration guide
2. Auto-migrate code (experimental)
3. Update manually
4. Skip this update

Choice (1-4): 1
```

### Migration Guide Display
```
📚 Mongoose 6.x → 7.x Migration Guide

1. Connection Changes:
   ```javascript
   // Before (6.x)
   mongoose.connect(uri, { useNewUrlParser: true }, callback);
   
   // After (7.x)
   await mongoose.connect(uri);
   ```

2. Callback Removal:
   ```javascript
   // Before (6.x)
   User.findOne({ email }, (err, user) => {
     if (err) return handleError(err);
     // use user
   });
   
   // After (7.x)
   try {
     const user = await User.findOne({ email });
     // use user
   } catch (err) {
     handleError(err);
   }
   ```

Would you like to:
1. Proceed with update and migrate manually
2. Try automatic migration
3. Skip this update

Choice (1-3):
```

## Security Focus Mode

### Security-Only Updates
```
/update-deps security

🔒 Security Update Check

HIGH SEVERITY:
  🚨 package-a: Remote Code Execution (CVE-2023-12345)
     Current: 1.2.3 → Fixed: 1.2.4

MEDIUM SEVERITY:
  ⚠️ package-b: XSS Vulnerability (CVE-2023-23456)
     Current: 2.0.0 → Fixed: 2.0.1

LOW SEVERITY:
  📋 package-c: Information Disclosure (CVE-2023-34567)
     Current: 3.1.0 → Fixed: 3.1.1

Update all security fixes? (y/n): y
```

## Package-Specific Updates

### Single Package Update
```
/update-deps typescript

📦 TypeScript Update

Current: 4.8.4
Latest: 4.9.4
Major Available: 5.0.0

Changes in 4.9.4:
  • Improved type inference
  • New satisfies operator
  • Performance improvements
  • Bug fixes

Update to:
1. Latest minor (4.9.4) - Recommended
2. Latest major (5.0.0) - Breaking changes
3. Specific version
4. Cancel

Choice (1-4): 1
```

## Lockfile Management

### Lockfile Conflicts
```
⚠️ Lockfile conflict detected

Your package-lock.json is out of sync with package.json

Options:
1. Regenerate lockfile (recommended)
2. Update lockfile only
3. Manual resolution

Choice (1-3): 1

🔄 Regenerating package-lock.json...
✅ Lockfile updated successfully
```

## Rollback Capabilities

### Update Failure Handling
```
❌ Update failed!

Error: Tests failing after update
Failed tests: 3

auth.test.js › login › should return JWT token
auth.test.js › register › should hash password
user.test.js › update › should validate email

Options:
1. 🔄 Rollback all updates
2. 🔍 Debug test failures
3. ⏪ Rollback specific packages
4. 📝 Keep changes and fix manually

Choice (1-4): 1

Rolling back to backup...
✅ Successfully restored dependencies
```

## Advanced Features

### Dependency Audit
```
/update-deps audit

🔍 Dependency Audit Report

Outdated Packages: 12
Security Vulnerabilities: 2 high, 3 moderate
Unused Dependencies: 3
Missing Dependencies: 1

Recommendations:
1. Remove unused: uuid, moment, lodash
2. Add missing: @types/express (TypeScript)
3. Update security issues immediately
4. Consider replacing moment with date-fns

Fix issues? (y/n):
```

### Version Pinning Strategy
```
/update-deps configure

📌 Dependency Version Strategy

Current: Mixed (^, ~, exact)

Choose strategy:
1. Exact versions (1.2.3)
2. Patch updates only (~1.2.3)
3. Minor updates (^1.2.3)
4. Custom per dependency

Choice (1-4): 2

✅ Updated package.json with tilde ranges
```

## Integration with CI/CD

### Update PR Creation
```
/update-deps --create-pr

📦 Creating dependency update PR...

Branch: deps/update-2023-10-15
Commits: 1

Changes:
  • Updated 7 dependencies
  • No breaking changes
  • All tests passing

PR Description:
## Dependency Updates

### Security
- lodash: 4.17.19 → 4.17.21

### Patches
- express: 4.18.1 → 4.18.2
- mongoose: 6.7.2 → 6.7.5

✅ PR created: #123
```

## Best Practices

1. **Test Before and After**: Always run tests
2. **Update Gradually**: Start with security and patches
3. **Read Changelogs**: Check breaking changes
4. **Use Lockfiles**: Ensure reproducible installs
5. **Automate**: Set up regular update checks

## Common Workflows

### Weekly Maintenance
```bash
/update-deps check         # Check what's available
/update-deps security      # Apply security fixes
/update-deps              # Interactive update
```

### Major Framework Update
```bash
/update-deps react        # Check React specifically
# Review migration guide
# Update with assistance
```

### Pre-Production Check
```bash
/update-deps audit        # Full audit
/update-deps security     # Security only
# Fix any issues before deploy
```

Remember: Safe dependency management prevents security issues and keeps projects maintainable!