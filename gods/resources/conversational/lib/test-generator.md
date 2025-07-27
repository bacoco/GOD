# Test Generator for Pantheon

**Purpose**: Automatically generates comprehensive test files alongside code implementation, ensuring high code quality and coverage.

**Key Functions**:
- `generateModelTests(model)` - Creates tests for data models
- `generateFeatureTests(feature, template)` - Creates feature-specific tests
- `generateAPITests(endpoint)` - Creates API endpoint tests
- `generateComponentTests(component)` - Creates React/Vue component tests
- `detectTestFramework(projectPath)` - Identifies the testing framework in use

**Usage**: Called by `/gods execute` when `workflow.generate_tests` is enabled to create tests for all generated code.

## Overview

The test generator:
- Analyzes generated code structure
- Creates appropriate test files
- Uses testing best practices
- Ensures high coverage
- Supports multiple frameworks

## Test Generation Strategy

### 1. Code Analysis
- Identify testable units (components, functions, endpoints)
- Determine test types needed
- Extract test scenarios from code
- Generate comprehensive test cases

### 2. Test Types

#### React/Next.js Components
```typescript
// Generated tests include:
- Render tests
- Props validation
- User interactions
- State management
- Accessibility checks
- Error boundaries
```

#### API Endpoints
```typescript
// Generated tests include:
- Success responses
- Error handling
- Input validation
- Authentication
- Rate limiting
- Database operations
```

#### Utility Functions
```typescript
// Generated tests include:
- Happy path tests
- Edge cases
- Error conditions
- Type checking
- Performance tests
```

## Integration with /gods execute

When generating code:
1. Create implementation file
2. Immediately generate test file
3. Place in __tests__ directory
4. Include all relevant test cases

## Test Templates

### React Component Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { {{ComponentName}} } from '../{{ComponentName}}';

describe('{{ComponentName}}', () => {
  it('renders without crashing', () => {
    render(<{{ComponentName}} />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const mockHandler = jest.fn();
    render(<{{ComponentName}} onAction={mockHandler} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  // Additional tests based on component analysis
});
```

### API Endpoint Test
```typescript
import request from 'supertest';
import { app } from '../app';

describe('{{endpoint}}', () => {
  it('returns successful response', async () => {
    const response = await request(app)
      .get('{{endpoint}}')
      .expect(200);
      
    expect(response.body).toHaveProperty('success', true);
  });

  it('handles errors gracefully', async () => {
    const response = await request(app)
      .get('{{endpoint}}/invalid')
      .expect(404);
      
    expect(response.body).toHaveProperty('error');
  });

  // Additional tests based on endpoint functionality
});
```

## Coverage Goals

- Minimum 80% code coverage
- All critical paths tested
- Error scenarios covered
- Edge cases handled
- Integration points verified

## Framework Support

- **React**: React Testing Library + Jest
- **Vue**: Vue Test Utils + Jest
- **Express**: Supertest + Jest
- **Next.js**: Built-in testing support
- **NestJS**: Built-in testing utilities

The test generator ensures quality is built into every project from the start.