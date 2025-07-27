# Model Generator for Pantheon

**Purpose**: Automatically generates database models and TypeScript interfaces from feature specifications in pantheon.md files.

**Key Functions**:
- `parseFeatureText(text)` - Extracts entities and relationships from natural language
- `generateTypeScriptInterface(entity)` - Creates TypeScript interfaces
- `generateMongooseSchema(entity)` - Creates Mongoose schemas
- `generatePrismaModel(entity)` - Creates Prisma models
- `detectRelationships(entities)` - Identifies relationships between entities

**Usage**: Called by `/gods plan` and `/gods execute` to transform feature descriptions into working code.

## Overview

The model generator:
- Parses feature descriptions to extract entities and fields
- Generates TypeScript interfaces
- Creates database schemas (Mongoose, Prisma, TypeORM)
- Handles relationships between models
- Applies validation rules
- Generates CRUD operations specific to each model

## Feature Parsing Strategy

### 1. Entity Detection

When parsing features from pantheon.md, look for:
- Explicit entity mentions: "User", "Task", "Project"
- Field definitions: "title (string)", "status (enum: todo, done)"
- Relationships: "belongs to user", "has many tasks"
- Actions that imply entities: "Create tasks" implies Task entity

### 2. Field Type Mapping

```
Text patterns → Field types:
- "email" → string + email validation
- "password" → string + bcrypt hashing
- "date/time" → Date
- "number/count" → number
- "yes/no" → boolean
- "status (options)" → enum
```

### 3. Relationship Detection

```
Patterns → Relationships:
- "assigned to user" → belongsTo: User
- "has many tasks" → hasMany: Task[]
- "tags" → many-to-many
```

## Generated Output Examples

### TypeScript Interface
```typescript
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  userId: string;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}
```

### Mongoose Schema
```typescript
const taskSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: Date,
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });
```

### Prisma Model
```prisma
model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      Status   @default(TODO)
  priority    Priority @default(MEDIUM)
  dueDate     DateTime?
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Status {
  TODO
  IN_PROGRESS
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

## Integration with /gods

### During `/gods plan`:
1. Parse features to extract entities
2. Show detected models to user
3. Store in session for execution phase

### During `/gods execute`:
1. Generate TypeScript interfaces
2. Generate database schemas based on chosen ORM
3. Create model files in project
4. Customize CRUD templates with model fields

## Template Customization

When using templates like `rest-api-crud`:
1. Replace {{ModelName}} with actual model
2. Replace generic fields with model-specific fields
3. Add model-specific validations
4. Include relationship handling

This ensures generated code is specific to the user's models, not generic.