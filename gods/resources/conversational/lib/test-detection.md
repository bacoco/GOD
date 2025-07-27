# Test Detection Library

## Overview
This library provides patterns for automatically detecting and running tests before commits in BACO projects. Tests run by default unless explicitly disabled.

## Core Principle
**Tests run automatically before every commit** to ensure code quality. This behavior can be controlled via:
- `/git test-mode [strict/relaxed/skip]` - Session-level control
- `/git auto-commit off` - Disable auto-commits entirely

## Project Type Detection

### Node.js / JavaScript Projects
**Detection Files**:
- `package.json` (primary)
- `yarn.lock` → Use yarn
- `pnpm-lock.yaml` → Use pnpm
- `bun.lockb` → Use bun

**Test Command Detection**:
```bash
# Check package.json for test script
cat package.json | grep '"test":'

# Common test scripts:
- "test": "jest"
- "test": "mocha"
- "test": "vitest"
- "test": "react-scripts test"
- "test": "vue-cli-service test"
```

**Default Commands** (in order):
1. If `"test"` script exists → `npm test`
2. If yarn.lock exists → `yarn test`
3. If pnpm-lock.yaml → `pnpm test`
4. If bun.lockb → `bun test`
5. No test script → Skip with warning

**Additional Checks**:
- `npm run lint` (if exists)
- `npm run typecheck` or `npm run type-check`
- `npm run build` (for libraries)

### Python Projects
**Detection Files**:
- `requirements.txt`
- `pyproject.toml`
- `setup.py`
- `Pipfile`

**Test Framework Detection**:
```bash
# Check for pytest
grep -q "pytest" requirements.txt pyproject.toml 2>/dev/null

# Check for test directories
ls -d tests/ test/ 2>/dev/null

# Check for test files
find . -name "test_*.py" -o -name "*_test.py" | head -1
```

**Default Commands** (in order):
1. If pytest installed → `pytest`
2. If tox.ini exists → `tox`
3. If tests/ exists → `python -m pytest tests/`
4. If unittest files → `python -m unittest discover`
5. No tests found → Skip with warning

**Additional Checks**:
- `flake8` or `ruff` (if in requirements)
- `mypy` (if configured)
- `black --check` (if installed)

### Rust Projects
**Detection**: `Cargo.toml`

**Test Command**: Always `cargo test`

**Additional Checks**:
- `cargo fmt -- --check`
- `cargo clippy -- -D warnings`
- `cargo build` (ensure compilation)

### Go Projects
**Detection**: `go.mod`

**Test Command**: Always `go test ./...`

**Additional Checks**:
- `go fmt ./...`
- `go vet ./...`
- `golangci-lint run` (if .golangci.yml exists)

### Ruby Projects
**Detection Files**:
- `Gemfile`
- `.ruby-version`

**Test Framework Detection**:
```bash
# Check for RSpec
grep -q "rspec" Gemfile

# Check for test directories
ls -d spec/ test/ 2>/dev/null
```

**Default Commands**:
1. If spec/ exists → `bundle exec rspec`
2. If test/ exists → `bundle exec rake test`
3. If Rakefile has test → `rake test`

### Java Projects
**Detection Files**:
- `pom.xml` → Maven project
- `build.gradle` or `build.gradle.kts` → Gradle

**Test Commands**:
- Maven: `mvn test`
- Gradle: `./gradlew test` or `gradle test`

### .NET Projects
**Detection Files**:
- `*.csproj`
- `*.sln`

**Test Command**: `dotnet test`

## Test Execution Flow

### 1. Detect Project Type
```
Check for primary detection files:
- package.json → Node.js
- requirements.txt → Python
- Cargo.toml → Rust
- go.mod → Go
- Gemfile → Ruby
- pom.xml → Java/Maven
```

### 2. Find Test Command
```
Based on project type:
1. Look for configured test command
2. Check for test directories/files
3. Use default for project type
4. Return null if no tests found
```

