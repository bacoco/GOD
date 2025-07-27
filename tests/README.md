# Pantheon Tests

This directory contains all test suites for the Pantheon system.

## Test Files

### Core Tests
- `test-md-system.js` - Tests for the MD-based dynamic agent system
- `test-conversational-system.js` - Unit tests for conversational components (43 tests)
- `test-conversational-flow.js` - Integration test demonstrating actual conversational flow

## Running Tests

```bash
# Run all tests
npm test

# Run specific test
node tests/test-conversational-system.js

# Run conversational flow demo
node tests/test-conversational-flow.js

# Run with debug output
DEBUG=true node tests/test-conversational-flow.js
```

## Test Coverage

- ✅ MD-based agent system (28 tests)
- ✅ Conversational infrastructure (43 tests)
- ✅ Integration flows
- ✅ Error recovery
- ✅ Multi-god orchestration

## Notes

- Most conversational tests use mock data for predictable testing
- Integration tests demonstrate the actual flow but use simulated responses
- To test with real AI responses, set up proper API credentials