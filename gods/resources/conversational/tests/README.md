# Pantheon V2 Test Suite

This directory contains unit tests for the Pantheon V2 libraries.

## 🧪 Running Tests

```bash
# Install dependencies
cd .claude/tests
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📁 Test Structure

```
tests/
├── lib/                              # Library tests
│   ├── model-generator.test.js      # Model extraction & generation
│   ├── test-generator.test.js       # Test file generation
│   ├── framework-detector.test.js   # Framework detection
│   ├── session-state.test.js        # Session management
│   ├── git-integration.test.js      # Git operations
│   ├── docker-generator.test.js     # Docker config generation
│   ├── template-engine.test.js      # Template processing
│   ├── dependency-manager.test.js   # Package management
│   ├── test-detection.test.js       # Test runner detection
│   ├── interactive-flow.test.js     # UI flow patterns
│   └── string-utils.test.js         # String utilities
├── commands/                         # Command tests (future)
│   └── gods.test.js                # /gods command tests
├── lib-implementations/              # Mock implementations
└── package.json                      # Test configuration
```

## 🎯 Testing Philosophy

1. **Unit Tests**: Each library function should have focused unit tests
2. **Integration Tests**: Test how libraries work together
3. **Mock External Dependencies**: File system, network calls, etc.
4. **Test Edge Cases**: Empty inputs, errors, edge conditions
5. **Maintain Coverage**: Aim for >80% code coverage

## 📝 Writing New Tests

### Library Test Template
```javascript
/**
 * Tests for [Library Name]
 * 
 * These tests verify that [library]:
 * - [Key functionality 1]
 * - [Key functionality 2]
 */

const {
  functionName
} = require('../lib-implementations/library-name');

describe('Library Name', () => {
  describe('functionName', () => {
    test('describes what it should do', () => {
      // Arrange
      const input = 'test input';
      
      // Act
      const result = functionName(input);
      
      // Assert
      expect(result).toBe('expected output');
    });
  });
});
```

### Mock Patterns
```javascript
// Mock file system
const mockFS = {
  readFile: jest.fn(),
  writeFile: jest.fn(),
  exists: jest.fn()
};

// Mock external tools
const mockBash = jest.fn();

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

## 🔍 Coverage Goals

| Library | Target Coverage | Current |
|---------|----------------|---------|
| model-generator.md | 90% | - |
| test-generator.md | 85% | - |
| framework-detector.md | 90% | - |
| session-state.md | 95% | - |
| git-integration.md | 80% | - |
| docker-generator.md | 80% | - |
| template-engine.md | 85% | - |
| dependency-manager.md | 85% | - |
| test-detection.md | 90% | - |
| interactive-flow.md | 75% | - |
| string-utils.md | 95% | - |

## 🚀 CI/CD Integration

Future: GitHub Actions workflow
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd .claude/tests && npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
```

## 🐛 Debugging Tests

1. Use `test.only()` to run a single test
2. Add `console.log()` statements (removed before commit)
3. Use debugger with `node --inspect`
4. Check mock call history: `expect(mockFn).toHaveBeenCalledWith(...)`

## 📊 Test Reports

Coverage reports are generated in `/coverage` directory:
- `coverage/lcov-report/index.html` - HTML coverage report
- `coverage/coverage-final.json` - JSON coverage data

## 🤝 Contributing

When adding new library functions:
1. Write the test first (TDD)
2. Implement the function
3. Ensure tests pass
4. Check coverage hasn't decreased
5. Update this README if needed