### 3. Run Tests
```
Execute test command:
1. Show: "🧪 Running tests..."
2. Run detected command
3. Capture exit code and output
4. Parse results
```

### 4. Handle Results
```
Based on test mode setting:

STRICT MODE (default):
- Pass → Continue to commit
- Fail → Block commit, show errors
- No tests → Warning but continue

RELAXED MODE:
- Pass → Continue normally
- Fail → Warning, commit with [WIP] prefix
- No tests → Continue normally

SKIP MODE:
- Don't run tests at all
- Add note to commit message
```

## Test Output Parsing

### Success Indicators
- Exit code 0
- Output contains: "passed", "success", "✓"
- No "failed", "error", "✗" in output

### Failure Indicators
- Exit code != 0
- Output contains: "failed", "FAILED", "error", "ERROR"
- Specific patterns by framework:
  - Jest: "failed" in summary
  - Pytest: "failed" in summary
  - Go: "FAIL" in output
  - Rust: "test result: FAILED"

### Coverage Detection
Look for coverage reports:
- Jest: "All files | X |"
- Pytest: "TOTAL X%"
- Go: "coverage: X%"

Include coverage in commit message if available.

## Intelligent Test Mode Selection

### Auto-Detection Rules
1. **Production branch** → Always strict
2. **New project** → Relaxed (encourage progress)
3. **Has CI/CD** → Strict (CI will catch issues)
4. **Prototype/POC** → Skip (rapid iteration)
5. **Team project** → Strict (protect others)

### User Preferences
Store in session:
```
test_mode: strict|relaxed|skip
auto_detect: true|false
custom_commands: {
  "test": "npm run test:custom",
  "lint": "npm run lint:all"
}
```

## Error Messages

### No Tests Found
```
⚠️ No tests detected in this [language] project.

Consider adding tests to ensure code quality.
Continuing with commit...

To skip this warning: /git test-mode skip
```

### Tests Failed (Strict Mode)
```
❌ Tests failed! Cannot commit.

Failed tests:
- test/user.test.js
- test/auth.test.js

Options:
1. Fix the failing tests
2. Switch to relaxed mode: /git test-mode relaxed
3. Skip tests temporarily: /git test-mode skip

Run tests manually: npm test
```

### Tests Failed (Relaxed Mode)
```
⚠️ Tests failed but continuing with commit.

Your commit will be prefixed with [WIP] to indicate work in progress.

Failed tests: 3
To see details: npm test
```

## Performance Optimization

### Caching Test Commands
Cache detected commands per project:
```
project_test_cache = {
  "/path/to/project": {
    "type": "node",
    "test_cmd": "npm test",
    "has_tests": true,
    "last_checked": timestamp
  }
}
```

### Parallel Test Execution
For projects with multiple test types:
```
Run in parallel:
- Unit tests
- Lint checks
- Type checks
- Build verification

Report all results together
```

## Integration Examples

### With /git commit
```
User: /git commit

BACO: 🧪 Running tests...
      [Detects Node.js project]
      [Runs: npm test]
      
      ✅ All tests passed (24 tests)
      Coverage: 87%
      
      Creating commit...
      ✅ Committed: "feat: add user authentication"
```

### With /baco execute
```
After each phase:
1. Run tests automatically
2. Only commit if tests pass
3. Include test status in commit message
4. Track test results across phases
```

### With /gh push
```
Before push:
1. Run full test suite
2. Ensure all tests pass
3. Show test summary
4. Only push if safe
```

## Best Practices

1. **Always show what's running** - Users should see the test command
2. **Cache results wisely** - Reuse detection, not test results
3. **Fail fast** - Stop on first critical error
4. **Provide escape hatches** - Let users skip when needed
5. **Track patterns** - Learn from user's test preferences

Remember: The goal is to maintain code quality without blocking productivity. Tests should help, not hinder.