---
name: react-component
description: React component with TypeScript and hooks
framework: react
features: [component, typescript, hooks]
---

# React Component Template

## Component Template

```typescript
import React, { useState, useEffect } from 'react';
import styles from './{{ComponentName}}.module.css';

interface {{ComponentName}}Props {
  {{#each props}}
  {{name}}{{optional}}: {{type}};
  {{/each}}
  className?: string;
  children?: React.ReactNode;
}

export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = ({
  {{#each props}}
  {{name}},
  {{/each}}
  className,
  children
}) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Effects
  useEffect(() => {
    // Component initialization
    {{#if hasAsyncData}}
    loadData();
    {{/if}}
  }, []);
  
  {{#if hasAsyncData}}
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch data
      const response = await fetch('/api/{{endpoint}}');
      const data = await response.json();
      
      // Process data
      // TODO: Implement data handling
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  {{/if}}
  
  {{#if hasEventHandlers}}
  const handle{{EventName}} = (event: React.{{EventType}}Event) => {
    event.preventDefault();
    // Handle event
    {{onEventHandler}}?.(event);
  };
  {{/if}}
  
  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }
  
  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }
  
  return (
    <div className={`${styles.container} ${className || ''}`}>
      {{#if hasForm}}
      <form onSubmit={handleSubmit}>
        {{formContent}}
      </form>
      {{else}}
      {children}
      {{/if}}
    </div>
  );
};

{{ComponentName}}.displayName = '{{ComponentName}}';
```

## Styles Template

```css
.container {
  /* Component container styles */
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #666;
}

.error {
  padding: 1rem;
  color: #d32f2f;
  background-color: #ffebee;
  border-radius: 4px;
}
```

## Story Template (Storybook)

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { {{ComponentName}} } from './{{ComponentName}}';

const meta: Meta<typeof {{ComponentName}}> = {
  title: 'Components/{{ComponentName}}',
  component: {{ComponentName}},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    {{#each props}}
    {{name}}: {
      control: '{{controlType}}',
      description: '{{description}}'
    },
    {{/each}}
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    {{#each props}}
    {{name}}: {{defaultValue}},
    {{/each}}
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    // Override for loading state
  },
};

export const Error: Story = {
  args: {
    ...Default.args,
    // Override for error state
  },
};
```

## Variables

- `{{ComponentName}}`: PascalCase component name
- `{{props}}`: Array of prop definitions
- `{{hasAsyncData}}`: Whether component loads data
- `{{hasEventHandlers}}`: Whether component has interactions
- `{{hasForm}}`: Whether component contains a form