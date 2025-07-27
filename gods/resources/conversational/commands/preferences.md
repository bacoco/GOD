# /preferences - User Preferences Management

## ACTIVATION
When the user types `/preferences [subcommand]`, manage BACO preferences for the current session.

## Overview
The `/preferences` command allows users to view and modify their BACO preferences, which control default behaviors for git, GitHub, and development workflows.

## SUBCOMMANDS

### `/preferences` or `/preferences show`
Display current session preferences:

```
📋 Current BACO Preferences
═══════════════════════════

Git & Commits:
• Auto-commit: ON (default)
• Test before commit: YES
• Test mode: strict
• Commit style: conventional
• Branch strategy: main

GitHub:
• Default visibility: private
• Push strategy: direct
• Auto-create repo: YES
• Generate README: YES

Development:
• Framework detection: auto
• Dependency install: auto
• Live preview: YES

Session Info:
• Current project: my-app
• Commits created: 12
• Tests run: 24

To change: /preferences set [key] [value]
```

### `/preferences set [key] [value]`
Update a specific preference:

#### Examples:
```
/preferences set git.auto_commit false
✅ Updated: Auto-commit disabled for this session

/preferences set github.visibility public  
✅ Updated: GitHub repos will be public by default

/preferences set git.test_mode relaxed
✅ Updated: Tests will run in relaxed mode (warnings only)
```

#### Available Keys:
**Git Preferences:**
- `git.auto_commit` - true/false
- `git.test_mode` - strict/relaxed/skip
- `git.test_before_commit` - true/false
- `git.commit_style` - conventional/simple/detailed
- `git.branch_strategy` - main/feature/gitflow

**GitHub Preferences:**
- `github.visibility` - private/public
- `github.push_strategy` - direct/pr
- `github.create_repo_default` - true/false
- `github.auto_push` - true/false
- `github.generate_readme` - true/false

**Development Preferences:**
- `development.framework_detection` - auto/manual
- `development.dependency_install` - auto/manual/skip
- `development.live_preview` - true/false
- `development.error_handling` - interactive/strict/continue

### `/preferences reset`
Reset all preferences to defaults:

```
/preferences reset

⚠️ This will reset all preferences to BACO defaults:
- Auto-commit: ON
- Test mode: strict
- GitHub repos: private
- Direct push to main

Continue? (y/n): y

✅ All preferences reset to defaults
```

### `/preferences quick`
Quick preference presets for common workflows:

```
/preferences quick

Choose a workflow preset:
1. Solo Developer (default) - Direct push, relaxed tests
2. Team Project - Feature branches, strict tests, PRs
3. Rapid Prototype - Skip tests, simple commits
4. Enterprise - Full compliance, detailed commits

Choice (1-4): 2

✅ Applied Team Project preferences:
- Branch strategy: feature
- Push strategy: PR
- Test mode: strict
- Commit style: conventional
```

## INTEGRATION WITH OTHER COMMANDS

### With `/baco init`
Preferences affect project initialization:
```
Creating project with your preferences:
• Private repository (your default)
• Auto-commit after phases
• Strict test requirements
```

### With `/git commit`
Test mode preference is applied:
```
# If test_mode: strict
❌ Tests failed - cannot commit

# If test_mode: relaxed  
⚠️ Tests failed - committing with [WIP]
```

### With `/gh create`
Repository visibility preference is used:
```
Creating private repository (your preference)
To make public: /preferences set github.visibility public
```

## SMART DETECTION

The system can suggest preference changes based on context:

```
🔍 Detected: Multiple contributors in git history
💡 Suggestion: Switch to team workflow?
   This would enable:
   - Feature branches
   - PR-based workflow
   - Strict testing

Apply team preferences? (y/n):
```

## SESSION PERSISTENCE

Preferences are maintained during your BACO session:
- Changes apply immediately
- Preferences reset when starting new session
- Project-specific overrides are remembered

## EXAMPLES

### Switching to Rapid Development
```
/preferences set git.test_mode skip
/preferences set git.auto_commit true
/preferences set git.commit_style simple

✅ Configured for rapid development
⚠️ Warning: Skipping tests - use for prototypes only
```

### Configuring for Open Source
```
/preferences set github.visibility public
/preferences set git.test_mode strict
/preferences set github.push_strategy pr
/preferences set git.commit_style conventional

✅ Configured for open source development
```

### Checking Current Settings
```
/preferences show

Shows all current preferences with their values
Highlights any non-default settings
Shows session statistics
```

## BEST PRACTICES

1. **Start with defaults** - They work well for most cases
2. **Adjust as needed** - Change preferences when workflow requires
3. **Use quick presets** - For common scenarios
4. **Reset if confused** - `/preferences reset` returns to known state

## ERROR HANDLING

### Invalid Key
```
/preferences set git.invalid_key true

❌ Unknown preference key: git.invalid_key

Available git preferences:
- git.auto_commit
- git.test_mode
- git.test_before_commit
- git.commit_style
- git.branch_strategy
```

### Invalid Value
```
/preferences set git.test_mode invalid

❌ Invalid value for git.test_mode: "invalid"

Valid values: strict, relaxed, skip
```

Remember: Preferences enhance your BACO workflow by reducing repetitive choices while maintaining full control.